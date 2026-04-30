-- =============================================================
-- SCRIPT SQL CONSOLIDADO - EDUFLOW SYSTEM (v3.2 - PRODUCTION SAFE)
-- =============================================================
-- Compatível com bancos criados em qualquer versão anterior.
--
-- Ordem de execução segura:
--   1. CREATE TABLE IF NOT EXISTS  (estrutura base)
--   2. ALTER TABLE ADD COLUMN IF NOT EXISTS  (← TODAS as colunas novas)
--   3. UPDATE para corrigir dados inconsistentes  (só depois das colunas existirem)
--   4. ADD CONSTRAINT via DO $$ (só depois dos dados estarem limpos)
--   5. RLS + Políticas
--   6. Índices
--   7. Funções / Triggers
--   8. Realtime
--   9. Storage
--
-- Changelog v3.2:
--   Corrige ERROR 42703 "column status does not exist" (e qualquer coluna
--   similar) garantindo que ADD COLUMN IF NOT EXISTS sempre precede qualquer
--   UPDATE/SELECT que referencie essa coluna.
-- =============================================================


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================
-- 1. TIPOS
-- =============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('aluno', 'docente', 'gestor');
    END IF;
END $$;


-- =============================================================
-- 2. TABELAS (estrutura mínima — colunas novas adicionadas na seção 3)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name       TEXT,
  role            user_role DEFAULT 'aluno',
  student_card_id TEXT UNIQUE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;


CREATE TABLE IF NOT EXISTS public.classes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  period     TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


CREATE TABLE IF NOT EXISTS public.enrollments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id    UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(student_id, class_id)
);


CREATE TABLE IF NOT EXISTS public.materials (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id      UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  content_url   TEXT,
  material_type TEXT DEFAULT 'document',
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


CREATE TABLE IF NOT EXISTS public.grades (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id    UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  grade_value DECIMAL(4,2),
  feedback    TEXT,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


CREATE TABLE IF NOT EXISTS public.attendance (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id   UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  date       DATE DEFAULT CURRENT_DATE,
  is_present BOOLEAN DEFAULT true
);


CREATE TABLE IF NOT EXISTS public.financial_records (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_url TEXT NOT NULL,
  amount      DECIMAL(10,2) DEFAULT 0.00,
  due_date    DATE NOT NULL,
  is_paid     BOOLEAN DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);


CREATE TABLE IF NOT EXISTS public.announcements (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  category   TEXT DEFAULT 'geral',
  priority   TEXT DEFAULT 'media',
  author_id  UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


CREATE TABLE IF NOT EXISTS public.audit_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id  UUID NOT NULL,
  action     TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID REFERENCES public.profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  old_data   JSONB,
  new_data   JSONB
);


-- =============================================================
-- 3. ALTER TABLE — ADICIONA TODAS AS COLUNAS QUE PODEM ESTAR FALTANDO
--    ⚠️  Esta seção DEVE ficar antes de qualquer UPDATE ou constraint
--    que referencie essas colunas.
-- =============================================================

-- attendance: colunas que podem não existir em versões antigas
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS status                    TEXT DEFAULT 'presente',
  ADD COLUMN IF NOT EXISTS justification_description TEXT,
  ADD COLUMN IF NOT EXISTS justification_file_url    TEXT,
  ADD COLUMN IF NOT EXISTS updated_by                UUID REFERENCES public.profiles(id);

COMMENT ON COLUMN public.attendance.is_present IS
  'SOFT DEPRECATED: use a coluna status. Mantido por compatibilidade.';

-- grades: audit trail
ALTER TABLE public.grades
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- financial_records: audit trail
ALTER TABLE public.financial_records
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- announcements: target_role (causa do ERROR 42703 em versões anteriores)
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS target_role TEXT NOT NULL DEFAULT 'todos';

COMMENT ON COLUMN public.announcements.target_role IS
  'Público-alvo: aluno | docente | gestor | todos';


-- =============================================================
-- 4. CORRIGE DADOS INCONSISTENTES
--    (só aqui, após garantir que as colunas existem)
-- =============================================================

-- Sincroniza status com is_present para linhas antigas
-- (is_present=false com status='presente' é uma contradição)
UPDATE public.attendance
SET status = 'ausente'
WHERE is_present = false AND status = 'presente';

-- Remove notas duplicadas (mantém a de maior grade_value por aluno+turma)
DELETE FROM public.grades
WHERE id NOT IN (
  SELECT DISTINCT ON (student_id, class_id) id
  FROM public.grades
  ORDER BY student_id, class_id, grade_value DESC NULLS LAST
);


-- =============================================================
-- 5. CONSTRAINTS (só após dados limpos)
-- =============================================================

-- CHECK: target_role só aceita valores válidos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'announcements_target_role_valid'
  ) THEN
    ALTER TABLE public.announcements
      ADD CONSTRAINT announcements_target_role_valid
      CHECK (target_role IN ('aluno', 'docente', 'gestor', 'todos'));
  END IF;
END $$;

-- UNIQUE: uma nota por aluno por turma
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'grades_student_class_unique'
  ) THEN
    ALTER TABLE public.grades
      ADD CONSTRAINT grades_student_class_unique UNIQUE (student_id, class_id);
  END IF;
