import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClientWithValue {
  id: string;
  name: string;
  email: string | null;
  currentValue: number;
  opportunityValue: number;
}

const opportunityMultipliers: Record<string, number> = {
  growth: 0.05,       // 5% upsell potential
  derisking: 0.02,    // 2% fee from risk management
  migration: 0.03,    // 3% from platform migration
  consolidation: 0.04, // 4% from consolidation
};

export const useClientOpportunityValues = (projectType: string, excludeClientIds: string[] = []) => {
  const multiplier = opportunityMultipliers[projectType] || 0.05;

  const clientsQuery = useQuery({
    queryKey: ["clients-with-values", projectType, excludeClientIds],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch clients
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, first_name, surname, email")
        .order("surname", { ascending: true });

      if (clientsError) throw clientsError;

      // Fetch client products for value aggregation
      const { data: products, error: productsError } = await supabase
        .from("client_products")
        .select("client_id, current_value")
        .eq("is_deleted", false);

      if (productsError) throw productsError;

      // Aggregate product values by client
      const valuesByClient: Record<string, number> = {};
      products?.forEach((p) => {
        if (p.client_id) {
          valuesByClient[p.client_id] = (valuesByClient[p.client_id] || 0) + (Number(p.current_value) || 0);
        }
      });

      // Map clients with calculated values
      const clientsWithValues: ClientWithValue[] = (clients || [])
        .filter(c => !excludeClientIds.includes(c.id))
        .map((client) => {
          const currentValue = valuesByClient[client.id] || 0;
          return {
            id: client.id,
            name: `${client.first_name} ${client.surname}`,
            email: client.email,
            currentValue,
            opportunityValue: Math.round(currentValue * multiplier),
          };
        })
        .filter(c => c.currentValue > 0); // Only show clients with portfolio value

      return clientsWithValues;
    },
  });

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    error: clientsQuery.error,
    refetch: clientsQuery.refetch,
  };
};
