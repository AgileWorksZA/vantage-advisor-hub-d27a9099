import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientAsset {
  id: string;
  user_id: string;
  client_id: string;
  asset_type: string;
  name: string;
  current_value: number;
  purchase_value: number | null;
  purchase_date: string | null;
  growth_rate: number | null;
  linked_income_id: string | null;
  linked_liability_id: string | null;
  notes: string | null;
  is_portal_visible: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export const useClientAssets = (clientId: string) => {
  const [assets, setAssets] = useState<ClientAsset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("client_assets")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets((data || []) as ClientAsset[]);
    } catch (err) {
      console.error("Error fetching assets:", err);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const addAsset = useCallback(async (asset: Omit<ClientAsset, "id" | "user_id" | "created_at" | "updated_at" | "is_deleted">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_assets")
        .insert({ ...asset, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setAssets(prev => [data as ClientAsset, ...prev]);
      toast.success("Asset added");
      return data as ClientAsset;
    } catch (err) {
      console.error("Error adding asset:", err);
      toast.error("Failed to add asset");
      return null;
    }
  }, []);

  const updateAsset = useCallback(async (id: string, updates: Partial<ClientAsset>) => {
    try {
      const { error } = await supabase
        .from("client_assets")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      toast.success("Asset updated");
    } catch (err) {
      console.error("Error updating asset:", err);
      toast.error("Failed to update asset");
    }
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("client_assets")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      setAssets(prev => prev.filter(a => a.id !== id));
      toast.success("Asset deleted");
    } catch (err) {
      console.error("Error deleting asset:", err);
      toast.error("Failed to delete asset");
    }
  }, []);

  const getTotalAssets = useCallback(() => {
    return assets.reduce((sum, a) => sum + (a.current_value || 0), 0);
  }, [assets]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    addAsset,
    updateAsset,
    deleteAsset,
    getTotalAssets,
    refetch: fetchAssets,
  };
};
