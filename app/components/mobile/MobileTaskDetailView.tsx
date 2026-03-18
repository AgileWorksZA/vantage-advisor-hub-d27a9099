import { ArrowLeft, Calendar, CheckCircle2, Circle, Clock, User } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TaskListItem } from "@/hooks/useTasks";

interface MobileTaskDetailViewProps {
  task: TaskListItem;
  onBack: () => void;
  onToggleComplete?: (taskId: string, currentStatus: string) => void;
}

const statusColors: Record<string, string> = {
  "Not Started": "bg-muted text-muted-foreground",
  "In Progress": "bg-[hsl(var(--brand-blue))]/10 text-[hsl(var(--brand-blue))]",
  "Pending Client": "bg-[hsl(var(--brand-orange))]/10 text-[hsl(var(--brand-orange))]",
  Completed: "bg-emerald-500/10 text-emerald-600",
  Cancelled: "bg-destructive/10 text-destructive",
};

const priorityColors: Record<string, string> = {
  High: "bg-destructive/10 text-destructive",
  Urgent: "bg-destructive/10 text-destructive",
  Medium: "bg-[hsl(var(--brand-orange))]/10 text-[hsl(var(--brand-orange))]",
  Low: "bg-muted text-muted-foreground",
};

const MobileTaskDetailView = ({ task, onBack, onToggleComplete }: MobileTaskDetailViewProps) => {
  const isOverdue =
    task.status !== "Completed" &&
    task.status !== "Cancelled" &&
    isBefore(task.dueDate, startOfDay(new Date()));

  const isCompleted = task.status === "Completed";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="p-1 -ml-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-semibold text-foreground truncate flex-1">Task Detail</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Title & Badges */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">{task.title}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusColors[task.status] || statusColors["Not Started"]}`}>
              {task.status}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || priorityColors.Low}`}>
              {task.priority}
            </span>
          </div>
        </div>

        {/* Info Rows */}
        <div className="space-y-3">
          <InfoRow icon={<User className="h-4 w-4" />} label="Client" value={task.clientName} />
          <InfoRow icon={<Clock className="h-4 w-4" />} label="Task Type" value={task.taskType} />
          <InfoRow
            icon={<Calendar className="h-4 w-4" />}
            label="Due Date"
            value={format(task.dueDate, "d MMM yyyy")}
            highlight={isOverdue}
            highlightText="Overdue"
          />
          <InfoRow icon={<User className="h-4 w-4" />} label="Assigned To" value={task.assignedTo.name} />
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Created" value={format(task.createdDate, "d MMM yyyy")} />
        </div>

        {/* Description */}
        {task.description && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</p>
            <p className="text-sm text-foreground bg-card border border-border rounded-lg p-3">{task.description}</p>
          </div>
        )}

        {/* Action */}
        {onToggleComplete && task.status !== "Cancelled" && (
          <Button
            variant={isCompleted ? "outline" : "default"}
            className="w-full gap-2"
            onClick={() => onToggleComplete(task.id, task.status)}
          >
            {isCompleted ? (
              <>
                <Circle className="h-4 w-4" /> Reopen Task
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Mark Complete
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

function InfoRow({
  icon,
  label,
  value,
  highlight,
  highlightText,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  highlightText?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{value}</p>
          {highlight && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
              {highlightText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileTaskDetailView;
