import { TrendingUp, ArrowRightLeft, Repeat, Server, AlertTriangle, Plus } from "lucide-react";
import InsightCard from "./InsightCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InsightOrbitProps {
  activeCategory: string | null;
  onCategoryClick: (category: string) => void;
  onCreateProject?: (category: string) => void;
  counts: {
    upsell: number;
    crossSell: number;
    migration: number;
    platform: number;
    atRisk: number;
  };
}

const categories = [
  { id: "upsell", title: "Growth Opportunities", icon: TrendingUp, color: "emerald" as const, projectType: "growth" },
  { id: "cross-sell", title: "Cross-Sell Potential", icon: ArrowRightLeft, color: "cyan" as const, projectType: "growth" },
  { id: "migration", title: "Portfolio Migration", icon: Repeat, color: "violet" as const, projectType: "migration" },
  { id: "platform", title: "Platform Consolidation", icon: Server, color: "orange" as const, projectType: "consolidation" },
  { id: "at-risk", title: "At-Risk Clients", icon: AlertTriangle, color: "rose" as const, projectType: "derisking" },
];

const InsightOrbit = ({ activeCategory, onCategoryClick, onCreateProject, counts }: InsightOrbitProps) => {
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
          className="relative group animate-float"
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
          {/* Quick action button on hover */}
          {onCreateProject && (
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
                "h-7 text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onCreateProject(category.projectType);
              }}
            >
              <Plus className="w-3 h-3 mr-1" />
              Project
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default InsightOrbit;
