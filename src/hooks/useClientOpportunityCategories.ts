import { useMemo } from "react";
import { useClients, type ClientListItem } from "@/hooks/useClients";
import { generateClient360Data } from "@/data/regional360ViewData";
import { getOpportunityPriority, type Priority } from "@/lib/opportunity-priority";
import { buildGapOpportunities, type GapOpportunity } from "@/components/client-detail/next-best-action/OpportunitiesTab";

export type Segment = "0-1m" | "1m-5m" | "gt5m";

export interface ClientCategoryItem {
  clientId: string;
  clientName: string;
  opportunities: GapOpportunity[];
  totalValue: number;
  status: Priority;
  segment: Segment;
}

export interface SegmentMatrix {
  [segment: string]: {
    [priority: string]: { count: number; value: number };
  };
}

function getSegment(portfolioValue: number): Segment {
  if (portfolioValue >= 5_000_000) return "gt5m";
  if (portfolioValue >= 1_000_000) return "1m-5m";
  return "0-1m";
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

  const portfolioValue = products.reduce((sum: number, p: any) => sum + (p.currentValue || 0), 0);
  const segment = getSegment(portfolioValue);
  const clientName = client.client;

  return { clientId: client.id, clientName, opportunities: gaps, totalValue, status, segment };
}

const SEGMENTS: Segment[] = ["0-1m", "1m-5m", "gt5m"];
const PRIORITIES: Priority[] = ["urgent", "important", "routine"];

function getEmptyMatrix(): SegmentMatrix {
  const m: SegmentMatrix = {};
  for (const seg of SEGMENTS) {
    m[seg] = {};
    for (const p of PRIORITIES) {
      m[seg][p] = { count: 0, value: 0 };
    }
  }
  return m;
}

export function useClientOpportunityCategories() {
  const { clients, loading } = useClients();

  const { categories, matrix } = useMemo(() => {
    const urgent: ClientCategoryItem[] = [];
    const important: ClientCategoryItem[] = [];
    const routine: ClientCategoryItem[] = [];
    const m = getEmptyMatrix();

    (clients || []).forEach(client => {
      const item = categorizeClient(client);
      if (item.status === "urgent") urgent.push(item);
      else if (item.status === "important") important.push(item);
      else routine.push(item);

      m[item.segment][item.status].count++;
      m[item.segment][item.status].value += item.totalValue;
    });

    urgent.sort((a, b) => b.totalValue - a.totalValue);
    important.sort((a, b) => b.totalValue - a.totalValue);
    routine.sort((a, b) => b.totalValue - a.totalValue);

    return { categories: { urgent, important, routine }, matrix: m };
  }, [clients]);

  return { categories, matrix, loading };
}
