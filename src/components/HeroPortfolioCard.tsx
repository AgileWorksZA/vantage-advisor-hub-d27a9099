import { useEffect, useState, useRef } from "react";
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
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [displayValue, setDisplayValue] = useState(performanceData[0].value);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Animate the line drawing from left to right
  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    const startValue = 0;
    const endValue = 20158204;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setAnimationProgress(eased);
      setDisplayValue(Math.round(startValue + (endValue - startValue) * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible]);

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

  // Calculate the total path length for stroke animation
  const pathLength = 1000;
  const visibleLength = pathLength * animationProgress;

  // Find current animated point position
  const currentPointIndex = Math.min(
    Math.floor(animationProgress * (points.length - 1)),
    points.length - 1
  );
  const nextPointIndex = Math.min(currentPointIndex + 1, points.length - 1);
  const segmentProgress = (animationProgress * (points.length - 1)) % 1;
  
  const currentX = points[currentPointIndex].x + (points[nextPointIndex].x - points[currentPointIndex].x) * segmentProgress;
  const currentY = points[currentPointIndex].y + (points[nextPointIndex].y - points[currentPointIndex].y) * segmentProgress;

  return (
    <div
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">Performance (12 months)</span>
        <span className="text-xs text-[hsl(142,76%,36%)] font-medium tabular-nums">
          R{displayValue.toLocaleString()}
        </span>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible cursor-crosshair">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--brand-blue))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--brand-blue))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--brand-blue))" />
            <stop offset="100%" stopColor="hsl(var(--brand-orange))" />
          </linearGradient>
          <clipPath id="areaClip">
            <rect x="0" y="0" width={chartWidth * animationProgress} height={height} />
          </clipPath>
        </defs>

        <path
          d={areaPath}
          fill="url(#areaGradient)"
          clipPath="url(#areaClip)"
        />

        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength - visibleLength}
        />

        {/* Animated current point */}
        {animationProgress > 0 && animationProgress < 1 && (
          <>
            <circle
              cx={currentX}
              cy={currentY}
              r="4"
              fill="hsl(var(--brand-orange))"
              className="drop-shadow-sm"
            />
            <circle
              cx={currentX}
              cy={currentY}
              r="8"
              fill="hsl(var(--brand-orange))"
              opacity="0.3"
              className="animate-pulse"
            />
          </>
        )}

        {/* Interactive hover points - only show after animation */}
        {animationProgress >= 1 && points.map((point, i) => (
          <g key={i}>
            {/* Invisible larger hit area */}
            <circle
              cx={point.x}
              cy={point.y}
              r="12"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            {/* Visible point */}
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredPoint === i ? 5 : i === points.length - 1 ? 4 : 0}
              fill={i === points.length - 1 ? "hsl(var(--brand-orange))" : "hsl(var(--brand-blue))"}
              className="transition-all duration-200"
            />
            {/* Hover tooltip */}
            {hoveredPoint === i && (
              <g>
                <rect
                  x={point.x - 35}
                  y={point.y - 32}
                  width="70"
                  height="24"
                  rx="4"
                  fill="hsl(var(--foreground))"
                  opacity="0.9"
                />
                <text
                  x={point.x}
                  y={point.y - 16}
                  textAnchor="middle"
                  className="fill-background text-[10px] font-medium"
                >
                  R{point.value.toLocaleString()}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* Pulsing end point - only show after animation completes */}
        {animationProgress >= 1 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="8"
            fill="hsl(var(--brand-orange))"
            opacity="0.3"
            className="animate-pulse"
          />
        )}

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

// Family Group Card - Shows family members with their portfolios
function FamilyGroupCard({ onClick }: { onClick?: () => void }) {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  
  const familyMembers = [
    { name: "James Smith", role: "Primary", value: 8500000, change: 12.4, color: "hsl(var(--brand-blue))" },
    { name: "Sarah Smith", role: "Spouse", value: 6200000, change: 8.7, color: "hsl(var(--brand-orange))" },
    { name: "Michael Smith", role: "Child", value: 3100000, change: 15.2, color: "hsl(142, 76%, 36%)" },
    { name: "Emma Smith", role: "Child", value: 2358204, change: 9.8, color: "hsl(280, 65%, 60%)" },
  ];

  const familyTotal = familyMembers.reduce((sum, m) => sum + m.value, 0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = familyTotal / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= familyTotal) {
        setAnimatedTotal(familyTotal);
        clearInterval(timer);
      } else {
        setAnimatedTotal(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  // Mini donut chart data
  const total = familyMembers.reduce((sum, m) => sum + m.value, 0);
  let cumulativePercent = 0;

  return (
    <div 
      className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl h-full cursor-pointer transition-all duration-300 hover:border-[hsl(var(--brand-blue))]/50 flex flex-col"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">Smith Family Group</h3>
        <Users className="w-5 h-5 text-[hsl(var(--brand-blue))]" />
      </div>

      {/* Family total and mini chart */}
      <div className="flex items-center gap-4 mb-4 pb-3 border-b border-border/30">
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {familyMembers.map((member, index) => {
              const percent = (member.value / total) * 100;
              const dashArray = `${percent} ${100 - percent}`;
              const dashOffset = -cumulativePercent;
              cumulativePercent += percent;
              return (
                <circle
                  key={index}
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke={member.color}
                  strokeWidth={hoveredMember === index ? "5" : "4"}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Combined Value</p>
          <p className="text-xl font-bold text-foreground tabular-nums">R{animatedTotal.toLocaleString()}</p>
          <p className="text-xs text-[hsl(142,76%,36%)]">+11.2% YTD</p>
        </div>
      </div>

      {/* Family members list */}
      <div className="flex-1 space-y-2">
        {familyMembers.map((member, index) => (
          <div 
            key={index}
            className={`flex items-center justify-between py-2 px-2 -mx-2 rounded-lg transition-all duration-200 ${
              hoveredMember === index ? "bg-muted/50" : ""
            }`}
            onMouseEnter={() => setHoveredMember(index)}
            onMouseLeave={() => setHoveredMember(null)}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: member.color }}
              />
              <div>
                <p className="text-xs font-medium text-foreground">{member.name}</p>
                <p className="text-[10px] text-muted-foreground">{member.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-foreground">R{member.value.toLocaleString()}</p>
              <p className="text-[10px] text-[hsl(142,76%,36%)]">+{member.change}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fund Switch Transaction Card - Shows switching between funds with performance comparison
function FundSwitchCard({ onClick }: { onClick?: () => void }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const switchAmount = 2500000;
  const fromFund = { name: "Conservative Bond Fund", oldPerformance: 4.2 };
  const toFund = { name: "Growth Equity Fund", newPerformance: 12.8 };

  // Performance comparison data
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const oldFundData = [100, 100.8, 101.2, 101.8, 102.1, 102.5];
  const newFundData = [100, 102.1, 103.8, 106.2, 108.5, 112.8];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible]);

  // Chart dimensions
  const width = 280;
  const height = 100;
  const padding = { left: 0, right: 0, top: 10, bottom: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minValue = 98;
  const maxValue = 115;
  const range = maxValue - minValue;

  const getPoints = (data: number[]) => {
    return data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartWidth,
      y: padding.top + chartHeight - ((d - minValue) / range) * chartHeight,
      value: d
    }));
  };

  const oldPoints = getPoints(oldFundData);
  const newPoints = getPoints(newFundData);

  const createPath = (points: { x: number; y: number }[]) => {
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  };

  const pathLength = 1000;
  const visibleLength = pathLength * animationProgress;

  const projectedGain = ((newFundData[newFundData.length - 1] - oldFundData[oldFundData.length - 1]) / 100) * switchAmount;

  return (
    <div 
      className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl h-full cursor-pointer transition-all duration-300 hover:border-[hsl(142,76%,36%)]/50 flex flex-col"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">Fund Switch</h3>
        <div className="flex items-center gap-1 px-2 py-1 bg-[hsl(142,76%,36%)]/10 rounded-full">
          <TrendingUp className="w-3 h-3 text-[hsl(142,76%,36%)]" />
          <span className="text-[10px] font-medium text-[hsl(142,76%,36%)]">Completed</span>
        </div>
      </div>

      {/* Switch details */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground">From</p>
          <p className="text-xs font-medium text-foreground truncate">{fromFund.name}</p>
          <p className="text-[10px] text-muted-foreground">+{fromFund.oldPerformance}% p.a.</p>
        </div>
        <div className="flex flex-col items-center px-2">
          <svg className="w-6 h-6 text-[hsl(var(--brand-blue))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <p className="text-[9px] text-muted-foreground mt-1">R{(switchAmount / 1000000).toFixed(1)}M</p>
        </div>
        <div className="flex-1 text-right">
          <p className="text-[10px] text-muted-foreground">To</p>
          <p className="text-xs font-medium text-foreground truncate">{toFund.name}</p>
          <p className="text-[10px] text-[hsl(142,76%,36%)]">+{toFund.newPerformance}% p.a.</p>
        </div>
      </div>

      {/* Performance comparison chart */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">6-Month Performance Comparison</span>
        </div>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <defs>
            <linearGradient id="newFundGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Old fund line (dashed) */}
          <path
            d={createPath(oldPoints)}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.5"
            style={{
              strokeDasharray: `4 4`,
              strokeDashoffset: 0,
            }}
          />

          {/* New fund area */}
          <path
            d={`${createPath(newPoints)} L ${newPoints[newPoints.length - 1].x} ${height - padding.bottom} L ${newPoints[0].x} ${height - padding.bottom} Z`}
            fill="url(#newFundGradient)"
            style={{
              clipPath: `inset(0 ${100 - animationProgress * 100}% 0 0)`,
            }}
          />

          {/* New fund line */}
          <path
            d={createPath(newPoints)}
            fill="none"
            stroke="hsl(142, 76%, 36%)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength - visibleLength}
          />

          {/* End points */}
          {animationProgress >= 1 && (
            <>
              <circle cx={oldPoints[oldPoints.length - 1].x} cy={oldPoints[oldPoints.length - 1].y} r="3" fill="hsl(var(--muted-foreground))" opacity="0.5" />
              <circle cx={newPoints[newPoints.length - 1].x} cy={newPoints[newPoints.length - 1].y} r="4" fill="hsl(142, 76%, 36%)" />
              <circle cx={newPoints[newPoints.length - 1].x} cy={newPoints[newPoints.length - 1].y} r="8" fill="hsl(142, 76%, 36%)" opacity="0.3" className="animate-pulse" />
            </>
          )}

          {/* Month labels */}
          {months.map((month, i) => (
            <text
              key={i}
              x={padding.left + (i / (months.length - 1)) * chartWidth}
              y={height - 4}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {month}
            </text>
          ))}
        </svg>

        {/* Legend and projected gain */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-muted-foreground opacity-50" style={{ backgroundImage: "repeating-linear-gradient(90deg, currentColor 0, currentColor 4px, transparent 4px, transparent 8px)" }} />
              <span className="text-[10px] text-muted-foreground">Old Fund</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-[hsl(142,76%,36%)]" />
              <span className="text-[10px] text-muted-foreground">New Fund</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Projected Gain</p>
            <p className="text-sm font-bold text-[hsl(142,76%,36%)]">+R{Math.round(projectedGain).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Portfolio Card
function PortfolioCard({ isPaused }: { isPaused: boolean }) {
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [hoveredHolding, setHoveredHolding] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const visibleCount = 4;

  useEffect(() => {
    setIsVisible(true);
    const duration = 2000;
    const steps = 60;
    const targetValue = 20158204;
    const increment = targetValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setAnimatedTotal(targetValue);
        clearInterval(timer);
      } else {
        setAnimatedTotal(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll holdings (pauses on hover)
  useEffect(() => {
    if (isPaused) return;
    const scrollTimer = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % holdings.length);
    }, 2500);
    return () => clearInterval(scrollTimer);
  }, [isPaused]);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  // Get visible holdings with wrap-around
  const getVisibleHoldings = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (scrollIndex + i) % holdings.length;
      visible.push({ ...holdings[index], originalIndex: index });
    }
    return visible;
  };

  // Calculate segment angles for hover detection
  const getSegmentData = () => {
    let cumulative = 0;
    return holdings.map((holding) => {
      const percentage = holding.value / totalValue;
      const strokeLength = percentage * circumference;
      const data = { ...holding, offset: cumulative, length: strokeLength, percentage };
      cumulative += strokeLength;
      return data;
    });
  };

  const segments = getSegmentData();

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
            {segments.map((segment, index) => (
              <circle
                key={segment.name}
                cx="55"
                cy="55"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={hoveredSegment === index ? 14 : 10}
                strokeDasharray={`${segment.length} ${circumference}`}
                strokeDashoffset={-segment.offset}
                className="transition-all duration-300 cursor-pointer"
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {hoveredSegment !== null ? (
              <div className="text-center">
                <p className="text-[8px] text-muted-foreground truncate max-w-[50px]">{holdings[hoveredSegment].name}</p>
                <p className="text-[10px] font-bold text-foreground">{(holdings[hoveredSegment].value / totalValue * 100).toFixed(0)}%</p>
              </div>
            ) : (
              <TrendingUp className="w-5 h-5 text-[hsl(var(--brand-blue))]" />
            )}
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
              className={`flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 rounded px-1 -mx-1 cursor-pointer transition-all duration-200 ${
                hoveredHolding === index ? "bg-muted/50 scale-[1.02]" : ""
              }`}
              style={{
                opacity: isVisible ? 1 : 0,
                animation: "slideUp 0.4s ease-out forwards",
                animationDelay: `${index * 50}ms`,
              }}
              onMouseEnter={() => setHoveredHolding(index)}
              onMouseLeave={() => setHoveredHolding(null)}
            >
              <div className="flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-200 ${hoveredHolding === index ? "scale-150" : ""}`} 
                  style={{ backgroundColor: holding.color }} 
                />
                <span className="text-xs font-medium text-foreground truncate">{holding.name}</span>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-medium text-foreground">R{holding.value.toLocaleString()}</p>
                <p className="text-[10px] text-[hsl(142,76%,36%)]">+{holding.change}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HeroPortfolioCard() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeCard, setActiveCard] = useState(0); // 0 = Portfolio, 1 = Client, 2 = Compliance

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const cycleCards = (clickedIndex: number) => {
    if (clickedIndex !== 0) {
      setActiveCard(clickedIndex);
      setTimeout(() => setActiveCard(0), 3000); // Return to portfolio after 3s
    }
  };

  const getCardTransform = (cardIndex: number) => {
    const positions = [
      // Portfolio front
      { front: "translateX(0px) translateZ(0px) rotateY(0deg)", back: "translateX(16px) translateZ(-40px) rotateY(0deg)", hover: "translateX(0px) translateZ(0px) rotateY(0deg)" },
      // Client Overview middle
      { front: "translateX(0px) translateZ(0px) rotateY(0deg)", back: "translateX(8px) translateZ(-20px) rotateY(0deg)", hover: "translateX(-30px) translateZ(-40px) rotateY(8deg)" },
      // Compliance back
      { front: "translateX(0px) translateZ(0px) rotateY(0deg)", back: "translateX(16px) translateZ(-40px) rotateY(0deg)", hover: "translateX(-60px) translateZ(-80px) rotateY(15deg)" },
    ];

    if (!isVisible) {
      return `translateX(${200 - cardIndex * 50}px) translateZ(-${cardIndex * 20}px) rotateY(0deg)`;
    }

    if (activeCard === cardIndex) {
      return positions[cardIndex].front;
    }

    if (isHovered) {
      return positions[cardIndex].hover;
    }

    return positions[cardIndex].back;
  };

  const getCardOpacity = (cardIndex: number) => {
    if (!isVisible) return 0;
    if (activeCard === cardIndex) return 1;
    if (isHovered) return cardIndex === 2 ? 1 : cardIndex === 1 ? 1 : 0.85;
    return cardIndex === 0 ? 1 : cardIndex === 1 ? 0.85 : 0.7;
  };

  const getCardZIndex = (cardIndex: number) => {
    if (activeCard === cardIndex) return 30;
    if (cardIndex === 0) return 20;
    if (cardIndex === 1) return 10;
    return 0;
  };

  return (
    <div
      className="relative w-[340px] h-[480px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: "1000px" }}
    >
      {/* Card 3 - Fund Switch */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          transform: getCardTransform(2),
          opacity: getCardOpacity(2),
          zIndex: getCardZIndex(2),
          transformStyle: "preserve-3d",
        }}
      >
        <FundSwitchCard onClick={() => cycleCards(2)} />
      </div>

      {/* Card 2 - Family Group */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          transform: getCardTransform(1),
          opacity: getCardOpacity(1),
          zIndex: getCardZIndex(1),
          transitionDelay: "100ms",
          transformStyle: "preserve-3d",
        }}
      >
        <FamilyGroupCard onClick={() => cycleCards(1)} />
      </div>

      {/* Card 1 - Portfolio */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          transform: getCardTransform(0),
          opacity: getCardOpacity(0),
          zIndex: getCardZIndex(0),
          transitionDelay: "200ms",
          transformStyle: "preserve-3d",
        }}
      >
        <PortfolioCard isPaused={isHovered} />
        {/* Floating decoration */}
        <div className="absolute -top-3 -right-3 w-16 h-16 bg-[hsl(var(--brand-blue))]/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[hsl(var(--brand-orange))]/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
}
