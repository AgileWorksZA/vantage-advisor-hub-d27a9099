import { format, isBefore, startOfDay } from "date-fns";
import { Pin, Calendar } from "lucide-react";
import { EnhancedTask } from "@/hooks/useTasksEnhanced";

const priorityColors: Record<string, string> = {
  Urgent: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-blue-400",
};

interface KanbanCardProps {
  task: EnhancedTask;
  onTaskClick: (task: EnhancedTask) => void;
}

const KanbanCard = ({ task, onTaskClick }: KanbanCardProps) => {
  const today = startOfDay(new Date());
  const isOverdue =
    task.due_date &&
    isBefore(new Date(task.due_date), today) &&
    !["Completed", "Cancelled"].includes(task.status);

  const initials = task.assigned_to_name
    ? task.assigned_to_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onTaskClick(task)}
      className={`group relative flex cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${
        isOverdue ? "border-destructive/50" : "border-border"
      }`}
    >
      {/* Priority bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
          priorityColors[task.priority] || "bg-muted"
        }`}
      />

      <div className="ml-2 flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <span className="text-sm font-medium leading-tight truncate">
            {task.title}
          </span>
          {task.is_pinned && (
            <Pin className="h-3 w-3 shrink-0 text-primary fill-primary" />
          )}
        </div>

        {task.client_name && (
          <span className="text-xs text-muted-foreground truncate">
            {task.client_name}
          </span>
        )}

        <div className="flex items-center justify-between mt-1">
          {task.due_date ? (
            <span
              className={`inline-flex items-center gap-1 text-xs ${
                isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {format(new Date(task.due_date), "dd MMM")}
            </span>
          ) : (
            <span />
          )}

          {initials && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
              {initials}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
