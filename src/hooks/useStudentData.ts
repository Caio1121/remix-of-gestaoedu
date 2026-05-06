import { useQuery } from '@tanstack/react-query';
import { gradesService } from '@/services/gradesService';
import { financialService } from '@/services/financialService';
import { attendanceService } from '@/services/attendanceService';
import { materialsService } from '@/services/materialsService';
import { classesService } from '@/services/classesService';

export const useGrades = (studentId?: string) =>
  useQuery({
    queryKey: ['student-grades', studentId],
    queryFn: async () => {
      const { data, error } = await gradesService.getGradesByStudent(studentId!);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });

export const useFinancial = (studentId?: string) =>
  useQuery({
    queryKey: ['student-financial', studentId],
    queryFn: async () => {
      const { data, error } = await financialService.getPaymentsByStudent(studentId!);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });

export const useAttendance = (studentId?: string) =>
  useQuery({
    queryKey: ['student-attendance', studentId],
    queryFn: async () => {
      const { data, error } = await attendanceService.getAttendanceByStudent(studentId!);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });

export const useMaterials = (classId?: string) =>
  useQuery({
    queryKey: ['materials', classId],
    queryFn: async () => {
      const { data, error } = await materialsService.getMaterialsByClass(classId!);
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
  });

export const useStudentEnrollments = (studentId?: string) =>
  useQuery({
    queryKey: ['student-enrollments', studentId],
    queryFn: async () => {
      const { data, error } = await classesService.getEnrollmentsByStudent(studentId!);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
