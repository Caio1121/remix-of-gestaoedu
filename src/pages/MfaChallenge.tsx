import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function MfaChallenge() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    (async () => {
      if (!profile) return;

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verified = factors?.totp?.find(f => f.status === "verified");
      if (!verified) {
        navigate("/mfa-setup");
        return;
      }
      setFactorId(verified.id);
    })();
  }, [navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setVerifying(true);
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr) {
      toast.error("Erro", { description: cErr.message });
      setVerifying(false); return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (vErr) {
      toast.error("Código inválido", { description: vErr.message });
      setVerifying(false); return;
    }
    navigate(`/${profile?.role || 'aluno'}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm bg-card shadow-card rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Verificação 2FA</h1>
            <p className="text-sm text-muted-foreground">Digite o código do seu app</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
          <div>
            <Label htmlFor="code">Código de 6 dígitos</Label>
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="text-center text-lg tracking-widest"
              required
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={verifying || code.length !== 6}>
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
