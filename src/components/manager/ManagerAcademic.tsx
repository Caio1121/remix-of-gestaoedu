import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CoursePerf { course: string; avg: number; students: number }
interface Props {
  courses: CoursePerf[];
  kpis: { attendanceRate: number; approvalRate: number; absenteeismRate: number };
}

export function ManagerAcademic({ courses, kpis }: Props) {
  const overallAvg = (courses.reduce((s, c) => s + c.avg, 0) / courses.length).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Desempenho Acadêmico</h2>
        <p className="text-muted-foreground text-sm">Métricas de aproveitamento por curso</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Média Geral", value: overallAvg, sub: "todos os cursos", color: "text-primary" },
          { label: "Taxa de Aprovação", value: `${kpis.approvalRate}%`, sub: "semestre 2025.1", color: "text-success" },
          { label: "Frequência Média", value: `${kpis.attendanceRate}%`, sub: "geral", color: "text-info" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-card shadow-card rounded-xl p-5 text-center">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-sm font-medium text-foreground mt-1">{label}</div>
            <div className="text-xs text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Avg by course bar */}
        <div className="bg-card shadow-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Média por Curso</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={courses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="course" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={80} />
              <Tooltip />
              <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Média" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Students by course */}
        <div className="bg-card shadow-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Alunos por Curso</h3>
          <div className="space-y-3">
            {courses.map((c) => {
              const maxStudents = Math.max(...courses.map(x => x.students));
              const pct = (c.students / maxStudents) * 100;
              return (
                <div key={c.course}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{c.course}</span>
                    <span className="text-sm font-bold text-foreground">{c.students}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details table */}
      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Indicadores por Curso</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                {["Curso", "Alunos", "Média Geral", "Situação"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.map((c) => (
                <tr key={c.course} className="hover:bg-muted/20">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{c.course}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{c.students}</td>
                  <td className="px-5 py-3">
                    <span className={`text-base font-bold ${c.avg >= 7.5 ? "text-success" : c.avg >= 6.5 ? "text-warning" : "text-destructive"}`}>
                      {c.avg.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${c.avg >= 7.5 ? "bg-success-light text-success" :
                        c.avg >= 6.5 ? "bg-warning-light text-warning" : "bg-destructive-light text-destructive"
                      }`}>
                      {c.avg >= 7.5 ? "Excelente" : c.avg >= 6.5 ? "Regular" : "Atenção"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
