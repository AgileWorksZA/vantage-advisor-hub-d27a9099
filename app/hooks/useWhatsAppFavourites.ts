import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWhatsAppFavourites = () => {
  const [favouriteClientIds, setFavouriteClientIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavourites = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("whatsapp_favourites")
        .select("client_id")
        .eq("user_id", user.id);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (favouriteClientIds.includes(clientId)) {
        await supabase
          .from("whatsapp_favourites")
          .delete()
          .eq("user_id", user.id)
          .eq("client_id", clientId);
        setFavouriteClientIds(prev => prev.filter(id => id !== clientId));
      } else {
        await supabase
          .from("whatsapp_favourites")
          .insert({ user_id: user.id, client_id: clientId });
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
