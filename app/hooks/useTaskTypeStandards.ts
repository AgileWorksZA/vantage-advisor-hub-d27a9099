import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TaskTypeStandard {
  id: string;
  user_id: string;
  task_type: string;
  standard_execution_minutes: number;
  sla_hours: number;
  created_at: string;
}

export const useTaskTypeStandards = () => {
  const queryClient = useQueryClient();

  const { data: standards = [], isLoading } = useQuery({
    queryKey: ["task-type-standards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_type_standards" as any)
        .select("*")
        .order("task_type");

      if (error) throw error;
      return (data || []) as unknown as TaskTypeStandard[];
    },
  });

  const getStandardForType = (taskType: string): TaskTypeStandard | undefined => {
    return standards.find((s) => s.task_type === taskType);
  };

  const upsertStandard = useMutation({
    mutationFn: async (standard: { task_type: string; standard_execution_minutes: number; sla_hours: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await (supabase as any)
        .from("task_type_standards")
        .upsert(
          {
            user_id: user.id,
            task_type: standard.task_type,
            standard_execution_minutes: standard.standard_execution_minutes,
            sla_hours: standard.sla_hours,
          },
          { onConflict: "user_id,task_type" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-type-standards"] });
    },
  });

  return { standards, isLoading, getStandardForType, upsertStandard };
};
