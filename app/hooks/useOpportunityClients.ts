import { useState, useEffect, useMemo } from "react";
import { kapable } from "@/integrations/kapable/client";
import { sampleNewOpportunities, NewOpportunityType, NewOpportunityClient } from "@/data/sampleNewOpportunities";

export interface EnrichedOpportunityClient extends NewOpportunityClient {
  dbClientId?: string;
}

export interface EnrichedOpportunityType extends Omit<NewOpportunityType, 'clients'> {
  clients: EnrichedOpportunityClient[];
}

export function useOpportunityClients() {
  const [clientMap, setClientMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClientMapping = async () => {
      try {
        // Collect all unique client names from opportunity data
        const allNames = sampleNewOpportunities.flatMap(opp =>
          opp.clients.map(c => c.name)
        );

        // We need to match by first_name + surname
        // Build surname list for efficient querying
        const surnameSet = new Set<string>();
        allNames.forEach(name => {
          const parts = name.split(' ');
          if (parts.length >= 2) {
            surnameSet.add(parts[parts.length - 1]);
          }
        });

        const { data: dbClients } = await kapable
          .from('clients')
          .select('*')
          .in('surname', Array.from(surnameSet));

        if (dbClients && dbClients.length > 0) {
          const map = new Map<string, string>();
          // Build a lookup of "FirstName Surname" -> UUID
          dbClients.forEach(c => {
            const fullName = `${c.first_name} ${c.surname}`;
            map.set(fullName.toLowerCase(), c.id);
          });
          setClientMap(map);
        }
      } catch (err) {
        console.warn('Failed to fetch opportunity client mapping:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientMapping();
  }, []);

  const enrichedOpportunities = useMemo((): EnrichedOpportunityType[] => {
    return sampleNewOpportunities.map(opp => ({
      ...opp,
      clients: opp.clients.map(client => {
        const dbClientId = clientMap.get(client.name.toLowerCase());
        return {
          ...client,
          dbClientId,
        };
      }),
    }));
  }, [clientMap]);

  return {
    enrichedOpportunities,
    clientMap,
    isLoading,
    isSeeded: clientMap.size > 0,
  };
}
