import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TaskHistoryEntry {
  id: string;
  task_id: string;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  changed_at: string;
}

export const useTaskHistory = (taskId?: string) => {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("task_history")
        .select("*")
        .eq("task_id", taskId)
        .order("changed_at", { ascending: false });

      if (error) throw error;

      setHistory(data || []);
    } catch (err: any) {
      console.error("Error fetching task history:", err);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const addHistoryEntry = async (action: string, fieldName?: string, oldValue?: string, newValue?: string) => {
    if (!taskId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("task_history")
        .insert({
          user_id: user.id,
          task_id: taskId,
          action,
          field_name: fieldName,
          old_value: oldValue,
          new_value: newValue,
          changed_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchHistory();
      return data;
    } catch (err: any) {
      console.error("Error adding history entry:", err);
      return null;
    }
  };

  return {
    history,
    loading,
    fetchHistory,
    addHistoryEntry,
  };
};
