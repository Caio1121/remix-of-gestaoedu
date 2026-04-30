import { AttendanceRecord } from "@/types";
import { CalendarCheck, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Props { records: AttendanceRecord[] }

const statusConfig = {
  presente: { label: "Presente", icon: CheckCircle, cls: "bg-success-light text-success", dot: "bg-success" },
  ausente: { label: "Ausente", icon: XCircle, cls: "bg-destructive-light text-destructive", dot: "bg-destructive" },
  justificado: { label: "Justificado", icon: AlertCircle, cls: "bg-warning-light text-warning", dot: "bg-warning" },
};

export function StudentAttendance({ records }: Props) {
  const total = records.length;
  const presente = records.filter(r => r.status === "presente").length;
  const ausente = records.filter(r => r.status === "ausente").length;
  const justificado = records.filter(r => r.status === "justificado").length;
  const rate = total > 0 ? Math.round((presente / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Controle de Frequência</h2>
        <p className="text-muted-foreground text-sm">Registro de presença por disciplina</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card shadow-card rounded-xl p-4 text-center">
          <div className={`text-3xl font-bold ${rate >= 75 ? "text-success" : "text-destructive"}`}>{rate}%</div>
          <div className="text-xs text-muted-foreground mt-1">Frequência Geral</div>
          <div className={`text-xs font-medium mt-1 ${rate >= 75 ? "text-success" : "text-destructive"}`}>
            {rate >= 75 ? "✓ Regular" : "⚠ Risco de reprovação"}
          </div>
        </div>
        <div className="bg-card shadow-card rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-success">{presente}</div>
          <div className="text-xs text-muted-foreground mt-1">Presenças</div>
        </div>
        <div className="bg-card shadow-card rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-destructive">{ausente}</div>
          <div className="text-xs text-muted-foreground mt-1">Faltas</div>
        </div>
        <div className="bg-card shadow-card rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-warning">{justificado}</div>
          <div className="text-xs text-muted-foreground mt-1">Justificadas</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card shadow-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Índice de Frequência</h3>
          <span className="text-sm text-muted-foreground">Mínimo: 75%</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${rate >= 75 ? "bg-success" : "bg-destructive"}`}
            style={{ width: `${rate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
          <span>0%</span>
          <span className="text-warning">75% (mínimo)</span>
          <span>100%</span>
        </div>
      </div>

      {/* Records table */}
      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Histórico de Aulas</h3>
        </div>
        <div className="divide-y divide-border">
          {records.map((r, i) => {
            const cfg = statusConfig[r.status];
            const Icon = cfg.icon;
            return (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />
                  <div>
                    <div className="text-sm font-medium text-foreground">{r.subject}</div>
                    <div className="text-xs text-muted-foreground">{r.date}</div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ${cfg.cls}`}>
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
