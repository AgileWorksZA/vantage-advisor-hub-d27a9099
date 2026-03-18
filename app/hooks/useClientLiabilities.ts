import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientLiability {
  id: string;
  user_id: string;
  client_id: string;
  liability_type: string;
  name: string;
  original_amount: number;
  current_balance: number;
  interest_rate: number | null;
  monthly_payment: number | null;
  term_months: number | null;
  start_date: string | null;
  end_date: string | null;
  linked_asset_id: string | null;
  creditor_name: string | null;
  is_portal_visible: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export const useClientLiabilities = (clientId: string) => {
  const [liabilities, setLiabilities] = useState<ClientLiability[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiabilities = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("client_liabilities")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLiabilities((data || []) as ClientLiability[]);
    } catch (err) {
      console.error("Error fetching liabilities:", err);
      toast.error("Failed to load liabilities");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const addLiability = useCallback(async (liability: Omit<ClientLiability, "id" | "user_id" | "created_at" | "updated_at" | "is_deleted">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_liabilities")
        .insert({ ...liability, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setLiabilities(prev => [data as ClientLiability, ...prev]);
      toast.success("Liability added");
      return data as ClientLiability;
    } catch (err) {
      console.error("Error adding liability:", err);
      toast.error("Failed to add liability");
      return null;
    }
  }, []);

  const updateLiability = useCallback(async (id: string, updates: Partial<ClientLiability>) => {
    try {
      const { error } = await supabase
        .from("client_liabilities")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setLiabilities(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
      toast.success("Liability updated");
    } catch (err) {
      console.error("Error updating liability:", err);
      toast.error("Failed to update liability");
    }
  }, []);

  const deleteLiability = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("client_liabilities")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      setLiabilities(prev => prev.filter(l => l.id !== id));
      toast.success("Liability deleted");
    } catch (err) {
      console.error("Error deleting liability:", err);
      toast.error("Failed to delete liability");
    }
  }, []);

  const getTotalLiabilities = useCallback(() => {
    return liabilities.reduce((sum, l) => sum + (l.current_balance || 0), 0);
  }, [liabilities]);

  useEffect(() => {
    fetchLiabilities();
  }, [fetchLiabilities]);

  return {
    liabilities,
    loading,
    addLiability,
    updateLiability,
    deleteLiability,
    getTotalLiabilities,
    refetch: fetchLiabilities,
  };
};
