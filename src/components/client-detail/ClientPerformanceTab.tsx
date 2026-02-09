import { useState, useMemo, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
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
  getExchangesForJurisdiction,
  FeeRow,
  EACRow,
} from "@/data/performanceComparisonData";
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
import { Plus, Trash2, Search, BarChart3, X } from "lucide-react";

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
}

export default function ClientPerformanceTab({ clientId, nationality }: ClientPerformanceTabProps) {
  const { selectedRegion, currencySymbol } = useRegion();
  const jurisdiction = nationality ? mapNationalityToJurisdiction(nationality) : selectedRegion;

  // Current portfolio from 360 data
  const data360 = useMemo(() => generateClient360Data(clientId, nationality || null), [clientId, nationality]);
  const currentPortfolio = useMemo(() => {
    const total = data360.onPlatformProducts.reduce((s, p) => s + p.amountValue, 0);
    return data360.onPlatformProducts.map((p) => ({
      name: p.product,
      allocation: total > 0 ? +((p.amountValue / total) * 100).toFixed(1) : 0,
      value: p.amountValue,
    }));
  }, [data360]);

  // Comparison funds state
  const [comparisonFunds, setComparisonFunds] = useState<ComparisonFund[]>([]);
  const [compared, setCompared] = useState(false);

  // Fund search
  const [availableFunds, setAvailableFunds] = useState<AdminFund[]>([]);
  const [fundSearch, setFundSearch] = useState("");
  const [showFundDropdown, setShowFundDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch funds from admin_funds
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

  // Close dropdown on outside click
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
    setCompared(false);
  };

  const removeFund = (fundId: string) => {
    setComparisonFunds((prev) => prev.filter((f) => f.fundId !== fundId));
    setCompared(false);
  };

  const updateAllocation = (fundId: string, value: number) => {
    setComparisonFunds((prev) =>
      prev.map((f) => (f.fundId === fundId ? { ...f, allocation: value } : f))
    );
    setCompared(false);
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

  // Computed comparison data
  const currentFees = useMemo(() => generateFees(currentPortfolio, "current-"), [currentPortfolio]);
  const comparisonFees = useMemo(
    () =>
      compared
        ? generateFees(
            comparisonFunds.map((f) => ({ name: f.name, allocation: f.allocation })),
            "comp-"
          )
        : [],
    [compared, comparisonFunds]
  );

  const currentEAC = useMemo(() => generateEAC(currentFees), [currentFees]);
  const comparisonEAC = useMemo(() => (compared ? generateEAC(comparisonFees) : []), [compared, comparisonFees]);

  const perfReturns = useMemo(
    () =>
      compared
        ? generatePerformanceReturns(
            currentPortfolio,
            comparisonFunds.map((f) => ({ name: f.name }))
          )
        : [],
    [compared, currentPortfolio, comparisonFunds]
  );

  const historicalPerf = useMemo(
    () =>
      compared
        ? generateHistoricalPerformance(
            currentPortfolio,
            comparisonFunds.map((f) => ({ name: f.name }))
          )
        : [],
    [compared, currentPortfolio, comparisonFunds]
  );

  const currentHoldings = useMemo(
    () => generateHoldings(currentPortfolio, "current-top"),
    [currentPortfolio]
  );
  const currentUnderlying = useMemo(
    () => generateHoldings(currentPortfolio, "current-underlying"),
    [currentPortfolio]
  );
  const compHoldings = useMemo(
    () => (compared ? generateHoldings(comparisonFunds, "comp-top") : []),
    [compared, comparisonFunds]
  );
  const compUnderlying = useMemo(
    () => (compared ? generateHoldings(comparisonFunds, "comp-underlying") : []),
    [compared, comparisonFunds]
  );

  const currentAlloc = useMemo(
    () => generateAssetAllocation(currentPortfolio, "current"),
    [currentPortfolio]
  );
  const compAlloc = useMemo(
    () => (compared ? generateAssetAllocation(comparisonFunds, "comp") : []),
    [compared, comparisonFunds]
  );

  const compAllocTotal = comparisonFunds.reduce((s, f) => s + f.allocation, 0);

  // ===== CHART OPTIONS =====
  const barChartOption = useMemo(() => {
    if (!compared || perfReturns.length === 0) return {};
    return {
      tooltip: { trigger: "axis" as const },
      legend: { data: ["Current Portfolio", "Comparison Portfolio"] },
      xAxis: { type: "category" as const, data: perfReturns.map((p) => p.period) },
      yAxis: { type: "value" as const, axisLabel: { formatter: "{value}%" } },
      dataZoom: [{ type: "inside" as const }],
      series: [
        {
          name: "Current Portfolio",
          type: "bar" as const,
          data: perfReturns.map((p) => p.currentReturn),
          itemStyle: { color: "hsl(180, 70%, 45%)" },
          barGap: "10%",
        },
        {
          name: "Comparison Portfolio",
          type: "bar" as const,
          data: perfReturns.map((p) => p.comparisonReturn),
          itemStyle: { color: "hsl(142, 76%, 36%)" },
        },
      ],
    };
  }, [compared, perfReturns]);

  const lineChartOption = useMemo(() => {
    if (!compared || historicalPerf.length === 0) return {};
    return {
      tooltip: { trigger: "axis" as const },
      legend: { data: ["Current Portfolio", "Comparison Portfolio"] },
      xAxis: { type: "category" as const, data: historicalPerf.map((p) => p.date), boundaryGap: false },
      yAxis: { type: "value" as const },
      dataZoom: [
        { type: "inside" as const },
        { type: "slider" as const, bottom: 0 },
      ],
      series: [
        {
          name: "Current Portfolio",
          type: "line" as const,
          data: historicalPerf.map((p) => p.current),
          smooth: true,
          areaStyle: { opacity: 0.15 },
          lineStyle: { color: "hsl(180, 70%, 45%)" },
          itemStyle: { color: "hsl(180, 70%, 45%)" },
        },
        {
          name: "Comparison Portfolio",
          type: "line" as const,
          data: historicalPerf.map((p) => p.comparison),
          smooth: true,
          areaStyle: { opacity: 0.15 },
          lineStyle: { color: "hsl(142, 76%, 36%)" },
          itemStyle: { color: "hsl(142, 76%, 36%)" },
        },
      ],
    };
  }, [compared, historicalPerf]);

  const holdingsBarOption = (items: { name: string; percentage: number }[], color: string) => ({
    tooltip: { trigger: "axis" as const },
    xAxis: { type: "value" as const, axisLabel: { formatter: "{value}%" } },
    yAxis: { type: "category" as const, data: items.map((h) => h.name).reverse(), axisLabel: { width: 100, overflow: "truncate" as const } },
    grid: { left: 120, right: 20, top: 8, bottom: 8, containLabel: false },
    series: [
      {
        type: "bar" as const,
        data: items.map((h) => h.percentage).reverse(),
        itemStyle: { color, borderRadius: [0, 4, 4, 0] },
        barWidth: 16,
      },
    ],
  });

  const pieOption = (data: { name: string; value: number }[], title: string) => ({
    tooltip: { trigger: "item" as const, formatter: "{b}: {d}%" },
    title: { text: title, left: "center" as const, textStyle: { fontSize: 13 } },
    series: [
      {
        type: "pie" as const,
        radius: ["35%", "65%"],
        center: ["50%", "55%"],
        data,
        emphasis: { itemStyle: { shadowBlur: 20, shadowColor: "rgba(0,0,0,0.3)" } },
        label: { formatter: "{b}\n{d}%", fontSize: 10 },
      },
    ],
  });

  // ===== RENDER =====
  const FeeTable = ({ fees, title }: { fees: FeeRow[]; title: string }) => {
    const weightedAvg = (key: keyof FeeRow) =>
      fees.reduce((s, f) => s + (f[key] as number) * (f.allocation / 100), 0).toFixed(2);
    return (
      <div>
        <h4 className="font-semibold text-sm mb-2">{title}</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Instrument</TableHead>
              <TableHead className="text-xs text-right">Inv. Mgmt</TableHead>
              <TableHead className="text-xs text-right">Admin</TableHead>
              <TableHead className="text-xs text-right">Advisor</TableHead>
              <TableHead className="text-xs text-right">Other</TableHead>
              <TableHead className="text-xs text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map((f, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs font-medium">{f.instrument}</TableCell>
                <TableCell className="text-xs text-right">{f.investmentMgmtFee}%</TableCell>
                <TableCell className="text-xs text-right">{f.adminFee}%</TableCell>
                <TableCell className="text-xs text-right">{f.advisorFee}%</TableCell>
                <TableCell className="text-xs text-right">{f.otherFee}%</TableCell>
                <TableCell className="text-xs text-right font-semibold">{f.totalCost}%</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2">
              <TableCell className="text-xs font-bold">Weighted Average</TableCell>
              <TableCell className="text-xs text-right font-bold">{weightedAvg("investmentMgmtFee")}%</TableCell>
              <TableCell className="text-xs text-right font-bold">{weightedAvg("adminFee")}%</TableCell>
              <TableCell className="text-xs text-right font-bold">{weightedAvg("advisorFee")}%</TableCell>
              <TableCell className="text-xs text-right font-bold">{weightedAvg("otherFee")}%</TableCell>
              <TableCell className="text-xs text-right font-bold">{weightedAvg("totalCost")}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  const EACTable = ({ eac, title }: { eac: EACRow[]; title: string }) => (
    <div>
      <h4 className="font-semibold text-sm mb-2 mt-4">{title}</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Impact of Charge</TableHead>
            <TableHead className="text-xs text-right">Year 1</TableHead>
            <TableHead className="text-xs text-right">Year 3</TableHead>
            <TableHead className="text-xs text-right">Year 5</TableHead>
            <TableHead className="text-xs text-right">Year 10</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eac.map((row, i) => (
            <TableRow key={i} className={row.category === "Total" ? "border-t-2 font-bold" : ""}>
              <TableCell className="text-xs">{row.category}</TableCell>
              <TableCell className="text-xs text-right">{row.year1}%</TableCell>
              <TableCell className="text-xs text-right">{row.year3}%</TableCell>
              <TableCell className="text-xs text-right">{row.year5}%</TableCell>
              <TableCell className="text-xs text-right">{row.year10}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section A: Portfolio Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Portfolio */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(180,70%,45%)]" />
              Current Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Fund</TableHead>
                  <TableHead className="text-xs text-right">Allocation</TableHead>
                  <TableHead className="text-xs text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPortfolio.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm text-right">{p.allocation}%</TableCell>
                    <TableCell className="text-sm text-right">
                      {currencySymbol} {p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Comparison Portfolio */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(142,76%,36%)]" />
                Comparison Portfolio
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={autoBalance} disabled={comparisonFunds.length === 0}>
                  Auto Balance
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCompared(true)}
                  disabled={comparisonFunds.length === 0 || Math.abs(compAllocTotal - 100) > 1}
                >
                  <BarChart3 className="w-4 h-4 mr-1" /> Compare
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Fund search */}
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search funds to add..."
                  className="pl-9 h-9 text-sm"
                  value={fundSearch}
                  onChange={(e) => {
                    setFundSearch(e.target.value);
                    setShowFundDropdown(true);
                  }}
                  onFocus={() => setShowFundDropdown(true)}
                />
              </div>
              {showFundDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-[250px] overflow-auto">
                  <ScrollArea className="max-h-[250px]">
                    {filteredFunds.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground text-center">No funds found</div>
                    ) : (
                      filteredFunds.map((fund) => (
                        <button
                          key={fund.id}
                          className="w-full text-left px-3 py-2 hover:bg-accent/50 transition-colors border-b last:border-b-0"
                          onClick={() => addFund(fund)}
                        >
                          <div className="text-sm font-medium truncate">{fund.name}</div>
                          <div className="text-xs text-muted-foreground flex gap-2">
                            {fund.code && <span>{fund.code}</span>}
                            {fund.fund_manager && <span>· {fund.fund_manager}</span>}
                            {fund.exchange && <Badge variant="outline" className="text-[10px] h-4">{fund.exchange}</Badge>}
                          </div>
                        </button>
                      ))
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Selected funds */}
            {comparisonFunds.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Search and add funds to build a comparison portfolio
              </div>
            ) : (
              <div className="space-y-2">
                {comparisonFunds.map((fund) => (
                  <div key={fund.fundId} className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{fund.name}</div>
                      {fund.code && <div className="text-xs text-muted-foreground">{fund.code}</div>}
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-20 h-8 text-sm text-right"
                      value={fund.allocation}
                      onChange={(e) => updateAllocation(fund.fundId, +e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFund(fund.fundId)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end text-sm">
                  <span className={`font-medium ${Math.abs(compAllocTotal - 100) > 1 ? "text-destructive" : "text-muted-foreground"}`}>
                    Total: {compAllocTotal.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section B: Fee Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fee Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-8 ${compared ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
            <div>
              <FeeTable fees={currentFees} title="Current Portfolio – Ongoing Fees" />
              <EACTable eac={currentEAC} title="Current Portfolio – EAC" />
            </div>
            {compared && comparisonFees.length > 0 && (
              <div>
                <FeeTable fees={comparisonFees} title="Comparison Portfolio – Ongoing Fees" />
                <EACTable eac={comparisonEAC} title="Comparison Portfolio – EAC" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section C: Performance Charts */}
      {compared && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Performance Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Returns by Period</h4>
                <EChartsWrapper option={barChartOption} height={320} />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Historical Performance (Indexed to 100)</h4>
                <EChartsWrapper option={lineChartOption} height={320} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section D: Top 10 Holdings */}
      {compared && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top 10 Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Current – Top Holdings</h4>
                <EChartsWrapper option={holdingsBarOption(currentHoldings, "hsl(180, 70%, 45%)")} height={280} />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Comparison – Top Holdings</h4>
                <EChartsWrapper option={holdingsBarOption(compHoldings, "hsl(142, 76%, 36%)")} height={280} />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Current – Underlying Holdings</h4>
                <EChartsWrapper option={holdingsBarOption(currentUnderlying, "hsl(180, 70%, 45%)")} height={280} />
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Comparison – Underlying Holdings</h4>
                <EChartsWrapper option={holdingsBarOption(compUnderlying, "hsl(142, 76%, 36%)")} height={280} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section E: Asset Allocation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-8 ${compared ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
            {/* Current */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Current Portfolio</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Asset Class</TableHead>
                    <TableHead className="text-xs text-right">Local</TableHead>
                    <TableHead className="text-xs text-right">Offshore</TableHead>
                    <TableHead className="text-xs text-right">Overall</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAlloc.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-medium">{row.assetClass}</TableCell>
                      <TableCell className="text-xs text-right">{row.local}%</TableCell>
                      <TableCell className="text-xs text-right">{row.offshore}%</TableCell>
                      <TableCell className="text-xs text-right font-semibold">{row.overall}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="grid grid-cols-3 gap-2">
                <EChartsWrapper
                  option={pieOption(
                    currentAlloc.map((r) => ({ name: r.assetClass, value: r.overall })),
                    "Overall"
                  )}
                  height={200}
                />
                <EChartsWrapper
                  option={pieOption(
                    currentAlloc.map((r) => ({ name: r.assetClass, value: r.local })),
                    "Local"
                  )}
                  height={200}
                />
                <EChartsWrapper
                  option={pieOption(
                    currentAlloc.map((r) => ({ name: r.assetClass, value: r.offshore })),
                    "Offshore"
                  )}
                  height={200}
                />
              </div>
            </div>

            {/* Comparison */}
            {compared && compAlloc.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Comparison Portfolio</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Asset Class</TableHead>
                      <TableHead className="text-xs text-right">Local</TableHead>
                      <TableHead className="text-xs text-right">Offshore</TableHead>
                      <TableHead className="text-xs text-right">Overall</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compAlloc.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs font-medium">{row.assetClass}</TableCell>
                        <TableCell className="text-xs text-right">{row.local}%</TableCell>
                        <TableCell className="text-xs text-right">{row.offshore}%</TableCell>
                        <TableCell className="text-xs text-right font-semibold">{row.overall}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="grid grid-cols-3 gap-2">
                  <EChartsWrapper
                    option={pieOption(
                      compAlloc.map((r) => ({ name: r.assetClass, value: r.overall })),
                      "Overall"
                    )}
                    height={200}
                  />
                  <EChartsWrapper
                    option={pieOption(
                      compAlloc.map((r) => ({ name: r.assetClass, value: r.local })),
                      "Local"
                    )}
                    height={200}
                  />
                  <EChartsWrapper
                    option={pieOption(
                      compAlloc.map((r) => ({ name: r.assetClass, value: r.offshore })),
                      "Offshore"
                    )}
                    height={200}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
