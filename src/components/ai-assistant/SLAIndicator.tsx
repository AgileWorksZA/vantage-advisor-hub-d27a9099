import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { differenceInDays, parseISO, format } from "date-fns";

export type SLAStatus = "on-track" | "warning" | "critical" | "overdue";

interface SLAIndicatorProps {
  deadline: string | null;
  status?: string;
  showDays?: boolean;
  size?: "sm" | "md";
}

const SLAIndicator = ({ deadline, status, showDays = true, size = "md" }: SLAIndicatorProps) => {
  if (!deadline || status === "Completed" || status === "Cancelled") {
    return null;
  }

  const today = new Date();
  const deadlineDate = parseISO(deadline);
  const daysRemaining = differenceInDays(deadlineDate, today);

  let slaStatus: SLAStatus;
  if (daysRemaining < 0) slaStatus = "overdue";
  else if (daysRemaining <= 3) slaStatus = "critical";
  else if (daysRemaining <= 7) slaStatus = "warning";
  else slaStatus = "on-track";

  const statusConfig = {
    "on-track": {
      bg: "bg-emerald-500",
      text: "text-emerald-400",
      label: "On Track",
    },
    "warning": {
      bg: "bg-amber-500",
      text: "text-amber-400",
      label: "Due Soon",
    },
    "critical": {
      bg: "bg-orange-500",
      text: "text-orange-400",
      label: "Critical",
    },
    "overdue": {
      bg: "bg-rose-500",
      text: "text-rose-400",
      label: "Overdue",
    },
  };

  const config = statusConfig[slaStatus];
  const sizeClasses = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <span className={cn("rounded-full animate-pulse", sizeClasses, config.bg)} />
            {showDays && (
              <span className={cn("font-medium", textSize, config.text)}>
                {daysRemaining < 0 
                  ? `${Math.abs(daysRemaining)}d overdue`
                  : `${daysRemaining}d left`
                }
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p className="font-medium">{config.label}</p>
            <p className="text-muted-foreground">
              Deadline: {format(deadlineDate, "d MMM yyyy")}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SLAIndicator;
