-- Drop the permissive policy
DROP POLICY IF EXISTS "Todos veem avisos" ON public.announcements;

-- Replace with role-aware policy
CREATE POLICY "Usuários veem avisos do seu papel"
ON public.announcements FOR SELECT TO authenticated
USING (
  target_role = 'todos'
  OR target_role = (
    SELECT role::text FROM public.profiles WHERE id = auth.uid()
  )
);
