import { supabase } from '@/integrations/supabase/client';
import { Payment } from '@/types';

export const financialService = {
  async getPaymentsByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('financialrecords')
      .select('*')
      .eq('studentid', studentId)
      .order('duedate', { ascending: true });
    return { data, error };
  },

  async getAllFinancialRecords() {
    const { data, error } = await supabase
      .from('financialrecords')
      .select(`
        *,
        profiles (fullname)
      `)
      .order('duedate', { ascending: false });
    return { data, error };
  },

  async markAsPaid(id: string) {
    const { data, error } = await supabase
      .from('financialrecords')
      .update({ ispaid: true, updatedat: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async createInvoice(record: Partial<Payment>) {
    const { data, error } = await supabase
      .from('financialrecords')
      .insert([record])
      .select()
      .single();
    return { data, error };
  }
};
