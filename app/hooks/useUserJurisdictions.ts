import { useState, useEffect } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";

interface UseUserJurisdictionsResult {
  allowedJurisdictions: string[];
  isRestricted: boolean;
  loading: boolean;
}

export function useUserJurisdictions(): UseUserJurisdictionsResult {
  const { userId } = useKapableAuth();
  const [allowedJurisdictions, setAllowedJurisdictions] = useState<string[]>([]);
  const [isRestricted, setIsRestricted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchJurisdictions = async () => {
      try {
        if (!userId) {
          setLoading(false);
          return;
        }

        const { data, error } = await kapable
          .from("user_jurisdictions")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching user jurisdictions:", error);
          setLoading(false);
          return;
        }

        if (!cancelled) {
          if (data && data.length > 0) {
            setAllowedJurisdictions(data.map((r: any) => r.jurisdiction_code));
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

    // TODO: Replace with Kapable SSE in future sprint
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { allowedJurisdictions, isRestricted, loading };
}
