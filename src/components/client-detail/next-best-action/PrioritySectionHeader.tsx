import React from "react";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/opportunity-priority";

const config: Record<Priority, { label: string; icon: React.ReactNode }> = {
  urgent: { label: "Urgent", icon: <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> },
  important: { label: "Important", icon: <Clock className="h-3.5 w-3.5 text-amber-500" /> },
  routine: { label: "Routine", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> },
};

interface PrioritySectionHeaderProps {
  priority: Priority;
  count: number;
}

const PrioritySectionHeader = ({ priority, count }: PrioritySectionHeaderProps) => {
  const c = config[priority];
  return (
    <div className="flex items-center gap-1.5 py-1.5">
      {c.icon}
      <span className="text-xs font-semibold">{c.label}</span>
      <Badge variant="outline" className="text-[10px] px-1 py-0 ml-auto">{count}</Badge>
    </div>
  );
};

export default PrioritySectionHeader;
