import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface AIOpportunity {
  clientId: string;
  clientName: string;
  currentValue: number;
  opportunityType: "upsell" | "cross-sell" | "migration" | "platform";
  potentialRevenue: number;
  confidence: number;
  reasoning: string;
  suggestedAction: string;
}

interface ClientWithProducts {
  id: string;
  firstName: string;
  surname: string;
  totalValue: number;
  productCount: number;
  providerCount: number;
  hasInvestments: boolean;
  hasInsurance: boolean;
  hasExternalProducts: boolean;
  products: Array<{
    id: string;
    currentValue: number | null;
    category: string | null;
    providerName: string | null;
    isLinked: boolean;
  }>;
}

// Opportunity multipliers based on project type
const opportunityMultipliers = {
  upsell: 0.05, // 5% of current value
  "cross-sell": 0.03, // 3% of current value
  migration: 0.03, // 3% of current value
  platform: 0.04, // 4% of current value
};

// Detection thresholds
const thresholds = {
  highValuePortfolio: 500000, // Minimum value for upsell consideration
  multiProviderCount: 2, // Number of providers for consolidation
  minConfidence: 60, // Minimum confidence to surface opportunity
};

// Suggested actions based on opportunity type
const suggestedActions: Record<string, string[]> = {
  upsell: [
    "Review portfolio for additional contribution opportunities",
    "Discuss tax-efficient investment strategies",
    "Present diversification options to expand holdings",
  ],
  "cross-sell": [
    "Schedule protection needs analysis meeting",
    "Present insurance gap assessment report",
    "Discuss risk management and coverage options",
  ],
  migration: [
    "Prepare house view performance comparison",
    "Present consolidation benefits analysis",
    "Discuss fee optimization through platform migration",
  ],
  platform: [
    "Propose platform consolidation strategy",
    "Present fee reduction analysis from consolidation",
    "Discuss streamlined portfolio management benefits",
  ],
};

// Reasoning templates based on opportunity type
const reasoningTemplates: Record<string, (client: ClientWithProducts) => string> = {
  upsell: (client) =>
    `Portfolio value of ${client.totalValue.toLocaleString()} with room for additional contributions. Strong candidate for portfolio expansion.`,
  "cross-sell": (client) =>
    `Client has investment products (${client.productCount} products) but no insurance coverage. Gap analysis shows protection need.`,
  migration: (client) =>
    `Client has ${client.products.filter(p => !p.isLinked).length} external platform products. Migration could improve performance and reduce fees.`,
  platform: (client) =>
    `Assets spread across ${client.providerCount} providers. Consolidation would streamline management and reduce costs.`,
};

// Calculate confidence based on various factors
const calculateConfidence = (client: ClientWithProducts, type: string): number => {
  let base = 70;

  // Higher value portfolios = higher confidence
  if (client.totalValue > 1000000) base += 10;
  if (client.totalValue > 2000000) base += 5;

  // More products = higher confidence for cross-sell/platform
  if ((type === "cross-sell" || type === "platform") && client.productCount > 2) {
    base += 5;
  }

  // External products = higher confidence for migration
  if (type === "migration" && client.hasExternalProducts) {
    base += 8;
  }

  // Cap at 95
  return Math.min(95, Math.max(thresholds.minConfidence, base));
};

// Get random suggested action for variety
const getRandomAction = (type: string): string => {
  const actions = suggestedActions[type] || suggestedActions.upsell;
  return actions[Math.floor(Math.random() * actions.length)];
};

