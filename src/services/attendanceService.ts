import { supabase } from '@/integrations/supabase/client';
import { AttendanceRecord } from '@/types';

export const attendanceService = {
  async getAttendanceByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        classes (name)
      `)
      .eq('studentid', studentId)
      .order('date', { ascending: false });
    return { data, error };
  },

  async getAttendanceByClass(classId: string, date: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        profiles (fullname, studentcardid)
      `)
      .eq('classid', classId)
      .eq('date', date);
    return { data, error };
  },

  async saveAttendance(record: Partial<AttendanceRecord>) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(record)
      .select()
      .single();
    return { data, error };
  },

  async bulkSaveAttendance(records: Partial<AttendanceRecord>[]) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records)
      .select();
    return { data, error };
  }
};
