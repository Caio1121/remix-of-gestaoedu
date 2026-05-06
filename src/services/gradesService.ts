import { supabase } from '@/integrations/supabase/client';
import { Grade } from '@/types';

export const gradesService = {
  async getGradesByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        *,
        classes (name)
      `)
      .eq('studentid', studentId);
    return { data: data as Grade[], error };
  },

  async getGradesByClass(classId: string) {
    const query = supabase
      .from('grades')
      .select(`
        *,
        profiles (fullname, studentcardid),
        classes (name)
      `);
    
    if (classId) query.eq('classid', classId);
    
    const { data, error } = await query;
    return { data, error };
  },

  async getAllGradesWithClasses() {
    const { data, error } = await supabase
      .from('grades')
      .select('gradevalue, av1, av2, av3, studentid, classid, classes!inner(name)');
    return { data, error };
  },

  async saveGrade(grade: Partial<Grade>) {
    const { data, error } = await supabase
      .from('grades')
      .upsert(grade)
      .select()
      .single();
    return { data, error };
  }
};
