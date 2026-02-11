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
}

interface GapOpportunity {
  id: string;
  type: string;
  description: string;
  suggestedAction: string;
  clientName?: string;
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

const formatCurrency = (value: number | null) => {
  if (!value) return null;
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(value);
};

function buildGapOpportunities(products: PrepProduct[]): GapOpportunity[] {
  const gaps: GapOpportunity[] = [];
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

  if (products.length < 3) {
    gaps.push({ id: "gap-newbiz", type: "New Business", description: `Client has only ${products.length} product${products.length !== 1 ? "s" : ""} — room to expand`, suggestedAction: "Explore new product opportunities" });
  }
  if (hasInvestments && !hasInsurance) {
    gaps.push({ id: "gap-cross", type: "Cross-sell", description: "Client has investments but no insurance products", suggestedAction: "Cross-sell insurance or risk cover" });
  }
  if (providers.size > 2) {
    gaps.push({ id: "gap-platform", type: "Platform", description: `Assets spread across ${providers.size} providers`, suggestedAction: "Consolidate to preferred platform" });
  }
  if (totalValue > 500000) {
    gaps.push({ id: "gap-upsell", type: "Upsell", description: `High-value portfolio (${formatCurrency(totalValue)}) with contribution room`, suggestedAction: "Drive additional contributions" });
  }
  if (hasBankOrSavings) {
    gaps.push({ id: "gap-bankscrape", type: "Bank Scrape", description: "Client has bank/savings products not linked to live feeds", suggestedAction: "Link bank feeds for real-time balance tracking" });
  }
  if (investmentValue > 200000) {
    gaps.push({ id: "gap-tlh", type: "Tax Loss", description: `Investment portfolio (${formatCurrency(investmentValue)}) may have harvesting opportunities`, suggestedAction: "Review portfolio for tax-loss harvesting" });
  }
  if (hasMoneyMarketOrCash) {
    gaps.push({ id: "gap-idlecash", type: "Idle Cash", description: "Idle cash in money market or call accounts", suggestedAction: "Deploy idle cash into growth assets" });
  }
  return gaps;
}

export function getOpportunitiesCount(opportunities: PrepOpportunity[], products: PrepProduct[]): number {
  return opportunities.length > 0 ? opportunities.length : buildGapOpportunities(products).length;
}

const ClientNameTag = ({ name }: { name: string }) => (
  <span className="text-[10px] px-1.5 py-0 rounded bg-muted text-muted-foreground font-medium">{name}</span>
);

const OpportunitiesTab = ({ opportunities, products, householdView, onOptimise, hasScanned, isScanning, onTaxLossClick }: OpportunitiesTabProps) => {
  const gaps = opportunities.length === 0 ? buildGapOpportunities(products) : [];
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
                      <span className="text-[10px] font-semibold text-emerald-600">{formatCurrency(opp.potentialRevenue)}</span>
                    )}
                  </div>
                  {opp.confidence && (
                    <span className="text-[10px] text-muted-foreground">{opp.confidence}%</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{opp.reasoning || opp.suggestedAction || opp.opportunityType}</p>
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
              </div>
              <p className="text-xs text-muted-foreground truncate">{gap.description}</p>
              <p className="text-xs text-[hsl(180,70%,45%)]">{gap.suggestedAction}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OpportunitiesTab;
