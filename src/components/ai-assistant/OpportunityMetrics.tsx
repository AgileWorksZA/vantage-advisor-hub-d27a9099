import { TrendingUp, FolderKanban, Target, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: "emerald" | "cyan" | "violet" | "orange";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

const colorClasses = {
  emerald: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
  },
  cyan: {
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/20",
  },
  violet: {
    bg: "bg-violet-500/20",
    text: "text-violet-400",
    border: "border-violet-500/30",
    glow: "shadow-violet-500/20",
  },
  orange: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
  },
};

const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue }: MetricCardProps) => {
  const colors = colorClasses[color];
  
  return (
    <div className={cn(
      "glass-panel rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02]",
      colors.border,
      "hover:shadow-lg",
      colors.glow
    )}>
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-lg", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.text)} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-white/50"
          )}>
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-white/60 text-sm font-medium">{title}</h3>
        <p className={cn("text-2xl font-bold mt-1", colors.text)}>{value}</p>
        {subtitle && (
          <p className="text-white/40 text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

interface OpportunityMetricsProps {
  totalOpportunityValue: number;
  realizedRevenue: number;
  activeProjects: number;
  completedProjects: number;
  pipelineProgress: number; // percentage
  slaHealth: {
    onTrack: number;
    warning: number;
    critical: number;
    overdue: number;
  };
  formatCurrency: (value: number) => string;
}

const OpportunityMetrics = ({
  totalOpportunityValue,
  realizedRevenue,
  activeProjects,
  completedProjects,
  pipelineProgress,
  slaHealth,
  formatCurrency,
}: OpportunityMetricsProps) => {
  const totalSLATasks = slaHealth.onTrack + slaHealth.warning + slaHealth.critical + slaHealth.overdue;
  const healthyPercent = totalSLATasks > 0 
    ? Math.round((slaHealth.onTrack / totalSLATasks) * 100) 
    : 100;

  const getSLAColor = (): "emerald" | "cyan" | "violet" | "orange" => {
    if (slaHealth.overdue > 0) return "orange";
    if (slaHealth.critical > 0) return "violet";
    if (slaHealth.warning > 0) return "cyan";
    return "emerald";
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricCard
        title="Opportunity Value"
        value={formatCurrency(totalOpportunityValue)}
        subtitle={`${formatCurrency(realizedRevenue)} realized`}
        icon={TrendingUp}
        color="emerald"
        trend={realizedRevenue > 0 ? "up" : "neutral"}
        trendValue={realizedRevenue > 0 ? `+${formatCurrency(realizedRevenue)}` : undefined}
      />
      <MetricCard
        title="Active Projects"
        value={activeProjects.toString()}
        subtitle={`${completedProjects} completed`}
        icon={FolderKanban}
        color="cyan"
      />
      <MetricCard
        title="Pipeline Progress"
        value={`${pipelineProgress}%`}
        subtitle="Opportunities actioned"
        icon={Target}
        color="violet"
      />
      <MetricCard
        title="SLA Health"
        value={`${healthyPercent}%`}
        subtitle={slaHealth.overdue > 0 ? `${slaHealth.overdue} overdue` : "All on track"}
        icon={Clock}
        color={getSLAColor()}
      />
    </div>
  );
};

export default OpportunityMetrics;
