import { useMemo } from "react";
import { useClients, type ClientListItem } from "@/hooks/useClients";
import { generateClient360Data } from "@/data/regional360ViewData";
import { getOpportunityPriority, type Priority } from "@/lib/opportunity-priority";
import { buildGapOpportunities, type GapOpportunity } from "@/components/client-detail/next-best-action/OpportunitiesTab";

export interface ClientCategoryItem {
  clientId: string;
  clientName: string;
  opportunities: GapOpportunity[];
  totalValue: number;
  status: Priority;
}

function categorizeClient(client: ClientListItem): ClientCategoryItem {
  const clientData = generateClient360Data(client.id, client.nationality, client.countryOfIssue);
  const products = [
    ...clientData.onPlatformProducts.map(p => ({ category: "Investment", currentValue: p.amountValue, productName: p.product } as any)),
    ...clientData.externalProducts.map(p => ({ category: "External Investment", currentValue: p.amountValue, productName: p.product, provider: p.provider } as any)),
    ...clientData.platformCashAccounts.map(p => ({ category: "Cash", currentValue: p.amountValue, productName: p.name } as any)),
    ...clientData.riskProducts.map(p => ({ category: "Risk/Insurance", currentValue: 0, productName: p.holdingName } as any)),
  ];
  const gaps = buildGapOpportunities(products);
  const totalValue = gaps.reduce((sum, g) => sum + (g.opportunitySize || 0), 0);
  const types = gaps.map(g => g.type);

  let status: Priority = "routine";
  if (types.some(t => getOpportunityPriority(t) === "urgent")) status = "urgent";
  else if (types.some(t => getOpportunityPriority(t) === "important")) status = "important";

  // Extract display name from "Surname, I (FirstName)" format
  const clientName = client.client;

  return { clientId: client.id, clientName, opportunities: gaps, totalValue, status };
}

export function useClientOpportunityCategories() {
  const { clients, loading } = useClients();

  const categories = useMemo(() => {
    const urgent: ClientCategoryItem[] = [];
    const important: ClientCategoryItem[] = [];
    const routine: ClientCategoryItem[] = [];

    (clients || []).forEach(client => {
      const item = categorizeClient(client);
      if (item.status === "urgent") urgent.push(item);
      else if (item.status === "important") important.push(item);
      else routine.push(item);
    });

    // Sort by totalValue descending within each category
    urgent.sort((a, b) => b.totalValue - a.totalValue);
    important.sort((a, b) => b.totalValue - a.totalValue);
    routine.sort((a, b) => b.totalValue - a.totalValue);

    return { urgent, important, routine };
  }, [clients]);

  return { categories, loading };
}
