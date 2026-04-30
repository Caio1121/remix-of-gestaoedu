ALTER TABLE public.announcements
ADD CONSTRAINT announcements_target_role_valid
CHECK (target_role IN ('aluno', 'docente', 'gestor', 'todos'));