END $$;

-- CHECK: is_present e status não podem se contradizer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'attendance_status_consistent'
  ) THEN
    ALTER TABLE public.attendance
      ADD CONSTRAINT attendance_status_consistent CHECK (
        (is_present = true  AND status = 'presente') OR
        (is_present = false AND status IN ('ausente', 'justificado'))
      );
  END IF;
END $$;


-- =============================================================
-- 6. RLS — HABILITAR EM TODAS AS TABELAS
-- =============================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log         ENABLE ROW LEVEL SECURITY;


-- =============================================================
-- 7. POLÍTICAS RLS
-- =============================================================

-- PROFILES
DROP POLICY IF EXISTS "Perfis visíveis por todos" ON public.profiles;
CREATE POLICY "Perfis visíveis por todos"
  ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Usuário atualiza próprio perfil" ON public.profiles;
CREATE POLICY "Usuário atualiza próprio perfil"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);


-- CLASSES
DROP POLICY IF EXISTS "Turmas visíveis por todos" ON public.classes;
CREATE POLICY "Turmas visíveis por todos"
  ON public.classes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Professores e Gestores gerenciam turmas" ON public.classes;
CREATE POLICY "Professores e Gestores gerenciam turmas"
  ON public.classes FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
  );


-- ENROLLMENTS
DROP POLICY IF EXISTS "Alunos veem próprias matrículas" ON public.enrollments;
CREATE POLICY "Alunos veem próprias matrículas"
  ON public.enrollments FOR SELECT TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Gestores e Docentes gerenciam matrículas" ON public.enrollments;
CREATE POLICY "Gestores e Docentes gerenciam matrículas"
  ON public.enrollments FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
  );


-- GRADES
DROP POLICY IF EXISTS "Alunos veem próprias notas" ON public.grades;
CREATE POLICY "Alunos veem próprias notas"
  ON public.grades FOR SELECT TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Docentes e Gestores gerenciam notas" ON public.grades;
CREATE POLICY "Docentes e Gestores gerenciam notas"
  ON public.grades FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
  );


-- ATTENDANCE
DROP POLICY IF EXISTS "Alunos veem própria frequência" ON public.attendance;
CREATE POLICY "Alunos veem própria frequência"
  ON public.attendance FOR SELECT TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Docentes e Gestores gerenciam frequência" ON public.attendance;
CREATE POLICY "Docentes e Gestores gerenciam frequência"
  ON public.attendance FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
  );


-- MATERIALS
DROP POLICY IF EXISTS "Materiais visíveis por todos autenticados" ON public.materials;
CREATE POLICY "Materiais visíveis por todos autenticados"
  ON public.materials FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Docentes e Gestores gerenciam materiais" ON public.materials;
CREATE POLICY "Docentes e Gestores gerenciam materiais"
  ON public.materials FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
  );


