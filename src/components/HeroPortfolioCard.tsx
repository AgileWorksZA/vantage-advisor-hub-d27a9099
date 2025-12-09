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

// Back card 1 - Client Overview
function ClientOverviewCard({ onClick }: { onClick?: () => void }) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  
  const rows = [
    { label: "Active Clients", value: "1,247", color: "text-foreground" },
    { label: "New This Month", value: "+34", color: "text-[hsl(142,76%,36%)]" },
    { label: "Total AUM", value: "R2.4B", color: "text-foreground" },
    { label: "Avg. Portfolio", value: "R1.9M", color: "text-foreground" },
  ];

  return (
    <div 
      className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl h-full cursor-pointer transition-all duration-300 hover:border-[hsl(var(--brand-blue))]/50"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Client Overview</h3>
        <Users className="w-5 h-5 text-[hsl(var(--brand-blue))]" />
      </div>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div 
            key={index}
            className={`flex justify-between items-center py-2 border-b border-border/30 last:border-0 transition-all duration-200 rounded px-1 -mx-1 ${
              hoveredRow === index ? "bg-[hsl(var(--brand-blue))]/5" : ""
            }`}
            onMouseEnter={() => setHoveredRow(index)}
            onMouseLeave={() => setHoveredRow(null)}
          >
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className={`text-sm font-semibold ${row.color} transition-transform duration-200 ${hoveredRow === index ? "scale-110" : ""}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Back card 2 - Compliance Status
function ComplianceCard({ onClick }: { onClick?: () => void }) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const rows = [
    { label: "FICA Complete", value: "98%", bgColor: "bg-[hsl(142,76%,36%)]/10", textColor: "text-[hsl(142,76%,36%)]" },
    { label: "Risk Profiles", value: "100%", bgColor: "bg-[hsl(142,76%,36%)]/10", textColor: "text-[hsl(142,76%,36%)]" },
    { label: "Reviews Due", value: "12", bgColor: "bg-[hsl(var(--brand-orange))]/10", textColor: "text-[hsl(var(--brand-orange))]" },
    { label: "Pending Tasks", value: "8", bgColor: "bg-[hsl(var(--brand-blue))]/10", textColor: "text-[hsl(var(--brand-blue))]" },
  ];

  return (
    <div 
      className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl h-full cursor-pointer transition-all duration-300 hover:border-[hsl(var(--brand-orange))]/50"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Compliance</h3>
        <FileText className="w-5 h-5 text-[hsl(var(--brand-orange))]" />
      </div>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div 
            key={index}
            className={`flex justify-between items-center py-2 border-b border-border/30 last:border-0 transition-all duration-200 rounded px-1 -mx-1 ${
              hoveredRow === index ? "bg-muted/50" : ""
            }`}
            onMouseEnter={() => setHoveredRow(index)}
            onMouseLeave={() => setHoveredRow(null)}
          >
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className={`text-xs font-semibold ${row.textColor} ${row.bgColor} px-2 py-0.5 rounded transition-transform duration-200 ${hoveredRow === index ? "scale-110" : ""}`}>
              {row.value}
            </span>
          </div>
        ))}
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
      {/* Card 3 - Compliance */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          transform: getCardTransform(2),
          opacity: getCardOpacity(2),
          zIndex: getCardZIndex(2),
          transformStyle: "preserve-3d",
        }}
      >
        <ComplianceCard onClick={() => cycleCards(2)} />
      </div>

      {/* Card 2 - Client Overview */}
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
        <ClientOverviewCard onClick={() => cycleCards(1)} />
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
