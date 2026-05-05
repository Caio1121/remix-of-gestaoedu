-- =============================================================
-- SCRIPT SQL CONSOLIDADO - EDUFLOW SYSTEM (V5 - PRODUCTION SAFE)
-- Nomes de colunas sem underscores (padronização V5)
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
-- 2. DROP TABLES (ordem inversa de dependência)
-- =============================================================
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.financialrecords CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.grades CASCADE;
DROP TABLE IF EXISTS public.materials CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =============================================================
-- 3. TABELAS (nomes V5 sem underscores nas colunas)
-- =============================================================
CREATE TABLE public.profiles (
    id              UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    fullname        TEXT,
    role            user_role DEFAULT 'aluno',
    studentcardid   TEXT UNIQUE,
    cpf             TEXT,
    createdat       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.classes (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name        TEXT NOT NULL,
    period      TEXT NOT NULL,
    subject     TEXT,
    schedule    TEXT,
    room        TEXT,
    teacherid   UUID REFERENCES public.profiles(id),
    createdat   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.enrollments (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    studentid   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    classid     UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    enrolledat  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(studentid, classid)
);

CREATE TABLE public.materials (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    classid         UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    contenturl      TEXT,
    materialtype    TEXT DEFAULT 'document',
    createdat       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.grades (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    studentid   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    classid     UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    gradevalue  DECIMAL(4,2),
    av1         DECIMAL(4,2),
    av2         DECIMAL(4,2),
    av3         DECIMAL(4,2),
    feedback    TEXT,
    updatedat   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updatedby   UUID REFERENCES public.profiles(id),
    UNIQUE(studentid, classid)
);

CREATE TABLE public.attendance (
    id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    studentid                   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    classid                     UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    date                        DATE DEFAULT CURRENT_DATE,
    ispresent                   BOOLEAN DEFAULT true,
    status                      TEXT DEFAULT 'presente',
    justificationdescription    TEXT,
    justificationfileurl        TEXT,
    updatedby                   UUID REFERENCES public.profiles(id)
);

CREATE TABLE public.financialrecords (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    studentid   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoiceurl  TEXT NOT NULL,
    amount      DECIMAL(10,2) DEFAULT 0.00,
    duedate     DATE NOT NULL,
    ispaid      BOOLEAN DEFAULT false,
    createdat   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updatedat   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updatedby   UUID REFERENCES public.profiles(id)
);

CREATE TABLE public.announcements (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    category    TEXT DEFAULT 'geral',
    priority    TEXT DEFAULT 'media',
    targetrole  TEXT NOT NULL DEFAULT 'todos',
    authorid    UUID REFERENCES public.profiles(id),
    createdat   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.chat_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    senderid    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiverid  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    createdat   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tablename   TEXT NOT NULL,
    recordid    UUID NOT NULL,
    action      TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    changedby   UUID REFERENCES public.profiles(id),
    changedat   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    olddata     JSONB,
    newdata     JSONB
);

-- =============================================================
-- 4. CONSTRAINTS
-- =============================================================
ALTER TABLE public.grades
    ADD CONSTRAINT grades_av1_range CHECK (av1 IS NULL OR (av1 >= 0 AND av1 <= 10)),
    ADD CONSTRAINT grades_av2_range CHECK (av2 IS NULL OR (av2 >= 0 AND av2 <= 10)),
    ADD CONSTRAINT grades_av3_range CHECK (av3 IS NULL OR (av3 >= 0 AND av3 <= 10)),
    ADD CONSTRAINT grades_value_range CHECK (gradevalue IS NULL OR (gradevalue >= 0 AND gradevalue <= 10));

ALTER TABLE public.announcements
    ADD CONSTRAINT announcements_targetrole_valid
    CHECK (targetrole IN ('aluno', 'docente', 'gestor', 'todos'));

ALTER TABLE public.attendance
    ADD CONSTRAINT attendance_status_consistent
    CHECK (
        (ispresent = true AND status = 'presente') OR
        (ispresent = false AND status IN ('ausente', 'justificado'))
    );

-- =============================================================
-- 5. RLS — HABILITAR
-- =============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financialrecords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 6. POLÍTICAS RLS
-- =============================================================
-- PROFILES
CREATE POLICY "Perfis visíveis por todos" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuário atualiza próprio perfil" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Usuário cria próprio perfil" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- CLASSES
CREATE POLICY "Turmas visíveis por todos" ON public.classes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Professores e Gestores gerenciam turmas" ON public.classes
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
    );

-- ENROLLMENTS
CREATE POLICY "Alunos veem próprias matrículas" ON public.enrollments
    FOR SELECT TO authenticated USING (auth.uid() = studentid);

CREATE POLICY "Gestores e Docentes gerenciam matrículas" ON public.enrollments
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
    );

-- GRADES
CREATE POLICY "Alunos veem próprias notas" ON public.grades
    FOR SELECT TO authenticated USING (auth.uid() = studentid);

CREATE POLICY "Docentes e Gestores gerenciam notas" ON public.grades
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
    );

