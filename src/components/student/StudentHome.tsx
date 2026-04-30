import { Student, Grade, Payment, Notice } from "@/types";
import { BookOpen, DollarSign, CalendarCheck, Bell, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Props {
  student: Student;
  grades: Grade[];
  payments: Payment[];
  notices: Notice[];
  attendanceRate: number;
  onNavigate: (id: string) => void;
}

function StatCard({ icon: Icon, label, value, sub, color, onClick }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-card shadow-card rounded-xl p-4 flex items-center gap-4 w-full text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className="text-xl font-bold text-foreground leading-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </button>
  );
}

export function StudentHome({ student, grades, payments, notices, attendanceRate, onNavigate }: Props) {
  const gradesWithValue = grades.filter(g => g.grade_value !== null && g.grade_value !== undefined);
  const avgGrade = gradesWithValue.length > 0
    ? gradesWithValue.reduce((sum, g) => sum + Number(g.grade_value || 0), 0) / gradesWithValue.length
    : 0;

  const pendingPayment = payments.find(p => p.is_paid === false);
  const presenceRate = attendanceRate;
  const highPriorityNotices = notices.filter(n => n.priority === "alta").length;

  const categoryColor: Record<string, string> = {
    academico: "bg-info-light text-info",
    financeiro: "bg-warning-light text-warning",
    evento: "bg-accent-light text-accent",
    geral: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="gradient-brand rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-full opacity-10">
          <div className="w-48 h-48 rounded-full bg-white absolute -right-12 -top-12" />
          <div className="w-32 h-32 rounded-full bg-white absolute right-8 bottom-0" />
        </div>
        <div className="relative z-10">
          <p className="text-primary-foreground/70 text-sm mb-1">Olá,</p>
          <h2 className="text-2xl font-bold">{student.name.split(" ")[0]} {student.name.split(" ")[1]} 👋</h2>
          <p className="text-primary-foreground/70 text-sm mt-1">
            {student.course} · Turma {student.class} · Matrícula {student.matricula}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Média Geral"
          value={avgGrade.toFixed(1)}
          sub="2025.1"
          color="gradient-brand"
          onClick={() => onNavigate("grades")}
        />
        <StatCard
          icon={CalendarCheck}
          label="Frequência"
          value={`${presenceRate}%`}
          sub="presença geral"
          color="bg-success"
          onClick={() => onNavigate("attendance")}
        />
        <StatCard
          icon={DollarSign}
          label="Financeiro"
          value={pendingPayment ? "Pendente" : "Em dia"}
          sub={pendingPayment ? "parcela pendente" : "Parabéns!"}
          color={pendingPayment ? "bg-warning" : "bg-success"}
          onClick={() => onNavigate("financial")}
        />
        <StatCard
          icon={Bell}
          label="Avisos"
          value={highPriorityNotices}
          sub="alta prioridade"
          color="bg-destructive"
          onClick={() => onNavigate("notices")}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Grades summary */}
        <div className="bg-card shadow-card rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Notas Recentes
            </h3>
            <button onClick={() => onNavigate("grades")} className="text-xs text-accent font-medium hover:underline">
              Ver todas
            </button>
          </div>
          <div className="divide-y divide-border">
            {grades.slice(0, 4).map((g) => {
              const val = Number(g.grade_value || 0);
              const status = g.grade_value === null ? "cursando" : val >= 6 ? "aprovado" : "reprovado";
              return (
                <div key={g.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{g.classes?.name || "Disciplina"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {g.grade_value !== null && (
                      <span className={`text-lg font-bold ${val >= 7 ? "text-success" : val >= 5 ? "text-warning" : "text-destructive"}`}>
                        {val.toFixed(1)}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      status === "aprovado" ? "bg-success-light text-success" :
                      status === "reprovado" ? "bg-destructive-light text-destructive" :
                      "bg-info-light text-info"
                    }`}>
                      {status === "aprovado" ? "Aprovado" : status === "reprovado" ? "Reprovado" : "Em curso"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notices */}
        <div className="bg-card shadow-card rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Quadro de Avisos
            </h3>
            <button onClick={() => onNavigate("notices")} className="text-xs text-accent font-medium hover:underline">
              Ver todos
            </button>
          </div>
          <div className="divide-y divide-border">
            {notices.map((n) => (
              <div key={n.id} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {n.priority === "alta" ? (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    ) : n.priority === "media" ? (
                      <Clock className="w-4 h-4 text-warning" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground truncate">{n.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0 ${categoryColor[n.category || 'geral'] || categoryColor.geral}`}>
                        {n.category || 'geral'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{n.content}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{n.date || (n.created_at ? new Date(n.created_at).toLocaleDateString('pt-BR') : '')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
