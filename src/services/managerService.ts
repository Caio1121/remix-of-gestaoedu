import { supabase } from '@/integrations/supabase/client';
import { PASSING_GRADE } from '@/types';

export const managerService = {
  async getDashboardKPIs() {
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
      supabase.from('grades').select('*', { count: 'exact', head: true }).gte('gradevalue', PASSING_GRADE),
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
      data: {
        totalStudents: studentsCount ?? 0,
        totalTeachers: teachersCount ?? 0,
        totalClasses: classesCount ?? 0,
        attendanceRate: Math.round(attRate),
        approvalRate: Math.round(appRate),
        revenueMonth: revMonth,
        revenueDefault: Number(revDefault.toFixed(1)),
        absenteeismRate: Math.round(100 - attRate),
      },
      error: null
    };
  }
};
