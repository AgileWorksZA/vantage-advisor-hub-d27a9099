import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";

export const useWhatsAppFavourites = () => {
  const { userId } = useKapableAuth();
  const [favouriteClientIds, setFavouriteClientIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavourites = useCallback(async () => {
    try {
      if (!userId) return;

      const { data, error } = await kapable
        .from("whatsapp_favourites")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      setFavouriteClientIds((data || []).map(d => d.client_id));
    } catch (err) {
      console.error("Error fetching favourites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavourite = async (clientId: string) => {
    try {
      if (!userId) return;

      if (favouriteClientIds.includes(clientId)) {
        await kapable
          .from("whatsapp_favourites")
          .delete()
          .eq("user_id", userId)
          .eq("client_id", clientId);
        setFavouriteClientIds(prev => prev.filter(id => id !== clientId));
      } else {
        await kapable
          .from("whatsapp_favourites")
          .insert({ user_id: userId, client_id: clientId });
        setFavouriteClientIds(prev => [...prev, clientId]);
      }
    } catch (err) {
      console.error("Error toggling favourite:", err);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  return { favouriteClientIds, loading, toggleFavourite, refetch: fetchFavourites };
};
