import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useLoginFlow = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (email: string, password: string) => {
    setError("");
    setLoading(true);

    try {
      // 1. Autenticação no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          setError("E-mail ou senha incorretos.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (authData.user) {
        // 2. Busca o papel (role) do usuário na tabela profiles
        let { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        // SE O PERFIL NÃO EXISTIR (Para facilitar a criação de novos usuários)
        if (profileError || !profile) {
          console.log("Perfil não encontrado, criando perfil padrão...");
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([
              {
                id: authData.user.id,
                fullname: email.split('@')[0],
                role: 'aluno'
              }
            ])
            .select("role")
            .single();

          if (createError) {
            console.error("Erro ao criar perfil automático:", createError);
            setError("Erro ao configurar seu perfil. Tente novamente.");
            setLoading(false);
            return;
          }
          profile = newProfile;
        }

        // 3. 2FA obrigatório para gestores e docentes
        if (profile.role === "gestor" || profile.role === "docente") {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const hasVerified = factors?.totp?.some(f => f.status === "verified");
          const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

          if (!hasVerified) {
            navigate("/mfa-setup");
            return;
          }
          if (aal?.currentLevel !== "aal2") {
            navigate("/mfa-challenge");
            return;
          }
        }

        navigate(`/${profile.role}`);
      }
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError(`Erro de acesso: ${err.message || "Verifique suas credenciais ou internet"}`);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, setError };
};
