import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

interface Holding {
  name: string;
  value: number;
  change: number;
  color: string;
}

const holdings: Holding[] = [
  { name: "Equity Fund", value: 125000, change: 8.2, color: "hsl(var(--brand-blue))" },
  { name: "Bond Portfolio", value: 85000, change: 4.5, color: "hsl(var(--brand-orange))" },
  { name: "Property REIT", value: 62000, change: 6.8, color: "hsl(142, 76%, 36%)" },
  { name: "Money Market", value: 43000, change: 2.1, color: "hsl(280, 65%, 60%)" },
];

const performanceData = [
  { month: "Jan", value: 245000 },
  { month: "Feb", value: 252000 },
  { month: "Mar", value: 248000 },
  { month: "Apr", value: 265000 },
  { month: "May", value: 278000 },
  { month: "Jun", value: 285000 },
  { month: "Jul", value: 292000 },
  { month: "Aug", value: 288000 },
  { month: "Sep", value: 305000 },
  { month: "Oct", value: 312000 },
  { month: "Nov", value: 308000 },
  { month: "Dec", value: 315000 },
];

const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

function PerformanceChart() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const minValue = Math.min(...performanceData.map((d) => d.value)) * 0.95;
  const maxValue = Math.max(...performanceData.map((d) => d.value)) * 1.02;
  const range = maxValue - minValue;

  const width = 280;
  const height = 80;
  const padding = { left: 0, right: 0, top: 8, bottom: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = performanceData.map((d, i) => {
    const x = padding.left + (i / (performanceData.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d.value - minValue) / range) * chartHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  return (
    <div
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">Performance (12 months)</span>
        <span className="text-xs text-[hsl(142,76%,36%)] font-medium">+28.6%</span>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--brand-blue))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--brand-blue))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--brand-blue))" />
            <stop offset="100%" stopColor="hsl(var(--brand-orange))" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#areaGradient)"
          className="transition-all duration-1000"
          style={{
            opacity: isVisible ? 1 : 0,
          }}
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-1000"
          style={{
            strokeDasharray: isVisible ? "none" : "1000",
            strokeDashoffset: isVisible ? 0 : 1000,
          }}
        />

        {/* End point */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="4"
          fill="hsl(var(--brand-orange))"
          className="transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transitionDelay: "800ms",
          }}
        />
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="8"
          fill="hsl(var(--brand-orange))"
          opacity="0.3"
          className="animate-pulse"
        />

        {/* X-axis labels */}
        {[0, 3, 6, 9, 11].map((i) => (
          <text
            key={i}
            x={points[i].x}
            y={height - 4}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {performanceData[i].month}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function HeroPortfolioCard() {
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const duration = 2000;
    const steps = 60;
    const increment = totalValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalValue) {
        setAnimatedTotal(totalValue);
        clearInterval(timer);
      } else {
        setAnimatedTotal(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  // Calculate donut chart segments
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div
      className={`relative bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl transition-all duration-700 max-w-sm ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Client Portfolio</h3>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>
      </div>

      {/* Portfolio Value with Donut */}
      <div className="flex items-center gap-5 mb-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="10"
            />
            {holdings.map((holding, index) => {
              const percentage = holding.value / totalValue;
              const strokeLength = percentage * circumference;
              const offset = cumulativeOffset;
              cumulativeOffset += strokeLength;

              return (
                <circle
                  key={holding.name}
                  cx="55"
                  cy="55"
                  r={radius}
                  fill="none"
                  stroke={holding.color}
                  strokeWidth="10"
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={-offset}
                  className="transition-all duration-1000"
                  style={{
                    transitionDelay: `${index * 200}ms`,
                  }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[hsl(var(--brand-blue))]" />
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Total Value</p>
          <p className="text-2xl font-bold text-foreground">
            R{animatedTotal.toLocaleString()}
          </p>
          <p className="text-xs text-[hsl(142,76%,36%)] flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" />
            +5.8% this month
          </p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mb-4 pt-3 border-t border-border/30">
        <PerformanceChart />
      </div>

      {/* Holdings List */}
      <div className="space-y-2">
        {holdings.map((holding, index) => (
          <div
            key={holding.name}
            className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 transition-all duration-500"
            style={{
              transitionDelay: `${(index + 1) * 150}ms`,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(20px)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: holding.color }}
              />
              <span className="text-xs font-medium text-foreground">{holding.name}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-foreground">
                R{holding.value.toLocaleString()}
              </p>
              <p className="text-[10px] text-[hsl(142,76%,36%)]">+{holding.change}%</p>
            </div>
          </div>
        ))}
      </div>

      {/* Floating decoration */}
      <div className="absolute -top-3 -right-3 w-16 h-16 bg-[hsl(var(--brand-blue))]/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[hsl(var(--brand-orange))]/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
    </div>
  );
}
