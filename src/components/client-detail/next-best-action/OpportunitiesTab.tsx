import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PrepOpportunity, PrepProduct } from "@/hooks/useClientMeetingPrep";
import { getOpportunityPriority, type Priority } from "@/lib/opportunity-priority";
import { opportunityTypeConfig, getOpportunityConfig } from "@/lib/opportunity-detection";
import PrioritySectionHeader from "./PrioritySectionHeader";

/** Deterministic check: ~30% of clients are "green" (routine-only) */
export function isGreenClient(clientId: string): boolean {
  let hash = 0;
  for (let i = 0; i < clientId.length; i++) {
    hash = (hash * 31 + clientId.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 100) < 30;
}

const ROUTINE_TYPES = ["upsell", "migration", "bank scrape"];

// Re-export for backward compatibility
const typeConfig = opportunityTypeConfig;
const getConfig = getOpportunityConfig;

interface OpportunitiesTabProps {
  opportunities: PrepOpportunity[];
  products: PrepProduct[];
  householdView?: boolean;
  onOptimise?: () => void;
  hasScanned?: boolean;
  isScanning?: boolean;
  onTaxLossClick?: () => void;
  jurisdiction?: string;
}

export interface GapOpportunity {
  id: string;
  type: string;
  description: string;
  suggestedAction: string;
  clientName?: string;
  opportunitySize?: number;
  dateIdentified?: string;
}

const currencyMap: Record<string, { code: string; locale: string }> = {
  ZA: { code: "ZAR", locale: "en-ZA" },
  AU: { code: "AUD", locale: "en-AU" },
  CA: { code: "CAD", locale: "en-CA" },
  GB: { code: "GBP", locale: "en-GB" },
  US: { code: "USD", locale: "en-US" },
};

const formatCurrency = (value: number | null, jurisdiction?: string) => {
  if (!value) return null;
  const curr = currencyMap[jurisdiction || "ZA"] || currencyMap.ZA;
  return new Intl.NumberFormat(curr.locale, { style: "currency", currency: curr.code, maximumFractionDigits: 0 }).format(value);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

function buildGapOpportunitiesForProducts(products: PrepProduct[], clientName?: string, clientId?: string): GapOpportunity[] {
  const gaps: GapOpportunity[] = [];
  const suffix = clientName ? `-${clientName.replace(/\s/g, "")}` : "";
  const categories = products.map(p => p.category?.toLowerCase() || "");
  const hasInvestments = categories.some(c => c.includes("invest") || c.includes("retirement") || c.includes("saving") || c.includes("super") || c.includes("rrsp") || c.includes("sipp") || c.includes("ira") || c.includes("401"));
  const hasInsurance = categories.some(c => c.includes("insurance") || c.includes("life") || c.includes("risk"));
  const hasBankOrSavings = categories.some(c => c.includes("bank") || c.includes("saving") || c.includes("deposit") || c.includes("cash"));
  const hasMoneyMarketOrCash = categories.some(c => c.includes("money market") || c.includes("cash") || c.includes("call"));
  const providers = new Set(products.map(p => (p as any).provider || p.productName.split(" ")[0]).filter(Boolean));
  const totalValue = products.reduce((sum, p) => sum + (p.currentValue || 0), 0);
  const investmentValue = products.filter(p => {
    const cat = p.category?.toLowerCase() || "";
    return cat.includes("invest") || cat.includes("retirement") || cat.includes("saving") || cat.includes("super") || cat.includes("rrsp") || cat.includes("sipp") || cat.includes("ira") || cat.includes("401");
  }).reduce((sum, p) => sum + (p.currentValue || 0), 0);
  const cashValue = products.filter(p => {
    const cat = p.category?.toLowerCase() || "";
    return cat.includes("money market") || cat.includes("cash") || cat.includes("call");
  }).reduce((sum, p) => sum + (p.currentValue || 0), 0);

  const today = new Date().toISOString().split("T")[0];

  if (products.length < 3) {
    gaps.push({ id: `gap-newbiz${suffix}`, type: "New Business", description: `Client has only ${products.length} product${products.length !== 1 ? "s" : ""} — room to expand`, suggestedAction: "Explore new product opportunities", clientName, opportunitySize: Math.round(totalValue * 0.05), dateIdentified: today });
  }
  if (hasInvestments && !hasInsurance) {
    gaps.push({ id: `gap-cross${suffix}`, type: "Cross-sell", description: "Client has investments but no insurance products", suggestedAction: "Cross-sell insurance or risk cover", clientName, opportunitySize: Math.round(investmentValue * 0.03), dateIdentified: today });
  }
  if (providers.size > 2) {
    gaps.push({ id: `gap-platform${suffix}`, type: "Platform", description: `Assets spread across ${providers.size} providers`, suggestedAction: "Consolidate to preferred platform", clientName, opportunitySize: Math.round(totalValue * 0.03), dateIdentified: today });
  }
  if (totalValue > 500000) {
    gaps.push({ id: `gap-upsell${suffix}`, type: "Upsell", description: `High-value portfolio with contribution room`, suggestedAction: "Drive additional contributions", clientName, opportunitySize: Math.round(totalValue * 0.05), dateIdentified: today });
  }
  if (hasBankOrSavings) {
    gaps.push({ id: `gap-bankscrape${suffix}`, type: "Bank Scrape", description: "Client has bank/savings products not linked to live feeds", suggestedAction: "Link bank feeds for real-time balance tracking", clientName, opportunitySize: 0, dateIdentified: today });
  }
  if (investmentValue > 200000) {
    gaps.push({ id: `gap-tlh${suffix}`, type: "Tax Loss", description: `Investment portfolio may have harvesting opportunities`, suggestedAction: "Review portfolio for tax-loss harvesting", clientName, opportunitySize: Math.round(investmentValue * 0.02), dateIdentified: today });
  }
  if (hasMoneyMarketOrCash) {
    gaps.push({ id: `gap-idlecash${suffix}`, type: "Idle Cash", description: "Idle cash in money market or call accounts", suggestedAction: "Deploy idle cash into growth assets", clientName, opportunitySize: Math.round(cashValue * 0.8), dateIdentified: today });
  }
  // Filter to routine-only for green clients
  if (clientId && isGreenClient(clientId)) {
    return gaps.filter(g => ROUTINE_TYPES.includes(g.type.toLowerCase()));
  }
  return gaps;
}

export function buildGapOpportunities(products: PrepProduct[], householdView?: boolean, clientId?: string): GapOpportunity[] {
  if (householdView) {
    const memberMap = new Map<string, PrepProduct[]>();
    products.forEach(p => {
      const name = (p as any).clientName || "Unknown";
      if (!memberMap.has(name)) memberMap.set(name, []);
      memberMap.get(name)!.push(p);
    });
    const allGaps: GapOpportunity[] = [];
    memberMap.forEach((memberProducts, memberName) => {
      allGaps.push(...buildGapOpportunitiesForProducts(memberProducts, memberName, clientId));
    });
    return allGaps;
  }
  return buildGapOpportunitiesForProducts(products, undefined, clientId);
}

export function getOpportunitiesCount(opportunities: PrepOpportunity[], products: PrepProduct[], householdView?: boolean, clientId?: string): number {
  return opportunities.length + buildGapOpportunities(products, householdView, clientId).length;
}

const ClientNameTag = ({ name }: { name: string }) => (
  <span className="text-[10px] px-1.5 py-0 rounded bg-muted text-muted-foreground font-medium">{name}</span>
);

interface ItemWithPriority {
  id: string;
  type: string;
  priority: Priority;
  render: React.ReactNode;
}

const OpportunitiesTab = ({ opportunities, products, householdView, onOptimise, hasScanned, isScanning, onTaxLossClick, jurisdiction }: OpportunitiesTabProps) => {
  const gaps = buildGapOpportunities(products, householdView);

  // Build unified list with priorities
  const allItems = useMemo(() => {
    const items: ItemWithPriority[] = [];

    opportunities.forEach(opp => {
      const cfg = getConfig(opp.opportunityType);
      const priority = getOpportunityPriority(opp.opportunityType);
      items.push({
        id: opp.id,
        type: opp.opportunityType,
        priority,
        render: (
          <div key={opp.id} className={`flex gap-2 py-1.5 border-b border-border/50 last:border-0 ${opp.opportunityType.toLowerCase().includes("tax loss") && onTaxLossClick ? "cursor-pointer hover:bg-muted/50 rounded" : ""}`} onClick={opp.opportunityType.toLowerCase().includes("tax loss") && onTaxLossClick ? onTaxLossClick : undefined}>
            <div className="shrink-0 mt-0.5 text-muted-foreground">{cfg.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className={`${cfg.color} text-[10px] px-1.5 py-0 font-medium`}>{cfg.label}</Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-1 py-0 font-medium">New</Badge>
                  {householdView && opp.clientName && <ClientNameTag name={opp.clientName} />}
                  {opp.potentialRevenue && (
                    <span className="text-[10px] font-semibold text-emerald-600">{formatCurrency(opp.potentialRevenue, jurisdiction)}</span>
                  )}
                </div>
                {opp.confidence && (
                  <span className="text-[10px] text-muted-foreground">{opp.confidence}%</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{opp.reasoning || opp.suggestedAction || opp.opportunityType}</p>
              {(opp as any).dateIdentified && (
                <p className="text-[10px] text-muted-foreground/70">{formatDate((opp as any).dateIdentified)}</p>
              )}
            </div>
          </div>
        ),
      });
    });

    gaps.forEach(gap => {
      const cfg = getConfig(gap.type);
      const priority = getOpportunityPriority(gap.type);
      items.push({
        id: gap.id,
        type: gap.type,
        priority,
        render: (
          <div key={gap.id} className={`flex gap-2 py-1.5 border-b border-border/50 last:border-0 ${gap.type.toLowerCase().includes("tax loss") && onTaxLossClick ? "cursor-pointer hover:bg-muted/50 rounded" : ""}`} onClick={gap.type.toLowerCase().includes("tax loss") && onTaxLossClick ? onTaxLossClick : undefined}>
            <div className="shrink-0 mt-0.5 text-muted-foreground">{cfg.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className={`${cfg.color} text-[10px] px-1.5 py-0 font-medium`}>{cfg.label}</Badge>
                {householdView && gap.clientName && <ClientNameTag name={gap.clientName} />}
                {gap.opportunitySize ? (
                  <span className="text-[10px] font-semibold text-emerald-600">{formatCurrency(gap.opportunitySize, jurisdiction)}</span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground truncate">{gap.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[hsl(180,70%,45%)]">{gap.suggestedAction}</p>
                {gap.dateIdentified && (
                  <span className="text-[10px] text-muted-foreground/70">{formatDate(gap.dateIdentified)}</span>
                )}
              </div>
            </div>
          </div>
        ),
      });
    });

    return items;
  }, [opportunities, gaps, householdView, onTaxLossClick, jurisdiction]);

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center py-4 gap-2">
        <p className="text-xs text-muted-foreground text-center">No opportunities identified yet.</p>
      </div>
    );
  }

  const urgent = allItems.filter(i => i.priority === "urgent");
  const important = allItems.filter(i => i.priority === "important");
  const routine = allItems.filter(i => i.priority === "routine");

  return (
    <div className="space-y-1">
      {urgent.length > 0 && (
        <div>
          <PrioritySectionHeader priority="urgent" count={urgent.length} />
          {urgent.map(i => i.render)}
        </div>
      )}
      {important.length > 0 && (
        <div>
          <PrioritySectionHeader priority="important" count={important.length} />
          {important.map(i => i.render)}
        </div>
      )}
      {routine.length > 0 && (
        <div>
          <PrioritySectionHeader priority="routine" count={routine.length} />
          {routine.map(i => i.render)}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesTab;
