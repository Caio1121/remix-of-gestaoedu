import { Grade } from "@/types";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { grades: Grade[] }

function GradeCell({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return <span className="text-muted-foreground text-sm">—</span>;
  const color = value >= 7 ? "text-success font-semibold" : value >= 5 ? "text-warning font-semibold" : "text-destructive font-semibold";
  return <span className={color}>{value.toFixed(1)}</span>;
}

export function StudentGrades({ grades }: Props) {
  const withValue = grades.filter(g => g.gradevalue !== null);
  const avg = withValue.length ? withValue.reduce((s, g) => s + Number(g.gradevalue || 0), 0) / withValue.length : 0;
  const approved = withValue.filter(g => Number(g.gradevalue || 0) >= 6).length;
  
  const handlePrintPDF = () => {
    const originalTitle = document.title;
    document.title = "Boletim_EduFlow";
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Minhas Notas</h2>
          <p className="text-muted-foreground text-sm">Semestre 2025.1</p>
        </div>
        <Button onClick={handlePrintPDF} variant="outline" className="gap-2 bg-white">
          <Download className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      <style>{`
        @media print {
          body > *:not(#grades-print-area) { display: none !important; }
          #grades-print-area { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
          .shadow-card { shadow: none !important; border: 1px solid #eee !important; }
        }
      `}</style>

      <div id="grades-print-area" className="space-y-6">

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card shadow-card rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">{avg.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground mt-1">Média Geral</div>
        </div>
        <div className="bg-card shadow-card rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-success">{approved}</div>
          <div className="text-xs text-muted-foreground mt-1">Aprovado(s)</div>
        </div>
        <div className="bg-card shadow-card rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-foreground">{grades.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Disciplinas</div>
        </div>
      </div>

      {/* Grades table */}
      <div className="bg-card shadow-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Boletim Detalhado</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Disciplina</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nota</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {grades.map((g) => {
                const val = Number(g.gradevalue || 0);
                const status = g.gradevalue === null ? "cursando" : val >= 6 ? "aprovado" : "reprovado";
                return (
                  <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-medium text-foreground">{g.classes?.name || "Disciplina"}</div>
                    </td>
                    <td className="text-center px-3 py-3.5"><GradeCell value={g.gradevalue} /></td>
                    <td className="text-center px-3 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        status === "aprovado" ? "bg-success-light text-success" :
                        status === "reprovado" ? "bg-destructive-light text-destructive" :
                        "bg-info-light text-info"
                      }`}>
                        {status === "aprovado" ? "✓ Aprovado" : status === "reprovado" ? "✗ Reprovado" : "● Em curso"}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3.5 text-xs text-muted-foreground">{g.feedback || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart bars visual */}
      <div className="bg-card shadow-card rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Desempenho por Disciplina</h3>
        <div className="space-y-3">
          {grades.map((g) => {
            const val = Number(g.gradevalue || 0);
            const pct = (val / 10) * 100;
            const color = val >= 7 ? "bg-success" : val >= 5 ? "bg-warning" : "bg-destructive";
            return (
              <div key={g.id} className="flex items-center gap-3">
                <div className="w-36 text-xs text-muted-foreground truncate flex-shrink-0">{g.classes?.name || "Disciplina"}</div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="w-8 text-right text-xs font-bold text-foreground">{val.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
