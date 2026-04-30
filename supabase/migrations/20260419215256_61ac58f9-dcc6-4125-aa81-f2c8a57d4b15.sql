DROP POLICY IF EXISTS "Gestores acessam todos docs no storage" ON storage.objects;

CREATE POLICY "Gestores veem todos docs no storage"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'student-documents' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'gestor')
);