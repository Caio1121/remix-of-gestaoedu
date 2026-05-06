import { supabase } from '@/integrations/supabase/client';
import { Notice } from '@/types';

export const announcementsService = {
  async getAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        profiles (fullname)
      `)
      .order('createdat', { ascending: false });
    return { data, error };
  },

  async createAnnouncement(announcement: Omit<Notice, 'id'>) {
    const { data, error } = await supabase
      .from('announcements')
      .insert([announcement])
      .select()
      .single();
    return { data, error };
  },

  async deleteAnnouncement(id: string) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    return { error };
  }
};
