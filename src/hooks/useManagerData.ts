import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

/**
 * Retorna KPIs agregados do gestor.
 * Executa 6 queries paralelas via Promise.all:
 * contagem de alunos, professores, turmas + dados de frequência, notas e financeiro.
 * @returns `totalStudents`, `totalTeachers`, `totalClasses`,
 *          `attendanceRate`, `approvalRate`, `absenteeismRate`,
 *          `revenueMonth` (R$), `revenueDefault` (% inadimplência)
 */
export const useManagerData = () =>
  useQuery<ManagerKPI>({
    queryKey: ['manager-data'],
    queryFn: async () => {
      const [
        { count: studentsCount },
        { count: teachersCount },
        { count: classesCount },
        { count: attTotal },
        { count: attPresent },
        { count: gradeTotal },
        { count: gradeApproved },
        { data: finData },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'aluno'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'docente'),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('attendance').select('*', { count: 'exact', head: true }),
        supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('status', 'presente'),
        supabase.from('grades').select('*', { count: 'exact', head: true }),
        supabase.from('grades').select('*', { count: 'exact', head: true }).gte('gradevalue', 7),
        supabase.from('financialrecords').select('amount, ispaid'),
      ]);

      const attRate = attTotal && attTotal > 0
        ? (Number(attPresent) / Number(attTotal)) * 100
        : 0;

      const appRate = gradeTotal && gradeTotal > 0
        ? (Number(gradeApproved) / Number(gradeTotal)) * 100
        : 0;

      let revMonth = 0;
      let revDefault = 0;
      if (finData && finData.length > 0) {
        revMonth = finData
          .filter((f: any) => f.ispaid)
          .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
        revDefault = (finData.filter((f: any) => !f.ispaid).length / finData.length) * 100;
      }

      return {
        totalStudents: studentsCount ?? 0,
        totalTeachers: teachersCount ?? 0,
        totalClasses: classesCount ?? 0,
        attendanceRate: Math.round(attRate),
        approvalRate: Math.round(appRate),
        revenueMonth: revMonth,
        revenueDefault: Number(revDefault.toFixed(1)),
        absenteeismRate: Math.round(100 - attRate),
      };
    },
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
      const { data, error } = await supabase
        .from('financialrecords')
        .select('amount, ispaid, duedate');
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
      const { data, error } = await supabase
        .from('grades')
        .select('gradevalue, av1, av2, av3, studentid, classid, classes!inner(name)');
      if (error) return [];

      const groupedByClass: Record<string, {
        sum: number;
        count: number;
        students: Set<string>;
      }> = {};

      data?.forEach((g: any) => {
        const className = g.classes?.name ?? 'Geral';
        if (!groupedByClass[className])
          groupedByClass[className] = { sum: 0, count: 0, students: new Set<string>() };

        const avgs = [g.av1, g.av2, g.av3].filter((v) => v !== null && v !== undefined);
        const gradeVal = avgs.length > 0
          ? avgs.reduce((s: number, v: any) => s + Number(v), 0) / avgs.length
          : Number(g.gradevalue) || 0;

        groupedByClass[className].sum += gradeVal;
        groupedByClass[className].count += 1;
        groupedByClass[className].students.add(g.studentid);
      });

      return Object.entries(groupedByClass).map(([name, data]) => ({
        course: name,
        avg: Number((data.sum / data.count).toFixed(1)),
        students: data.students.size,
      }));
    },
  });
