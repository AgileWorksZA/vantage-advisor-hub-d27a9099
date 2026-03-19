import { useState, useMemo, useEffect } from "react";
import { useRegion } from "@/contexts/RegionContext";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
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
  const { userId } = useKapableAuth();
  const { selectedRegion, formatCurrency } = useRegion();

  const [executedTrades, setExecutedTrades] = useState<TLHTradeRecord[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [dbOpportunities, setDbOpportunities] = useState<TLHOpportunityDemo[] | null>(null);
  const [isSeeded, setIsSeeded] = useState(false);
  const [isAutoSeeding, setIsAutoSeeding] = useState(false);
  const [hasAttemptedSeed, setHasAttemptedSeed] = useState(false);
  const [fetchCompleted, setFetchCompleted] = useState(false);

  // Try to fetch TLH opportunities from DB
  useEffect(() => {
    const fetchDbOpportunities = async () => {
      try {
        const { data, error } = await kapable
          .from('tlh_opportunities')
          .select('*')
          .eq('jurisdiction', selectedRegion)
          .eq('status', 'new')
          .eq('is_deleted', false);

        if (error) {
          console.warn('Failed to fetch TLH opportunities from DB:', error);
          return;
        }

        if (data && data.length > 0) {
          setIsSeeded(true);
          // Map DB records to TLHOpportunityDemo format for backward compatibility
          const mapped: TLHOpportunityDemo[] = data.map(opp => ({
            id: opp.id,
            clientName: opp.client_name,
            clientInitials: opp.client_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
            currentFund: {
              name: opp.current_fund_name,
              ticker: opp.current_ticker || '',
              isin: '',
              sector: 'Equity - Large Cap',
              fundType: 'ETF',
              expenseRatio: 0.10,
              morningstarRating: 4,
              return1Y: 8.0,
              return3Y: 10.0,
              return5Y: 9.0,
              sharpeRatio: 0.70,
              maxDrawdown: -18.0,
              riskRating: 'High' as const,
              exchange: selectedRegion === 'ZA' ? 'JSE' : selectedRegion === 'AU' ? 'ASX' : selectedRegion === 'GB' ? 'LSE' : selectedRegion === 'CA' ? 'TSX' : 'NYSE',
            },
            replacementFund: {
              name: opp.suggested_replacement_name || '',
              ticker: '',
              isin: '',
              sector: 'Equity - Large Cap',
              fundType: 'ETF',
              expenseRatio: 0.08,
              morningstarRating: 4,
              return1Y: 8.2,
              return3Y: 10.2,
              return5Y: 9.2,
              sharpeRatio: 0.72,
              maxDrawdown: -17.5,
              riskRating: 'High' as const,
              exchange: selectedRegion === 'ZA' ? 'JSE' : selectedRegion === 'AU' ? 'ASX' : selectedRegion === 'GB' ? 'LSE' : selectedRegion === 'CA' ? 'TSX' : 'NYSE',
            },
            purchaseValue: Number(opp.purchase_value) || 0,
            currentValue: Number(opp.current_value) || 0,
            unrealizedLoss: Number(opp.unrealized_gain_loss) || 0,
            costBasis: Number(opp.cost_basis) || 0,
            holdingPeriod: (opp.holding_period as 'short_term' | 'long_term') || 'short_term',
            washSaleOk: opp.wash_sale_ok ?? true,
            estimatedTaxSavings: Number(opp.estimated_tax_savings) || 0,
            jurisdiction: opp.jurisdiction || selectedRegion,
            correlation: 0.97,
            trackingError: 0.015,
            feeDifferential: -0.02,
            dbClientId: opp.client_id || undefined,
          }));
          setDbOpportunities(mapped);
        } else {
          setDbOpportunities(null);
        }
      } catch (err) {
        console.warn('Error fetching TLH data from DB:', err);
      } finally {
        setFetchCompleted(true);
      }
    };

    fetchDbOpportunities();
  }, [selectedRegion]);

  // Auto-seed: if fetch completed with no DB data and seeding hasn't been attempted
  useEffect(() => {
    if (!fetchCompleted || isSeeded || hasAttemptedSeed || isAutoSeeding) return;

    const autoSeed = async () => {
      setHasAttemptedSeed(true);
      setIsAutoSeeding(true);
      try {
        console.log('Auto-seeding TLH data...');
        // TODO: Replace with Kapable SSF
        console.warn('seed-tlh-clients: Kapable SSF not yet available — skipping auto-seed');
        
        // Re-fetch opportunities after seeding
        const { data: newData } = await kapable
          .from('tlh_opportunities')
          .select('*')
          .eq('jurisdiction', selectedRegion)
          .eq('status', 'new')
          .eq('is_deleted', false);

        if (newData && newData.length > 0) {
          setIsSeeded(true);
          const mapped: TLHOpportunityDemo[] = newData.map(opp => ({
            id: opp.id,
            clientName: opp.client_name,
            clientInitials: opp.client_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
            currentFund: {
              name: opp.current_fund_name,
              ticker: opp.current_ticker || '',
              isin: '',
              sector: 'Equity - Large Cap',
              fundType: 'ETF',
              expenseRatio: 0.10,
              morningstarRating: 4,
              return1Y: 8.0, return3Y: 10.0, return5Y: 9.0,
              sharpeRatio: 0.70, maxDrawdown: -18.0,
              riskRating: 'High' as const,
              exchange: selectedRegion === 'ZA' ? 'JSE' : selectedRegion === 'AU' ? 'ASX' : selectedRegion === 'GB' ? 'LSE' : selectedRegion === 'CA' ? 'TSX' : 'NYSE',
            },
            replacementFund: {
              name: opp.suggested_replacement_name || '',
              ticker: '', isin: '',
              sector: 'Equity - Large Cap',
              fundType: 'ETF',
              expenseRatio: 0.08,
              morningstarRating: 4,
              return1Y: 8.2, return3Y: 10.2, return5Y: 9.2,
              sharpeRatio: 0.72, maxDrawdown: -17.5,
              riskRating: 'High' as const,
              exchange: selectedRegion === 'ZA' ? 'JSE' : selectedRegion === 'AU' ? 'ASX' : selectedRegion === 'GB' ? 'LSE' : selectedRegion === 'CA' ? 'TSX' : 'NYSE',
            },
            purchaseValue: Number(opp.purchase_value) || 0,
            currentValue: Number(opp.current_value) || 0,
            unrealizedLoss: Number(opp.unrealized_gain_loss) || 0,
            costBasis: Number(opp.cost_basis) || 0,
            holdingPeriod: (opp.holding_period as 'short_term' | 'long_term') || 'short_term',
            washSaleOk: opp.wash_sale_ok ?? true,
            estimatedTaxSavings: Number(opp.estimated_tax_savings) || 0,
            jurisdiction: opp.jurisdiction || selectedRegion,
            correlation: 0.97,
            trackingError: 0.015,
            feeDifferential: -0.02,
            dbClientId: opp.client_id || undefined,
          }));
          setDbOpportunities(mapped);
        }
      } catch (err) {
        console.warn('Auto-seed failed:', err);
      } finally {
        setIsAutoSeeding(false);
      }
    };

    autoSeed();
  }, [fetchCompleted, isSeeded, hasAttemptedSeed, isAutoSeeding, selectedRegion]);

  // Use DB data if available, otherwise fall back to static
  const opportunities = useMemo(() => {
    const source = dbOpportunities || (tlhOpportunitiesByRegion[selectedRegion] || tlhOpportunitiesByRegion.ZA);
    return source.filter((opp) => !dismissedIds.has(opp.id));
  }, [selectedRegion, dismissedIds, dbOpportunities]);

  const dashboardMetrics = useMemo(() => {
    return getTLHDashboardMetrics(selectedRegion);
  }, [selectedRegion]);

  const totalUnrealizedLoss = useMemo(() => {
    return opportunities.reduce((sum, opp) => sum + opp.unrealizedLoss, 0);
  }, [opportunities]);

  const totalEstimatedSavings = useMemo(() => {
    return opportunities.reduce((sum, opp) => sum + opp.estimatedTaxSavings, 0);
  }, [opportunities]);

  const executeTrade = async (opportunity: TLHOpportunityDemo, replacementFund?: TLHOpportunityDemo["replacementFund"]) => {
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

    // Try to write to DB if we have DB-backed data
    if (isSeeded) {
      try {
        await kapable.from('tlh_trades').insert({
          user_id: userId,
          opportunity_id: opportunity.id,
          client_id: (opportunity as any).dbClientId || null,
          sell_fund_name: opportunity.currentFund.name,
          sell_ticker: opportunity.currentFund.ticker,
          sell_value: opportunity.currentValue,
          buy_fund_name: fund.name,
          buy_ticker: fund.ticker,
          buy_value: opportunity.currentValue,
          realized_loss: opportunity.unrealizedLoss,
          estimated_tax_saving: opportunity.estimatedTaxSavings,
          trade_type: 'switch',
          status: 'executed',
          jurisdiction: opportunity.jurisdiction,
        });

        // Update opportunity status
        await kapable
          .from('tlh_opportunities')
          .update({ status: 'executed', executed_at: new Date().toISOString() })
          .eq('id', opportunity.id);
      } catch (err) {
        console.warn('Failed to write trade to DB:', err);
      }
    }

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
    isSeeded,
    isAutoSeeding,
  };
}
