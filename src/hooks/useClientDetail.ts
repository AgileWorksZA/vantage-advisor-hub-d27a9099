import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";

export const useClientDetail = (clientId: string | undefined) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = async () => {
    if (!clientId) {
      setLoading(false);
      setError("No client ID provided");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        setError("Client not found");
        setClient(null);
      } else {
        setClient(data);
      }
    } catch (err) {
      console.error("Error fetching client:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch client");
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (updates: Partial<Client>) => {
    if (!clientId || !client) return;

    try {
      const { error: updateError } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", clientId);

      if (updateError) throw updateError;

      // Refresh client data after update
      await fetchClient();
      return true;
    } catch (err) {
      console.error("Error updating client:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  return { client, loading, error, refetch: fetchClient, updateClient };
};
