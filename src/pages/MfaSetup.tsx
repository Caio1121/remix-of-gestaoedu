import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function MfaSetup() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    (async () => {
      if (!profile) return;

      // Remove qualquer fator não verificado (de tentativas anteriores)
      const { data: factors } = await supabase.auth.mfa.listFactors();
      for (const f of factors?.totp || []) {
        if (f.status !== "verified") {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `EduManager ${Date.now()}` });
      if (error) {
        toast.error("Erro ao iniciar 2FA", { description: error.message });
        setLoading(false);
        return;
      }
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
      setLoading(false);
    })();
  }, [navigate, toast]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setEnrolling(true);
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr) {
      toast.error("Erro", { description: cErr.message });
      setEnrolling(false); return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (vErr) {
      toast.error("Código inválido", { description: vErr.message });
      setEnrolling(false); return;
    }
    toast.success("2FA ativado!", { description: "Sua conta agora está protegida." });
    navigate(`/${profile?.role || 'aluno'}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md bg-card shadow-card rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Configurar 2FA</h1>
            <p className="text-sm text-muted-foreground">Obrigatório para {profile?.role === "gestor" ? "gestores" : "docentes"}</p>
          </div>
        </div>

        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Instale Google Authenticator ou Authy.</li>
          <li>Escaneie o QR code abaixo.</li>
          <li>Digite o código de 6 dígitos para confirmar.</li>
        </ol>

        {qr && (
          <div className="flex justify-center bg-white p-4 rounded-lg">
            <img src={qr} alt="QR Code 2FA" className="w-48 h-48" />
          </div>
        )}

        {secret && (
          <div className="text-center text-xs text-muted-foreground">
            Não consegue escanear? Use o código:<br />
            <code className="text-foreground font-mono break-all">{secret}</code>
          </div>
        )}

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
            />
          </div>
          <Button type="submit" className="w-full" disabled={enrolling || code.length !== 6}>
            {enrolling ? "Verificando..." : "Ativar 2FA"}
          </Button>
        </form>
      </div>
    </div>
  );
}
