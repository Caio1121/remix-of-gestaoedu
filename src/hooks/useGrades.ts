import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGrades = (studentId?: string) =>
  useQuery({
    queryKey: ["student-grades", studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from("grades")
        .select("*, classes(name)")
        .eq("studentid", studentId);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });

export const useUpsertGrades = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (grades: {
      studentid: string;
      classid: string;
      av1?: number | null;
      av2?: number | null;
      av3?: number | null;
      gradevalue?: number | null;
    }[]) => {
      const { data, error } = await supabase
        .from("grades")
        .upsert(grades, { onConflict: "studentid,classid" })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-students"] });
      queryClient.invalidateQueries({ queryKey: ["student-grades"] });
    },
  });
};
