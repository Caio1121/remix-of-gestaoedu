import { supabase } from '@/integrations/supabase/client';
import { TeacherClass } from '@/types';

export const classesService = {
  async getAllClasses() {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name');
    return { data, error };
  },

  async getClassesByTeacher(teacherId: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacherid', teacherId)
      .order('name');
    return { data, error };
  },

  async createClass(classData: Omit<TeacherClass, 'id' | 'createdat'>) {
    const { data, error } = await supabase
      .from('classes')
      .insert([classData])
      .select()
      .single();
    return { data, error };
  },

  async updateClass(id: string, classData: Partial<TeacherClass>) {
    const { data, error } = await supabase
      .from('classes')
      .update(classData)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Nunca chame delete direto na tabela classes. 
   * Use sempre deleteClassIfEmpty para respeitar a regra de negócio e evitar FK no banco.
   */
  async deleteClassIfEmpty(classId: string) {
    // 1. Verificar se existem matrículas
    const { count, error: countError } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('classid', classId);

    if (countError) return { error: countError };
    
    if (count && count > 0) {
      return { 
        error: { 
          code: 'CLASS_HAS_ENROLLMENTS', 
          message: 'Não é possível excluir esta turma pois ela ainda possui alunos matriculados.' 
        } 
      };
    }

    // 2. Se vazio, excluir
    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    return { error: deleteError };
  },

  async getEnrollmentsByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        classes (*)
      `)
      .eq('studentid', studentId);
    return { data, error };
  }
};
