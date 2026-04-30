import { TeacherClass } from "@/types";
import { Users, BookOpen, Clock, MapPin, TrendingUp, CalendarCheck } from "lucide-react";

interface Props {
  teacher: { id: string; name: string; speciality: string; email: string; avatarInitials: string };
  classes: TeacherClass[];
  onNavigate: (id: string) => void;
  avgGrade?: number | null;
  avgAttendance?: number | null;
}

export function TeacherHome({ teacher, classes, onNavigate, avgGrade, avgAttendance }: Props) {
  const totalStudents = classes.reduce((s, c) => s + (c.students || 0), 0);
  const displayGrade = avgGrade != null ? avgGrade.toFixed(1) : "--";
  const displayAttendance = avgAttendance != null ? `${avgAttendance}%` : "--%";
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="gradient-brand rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-full opacity-10">
          <div className="w-48 h-48 rounded-full bg-white absolute -right-12 -top-12" />
        </div>
        <div className="relative z-10">
          <p className="text-primary-foreground/70 text-sm mb-1">Olá,</p>
          <h2 className="text-2xl font-bold">{teacher.name} 👋</h2>
          <p className="text-primary-foreground/70 text-sm mt-1">{teacher.speciality}</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Alunos", value: totalStudents, sub: "total nas turmas", color: "gradient-brand" },
          { icon: BookOpen, label: "Turmas", value: classes.length, sub: "ativas", color: "bg-accent" },
          { icon: TrendingUp, label: "Média Geral", value: displayGrade, sub: "das turmas", color: "bg-success" },
          { icon: CalendarCheck, label: "Freq. Média", value: displayAttendance, sub: "das turmas", color: "bg-info" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-card shadow-card rounded-xl p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="text-xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Classes */}
      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Minhas Turmas</h3>
          <button onClick={() => onNavigate("classes")} className="text-xs text-accent font-medium hover:underline">Ver todas</button>
        </div>
        <div className="divide-y divide-border">
          {classes.map((c) => (
            <div key={c.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">{c.name}{c.subject ? ` — ${c.subject}` : ''}</div>
                  <div className="flex items-center gap-4 mt-1">
                    {c.schedule && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{c.schedule}</span>}
                    {c.room && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{c.room}</span>}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />{c.students || 0} alunos</span>
                  </div>
                </div>
                <button onClick={() => onNavigate("grades")} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">
                  Lançar notas
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
