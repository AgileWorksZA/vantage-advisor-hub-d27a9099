import { useState, useMemo, useCallback, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EChartsWrapper } from "@/components/ui/echarts-wrapper";
import { MultiSelect, MultiSelectGroup, EnrichedOption } from "@/components/ui/multi-select";
import FamilyTreeWidget from "./FamilyTreeWidget";
import { generateClient360Data, mapNationalityToJurisdiction, formatTotal } from "@/data/regional360ViewData";
import { getOutstandingDocsForRegion } from "@/data/documentTypes";
import { useClientRelationships } from "@/hooks/useClientRelationships";
import { Client, calculateAge, formatBirthday } from "@/types/client";
import { DraggableWidgetGrid } from "@/components/widgets/DraggableWidgetGrid";
import { useWidgetLayout, WidgetLayout } from "@/hooks/useWidgetLayout";
import { WidgetSettingsDialog, WidgetConfig } from "@/components/widgets/WidgetSettingsDialog";
import { PortfolioAnalysisWidget } from "@/components/dashboard/PortfolioAnalysisWidget";
import { useRegion } from "@/contexts/RegionContext";
import {
  Calendar, Gift, FileCheck, TrendingUp, TrendingDown, ArrowRight,
  Users, AlertTriangle, Clock, CheckCircle2, Target, Zap,
  ArrowRightLeft, Layers, Building2, Briefcase, Landmark, Receipt, Banknote,
  GripVertical, X, User, Shield, Phone, Mail, CircleCheckBig, UserPlus, Send,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import WorldMapSVG from "@/components/client-detail/WorldMapSVG";
import AddFamilyMemberDialog from "./AddFamilyMemberDialog";
import React from "react";

interface ClientDashboardTabProps {
  client: Client;
  clientId: string;
  onTabChange?: (tab: string) => void;
  userId?: string;
}

// --- Widget layout config ---
const defaultClientDashboardLayout: WidgetLayout[] = [
  { i: 'portfolio-overview', x: 0, y: 0, w: 3, h: 3 },
  { i: 'valuation-change', x: 3, y: 0, w: 3, h: 3 },
  { i: 'geo-diversification', x: 6, y: 0, w: 3, h: 3 },
  { i: 'family-tree', x: 0, y: 3, w: 3, h: 3 },
  { i: 'top-opportunities', x: 3, y: 3, w: 3, h: 3 },
  { i: 'opp-breakdown', x: 6, y: 3, w: 3, h: 3 },
  { i: 'opp-value-summary', x: 0, y: 6, w: 3, h: 3 },
  { i: 'action-priority', x: 3, y: 6, w: 3, h: 3 },
  { i: 'key-dates', x: 6, y: 6, w: 3, h: 3 },
  { i: 'advisor-accounts', x: 0, y: 9, w: 3, h: 3 },
  { i: 'outstanding-docs', x: 3, y: 9, w: 3, h: 3 },
  { i: 'client-portfolio', x: 6, y: 9, w: 3, h: 3 },
  { i: 'household-overview', x: 0, y: 12, w: 3, h: 3 },
  { i: 'onboarding-kyc', x: 3, y: 12, w: 3, h: 3 },
];

const CLIENT_DASHBOARD_WIDGETS: WidgetConfig[] = [
  { id: 'portfolio-overview', label: 'Portfolio Overview' },
  { id: 'valuation-change', label: 'Change in Valuation' },
  { id: 'geo-diversification', label: 'Geographic Diversification' },
  { id: 'family-tree', label: 'Family & Relationships' },
  { id: 'top-opportunities', label: 'Top Opportunities' },
  { id: 'opp-breakdown', label: 'Opportunity Breakdown' },
  { id: 'opp-value-summary', label: 'Opportunity Value Summary' },
  { id: 'action-priority', label: 'Action Priority' },
  { id: 'key-dates', label: 'Key Dates & Milestones' },
  { id: 'advisor-accounts', label: 'Current Advisor & Accounts' },
  { id: 'outstanding-docs', label: 'Outstanding Documents' },
  { id: 'client-portfolio', label: 'Client Portfolio' },
  { id: 'household-overview', label: 'Household' },
  { id: 'onboarding-kyc', label: 'Onboarding' },
];

const advisorData = [
  { type: "Primary", advisor: "Jordaan, Danile", relationship: "Owner", rating: "5", role: "Financial Planner" },
  { type: "Secondary", advisor: "Van Zyl, Christo", relationship: "Shared", rating: "4", role: "Investment Advisor" },
];

// outstandingDocs now sourced from getOutstandingDocsForRegion

// --- Helpers ---
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return () => {
    hash = ((hash << 13) ^ hash) - (hash >> 21);
    hash = hash & 0x7fffffff;
    return (hash % 10000) / 10000;
  };
}

interface GapOpportunity {
  id: string;
  type: string;
  description: string;
  suggestedAction: string;
  opportunitySize: number;
  dateIdentified: string;
  priority: "urgent" | "important" | "routine";
}

const typeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  "Upsell": { label: "Growth", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  "Cross-sell": { label: "Cross-sell", color: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400", icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
  "Migration": { label: "Migration", color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400", icon: <Layers className="w-3.5 h-3.5" /> },
  "Platform": { label: "Platform", color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400", icon: <Building2 className="w-3.5 h-3.5" /> },
  "New Business": { label: "New Business", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400", icon: <Briefcase className="w-3.5 h-3.5" /> },
  "Bank Scrape": { label: "Bank Scrape", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400", icon: <Landmark className="w-3.5 h-3.5" /> },
  "Tax Loss": { label: "Tax Loss", color: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400", icon: <Receipt className="w-3.5 h-3.5" /> },
  "Idle Cash": { label: "Idle Cash", color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <Banknote className="w-3.5 h-3.5" /> },
};

const getConfig = (type: string) => {
  const key = Object.keys(typeConfig).find(k => type.toLowerCase().includes(k.toLowerCase()));
  return key ? typeConfig[key] : typeConfig["Upsell"];
};

const ClientDashboardTab = ({ client, clientId, onTabChange, userId }: ClientDashboardTabProps) => {
  const navigate = useNavigate();
  const { selectedRegion } = useRegion();
  const { familyMembers, businesses, refetch } = useClientRelationships(clientId);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);
  const [showAllHousehold, setShowAllHousehold] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Widget layout persistence
  const { layout, onLayoutChange, hiddenWidgets, setHiddenWidgets, loading: layoutLoading } = useWidgetLayout({
    pageId: 'client-dashboard',
    defaultLayout: defaultClientDashboardLayout,
    userId,
  });

  const handleToggleWidget = useCallback((widgetId: string, visible: boolean) => {
    if (visible) {
      setHiddenWidgets(hiddenWidgets.filter(id => id !== widgetId));
    } else {
      setHiddenWidgets([...hiddenWidgets, widgetId]);
    }
  }, [hiddenWidgets, setHiddenWidgets]);

  const visibleLayout = useMemo(() =>
    layout.filter(item => !hiddenWidgets.includes(item.i)),
    [layout, hiddenWidgets]
  );

  const isWidgetVisible = useCallback((id: string) => !hiddenWidgets.includes(id), [hiddenWidgets]);

  const clientData = useMemo(() => {
    return generateClient360Data(clientId, client.nationality, client.country_of_issue);
  }, [clientId, client.nationality, client.country_of_issue]);

  const { currencySymbol } = clientData;

  const [valuationPeriod, setValuationPeriod] = useState<'6m' | '1y' | '3y' | '5y'>('1y');

  // Deterministic valuation data with period-specific sparklines
  const valuationData = useMemo(() => {
    const periodMultipliers: Record<string, number> = { '6m': 0.5, '1y': 1, '3y': 2.2, '5y': 3.5 };
    const mult = periodMultipliers[valuationPeriod];
    const rand = seededRandom(clientId + "-valuation-" + valuationPeriod);
    const totalInvestments = clientData.onPlatformProducts.reduce((s, p) => s + p.amountValue, 0) +
      clientData.externalProducts.reduce((s, p) => s + p.amountValue, 0) +
      clientData.platformCashAccounts.reduce((s, p) => s + p.amountValue, 0);
    const depositsWithdrawals = (rand() - 0.3) * totalInvestments * 0.1 * mult;
    const investmentReturns = totalInvestments * (0.04 + rand() * 0.08) * mult;
    const startingValue = totalInvestments - depositsWithdrawals - investmentReturns;

    const genSpark = (base: number, pct: number) => {
      const pts: number[] = [];
      for (let i = 0; i < 6; i++) pts.push(base * (1 + (pct / 100) * (i / 5) + (rand() - 0.5) * Math.abs(pct / 100) * 0.3));
      return pts;
    };

    const startPct = -((totalInvestments - startingValue) / startingValue) * 100 * (mult > 1 ? 0.5 : 1);
    const depPct = depositsWithdrawals >= 0 ? 2 + rand() * 5 * mult : -(2 + rand() * 5 * mult);
    const retPct = 4 + rand() * 8 * mult;
    const endPct = ((totalInvestments - startingValue) / startingValue) * 100;

    return {
      items: [
        { label: "Starting Value", value: startingValue, sparkData: genSpark(startingValue, startPct), changePct: +startPct.toFixed(1) },
        { label: "Deposits / Withdrawals", value: depositsWithdrawals, sparkData: genSpark(Math.abs(depositsWithdrawals) || 1, depPct), changePct: +depPct.toFixed(1), highlight: true },
        { label: "Investment Returns", value: investmentReturns, sparkData: genSpark(investmentReturns, retPct), changePct: +retPct.toFixed(1), highlight: true },
      ],
      endingValue: totalInvestments,
      endSparkData: genSpark(totalInvestments, endPct),
      endChangePct: +endPct.toFixed(1),
    };
  }, [clientId, clientData, valuationPeriod]);

  // Asset allocation data
  const assetAllocation = useMemo(() => {
    const rand = seededRandom(clientId + "-assets");
    const total = valuationData.endingValue || 1;
    const equities = 0.3 + rand() * 0.25;
    const fixedIncome = 0.15 + rand() * 0.15;
    const property = 0.05 + rand() * 0.1;
    const international = 0.1 + rand() * 0.15;
    const cash = Math.max(0, 1 - equities - fixedIncome - property - international);
    return [
      { name: "Equities", value: equities * total, pct: equities },
      { name: "Fixed Income", value: fixedIncome * total, pct: fixedIncome },
      { name: "Property", value: property * total, pct: property },
      { name: "International", value: international * total, pct: international },
      { name: "Cash", value: cash * total, pct: cash },
    ];
  }, [clientId, valuationData.endingValue]);

  // Geographic diversification – region-level with map coordinates
  const geoDiversification = useMemo(() => {
    const domestic = assetAllocation.filter(a => a.name !== "International").reduce((s, a) => s + a.pct, 0);
    const international = assetAllocation.find(a => a.name === "International")?.pct || 0;
    const intPct = Math.round(international * 100);
    const domPct = Math.round(domestic * 100);
    // Distribute international across regions proportionally
    return [
      { name: "South Africa", value: domPct, x: 53, y: 73, color: "hsl(180, 70%, 45%)" },
      { name: "North America", value: Math.round(intPct * 0.35), x: 20, y: 32, color: "hsl(180, 50%, 55%)" },
      { name: "Europe", value: Math.round(intPct * 0.30), x: 49, y: 22, color: "hsl(180, 60%, 50%)" },
      { name: "Asia Pacific", value: Math.round(intPct * 0.20), x: 78, y: 30, color: "hsl(180, 40%, 55%)" },
      { name: "UK", value: Math.round(intPct * 0.15), x: 43, y: 13, color: "hsl(180, 55%, 52%)" },
    ];
  }, [assetAllocation]);

  // All contracts for multi-select
  const allContracts = useMemo(() => {
    const contracts: { id: string; name: string; provider: string; value: number; category: string }[] = [];
    clientData.onPlatformProducts.forEach((p, i) => {
      contracts.push({ id: `on-${i}`, name: p.product, provider: p.investmentHouse, value: p.amountValue, category: "On-Platform" });
    });
    clientData.externalProducts.forEach((p, i) => {
      contracts.push({ id: `ext-${i}`, name: p.product, provider: p.provider, value: p.amountValue, category: "External" });
    });
    clientData.platformCashAccounts.forEach((p, i) => {
      contracts.push({ id: `cash-${i}`, name: p.name, provider: "Platform", value: p.amountValue, category: "Cash" });
    });
    clientData.riskProducts.forEach((p, i) => {
      contracts.push({ id: `risk-${i}`, name: p.holdingName, provider: p.holdingName, value: 0, category: "Risk" });
    });
    return contracts;
  }, [clientData]);

  // Household members for multi-select
  const householdMembers = useMemo(() => [
    ...familyMembers.map(f => ({ id: f.id, name: f.name, type: f.familyType, relatedClientId: f.relatedClientId })),
    ...businesses.map(b => ({ id: b.id, name: b.name, type: b.type, relatedClientId: b.relatedClientId })),
  ], [familyMembers, businesses]);

  // Build opportunities from products
  const opportunities = useMemo(() => {
    const gaps: GapOpportunity[] = [];
    const products = [
      ...clientData.onPlatformProducts.map(p => ({ category: "Investment", currentValue: p.amountValue, productName: p.product, provider: p.investmentHouse })),
      ...clientData.externalProducts.map(p => ({ category: "External Investment", currentValue: p.amountValue, productName: p.product, provider: p.provider })),
      ...clientData.platformCashAccounts.map(p => ({ category: "Cash", currentValue: p.amountValue, productName: p.name, provider: "Platform" })),
      ...clientData.riskProducts.map(p => ({ category: "Risk/Insurance", currentValue: 0, productName: p.holdingName, provider: p.holdingName })),
    ];
    const categories = products.map(p => p.category.toLowerCase());
    const hasInvestments = categories.some(c => c.includes("invest") || c.includes("retirement"));
    const hasInsurance = categories.some(c => c.includes("insurance") || c.includes("risk"));
    const hasMoneyMarketOrCash = categories.some(c => c.includes("cash"));
    const providers = new Set(products.map(p => p.provider).filter(Boolean));
    const totalValue = products.reduce((sum, p) => sum + (p.currentValue || 0), 0);
    const investmentValue = products.filter(p => p.category.toLowerCase().includes("invest")).reduce((sum, p) => sum + (p.currentValue || 0), 0);
    const cashValue = products.filter(p => p.category.toLowerCase().includes("cash")).reduce((sum, p) => sum + (p.currentValue || 0), 0);
    const today = new Date().toISOString().split("T")[0];

    if (products.length < 3) {
      gaps.push({ id: "gap-newbiz", type: "New Business", description: `Client has only ${products.length} product${products.length !== 1 ? "s" : ""} — room to expand`, suggestedAction: "Explore new product opportunities", opportunitySize: Math.round(totalValue * 0.05), dateIdentified: today, priority: "important" });
    }
    if (hasInvestments && !hasInsurance) {
      gaps.push({ id: "gap-cross", type: "Cross-sell", description: "Client has investments but no insurance products", suggestedAction: "Cross-sell insurance or risk cover", opportunitySize: Math.round(investmentValue * 0.03), dateIdentified: today, priority: "urgent" });
    }
    if (providers.size > 2) {
      gaps.push({ id: "gap-platform", type: "Platform", description: `Assets spread across ${providers.size} providers`, suggestedAction: "Consolidate to preferred platform", opportunitySize: Math.round(totalValue * 0.03), dateIdentified: today, priority: "important" });
    }
    if (totalValue > 500000) {
      gaps.push({ id: "gap-upsell", type: "Upsell", description: "High-value portfolio with contribution room", suggestedAction: "Drive additional contributions", opportunitySize: Math.round(totalValue * 0.05), dateIdentified: today, priority: "routine" });
    }
    if (investmentValue > 200000) {
      gaps.push({ id: "gap-tlh", type: "Tax Loss", description: "Investment portfolio may have harvesting opportunities", suggestedAction: "Review portfolio for tax-loss harvesting", opportunitySize: Math.round(investmentValue * 0.02), dateIdentified: today, priority: "urgent" });
    }
    if (hasMoneyMarketOrCash && cashValue > 0) {
      gaps.push({ id: "gap-idlecash", type: "Idle Cash", description: "Idle cash in money market or call accounts", suggestedAction: "Deploy idle cash into growth assets", opportunitySize: Math.round(cashValue * 0.8), dateIdentified: today, priority: "important" });
    }
    if (categories.some(c => c.includes("invest"))) {
      gaps.push({ id: "gap-migration", type: "Migration", description: "External investments could be migrated on-platform", suggestedAction: "Present migration benefits and fee comparison", opportunitySize: Math.round(totalValue * 0.02), dateIdentified: today, priority: "routine" });
    }
    return gaps;
  }, [clientData]);

  // Opportunity breakdown by type
  const opportunityBreakdown = useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    opportunities.forEach(o => {
      const cfg = getConfig(o.type);
      if (!map[cfg.label]) map[cfg.label] = { count: 0, value: 0 };
      map[cfg.label].count++;
      map[cfg.label].value += o.opportunitySize;
    });
    return Object.entries(map).map(([name, d]) => ({ name, count: d.count, value: d.value }));
  }, [opportunities]);

  // Summary metrics
  const summaryMetrics = useMemo(() => {
    const totalValue = opportunities.reduce((s, o) => s + o.opportunitySize, 0);
    const urgent = opportunities.filter(o => o.priority === "urgent").length;
    const important = opportunities.filter(o => o.priority === "important").length;
    return { totalValue, totalCount: opportunities.length, urgent, important };
  }, [opportunities]);

  // Key dates
  const keyDates = useMemo(() => {
    const dates: { label: string; date: string; icon: React.ReactNode }[] = [];
    if (client.date_of_birth) {
      dates.push({ label: "Birthday", date: formatBirthday(client.date_of_birth), icon: <Gift className="h-3.5 w-3.5 text-muted-foreground" /> });
    }
    const rand = seededRandom(clientId + "-dates");
    const reviewMonths = Math.floor(rand() * 6) + 1;
    const reviewDate = new Date();
    reviewDate.setMonth(reviewDate.getMonth() + reviewMonths);
    dates.push({ label: "Next Review", date: reviewDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), icon: <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> });
    const renewalMonths = Math.floor(rand() * 8) + 2;
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + renewalMonths);
    dates.push({ label: "Policy Renewal", date: renewalDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), icon: <FileCheck className="h-3.5 w-3.5 text-muted-foreground" /> });
    return dates;
  }, [client.date_of_birth, clientId]);

  const chartColors = [
    "hsl(180, 70%, 45%)", "hsl(210, 60%, 55%)", "hsl(30, 70%, 55%)",
    "hsl(150, 50%, 45%)", "hsl(260, 50%, 55%)", "hsl(0, 60%, 55%)",
    "hsl(45, 70%, 50%)", "hsl(330, 50%, 55%)",
  ];



  const oppBreakdownOption = useMemo(() => ({
    tooltip: { trigger: "item" as const, formatter: (p: any) => `${p.name}: ${p.data.count} (${currencySymbol} ${(p.value as number).toLocaleString()})` },
    legend: { bottom: 0, textStyle: { fontSize: 10 } },
    series: [{
      type: "pie" as const, radius: ["40%", "65%"], center: ["50%", "38%"],
      data: opportunityBreakdown.map((o, i) => ({ name: o.name, value: o.value, count: o.count, itemStyle: { color: chartColors[i % chartColors.length] } })),
      label: { show: false },
    }],
  }), [opportunityBreakdown, currencySymbol]);

  // Status dot helper for member icons
  const memberStatusIcon = useCallback((index: number) => (
    <span className="relative inline-flex">
      <User className="w-3.5 h-3.5 text-muted-foreground" />
      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background ${index % 3 === 2 ? "bg-amber-500" : "bg-emerald-500"}`} />
    </span>
  ), []);

  // Combined grouped options: contracts nested under each household member
  const filterGroups: MultiSelectGroup[] = useMemo(() => {
    const clientName = `${client.first_name} ${client.surname || ""}`.trim();
    const totalAssets = allContracts.reduce((s, c) => s + c.value, 0);

    // Main client group with all contracts
    const mainGroup: MultiSelectGroup = {
      label: `${clientName} (Main)`,
      options: [
        {
          value: "member:main",
          label: clientName,
          icon: memberStatusIcon(0),
          subtitle: `${currencySymbol} ${totalAssets.toLocaleString()}`,
        },
        ...allContracts.map(c => ({
          value: `contract:${c.id}`,
          label: `${c.name} (${c.category})`,
          icon: <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />,
          subtitle: c.value > 0 ? `${currencySymbol} ${c.value.toLocaleString()}` : undefined,
        })),
      ],
    };

    // Other household members (no contracts mapped to them)
    const memberGroups: MultiSelectGroup[] = householdMembers.map((m, i) => ({
      label: `${m.name} (${m.type})`,
      options: [
        {
          value: `member:${m.id}`,
          label: m.name,
          icon: memberStatusIcon(i + 1),
          subtitle: m.type,
        },
      ],
    }));

    return [mainGroup, ...memberGroups];
  }, [householdMembers, allContracts, currencySymbol, client.first_name, client.surname, memberStatusIcon]);

  // Auto-select all on mount / data change
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    const allValues = filterGroups.flatMap(g => g.options.map(o => o.value));
    if (allValues.length > 0 && !hasInitialized) {
      setSelectedFilters(allValues);
      setHasInitialized(true);
    }
  }, [filterGroups, hasInitialized]);

  // Custom trigger label
  const renderFilterLabel = useCallback((selected: string[], allOptions: EnrichedOption[]) => {
    if (selected.length === 0) return <span className="text-muted-foreground">Filter</span>;
    const memberCount = selected.filter(s => s.startsWith("member:")).length;
    const contractCount = selected.filter(s => s.startsWith("contract:")).length;
    const totalMembers = allOptions.filter(o => o.value.startsWith("member:")).length;
    const totalContracts = allOptions.filter(o => o.value.startsWith("contract:")).length;
    const isAll = memberCount === totalMembers && contractCount === totalContracts;
    const parts: string[] = [];
    if (memberCount > 0) parts.push(`${memberCount} Person${memberCount !== 1 ? "s" : ""}`);
    if (contractCount > 0) parts.push(`${contractCount} Contract${contractCount !== 1 ? "s" : ""}`);
    return <span>{isAll ? "All" : ""} {parts.join(", ")}</span>;
  }, []);

  // Selected member names for filter tags
  const clientName = `${client.first_name} ${client.surname || ""}`.trim();
  const selectedMemberTags = useMemo(() => {
    return selectedFilters
      .filter(f => f.startsWith("member:"))
      .map(f => {
        const id = f.replace("member:", "");
        if (id === "main") return { value: f, name: clientName };
        const member = householdMembers.find(m => m.id === id);
        return member ? { value: f, name: member.name } : null;
      })
      .filter(Boolean) as { value: string; name: string }[];
  }, [selectedFilters, householdMembers, clientName]);

  // Total asset value for family tree widget
  const totalAssetValue = useMemo(() =>
    allContracts.reduce((s, c) => s + c.value, 0), [allContracts]);

  // Priority groups
  const priorityGroups = useMemo(() => ({
    urgent: opportunities.filter(o => o.priority === "urgent"),
    important: opportunities.filter(o => o.priority === "important"),
    routine: opportunities.filter(o => o.priority === "routine"),
  }), [opportunities]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  // --- Client Portfolio widget data ---
  const portfolioProducts = useMemo(() => {
    const rand = seededRandom(clientId + "-portfolio-products");
    const colors = ["hsl(180, 70%, 45%)", "hsl(210, 60%, 55%)", "hsl(30, 70%, 55%)", "hsl(150, 50%, 45%)", "hsl(260, 50%, 55%)"];
    const products = [
      ...clientData.onPlatformProducts.map(p => ({ name: p.product, value: p.amountValue })),
      ...clientData.externalProducts.map(p => ({ name: p.product, value: p.amountValue })),
    ].sort((a, b) => b.value - a.value).slice(0, 5);
    return products.map((p, i) => ({
      ...p,
      color: colors[i % colors.length],
      growth: +(2 + rand() * 12 - 3).toFixed(1),
      sparkData: Array.from({ length: 6 }, () => p.value * (0.9 + rand() * 0.2)),
    }));
  }, [clientId, clientData]);

  const portfolioTotal = useMemo(() => valuationData.endingValue, [valuationData]);
  const portfolioMonthlyChange = useMemo(() => {
    const rand = seededRandom(clientId + "-monthly");
    return +(1.5 + rand() * 3).toFixed(1);
  }, [clientId]);

  // --- Household widget data ---
  const householdValues = useMemo(() => {
    const rand = seededRandom(clientId + "-household-values");
    const clientName = `${client.first_name} ${client.surname || ""}`.trim();
    const total = portfolioTotal;
    const colors = ["hsl(180, 70%, 45%)", "hsl(210, 60%, 55%)", "hsl(30, 70%, 55%)", "hsl(150, 50%, 45%)", "hsl(260, 50%, 55%)"];
    const members = [
      { name: clientName, role: "Primary", relatedClientId: null as string | null },
      ...householdMembers.slice(0, 4).map(m => ({ name: m.name, role: m.type === "Spouse" ? "Spouse" : m.type === "Child" ? "Child" : m.type, relatedClientId: m.relatedClientId || null })),
    ];
    const shares = members.map(() => rand());
    const shareTotal = shares.reduce((s, v) => s + v, 0);
    return members.map((m, i) => {
      const value = Math.round((shares[i] / shareTotal) * total);
      return {
        ...m,
        value,
        color: colors[i % colors.length],
        growth: +(2 + rand() * 10 - 2).toFixed(1),
        sparkData: Array.from({ length: 6 }, () => value * (0.9 + rand() * 0.2)),
      };
    });
  }, [clientId, client.first_name, client.surname, householdMembers, portfolioTotal]);

  const householdTotal = useMemo(() => householdValues.reduce((s, m) => s + m.value, 0), [householdValues]);
  const householdYtdGrowth = useMemo(() => {
    const rand = seededRandom(clientId + "-hh-ytd");
    return +(3 + rand() * 6).toFixed(1);
  }, [clientId]);

  // --- Onboarding widget data ---
  const onboardingStatus = useMemo(() => {
    const masked = (str: string | null | undefined, showLast = 4) => {
      if (!str) return "••••••••";
      return "••••" + str.slice(-showLast);
    };
    const truncEmail = (email: string | null | undefined) => {
      if (!email) return "••••@••••";
      const [local, domain] = email.split("@");
      return (local.length > 3 ? local.slice(0, 3) + "•••" : local) + "@" + domain;
    };
    return {
      fullName: `${client.first_name} ${client.surname || ""}`.trim(),
      idNumber: masked(client.id_number),
      email: truncEmail(client.email),
      phone: masked(client.cell_number),
      checks: [
        { label: "ID Number Verification", subtitle: "FICA Compliant", passed: true },
        { label: "Address Verification", subtitle: "Proof of Residence", passed: true },
        { label: "Bank Account Verification", subtitle: "Account Confirmed", passed: true },
      ],
    };
  }, [client]);

  // Sparkline helper for new widgets
  const renderSparkline = useCallback((data: number[], positive: boolean, width = 48, height = 16) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => `${(i * width) / (data.length - 1)},${height - ((v - min) / range) * height}`).join(" ");
    return (
      <svg width={width} height={height} className="shrink-0">
        <polyline points={points} fill="none" stroke={positive ? "hsl(152, 60%, 45%)" : "hsl(0, 70%, 55%)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar with multi-select dropdowns + settings gear */}
      <div className="flex items-center gap-3 flex-wrap">
        <MultiSelect
          groups={filterGroups}
          selected={selectedFilters}
          onChange={setSelectedFilters}
          placeholder="Filter"
          className="min-w-[220px]"
          renderTriggerLabel={renderFilterLabel}
        />
        {/* Filter tags for selected persons */}
        {selectedMemberTags.map(tag => (
          <Badge
            key={tag.value}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1 text-xs cursor-default"
          >
            <User className="w-3 h-3" />
            {tag.name}
            <button
              type="button"
              onClick={() => setSelectedFilters(prev => prev.filter(f => f !== tag.value))}
              className="ml-1 hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 text-xs gap-1" onClick={() => setAddMemberOpen(true)}>
            <Users className="h-3.5 w-3.5" /> Add Member
          </Button>
          <WidgetSettingsDialog widgets={CLIENT_DASHBOARD_WIDGETS} hiddenWidgets={hiddenWidgets} onToggleWidget={handleToggleWidget} />
        </div>
      </div>

      {/* Draggable Widget Grid */}
      {layoutLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="py-3 px-4">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Skeleton className="w-full h-[200px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
      <DraggableWidgetGrid layout={visibleLayout} onLayoutChange={onLayoutChange}>
        {/* Portfolio Overview */}
        {isWidgetVisible('portfolio-overview') && (
          <div key="portfolio-overview">
            <PortfolioAnalysisWidget
              region={selectedRegion}
              onClose={() => handleToggleWidget('portfolio-overview', false)}
            />
          </div>
        )}

        {/* Family Tree */}
        {isWidgetVisible('family-tree') && (
          <div key="family-tree">
            <FamilyTreeWidget
              client={client}
              familyMembers={familyMembers}
              businesses={businesses}
              totalAssetValue={totalAssetValue}
              currencySymbol={currencySymbol}
              onClose={() => handleToggleWidget('family-tree', false)}
            />
          </div>
        )}

        {/* Change in Valuation */}
        {isWidgetVisible('valuation-change') && (
          <div key="valuation-change">
            <Card className="h-full">
              <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                   <CardTitle className="text-sm font-medium">Change in Valuation</CardTitle>
                 </div>
                 <div className="flex items-center gap-1">
                   {(['6m', '1y', '3y', '5y'] as const).map(p => (
                     <button
                       key={p}
                       onClick={() => setValuationPeriod(p)}
                       className={`px-2 py-0.5 rounded text-[9px] transition-all duration-200 ${
                         valuationPeriod === p
                           ? 'bg-primary text-primary-foreground font-semibold'
                           : 'text-muted-foreground hover:bg-muted'
                       }`}
                     >{p.toUpperCase()}</button>
                   ))}
                   <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => handleToggleWidget('valuation-change', false)}><X className="w-4 h-4" /></Button>
                 </div>
               </CardHeader>
              <CardContent className="pt-1 space-y-2">
                {valuationData.items.map(item => {
                  const isPositive = item.highlight ? item.value >= 0 : item.changePct >= 0;
                  const sparkColor = isPositive ? 'hsl(152, 60%, 45%)' : 'hsl(0, 70%, 55%)';
                  const sparkPoints = item.sparkData;
                  const minV = Math.min(...sparkPoints);
                  const maxV = Math.max(...sparkPoints);
                  const range = maxV - minV || 1;
                  const polyPoints = sparkPoints.map((v, i) => `${i * 9.6},${14 - ((v - minV) / range) * 12}`).join(' ');
                  return (
                    <div key={item.label} className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <svg width="48" height="16" className="shrink-0">
                          <polyline points={polyPoints} fill="none" stroke={sparkColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={`text-[10px] font-semibold tabular-nums ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}{item.changePct}%
                        </span>
                        <span className={`text-sm font-medium flex items-center gap-1 ${item.highlight ? (item.value >= 0 ? "text-emerald-600" : "text-red-500") : ""}`}>
                          {item.highlight && (item.value >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
                          {formatTotal(item.value, currencySymbol)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {/* Ending Value */}
                {(() => {
                  const isPositive = valuationData.endChangePct >= 0;
                  const sparkColor = isPositive ? 'hsl(152, 60%, 45%)' : 'hsl(0, 70%, 55%)';
                  const sparkPoints = valuationData.endSparkData;
                  const minV = Math.min(...sparkPoints);
                  const maxV = Math.max(...sparkPoints);
                  const range = maxV - minV || 1;
                  const polyPoints = sparkPoints.map((v, i) => `${i * 9.6},${14 - ((v - minV) / range) * 12}`).join(' ');
                  return (
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs font-semibold">Ending Value</span>
                      <div className="flex items-center gap-2">
                        <svg width="48" height="16" className="shrink-0">
                          <polyline points={polyPoints} fill="none" stroke={sparkColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={`text-[10px] font-semibold tabular-nums ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}{valuationData.endChangePct}%
                        </span>
                        <span className="text-sm font-bold">{formatTotal(valuationData.endingValue, currencySymbol)}</span>
                      </div>
                    </div>
                  );
                })()}
                <Button variant="link" className="p-0 h-auto text-xs text-primary" onClick={() => onTabChange?.("performance")}>
                  View performance <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Geographic Diversification */}
        {isWidgetVisible('geo-diversification') && (
          <div key="geo-diversification">
            <Card className="h-full">
              <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                   <CardTitle className="text-sm font-medium">Geographic Diversification</CardTitle>
                 </div>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidget('geo-diversification', false)}><X className="w-4 h-4" /></Button>
               </CardHeader>
              <CardContent className="pt-0">
                <div className="relative h-[180px] w-full overflow-hidden rounded-md">
                  {/* High-fidelity world map */}
                  <WorldMapSVG className="absolute inset-0 w-full h-full" />
                  {/* Region markers */}
                  {geoDiversification.map((region) => {
                    const isLargest = region.value === Math.max(...geoDiversification.map(r => r.value));
                    const size = Math.max(8, Math.min(16, 6 + region.value * 0.25));
                    return (
                      <div
                        key={region.name}
                        className="absolute group"
                        style={{ left: `${region.x}%`, top: `${region.y}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        <div
                          className={`rounded-full border-2 border-white/60 dark:border-white/30 shadow-md ${isLargest ? 'animate-pulse' : ''}`}
                          style={{ width: size, height: size, backgroundColor: region.color }}
                        />
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 border border-border text-[10px] px-1.5 py-0.5 rounded shadow-sm pointer-events-none z-10">
                          {region.name}: {region.value}%
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Region legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
                  {geoDiversification.map((region) => (
                    <div key={region.name} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: region.color }} />
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {region.name} <span className="font-medium text-foreground">{region.value}%</span>
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="p-0 h-auto text-xs text-primary mt-1" onClick={() => onTabChange?.("360-view")}>
                  View diversification <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Opportunities */}
        {isWidgetVisible('top-opportunities') && (
          <div key="top-opportunities">
            <Card className="h-full">
              <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Target className="h-4 w-4 text-muted-foreground" />
                   <CardTitle className="text-sm font-medium">Top Opportunities</CardTitle>
                 </div>
                 <div className="flex items-center gap-1">
                   <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary">{opportunities.length}</Badge>
                   <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidget('top-opportunities', false)}><X className="w-4 h-4" /></Button>
                 </div>
               </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-0 max-h-[220px] overflow-auto">
                  {opportunities.slice(0, 5).map(opp => {
                    const cfg = getConfig(opp.type);
                    return (
                      <div key={opp.id} className="flex gap-2 py-1.5 border-b border-border/50 last:border-0">
                        <div className="shrink-0 mt-0.5 text-muted-foreground">{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className={`${cfg.color} text-[10px] px-1.5 py-0 font-medium`}>{cfg.label}</Badge>
                            {opp.opportunitySize > 0 && (
                              <span className="text-[10px] font-semibold text-emerald-600">{formatTotal(opp.opportunitySize, currencySymbol)}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{opp.description}</p>
                          <p className="text-xs text-primary">{opp.suggestedAction}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Opportunity Breakdown */}
        {isWidgetVisible('opp-breakdown') && (
          <div key="opp-breakdown">
            <Card className="h-full">
              <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                   <CardTitle className="text-sm font-medium">Opportunity Breakdown</CardTitle>
                 </div>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidget('opp-breakdown', false)}><X className="w-4 h-4" /></Button>
               </CardHeader>
              <CardContent className="pt-0">
                <EChartsWrapper option={oppBreakdownOption} height={200} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Opportunity Value Summary */}
        {isWidgetVisible('opp-value-summary') && (
          <div key="opp-value-summary">
            <Card className="h-full">
              <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Zap className="h-4 w-4 text-muted-foreground" />
                   <CardTitle className="text-sm font-medium">Opportunity Value Summary</CardTitle>
                 </div>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidget('opp-value-summary', false)}><X className="w-4 h-4" /></Button>
               </CardHeader>
              <CardContent className="pt-1 space-y-3">
                <div className="text-center py-2">
                  <p className="text-2xl font-bold text-primary">{formatTotal(summaryMetrics.totalValue, currencySymbol)}</p>
                  <p className="text-xs text-muted-foreground">Total Pipeline Value</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="text-lg font-semibold">{summaryMetrics.totalCount}</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-2">
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">{summaryMetrics.urgent}</p>
                    <p className="text-[10px] text-muted-foreground">Urgent</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-2">
                    <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">{summaryMetrics.important}</p>
                    <p className="text-[10px] text-muted-foreground">Important</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {opportunityBreakdown.map((o, i) => (
                    <div key={o.name} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{o.name}</span>
                      <span className="font-medium">{o.count} · {formatTotal(o.value, currencySymbol)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Priority */}
        {isWidgetVisible('action-priority') && (
          <div key="action-priority">
            <Card className="h-full">
              <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                   <CardTitle className="text-sm font-medium">Action Priority</CardTitle>
                 </div>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidget('action-priority', false)}><X className="w-4 h-4" /></Button>
               </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {([
                  { key: "urgent" as const, label: "Urgent", icon: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />, items: priorityGroups.urgent, dotColor: "bg-red-500" },
                  { key: "important" as const, label: "Important", icon: <Clock className="h-3.5 w-3.5 text-amber-500" />, items: priorityGroups.important, dotColor: "bg-amber-500" },
                  { key: "routine" as const, label: "Routine", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />, items: priorityGroups.routine, dotColor: "bg-emerald-500" },
                ]).map(group => (
                  <div key={group.key}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {group.icon}
                      <span className="text-xs font-semibold">{group.label}</span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0 ml-auto">{group.items.length}</Badge>
                    </div>
                    {group.items.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground pl-5">No items</p>
                    ) : (
                      group.items.map(opp => (
                        <div key={opp.id} className="flex items-center gap-2 pl-5 py-1 border-b border-border/30 last:border-0">
                          <div className={`w-1.5 h-1.5 rounded-full ${group.dotColor} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate">{opp.description}</p>
                          </div>
                          {opp.opportunitySize > 0 && (
                            <span className="text-[10px] text-emerald-600 font-medium whitespace-nowrap">{formatTotal(opp.opportunitySize, currencySymbol)}</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Key Dates & Milestones */}
        {isWidgetVisible('key-dates') && (
          <div key="key-dates">
            <Card className="h-full">
              <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                   <CardTitle className="text-sm font-medium">Key Dates & Milestones</CardTitle>
                 </div>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidget('key-dates', false)}><X className="w-4 h-4" /></Button>
               </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {keyDates.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
                      {d.icon}
                      <div className="flex-1">
                        <p className="text-xs font-medium">{d.label}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{d.date}</span>
                    </div>
                  ))}
                  {client.date_of_birth && (
                    <div className="flex items-center gap-2 py-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Age: <span className="font-medium text-foreground">{calculateAge(client.date_of_birth)}</span></span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Current Advisor & Accounts */}
        {isWidgetVisible('advisor-accounts') && (
          <div key="advisor-accounts">
            <Card className="h-full">
              <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                   <CardTitle className="text-sm font-medium">Current Advisor & Accounts</CardTitle>
                 </div>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidget('advisor-accounts', false)}><X className="w-4 h-4" /></Button>
               </CardHeader>
              <CardContent className="px-4 pb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-normal h-8 px-3">Primary/Advisor</TableHead>
                      <TableHead className="text-xs font-normal h-8 px-3">Relationship</TableHead>
                      <TableHead className="text-xs font-normal h-8 px-3">Risk Rating</TableHead>
                      <TableHead className="text-xs font-normal h-8 px-3">Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advisorData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm py-2 px-3">
                          <div>
                            <span className="text-xs text-muted-foreground">{row.type}</span>
                            <div>{client.advisor || row.advisor}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm py-2 px-3">{client.relationship || row.relationship}</TableCell>
                        <TableCell className="text-sm py-2 px-3">{client.rating || row.rating}</TableCell>
                        <TableCell className="text-sm py-2 px-3">{row.role}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Outstanding Documents */}
        {isWidgetVisible('outstanding-docs') && (() => {
          const regionalDocs = getOutstandingDocsForRegion(selectedRegion, clientId);
          const overdueCount = regionalDocs.filter(d => d.status === "Overdue").length;
          const pendingCount = regionalDocs.filter(d => d.status === "Pending").length;
          const dueSoonCount = regionalDocs.filter(d => d.status === "Due Soon").length;
          return (
          <div key="outstanding-docs">
            <Card className="h-full">
              <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">Outstanding Documents</CardTitle>
                </div>
                <div className="flex items-center gap-1.5">
                  {overdueCount > 0 && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{overdueCount} Overdue</Badge>}
                  {dueSoonCount > 0 && <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 text-white border-amber-500 hover:bg-amber-600">{dueSoonCount} Due Soon</Badge>}
                  {pendingCount > 0 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{pendingCount} Pending</Badge>}
                  <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 ml-1">
                    <Send className="w-3 h-3 mr-1" />Request All
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidget('outstanding-docs', false)}><X className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-0">
                  {(showAllDocs ? regionalDocs : regionalDocs.slice(0, 3)).map((doc, index) => {
                    const statusDotColor = doc.status === "Overdue"
                      ? "bg-destructive"
                      : doc.status === "Due Soon"
                        ? "bg-amber-500"
                        : "bg-blue-500";
                    const daysText = doc.daysOverdue > 0
                      ? `${doc.daysOverdue} days overdue`
                      : `Due in ${Math.abs(doc.daysOverdue)} days`;
                    const daysColor = doc.daysOverdue > 0 ? "text-destructive" : "text-muted-foreground";
                    const priorityVariant = doc.priority === "High" ? "destructive" : "outline";
                    return (
                      <div key={index} className="flex items-start gap-2.5 py-2 border-b border-border/50 last:border-0">
                        <div className={`w-2 h-2 rounded-full ${statusDotColor} shrink-0 mt-1.5`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{doc.document}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{doc.workflow}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] ${daysColor} whitespace-nowrap`}>{daysText}</span>
                          <Badge variant={priorityVariant} className="text-[10px] px-1.5 py-0">{doc.priority}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {regionalDocs.length > 3 && (
                  <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setShowAllDocs(!showAllDocs)}>
                    {showAllDocs ? "Show less" : `Show ${regionalDocs.length - 3} more`}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          );
        })()}

        {/* Client Portfolio */}
        {isWidgetVisible('client-portfolio') && (
          <div key="client-portfolio">
            <Card className="h-full">
              <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">Client Portfolio</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidget('client-portfolio', false)}><X className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-[80px] h-[80px] shrink-0">
                    <EChartsWrapper
                      option={{
                        series: [{
                          type: "pie" as const, radius: ["55%", "80%"], center: ["50%", "50%"],
                          data: assetAllocation.map((a, i) => ({ name: a.name, value: a.value, itemStyle: { color: chartColors[i % chartColors.length] } })),
                          label: { show: false }, silent: true,
                        }],
                        tooltip: { show: false },
                      }}
                      height={80}
                      transparent={false}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Value</p>
                    <p className="text-xl font-bold">{formatTotal(portfolioTotal, currencySymbol)}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      <span className="text-[10px] font-semibold text-emerald-600">+{portfolioMonthlyChange}% this month</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] text-muted-foreground">Performance (12 months)</p>
                    {renderSparkline(valuationData.endSparkData, valuationData.endChangePct >= 0, 64, 16)}
                    <span className={`text-[10px] font-semibold ${valuationData.endChangePct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {valuationData.endChangePct >= 0 ? '+' : ''}{valuationData.endChangePct}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  {(showAllPortfolio ? portfolioProducts : portfolioProducts.slice(0, 3)).map((p, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 border-b border-border/30 last:border-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-xs flex-1 truncate">{p.name}</span>
                      {renderSparkline(p.sparkData, p.growth >= 0, 40, 12)}
                      <span className="text-xs font-medium tabular-nums">{formatTotal(p.value, currencySymbol)}</span>
                      <span className={`text-[10px] font-semibold tabular-nums ${p.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {p.growth >= 0 ? '+' : ''}{p.growth}%
                      </span>
                    </div>
                  ))}
                </div>
                {portfolioProducts.length > 3 && (
                  <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setShowAllPortfolio(!showAllPortfolio)}>
                    {showAllPortfolio ? "Show less" : `Show ${portfolioProducts.length - 3} more`}
                  </Button>
                )}
                <Button variant="link" className="p-0 h-auto text-xs text-primary" onClick={() => onTabChange?.("portfolio")}>
                  View full portfolio <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Household Overview */}
        {isWidgetVisible('household-overview') && (
          <div key="household-overview">
            <Card className="h-full">
              <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">Household</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidget('household-overview', false)}><X className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-[80px] h-[80px] shrink-0">
                    <EChartsWrapper
                      option={{
                        series: [{
                          type: "pie" as const, radius: ["55%", "80%"], center: ["50%", "50%"],
                          data: householdValues.map(m => ({ name: m.name, value: m.value, itemStyle: { color: m.color } })),
                          label: { show: false }, silent: true,
                        }],
                        tooltip: { show: false },
                      }}
                      height={80}
                      transparent={false}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Combined Value</p>
                    <p className="text-xl font-bold">{formatTotal(householdTotal, currencySymbol)}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      <span className="text-[10px] font-semibold text-emerald-600">+{householdYtdGrowth}% YTD</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  {(showAllHousehold ? householdValues : householdValues.slice(0, 3)).map((m, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 py-1 border-b border-border/30 last:border-0 ${m.relatedClientId ? 'cursor-pointer hover:bg-muted/50 rounded' : ''}`}
                      onClick={() => m.relatedClientId && navigate(`/clients/${m.relatedClientId}`)}
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium truncate block">{m.name}</span>
                        <span className="text-[10px] text-muted-foreground">{m.role}</span>
                      </div>
                      {renderSparkline(m.sparkData, m.growth >= 0, 40, 12)}
                      <span className="text-xs font-medium tabular-nums">{formatTotal(m.value, currencySymbol)}</span>
                      <span className={`text-[10px] font-semibold tabular-nums ${m.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {m.growth >= 0 ? '+' : ''}{m.growth}%
                      </span>
                    </div>
                  ))}
                </div>
                {householdValues.length > 3 && (
                  <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setShowAllHousehold(!showAllHousehold)}>
                    {showAllHousehold ? "Show less" : `Show ${householdValues.length - 3} more`}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="w-full text-xs gap-1" onClick={() => setAddMemberOpen(true)}>
                  <UserPlus className="h-3.5 w-3.5" /> Add Member, Company or Trust
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onboarding (KYC/AML) */}
        {isWidgetVisible('onboarding-kyc') && (
          <div key="onboarding-kyc">
            <Card className="h-full">
              <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">Onboarding</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleWidget('onboarding-kyc', false)}><X className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">KYC/AML Verification</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Full Name</p>
                    <p className="text-xs font-medium">{onboardingStatus.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">ID Number</p>
                    <p className="text-xs font-medium font-mono">{onboardingStatus.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                    <p className="text-xs font-medium">{onboardingStatus.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</p>
                    <p className="text-xs font-medium font-mono">{onboardingStatus.phone}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {onboardingStatus.checks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CircleCheckBig className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{check.label}</p>
                        <p className="text-[10px] text-muted-foreground">{check.subtitle}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">Verified</Badge>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-2.5 text-center">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Successfully Onboarded</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-500">All KYC/AML checks passed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DraggableWidgetGrid>
      )}

      <AddFamilyMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        clientId={clientId}
        onSuccess={() => {
          refetch();
          setAddMemberOpen(false);
        }}
      />
    </div>
  );
};

export default ClientDashboardTab;