-- ATTENDANCE
CREATE POLICY "Alunos veem própria frequência" ON public.attendance
    FOR SELECT TO authenticated USING (auth.uid() = studentid);

CREATE POLICY "Docentes e Gestores gerenciam frequência" ON public.attendance
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
    );

-- MATERIALS
CREATE POLICY "Materiais visíveis por todos autenticados" ON public.materials
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Docentes e Gestores gerenciam materiais" ON public.materials
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
    );

-- FINANCIAL
CREATE POLICY "Alunos veem seu financeiro" ON public.financialrecords
    FOR SELECT TO authenticated USING (auth.uid() = studentid);

CREATE POLICY "Gestores gerenciam financeiro" ON public.financialrecords
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
    );

-- CHAT
CREATE POLICY "Usuários veem suas mensagens" ON public.chat_messages
    FOR SELECT TO authenticated USING (auth.uid() = senderid OR auth.uid() = receiverid);

CREATE POLICY "Usuários enviam mensagens" ON public.chat_messages
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = senderid);

-- ANNOUNCEMENTS
CREATE POLICY "Usuários veem avisos do seu papel" ON public.announcements
    FOR SELECT TO authenticated USING (
        targetrole = 'todos' OR
        targetrole = (SELECT role::text FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Gestores e Docentes criam avisos" ON public.announcements
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('gestor', 'docente'))
    );

CREATE POLICY "Autores e Gestores editam avisos" ON public.announcements
    FOR UPDATE TO authenticated USING (
        auth.uid() = authorid OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
    );

CREATE POLICY "Autores e Gestores deletam avisos" ON public.announcements
    FOR DELETE TO authenticated USING (
        auth.uid() = authorid OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
    );

-- AUDIT LOG
CREATE POLICY "Gestores veem audit log" ON public.audit_log
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
    );

-- =============================================================
-- 7. ÍNDICES DE PERFORMANCE
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_attendance_student_class_date ON public.attendance(studentid, classid, date DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(senderid, createdat DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON public.chat_messages(receiverid, createdat DESC);
CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(studentid);
CREATE INDEX IF NOT EXISTS idx_financial_records_student ON public.financialrecords(studentid, duedate DESC);
CREATE INDEX IF NOT EXISTS idx_materials_class ON public.materials(classid);
CREATE INDEX IF NOT EXISTS idx_announcements_targetrole ON public.announcements(targetrole);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON public.audit_log(tablename, recordid, changedat DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log(changedby, changedat DESC);
CREATE INDEX IF NOT EXISTS idx_classes_subject ON public.classes(subject);

-- =============================================================
-- 8. AUTOMAÇÃO DE PERFIL
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

    INSERT INTO public.profiles (id, fullname, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'fullname', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
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
-- 9. REALTIME
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
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'chat_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'announcements'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
END $$;

-- =============================================================
-- 10. STORAGE — BUCKETS E POLÍTICAS
-- =============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('student-documents', 'student-documents', false)
    ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Docentes fazem upload de materiais" ON storage.objects;
CREATE POLICY "Docentes fazem upload de materiais" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'materials' AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
    );

DROP POLICY IF EXISTS "Todos autenticados veem materiais" ON storage.objects;
CREATE POLICY "Todos autenticados veem materiais" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'materials');

DROP POLICY IF EXISTS "Docentes deletam materiais" ON storage.objects;
CREATE POLICY "Docentes deletam materiais" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'materials' AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
    );

DROP POLICY IF EXISTS "Alunos fazem upload de seus docs" ON storage.objects;
CREATE POLICY "Alunos fazem upload de seus docs" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'student-documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Alunos veem seus docs" ON storage.objects;
CREATE POLICY "Alunos veem seus docs" ON storage.objects
    FOR SELECT TO authenticated USING (
        bucket_id = 'student-documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Gestores veem todos docs no storage" ON storage.objects;
CREATE POLICY "Gestores veem todos docs no storage" ON storage.objects
    FOR SELECT TO authenticated USING (
        bucket_id = 'student-documents' AND
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
    );

-- =============================================================
-- FIM DO SCRIPT V5
-- Tabelas criadas: profiles, classes, enrollments, materials,
-- grades, attendance, financialrecords, announcements,
-- chat_messages, audit_log
-- =============================================================
