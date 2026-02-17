import { useMemo } from "react";
import { useClients, type ClientListItem } from "@/hooks/useClients";
import { generateClient360Data } from "@/data/regional360ViewData";
import { getOpportunityPriority, type Priority } from "@/lib/opportunity-priority";
import { buildGapOpportunities, type GapOpportunity } from "@/components/client-detail/next-best-action/OpportunitiesTab";

export interface SegmentBoundary {
  label: string;
  min: number;
  max: number;
}

export interface ClientCategoryItem {
  clientId: string;
  clientName: string;
  opportunities: GapOpportunity[];
  totalValue: number;
  status: Priority;
  segmentLabel: string;
}

export interface SegmentMatrix {
  [segmentLabel: string]: {
    [priority: string]: { count: number; value: number };
  };
}

/** Parse a regional range string like "R0 – R100 000" or "> R10M" into numeric bounds */
export function parseSegmentBoundaries(ranges: { range: string }[]): SegmentBoundary[] {
  return ranges.map((r) => {
    const raw = r.range;

    // Handle "> X" pattern
    if (raw.startsWith(">")) {
      const numStr = raw.replace(/^>\s*/, "").replace(/[^0-9.KMkm]/g, "");
      return { label: raw, min: parseNumericValue(numStr), max: Infinity };
    }

    // Split on " – " (en-dash) or " - " (hyphen)
    const parts = raw.split(/\s*[–-]\s*/);
    if (parts.length === 2) {
      const minStr = parts[0].replace(/[^0-9.KMkm]/g, "");
      const maxStr = parts[1].replace(/[^0-9.KMkm]/g, "");
      return { label: raw, min: parseNumericValue(minStr), max: parseNumericValue(maxStr) };
    }

    return { label: raw, min: 0, max: Infinity };
  });
}

function parseNumericValue(s: string): number {
  const upper = s.toUpperCase();
  if (upper.endsWith("M")) {
    return parseFloat(upper.replace("M", "")) * 1_000_000;
  }
  if (upper.endsWith("K")) {
    return parseFloat(upper.replace("K", "")) * 1_000;
  }
  return parseFloat(s.replace(/\s/g, "")) || 0;
}

function findSegmentLabel(portfolioValue: number, boundaries: SegmentBoundary[]): string {
  for (const seg of boundaries) {
    if (portfolioValue >= seg.min && portfolioValue <= seg.max) return seg.label;
  }
  // Fallback to last segment
  return boundaries[boundaries.length - 1]?.label || "Unknown";
}

function categorizeClient(client: ClientListItem, boundaries: SegmentBoundary[]): ClientCategoryItem {
  const clientData = generateClient360Data(client.id, client.nationality, client.countryOfIssue);
  const products = [
    ...clientData.onPlatformProducts.map(p => ({ category: "Investment", currentValue: p.amountValue, productName: p.product } as any)),
    ...clientData.externalProducts.map(p => ({ category: "External Investment", currentValue: p.amountValue, productName: p.product, provider: p.provider } as any)),
    ...clientData.platformCashAccounts.map(p => ({ category: "Cash", currentValue: p.amountValue, productName: p.name } as any)),
    ...clientData.riskProducts.map(p => ({ category: "Risk/Insurance", currentValue: 0, productName: p.holdingName } as any)),
  ];
  const gaps = buildGapOpportunities(products, false, client.id);
  const totalValue = gaps.reduce((sum, g) => sum + (g.opportunitySize || 0), 0);
  const types = gaps.map(g => g.type);

  let status: Priority = "routine";
  if (types.some(t => getOpportunityPriority(t) === "urgent")) status = "urgent";
  else if (types.some(t => getOpportunityPriority(t) === "important")) status = "important";

  const portfolioValue = products.reduce((sum: number, p: any) => sum + (p.currentValue || 0), 0);
  const segmentLabel = findSegmentLabel(portfolioValue, boundaries);
  const clientName = client.client;

  return { clientId: client.id, clientName, opportunities: gaps, totalValue, status, segmentLabel };
}

const PRIORITIES: Priority[] = ["urgent", "important", "routine"];

function getEmptyMatrix(boundaries: SegmentBoundary[]): SegmentMatrix {
  const m: SegmentMatrix = {};
  for (const seg of boundaries) {
    m[seg.label] = {};
    for (const p of PRIORITIES) {
      m[seg.label][p] = { count: 0, value: 0 };
    }
  }
  return m;
}

export function useClientOpportunityCategories(segmentBoundaries?: SegmentBoundary[]) {
  const { clients, loading } = useClients();

  const defaultBoundaries: SegmentBoundary[] = useMemo(() => [
    { label: "0 - 1M", min: 0, max: 999_999 },
    { label: "1M - 5M", min: 1_000_000, max: 4_999_999 },
    { label: "> 5M", min: 5_000_000, max: Infinity },
  ], []);

  const boundaries = segmentBoundaries || defaultBoundaries;

  const { categories, matrix } = useMemo(() => {
    const urgent: ClientCategoryItem[] = [];
    const important: ClientCategoryItem[] = [];
    const routine: ClientCategoryItem[] = [];
    const m = getEmptyMatrix(boundaries);

    (clients || []).forEach(client => {
      const item = categorizeClient(client, boundaries);
      if (item.status === "urgent") urgent.push(item);
      else if (item.status === "important") important.push(item);
      else routine.push(item);

      if (m[item.segmentLabel]) {
        m[item.segmentLabel][item.status].count++;
        m[item.segmentLabel][item.status].value += item.totalValue;
      }
    });

    urgent.sort((a, b) => b.totalValue - a.totalValue);
    important.sort((a, b) => b.totalValue - a.totalValue);
    routine.sort((a, b) => b.totalValue - a.totalValue);

    return { categories: { urgent, important, routine }, matrix: m };
  }, [clients, boundaries]);

  return { categories, matrix, loading };
}
