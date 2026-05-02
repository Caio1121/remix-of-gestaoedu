import { useState } from "react";
import { DollarSign, Download, CheckCircle, AlertCircle, Clock, CreditCard, QrCode, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeneratePayment } from "@/hooks/useDashboardData";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface PaymentRecord {
  id: string;
  due_date: string;
  is_paid: boolean;
  invoice_url?: string;
  pix_qr_code?: string;
  pix_image_url?: string;
  boleto_url?: string;
  month?: string;
  value?: number;
}

interface Props { payments: any[] }

const statusConfig = {
  pago: { label: "Pago", icon: CheckCircle, cls: "bg-success-light text-success" },
  pendente: { label: "Pendente", icon: Clock, cls: "bg-warning-light text-warning" },
  atrasado: { label: "Atrasado", icon: AlertCircle, cls: "bg-destructive-light text-destructive" },
};

export function StudentFinancial({ payments }: Props) {
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const generatePayment = useGeneratePayment();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<'pix' | 'boleto' | null>(null);

  const totalPaid = payments.filter(p => p.is_paid).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const nextPending = payments.find(p => !p.is_paid);

  const handlePay = async (paymentId: string, method: 'pix' | 'boleto') => {
    if (!profile) {
      toast({ title: "Erro", description: "Perfil não carregado.", variant: "destructive" });
      return;
    }

    try {
      const amount = Number(nextPending?.amount || 0);
      const updated = await generatePayment.mutateAsync({
        amount,
        description: `Mensalidade Escolar - Ref: ${paymentId}`,
        studentProfile: profile
      });
      setSelectedPayment(updated);
      setPaymentType(method);
    } catch (error: any) {
      toast({
        title: "Erro ao gerar pagamento",
        description: error?.message ?? "Tente novamente em instantes.",
        variant: "destructive"
      });
    }

  };

  const copyPix = () => {
    if (selectedPayment?.pix_qr_code) {
      navigator.clipboard.writeText(selectedPayment.pix_qr_code);
      toast({ title: "Código copiado!", description: "Cole no seu app do banco." });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Área Financeira</h2>
        <p className="text-muted-foreground text-sm">Mensalidades e histórico de pagamentos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card shadow-card rounded-xl p-5">
          <div className="text-xs text-muted-foreground font-medium mb-1">Total Pago (2025)</div>
          <div className="text-2xl font-bold text-success">R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-muted-foreground">{payments.filter(p => p.is_paid).length} parcelas</div>
        </div>
        <div className="bg-card shadow-card rounded-xl p-5">
          <div className="text-xs text-muted-foreground font-medium mb-1">Mensalidade Padrão</div>
          <div className="text-2xl font-bold text-foreground">
            R$ {payments.length > 0
              ? (payments.reduce((acc, p) => acc + Number(p.amount || 0), 0) / payments.length).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
              : "0,00"}
          </div>
          <div className="text-xs text-muted-foreground">Valor médio</div>
        </div>
        <div className={`rounded-xl p-5 ${nextPending ? "bg-destructive-light border border-destructive/20" : "bg-success-light border border-success/20"} shadow-card`}>
          <div className="text-xs font-medium mb-1 text-foreground/70">Status Atual</div>
          <div className={`text-2xl font-bold ${nextPending ? "text-destructive" : "text-success"}`}>
            {nextPending ? "Pendente" : "Em dia ✓"}
          </div>
          <div className="text-xs text-foreground/60">{nextPending ? `Vencimento: ${new Date(nextPending.due_date).toLocaleDateString()}` : "Sem débitos"}</div>
        </div>
      </div>

      {nextPending && (
        <div className="bg-warning-light border border-warning/30 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
            <div>
              <div className="font-semibold text-foreground text-sm">Mensalidade Aberta — Vencimento: {new Date(nextPending.due_date).toLocaleDateString()}</div>
              <div className="text-xs text-muted-foreground">Selecione uma forma de pagamento abaixo.</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handlePay(nextPending.id, 'pix')} variant="outline" className="bg-white text-sm">
              <QrCode className="w-4 h-4 mr-2" /> Pix
            </Button>
            <Button onClick={() => handlePay(nextPending.id, 'boleto')} className="gradient-brand text-primary-foreground text-sm">
              <CreditCard className="w-4 h-4 mr-2" /> Boleto
            </Button>
          </div>
        </div>
      )}

      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPayment(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-md w-full shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 text-foreground">
              {paymentType === 'pix' ? 'Pagamento via Pix' : 'Boleto Bancário'}
            </h3>

            {paymentType === 'pix' ? (
              <div className="space-y-4">
                <div className="flex justify-center bg-white p-4 rounded-xl">
                  <img src={selectedPayment.pix_image_url} alt="QR Code" className="w-48 h-48" />
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Pix Copia e Cola</div>
                  <div className="flex gap-2">
                    <code className="text-[10px] block truncate flex-1 bg-background p-2 rounded border">{selectedPayment.pix_qr_code}</code>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyPix}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted rounded-xl p-8 text-center border-2 border-dashed border-border text-muted-foreground">
                  <Download className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Seu boleto foi gerado e está pronto para download.</p>
                </div>
                <Button className="w-full gradient-brand text-white" asChild>
                  <a href={selectedPayment.boleto_url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" /> Baixar Boleto (PDF)
                  </a>
                </Button>
              </div>
            )}

            <Button variant="ghost" className="w-full mt-4" onClick={() => setSelectedPayment(null)}>Fechar</Button>
          </div>
        </div>
      )}

      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Todos os Lançamentos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Data</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Vencimento</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Valor</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => {
                const isPaid = p.is_paid;
                const date = new Date(p.due_date);
                const isAtrasado = !isPaid && date < new Date();
                const status = isPaid ? statusConfig.pago : (isAtrasado ? statusConfig.atrasado : statusConfig.pendente);
                const Icon = status.icon;

                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{date.toLocaleString('pt-BR', { month: 'long' })}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{date.toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-right text-foreground">R$ {Number(p.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${status.cls}`}>
                        <Icon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {!isPaid && (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handlePay(p.id, 'pix')} className="text-xs text-primary hover:underline font-medium">Pix</button>
                          <span className="text-border">|</span>
                          <button onClick={() => handlePay(p.id, 'boleto')} className="text-xs text-primary hover:underline font-medium">Boleto</button>
                        </div>
                      )}
                      {isPaid && <Download className="w-3.5 h-3.5 mx-auto text-muted-foreground" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
