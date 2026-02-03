import { Check, Circle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProjectTask } from "@/hooks/useProjectTasks";
import SLAIndicator from "./SLAIndicator";

interface ProjectTaskRowProps {
  task: ProjectTask;
  onStatusChange: (status: string) => void;
}

const priorityConfig = {
  Low: { text: "text-white/50", bg: "bg-white/10" },
  Medium: { text: "text-cyan-400", bg: "bg-cyan-500/20" },
  High: { text: "text-orange-400", bg: "bg-orange-500/20" },
  Urgent: { text: "text-rose-400", bg: "bg-rose-500/20" },
};

const ProjectTaskRow = ({ task, onStatusChange }: ProjectTaskRowProps) => {
  const isCompleted = task.status === "Completed";
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.Medium;

  const handleToggle = () => {
    if (isCompleted) {
      onStatusChange("Not Started");
    } else {
      onStatusChange("Completed");
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-colors",
        isCompleted ? "bg-white/5 opacity-60" : "bg-white/5 hover:bg-white/10"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 rounded-full border",
          isCompleted
            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
            : "border-white/20 text-white/30 hover:text-white hover:border-white/40"
        )}
        onClick={handleToggle}
      >
        {isCompleted ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
      </Button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isCompleted ? "line-through text-white/50" : "text-white")}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-white/40 truncate">{task.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isCompleted && task.sla_deadline && (
          <SLAIndicator deadline={task.sla_deadline} status={task.status} size="sm" />
        )}
        <Badge variant="outline" className={cn("text-xs", priority.bg, priority.text)}>
          {task.priority}
        </Badge>
      </div>
    </div>
  );
};

export default ProjectTaskRow;
