import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  Info,
  ArrowRightLeft,
  Download,
  ExternalLink,
} from "lucide-react";
import ReactEChartsCore from "echarts-for-react";
import { useTLHData } from "@/hooks/useTLHData";
import { FundSwitchDialog } from "./FundSwitchDialog";
import { TrackingErrorBand } from "./TrackingErrorBand";
import { TLHOpportunityDemo, getClientTLHMetrics, TLHDashboardMetrics } from "@/data/tlhDemoData";
import { supabase } from "@/integrations/supabase/client";
import { useRegion } from "@/contexts/RegionContext";

interface TLHDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName?: string;
  clientId?: string;
}

const isValidUUID = (id: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const InfoTooltip = ({ text }: { text: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[260px] text-xs">
      {text}
    </TooltipContent>
  </Tooltip>
);

export const TLHDashboard = ({ open, onOpenChange, clientName, clientId }: TLHDashboardProps) => {
  const navigate = useNavigate();
  const { selectedRegion, formatCurrency } = useRegion();
  const {
    opportunities,
    dashboardMetrics,
    executedTrades,
    executeTrade,
  } = useTLHData();

  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<TLHOpportunityDemo | null>(null);
  const [shortTermOpen, setShortTermOpen] = useState(false);
  const [longTermOpen, setLongTermOpen] = useState(false);
  const [netShortTermOpen, setNetShortTermOpen] = useState(false);
  const [netLongTermOpen, setNetLongTermOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [productCount, setProductCount] = useState<number | null>(null);

  // Fetch client product count if we have a valid UUID
  useEffect(() => {
    if (clientId && isValidUUID(clientId) && open) {
      supabase
        .from("client_products")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .then(({ count }) => {
          setProductCount(count ?? null);
        });
    } else {
      setProductCount(null);
    }
  }, [clientId, open]);

  // Use per-client metrics if clientName is provided, otherwise fallback to jurisdiction
  const metrics = useMemo(() => {
    if (clientName) {
      return getClientTLHMetrics(clientName, selectedRegion);
    }
    return dashboardMetrics;
  }, [clientName, selectedRegion, dashboardMetrics]);

  const handleConfirmTrade = (opp: TLHOpportunityDemo) => {
    executeTrade(opp);
  };

  const getPrevBusinessDay = () => {
    const d = new Date();
    const day = d.getDay();
    if (day === 0) d.setDate(d.getDate() - 2);
    else if (day === 1) d.setDate(d.getDate() - 3);
    else d.setDate(d.getDate() - 1);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const areaChartOption = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "rgba(30,30,30,0.9)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontSize: 12 },
      formatter: (params: Array<{ value: number; name: string }>) => {
        if (Array.isArray(params) && params.length > 0) {
          return `${params[0].name}: ${formatCurrency(params[0].value)}`;
        }
        return "";
      },
    },
    grid: { left: 50, right: 20, top: 10, bottom: 30 },
    xAxis: {
      type: "category" as const,
      data: metrics.monthlyHarvested.map((m) => m.month),
      axisLine: { lineStyle: { color: "#e5e7eb" } },
      axisLabel: { color: "#9ca3af", fontSize: 11 },
    },
    yAxis: {
      type: "value" as const,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#f3f4f6" } },
      axisLabel: {
        color: "#9ca3af",
        fontSize: 11,
        formatter: (val: number) => formatCurrency(val),
      },
    },
    series: [
      {
        data: metrics.monthlyHarvested.map((m) => m.value),
        type: "line" as const,
        step: "end" as const,
        lineStyle: { color: "hsl(142, 76%, 36%)", width: 2 },
        itemStyle: { color: "hsl(142, 76%, 36%)" },
        symbol: "none",
      },
    ],
  };

  const tabs = ["Overview", "Holdings", "Activity", "Documents", "Details"];
  const netTotal = metrics.netRealizedShortTerm + metrics.netRealizedLongTerm;

  const displayName = clientName || metrics.clientName;
  const holdingsTotal = productCount !== null ? productCount : metrics.totalHoldings;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] w-[1400px] max-h-[92vh] overflow-y-auto p-0 gap-0">
          <TooltipProvider delayDuration={200}>
            {/* Header */}
            <div className="px-6 pt-5 pb-3 border-b bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
                    {clientId && isValidUUID(clientId) && (
                      <button
                        onClick={() => navigate(`/clients/${clientId}?tab=products`)}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        View Products <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{metrics.accountNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Account Balance</div>
                  <div className="text-lg font-semibold text-foreground">{formatCurrency(metrics.accountBalance)}</div>
                  <div className="text-xs text-muted-foreground">
                    Total earnings: <span className="text-emerald-600 font-medium">{formatCurrency(metrics.totalEarnings)}</span>
                  </div>
                </div>
              </div>
              {/* Tabs + Actions */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        activeTab === tab.toLowerCase()
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Trade
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" />
                    Transfer Funds
                  </Button>
                </div>
              </div>
            </div>

            {/* Date Range Bar */}
            <div className="px-6 py-2.5 bg-muted/30 border-b flex items-center justify-between text-sm text-muted-foreground">
              <span>Data from Jan 1, {new Date().getFullYear()} to {getPrevBusinessDay()}</span>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                YTD <ChevronDown className="w-3 h-3" />
              </Button>
            </div>

            <div className="p-6 space-y-5">
              {/* Hero Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground font-medium mb-1">Tax Losses Harvested</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalHarvested)}</p>
                  </CardContent>
                </Card>
                <Card className="border">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground font-medium mb-1">
                      Estimated Tax Savings<sup className="text-[10px] ml-0.5">1</sup>
                    </p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(metrics.estimatedTaxSavings)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Two-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-5">
                {/* LEFT COLUMN */}
                <div className="space-y-5">
                  {/* Estimated Tax Savings Breakdown */}
                  <Card>
                    <CardHeader className="pb-3 pt-4 px-5">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-semibold">Estimated Tax Savings</CardTitle>
                        <InfoTooltip text="Projected tax savings from gains deferral, short-to-long reclassification, and direct loss harvesting strategies." />
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-4 space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gains deferral</span>
                        <span className="font-medium">{formatCurrency(metrics.gainsDeferral)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Short to long</span>
                        <span className="font-medium">{formatCurrency(metrics.shortToLongReclassification)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Loss harvesting</span>
                        <span className="font-medium">{formatCurrency(metrics.lossHarvesting)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Estimated Tax Savings</span>
                        <span>{formatCurrency(metrics.estimatedTaxSavings)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tax Losses Harvested Chart + Breakdown */}
                  <Card>
                    <CardHeader className="pb-2 pt-4 px-5">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-semibold">Tax Losses Harvested</CardTitle>
                        <InfoTooltip text="Total capital losses realized through strategic tax-loss harvesting trades during the selected period." />
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-4 space-y-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(142, 76%, 36%)" }} />
                        Total tax losses harvested
                      </div>

                      <ReactEChartsCore option={areaChartOption} style={{ height: 180 }} />

                      <Collapsible open={shortTermOpen} onOpenChange={setShortTermOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/30 rounded px-1 transition-colors">
                          <div className="flex items-center gap-1.5">
                            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${shortTermOpen ? "rotate-0" : "-rotate-90"}`} />
                            <span className="text-sm font-medium">Short term losses harvested</span>
                          </div>
                          <span className="text-sm font-semibold text-destructive">{formatCurrency(metrics.shortTermLossTotal)}</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-6 space-y-1 pt-1">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Daily scan</span>
                            <span>{formatCurrency(metrics.shortTermDailyScan)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Non daily scan</span>
                            <span>{formatCurrency(metrics.shortTermNonDailyScan)}</span>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <Collapsible open={longTermOpen} onOpenChange={setLongTermOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/30 rounded px-1 transition-colors">
                          <div className="flex items-center gap-1.5">
                            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${longTermOpen ? "rotate-0" : "-rotate-90"}`} />
                            <span className="text-sm font-medium">Long term losses harvested</span>
                          </div>
                          <span className="text-sm font-semibold text-destructive">{formatCurrency(metrics.longTermLossTotal)}</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-6 space-y-1 pt-1">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Daily scan</span>
                            <span>{formatCurrency(metrics.longTermDailyScan)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Non daily scan</span>
                            <span>{formatCurrency(metrics.longTermNonDailyScan)}</span>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <Separator />
                      <div className="flex justify-between text-sm font-semibold pt-1">
                        <span>Total Losses Harvested from TLH</span>
                        <span>{formatCurrency(metrics.totalHarvested)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Net Realized G/L */}
                  <Card>
                    <CardHeader className="pb-2 pt-4 px-5">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-semibold">Total net realized gains / losses</CardTitle>
                        <InfoTooltip text="Net capital gains or losses realized from all portfolio transactions, separated by holding period." />
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-4 space-y-1">
                      <Collapsible open={netShortTermOpen} onOpenChange={setNetShortTermOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/30 rounded px-1 transition-colors">
                          <div className="flex items-center gap-1.5">
                            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${netShortTermOpen ? "rotate-0" : "-rotate-90"}`} />
                            <span className="text-sm font-medium">Short term</span>
                          </div>
                          <span className={`text-sm font-semibold ${metrics.netRealizedShortTerm < 0 ? "text-destructive" : "text-emerald-600"}`}>
                            {formatCurrency(metrics.netRealizedShortTerm)}
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-6 py-1">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Realized gains</span>
                            <span>{formatCurrency(metrics.netRealizedGains)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Realized losses</span>
                            <span>{formatCurrency(metrics.netRealizedLosses)}</span>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <Collapsible open={netLongTermOpen} onOpenChange={setNetLongTermOpen}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-muted/30 rounded px-1 transition-colors">
                          <div className="flex items-center gap-1.5">
                            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${netLongTermOpen ? "rotate-0" : "-rotate-90"}`} />
                            <span className="text-sm font-medium">Long term</span>
                          </div>
                          <span className={`text-sm font-semibold ${metrics.netRealizedLongTerm < 0 ? "text-destructive" : "text-emerald-600"}`}>
                            {formatCurrency(metrics.netRealizedLongTerm)}
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-6 py-1">
                          <p className="text-xs text-muted-foreground">Includes all long-term capital events</p>
                        </CollapsibleContent>
                      </Collapsible>

                      <Separator />
                      <div className="flex justify-between text-sm font-semibold pt-2">
                        <span>Total net realized gains / losses</span>
                        <span className={netTotal < 0 ? "text-destructive" : "text-emerald-600"}>
                          {formatCurrency(netTotal)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-5">
                  {/* Tracking Error */}
                  <Card>
                    <CardHeader className="pb-2 pt-4 px-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm font-semibold">Tracking error</CardTitle>
                          <InfoTooltip text="Measures how closely the portfolio tracks its benchmark index. Lower values indicate tighter tracking." />
                        </div>
                        <span className="text-xl font-bold text-foreground">
                          {(metrics.trackingError * 100).toFixed(2)}%
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <TrackingErrorBand value={metrics.trackingError} />
                    </CardContent>
                  </Card>

                  {/* Holdings in Portfolio */}
                  <Card>
                    <CardHeader className="pb-2 pt-4 px-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm font-semibold">Holdings in portfolio</CardTitle>
                          <InfoTooltip text="Breakdown of positions by category: primary model holdings, tax-loss substitutes, and out-of-model positions." />
                        </div>
                        <span className="text-xl font-bold text-foreground">{holdingsTotal}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Model primary</span>
                        <span className="font-medium">{metrics.holdingsPrimaryCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Model substitutes</span>
                        <span className="font-medium">{metrics.holdingsSubstitutesCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Not in model</span>
                        <span className="font-medium">{metrics.holdingsNotInModelCount}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Current Tax Settings */}
                  <Card>
                    <CardHeader className="pb-2 pt-4 px-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm font-semibold">Current tax settings</CardTitle>
                          <InfoTooltip text="Your active tax optimization configuration including sensitivity levels, harvesting rules, and applicable tax rates." />
                        </div>
                        <button className="text-xs font-medium text-primary hover:underline">Edit</button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current portfolio</span>
                        <span className="font-medium text-right max-w-[200px] truncate">{metrics.currentPortfolio}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax Sensitivity</span>
                        <span className="font-medium">{metrics.taxSensitivity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax Loss Harvesting</span>
                        <span className="font-medium">{metrics.tlhEnabled ? "On" : "Off"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Annual Capital Gains Budget</span>
                        <span className="font-medium">{metrics.capitalGainsBudget > 0 ? formatCurrency(metrics.capitalGainsBudget) : "Off"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax Rates</span>
                        <span className="font-medium">ST: {metrics.shortTermTaxRate}% · LT: {metrics.longTermTaxRate}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="px-6 py-3 border-t bg-muted/20">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <sup>1</sup> Estimated tax savings are modeled projections based on the below tax-savings strategies. They are hypothetical, illustrative, and not guaranteed. Results vary by investor. Not tax advice.
              </p>
            </div>
          </TooltipProvider>
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
