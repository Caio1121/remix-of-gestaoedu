import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Download, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  revenue: Array<{ month: string; receita: number; inadimplencia: number }>;
  courses: Array<{ course: string; avg: number; students: number }>;
  kpis: { totalStudents: number; approvalRate: number; attendanceRate: number; absenteeismRate: number };
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--info))"];

export function ManagerReports({ revenue, courses, kpis }: Props) {
  const reports = [
    { label: "Relatório Acadêmico 2025.1", desc: "Notas, frequência e aprovação", type: "PDF" },
    { label: "Demonstrativo Financeiro", desc: "Receitas, inadimplência e previsões", type: "XLSX" },
    { label: "Relatório de Absenteísmo", desc: "Análise e fatores de risco", type: "PDF" },
    { label: "Dashboard BI Completo", desc: "Todos os indicadores", type: "PDF" },
  ];

  const studentsData = courses.map((c, i) => ({ name: c.course.slice(0, 6), value: c.students, color: COLORS[i % COLORS.length] }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Relatórios & Business Intelligence</h2>
        <p className="text-muted-foreground text-sm">Dashboards e exportação de dados</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Alunos", value: kpis.totalStudents.toLocaleString(), color: "text-primary" },
          { label: "Taxa de Aprovação", value: `${kpis.approvalRate}%`, color: "text-success" },
          { label: "Freq. Geral", value: `${kpis.attendanceRate}%`, color: "text-info" },
          { label: "Taxa de Absenteísmo", value: `${kpis.absenteeismRate}%`, color: "text-warning" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card shadow-card rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue line */}
        <div className="bg-card shadow-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Evolução da Receita
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Line type="monotone" dataKey="receita" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} name="Receita" />
              <Line type="monotone" dataKey="inadimplencia" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Inadimplência" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Students pie */}
        <div className="bg-card shadow-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Distribuição por Curso</h3>
          <div className="flex items-center gap-4">
            <PieChart width={160} height={160}>
              <Pie data={studentsData} cx={80} cy={80} outerRadius={75} dataKey="value" paddingAngle={2}>
                {studentsData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v} alunos`} />
            </PieChart>
            <div className="flex-1 space-y-2">
              {studentsData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-muted-foreground">{name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export reports */}
      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Exportar Relatórios
          </h3>
        </div>
        <div className="divide-y divide-border">
          {reports.map((r) => (
            <div key={r.label} className="px-5 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
              <div>
                <div className="text-sm font-medium text-foreground">{r.label}</div>
                <div className="text-xs text-muted-foreground">{r.desc}</div>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-3.5 h-3.5" />
                {r.type}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
