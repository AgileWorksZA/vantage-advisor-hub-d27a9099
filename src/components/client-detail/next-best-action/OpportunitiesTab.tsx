import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRightLeft, Layers, Building2, Briefcase, Landmark, Receipt, Banknote } from "lucide-react";
import type { PrepOpportunity, PrepProduct } from "@/hooks/useClientMeetingPrep";

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

interface GapOpportunity {
  id: string;
  type: string;
  description: string;
  suggestedAction: string;
  clientName?: string;
  opportunitySize?: number;
  dateIdentified?: string;
}

const typeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  "Upsell": { label: "Growth", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  "Cross-sell": { label: "Cross-sell", color: "bg-cyan-100 text-cyan-700 border-cyan-200", icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
  "Migration": { label: "Migration", color: "bg-violet-100 text-violet-700 border-violet-200", icon: <Layers className="w-3.5 h-3.5" /> },
  "Platform": { label: "Platform", color: "bg-orange-100 text-orange-700 border-orange-200", icon: <Building2 className="w-3.5 h-3.5" /> },
  "New Business": { label: "New Business", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <Briefcase className="w-3.5 h-3.5" /> },
  "Bank Scrape": { label: "Bank Scrape", color: "bg-amber-100 text-amber-700 border-amber-200", icon: <Landmark className="w-3.5 h-3.5" /> },
  "Tax Loss": { label: "Tax Loss", color: "bg-rose-100 text-rose-700 border-rose-200", icon: <Receipt className="w-3.5 h-3.5" /> },
  "Idle Cash": { label: "Idle Cash", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Banknote className="w-3.5 h-3.5" /> },
};

const getConfig = (type: string) => {
  const key = Object.keys(typeConfig).find(k => type.toLowerCase().includes(k.toLowerCase()));
  return key ? typeConfig[key] : typeConfig["Upsell"];
};

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

function buildGapOpportunitiesForProducts(products: PrepProduct[], clientName?: string): GapOpportunity[] {
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
  return gaps;
}

function buildGapOpportunities(products: PrepProduct[], householdView?: boolean): GapOpportunity[] {
  if (householdView) {
    const memberMap = new Map<string, PrepProduct[]>();
    products.forEach(p => {
      const name = (p as any).clientName || "Unknown";
      if (!memberMap.has(name)) memberMap.set(name, []);
      memberMap.get(name)!.push(p);
    });
    const allGaps: GapOpportunity[] = [];
    memberMap.forEach((memberProducts, memberName) => {
      allGaps.push(...buildGapOpportunitiesForProducts(memberProducts, memberName));
    });
    return allGaps;
  }
  return buildGapOpportunitiesForProducts(products);
}

export function getOpportunitiesCount(opportunities: PrepOpportunity[], products: PrepProduct[], householdView?: boolean): number {
  return opportunities.length > 0 ? opportunities.length : buildGapOpportunities(products, householdView).length;
}

const ClientNameTag = ({ name }: { name: string }) => (
  <span className="text-[10px] px-1.5 py-0 rounded bg-muted text-muted-foreground font-medium">{name}</span>
);

const OpportunitiesTab = ({ opportunities, products, householdView, onOptimise, hasScanned, isScanning, onTaxLossClick, jurisdiction }: OpportunitiesTabProps) => {
  const gaps = opportunities.length === 0 ? buildGapOpportunities(products, householdView) : [];
  const items = opportunities.length > 0 ? opportunities : null;

  if (!items && gaps.length === 0) {
    return (
      <div className="flex flex-col items-center py-4 gap-2">
        <p className="text-xs text-muted-foreground text-center">No opportunities identified yet.</p>
      </div>
    );
  }

  if (items) {
    return (
      <div className="space-y-0">
        {items.map(opp => {
          const cfg = getConfig(opp.opportunityType);
          return (
            <div key={opp.id} className={`flex gap-2 py-1.5 border-b border-border/50 last:border-0 ${opp.opportunityType.toLowerCase().includes("tax loss") && onTaxLossClick ? "cursor-pointer hover:bg-muted/50 rounded" : ""}`} onClick={opp.opportunityType.toLowerCase().includes("tax loss") && onTaxLossClick ? onTaxLossClick : undefined}>
              <div className="shrink-0 mt-0.5 text-muted-foreground">{cfg.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={`${cfg.color} text-[10px] px-1.5 py-0 font-medium`}>{cfg.label}</Badge>
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
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {gaps.map(gap => {
        const cfg = getConfig(gap.type);
        return (
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
        );
      })}
    </div>
  );
};

export default OpportunitiesTab;
