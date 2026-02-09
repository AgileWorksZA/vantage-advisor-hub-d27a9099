import React, { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRegion } from "@/contexts/RegionContext";
import { generateClient360Data, mapNationalityToJurisdiction } from "@/data/regional360ViewData";
import {
  generateFees,
  generateEAC,
  generatePerformanceReturns,
  generateHistoricalPerformance,
  generateHoldings,
  generateAssetAllocation,
  generateProductFunds,
  getExchangesForJurisdiction,
  FeeRow,
  EACRow,
} from "@/data/performanceComparisonData";
import { MultiSelect } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EChartsWrapper } from "@/components/ui/echarts-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, X } from "lucide-react";

interface ComparisonFund {
  fundId: string;
  name: string;
  code: string;
  allocation: number;
}

interface AdminFund {
  id: string;
  name: string;
  code: string | null;
  exchange: string | null;
  sector: string | null;
  fund_manager: string | null;
}

interface ClientPerformanceTabProps {
  clientId: string;
  nationality?: string | null;
  countryOfIssue?: string | null;
}

const CURRENT_COLOR = "#a3d5f7";
const COMP_COLOR = "#b3e6b3";
const CURRENT_LINE = "hsl(200, 70%, 55%)";
const COMP_LINE = "hsl(142, 60%, 45%)";

