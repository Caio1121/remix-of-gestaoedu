import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Props {
  revenue: Array<{ month: string; receita: number; inadimplencia: number }>;
  kpis: { revenueMonth: number; revenueDefault: number; totalStudents: number };
}

export function ManagerFinancial({ revenue, kpis }: Props) {
  const totalRevenue = revenue.reduce((s, r) => s + r.receita, 0);
  const totalDefault = revenue.reduce((s, r) => s + r.inadimplencia, 0);

  const pieData = [
    { name: "Recebido", value: totalRevenue - totalDefault, color: "hsl(var(--success))" },
    { name: "Inadimplente", value: totalDefault, color: "hsl(var(--destructive))" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Painel Financeiro</h2>
        <p className="text-muted-foreground text-sm">Receitas, inadimplência e indicadores</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Receita Acumulada 2025", value: `R$ ${(totalRevenue/1000000).toFixed(2)}M`, color: "text-success" },
          { label: "Inadimplência Acumulada", value: `R$ ${(totalDefault/1000).toFixed(0)}k`, color: "text-destructive" },
          { label: "Taxa de Inadimplência", value: `${kpis.revenueDefault}%`, color: "text-warning" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card shadow-card rounded-xl p-5">
            <div className="text-xs text-muted-foreground font-medium mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-card shadow-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Receita Mensal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Bar dataKey="receita" fill="hsl(var(--success))" radius={[4,4,0,0]} name="Receita" />
              <Bar dataKey="inadimplencia" fill="hsl(var(--destructive))" radius={[4,4,0,0]} name="Inadimplência" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-card shadow-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Distribuição Financeira</h3>
          <div className="flex items-center justify-center">
            <PieChart width={200} height={200}>
              <Pie data={pieData} cx={100} cy={100} innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
            </PieChart>
          </div>
          <div className="flex gap-6 justify-center mt-2">
            {pieData.map(({ name, color }) => (
              <div key={name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Extrato Mensal</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                {["Mês", "Receita", "Inadimplência", "Líquido", "% Inad."].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {revenue.map((r) => (
                <tr key={r.month} className="hover:bg-muted/20">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{r.month}</td>
                  <td className="px-5 py-3 text-sm text-success font-semibold">R$ {r.receita.toLocaleString("pt-BR")}</td>
                  <td className="px-5 py-3 text-sm text-destructive font-semibold">R$ {r.inadimplencia.toLocaleString("pt-BR")}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-foreground">R$ {(r.receita - r.inadimplencia).toLocaleString("pt-BR")}</td>
                  <td className="px-5 py-3 text-sm">
                    <span className={`font-semibold ${((r.inadimplencia/r.receita)*100) > 5 ? "text-destructive" : "text-success"}`}>
                      {((r.inadimplencia/r.receita)*100).toFixed(1)}%
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
