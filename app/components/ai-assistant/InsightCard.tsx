import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  color: "emerald" | "cyan" | "violet" | "orange" | "rose";
  onClick: () => void;
  isActive: boolean;
}

const colorClasses = {
  emerald: {
    bg: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    icon: "bg-emerald-500/20 text-emerald-400",
  },
  cyan: {
    bg: "from-cyan-500/20 to-cyan-600/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    glow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]",
    icon: "bg-cyan-500/20 text-cyan-400",
  },
  violet: {
    bg: "from-violet-500/20 to-violet-600/10",
    border: "border-violet-500/30",
    text: "text-violet-400",
    glow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
    icon: "bg-violet-500/20 text-violet-400",
  },
  orange: {
    bg: "from-orange-500/20 to-orange-600/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    glow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]",
    icon: "bg-orange-500/20 text-orange-400",
  },
  rose: {
    bg: "from-rose-500/20 to-rose-600/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
    glow: "hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]",
    icon: "bg-rose-500/20 text-rose-400",
  },
};

const InsightCard = ({ title, count, icon: Icon, color, onClick, isActive }: InsightCardProps) => {
  const colors = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={cn(
        "glass-panel rounded-xl p-4 transition-all duration-300 cursor-pointer",
        "bg-gradient-to-br",
        colors.bg,
        colors.border,
        colors.glow,
        "hover:scale-105 hover:-translate-y-1",
        "min-w-[140px]",
        isActive && "ring-2 ring-white/30 scale-105"
      )}
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", colors.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className={cn("text-3xl font-bold mb-1", colors.text)}>{count}</div>
      <div className="text-white/70 text-sm text-left">{title}</div>
    </button>
  );
};

export default InsightCard;
