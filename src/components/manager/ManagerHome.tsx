import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Users, GraduationCap, DollarSign, AlertTriangle, BarChart2 } from "lucide-react";

interface Props {
  manager: { name: string; role: string };
  kpis: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    attendanceRate: number;
    approvalRate: number;
    revenueMonth: number;
    revenueDefault: number;
    absenteeismRate: number;
  };
  revenue: Array<{ month: string; receita: number; inadimplencia: number }>;
  onNavigate: (id: string) => void;
}

function KPICard({ icon: Icon, label, value, sub, color, onClick }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; sub: string; color: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="bg-card shadow-card rounded-xl p-5 text-left hover:shadow-md transition-all hover:-translate-y-0.5 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm font-medium text-foreground mt-0.5">{label}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </button>
  );
}

export function ManagerHome({ manager, kpis, revenue, onNavigate }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gradient-hero rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/2 w-40 h-40 rounded-full bg-white translate-y-1/2" />
        </div>
        <div className="relative z-10">
          <p className="text-primary-foreground/70 text-sm">Painel Executivo</p>
          <h2 className="text-2xl font-bold mt-1">{manager.name}</h2>
          <p className="text-primary-foreground/70 text-sm mt-0.5">{manager.role} · Exercício 2025</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users} label="Total de Alunos" value={kpis.totalStudents.toLocaleString()} sub="matrículas ativas" color="gradient-brand" onClick={() => onNavigate("users")} />
        <KPICard icon={GraduationCap} label="Docentes" value={kpis.totalTeachers.toString()} sub="em atividade" color="bg-accent" onClick={() => onNavigate("users")} />
        <KPICard icon={BarChart2} label="Taxa de Aprovação" value={`${kpis.approvalRate}%`} sub="semestre 2025.1" color="bg-success" onClick={() => onNavigate("academic")} />
        <KPICard icon={AlertTriangle} label="Absenteísmo" value={`${kpis.absenteeismRate}%`} sub="últimos 30 dias" color="bg-warning" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} label="Receita Mensal" value={`R$ ${(kpis.revenueMonth / 1000000).toFixed(2)}M`} sub="maio 2025" color="bg-success" onClick={() => onNavigate("financial")} />
        <KPICard icon={AlertTriangle} label="Inadimplência" value={`${kpis.revenueDefault}%`} sub="do total" color="bg-destructive" onClick={() => onNavigate("financial")} />
        <KPICard icon={Users} label="Frequência Média" value={`${kpis.attendanceRate}%`} sub="geral" color="bg-info" onClick={() => onNavigate("academic")} />
        <KPICard icon={GraduationCap} label="Turmas" value={kpis.totalClasses.toString()} sub="em andamento" color="gradient-brand" />
      </div>

      {/* Revenue chart */}
      <div className="bg-card shadow-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Receita × Inadimplência (2025)</h3>
          <button onClick={() => onNavigate("financial")} className="text-xs text-accent font-medium hover:underline">Ver detalhes</button>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenue} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
            <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Receita" />
            <Bar dataKey="inadimplencia" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Inadimplência" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
