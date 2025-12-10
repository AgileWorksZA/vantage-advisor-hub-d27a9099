import { useEffect, useState, useRef } from "react";
import { TrendingUp, Users, FileText, Plus } from "lucide-react";

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

// Sparkline component for family members
function MemberSparkline({ data, color, isVisible, delay }: { data: number[]; color: string; isVisible: boolean; delay: number }) {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    // Reset animation when card becomes inactive
    if (!isVisible) {
      setAnimationProgress(0);
      return;
    }
    
    const timeout = setTimeout(() => {
      const duration = 1500;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimationProgress(eased);
        if (progress < 1) requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [isVisible, delay]);

  const width = 50;
  const height = 20;
  const padding = 2;
  
  const minValue = Math.min(...data) * 0.95;
  const maxValue = Math.max(...data) * 1.05;
  const range = maxValue - minValue;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (height - padding * 2) - ((d - minValue) / range) * (height - padding * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const pathLength = 200;
  const visibleLength = pathLength * animationProgress;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Clip path for left-to-right reveal */}
      <defs>
        <clipPath id={`sparkClip-${color.replace(/[^a-zA-Z0-9]/g, '')}-${delay}`}>
          <rect 
            x="0" 
            y="0" 
            width={width * animationProgress} 
            height={height} 
          />
        </clipPath>
      </defs>
      
      {/* Animated line with clip path */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath={`url(#sparkClip-${color.replace(/[^a-zA-Z0-9]/g, '')}-${delay})`}
      />
    </svg>
  );
}

// Family Group Card - Shows family members with their portfolios
function FamilyGroupCard({ onClick, isActive }: { onClick?: () => void; isActive?: boolean }) {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [showButtonAnimation, setShowButtonAnimation] = useState(false);
  
  const familyMembers = [
    { 
      name: "James Smith", 
      role: "Primary", 
      value: 8500000, 
      change: 12.4, 
      color: "hsl(var(--brand-blue))",
      // Steady consistent growth with small dips - conservative investor
      sparkData: [75, 77, 76, 79, 81, 80, 83, 85, 84, 87, 90, 92]
    },
    { 
      name: "Sarah Smith", 
      role: "Spouse", 
      value: 6200000, 
      change: 8.7, 
      color: "hsl(var(--brand-orange))",
      // V-shaped recovery - dropped then recovered strongly
      sparkData: [85, 82, 75, 68, 62, 65, 72, 78, 82, 86, 90, 93]
    },
    { 
      name: "Michael Smith", 
      role: "Child", 
      value: 3100000, 
      change: 15.2, 
      color: "hsl(142, 76%, 36%)",
      // Aggressive steep growth - high risk portfolio
      sparkData: [40, 45, 52, 48, 58, 65, 72, 80, 92, 105, 112, 125]
    },
    { 
      name: "Emma Smith", 
      role: "Child", 
      value: 2358204, 
      change: 9.8, 
      color: "hsl(280, 65%, 60%)",
      // Flat then hockey stick - recent acceleration
      sparkData: [70, 71, 70, 72, 71, 73, 74, 78, 85, 95, 102, 108]
    },
  ];

  const familyTotal = familyMembers.reduce((sum, m) => sum + m.value, 0);

  // Reset and animate total when card becomes active
  useEffect(() => {
    if (!isActive) {
      setAnimatedTotal(0);
      setShowButtonAnimation(false);
      return;
    }
    
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

    // Trigger button animation after other animations complete
    const buttonTimer = setTimeout(() => {
      setShowButtonAnimation(true);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearTimeout(buttonTimer);
    };
  }, [isActive]);

  // Mini donut chart data
  const total = familyMembers.reduce((sum, m) => sum + m.value, 0);
  let cumulativePercent = 0;

  return (
    <div 
      className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl h-full cursor-pointer transition-all duration-300 hover:border-[hsl(var(--brand-blue))]/50 flex flex-col"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-semibold text-foreground">Family Grouping</h3>
        <Users className="w-5 h-5 text-[hsl(var(--brand-blue))]" />
      </div>
      <p className="text-xs text-muted-foreground mb-3">Smith Family Group</p>

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
            <div className="flex items-center gap-3">
              {/* Sparkline chart */}
              <MemberSparkline 
                data={member.sparkData} 
                color={member.color} 
                isVisible={isActive ?? false}
                delay={index * 200}
              />
              <div className="text-right min-w-[80px]">
                <p className="text-xs font-medium text-foreground">R{member.value.toLocaleString()}</p>
                <p className="text-[10px] text-[hsl(142,76%,36%)]">+{member.change}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add member button */}
      <div className={`animated-border-button mt-3 ${showButtonAnimation ? 'animate' : ''}`}>
        <button 
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:border-[hsl(var(--brand-blue))]/50 hover:bg-muted/30 transition-all duration-200 group bg-card"
          onClick={(e) => e.stopPropagation()}
        >
          <Plus className="w-4 h-4 group-hover:text-[hsl(var(--brand-blue))] transition-colors" />
          <span className="text-xs">Add Member, Company or Trust</span>
        </button>
      </div>
    </div>
  );
}

// Fund Switch Transaction Card - Shows switching between funds with performance comparison
function FundSwitchCard({ onClick, isActive }: { onClick?: () => void; isActive?: boolean }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredAllocation, setHoveredAllocation] = useState<number | null>(null);
  const [hoveredChartPoint, setHoveredChartPoint] = useState<number | null>(null);
  const [showButtonAnimation, setShowButtonAnimation] = useState(false);

  const switchAmount = 2500000;
  const fromFund = { name: "Conservative Bond Fund", oldPerformance: 4.2 };
  const toFund = { name: "Growth Equity Fund", newPerformance: 12.8 };

  // Performance comparison data
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const oldFundData = [100, 100.8, 101.2, 101.8, 102.1, 102.5];
  const newFundData = [100, 102.1, 103.8, 106.2, 108.5, 112.8];

  // Old fund allocation (Conservative Bond Fund - heavy on bonds/cash)
  const oldFundAllocation = [
    { name: "SA Equities", value: 10, color: "hsl(142, 76%, 36%)" },
    { name: "Global Equities", value: 5, color: "hsl(var(--brand-blue))" },
    { name: "Bonds", value: 55, color: "hsl(var(--brand-orange))" },
    { name: "Property", value: 5, color: "hsl(280, 70%, 50%)" },
    { name: "Cash", value: 25, color: "hsl(var(--muted-foreground))" },
  ];

  // New fund allocation (Growth Equity Fund - heavy on equities)
  const newFundAllocation = [
    { name: "SA Equities", value: 35, color: "hsl(142, 76%, 36%)" },
    { name: "Global Equities", value: 30, color: "hsl(var(--brand-blue))" },
    { name: "Bonds", value: 20, color: "hsl(var(--brand-orange))" },
    { name: "Property", value: 10, color: "hsl(280, 70%, 50%)" },
    { name: "Cash", value: 5, color: "hsl(var(--muted-foreground))" },
  ];

  // Interpolate between old and new allocation based on animation progress
  const currentAllocation = oldFundAllocation.map((old, i) => ({
    ...old,
    currentValue: old.value + (newFundAllocation[i].value - old.value) * animationProgress,
    targetValue: newFundAllocation[i].value,
  }));

  // Reset and restart animation when card becomes active
  useEffect(() => {
    if (!isActive) {
      setAnimationProgress(0);
      setShowButtonAnimation(false);
      return;
    }
    
    const timeout = setTimeout(() => {
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
    }, 500);

    // Trigger button animation after other animations complete (500ms delay + 2000ms animation)
    const buttonTimer = setTimeout(() => {
      setShowButtonAnimation(true);
    }, 3000);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(buttonTimer);
    };
  }, [isActive]);

  // Chart dimensions
  const width = 280;
  const height = 80;
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

  // Calculate allocation bar segments using animated values
  let accumulatedWidth = 0;
  const allocationSegments = currentAllocation.map((item, index) => {
    const segmentWidth = item.currentValue;
    const segment = {
      ...item,
      x: accumulatedWidth,
      width: segmentWidth,
      index
    };
    accumulatedWidth += segmentWidth;
    return segment;
  });

  return (
    <div 
      className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl h-full cursor-pointer transition-all duration-300 hover:border-[hsl(142,76%,36%)]/50 flex flex-col"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-semibold text-foreground">Transact</h3>
        <div className="flex items-center gap-1 px-2 py-1 bg-[hsl(142,76%,36%)]/10 rounded-full">
          <TrendingUp className="w-3 h-3 text-[hsl(142,76%,36%)]" />
          <span className="text-[10px] font-medium text-[hsl(142,76%,36%)]">Completed</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Fund Switch</p>

      {/* Switch details */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-muted/30 rounded-lg transition-all duration-200 hover:bg-muted/50">
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground">From</p>
          <p className="text-xs font-medium text-foreground truncate">{fromFund.name}</p>
          <p className="text-[10px] text-muted-foreground">+{fromFund.oldPerformance}% p.a.</p>
        </div>
        <div className="flex flex-col items-center px-2">
          <svg className="w-5 h-5 text-[hsl(var(--brand-blue))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">6-Month Performance</span>
          {hoveredChartPoint !== null && (
            <span className="text-[10px] font-medium text-foreground">
              {months[hoveredChartPoint]}: {newFundData[hoveredChartPoint].toFixed(1)}%
            </span>
          )}
        </div>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <defs>
            <linearGradient id="newFundGradientTransact" x1="0" y1="0" x2="0" y2="1">
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
          />

          {/* New fund area */}
          <path
            d={`${createPath(newPoints)} L ${newPoints[newPoints.length - 1].x} ${height - padding.bottom} L ${newPoints[0].x} ${height - padding.bottom} Z`}
            fill="url(#newFundGradientTransact)"
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

          {/* Interactive hover points */}
          {newPoints.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r="12"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredChartPoint(i)}
                onMouseLeave={() => setHoveredChartPoint(null)}
              />
              {(hoveredChartPoint === i || (animationProgress >= 1 && i === newPoints.length - 1)) && (
                <>
                  <circle cx={point.x} cy={point.y} r={hoveredChartPoint === i ? 5 : 4} fill="hsl(142, 76%, 36%)" />
                  {hoveredChartPoint === i && (
                    <circle cx={point.x} cy={point.y} r="10" fill="hsl(142, 76%, 36%)" opacity="0.2" />
                  )}
                </>
              )}
            </g>
          ))}

          {/* End point for old fund */}
          {animationProgress >= 1 && (
            <circle cx={oldPoints[oldPoints.length - 1].x} cy={oldPoints[oldPoints.length - 1].y} r="3" fill="hsl(var(--muted-foreground))" opacity="0.5" />
          )}

          {/* Month labels */}
          {months.map((month, i) => (
            <text
              key={i}
              x={padding.left + (i / (months.length - 1)) * chartWidth}
              y={height - 4}
              textAnchor="middle"
              className={`text-[8px] transition-all duration-200 ${hoveredChartPoint === i ? 'fill-foreground font-medium' : 'fill-muted-foreground'}`}
            >
              {month}
            </text>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-muted-foreground opacity-50" style={{ backgroundImage: "repeating-linear-gradient(90deg, currentColor 0, currentColor 3px, transparent 3px, transparent 6px)" }} />
              <span className="text-[9px] text-muted-foreground">Old</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[hsl(142,76%,36%)]" />
              <span className="text-[9px] text-muted-foreground">New</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-muted-foreground">Gain: </span>
            <span className="text-xs font-bold text-[hsl(142,76%,36%)]">+R{Math.round(projectedGain).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Asset Allocation Section */}
      <div className="flex-1 pt-2 border-t border-border/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted-foreground">New Fund Allocation</span>
          {hoveredAllocation !== null && (
            <span className="text-[10px] font-medium text-foreground">
              {currentAllocation[hoveredAllocation].name}: {Math.round(currentAllocation[hoveredAllocation].currentValue)}%
            </span>
          )}
        </div>

        {/* Allocation bar */}
        <div className="h-3 rounded-full overflow-hidden flex mb-2 bg-muted/30">
          {allocationSegments.map((segment) => (
            <div
              key={segment.index}
              className="h-full cursor-pointer"
              style={{
                width: `${segment.width}%`,
                backgroundColor: segment.color,
                opacity: hoveredAllocation === null || hoveredAllocation === segment.index ? 1 : 0.4,
                transform: hoveredAllocation === segment.index ? 'scaleY(1.3)' : 'scaleY(1)',
                transition: 'transform 0.2s, opacity 0.2s',
              }}
              onMouseEnter={() => setHoveredAllocation(segment.index)}
              onMouseLeave={() => setHoveredAllocation(null)}
            />
          ))}
        </div>

        {/* Allocation legend */}
        <div className="grid grid-cols-3 gap-x-2 gap-y-1">
          {currentAllocation.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-1 cursor-pointer transition-all duration-200 ${hoveredAllocation === index ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
              onMouseEnter={() => setHoveredAllocation(index)}
              onMouseLeave={() => setHoveredAllocation(null)}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-200"
                style={{ 
                  backgroundColor: item.color,
                  transform: hoveredAllocation === index ? 'scale(1.3)' : 'scale(1)'
                }}
              />
              <span className="text-[9px] text-muted-foreground truncate">{item.name}</span>
              <span className="text-[9px] font-medium text-foreground ml-auto tabular-nums">{Math.round(item.currentValue)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Apply switch button */}
      <div className={`animated-border-button animated-border-button-green mt-3 ${showButtonAnimation ? 'animate' : ''}`}>
        <button 
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-border/50 text-muted-foreground hover:text-foreground hover:border-[hsl(142,76%,36%)]/50 hover:bg-muted/30 transition-all duration-200 group bg-card"
          onClick={(e) => e.stopPropagation()}
        >
          <Plus className="w-4 h-4 group-hover:text-[hsl(142,76%,36%)] transition-colors" />
          <span className="text-xs">Apply Switch to more Portfolios</span>
        </button>
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

  // Auto-rotate cards every 15 seconds (pauses on hover)
  useEffect(() => {
    if (isHovered) return;
    const rotateTimer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 15000);
    return () => clearInterval(rotateTimer);
  }, [isHovered]);

  const cycleCards = (clickedIndex: number) => {
    setActiveCard(clickedIndex);
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

  const cardLabels = ["Portfolio", "Family Grouping", "Transact"];

  return (
    <div className="flex flex-col items-center gap-4">
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
          <FundSwitchCard onClick={() => cycleCards(2)} isActive={activeCard === 2} />
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
          <FamilyGroupCard onClick={() => cycleCards(1)} isActive={activeCard === 1} />
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

      {/* Navigation Dots */}
      <div className="flex items-center gap-3">
        {cardLabels.map((label, index) => (
          <button
            key={index}
            onClick={() => setActiveCard(index)}
            className={`group flex items-center gap-2 transition-all duration-300 ${
              activeCard === index ? "opacity-100" : "opacity-50 hover:opacity-80"
            }`}
          >
            <div
              className={`rounded-full transition-all duration-300 ${
                activeCard === index
                  ? "w-6 h-2 bg-[hsl(var(--brand-orange))]"
                  : "w-2 h-2 bg-muted-foreground group-hover:bg-foreground"
              }`}
            />
            <span
              className={`text-xs transition-all duration-300 ${
                activeCard === index
                  ? "text-white font-medium opacity-100 w-auto"
                  : "text-white/60 w-0 overflow-hidden opacity-0 group-hover:w-auto group-hover:opacity-100"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
