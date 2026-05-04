import { useState } from "react";
import { GraduationCap, BookOpen, BarChart3, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginFlow } from "@/hooks/useLoginFlow";
import { UserRole } from "@/types";
import { RoleCard } from "@/components/auth/RoleCard";
import { LoginLayout } from "@/components/auth/LoginLayout";

const showDemo = import.meta.env.VITE_SHOW_DEMO === 'true';

const ROLES = [
  { id: "aluno" as UserRole, label: "Aluno", icon: GraduationCap, color: "from-primary to-primary-light", email: import.meta.env.VITE_DEMO_ALUNO_EMAIL, password: import.meta.env.VITE_DEMO_ALUNO_PASSWORD },
  { id: "docente" as UserRole, label: "Docente", icon: BookOpen, color: "from-accent to-emerald-500", email: import.meta.env.VITE_DEMO_DOCENTE_EMAIL, password: import.meta.env.VITE_DEMO_DOCENTE_PASSWORD },
  { id: "gestor" as UserRole, label: "Gestor", icon: BarChart3, color: "from-violet-700 to-violet-500", email: import.meta.env.VITE_DEMO_GESTOR_EMAIL, password: import.meta.env.VITE_DEMO_GESTOR_PASSWORD },
];

export default function Index() {
  const { login, loading, error, setError } = useLoginFlow();
  const [selectedRole, setSelectedRole] = useState<UserRole>("aluno");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
    if (showDemo) {
      const data = ROLES.find(r => r.id === role);
      setEmail(data?.email || "");
      setPassword(data?.password || "");
    }
  };

  const selectedData = ROLES.find(r => r.id === selectedRole)!;

  return (
    <LoginLayout>
      <div className="w-full max-w-md space-y-8 animate-fade-in">
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

        <div className="grid grid-cols-3 gap-3">
          {ROLES.map(r => <RoleCard key={r.id} {...r} isSelected={selectedRole === r.id} onSelect={handleRoleSelect} />)}
        </div>

        {showDemo && (
          <div className="bg-accent-light rounded-lg px-4 py-2.5 text-xs text-accent flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Demo — {selectedData.label}:</strong> {selectedData.email} / {selectedData.password}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); login(email, password); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">E-mail institucional</Label>
            <Input id="email" type="email" placeholder="seu.email@edu.br" value={email} onChange={e => setEmail(e.target.value)} required className="h-11" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <button type="button" className="text-xs text-accent hover:underline font-medium">Esqueceu a senha?</button>
            </div>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-11 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <div className="text-destructive text-sm bg-destructive-light rounded-lg px-3 py-2">{error}</div>}

          <Button type="submit" className="w-full h-11 gradient-brand text-primary-foreground font-semibold shadow-primary-glow hover:opacity-90 transition-opacity" disabled={loading}>
            {loading ? "Entrando..." : `Entrar como ${selectedData.label}`}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground">Problemas de acesso? Entre em contato com a secretaria.</p>
      </div>
    </LoginLayout>
  );
}
