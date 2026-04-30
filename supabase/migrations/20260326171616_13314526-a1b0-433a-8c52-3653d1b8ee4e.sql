
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Docentes fazem upload de materiais"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'materials' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
);

CREATE POLICY "Todos autenticados veem materiais"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'materials');

CREATE POLICY "Docentes deletam materiais"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'materials' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('docente', 'gestor'))
);
