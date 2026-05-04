// Barrel re-export — backward compatibility.
// All existing imports from useDashboardData continue to work.
// Gradually migrate to domain-specific hooks.

export { useProfile, useAllStudents, useAllTeachers } from './useProfile';
export { useManagerData, useRevenueData, useCoursePerformance } from './useManagerData';
export { useTeacherClasses, useClassStudents } from './useTeacherData';
export { useGrades, useFinancial, useAttendance, useMaterials, useStudentEnrollments } from './useStudentData';
export { useAnnouncements, useCreateAnnouncement } from './useAnnouncements';
export { useCreateClass, useCreateUser, useUploadMaterial, useUpsertGrades } from './useClassActions';
export { useGeneratePayment } from './usePayment';
export type { ManagerKPI } from './useManagerData';
