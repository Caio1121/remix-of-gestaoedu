import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Retorna as notas do aluno em todas as turmas matriculadas.
 * Inclui join com `classes(name)` para exibir o nome da disciplina.
 * @param studentId - UUID do aluno (geralmente `profile?.id`)
 */
export const useGrades = (studentId?: string) =>
  useQuery({
    queryKey: ['student-grades', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from('grades')
        .select('*, classes(name)')
        .eq('studentid', studentId);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });

/**
 * Retorna o histórico financeiro do aluno ordenado por vencimento (mais recente primeiro).
 * @param studentId - UUID do aluno
 * @returns Array com `id`, `duedate`, `amount`, `ispaid`, `invoiceurl`
 */
export const useFinancial = (studentId?: string) =>
  useQuery({
    queryKey: ['student-financial', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from('financialrecords')
        .select('id, amount, ispaid, duedate, invoiceurl')
        .eq('studentid', studentId)
        .order('duedate', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });

/**
 * Retorna o histórico de frequência do aluno ordenado por data (mais recente primeiro).
 * Use a coluna `status` ('presente' | 'ausente' | 'justificado').
 * A coluna `ispresent` está depreciada.
 * @param studentId - UUID do aluno
 */
export const useAttendance = (studentId?: string) =>
  useQuery({
    queryKey: ['student-attendance', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('id, date, status, classid')
        .eq('studentid', studentId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });

/**
 * Retorna os materiais publicados em uma turma, ordenados por data de criação.
 * @param classId - UUID da turma
 * @returns Array com `id`, `title`, `description`, `contenturl`, `materialtype`
 */
export const useMaterials = (classId?: string) =>
  useQuery({
    queryKey: ['materials', classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('classid', classId)
        .order('createdat', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

/**
 * Retorna as matrículas do aluno, incluindo os dados das turmas vinculadas.
 * @param studentId - UUID do aluno
 */
export const useStudentEnrollments = (studentId?: string) =>
  useQuery({
    queryKey: ['student-enrollments', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from('enrollments')
        .select('classid, enrolledat, classes(name, period)')
        .eq('studentid', studentId);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
