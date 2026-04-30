
-- TIPOS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('aluno', 'docente', 'gestor');
    END IF;
END $$;

-- TABELAS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role user_role DEFAULT 'aluno',
  student_card_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  period TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(student_id, class_id)
);

CREATE TABLE IF NOT EXISTS public.materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_url TEXT,
  material_type TEXT DEFAULT 'document',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  grade_value DECIMAL(4,2),
  feedback TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  is_present BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'presente',
  justification_description TEXT,
  justification_file_url TEXT
);

CREATE TABLE IF NOT EXISTS public.financial_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_url TEXT,
  amount DECIMAL(10,2) DEFAULT 0.00,
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'geral',
  priority TEXT DEFAULT 'media',
  target_role TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Perfis visiveis por todos" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuario atualiza proprio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Inserir perfil proprio" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Turmas visiveis por todos" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Professores e Gestores gerenciam turmas" ON public.classes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
);

CREATE POLICY "Alunos veem proprias notas" ON public.grades FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Docentes e Gestores gerenciam notas" ON public.grades FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
);

CREATE POLICY "Alunos veem propria frequencia" ON public.attendance FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Docentes e Gestores gerenciam frequencia" ON public.attendance FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
);

CREATE POLICY "Materiais visiveis por todos autenticados" ON public.materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Docentes e Gestores gerenciam materiais" ON public.materials FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
);

CREATE POLICY "Alunos veem seu financeiro" ON public.financial_records FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Gestores gerenciam financeiro" ON public.financial_records FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
);

CREATE POLICY "Usuarios veem suas mensagens" ON public.chat_messages FOR SELECT TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Usuarios enviam mensagens" ON public.chat_messages FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Todos veem avisos" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestores e Docentes criam avisos" ON public.announcements FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('gestor', 'docente')));

CREATE POLICY "Enrollments visiveis" ON public.enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestores gerenciam enrollments" ON public.enrollments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
);

-- TRIGGER para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'aluno'::user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
