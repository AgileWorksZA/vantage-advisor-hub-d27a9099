import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientGoal {
  id: string;
  user_id: string;
  client_id: string;
  workflow_id: string | null;
  goal_name: string;
  description: string | null;
  goal_category: string;
  priority: string;
  target_amount: number;
  target_date: string | null;
  current_funding: number;
  funding_status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export const useClientGoals = (clientId: string, workflowId?: string) => {
  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      let query = supabase
        .from("client_goals")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (workflowId) {
        query = query.eq("workflow_id", workflowId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGoals((data || []) as ClientGoal[]);
    } catch (err) {
      console.error("Error fetching goals:", err);
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, [clientId, workflowId]);

  const addGoal = useCallback(async (goal: Omit<ClientGoal, "id" | "user_id" | "created_at" | "updated_at" | "is_deleted">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_goals")
        .insert({ ...goal, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setGoals(prev => [data as ClientGoal, ...prev]);
      toast.success("Goal added");
      return data as ClientGoal;
    } catch (err) {
      console.error("Error adding goal:", err);
      toast.error("Failed to add goal");
      return null;
    }
  }, []);

  const updateGoal = useCallback(async (id: string, updates: Partial<ClientGoal>) => {
    try {
      const { error } = await supabase
        .from("client_goals")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
      toast.success("Goal updated");
    } catch (err) {
      console.error("Error updating goal:", err);
      toast.error("Failed to update goal");
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("client_goals")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success("Goal deleted");
    } catch (err) {
      console.error("Error deleting goal:", err);
      toast.error("Failed to delete goal");
    }
  }, []);

  const getGoalsByCategory = useCallback(() => {
    const grouped: Record<string, ClientGoal[]> = {};
    goals.forEach(g => {
      if (!grouped[g.goal_category]) grouped[g.goal_category] = [];
      grouped[g.goal_category].push(g);
    });
    return grouped;
  }, [goals]);

  const getTotalTargetAmount = useCallback(() => {
    return goals.reduce((sum, g) => sum + (g.target_amount || 0), 0);
  }, [goals]);

  const getTotalCurrentFunding = useCallback(() => {
    return goals.reduce((sum, g) => sum + (g.current_funding || 0), 0);
  }, [goals]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoalsByCategory,
    getTotalTargetAmount,
    getTotalCurrentFunding,
    refetch: fetchGoals,
  };
};
