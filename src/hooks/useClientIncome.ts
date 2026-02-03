import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientIncome {
  id: string;
  user_id: string;
  client_id: string;
  income_type: string;
  source_name: string;
  gross_amount: number;
  net_amount: number | null;
  frequency: string;
  is_taxable: boolean;
  linked_asset_id: string | null;
  start_date: string | null;
  end_date: string | null;
  is_portal_visible: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export const useClientIncome = (clientId: string) => {
  const [income, setIncome] = useState<ClientIncome[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncome = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("client_income")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIncome((data || []) as ClientIncome[]);
    } catch (err) {
      console.error("Error fetching income:", err);
      toast.error("Failed to load income");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const addIncome = useCallback(async (incomeData: Omit<ClientIncome, "id" | "user_id" | "created_at" | "updated_at" | "is_deleted">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_income")
        .insert({ ...incomeData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setIncome(prev => [data as ClientIncome, ...prev]);
      toast.success("Income added");
      return data as ClientIncome;
    } catch (err) {
      console.error("Error adding income:", err);
      toast.error("Failed to add income");
      return null;
    }
  }, []);

  const updateIncome = useCallback(async (id: string, updates: Partial<ClientIncome>) => {
    try {
      const { error } = await supabase
        .from("client_income")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setIncome(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
      toast.success("Income updated");
    } catch (err) {
      console.error("Error updating income:", err);
      toast.error("Failed to update income");
    }
  }, []);

  const deleteIncome = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("client_income")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      setIncome(prev => prev.filter(i => i.id !== id));
      toast.success("Income deleted");
    } catch (err) {
      console.error("Error deleting income:", err);
      toast.error("Failed to delete income");
    }
  }, []);

  const getMonthlyIncome = useCallback(() => {
    return income.reduce((sum, i) => {
      const amount = i.net_amount || i.gross_amount || 0;
      switch (i.frequency) {
        case "Weekly": return sum + (amount * 4.33);
        case "Bi-weekly": return sum + (amount * 2.17);
        case "Quarterly": return sum + (amount / 3);
        case "Annually": return sum + (amount / 12);
        default: return sum + amount;
      }
    }, 0);
  }, [income]);

  useEffect(() => {
    fetchIncome();
  }, [fetchIncome]);

  return {
    income,
    loading,
    addIncome,
    updateIncome,
    deleteIncome,
    getMonthlyIncome,
    refetch: fetchIncome,
  };
};
