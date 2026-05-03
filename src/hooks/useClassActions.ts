import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Mutação para criar uma nova turma.
 * Define `teacherid` automaticamente a partir da sessão atual.
 * Invalida a query `teacher-classes` após sucesso.
 * @example
 * await createClass.mutateAsync({ name: 'Turma ADM-4A', period: '2025.1' })
 */
export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newClass: {
      name: string;
      period: string;
      subject?: string;
      schedule?: string;
      room?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: newClass.name,
          period: newClass.period,
          subject: newClass.subject ?? null,
          schedule: newClass.schedule ?? null,
          room: newClass.room ?? null,
          teacherid: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-classes'] }),
  });
};

/**
 * Mutação para criar um novo usuário via Edge Function `create-user`.
 * Requer papel `gestor`. O Supabase envia e-mail de recuperação de senha automaticamente.
 * @example
 * await createUser.mutateAsync({ email: 'x@y.com', fullname: 'João', role: 'aluno' })
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: { email: string; fullname: string; role: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada. Faça login novamente.');
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: user,
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager-data'] });
      queryClient.invalidateQueries({ queryKey: ['all-students'] });
      queryClient.invalidateQueries({ queryKey: ['all-teachers'] });
    },
  });
};

/**
 * Mutação para publicar um material em uma turma.
 * Invalida a query `materials` da turma específica após sucesso.
 * @param material.materialtype - 'pdf' | 'video' | 'link' | 'slide'
 */
export const useUploadMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (material: {
      classid: string;
      title: string;
      description: string;
      materialtype: string;
      contenturl: string;
    }) => {
      const { data, error } = await supabase
        .from('materials')
        .insert({
          classid: material.classid,
          title: material.title,
          description: material.description,
          materialtype: material.materialtype,
          contenturl: material.contenturl,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['materials', variables.classid] }),
  });
};

/**
 * Mutação para salvar/atualizar notas de múltiplos alunos de uma vez.
 * Usa upsert com chave composta `(studentid, classid)` — seguro para chamar múltiplas vezes.
 * Invalida `class-students` e `student-grades` após sucesso.
 */
export const useUpsertGrades = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      grades: Array<{
        studentid: string;
        classid: string;
        av1: number | null;
        av2: number | null;
        av3: number | null;
        gradevalue: number | null;
      }>
    ) => {
      const { data, error } = await supabase
        .from('grades')
        .upsert(grades, { onConflict: 'studentid,classid' })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students'] });
      queryClient.invalidateQueries({ queryKey: ['student-grades'] });
    },
  });
};
