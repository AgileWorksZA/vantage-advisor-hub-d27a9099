import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  ChevronDown,
  Settings,
  History,
  Target,
  Loader2,
} from "lucide-react";
import ReactEChartsCore from "echarts-for-react";
import { useTLHData } from "@/hooks/useTLHData";
import { TLHOpportunitiesTable } from "./TLHOpportunitiesTable";
import { TLHTradeHistory } from "./TLHTradeHistory";
import { FundSwitchDialog } from "./FundSwitchDialog";
import { TLHOpportunityDemo } from "@/data/tlhDemoData";

interface TLHDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TLHDashboard = ({ open, onOpenChange }: TLHDashboardProps) => {
  const {
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
  } = useTLHData();

  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<TLHOpportunityDemo | null>(null);
  const [shortTermOpen, setShortTermOpen] = useState(true);
  const [longTermOpen, setLongTermOpen] = useState(true);

  const handleSwitchFund = (opp: TLHOpportunityDemo) => {
    setSelectedOpportunity(opp);
    setSwitchDialogOpen(true);
  };

  const handleConfirmTrade = (opp: TLHOpportunityDemo) => {
    executeTrade(opp);
  };

  const areaChartOption = {
    tooltip: { trigger: "axis" as const },
    grid: { left: 50, right: 20, top: 10, bottom: 30 },
    xAxis: {
      type: "category" as const,
      data: dashboardMetrics.monthlyHarvested.map((m) => m.month),
      axisLine: { lineStyle: { color: "hsl(var(--border))" } },
      axisLabel: { color: "hsl(var(--muted-foreground))", fontSize: 11 },
    },
    yAxis: {
      type: "value" as const,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "hsl(var(--border))" } },
      axisLabel: {
        color: "hsl(var(--muted-foreground))",
        fontSize: 11,
        formatter: (val: number) => formatCurrency(val),
      },
    },
    series: [
      {
        data: dashboardMetrics.monthlyHarvested.map((m) => m.value),
        type: "line" as const,
        smooth: true,
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "hsla(var(--primary), 0.3)" },
              { offset: 1, color: "hsla(var(--primary), 0.02)" },
            ],
          },
        },
        lineStyle: { color: "hsl(var(--primary))", width: 2 },
        itemStyle: { color: "hsl(var(--primary))" },
      },
    ],
  };

  const trackingErrorGaugeOption = {
    series: [
      {
        type: "gauge" as const,
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 0.1,
        splitNumber: 5,
        radius: "100%",
        center: ["50%", "75%"],
        axisLine: {
          lineStyle: {
            width: 16,
            color: [
              [dashboardMetrics.trackingErrorTarget, "hsl(142, 76%, 36%)"],
              [0.08, "hsl(45, 93%, 47%)"],
              [1, "hsl(0, 84%, 60%)"],
            ],
          },
        },
        pointer: {
          length: "60%",
          width: 4,
          itemStyle: { color: "hsl(var(--foreground))" },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          distance: -20,
          fontSize: 10,
          color: "hsl(var(--muted-foreground))",
          formatter: (val: number) => `${(val * 100).toFixed(1)}%`,
        },
        detail: {
          valueAnimation: true,
          formatter: (val: number) => `${(val * 100).toFixed(2)}%`,
          fontSize: 16,
          offsetCenter: [0, "-10%"],
          color: "hsl(var(--foreground))",
        },
        data: [{ value: dashboardMetrics.trackingError }],
      },
    ],
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] w-[1400px] max-h-[92vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Tax Loss Harvesting</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Region: {selectedRegion} · {opportunities.length} active opportunities
                  {isSeeded && <span className="ml-2 text-emerald-600">(DB-backed)</span>}
                  {isAutoSeeding && <span className="ml-2 text-muted-foreground inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Syncing data...</span>}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                {selectedRegion} Jurisdiction
              </Badge>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-muted-foreground font-medium">Total Harvestable</span>
                  </div>
                  <p className="text-xl font-bold text-destructive">{formatCurrency(totalUnrealizedLoss)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-muted-foreground font-medium">Est. Tax Savings</span>
                  </div>
                  <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalEstimatedSavings)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">Tax Losses Harvested</span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(dashboardMetrics.totalHarvested)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">Accounts Affected</span>
                  </div>
                  <p className="text-xl font-bold">{opportunities.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Tax Losses Harvested Chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tax Losses Harvested (Cumulative)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactEChartsCore option={areaChartOption} style={{ height: 220 }} />
                </CardContent>
              </Card>

              {/* Tracking Error Gauge */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tracking Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactEChartsCore option={trackingErrorGaugeOption} style={{ height: 180 }} />
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Target: &lt; {(dashboardMetrics.trackingErrorTarget * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Savings Breakdown + Holdings + Tax Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Savings Breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Estimated Tax Savings Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gains Deferral</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(dashboardMetrics.gainsDeferral)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Short→Long Reclassification</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(dashboardMetrics.shortToLongReclassification)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Loss Harvesting</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(dashboardMetrics.lossHarvesting)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span className="text-emerald-600">
                      {formatCurrency(dashboardMetrics.gainsDeferral + dashboardMetrics.shortToLongReclassification + dashboardMetrics.lossHarvesting)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Holdings */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Holdings in Portfolio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Model Primary</span>
                    <span className="font-medium">{dashboardMetrics.holdingsInModel}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: `${dashboardMetrics.holdingsInModel}%` }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Model Substitutes</span>
                    <span className="font-medium">{dashboardMetrics.holdingsSubstitutes}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-amber-500 rounded-full h-2" style={{ width: `${dashboardMetrics.holdingsSubstitutes}%` }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Not in Model</span>
                    <span className="font-medium">{dashboardMetrics.holdingsNotInModel}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-destructive rounded-full h-2" style={{ width: `${dashboardMetrics.holdingsNotInModel}%` }} />
                  </div>
                </CardContent>
              </Card>

              {/* Tax Settings */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium">Tax Settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">TLH Active</span>
                    <Switch checked={dashboardMetrics.tlhEnabled} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax Sensitivity</span>
                    <Badge variant="secondary" className="text-xs">{dashboardMetrics.taxSensitivity}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CG Budget</span>
                    <span className="font-medium">{formatCurrency(dashboardMetrics.capitalGainsBudget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Short-Term Rate</span>
                    <span className="font-medium">{dashboardMetrics.shortTermTaxRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Long-Term Rate</span>
                    <span className="font-medium">{dashboardMetrics.longTermTaxRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Short/Long Term Losses Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Collapsible open={shortTermOpen} onOpenChange={setShortTermOpen}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-2 cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Short-Term Losses</CardTitle>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${shortTermOpen ? "rotate-180" : ""}`} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-2">
                      {dashboardMetrics.shortTermLosses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No short-term losses</p>
                      ) : (
                        dashboardMetrics.shortTermLosses.map((loss, i) => (
                          <div key={i} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                            <div>
                              <p className="font-medium">{loss.description}</p>
                              <p className="text-xs text-muted-foreground">{loss.scanType} scan</p>
                            </div>
                            <span className="text-destructive font-semibold">{formatCurrency(loss.amount)}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              <Collapsible open={longTermOpen} onOpenChange={setLongTermOpen}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-2 cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Long-Term Losses</CardTitle>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${longTermOpen ? "rotate-180" : ""}`} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-2">
                      {dashboardMetrics.longTermLosses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No long-term losses</p>
                      ) : (
                        dashboardMetrics.longTermLosses.map((loss, i) => (
                          <div key={i} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                            <div>
                              <p className="font-medium">{loss.description}</p>
                              <p className="text-xs text-muted-foreground">{loss.scanType} scan</p>
                            </div>
                            <span className="text-destructive font-semibold">{formatCurrency(loss.amount)}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            {/* Net Realized Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Net Realized Gains</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(dashboardMetrics.netRealizedGains)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Net Realized Losses</span>
                    <span className="font-semibold text-destructive">{formatCurrency(dashboardMetrics.netRealizedLosses)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Opportunities & Trade History */}
            <Tabs defaultValue="opportunities">
              <TabsList>
                <TabsTrigger value="opportunities" className="gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Opportunities
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Trade History
                </TabsTrigger>
              </TabsList>
              <TabsContent value="opportunities" className="mt-4">
                <TLHOpportunitiesTable
                  opportunities={opportunities}
                  onSwitchFund={handleSwitchFund}
                  onDismiss={dismissOpportunity}
                  onBulkExecute={executeBulk}
                />
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <TLHTradeHistory trades={executedTrades} />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <FundSwitchDialog
        open={switchDialogOpen}
        onOpenChange={setSwitchDialogOpen}
        opportunity={selectedOpportunity}
        onConfirm={handleConfirmTrade}
      />
    </>
  );
};
