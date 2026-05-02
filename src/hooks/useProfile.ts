import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export const useProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data
    },
  })

export const useAllStudents = () =>
  useQuery({
    queryKey: ['all-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'aluno')
        .order('full_name')
      if (error) throw error
      return data
    },
  })

export const useAllTeachers = () =>
  useQuery({
    queryKey: ['all-teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'docente')
        .order('full_name')
      if (error) throw error
      return data
    },
  })