export default function ClientPerformanceTab({ clientId, nationality, countryOfIssue }: ClientPerformanceTabProps) {
  const { selectedRegion } = useRegion();
  const jurisdiction = nationality ? mapNationalityToJurisdiction(nationality, countryOfIssue) : selectedRegion;

  const data360 = useMemo(() => generateClient360Data(clientId, nationality || null, countryOfIssue || null), [clientId, nationality, countryOfIssue]);
  const currentPortfolio = useMemo(() => {
    const total = data360.onPlatformProducts.reduce((s, p) => s + p.amountValue, 0);
    return data360.onPlatformProducts.map((p) => ({
      name: p.product,
      allocation: total > 0 ? +((p.amountValue / total) * 100).toFixed(1) : 0,
      value: p.amountValue,
    }));
  }, [data360]);

  // Product multi-select for fund-level view
  const allProductOptions = useMemo(
    () => data360.onPlatformProducts.map((p) => ({ value: p.product, label: p.product })),
    [data360]
  );
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  useEffect(() => {
    setSelectedProducts(data360.onPlatformProducts.map((p) => p.product));
  }, [data360]);

  // Expand by product toggle
  const [expandByProduct, setExpandByProduct] = useState(false);

  // Generate fund-level breakdown for selected products
  const productFunds = useMemo(() => {
    const selected = data360.onPlatformProducts.filter((p) => selectedProducts.includes(p.product));
    return generateProductFunds(selected, jurisdiction, clientId);
  }, [data360, selectedProducts, jurisdiction, clientId]);

  // Consolidated funds (merged by fund name across products)
  const consolidatedFunds = useMemo(() => {
    if (expandByProduct) return null;
    const map = new Map<string, { fundName: string; value: number }>();
    productFunds.forEach((f) => {
      const existing = map.get(f.fundName);
      if (existing) {
        existing.value += f.value;
      } else {
        map.set(f.fundName, { fundName: f.fundName, value: f.value });
      }
    });
    const totalValue = productFunds.reduce((s, f) => s + f.value, 0);
    return Array.from(map.values()).map((f) => ({
      ...f,
      allocation: totalValue > 0 ? +((f.value / totalValue) * 100).toFixed(1) : 0,
    }));
  }, [productFunds, expandByProduct]);

  // Comparison state
  const [comparisonFunds, setComparisonFunds] = useState<ComparisonFund[]>([]);
  const [availableFunds, setAvailableFunds] = useState<AdminFund[]>([]);
  const [fundSearch, setFundSearch] = useState("");
  const [showFundDropdown, setShowFundDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Chart toggles
  const [perfViewMode, setPerfViewMode] = useState<"portfolio" | "instrument">("portfolio");
  const [historyFrequency, setHistoryFrequency] = useState<"monthly" | "quarterly" | "annually">("monthly");

  const hasComparison = comparisonFunds.length > 0;

  useEffect(() => {
    const exchanges = getExchangesForJurisdiction(jurisdiction);
    supabase
      .from("admin_funds")
      .select("id, name, code, exchange, sector, fund_manager")
      .eq("is_deleted", false)
      .in("exchange", exchanges)
      .then(({ data }) => {
        if (data) setAvailableFunds(data as AdminFund[]);
      });
  }, [jurisdiction]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowFundDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredFunds = useMemo(() => {
    if (fundSearch.length < 1) return availableFunds.slice(0, 20);
    const q = fundSearch.toLowerCase();
    return availableFunds
      .filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.code && f.code.toLowerCase().includes(q)) ||
          (f.fund_manager && f.fund_manager.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [availableFunds, fundSearch]);

  const addFund = (fund: AdminFund) => {
    if (comparisonFunds.find((c) => c.fundId === fund.id)) return;
    setComparisonFunds((prev) => [
      ...prev,
      { fundId: fund.id, name: fund.name, code: fund.code || "", allocation: 0 },
    ]);
    setFundSearch("");
    setShowFundDropdown(false);
  };

  const removeFund = (fundId: string) => {
    setComparisonFunds((prev) => prev.filter((f) => f.fundId !== fundId));
  };

  const updateAllocation = (fundId: string, value: number) => {
    setComparisonFunds((prev) =>
      prev.map((f) => (f.fundId === fundId ? { ...f, allocation: value } : f))
    );
  };

  const autoBalance = () => {
    const count = comparisonFunds.length;
    if (count === 0) return;
    const each = +(100 / count).toFixed(1);
    setComparisonFunds((prev) =>
      prev.map((f, i) => ({
        ...f,
        allocation: i === count - 1 ? +(100 - each * (count - 1)).toFixed(1) : each,
      }))
    );
  };

  const compAllocTotal = comparisonFunds.reduce((s, f) => s + f.allocation, 0);

  // ===== REALTIME COMPUTED DATA =====
  const currentFees = useMemo(() => generateFees(currentPortfolio, "current-"), [currentPortfolio]);
  const comparisonFees = useMemo(
    () =>
      hasComparison
        ? generateFees(comparisonFunds.map((f) => ({ name: f.name, allocation: f.allocation })), "comp-")
        : [],
    [comparisonFunds, hasComparison]
  );

  const currentEAC = useMemo(() => generateEAC(currentFees), [currentFees]);
  const comparisonEAC = useMemo(() => (hasComparison ? generateEAC(comparisonFees) : []), [comparisonFees, hasComparison]);

  const perfReturns = useMemo(
    () =>
      hasComparison
        ? generatePerformanceReturns(currentPortfolio, comparisonFunds.map((f) => ({ name: f.name })))
        : [],
    [currentPortfolio, comparisonFunds, hasComparison]
  );

  const historicalPerfRaw = useMemo(
    () =>
      hasComparison
        ? generateHistoricalPerformance(currentPortfolio, comparisonFunds.map((f) => ({ name: f.name })))
        : [],
    [currentPortfolio, comparisonFunds, hasComparison]
  );

  const historicalPerf = useMemo(() => {
    if (historyFrequency === "quarterly") return historicalPerfRaw.filter((_, i) => i % 3 === 0);
    if (historyFrequency === "annually") return historicalPerfRaw.filter((_, i) => i % 12 === 0);
    return historicalPerfRaw;
  }, [historicalPerfRaw, historyFrequency]);

  const currentHoldings = useMemo(() => generateHoldings(currentPortfolio, "current-top"), [currentPortfolio]);
  const currentUnderlying = useMemo(() => generateHoldings(currentPortfolio, "current-underlying"), [currentPortfolio]);
  const compHoldings = useMemo(() => (hasComparison ? generateHoldings(comparisonFunds, "comp-top") : []), [comparisonFunds, hasComparison]);
  const compUnderlying = useMemo(() => (hasComparison ? generateHoldings(comparisonFunds, "comp-underlying") : []), [comparisonFunds, hasComparison]);

  const currentAlloc = useMemo(() => generateAssetAllocation(currentPortfolio, "current"), [currentPortfolio]);
  const compAlloc = useMemo(() => (hasComparison ? generateAssetAllocation(comparisonFunds, "comp") : []), [comparisonFunds, hasComparison]);

  // ===== CHART OPTIONS =====
  const barChartOption = useMemo(() => {
    if (perfReturns.length === 0) return {};
    const labels = perfReturns.map((p) => {
      const map: Record<string, string> = { "6M": "6-Month Return", "1Y": "1-Year Return", "3Y": "3-Year Return", "5Y": "5-Year Return", "7Y": "7-Year Return", "10Y": "10-Year Return" };
      return map[p.period] || p.period;
    });
    return {
      tooltip: { trigger: "axis" as const },
      legend: { data: ["Current Portfolio", "Comparison Portfolio"], bottom: 0 },
      xAxis: { type: "category" as const, data: labels, axisLabel: { fontSize: 10, rotate: 20 } },
      yAxis: { type: "value" as const, axisLabel: { formatter: "{value}%" } },
      dataZoom: [{ type: "inside" as const }],
      grid: { left: 50, right: 20, top: 20, bottom: 50, containLabel: false },
      series: [
        {
          name: "Current Portfolio",
          type: "bar" as const,
          data: perfReturns.map((p) => p.currentReturn),
          itemStyle: { color: CURRENT_COLOR },
          barGap: "10%",
        },
        {
          name: "Comparison Portfolio",
          type: "bar" as const,
          data: perfReturns.map((p) => p.comparisonReturn),
          itemStyle: { color: COMP_COLOR },
        },
      ],
    };
  }, [perfReturns]);

  const lineChartOption = useMemo(() => {
    if (historicalPerf.length === 0) return {};
    return {
      tooltip: { trigger: "axis" as const },
      legend: { data: ["Current Portfolio", "Comparison Portfolio"], bottom: 0 },
      xAxis: { type: "category" as const, data: historicalPerf.map((p) => p.date), boundaryGap: false },
      yAxis: { type: "value" as const },
      dataZoom: [
        { type: "inside" as const },
        { type: "slider" as const, bottom: 25, height: 18 },
      ],
      grid: { left: 50, right: 20, top: 20, bottom: 70, containLabel: false },
      series: [
        {
          name: "Current Portfolio",
          type: "line" as const,
          data: historicalPerf.map((p) => p.current),
          smooth: true,
          showSymbol: false,
          lineStyle: { color: CURRENT_LINE, width: 2 },
          itemStyle: { color: CURRENT_LINE },
        },
        {
          name: "Comparison Portfolio",
          type: "line" as const,
          data: historicalPerf.map((p) => p.comparison),
          smooth: true,
          showSymbol: false,
          areaStyle: { opacity: 0.2, color: COMP_COLOR },
          lineStyle: { color: COMP_LINE, width: 2 },
          itemStyle: { color: COMP_LINE },
        },
      ],
    };
  }, [historicalPerf]);

  const holdingsBarOption = (items: { name: string; percentage: number }[], color: string) => ({
    tooltip: { trigger: "axis" as const },
    xAxis: { type: "value" as const, max: 50, axisLabel: { formatter: "{value}%", fontSize: 10 } },
    yAxis: { type: "category" as const, data: items.map((h) => h.name).reverse(), axisLabel: { width: 90, overflow: "truncate" as const, fontSize: 10 } },
    grid: { left: 100, right: 16, top: 4, bottom: 4, containLabel: false },
    series: [
      {
        type: "bar" as const,
        data: items.map((h) => h.percentage).reverse(),
        itemStyle: { color, borderRadius: [0, 3, 3, 0] },
        barWidth: 14,
      },
    ],
  });

  const pieOption = (data: { name: string; value: number }[], title: string) => ({
    tooltip: { trigger: "item" as const, formatter: "{b}: {d}%" },
    title: { text: title, left: "center" as const, textStyle: { fontSize: 11 } },
    series: [
      {
        type: "pie" as const,
        radius: ["30%", "60%"],
        center: ["50%", "55%"],
        data,
        emphasis: { itemStyle: { shadowBlur: 15, shadowColor: "rgba(0,0,0,0.2)" } },
        selectedMode: "single" as const,
        selectedOffset: 10,
        label: { formatter: "{b}\n{d}%", fontSize: 9 },
      },
    ],
  });

  // ===== SUB-COMPONENTS =====
  const FeeTable = ({ fees, title, referenceFees, mode }: { fees: FeeRow[]; title: string; referenceFees?: FeeRow[]; mode?: "current" | "comparison" }) => {
    const weightedAvg = (key: keyof FeeRow) =>
      fees.reduce((s, f) => s + (f[key] as number) * (f.allocation / 100), 0);
    const refWeightedAvg = (key: keyof FeeRow) =>
      referenceFees ? referenceFees.reduce((s, f) => s + (f[key] as number) * (f.allocation / 100), 0) : undefined;
    const hl = (val: number, refVal: number | undefined) => {
      if (refVal === undefined || mode !== "comparison") return "";
      if (val > refVal) return "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400";
      if (val < refVal) return "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400";
      return "";
    };
    return (
      <div>
        <h4 className="font-semibold text-xs mb-1">{title}</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px] py-1">Instrument</TableHead>
              <TableHead className="text-[10px] py-1 text-right">Inv. Mgmt</TableHead>
              <TableHead className="text-[10px] py-1 text-right">Admin</TableHead>
              <TableHead className="text-[10px] py-1 text-right">Advisor</TableHead>
              <TableHead className="text-[10px] py-1 text-right">Other</TableHead>
              <TableHead className="text-[10px] py-1 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map((f, i) => {
              const ref = referenceFees?.[i];
              return (
                <TableRow key={i}>
                  <TableCell className="text-[10px] py-1 font-medium truncate max-w-[120px]">{f.instrument}</TableCell>
                  <TableCell className={`text-[10px] py-1 text-right ${hl(f.investmentMgmtFee, ref?.investmentMgmtFee)}`}>{f.investmentMgmtFee}%</TableCell>
                  <TableCell className={`text-[10px] py-1 text-right ${hl(f.adminFee, ref?.adminFee)}`}>{f.adminFee}%</TableCell>
                  <TableCell className={`text-[10px] py-1 text-right ${hl(f.advisorFee, ref?.advisorFee)}`}>{f.advisorFee}%</TableCell>
                  <TableCell className={`text-[10px] py-1 text-right ${hl(f.otherFee, ref?.otherFee)}`}>{f.otherFee}%</TableCell>
                  <TableCell className={`text-[10px] py-1 text-right font-semibold ${hl(f.totalCost, ref?.totalCost)}`}>{f.totalCost}%</TableCell>
                </TableRow>
              );
            })}
            <TableRow className="border-t-2">
              <TableCell className="text-[10px] py-1 font-bold">Weighted Avg</TableCell>
              {(["investmentMgmtFee", "adminFee", "advisorFee", "otherFee", "totalCost"] as (keyof FeeRow)[]).map((key) => {
                const val = weightedAvg(key);
                const refVal = refWeightedAvg(key);
                return (
                  <TableCell key={key} className={`text-[10px] py-1 text-right font-bold ${hl(val, refVal)}`}>
                    {val.toFixed(2)}%
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  const EACTable = ({ eac, title, referenceEAC, mode }: { eac: EACRow[]; title: string; referenceEAC?: EACRow[]; mode?: "current" | "comparison" }) => {
    const hl = (val: number, refVal: number | undefined) => {
      if (refVal === undefined || mode !== "comparison") return "";
      if (val > refVal) return "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400";
      if (val < refVal) return "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400";
      return "";
    };
    return (
      <div>
        <h4 className="font-semibold text-xs mb-1 mt-3">{title}</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px] py-1">Impact of Charge</TableHead>
              <TableHead className="text-[10px] py-1 text-right">Year 1</TableHead>
              <TableHead className="text-[10px] py-1 text-right">Year 3</TableHead>
              <TableHead className="text-[10px] py-1 text-right">Year 5</TableHead>
              <TableHead className="text-[10px] py-1 text-right">Year 10</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eac.map((row, i) => {
              const ref = referenceEAC?.[i];
              return (
                <TableRow key={i} className={row.category === "Total" ? "border-t-2 font-bold" : ""}>
                  <TableCell className="text-[10px] py-1">{row.category}</TableCell>
                  <TableCell className={`text-[10px] py-1 text-right ${hl(row.year1, ref?.year1)}`}>{row.year1}%</TableCell>
                  <TableCell className={`text-[10px] py-1 text-right ${hl(row.year3, ref?.year3)}`}>{row.year3}%</TableCell>
                  <TableCell className={`text-[10px] py-1 text-right ${hl(row.year5, ref?.year5)}`}>{row.year5}%</TableCell>
                  <TableCell className={`text-[10px] py-1 text-right ${hl(row.year10, ref?.year10)}`}>{row.year10}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  const Placeholder = ({ text }: { text: string }) => (
    <div className="flex items-center justify-center h-full min-h-[120px] text-xs text-muted-foreground italic">
      {text}
    </div>
  );

  const RadioToggle = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="flex items-center gap-3">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer text-xs">
          <span
            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
              value === opt.value ? "border-teal-600" : "border-muted-foreground/40"
            }`}
          >
            {value === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />}
          </span>
          <span className={value === opt.value ? "font-medium text-foreground" : "text-muted-foreground"}>{opt.label}</span>
        </label>
      ))}
    </div>
  );

  // ===== RENDER =====
  return (
    <div className="space-y-4">
      {/* Row 1: Portfolio Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current Portfolio */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm text-teal-600 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: CURRENT_COLOR }} />
              Current Portfolio
            </CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <div className="max-w-[220px]">
                <MultiSelect
                  options={allProductOptions}
                  selected={selectedProducts}
                  onChange={setSelectedProducts}
                  placeholder="Products"
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Switch
                  id="expand-by-product"
                  checked={expandByProduct}
                  onCheckedChange={setExpandByProduct}
                  className="scale-75"
                />
                <Label htmlFor="expand-by-product" className="text-[10px] text-muted-foreground whitespace-nowrap cursor-pointer">
                  Expand by Product
                </Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] py-1">Mutual Fund</TableHead>
                  <TableHead className="text-[10px] py-1 text-right">Alloc.</TableHead>
                  <TableHead className="text-[10px] py-1 text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expandByProduct ? (
                  selectedProducts.map((pName) => {
                    const funds = productFunds.filter((f) => f.productName === pName);
                    return (
                      <React.Fragment key={`grp-${pName}`}>
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={3} className="text-[10px] py-0.5 font-bold text-muted-foreground">
                            {pName}
                          </TableCell>
                        </TableRow>
                        {funds.map((f, fi) => (
                          <TableRow key={`${pName}-${fi}`}>
                            <TableCell className="text-[11px] py-1 pl-6 font-medium">{f.fundName}</TableCell>
                            <TableCell className="text-[11px] py-1 text-right">{f.allocation}%</TableCell>
                            <TableCell className="text-[11px] py-1 text-right">
                              {data360.currencySymbol}{f.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  })
                ) : (
                  consolidatedFunds?.map((f, i) => (
                    <TableRow key={`cons-${i}`}>
                      <TableCell className="text-[11px] py-1 font-medium">{f.fundName}</TableCell>
                      <TableCell className="text-[11px] py-1 text-right">{f.allocation}%</TableCell>
                      <TableCell className="text-[11px] py-1 text-right">
                        {data360.currencySymbol}{f.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="border-t-2">
                  <TableCell className="text-[11px] py-1 font-bold">Total</TableCell>
                  <TableCell className="text-[11px] py-1 text-right font-bold">100%</TableCell>
                  <TableCell className="text-[11px] py-1 text-right font-bold">
                    {data360.currencySymbol}{productFunds.reduce((s, f) => s + f.value, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Comparison Portfolio */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm text-teal-600 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COMP_COLOR }} />
                Comparison Portfolio
              </span>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={autoBalance} disabled={comparisonFunds.length === 0}>
                Auto Balance
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2">
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search funds..."
                  className="pl-8 h-7 text-xs"
                  value={fundSearch}
                  onChange={(e) => { setFundSearch(e.target.value); setShowFundDropdown(true); }}
                  onFocus={() => setShowFundDropdown(true)}
                />
              </div>
              {showFundDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-[200px] overflow-auto">
                  <ScrollArea className="max-h-[200px]">
                    {filteredFunds.length === 0 ? (
                      <div className="p-2 text-xs text-muted-foreground text-center">No funds found</div>
                    ) : (
                      filteredFunds.map((fund) => (
                        <button
                          key={fund.id}
                          className="w-full text-left px-3 py-1.5 hover:bg-accent/50 transition-colors border-b last:border-b-0"
                          onClick={() => addFund(fund)}
                        >
                          <div className="text-xs font-medium truncate">{fund.name}</div>
                          <div className="text-[10px] text-muted-foreground flex gap-1.5">
                            {fund.code && <span>{fund.code}</span>}
                            {fund.exchange && <Badge variant="outline" className="text-[9px] h-3.5 px-1">{fund.exchange}</Badge>}
                          </div>
                        </button>
                      ))
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>

            {comparisonFunds.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground">Add funds to build comparison</div>
            ) : (
              <div className="space-y-1">
                {comparisonFunds.map((fund) => (
                  <div key={fund.fundId} className="flex items-center gap-1.5 bg-muted/50 rounded px-2 py-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium truncate">{fund.name}</div>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-16 h-6 text-[11px] text-right"
                      value={fund.allocation}
                      onChange={(e) => updateAllocation(fund.fundId, +e.target.value)}
                    />
                    <span className="text-[10px] text-muted-foreground">%</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeFund(fund.fundId)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end text-[11px]">
                  <span className={`font-medium ${Math.abs(compAllocTotal - 100) > 1 ? "text-destructive" : "text-muted-foreground"}`}>
                    Total: {compAllocTotal.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Fee Comparison (2 cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-sm text-teal-600">Current Portfolio Fees & EAC</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <FeeTable fees={currentFees} title="Ongoing Fees" referenceFees={hasComparison ? comparisonFees : undefined} mode="current" />
            <EACTable eac={currentEAC} title="Effective Annual Cost (EAC)" referenceEAC={hasComparison ? comparisonEAC : undefined} mode="current" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-sm text-teal-600">Comparison Portfolio Fees & EAC</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {hasComparison ? (
              <>
                <FeeTable fees={comparisonFees} title="Ongoing Fees" referenceFees={currentFees} mode="comparison" />
                <EACTable eac={comparisonEAC} title="Effective Annual Cost (EAC)" referenceEAC={currentEAC} mode="comparison" />
              </>
            ) : (
              <Placeholder text="Add funds to see comparison" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Performance Charts (2 cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-teal-600">Portfolio Performance Returns</CardTitle>
              <RadioToggle
                value={perfViewMode}
                onChange={(v) => setPerfViewMode(v as "portfolio" | "instrument")}
                options={[
                  { value: "portfolio", label: "Portfolio" },
                  { value: "instrument", label: "Instrument" },
                ]}
              />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {hasComparison ? (
              <EChartsWrapper option={barChartOption} height={280} />
            ) : (
              <Placeholder text="Add funds to see comparison" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-teal-600">History Performance Return</CardTitle>
              <RadioToggle
                value={historyFrequency}
                onChange={(v) => setHistoryFrequency(v as "monthly" | "quarterly" | "annually")}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "quarterly", label: "Quarterly" },
                  { value: "annually", label: "Annually" },
                ]}
              />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {hasComparison ? (
              <EChartsWrapper option={lineChartOption} height={280} />
            ) : (
              <Placeholder text="Add funds to see comparison" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Top 10 Holdings (4 cards) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs text-teal-600">Top 10 Holdings</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <EChartsWrapper option={holdingsBarOption(currentHoldings, CURRENT_COLOR)} height={220} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs text-teal-600">Top 10 Holdings Comparison</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {hasComparison ? (
              <EChartsWrapper option={holdingsBarOption(compHoldings, COMP_COLOR)} height={220} />
            ) : (
              <Placeholder text="Add funds to see comparison" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs text-teal-600">Top 10 Underlying</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <EChartsWrapper option={holdingsBarOption(currentUnderlying, CURRENT_COLOR)} height={220} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs text-teal-600">Top 10 Underlying Comparison</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            {hasComparison ? (
              <EChartsWrapper option={holdingsBarOption(compUnderlying, COMP_COLOR)} height={220} />
            ) : (
              <Placeholder text="Add funds to see comparison" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Asset Allocation (2 cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-sm text-teal-600">Current Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] py-1">Asset Class</TableHead>
                  <TableHead className="text-[10px] py-1 text-right">Local</TableHead>
                  <TableHead className="text-[10px] py-1 text-right">Offshore</TableHead>
                  <TableHead className="text-[10px] py-1 text-right">Overall</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAlloc.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-[10px] py-1 font-medium">{row.assetClass}</TableCell>
                    <TableCell className="text-[10px] py-1 text-right">{row.local}%</TableCell>
                    <TableCell className="text-[10px] py-1 text-right">{row.offshore}%</TableCell>
                    <TableCell className="text-[10px] py-1 text-right font-semibold">{row.overall}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="grid grid-cols-3 gap-1">
              <EChartsWrapper option={pieOption(currentAlloc.map((r) => ({ name: r.assetClass, value: r.overall })), "Overall")} height={160} />
              <EChartsWrapper option={pieOption(currentAlloc.map((r) => ({ name: r.assetClass, value: r.local })), "Local")} height={160} />
              <EChartsWrapper option={pieOption(currentAlloc.map((r) => ({ name: r.assetClass, value: r.offshore })), "Offshore")} height={160} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-sm text-teal-600">Comparison Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-3">
            {hasComparison ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] py-1">Asset Class</TableHead>
                      <TableHead className="text-[10px] py-1 text-right">Local</TableHead>
                      <TableHead className="text-[10px] py-1 text-right">Offshore</TableHead>
                      <TableHead className="text-[10px] py-1 text-right">Overall</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compAlloc.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-[10px] py-1 font-medium">{row.assetClass}</TableCell>
                        <TableCell className="text-[10px] py-1 text-right">{row.local}%</TableCell>
                        <TableCell className="text-[10px] py-1 text-right">{row.offshore}%</TableCell>
                        <TableCell className="text-[10px] py-1 text-right font-semibold">{row.overall}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="grid grid-cols-3 gap-1">
                  <EChartsWrapper option={pieOption(compAlloc.map((r) => ({ name: r.assetClass, value: r.overall })), "Overall")} height={160} />
                  <EChartsWrapper option={pieOption(compAlloc.map((r) => ({ name: r.assetClass, value: r.local })), "Local")} height={160} />
                  <EChartsWrapper option={pieOption(compAlloc.map((r) => ({ name: r.assetClass, value: r.offshore })), "Offshore")} height={160} />
                </div>
              </>
            ) : (
              <Placeholder text="Add funds to see comparison" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
