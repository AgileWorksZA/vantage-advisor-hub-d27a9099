import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";

export interface TaskTypeStandard {
  id: string;
  user_id: string;
  task_type: string;
  standard_execution_minutes: number;
  sla_hours: number;
  created_at: string;
}

export const useTaskTypeStandards = () => {
  const { userId } = useKapableAuth();
  const queryClient = useQueryClient();

  const { data: standards = [], isLoading } = useQuery({
    queryKey: ["task-type-standards"],
    queryFn: async () => {
      const { data, error } = await kapable
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
      if (!userId) throw new Error("Not authenticated");

      // Check if standard already exists (replacing upsert)
      const { data: existing } = await kapable
        .from("task_type_standards" as any)
        .select("*")
        .eq("user_id", userId)
        .eq("task_type", standard.task_type)
        .maybeSingle();

      if (existing) {
        const { data, error } = await kapable
          .from("task_type_standards" as any)
          .update({
            standard_execution_minutes: standard.standard_execution_minutes,
            sla_hours: standard.sla_hours,
          })
          .eq("id", (existing as any).id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await kapable
          .from("task_type_standards" as any)
          .insert({
            user_id: userId,
            task_type: standard.task_type,
            standard_execution_minutes: standard.standard_execution_minutes,
            sla_hours: standard.sla_hours,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-type-standards"] });
    },
  });

  return { standards, isLoading, getStandardForType, upsertStandard };
};
