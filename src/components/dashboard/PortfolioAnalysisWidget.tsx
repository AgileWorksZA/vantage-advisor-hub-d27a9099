import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X } from "lucide-react";

const feeComparison = { current: 1.85, model: 1.25 };

const allocationComparison = [
  { asset: "Equities", current: 45, model: 55, color: "hsl(var(--brand-blue))" },
  { asset: "Bonds", current: 35, model: 25, color: "hsl(var(--brand-orange))" },
  { asset: "Property", current: 10, model: 12, color: "hsl(142, 76%, 36%)" },
  { asset: "Cash", current: 10, model: 8, color: "hsl(280, 65%, 60%)" },
];

const performanceChartData: Record<string, { labels: string[]; current: number[]; model: number[]; benchmark: number[] }> = {
  '6m': {
    labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    current: [100, 101.2, 102.1, 102.8, 103.5, 104.2],
    model: [100, 102.1, 103.5, 105.2, 106.1, 106.8],
    benchmark: [100, 101.8, 102.9, 104.1, 105.0, 105.5],
  },
  '1y': {
    labels: ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
    current: [100, 102.1, 104.5, 106.2, 107.5, 108.5],
    model: [100, 104.2, 107.8, 109.5, 111.2, 112.4],
    benchmark: [100, 103.5, 106.2, 108.1, 109.5, 110.2],
  },
  '3y': {
    labels: ["Y1", "Y1.5", "Y2", "Y2.5", "Y3"],
    current: [100, 108.2, 115.5, 120.8, 124.8],
    model: [100, 112.5, 125.2, 132.8, 138.2],
    benchmark: [100, 110.5, 120.2, 127.5, 132.1],
  },
  '5y': {
    labels: ["Y1", "Y2", "Y3", "Y4", "Y5"],
    current: [100, 108.5, 118.2, 130.5, 142.5],
    model: [100, 113.5, 132.2, 152.8, 168.4],
    benchmark: [100, 111.2, 125.5, 142.1, 155.8],
  },
};

const periods: Array<'6m' | '1y' | '3y' | '5y'> = ['6m', '1y', '3y', '5y'];

interface PortfolioAnalysisWidgetProps {
  region?: string;
}

