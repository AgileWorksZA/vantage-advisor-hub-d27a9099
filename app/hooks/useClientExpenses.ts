import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { toast } from "sonner";

export interface ClientExpense {
  id: string;
  user_id: string;
  client_id: string;
  expense_category: string;
  expense_type: string;
  name: string;
  amount: number;
  frequency: string;
  linked_liability_id: string | null;
  is_essential: boolean;
  is_portal_visible: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export const useClientExpenses = (clientId: string) => {
  const [expenses, setExpenses] = useState<ClientExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useKapableAuth();

  const fetchExpenses = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      const { data, error } = await kapable
        .from<ClientExpense>("client_expenses")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExpenses((data || []) as ClientExpense[]);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const addExpense = useCallback(async (expense: Omit<ClientExpense, "id" | "user_id" | "created_at" | "updated_at" | "is_deleted">) => {
    try {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from<ClientExpense>("client_expenses")
        .insert({ ...expense, user_id: userId })
        .single();

      if (error) throw error;
      setExpenses(prev => [data as ClientExpense, ...prev]);
      toast.success("Expense added");
      return data as ClientExpense;
    } catch (err) {
      console.error("Error adding expense:", err);
      toast.error("Failed to add expense");
      return null;
    }
  }, [userId]);

  const updateExpense = useCallback(async (id: string, updates: Partial<ClientExpense>) => {
    try {
      const { error } = await kapable
        .from<ClientExpense>("client_expenses")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
      toast.success("Expense updated");
    } catch (err) {
      console.error("Error updating expense:", err);
      toast.error("Failed to update expense");
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      const { error } = await kapable
        .from<ClientExpense>("client_expenses")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() } as any)
        .eq("id", id);

      if (error) throw error;
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast.success("Expense deleted");
    } catch (err) {
      console.error("Error deleting expense:", err);
      toast.error("Failed to delete expense");
    }
  }, []);

  const getMonthlyExpenses = useCallback(() => {
    return expenses.reduce((sum, e) => {
      const amount = e.amount || 0;
      switch (e.frequency) {
        case "Weekly": return sum + (amount * 4.33);
        case "Bi-weekly": return sum + (amount * 2.17);
        case "Quarterly": return sum + (amount / 3);
        case "Annually": return sum + (amount / 12);
        default: return sum + amount;
      }
    }, 0);
  }, [expenses]);

  const getEssentialExpenses = useCallback(() => {
    return expenses.filter(e => e.is_essential).reduce((sum, e) => {
      const amount = e.amount || 0;
      switch (e.frequency) {
        case "Weekly": return sum + (amount * 4.33);
        case "Bi-weekly": return sum + (amount * 2.17);
        case "Quarterly": return sum + (amount / 3);
        case "Annually": return sum + (amount / 12);
        default: return sum + amount;
      }
    }, 0);
  }, [expenses]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    getMonthlyExpenses,
    getEssentialExpenses,
    refetch: fetchExpenses,
  };
};
