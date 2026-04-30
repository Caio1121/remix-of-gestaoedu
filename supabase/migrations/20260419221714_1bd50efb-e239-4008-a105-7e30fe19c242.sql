-- Recria função e trigger para auto-criar perfil ao registrar novo usuário
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
    v_role := COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'aluno'::public.user_role);
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