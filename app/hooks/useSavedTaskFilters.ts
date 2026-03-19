import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { toast } from "sonner";
import { TaskFilters } from "@/hooks/useTasksEnhanced";

export interface SavedTaskFilter {
  id: string;
  user_id: string;
  name: string;
  filters: TaskFilters;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useSavedTaskFilters = () => {
  const { userId } = useKapableAuth();
  const [savedFilters, setSavedFilters] = useState<SavedTaskFilter[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedFilters = useCallback(async () => {
    setLoading(true);
    try {
      if (!userId) return;

      const { data, error } = await kapable
        .from("saved_task_filters")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSavedFilters(
        (data || []).map((item: any) => ({
          ...item,
          filters: (typeof item.filters === "string" ? JSON.parse(item.filters) : item.filters) as TaskFilters,
        }))
      );
    } catch (err: any) {
      console.error("Error fetching saved filters:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveFilter = async (name: string, filters: TaskFilters) => {
    try {
      if (!userId) throw new Error("Not authenticated");

      const { error } = await kapable.from("saved_task_filters").insert({
        user_id: userId,
        name,
        filters: filters as any,
        is_default: false,
      });

      if (error) throw error;

      toast.success(`Filter "${name}" saved`);
      await fetchSavedFilters();
    } catch (err: any) {
      console.error("Error saving filter:", err);
      toast.error("Failed to save filter");
    }
  };

  const deleteFilter = async (id: string) => {
    try {
      const { error } = await kapable
        .from("saved_task_filters")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Filter deleted");
      setSavedFilters((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      console.error("Error deleting filter:", err);
      toast.error("Failed to delete filter");
    }
  };

  useEffect(() => {
    fetchSavedFilters();
  }, [fetchSavedFilters]);

  return { savedFilters, loading, saveFilter, deleteFilter, refetch: fetchSavedFilters };
};
