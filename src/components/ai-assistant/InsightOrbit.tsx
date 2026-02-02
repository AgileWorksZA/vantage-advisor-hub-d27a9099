import { TrendingUp, ArrowRightLeft, Repeat, Server, AlertTriangle } from "lucide-react";
import InsightCard from "./InsightCard";

interface InsightOrbitProps {
  activeCategory: string | null;
  onCategoryClick: (category: string) => void;
  counts: {
    upsell: number;
    crossSell: number;
    migration: number;
    platform: number;
    atRisk: number;
  };
}

const categories = [
  { id: "upsell", title: "Growth Opportunities", icon: TrendingUp, color: "emerald" as const },
  { id: "cross-sell", title: "Cross-Sell Potential", icon: ArrowRightLeft, color: "cyan" as const },
  { id: "migration", title: "Portfolio Migration", icon: Repeat, color: "violet" as const },
  { id: "platform", title: "Platform Consolidation", icon: Server, color: "orange" as const },
  { id: "at-risk", title: "At-Risk Clients", icon: AlertTriangle, color: "rose" as const },
];

const InsightOrbit = ({ activeCategory, onCategoryClick, counts }: InsightOrbitProps) => {
  const getCount = (id: string) => {
    switch (id) {
      case "upsell":
        return counts.upsell;
      case "cross-sell":
        return counts.crossSell;
      case "migration":
        return counts.migration;
      case "platform":
        return counts.platform;
      case "at-risk":
        return counts.atRisk;
      default:
        return 0;
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
      {categories.map((category, index) => (
        <div
          key={category.id}
          className="animate-float"
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          <InsightCard
            title={category.title}
            count={getCount(category.id)}
            icon={category.icon}
            color={category.color}
            onClick={() => onCategoryClick(category.id)}
            isActive={activeCategory === category.id}
          />
        </div>
      ))}
    </div>
  );
};

export default InsightOrbit;
