import { TrendingUp, Target, CheckCircle, Clock, Circle } from "lucide-react";

interface PracticeValueIndicatorProps {
  existingRevenue: number;
  potentialRevenue: number;
  actualPercent: number;
  inProgressPercent: number;
  notStartedPercent: number;
  formatCurrency: (value: number) => string;
}

const PracticeValueIndicator = ({
  existingRevenue,
  potentialRevenue,
  actualPercent,
  inProgressPercent,
  notStartedPercent,
  formatCurrency,
}: PracticeValueIndicatorProps) => {
  return (
    <div className="glass-panel rounded-lg px-4 py-2 flex items-center gap-4 text-sm">
      <span className="text-white/50 font-medium hidden lg:inline">Practice Value</span>
      
      <div className="flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-white/70">Existing:</span>
        <span className="text-emerald-400 font-semibold">{formatCurrency(existingRevenue)}</span>
      </div>

      <div className="w-px h-4 bg-white/20 hidden sm:block" />

      <div className="flex items-center gap-1.5">
        <Target className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-white/70 hidden sm:inline">Potential:</span>
        <span className="text-cyan-400 font-semibold">{formatCurrency(potentialRevenue)}</span>
      </div>

      <div className="w-px h-4 bg-white/20 hidden md:block" />

      <div className="flex items-center gap-2 hidden md:flex">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
          <CheckCircle className="w-3 h-3" />
          <span className="text-xs font-medium">{actualPercent}%</span>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
          <Clock className="w-3 h-3" />
          <span className="text-xs font-medium">{inProgressPercent}%</span>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400">
          <Circle className="w-3 h-3" />
          <span className="text-xs font-medium">{notStartedPercent}%</span>
        </div>
      </div>
    </div>
  );
};

export default PracticeValueIndicator;
