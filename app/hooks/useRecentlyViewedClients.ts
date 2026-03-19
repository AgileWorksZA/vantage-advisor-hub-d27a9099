import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";

export const useRecentlyViewedClients = () => {
  const [recentClientIds, setRecentClientIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useKapableAuth();

  const fetchRecentViews = useCallback(async () => {
    if (!userId) {
      setRecentClientIds([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await kapable
        .from("client_views")
        .select("*")
        .eq("user_id", userId)
        .order("viewed_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching recent views:", error);
        setRecentClientIds([]);
      } else {
        setRecentClientIds(data?.map((row: any) => row.client_id) || []);
      }
    } catch (err) {
      console.error("Error fetching recent views:", err);
      setRecentClientIds([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecentViews();
  }, [fetchRecentViews]);

  const recordView = useCallback(async (clientId: string) => {
    if (!userId) return;

    try {
      // No native upsert — check existing then create/update
      const { data: existing } = await kapable
        .from("client_views")
        .select("*")
        .eq("user_id", userId)
        .eq("client_id", clientId)
        .maybeSingle();

      if (existing) {
        await kapable
          .from("client_views")
          .update({ viewed_at: new Date().toISOString() })
          .eq("id", (existing as any).id);
      } else {
        await kapable
          .from("client_views")
          .insert({
            user_id: userId,
            client_id: clientId,
            viewed_at: new Date().toISOString(),
          });
      }
    } catch (err) {
      console.error("Error recording client view:", err);
    }
  }, [userId]);

  return { recentClientIds, recordView, loading, refetch: fetchRecentViews };
};