-- FINANCIAL
DROP POLICY IF EXISTS "Alunos veem seu financeiro" ON public.financial_records;
CREATE POLICY "Alunos veem seu financeiro"
  ON public.financial_records FOR SELECT TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Gestores gerenciam financeiro" ON public.financial_records;
CREATE POLICY "Gestores gerenciam financeiro"
  ON public.financial_records FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
  );


-- CHAT
DROP POLICY IF EXISTS "Usuários veem suas mensagens" ON public.chat_messages;
CREATE POLICY "Usuários veem suas mensagens"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Usuários enviam mensagens" ON public.chat_messages;
CREATE POLICY "Usuários enviam mensagens"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);


-- ANNOUNCEMENTS
-- [FIX-6] SELECT filtra target_role no banco (era USING true — exposia tudo)
DROP POLICY IF EXISTS "Todos veem avisos" ON public.announcements;
DROP POLICY IF EXISTS "Usuários veem avisos do seu papel" ON public.announcements;
CREATE POLICY "Usuários veem avisos do seu papel"
  ON public.announcements FOR SELECT TO authenticated
  USING (
    target_role = 'todos'
    OR target_role = (SELECT role::text FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Gestores e Docentes criam avisos" ON public.announcements;
CREATE POLICY "Gestores e Docentes criam avisos"
  ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('gestor', 'docente'))
  );


-- AUDIT LOG
DROP POLICY IF EXISTS "Gestores veem audit log" ON public.audit_log;
CREATE POLICY "Gestores veem audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
  );


-- =============================================================
-- 8. ÍNDICES DE PERFORMANCE
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_attendance_student_class_date
  ON public.attendance(student_id, class_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender
  ON public.chat_messages(sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver
  ON public.chat_messages(receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_grades_student
  ON public.grades(student_id);

CREATE INDEX IF NOT EXISTS idx_financial_records_student
  ON public.financial_records(student_id, due_date DESC);

CREATE INDEX IF NOT EXISTS idx_materials_class
  ON public.materials(class_id);

CREATE INDEX IF NOT EXISTS idx_announcements_target_role
  ON public.announcements(target_role);

CREATE INDEX IF NOT EXISTS idx_audit_log_record
  ON public.audit_log(table_name, record_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor
  ON public.audit_log(changed_by, changed_at DESC);


-- =============================================================
-- 9. AUTOMAÇÃO DE PERFIL
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role;
BEGIN
  BEGIN
    v_role := COALESCE(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'aluno'::public.user_role
    );
  EXCEPTION WHEN OTHERS THEN
    v_role := 'aluno'::public.user_role;
  END;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    v_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user failed for %: % %', new.id, SQLERRM, SQLSTATE;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================
-- 10. REALTIME
-- =============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_messages'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'announcements'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles; END IF;
END $$;


-- =============================================================
-- 11. STORAGE — BUCKETS E POLÍTICAS
-- =============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', false)
ON CONFLICT (id) DO NOTHING;


-- materials bucket
DROP POLICY IF EXISTS "Docentes fazem upload de materiais" ON storage.objects;
CREATE POLICY "Docentes fazem upload de materiais"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'materials' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
  );

DROP POLICY IF EXISTS "Todos autenticados veem materiais" ON storage.objects;
CREATE POLICY "Todos autenticados veem materiais"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'materials');

DROP POLICY IF EXISTS "Docentes deletam materiais" ON storage.objects;
CREATE POLICY "Docentes deletam materiais"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'materials' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
  );


-- student-documents bucket
DROP POLICY IF EXISTS "Alunos fazem upload de seus docs" ON storage.objects;
CREATE POLICY "Alunos fazem upload de seus docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'student-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Alunos veem seus docs" ON storage.objects;
CREATE POLICY "Alunos veem seus docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'student-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Gestores acessam todos docs no storage" ON storage.objects;
DROP POLICY IF EXISTS "Gestores veem todos docs no storage"    ON storage.objects;
CREATE POLICY "Gestores veem todos docs no storage"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'student-documents' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
  );
