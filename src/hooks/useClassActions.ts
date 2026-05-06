import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { classesService } from '@/services/classesService';
import { gradesService } from '@/services/gradesService';
import { attendanceService } from '@/services/attendanceService';
import { handleSupabaseError } from '@/lib/errorHandler';
import { Grade, AttendanceRecord } from '@/types';
import { toast } from 'sonner';

/**
 * Mutação para criar uma nova turma.
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
      const { data, error } = await classesService.createClass(newClass as any);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] });
      toast.success('Turma criada com sucesso!');
    },
    onError: (error) => handleSupabaseError(error, 'createClass'),
  });
};

/**
 * Mutação para criar um novo usuário via Edge Function.
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
      toast.success('Usuário criado e convite enviado!');
    },
    onError: (error) => handleSupabaseError(error, 'createUser'),
  });
};

/**
 * Mutação para salvar/atualizar notas com Optimistic Update.
 */
export const useUpsertGrades = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (grades: Partial<Grade>[]) => {
      const { data, error } = await gradesService.saveGrade(grades as any); // Assuming service handles array or update service
      if (error) throw error;
      return data;
    },
    onMutate: async (newGrades) => {
      await queryClient.cancelQueries({ queryKey: ['class-students'] });
      const previousData = queryClient.getQueryData(['class-students']);
      
      // Update local cache optimistically
      queryClient.setQueryData(['class-students'], (old: any) => {
        if (!old) return old;
        return old.map((student: any) => {
          const update = newGrades.find(g => g.studentid === student.id);
          if (update) {
            return { ...student, ...update };
          }
          return student;
        });
      });

      return { previousData };
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['class-students'], context.previousData);
      }
      handleSupabaseError(err, 'upsertGrades');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students'] });
      queryClient.invalidateQueries({ queryKey: ['student-grades'] });
    },
  });
};

/**
 * Mutação para salvar frequência com Optimistic Update.
 */
export const useUpsertAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (records: Partial<AttendanceRecord>[]) => {
      const { data, error } = await attendanceService.bulkSaveAttendance(records);
      if (error) throw error;
      return data;
    },
    onMutate: async (newRecords) => {
      await queryClient.cancelQueries({ queryKey: ['class-students'] });
      const previousData = queryClient.getQueryData(['class-students']);

      queryClient.setQueryData(['class-students'], (old: any) => {
        if (!old) return old;
        return old.map((student: any) => {
          const update = newRecords.find(r => r.studentid === student.id);
          if (update) {
            // Recalculate attendance percentage locally if needed, 
            // but for now just mark it as updated.
            return { ...student, attendanceUpdated: true };
          }
          return student;
        });
      });

      return { previousData };
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['class-students'], context.previousData);
      }
      handleSupabaseError(err, 'upsertAttendance');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students'] });
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
    },
  });
};

/**
 * Mutação para upload de material.
 */
export const useUploadMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (material: any) => {
      const { data, error } = await materialsService.createMaterial(material);
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materials', variables.classid] });
      toast.success('Material publicado!');
    },
    onError: (error) => handleSupabaseError(error, 'uploadMaterial'),
  });
};

/**
 * Mutação para excluir uma turma se estiver vazia.
 */
export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await classesService.deleteClassIfEmpty(classId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] });
      queryClient.invalidateQueries({ queryKey: ['manager-data'] });
      queryClient.invalidateQueries({ queryKey: ['course-performance'] });
      toast.success('Turma excluída', { description: 'A turma foi excluída com sucesso.' });
    },
    onError: (error) => handleSupabaseError(error, 'excluir turma'),
  });
};