export function PortfolioAnalysisWidget({ region }: PortfolioAnalysisWidgetProps) {
  const modelLabel = region === 'US' ? 'TAMP' : 'Model';
  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '1y' | '3y' | '5y'>('1y');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const chartData = performanceChartData[selectedPeriod];
  const allValues = [...chartData.current, ...chartData.model, ...chartData.benchmark];
  const minValue = Math.min(...allValues) * 0.98;
  const maxValue = Math.max(...allValues) * 1.02;
  const range = maxValue - minValue;

  const width = 280;
  const height = 90;
  const padding = { left: 0, right: 0, top: 8, bottom: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getPoints = (data: number[]) =>
    data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartWidth,
      y: padding.top + chartHeight - ((d - minValue) / range) * chartHeight,
      value: d,
    }));

  const currentPoints = getPoints(chartData.current);
  const modelPoints = getPoints(chartData.model);
  const benchmarkPoints = getPoints(chartData.benchmark);

  const createPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const createAreaPath = (points: { x: number; y: number }[]) => {
    const linePath = createPath(points);
    return `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Portfolio Overview</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {/* Performance Chart */}
        <div className="mb-2 pb-2 border-b border-border/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-muted-foreground">Performance Comparison</p>
            <div className="flex gap-1">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-2 py-0.5 rounded text-[9px] transition-all duration-200 ${
                    selectedPeriod === period
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {period.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible cursor-crosshair">
            <defs>
              <linearGradient id="widgetAnalysisAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--brand-blue))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--brand-blue))" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path d={createAreaPath(modelPoints)} fill="url(#widgetAnalysisAreaGradient)" />

            {/* Benchmark line - dashed */}
            <path d={createPath(benchmarkPoints)} fill="none" stroke="hsl(142, 76%, 36%)" strokeWidth="1.5" strokeDasharray="4,2" strokeLinecap="round" opacity="0.7" />

            {/* Current portfolio line */}
            <path d={createPath(currentPoints)} fill="none" stroke="hsl(var(--brand-orange))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Model portfolio line */}
            <path d={createPath(modelPoints)} fill="none" stroke="hsl(var(--brand-blue))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Interactive hover points */}
            {currentPoints.map((point, i) => (
              <g key={i}>
                <circle cx={point.x} cy={point.y} r="12" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} />
                {hoveredPoint === i && (
                  <g>
                    <line x1={point.x} y1={padding.top} x2={point.x} y2={height - padding.bottom} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                    <circle cx={currentPoints[i].x} cy={currentPoints[i].y} r="4" fill="hsl(var(--brand-orange))" />
                    <circle cx={modelPoints[i].x} cy={modelPoints[i].y} r="4" fill="hsl(var(--brand-blue))" />
                    <circle cx={benchmarkPoints[i].x} cy={benchmarkPoints[i].y} r="3" fill="hsl(142, 76%, 36%)" />
                    <rect x={point.x - 45} y={point.y - 48} width="90" height="40" rx="4" fill="hsl(var(--foreground))" opacity="0.9" />
                    <text x={point.x} y={point.y - 34} textAnchor="middle" className="fill-[hsl(var(--brand-orange))] text-[9px] font-medium">
                      Current: {chartData.current[i].toFixed(1)}
                    </text>
                    <text x={point.x} y={point.y - 22} textAnchor="middle" className="fill-[hsl(var(--brand-blue))] text-[9px] font-medium">
                      {modelLabel}: {chartData.model[i].toFixed(1)}
                    </text>
                    <text x={point.x} y={point.y - 10} textAnchor="middle" className="fill-[hsl(142,76%,36%)] text-[9px] font-medium">
                      Bench: {chartData.benchmark[i].toFixed(1)}
                    </text>
                  </g>
                )}
              </g>
            ))}

            {/* X-axis labels */}
            {chartData.labels.map((label, i) => (
              <text key={i} x={padding.left + (i / (chartData.labels.length - 1)) * chartWidth} y={height - 4} textAnchor="middle" className="fill-muted-foreground text-[8px]">
                {label}
              </text>
            ))}
          </svg>

          {/* Legend */}
          <div className="flex justify-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[hsl(var(--brand-orange))]" />
              <span className="text-[8px] text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[hsl(var(--brand-blue))]" />
              <span className="text-[8px] text-muted-foreground">{modelLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 border-t border-dashed border-[hsl(142,76%,36%)]" />
              <span className="text-[8px] text-muted-foreground">Benchmark</span>
            </div>
          </div>
        </div>

        {/* Fee Comparison */}
        <div className="mb-2 pb-2 border-b border-border/30">
          <p className="text-[10px] text-muted-foreground mb-2">Annual Fee Comparison</p>
          <div className="space-y-1">
            {[
              { label: "Current", value: feeComparison.current, color: "hsl(var(--brand-orange))" },
              { label: modelLabel, value: feeComparison.model, color: "hsl(var(--brand-blue))" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground w-12">{item.label}</span>
                <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(item.value / 2.5) * 100}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-[10px] font-medium text-foreground w-10 text-right">{item.value}%</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-[hsl(142,76%,36%)] mt-1 text-center">
            Potential fee saving: {(feeComparison.current - feeComparison.model).toFixed(2)}% p.a.
          </p>
        </div>

        {/* Asset Allocation */}
        <div>
          <p className="text-[10px] text-muted-foreground mb-2">Asset Allocation</p>
          <div className="space-y-1">
            {allocationComparison.map((item) => (
              <div key={item.asset} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[9px] text-muted-foreground w-12">{item.asset}</span>
                <div className="flex-1 flex items-center gap-1">
                  <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full" style={{ width: `${item.current}%`, backgroundColor: "hsl(var(--brand-orange))" }} />
                  </div>
                  <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full" style={{ width: `${item.model}%`, backgroundColor: "hsl(var(--brand-blue))" }} />
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground w-14 text-right">{item.current}% / {item.model}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
