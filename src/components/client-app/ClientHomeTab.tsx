import { useMemo, useState, useCallback, useRef } from "react";
import { Calendar, TrendingUp, TrendingDown, SlidersHorizontal, Shield, Phone, Mail, CheckCircle2, User, GripVertical } from "lucide-react";
import { generateClient360Data, formatTotal } from "@/data/regional360ViewData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import WorldMapSVG from "@/components/client-detail/WorldMapSVG";
import SparklineSvg from "@/components/client-detail/portfolio/SparklineSvg";

interface ClientHomeTabProps {
  clientId: string;
  clientName: string;
  nationality: string | null;
}

const ALL_WIDGETS: { id: string; label: string }[] = [
  { id: "portfolio-summary", label: "Portfolio Summary" },
  { id: "client-portfolio", label: "Client Portfolio" },
  { id: "valuation", label: "Change in Valuation" },
  { id: "geo", label: "Geographic Diversification" },
  { id: "family", label: "Family & Relationships" },
  { id: "household", label: "Household" },
  { id: "onboarding", label: "Onboarding" },
  { id: "holdings", label: "Holdings" },
  { id: "meeting", label: "Upcoming Meeting" },
];

const DEFAULT_VISIBLE = ["portfolio-summary", "client-portfolio", "valuation", "geo", "holdings", "meeting"];

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

