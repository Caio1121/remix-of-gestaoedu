import { supabase } from '@/integrations/supabase/client';

export const documentsService = {
  async getDocumentsByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('student_documents')
      .select('*')
      .eq('studentid', studentId)
      .order('createdat', { ascending: false });
    return { data, error };
  },

  async createDocument(doc: {
    studentid: string;
    name: string;
    doctype: string;
    fileurl: string;
    filesize?: string;
  }) {
    const { data, error } = await supabase
      .from('student_documents')
      .insert({
        ...doc,
        status: 'pendente'
      })
      .select()
      .single();
    return { data, error };
  },

  async deleteDocument(id: string) {
    const { error } = await supabase
      .from('student_documents')
      .delete()
      .eq('id', id);
    return { error };
  }
};
