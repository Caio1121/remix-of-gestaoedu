
CREATE TABLE IF NOT EXISTS public.student_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  doc_type TEXT NOT NULL DEFAULT 'Outros',
  file_url TEXT,
  file_size TEXT,
  status TEXT NOT NULL DEFAULT 'enviado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alunos veem seus documentos" ON public.student_documents
  FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Alunos inserem seus documentos" ON public.student_documents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Alunos deletam seus documentos" ON public.student_documents
  FOR DELETE TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Gestores gerenciam documentos" ON public.student_documents
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
  );
