import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Retorna todos os usuários com papel `aluno`, ordenados por nome.
 * Usado pelo gestor para listagem e criação de vínculos.
 */
export const useAllStudents = () =>
  useQuery({
    queryKey: ['all-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, fullname, role, studentcardid, cpf')
        .eq('role', 'aluno')
        .order('fullname');
      if (error) throw error;
      return data;
    },
  });

/**
 * Retorna todos os usuários com papel `docente`, ordenados por nome.
 * Usado pelo gestor para listagem e atribuição de turmas.
 */
export const useAllTeachers = () =>
  useQuery({
    queryKey: ['all-teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, fullname, role, studentcardid, cpf')
        .eq('role', 'docente')
        .order('fullname');
      if (error) throw error;
      return data;
    },
  });
