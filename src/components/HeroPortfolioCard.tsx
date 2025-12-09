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

const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

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
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div
      className={`relative bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Client Portfolio</h3>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        </div>
      </div>

      {/* Portfolio Value with Donut */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
            />
            {holdings.map((holding, index) => {
              const percentage = holding.value / totalValue;
              const strokeLength = percentage * circumference;
              const offset = cumulativeOffset;
              cumulativeOffset += strokeLength;

              return (
                <circle
                  key={holding.name}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={holding.color}
                  strokeWidth="12"
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
            <TrendingUp className="w-6 h-6 text-[hsl(var(--brand-blue))]" />
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Value</p>
          <p className="text-3xl font-bold text-foreground">
            R{animatedTotal.toLocaleString()}
          </p>
          <p className="text-sm text-[hsl(142,76%,36%)] flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            +5.8% this month
          </p>
        </div>
      </div>

      {/* Holdings List */}
      <div className="space-y-3">
        {holdings.map((holding, index) => (
          <div
            key={holding.name}
            className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 transition-all duration-500"
            style={{
              transitionDelay: `${(index + 1) * 150}ms`,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(20px)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: holding.color }}
              />
              <span className="text-sm font-medium text-foreground">{holding.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                R{holding.value.toLocaleString()}
              </p>
              <p className="text-xs text-[hsl(142,76%,36%)]">+{holding.change}%</p>
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
