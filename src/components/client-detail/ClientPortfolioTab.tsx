import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EChartsWrapper } from "@/components/ui/echarts-wrapper";
import { generateClient360Data, mapNationalityToJurisdiction } from "@/data/regional360ViewData";
import { useRegion } from "@/contexts/RegionContext";
import ClientPerformanceTab from "./ClientPerformanceTab";
import HoldingsTab from "./portfolio/HoldingsTab";
import CompaniesTab from "./portfolio/CompaniesTab";
import AssetClassTab from "./portfolio/AssetClassTab";

interface ClientPortfolioTabProps {
  clientId: string;
  nationality?: string | null;
  countryOfIssue?: string | null;
}

// Simple seeded random for deterministic data
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const SUB_TABS = [
  { value: "performance", label: "Performance" },
  { value: "holdings", label: "Holdings" },
  { value: "companies", label: "Companies" },
  { value: "asset-class", label: "Asset class" },
  { value: "sectors", label: "Sectors" },
  { value: "geography", label: "Geography" },
  { value: "comparison", label: "Comparison" },
];

export default function ClientPortfolioTab({ clientId, nationality, countryOfIssue }: ClientPortfolioTabProps) {
  const [subTab, setSubTab] = useState("performance");
  const [periodMode, setPeriodMode] = useState<"analysis" | "summary">("analysis");
  const { selectedRegion } = useRegion();

  const jurisdiction = nationality
    ? mapNationalityToJurisdiction(nationality, countryOfIssue)
    : selectedRegion;

  const clientData = useMemo(() => generateClient360Data(clientId, nationality, countryOfIssue), [clientId, nationality, countryOfIssue]);

  const totalValue = useMemo(() => {
    return clientData.onPlatformProducts.reduce((s, p) => s + p.amountValue, 0) +
      clientData.platformCashAccounts.reduce((s, p) => s + p.amountValue, 0);
  }, [clientData]);

  const currencySymbol = jurisdiction === "US" ? "$" : jurisdiction === "UK" ? "£" : "R";

  const formatVal = (v: number) => {
    if (Math.abs(v) >= 1_000_000) return `${currencySymbol}${(v / 1_000_000).toFixed(2)}m`;
    if (Math.abs(v) >= 1_000) return `${currencySymbol}${(v / 1_000).toFixed(0)}k`;
    return `${currencySymbol}${v.toFixed(0)}`;
  };

  // Generate deterministic performance data
  const perfData = useMemo(() => {
    const rand = seededRandom(clientId + "perf");
    const irr = 5.5 + rand() * 8;
    const benchmark = irr - 1.5 + rand() * 3;

    const periods = [
      { label: "01/01/2024 – 31/03/2024", pct: 1.2 + rand() * 2 },
      { label: "01/04/2024 – 30/06/2024", pct: -0.5 + rand() * 3 },
      { label: "01/07/2024 – 30/09/2024", pct: 0.8 + rand() * 2.5 },
      { label: "01/10/2024 – 31/12/2024", pct: 1.5 + rand() * 3 },
    ];

    const openingNet = totalValue * (0.75 + rand() * 0.15);
    const capitalMovement = totalValue * (0.02 + rand() * 0.08);
    const gainsLosses = totalValue * (0.05 + rand() * 0.1);
    const income = totalValue * (0.01 + rand() * 0.03);
    const expenses = -(totalValue * (0.005 + rand() * 0.015));
    const closingNet = openingNet + capitalMovement + gainsLosses + income + expenses;

    return { irr, benchmark, periods, waterfall: { openingNet, capitalMovement, gainsLosses, income, expenses, closingNet } };
  }, [clientId, totalValue]);

  // Waterfall chart option
  const waterfallOption = useMemo(() => {
    const { openingNet, capitalMovement, gainsLosses, income, expenses, closingNet } = perfData.waterfall;
    const categories = ["Opening\nnet value", "Capital\nmovement", "Gains/\nlosses", "Income", "Expenses", "Closing\nnet value"];
    const values = [openingNet, capitalMovement, gainsLosses, income, expenses, closingNet];

    // Calculate invisible base for waterfall
    let runningTotal = 0;
    const base: number[] = [];
    const visible: number[] = [];
    const colors: string[] = [];

    values.forEach((v, i) => {
      if (i === 0) {
        base.push(0);
        visible.push(v);
        colors.push("hsl(180, 55%, 45%)");
        runningTotal = v;
      } else if (i === values.length - 1) {
        base.push(0);
        visible.push(v);
        colors.push("hsl(180, 55%, 45%)");
      } else {
        if (v >= 0) {
          base.push(runningTotal);
          visible.push(v);
          colors.push("hsl(180, 55%, 45%)");
        } else {
          base.push(runningTotal + v);
          visible.push(Math.abs(v));
          colors.push("hsl(0, 65%, 55%)");
        }
        runningTotal += v;
      }
    });

    return {
      tooltip: { trigger: "axis" as const, axisPointer: { type: "shadow" as const } },
      grid: { left: 10, right: 20, top: 30, bottom: 30, containLabel: true },
      xAxis: {
        type: "category" as const,
        data: categories,
        axisLabel: { fontSize: 10, interval: 0, color: "hsl(var(--muted-foreground))" },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "hsl(var(--border))" } },
      },
      yAxis: {
        type: "value" as const,
        axisLabel: {
          fontSize: 10,
          color: "hsl(var(--muted-foreground))",
          formatter: (v: number) => formatVal(v),
        },
        splitLine: { lineStyle: { color: "hsl(var(--border))", type: "dashed" as const } },
      },
      series: [
        {
          name: "Base",
          type: "bar" as const,
          stack: "waterfall",
          itemStyle: { borderColor: "transparent", color: "transparent" },
          emphasis: { itemStyle: { borderColor: "transparent", color: "transparent" } },
          data: base,
        },
        {
          name: "Value",
          type: "bar" as const,
          stack: "waterfall",
          itemStyle: { borderRadius: 0 },
          label: {
            show: true,
            position: "top" as const,
            fontSize: 10,
            color: "hsl(var(--foreground))",
            formatter: (params: any) => formatVal(values[params.dataIndex]),
          },
          data: visible.map((v, i) => ({ value: v, itemStyle: { color: colors[i] } })),
        },
      ],
    };
  }, [perfData, currencySymbol]);

  return (
    <div className="space-y-4">
      {/* Sub-tab bar */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none gap-0 flex-wrap border-b border-border">
          {SUB_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[hsl(180,70%,45%)] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Performance sub-tab (landing page) */}
        <TabsContent value="performance" className="mt-4 space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <Select defaultValue="all">
              <SelectTrigger className="w-[220px] h-8 text-xs">
                <SelectValue placeholder="All accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All accounts · {formatVal(totalValue)}</SelectItem>
                {clientData.onPlatformProducts.map((p, i) => (
                  <SelectItem key={i} value={p.number}>{p.product} · {p.amount}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select defaultValue="opening">
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opening">Since opening</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="3y">3 Years</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
              <Button
                variant={periodMode === "analysis" ? "default" : "ghost"}
                size="sm"
                className="h-6 text-xs px-3"
                onClick={() => setPeriodMode("analysis")}
              >
                Analysis
              </Button>
              <Button
                variant={periodMode === "summary" ? "default" : "ghost"}
                size="sm"
                className="h-6 text-xs px-3"
                onClick={() => setPeriodMode("summary")}
              >
                Summary
              </Button>
            </div>

            <Select defaultValue="domestic-fi">
              <SelectTrigger className="w-[200px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="domestic-fi">Benchmark: Domestic Fixed Income</SelectItem>
                <SelectItem value="domestic-eq">Benchmark: Domestic Equity</SelectItem>
                <SelectItem value="global">Benchmark: Global Balanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left: Return in this period */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Return in this period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* IRR */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{perfData.irr.toFixed(2)}%</span>
                    <span className="text-xs text-muted-foreground">IRR</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Benchmark</span>
                    <span className="font-medium text-foreground">{perfData.benchmark.toFixed(2)}%</span>
                    <span className={perfData.irr > perfData.benchmark ? "text-emerald-600" : "text-red-500"}>
                      {perfData.irr > perfData.benchmark ? "+" : ""}{(perfData.irr - perfData.benchmark).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* By period bars */}
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">By period</h4>
                  {perfData.periods.map((p, i) => {
                    const isPos = p.pct >= 0;
                    const maxPct = Math.max(...perfData.periods.map(pp => Math.abs(pp.pct)));
                    const barWidth = (Math.abs(p.pct) / maxPct) * 100;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-[140px] shrink-0">{p.label}</span>
                        <div className="flex-1 h-4 relative">
                          <div
                            className="absolute top-0 h-full rounded-sm"
                            style={{
                              width: `${barWidth}%`,
                              backgroundColor: isPos ? "hsl(180, 55%, 45%)" : "hsl(350, 65%, 55%)",
                            }}
                          />
                        </div>
                        <span className={`text-[10px] font-semibold w-[40px] text-right ${isPos ? "text-emerald-600" : "text-red-500"}`}>
                          {isPos ? "+" : ""}{p.pct.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Right: Changes affecting value */}
            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Changes affecting value</CardTitle>
              </CardHeader>
              <CardContent>
                <EChartsWrapper option={waterfallOption} height={280} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comparison sub-tab (existing performance tab) */}
        <TabsContent value="comparison" className="mt-4">
          <ClientPerformanceTab clientId={clientId} nationality={nationality} countryOfIssue={countryOfIssue} />
        </TabsContent>

        {/* Holdings tab */}
        <TabsContent value="holdings" className="mt-4">
          <HoldingsTab clientId={clientId} nationality={nationality} countryOfIssue={countryOfIssue} currencySymbol={currencySymbol} />
        </TabsContent>

        {/* Companies tab */}
        <TabsContent value="companies" className="mt-4">
          <CompaniesTab clientId={clientId} nationality={nationality} countryOfIssue={countryOfIssue} currencySymbol={currencySymbol} />
        </TabsContent>

        {/* Asset Class tab */}
        <TabsContent value="asset-class" className="mt-4">
          <AssetClassTab clientId={clientId} nationality={nationality} countryOfIssue={countryOfIssue} currencySymbol={currencySymbol} />
        </TabsContent>

        {/* Placeholder sub-tabs */}
        {["sectors", "geography"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")} view coming soon
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
