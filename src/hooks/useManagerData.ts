import { useQuery } from '@tanstack/react-query';
import { managerService } from '@/services/managerService';
import { financialService } from '@/services/financialService';
import { gradesService } from '@/services/gradesService';

export interface ManagerKPI {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
  approvalRate: number;
  revenueMonth: number;
  revenueDefault: number;
  absenteeismRate: number;
}

export const useManagerData = () =>
  useQuery<ManagerKPI>({
    queryKey: ['manager-data'],
    queryFn: async () => {
      const { data, error } = await managerService.getDashboardKPIs();
      if (error) throw error;
      return data as ManagerKPI;
    },
    staleTime: 5 * 60 * 1000,
  });

/**
 * Retorna dados mensais de receita e inadimplência para o gráfico de barras.
 * Agrupa os registros financeiros por mês/ano.
 * @returns Array com `month` (Jan-Dez), `receita` (R$), `inadimplencia` (R$)
 */
export const useRevenueData = () =>
  useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async () => {
      const { data, error } = await financialService.getAllFinancialRecords();
      if (error) return [];

      const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      const grouped: Record<string, { receita: number; inadimplencia: number }> = {};

      data?.forEach((f: any) => {
        const d = new Date(f.duedate);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        if (!grouped[key]) grouped[key] = { receita: 0, inadimplencia: 0 };
        if (f.ispaid) grouped[key].receita += Number(f.amount) || 0;
        else grouped[key].inadimplencia += Number(f.amount) || 0;
      });

      return Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, val]) => {
          const [, month] = key.split('-');
          return { month: monthNames[Number(month)], ...val };
        });
    },
  });

/**
 * Retorna desempenho médio por turma para o gráfico de cursos.
 * Calcula a média das AVs (av1, av2, av3) por turma e conta alunos únicos.
 * @returns Array com `course` (nome da turma), `avg` (média), `students` (qtd alunos)
 */
export const useCoursePerformance = () =>
  useQuery({
    queryKey: ['course-performance'],
    queryFn: async () => {
      const { data, error } = await gradesService.getAllGradesWithClasses();
      if (error) return [];

      const groupedByClass: Record<string, {
        id: string;
        name: string;
        sum: number;
        count: number;
        students: Set<string>;
      }> = {};

      data?.forEach((g: any) => {
        const classId = g.classid;
        if (!groupedByClass[classId])
          groupedByClass[classId] = { id: classId, name: g.classes?.name ?? 'Geral', sum: 0, count: 0, students: new Set<string>() };

        const avgs = [g.av1, g.av2, g.av3].filter((v) => v !== null && v !== undefined);
        const gradeVal = avgs.length > 0
          ? avgs.reduce((s: number, v: any) => s + Number(v), 0) / avgs.length
          : Number(g.gradevalue) || 0;

        groupedByClass[classId].sum += gradeVal;
        groupedByClass[classId].count += 1;
        groupedByClass[classId].students.add(g.studentid);
      });

      return Object.values(groupedByClass).map((data) => ({
        id: data.id,
        course: data.name,
        avg: Number((data.sum / data.count).toFixed(1)),
        students: data.students.size,
      }));
    },
  });
