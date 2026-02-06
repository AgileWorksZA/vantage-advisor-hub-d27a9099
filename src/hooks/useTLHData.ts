import { useState, useMemo } from "react";
import { useRegion } from "@/contexts/RegionContext";
import { tlhOpportunitiesByRegion, getTLHDashboardMetrics, TLHOpportunityDemo, TLHDashboardMetrics } from "@/data/tlhDemoData";
import { toast } from "sonner";

export interface TLHTradeRecord {
  id: string;
  opportunityId: string;
  clientName: string;
  sellFundName: string;
  sellTicker: string;
  sellValue: number;
  buyFundName: string;
  buyTicker: string;
  buyValue: number;
  realizedLoss: number;
  estimatedTaxSaving: number;
  tradeType: "switch" | "sell_only";
  status: "pending" | "executed" | "settled" | "cancelled";
  executedAt: string;
  settledAt?: string;
}

export function useTLHData() {
  const { selectedRegion, formatCurrency } = useRegion();

  const [executedTrades, setExecutedTrades] = useState<TLHTradeRecord[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const opportunities = useMemo(() => {
    const regionOpps = tlhOpportunitiesByRegion[selectedRegion] || tlhOpportunitiesByRegion.ZA;
    return regionOpps.filter((opp) => !dismissedIds.has(opp.id));
  }, [selectedRegion, dismissedIds]);

  const dashboardMetrics = useMemo(() => {
    return getTLHDashboardMetrics(selectedRegion);
  }, [selectedRegion]);

  const totalUnrealizedLoss = useMemo(() => {
    return opportunities.reduce((sum, opp) => sum + opp.unrealizedLoss, 0);
  }, [opportunities]);

  const totalEstimatedSavings = useMemo(() => {
    return opportunities.reduce((sum, opp) => sum + opp.estimatedTaxSavings, 0);
  }, [opportunities]);

  const executeTrade = (opportunity: TLHOpportunityDemo, replacementFund?: TLHOpportunityDemo["replacementFund"]) => {
    const fund = replacementFund || opportunity.replacementFund;
    const trade: TLHTradeRecord = {
      id: `trade-${Date.now()}`,
      opportunityId: opportunity.id,
      clientName: opportunity.clientName,
      sellFundName: opportunity.currentFund.name,
      sellTicker: opportunity.currentFund.ticker,
      sellValue: opportunity.currentValue,
      buyFundName: fund.name,
      buyTicker: fund.ticker,
      buyValue: opportunity.currentValue,
      realizedLoss: opportunity.unrealizedLoss,
      estimatedTaxSaving: opportunity.estimatedTaxSavings,
      tradeType: "switch",
      status: "executed",
      executedAt: new Date().toISOString(),
    };

    setExecutedTrades((prev) => [...prev, trade]);
    setDismissedIds((prev) => new Set([...prev, opportunity.id]));
    toast.success(`Trade executed: Sold ${opportunity.currentFund.ticker}, Bought ${fund.ticker} for ${opportunity.clientName}`);
  };

  const dismissOpportunity = (opportunityId: string) => {
    setDismissedIds((prev) => new Set([...prev, opportunityId]));
    toast.info("Opportunity dismissed");
  };

  const executeBulk = (selectedOpps: TLHOpportunityDemo[]) => {
    selectedOpps.forEach((opp) => executeTrade(opp));
    toast.success(`${selectedOpps.length} trades executed successfully`);
  };

  return {
    opportunities,
    dashboardMetrics,
    totalUnrealizedLoss,
    totalEstimatedSavings,
    executedTrades,
    executeTrade,
    dismissOpportunity,
    executeBulk,
    formatCurrency,
    selectedRegion,
  };
}
