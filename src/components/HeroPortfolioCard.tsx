import { useEffect, useState } from "react";
import { TrendingUp, Users, FileText } from "lucide-react";

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
  { name: "Global ETF", value: 78000, change: 7.3, color: "hsl(200, 70%, 50%)" },
  { name: "Tech Growth", value: 95000, change: 12.1, color: "hsl(340, 65%, 55%)" },
  { name: "Dividend Income", value: 54000, change: 3.8, color: "hsl(160, 60%, 45%)" },
  { name: "Emerging Markets", value: 38000, change: 9.4, color: "hsl(45, 80%, 50%)" },
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

        <path
          d={areaPath}
          fill="url(#areaGradient)"
          className="transition-all duration-1000"
          style={{ opacity: isVisible ? 1 : 0 }}
        />

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

        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="4"
          fill="hsl(var(--brand-orange))"
          className="transition-all duration-500"
          style={{ opacity: isVisible ? 1 : 0, transitionDelay: "800ms" }}
        />
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="8"
          fill="hsl(var(--brand-orange))"
          opacity="0.3"
          className="animate-pulse"
        />

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

// Back card 1 - Client Overview
function ClientOverviewCard() {
  return (
    <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Client Overview</h3>
        <Users className="w-5 h-5 text-[hsl(var(--brand-blue))]" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-border/30">
          <span className="text-xs text-muted-foreground">Active Clients</span>
          <span className="text-sm font-semibold text-foreground">1,247</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border/30">
          <span className="text-xs text-muted-foreground">New This Month</span>
          <span className="text-sm font-semibold text-[hsl(142,76%,36%)]">+34</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border/30">
          <span className="text-xs text-muted-foreground">Total AUM</span>
          <span className="text-sm font-semibold text-foreground">R2.4B</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-xs text-muted-foreground">Avg. Portfolio</span>
          <span className="text-sm font-semibold text-foreground">R1.9M</span>
        </div>
      </div>
    </div>
  );
}

// Back card 2 - Compliance Status
function ComplianceCard() {
  return (
    <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Compliance</h3>
        <FileText className="w-5 h-5 text-[hsl(var(--brand-orange))]" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-border/30">
          <span className="text-xs text-muted-foreground">FICA Complete</span>
          <span className="text-xs font-semibold text-[hsl(142,76%,36%)] bg-[hsl(142,76%,36%)]/10 px-2 py-0.5 rounded">98%</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border/30">
          <span className="text-xs text-muted-foreground">Risk Profiles</span>
          <span className="text-xs font-semibold text-[hsl(142,76%,36%)] bg-[hsl(142,76%,36%)]/10 px-2 py-0.5 rounded">100%</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border/30">
          <span className="text-xs text-muted-foreground">Reviews Due</span>
          <span className="text-xs font-semibold text-[hsl(var(--brand-orange))] bg-[hsl(var(--brand-orange))]/10 px-2 py-0.5 rounded">12</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-xs text-muted-foreground">Pending Tasks</span>
          <span className="text-xs font-semibold text-[hsl(var(--brand-blue))] bg-[hsl(var(--brand-blue))]/10 px-2 py-0.5 rounded">8</span>
        </div>
      </div>
    </div>
  );
}

// Main Portfolio Card
function PortfolioCard() {
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);
  const visibleCount = 4;

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

  // Auto-scroll holdings
  useEffect(() => {
    const scrollTimer = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % holdings.length);
    }, 2500);
    return () => clearInterval(scrollTimer);
  }, []);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  // Get visible holdings with wrap-around
  const getVisibleHoldings = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (scrollIndex + i) % holdings.length;
      visible.push({ ...holdings[index], originalIndex: index });
    }
    return visible;
  };

  return (
    <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Client Portfolio</h3>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>
      </div>

      <div className="flex items-center gap-5 mb-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
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
                  style={{ transitionDelay: `${index * 200}ms` }}
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
          <p className="text-2xl font-bold text-foreground">R{animatedTotal.toLocaleString()}</p>
          <p className="text-xs text-[hsl(142,76%,36%)] flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" />
            +5.8% this month
          </p>
        </div>
      </div>

      <div className="mb-3 pt-3 border-t border-border/30">
        <PerformanceChart />
      </div>

      {/* Scrolling Holdings List */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <div className="space-y-1">
          {getVisibleHoldings().map((holding, index) => (
            <div
              key={`${holding.name}-${scrollIndex}`}
              className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 animate-fade-in"
              style={{
                opacity: isVisible ? 1 : 0,
                animation: "slideUp 0.4s ease-out forwards",
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: holding.color }} />
                <span className="text-xs font-medium text-foreground truncate">{holding.name}</span>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-medium text-foreground">R{holding.value.toLocaleString()}</p>
                <p className="text-[10px] text-[hsl(142,76%,36%)]">+{holding.change}%</p>
              </div>
            </div>
          ))}
        </div>
        {/* Scroll indicators */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 py-1">
          {holdings.map((_, index) => (
            <div
              key={index}
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                index === scrollIndex ? "bg-[hsl(var(--brand-blue))] w-3" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HeroPortfolioCard() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative w-[340px] h-[480px] perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: "1000px" }}
    >
      {/* Card 3 - Back (Compliance) */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          transform: isVisible
            ? isHovered
              ? "translateX(-60px) translateZ(-80px) rotateY(15deg)"
              : "translateX(16px) translateZ(-40px) rotateY(0deg)"
            : "translateX(200px) translateZ(-40px) rotateY(0deg)",
          opacity: isVisible ? (isHovered ? 1 : 0.7) : 0,
          transformStyle: "preserve-3d",
        }}
      >
        <ComplianceCard />
      </div>

      {/* Card 2 - Middle (Client Overview) */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          transform: isVisible
            ? isHovered
              ? "translateX(-30px) translateZ(-40px) rotateY(8deg)"
              : "translateX(8px) translateZ(-20px) rotateY(0deg)"
            : "translateX(150px) translateZ(-20px) rotateY(0deg)",
          opacity: isVisible ? (isHovered ? 1 : 0.85) : 0,
          transitionDelay: "100ms",
          transformStyle: "preserve-3d",
        }}
      >
        <ClientOverviewCard />
      </div>

      {/* Card 1 - Front (Portfolio) */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          transform: isVisible
            ? isHovered
              ? "translateX(0px) translateZ(0px) rotateY(0deg)"
              : "translateX(0px) translateZ(0px) rotateY(0deg)"
            : "translateX(100px) translateZ(0px) rotateY(0deg)",
          opacity: isVisible ? 1 : 0,
          transitionDelay: "200ms",
          transformStyle: "preserve-3d",
        }}
      >
        <PortfolioCard />
        {/* Floating decoration */}
        <div className="absolute -top-3 -right-3 w-16 h-16 bg-[hsl(var(--brand-blue))]/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[hsl(var(--brand-orange))]/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
}
