import { Card } from "@/components/ui/card";
import { Users, GraduationCap, CalendarCheck, TrendingUp } from "lucide-react";
import { TeacherClass } from "@/types";

interface Props {
  classes: TeacherClass[];
}

export function TeacherReports({ classes }: Props) {
  // Simple summary stats
  const totalStudents = classes.reduce((acc, c) => acc + (c.students || 0), 0);
  const avgAttendance = 92; // Mock for now or calculated if data available
  const avgGrade = 7.8; // Mock for now

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Relatórios Acadêmicos</h2>
        <p className="text-muted-foreground text-sm">Visão geral do desempenho das suas turmas</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total de Alunos", value: totalStudents, color: "bg-primary/10 text-primary" },
          { icon: CalendarCheck, label: "Frequência Média", value: `${avgAttendance}%`, color: "bg-success/10 text-success" },
          { icon: GraduationCap, label: "Média de Notas", value: avgGrade, color: "bg-warning/10 text-warning" },
          { icon: TrendingUp, label: "Taxa de Aprovação", value: "85%", color: "bg-info/10 text-info" },
        ].map((stat, i) => (
          <Card key={i} className="p-4 border-none shadow-card bg-card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Desempenho por Turma</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="px-5 py-3 text-left font-semibold">Turma</th>
                <th className="px-5 py-3 text-center font-semibold">Alunos</th>
                <th className="px-5 py-3 text-center font-semibold">Frequência</th>
                <th className="px-5 py-3 text-center font-semibold">Média</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-foreground">{c.name}</td>
                  <td className="px-5 py-3.5 text-center">{c.students || 0}</td>
                  <td className="px-5 py-3.5 text-center">90%</td>
                  <td className="px-5 py-3.5 text-center">7.5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