const ClientHomeTab = ({ clientId, clientName, nationality }: ClientHomeTabProps) => {
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`client-home-widgets-${clientId}`);
      return saved ? JSON.parse(saved) : DEFAULT_VISIBLE;
    } catch { return DEFAULT_VISIBLE; }
  });

  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`client-home-widget-order-${clientId}`);
      return saved ? JSON.parse(saved) : ALL_WIDGETS.map(w => w.id);
    } catch { return ALL_WIDGETS.map(w => w.id); }
  });

  const dragIndexRef = useRef<number | null>(null);

  const handleToggle = useCallback((id: string, visible: boolean) => {
    setVisibleWidgets(prev => {
      const next = visible ? [...prev, id] : prev.filter(w => w !== id);
      localStorage.setItem(`client-home-widgets-${clientId}`, JSON.stringify(next));
      return next;
    });
  }, [clientId]);

  const handleDragStart = useCallback((index: number) => {
    dragIndexRef.current = index;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((dropIndex: number) => {
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === dropIndex) return;
    setWidgetOrder(prev => {
      const next = [...prev];
      const [dragged] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, dragged);
      localStorage.setItem(`client-home-widget-order-${clientId}`, JSON.stringify(next));
      return next;
    });
    dragIndexRef.current = null;
  }, [clientId]);

  const isVisible = (id: string) => visibleWidgets.includes(id);

  const data = useMemo(() => generateClient360Data(clientId, nationality), [clientId, nationality]);
  const { currencySymbol } = data;

  const totalAUM = useMemo(() => {
    return data.onPlatformProducts.reduce((s, p) => s + p.amountValue, 0) +
      data.externalProducts.reduce((s, p) => s + p.amountValue, 0) +
      data.platformCashAccounts.reduce((s, p) => s + p.amountValue, 0);
  }, [data]);

  const changePercent = useMemo(() => {
    const seed = clientId.charCodeAt(0) + clientId.charCodeAt(clientId.length - 1);
    return ((seed % 15) - 3) + (seed % 100) / 100;
  }, [clientId]);
  const isPositive = changePercent > 0;

  // --- Valuation data ---
  const [valuationPeriod, setValuationPeriod] = useState<'6m' | '1y' | '3y' | '5y'>('1y');
  const valuationData = useMemo(() => {
    const periodMultipliers: Record<string, number> = { '6m': 0.5, '1y': 1, '3y': 2.2, '5y': 3.5 };
    const mult = periodMultipliers[valuationPeriod];
    const rand = seededRandom(clientId + "-valuation-" + valuationPeriod);
    const depositsWithdrawals = (rand() - 0.3) * totalAUM * 0.1 * mult;
    const investmentReturns = totalAUM * (0.04 + rand() * 0.08) * mult;
    const startingValue = totalAUM - depositsWithdrawals - investmentReturns;
    const genSpark = (base: number, pct: number) => {
      const pts: number[] = [];
      for (let i = 0; i < 6; i++) pts.push(base * (1 + (pct / 100) * (i / 5) + (rand() - 0.5) * Math.abs(pct / 100) * 0.3));
      return pts;
    };
    const depPct = depositsWithdrawals >= 0 ? 2 + rand() * 5 * mult : -(2 + rand() * 5 * mult);
    const retPct = 4 + rand() * 8 * mult;
    const endPct = ((totalAUM - startingValue) / startingValue) * 100;
    return {
      items: [
        { label: "Starting Value", value: startingValue, sparkData: [] as number[], changePct: 0, highlight: false },
        { label: "Deposits / Withdrawals", value: depositsWithdrawals, sparkData: genSpark(Math.abs(depositsWithdrawals) || 1, depPct), changePct: +depPct.toFixed(1), highlight: true },
        { label: "Investment Returns", value: investmentReturns, sparkData: genSpark(investmentReturns, retPct), changePct: +retPct.toFixed(1), highlight: true },
      ],
      endingValue: totalAUM,
      endSparkData: genSpark(totalAUM, endPct),
      endChangePct: +endPct.toFixed(1),
    };
  }, [clientId, totalAUM, valuationPeriod]);

  // --- Portfolio products ---
  const portfolioProducts = useMemo(() => {
    const rand = seededRandom(clientId + "-portfolio-products");
    const colors = ["hsl(180, 70%, 45%)", "hsl(210, 60%, 55%)", "hsl(30, 70%, 55%)", "hsl(150, 50%, 45%)", "hsl(260, 50%, 55%)"];
    const products = [
      ...data.onPlatformProducts.map(p => ({ name: p.product, value: p.amountValue })),
      ...data.externalProducts.map(p => ({ name: p.product, value: p.amountValue })),
    ].sort((a, b) => b.value - a.value).slice(0, 4);
    return products.map((p, i) => ({
      ...p,
      color: colors[i % colors.length],
      growth: +(2 + rand() * 12 - 3).toFixed(1),
      sparkData: Array.from({ length: 6 }, () => p.value * (0.9 + rand() * 0.2)),
    }));
  }, [clientId, data]);

  const portfolioMonthlyChange = useMemo(() => {
    const rand = seededRandom(clientId + "-monthly");
    return +(1.5 + rand() * 3).toFixed(1);
  }, [clientId]);

  // --- Donut for portfolio ---
  const donutSegments = useMemo(() => {
    const total = portfolioProducts.reduce((s, p) => s + p.value, 0) || 1;
    let cumulative = 0;
    return portfolioProducts.map(p => {
      const pct = p.value / total;
      const start = cumulative;
      cumulative += pct;
      return { ...p, startAngle: start * 360, endAngle: cumulative * 360, pct };
    });
  }, [portfolioProducts]);

  // --- Geographic diversification ---
  const geoDiversification = useMemo(() => {
    const rand = seededRandom(clientId + "-geo");
    const domestic = 40 + Math.floor(rand() * 20);
    const remaining = 100 - domestic;
    return [
      { name: "Domestic", value: domestic, x: 53, y: 73, color: "hsl(180, 70%, 45%)" },
      { name: "North America", value: Math.round(remaining * 0.35), x: 20, y: 32, color: "hsl(210, 60%, 55%)" },
      { name: "Europe", value: Math.round(remaining * 0.30), x: 49, y: 22, color: "hsl(30, 70%, 55%)" },
      { name: "Asia Pacific", value: Math.round(remaining * 0.20), x: 78, y: 30, color: "hsl(150, 50%, 45%)" },
      { name: "UK", value: Math.round(remaining * 0.15), x: 43, y: 13, color: "hsl(260, 50%, 55%)" },
    ];
  }, [clientId]);

  // --- Family data ---
  const familyMembers = useMemo(() => {
    const rand = seededRandom(clientId + "-family");
    const relationships = ["Spouse", "Child", "Child", "Parent"];
    const names = ["Sarah", "James", "Emily", "Robert"];
    return relationships.map((rel, i) => ({
      name: names[i],
      relationship: rel,
      age: rel === "Child" ? 10 + Math.floor(rand() * 15) : 35 + Math.floor(rand() * 25),
      aum: Math.round(rand() * 500000 + 50000),
      initials: names[i].charAt(0),
    }));
  }, [clientId]);

  // --- Household data ---
  const householdData = useMemo(() => {
    const rand = seededRandom(clientId + "-household-values");
    const members = [
      { name: clientName.split(" ")[0], role: "Primary" },
      ...familyMembers.slice(0, 3).map(m => ({ name: m.name, role: m.relationship })),
    ];
    const total = totalAUM * 1.5;
    const shares = members.map(() => rand());
    const shareTotal = shares.reduce((s, v) => s + v, 0);
    return {
      total,
      ytdGrowth: +(3 + rand() * 6).toFixed(1),
      members: members.map((m, i) => ({
        ...m,
        value: Math.round((shares[i] / shareTotal) * total),
        growth: +(2 + rand() * 10 - 2).toFixed(1),
        sparkData: Array.from({ length: 6 }, () => total * (shares[i] / shareTotal) * (0.9 + rand() * 0.2)),
      })),
    };
  }, [clientId, clientName, familyMembers, totalAUM]);

  // --- Onboarding ---
  const onboardingChecks = [
    { label: "Identity Verified", subtitle: "KYC Compliant", passed: true },
    { label: "Address Verified", subtitle: "Proof of Residence", passed: true },
    { label: "Bank Account Verified", subtitle: "Account Confirmed", passed: true },
  ];

  // SVG donut helper
  const renderDonut = (size: number, segments: typeof donutSegments) => {
    const r = size / 2 - 4;
    const cx = size / 2;
    const cy = size / 2;
    const innerR = r * 0.6;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => {
          const startRad = ((seg.startAngle - 90) * Math.PI) / 180;
          const endRad = ((seg.endAngle - 90) * Math.PI) / 180;
          const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;
          const x1 = cx + r * Math.cos(startRad);
          const y1 = cy + r * Math.sin(startRad);
          const x2 = cx + r * Math.cos(endRad);
          const y2 = cy + r * Math.sin(endRad);
          const ix1 = cx + innerR * Math.cos(startRad);
          const iy1 = cy + innerR * Math.sin(startRad);
          const ix2 = cx + innerR * Math.cos(endRad);
          const iy2 = cy + innerR * Math.sin(endRad);
          const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
          return <path key={i} d={d} fill={seg.color} />;
        })}
      </svg>
    );
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Hello, {clientName.split(" ")[0]}</h2>
          <p className="text-xs text-muted-foreground">Here's your portfolio overview</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-0 z-50 bg-popover border border-border shadow-lg">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Customise Home</p>
              <p className="text-[10px] text-muted-foreground">Toggle visibility and drag to reorder</p>
            </div>
            <div className="py-1 max-h-[300px] overflow-y-auto">
              {widgetOrder.map((wId, index) => {
                const widget = ALL_WIDGETS.find(w => w.id === wId);
                if (!widget) return null;
                return (
                  <div
                    key={widget.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className="flex items-center gap-2 px-3 py-1.5 cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors"
                  >
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground flex-1">{widget.label}</span>
                    <Switch
                      checked={visibleWidgets.includes(widget.id)}
                      onCheckedChange={(checked) => handleToggle(widget.id, checked)}
                      className="scale-75"
                    />
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Widgets rendered in user-defined order */}
      {widgetOrder.filter(id => isVisible(id)).map(widgetId => {
        switch (widgetId) {
          case "portfolio-summary":
            return (
              <div key={widgetId} className="bg-gradient-to-br from-[hsl(220,60%,50%)] to-[hsl(260,50%,40%)] rounded-2xl p-4 text-white">
                <p className="text-xs text-white/70 mb-1">Total Portfolio Value</p>
                <p className="text-2xl font-bold">
                  {currencySymbol} {totalAUM.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? "text-emerald-300" : "text-red-300"}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{isPositive ? "+" : ""}{changePercent.toFixed(2)}% this month</span>
                </div>
              </div>
            );
          case "client-portfolio":
            return (
              <Card key={widgetId} className="border-border">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Client Portfolio</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex items-center gap-4 mb-3">
                    {renderDonut(72, donutSegments)}
                    <div>
                      <p className="text-lg font-bold text-foreground">{currencySymbol} {totalAUM.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className="text-xs text-emerald-600 font-medium">+{portfolioMonthlyChange}% this month</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {portfolioProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                          <span className="text-xs text-foreground truncate">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <SparklineSvg data={p.sparkData} positive={p.growth >= 0} width={40} height={14} />
                          <span className={`text-[10px] font-semibold tabular-nums ${p.growth >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                            {p.growth >= 0 ? "+" : ""}{p.growth}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          case "valuation":
            return (
              <Card key={widgetId} className="border-border">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Change in Valuation</CardTitle>
                  <div className="flex items-center gap-1">
                    {(['6m', '1y', '3y', '5y'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setValuationPeriod(p)}
                        className={`px-2 py-0.5 rounded text-[9px] transition-all ${
                          valuationPeriod === p
                            ? 'bg-primary text-primary-foreground font-semibold'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >{p.toUpperCase()}</button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 space-y-2">
                  {valuationData.items.map(item => (
                    <div key={item.label} className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <div className="flex items-center gap-2">
                        {item.highlight && (
                          <>
                            <SparklineSvg data={item.sparkData} positive={item.value >= 0} width={40} height={14} />
                            <span className={`text-[10px] font-semibold tabular-nums ${item.value >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                              {item.changePct >= 0 ? "+" : ""}{item.changePct}%
                            </span>
                          </>
                        )}
                        <span className={`text-xs font-medium ${item.highlight ? (item.value >= 0 ? "text-emerald-600" : "text-destructive") : "text-foreground"}`}>
                          {formatTotal(item.value, currencySymbol)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs font-semibold text-foreground">Ending Value</span>
                    <div className="flex items-center gap-2">
                      <SparklineSvg data={valuationData.endSparkData} positive={valuationData.endChangePct >= 0} width={40} height={14} />
                      <span className={`text-[10px] font-semibold tabular-nums ${valuationData.endChangePct >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                        {valuationData.endChangePct >= 0 ? "+" : ""}{valuationData.endChangePct}%
                      </span>
                      <span className="text-xs font-bold text-foreground">{formatTotal(valuationData.endingValue, currencySymbol)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          case "geo":
            return (
              <Card key={widgetId} className="border-border">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Geographic Diversification</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="relative h-32 mb-3">
                    <WorldMapSVG className="w-full h-full" />
                    {geoDiversification.map((region) => (
                      <div
                        key={region.name}
                        className="absolute flex items-center justify-center"
                        style={{ left: `${region.x}%`, top: `${region.y}%`, transform: "translate(-50%, -50%)" }}
                      >
                        <span
                          className="w-3 h-3 rounded-full border-2 border-background shadow-sm"
                          style={{ backgroundColor: region.color }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {geoDiversification.map(r => (
                      <div key={r.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                          <span className="text-[10px] text-muted-foreground">{r.name}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-foreground">{r.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          case "family":
            return (
              <Card key={widgetId} className="border-border">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Family & Relationships</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    <div className="flex flex-col items-center gap-1 min-w-[64px]">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                        <span className="text-xs font-bold text-primary">{clientName.charAt(0)}</span>
                      </div>
                      <span className="text-[10px] font-medium text-foreground text-center">You</span>
                      <span className="text-[9px] text-muted-foreground">{currencySymbol} {totalAUM.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    {familyMembers.map((m, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 min-w-[64px]">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-[10px] font-bold text-muted-foreground">{m.initials}</span>
                        </div>
                        <span className="text-[10px] font-medium text-foreground text-center">{m.name}</span>
                        <span className="text-[9px] text-muted-foreground">{m.relationship}, {m.age}</span>
                        <span className="text-[9px] text-muted-foreground">{currencySymbol} {m.aum.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          case "household":
            return (
              <Card key={widgetId} className="border-border">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Household</CardTitle>
                    <span className="text-xs text-emerald-600 font-medium">YTD +{householdData.ytdGrowth}%</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{currencySymbol} {householdData.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 space-y-2">
                  {householdData.members.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground">{m.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <SparklineSvg data={m.sparkData} positive={m.growth >= 0} width={36} height={12} />
                        <span className={`text-[10px] font-semibold tabular-nums ${m.growth >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                          {m.growth >= 0 ? "+" : ""}{m.growth}%
                        </span>
                        <span className="text-xs font-medium text-foreground">{currencySymbol} {m.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          case "onboarding":
            return (
              <Card key={widgetId} className="border-border">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium">Onboarding</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div><span className="text-muted-foreground block">Name</span><span className="font-medium text-foreground">{clientName}</span></div>
                    <div><span className="text-muted-foreground block">ID Number</span><span className="font-medium text-foreground">••••••••</span></div>
                    <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">••••••••</span></div>
                    <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">•••@••••</span></div>
                  </div>
                  <div className="space-y-1.5">
                    {onboardingChecks.map((check, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-[10px] font-medium text-foreground">{check.label}</p>
                          <p className="text-[9px] text-muted-foreground">{check.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                    <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">Successfully Onboarded & Compliant</span>
                  </div>
                </CardContent>
              </Card>
            );
          case "holdings":
            return (
              <div key={widgetId}>
                <h3 className="text-sm font-semibold text-foreground mb-2">Your Holdings</h3>
                <div className="space-y-2">
                  {data.onPlatformProducts.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{p.product}</p>
                        <p className="text-[10px] text-muted-foreground">{p.investmentHouse}</p>
                      </div>
                      <p className="text-xs font-semibold text-foreground shrink-0">{p.amount}</p>
                    </div>
                  ))}
                  {data.externalProducts.slice(0, 2).map((p, i) => (
                    <div key={`ext-${i}`} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{p.product}</p>
                        <p className="text-[10px] text-muted-foreground">{p.provider}</p>
                      </div>
                      <p className="text-xs font-semibold text-foreground shrink-0">{p.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          case "meeting":
            return (
              <div key={widgetId}>
                <h3 className="text-sm font-semibold text-foreground mb-2">Upcoming Meeting</h3>
                <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Annual Portfolio Review</p>
                    <p className="text-[10px] text-muted-foreground">Next Thursday at 10:00 AM</p>
                  </div>
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default ClientHomeTab;