export const useAIOpportunities = () => {
  const {
    data: clientsWithProducts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ai-opportunities-scan"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch clients with their products
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select(`
          id,
          first_name,
          surname,
          client_products(
            id,
            current_value,
            is_linked,
            status,
            products(
              name,
              product_categories(name),
              product_providers(name)
            )
          )
        `)
        .eq("user_id", user.id);

      if (clientsError) throw clientsError;

      // Transform to ClientWithProducts structure
      const processed: ClientWithProducts[] = (clients || []).map((client: any) => {
        const activeProducts = (client.client_products || []).filter(
          (p: any) => p.status === "Active"
        );

        const products = activeProducts.map((p: any) => ({
          id: p.id,
          currentValue: p.current_value,
          category: p.products?.product_categories?.name || null,
          providerName: p.products?.product_providers?.name || null,
          isLinked: p.is_linked,
        }));

        // Aggregate metrics
        const totalValue = products.reduce(
          (sum: number, p: any) => sum + (p.currentValue || 0),
          0
        );

        const uniqueProviders = new Set(
          products.map((p: any) => p.providerName).filter(Boolean)
        );

        const hasInvestments = products.some((p: any) =>
          ["Investment", "Endowment", "Preservation", "Living Annuity"].some(
            (cat) => p.category?.includes(cat)
          )
        );

        const hasInsurance = products.some((p: any) =>
          ["Life", "Insurance", "Protection", "Cover"].some(
            (cat) => p.category?.includes(cat)
          )
        );

        const hasExternalProducts = products.some((p: any) => !p.isLinked);

        return {
          id: client.id,
          firstName: client.first_name,
          surname: client.surname,
          totalValue,
          productCount: products.length,
          providerCount: uniqueProviders.size,
          hasInvestments,
          hasInsurance,
          hasExternalProducts,
          products,
        };
      });

      return processed;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Identify opportunities from client data
  const opportunities = useMemo<AIOpportunity[]>(() => {
    if (!clientsWithProducts) return [];

    const identified: AIOpportunity[] = [];

    for (const client of clientsWithProducts) {
      const clientName = `${client.firstName} ${client.surname}`;

      // Rule 1: Upsell - High value portfolios with room for growth
      if (
        client.totalValue >= thresholds.highValuePortfolio &&
        client.productCount > 0
      ) {
        const confidence = calculateConfidence(client, "upsell");
        if (confidence >= thresholds.minConfidence) {
          identified.push({
            clientId: client.id,
            clientName,
            currentValue: client.totalValue,
            opportunityType: "upsell",
            potentialRevenue: Math.round(
              client.totalValue * opportunityMultipliers.upsell
            ),
            confidence,
            reasoning: reasoningTemplates.upsell(client),
            suggestedAction: getRandomAction("upsell"),
          });
        }
      }

      // Rule 2: Cross-sell - Has investments but no insurance
      if (client.hasInvestments && !client.hasInsurance && client.totalValue > 100000) {
        const confidence = calculateConfidence(client, "cross-sell");
        if (confidence >= thresholds.minConfidence) {
          identified.push({
            clientId: client.id,
            clientName,
            currentValue: client.totalValue,
            opportunityType: "cross-sell",
            potentialRevenue: Math.round(
              client.totalValue * opportunityMultipliers["cross-sell"]
            ),
            confidence,
            reasoning: reasoningTemplates["cross-sell"](client),
            suggestedAction: getRandomAction("cross-sell"),
          });
        }
      }

      // Rule 3: Migration - Has external/unlinked products
      if (client.hasExternalProducts && client.totalValue > 200000) {
        const confidence = calculateConfidence(client, "migration");
        if (confidence >= thresholds.minConfidence) {
          identified.push({
            clientId: client.id,
            clientName,
            currentValue: client.totalValue,
            opportunityType: "migration",
            potentialRevenue: Math.round(
              client.totalValue * opportunityMultipliers.migration
            ),
            confidence,
            reasoning: reasoningTemplates.migration(client),
            suggestedAction: getRandomAction("migration"),
          });
        }
      }

      // Rule 4: Platform Consolidation - Multiple providers
      if (
        client.providerCount >= thresholds.multiProviderCount &&
        client.totalValue > 300000
      ) {
        const confidence = calculateConfidence(client, "platform");
        if (confidence >= thresholds.minConfidence) {
          identified.push({
            clientId: client.id,
            clientName,
            currentValue: client.totalValue,
            opportunityType: "platform",
            potentialRevenue: Math.round(
              client.totalValue * opportunityMultipliers.platform
            ),
            confidence,
            reasoning: reasoningTemplates.platform(client),
            suggestedAction: getRandomAction("platform"),
          });
        }
      }
    }

    // Sort by potential revenue descending
    return identified.sort((a, b) => b.potentialRevenue - a.potentialRevenue);
  }, [clientsWithProducts]);

  // Calculate counts by type
  const counts = useMemo(() => {
    const upsell = opportunities.filter((o) => o.opportunityType === "upsell").length;
    const crossSell = opportunities.filter((o) => o.opportunityType === "cross-sell").length;
    const migration = opportunities.filter((o) => o.opportunityType === "migration").length;
    const platform = opportunities.filter((o) => o.opportunityType === "platform").length;

    return {
      upsell,
      crossSell,
      migration,
      platform,
      atRisk: 0, // Placeholder for future implementation
      total: opportunities.length,
    };
  }, [opportunities]);

  // Filter by type
  const getOpportunitiesByType = (type: string): AIOpportunity[] => {
    if (type === "at-risk") return [];
    const typeMap: Record<string, AIOpportunity["opportunityType"]> = {
      upsell: "upsell",
      "cross-sell": "cross-sell",
      migration: "migration",
      platform: "platform",
    };
    return opportunities.filter((o) => o.opportunityType === typeMap[type]);
  };

  // Calculate total value for selected opportunities
  const calculateTotalValue = (clientIds: Set<string>): number => {
    return opportunities
      .filter((o) => clientIds.has(o.clientId))
      .reduce((sum, o) => sum + o.potentialRevenue, 0);
  };

  return {
    opportunities,
    counts,
    isLoading,
    error,
    refetch,
    getOpportunitiesByType,
    calculateTotalValue,
    hasOpportunities: opportunities.length > 0,
  };
};
