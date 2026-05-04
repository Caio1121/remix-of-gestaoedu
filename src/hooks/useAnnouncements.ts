import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

const VALID_ROLES = new Set<string>(['aluno', 'docente', 'gestor', 'todos']);

/**
 * Retorna comunicados filtrados pelo papel do usuário.
 * Sempre inclui comunicados com `targetrole = 'todos'`.
 * Se `role` não for passado, retorna todos os comunicados (uso do gestor).
 * @param role - Papel do usuário para filtro
 */
export const useAnnouncements = (role?: UserRole | 'todos') =>
  useQuery({
    queryKey: ['announcements', role],
    queryFn: async () => {
      if (role !== undefined && !VALID_ROLES.has(role)) {
        throw new Error(`useAnnouncements: role inválido "${role}"`);
      }

      let query = supabase
        .from('announcements')
        .select('*')
        .order('createdat', { ascending: false });
      if (role) query = query.or(`targetrole.eq.${role},targetrole.eq.todos`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

/**
 * Mutação para criar um novo comunicado.
 * Define `authorid` automaticamente pela sessão atual.
 * Invalida a query `announcements` após sucesso.
 */
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (announcement: {
      title: string;
      content: string;
      category: string;
      priority: string;
      targetrole: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('announcements')
        .insert({ ...announcement, authorid: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
};
