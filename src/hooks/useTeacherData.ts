import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Retorna todas as turmas de um professor.
 * A query só executa se `teacherId` for fornecido.
 * @param teacherId - UUID do professor (geralmente `profile?.id`)
 * @returns Array de turmas com `id`, `name`, `period`, `subject`, `schedule`, `room`
 */
export const useTeacherClasses = (teacherId?: string) =>
  useQuery({
    queryKey: ['teacher-classes', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacherid', teacherId);
      if (error) throw error;
      return data;
    },
    enabled: !!teacherId,
  });

/**
 * Retorna os alunos matriculados em uma turma,
 * com notas (av1, av2, av3) e percentual de frequência já calculados.
 * Executa 3 queries paralelas: enrollments + grades + attendance.
 * @param classId - UUID da turma selecionada
 * @returns Array com `id`, `name`, `matricula`, `av1`, `av2`, `av3`, `attendance` (0-100%)
 */
export const useClassStudents = (classId?: string) =>
  useQuery({
    queryKey: ['class-students', classId],
    queryFn: async () => {
      if (!classId) return [];

      const [
        { data: enrolls, error: enrollError },
        { data: grades, error: gradesError },
        { data: attendance, error: attError },
      ] = await Promise.all([
        supabase
          .from('enrollments')
          .select('studentid, profiles(id, fullname, studentcardid)')
          .eq('classid', classId),
        supabase
          .from('grades')
          .select('id, studentid, classid, gradevalue, av1, av2, av3, feedback, updatedat')
          .eq('classid', classId),
        supabase
          .from('attendance')
          .select('*')
          .eq('classid', classId),
      ]);

      if (enrollError) throw enrollError;
      if (gradesError) throw gradesError;
      if (attError) throw attError;

      return (enrolls ?? []).map((d: any) => {
        const studentId = d.profiles.id;
        const sg = (grades as any[]).find((g) => g.studentid === studentId);
        const toNum = (v: any): number | null =>
          v !== null && v !== undefined ? Number(v) : null;
        const studentAtts = (attendance ?? []).filter((a: any) => a.studentid === studentId);
        const presencePct =
          studentAtts.length > 0
            ? (studentAtts.filter((a: any) => a.status === 'presente').length /
                studentAtts.length) * 100
            : 100;

        return {
          id: studentId,
          name: d.profiles.fullname ?? '',
          matricula: d.profiles.studentcardid ?? 'S/M',
          av1: toNum(sg?.av1),
          av2: toNum(sg?.av2),
          av3: toNum(sg?.av3),
          attendance: Math.round(presencePct),
        };
      });
    },
    enabled: !!classId,
  });
