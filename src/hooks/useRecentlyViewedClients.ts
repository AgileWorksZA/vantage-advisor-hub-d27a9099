import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRecentlyViewedClients = () => {
  const [recentClientIds, setRecentClientIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentViews = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRecentClientIds([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("client_views")
        .select("client_id, viewed_at")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching recent views:", error);
        setRecentClientIds([]);
      } else {
        setRecentClientIds(data?.map((row) => row.client_id) || []);
      }
    } catch (err) {
      console.error("Error fetching recent views:", err);
      setRecentClientIds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentViews();
  }, [fetchRecentViews]);

  const recordView = useCallback(async (clientId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("client_views")
        .upsert(
          {
            user_id: user.id,
            client_id: clientId,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,client_id" }
        );

      if (error) {
        console.error("Error recording client view:", error);
      }
    } catch (err) {
      console.error("Error recording client view:", err);
    }
  }, []);

  return { recentClientIds, recordView, loading, refetch: fetchRecentViews };
};
