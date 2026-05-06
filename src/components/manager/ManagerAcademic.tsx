import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CoursePerf { id: string; course: string; avg: number; students: number }
interface Props {
  courses: CoursePerf[];
  kpis: { attendanceRate: number; approvalRate: number; absenteeismRate: number };
}

import { Trash2, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteClass } from "@/hooks/useDashboardData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TooltipProvider, Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

export function ManagerAcademic({ courses, kpis }: Props) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const deleteClassMutation = useDeleteClass();

  const handleDelete = async () => {
    if (selectedClassId) {
      await deleteClassMutation.mutateAsync(selectedClassId);
      setIsConfirmOpen(false);
      setSelectedClassId(null);
    }
  };

  const overallAvg = (courses.reduce((s, c) => s + c.avg, 0) / courses.length || 0).toFixed(2);

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
          <TooltipProvider>
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  {["Curso", "Alunos", "Média Geral", "Situação", "Ações"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20">
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
                    <td className="px-5 py-3">
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 px-2 ${c.students > 0 ? "text-muted-foreground/30" : "text-destructive hover:text-destructive hover:bg-destructive/10"}`}
                              disabled={c.students > 0 || deleteClassMutation.isPending}
                              onClick={() => {
                                setSelectedClassId(c.id);
                                setIsConfirmOpen(true);
                              }}
                            >
                              {deleteClassMutation.isPending && selectedClassId === c.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : c.students > 0 ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              <span className="ml-1.5">Excluir</span>
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {c.students > 0 
                              ? "Apenas turmas sem alunos podem ser excluídas" 
                              : "Excluir turma"}
                          </p>
                        </TooltipContent>
                      </UITooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TooltipProvider>
        </div>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão da turma</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta turma? Esta ação é permanente e não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedClassId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir turma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
