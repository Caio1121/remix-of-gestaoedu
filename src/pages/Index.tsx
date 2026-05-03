import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroSchool from "@/assets/hero-school.jpg";
import { GraduationCap, BookOpen, BarChart3, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

type Role = "aluno" | "docente" | "gestor";

const roles = [
  {
    id: "aluno" as Role,
    label: "Aluno",
    description: "Acesse suas notas, mensalidades e materiais",
    icon: GraduationCap,
    color: "from-primary to-primary-light",
    email: "lucas.santos@edu.br",
    password: "aluno123",
  },
  {
    id: "docente" as Role,
    label: "Docente",
    description: "Gerencie turmas, notas e conteúdos",
    icon: BookOpen,
    color: "from-accent to-emerald-500",
    email: "ana.oliveira@edu.br",
    password: "docente123",
  },
  {
    id: "gestor" as Role,
    label: "Gestor",
    description: "Acesso completo à administração escolar",
    icon: BarChart3,
    color: "from-violet-700 to-violet-500",
    email: "carlos.martins@edu.br",
    password: "gestor123",
  },
];


export default function Index() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>("aluno");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
                full_name: email.split('@')[0],
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
      console.error("Erro crítico no login:", err);
      setError(`Erro de conexão: ${err.message || "Verifique sua internet ou as chaves do Supabase"}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    alert("Iniciando teste de conexão... aguarde alguns segundos.");
    try {
      console.log("Chamando Supabase...");
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) throw error;
      alert("Conexão OK! O banco de dados está respondendo.");
    } catch (err: any) {
      console.error("Erro no teste:", err);
      alert(`Erro de Conexão: ${err.message}`);
    }
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole)!;

  return (
    <div className="min-h-screen flex">
      {/* Left panel — hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroSchool} alt="EduManager" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/60" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">EduManager</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">Sistema de Gestão Escolar</p>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-3">
                Educação conectada,<br />gestão inteligente.
              </h1>
              <p className="text-primary-foreground/75 text-lg leading-relaxed">
                Plataforma completa para alunos, docentes e gestores. Acesse tudo em um só lugar, de qualquer dispositivo.
              </p>
            </div>

          </div>

          <div className="text-primary-foreground/50 text-xs">
            © 2025 EduManager · Versão 2.0 · Todos os direitos reservados
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">EduManager</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h2>
            <p className="text-muted-foreground mt-1">Selecione seu perfil e faça login</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-3">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                    ? "border-primary bg-primary/5 shadow-primary-glow"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${role.color} ${isSelected ? "shadow-md" : "opacity-70 group-hover:opacity-90"}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                    {role.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hint */}
          <div className="bg-accent-light rounded-lg px-4 py-2.5 text-xs text-accent flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Demo — {selectedRoleData.label}:</strong> {selectedRoleData.email} / {selectedRoleData.password}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">E-mail institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <button type="button" className="text-xs text-accent hover:underline font-medium">
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-destructive text-sm bg-destructive-light rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 gradient-brand text-primary-foreground font-semibold shadow-primary-glow hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? "Entrando..." : `Entrar como ${selectedRoleData.label}`}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Problemas de acesso? Entre em contato com a secretaria.
          </p>
          <div className="flex justify-center pt-4">
            <button
              onClick={testConnection}
              className="text-[10px] text-muted-foreground hover:text-primary underline"
            >
              Testar Conexão com Supabase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
