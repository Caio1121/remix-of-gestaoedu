import { supabase } from '@/integrations/supabase/client';

export const chatService = {
  async getMessages(receiverId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: new Error('Usuário não autenticado') };

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`and(senderid.eq.${user.id},receiverid.eq.${receiverId}),and(senderid.eq.${receiverId},receiverid.eq.${user.id})`)
      .order('createdat', { ascending: true });
    
    return { data, error };
  },

  async sendMessage(receiverId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Usuário não autenticado') };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          senderid: user.id,
          receiverid: receiverId,
          content
        }
      ])
      .select()
      .single();
    
    return { data, error };
  },

  async getAvailableReceivers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, fullname, role')
      .order('fullname');
    return { data, error };
  }
};
