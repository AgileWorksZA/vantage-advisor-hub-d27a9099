import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EChartsWrapper } from "@/components/ui/echarts-wrapper";
import { generateClient360Data, mapNationalityToJurisdiction, formatTotal } from "@/data/regional360ViewData";
import { useClientRelationships } from "@/hooks/useClientRelationships";
import { Client, calculateAge, formatBirthday } from "@/types/client";
import { Plus, Users, Calendar, Gift, FileCheck, ShieldCheck, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import AddFamilyMemberDialog from "./AddFamilyMemberDialog";

interface ClientDashboardTabProps {
  client: Client;
  clientId: string;
  onTabChange?: (tab: string) => void;
}

// Deterministic seed helper (reuses the same pattern as regional360ViewData)
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

const ClientDashboardTab = ({ client, clientId, onTabChange }: ClientDashboardTabProps) => {
  const navigate = useNavigate();
  const { familyMembers, businesses, refetch } = useClientRelationships(clientId);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set());

  const jurisdiction = mapNationalityToJurisdiction(client.nationality || null, client.country_of_issue || null);

  const clientData = useMemo(() => {
    return generateClient360Data(clientId, client.nationality, client.country_of_issue);
  }, [clientId, client.nationality, client.country_of_issue]);

  const { currencySymbol } = clientData;

  // Deterministic valuation data
  const valuationData = useMemo(() => {
    const rand = seededRandom(clientId + "-valuation");
    const totalInvestments = clientData.onPlatformProducts.reduce((s, p) => s + p.amountValue, 0) +
      clientData.externalProducts.reduce((s, p) => s + p.amountValue, 0) +
      clientData.platformCashAccounts.reduce((s, p) => s + p.amountValue, 0);
    const depositsWithdrawals = (rand() - 0.3) * totalInvestments * 0.1;
    const investmentReturns = totalInvestments * (0.04 + rand() * 0.08);
    const startingValue = totalInvestments - depositsWithdrawals - investmentReturns;
    return {
      startingValue,
      depositsWithdrawals,
      investmentReturns,
      endingValue: totalInvestments,
    };
  }, [clientId, clientData]);

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

  // Geographic diversification
  const geoDiversification = useMemo(() => {
    const domestic = assetAllocation.filter(a => a.name !== "International").reduce((s, a) => s + a.pct, 0);
    const international = assetAllocation.find(a => a.name === "International")?.pct || 0;
    return [
      { name: "Domestic", value: Math.round(domestic * 100) },
      { name: "International", value: Math.round(international * 100) },
    ];
  }, [assetAllocation]);

  // All contracts for selection
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

  // Product summary by category
  const productSummary = useMemo(() => {
    const cats: Record<string, number> = {};
    allContracts.forEach(c => {
      cats[c.category] = (cats[c.category] || 0) + c.value;
    });
    return Object.entries(cats).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [allContracts]);

  // Income vs Expenses (deterministic)
  const incomeExpenses = useMemo(() => {
    const rand = seededRandom(clientId + "-income");
    const income = 25000 + rand() * 75000;
    const expenses = income * (0.5 + rand() * 0.3);
    return { income: Math.round(income), expenses: Math.round(expenses) };
  }, [clientId]);

  // Key dates
  const keyDates = useMemo(() => {
    const dates: { label: string; date: string; icon: React.ReactNode }[] = [];
    if (client.date_of_birth) {
      dates.push({ label: "Birthday", date: formatBirthday(client.date_of_birth), icon: <Gift className="h-3.5 w-3.5 text-muted-foreground" /> });
    }
    // Deterministic next review
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

  const toggleContract = (id: string) => {
    setSelectedContracts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Chart colors
  const chartColors = [
    "hsl(180, 70%, 45%)", "hsl(210, 60%, 55%)", "hsl(30, 70%, 55%)",
    "hsl(150, 50%, 45%)", "hsl(260, 50%, 55%)", "hsl(0, 60%, 55%)",
  ];

  // Asset allocation bar chart option
  const assetAllocationOption = useMemo(() => ({
    tooltip: { trigger: "axis" as const, formatter: (params: any) => {
      const p = params[0];
      return `${p.name}: ${(p.value as number).toFixed(1)}%`;
    }},
    grid: { left: 90, right: 30, top: 8, bottom: 8 },
    xAxis: { type: "value" as const, max: 100, show: false },
    yAxis: { type: "category" as const, data: assetAllocation.map(a => a.name), axisLine: { show: false }, axisTick: { show: false } },
    series: [{ type: "bar" as const, data: assetAllocation.map((a, i) => ({ value: Math.round(a.pct * 100), itemStyle: { color: chartColors[i] } })), barWidth: 16, borderRadius: 0 }],
  }), [assetAllocation]);

  // Geo diversification donut
  const geoOption = useMemo(() => ({
    tooltip: { trigger: "item" as const },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: "pie" as const, radius: ["45%", "70%"], center: ["50%", "40%"],
      data: geoDiversification.map((g, i) => ({ name: g.name, value: g.value, itemStyle: { color: chartColors[i] } })),
      label: { show: true, formatter: "{b}: {c}%", fontSize: 11 },
    }],
  }), [geoDiversification]);

  // Product summary pie
  const productSummaryOption = useMemo(() => ({
    tooltip: { trigger: "item" as const, formatter: (p: any) => `${p.name}: ${currencySymbol} ${(p.value as number).toLocaleString()}` },
    legend: { bottom: 0, textStyle: { fontSize: 10 } },
    series: [{
      type: "pie" as const, radius: ["40%", "65%"], center: ["50%", "38%"],
      data: productSummary.map((p, i) => ({ name: p.name, value: Math.round(p.value), itemStyle: { color: chartColors[i % chartColors.length] } })),
      label: { show: false },
    }],
  }), [productSummary, currencySymbol]);

  // Income vs expenses bar
  const incomeExpensesOption = useMemo(() => ({
    tooltip: { trigger: "axis" as const },
    grid: { left: 10, right: 10, top: 20, bottom: 30, containLabel: true },
    xAxis: { type: "category" as const, data: ["Income", "Expenses"] },
    yAxis: { type: "value" as const, show: false },
    series: [{
      type: "bar" as const, barWidth: 40,
      data: [
        { value: incomeExpenses.income, itemStyle: { color: "hsl(180, 70%, 45%)" } },
        { value: incomeExpenses.expenses, itemStyle: { color: "hsl(0, 60%, 55%)" } },
      ],
      label: { show: true, position: "top" as const, formatter: (p: any) => `${currencySymbol} ${(p.value as number).toLocaleString()}`, fontSize: 10 },
    }],
  }), [incomeExpenses, currencySymbol]);

  const householdMembers = [...familyMembers.map(f => ({ ...f, kind: "family" as const })), ...businesses.map(b => ({ ...b, kind: "business" as const }))];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Asset Allocation */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3 pb-1">
          <CardTitle className="text-sm font-semibold">Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <EChartsWrapper option={assetAllocationOption} height={180} />
          <Button variant="link" className="p-0 h-auto text-xs text-[hsl(180,70%,45%)]" onClick={() => onTabChange?.("performance")}>
            View analysis <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* 2. Change in Valuation */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3 pb-1">
          <CardTitle className="text-sm font-semibold">Change in Valuation</CardTitle>
        </CardHeader>
        <CardContent className="pt-1 space-y-2">
          {[
            { label: "Starting Value", value: valuationData.startingValue },
            { label: "Deposits / Withdrawals", value: valuationData.depositsWithdrawals, highlight: true },
            { label: "Investment Returns", value: valuationData.investmentReturns, highlight: true },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className={`text-sm font-medium flex items-center gap-1 ${item.highlight ? (item.value >= 0 ? "text-emerald-600" : "text-red-500") : ""}`}>
                {item.highlight && (item.value >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
                {formatTotal(item.value, currencySymbol)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-1">
            <span className="text-xs font-semibold">Ending Value</span>
            <span className="text-sm font-bold">{formatTotal(valuationData.endingValue, currencySymbol)}</span>
          </div>
          <Button variant="link" className="p-0 h-auto text-xs text-[hsl(180,70%,45%)]" onClick={() => onTabChange?.("performance")}>
            View performance <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* 3. Geographic Diversification */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3 pb-1">
          <CardTitle className="text-sm font-semibold">Geographic Diversification</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <EChartsWrapper option={geoOption} height={180} />
          <Button variant="link" className="p-0 h-auto text-xs text-[hsl(180,70%,45%)]" onClick={() => onTabChange?.("360-view")}>
            View diversification <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* 4. Household Members */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3 pb-1 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold">Household Members</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setAddMemberOpen(true)}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {householdMembers.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No household members linked</p>
          ) : (
            <div className="space-y-1.5 max-h-[180px] overflow-auto">
              {householdMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium leading-tight">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.kind === "family" ? m.familyType : m.type}</p>
                    </div>
                  </div>
                  {m.relatedClientId && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-[hsl(180,70%,45%)]" onClick={() => navigate(`/clients/${m.relatedClientId}`)}>
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Selected Contracts */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3 pb-1">
          <CardTitle className="text-sm font-semibold">Selected Contracts</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1 max-h-[200px] overflow-auto">
            {allContracts.map(c => (
              <label key={c.id} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0 cursor-pointer">
                <Checkbox
                  checked={selectedContracts.has(c.id)}
                  onCheckedChange={() => toggleContract(c.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.provider} · {c.category}</p>
                </div>
                {c.value > 0 && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTotal(c.value, currencySymbol)}</span>
                )}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6. Product Summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3 pb-1">
          <CardTitle className="text-sm font-semibold">Product Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <EChartsWrapper option={productSummaryOption} height={200} />
        </CardContent>
      </Card>

      {/* 7. Income vs Expenses */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3 pb-1">
          <CardTitle className="text-sm font-semibold">Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <EChartsWrapper option={incomeExpensesOption} height={180} />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Surplus: <span className="font-medium text-emerald-600">{currencySymbol} {(incomeExpenses.income - incomeExpenses.expenses).toLocaleString()}</span></span>
          </div>
        </CardContent>
      </Card>

      {/* 8. Risk Cover Summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3 pb-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Risk Cover Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {clientData.riskProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No risk products on record</p>
          ) : (
            <div className="space-y-1.5 max-h-[180px] overflow-auto">
              {clientData.riskProducts.map((p, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-xs font-medium">{p.holdingName}</p>
                    <p className="text-[10px] text-muted-foreground">{p.policyNumber}</p>
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">Active</span>
                </div>
              ))}
            </div>
          )}
          <Button variant="link" className="p-0 h-auto text-xs text-[hsl(180,70%,45%)] mt-1" onClick={() => onTabChange?.("360-view")}>
            View all products <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* 9. Key Dates & Milestones */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="py-3 pb-1">
          <CardTitle className="text-sm font-semibold">Key Dates & Milestones</CardTitle>
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

      {/* Add Family Member Dialog */}
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
