import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseUserJurisdictionsResult {
  allowedJurisdictions: string[];
  isRestricted: boolean;
  loading: boolean;
}

export function useUserJurisdictions(): UseUserJurisdictionsResult {
  const [allowedJurisdictions, setAllowedJurisdictions] = useState<string[]>([]);
  const [isRestricted, setIsRestricted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchJurisdictions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_jurisdictions")
          .select("jurisdiction_code")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching user jurisdictions:", error);
          setLoading(false);
          return;
        }

        if (!cancelled) {
          if (data && data.length > 0) {
            setAllowedJurisdictions(data.map((r) => r.jurisdiction_code));
            setIsRestricted(true);
          } else {
            setAllowedJurisdictions([]);
            setIsRestricted(false);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Error in useUserJurisdictions:", err);
        if (!cancelled) setLoading(false);
      }
    };

    fetchJurisdictions();

    // Re-fetch on auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchJurisdictions();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { allowedJurisdictions, isRestricted, loading };
}
