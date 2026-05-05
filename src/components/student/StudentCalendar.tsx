import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, DollarSign, UserCheck } from "lucide-react";

interface Props {
  financial: any[];
  attendance: any[];
}

export function StudentCalendar({ financial, attendance }: Props) {
  // Filter events for the list
  const events = [
    ...financial.map(f => ({
      date: parseISO(f.duedate),
      title: `Vencimento: R$ ${Number(f.amount || 0).toFixed(2)}`,
      type: 'financial',
      status: f.ispaid ? 'pago' : 'pendente'
    })),
    ...attendance.map(a => ({
      date: parseISO(a.date),
      title: a.ispresent ? 'Presença Registrada' : 'Falta Registrada',
      type: 'attendance',
      status: a.status
    }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Calendário Escolar</h2>
          <p className="text-muted-foreground text-sm">Acompanhe datas de pagamento e frequência</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4 shadow-card border-none bg-card">
          <Calendar
            mode="single"
            locale={ptBR}
            className="rounded-md w-full"
            modifiers={{
              event: (date) => events.some(e => isSameDay(e.date, date))
            }}
            modifiersStyles={{
              event: { fontWeight: 'bold', textDecoration: 'underline', color: 'var(--primary)' }
            }}
          />
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            Próximos Eventos
          </h3>
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhum evento registrado.</p>
            ) : (
              events.slice(0, 10).map((e, i) => (
                <div key={i} className="bg-card p-3 rounded-xl border border-border flex items-start gap-3 hover:bg-muted/30 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    e.type === 'financial' ? "bg-warning-light text-warning" : "bg-success-light text-success"
                  }`}>
                    {e.type === 'financial' ? <DollarSign className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{e.title}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {format(e.date, "PPP", { locale: ptBR })}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {e.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
