import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useClients } from "@/hooks/useClients";
import { useRegion } from "@/contexts/RegionContext";
import { CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

type TaskFilter = "all" | "due-today" | "overdue";

const MobileTasksTab = () => {
  const { tasks, loading, updateTask } = useTasks();
  const { clients, loading: clientsLoading } = useClients();
  const { selectedAdvisors, regionalData } = useRegion();
  const [filter, setFilter] = useState<TaskFilter>("all");

  const today = useMemo(() => new Date(), []);

  const selectedAdvisorNames = useMemo(() =>
    regionalData.advisors
      .filter(a => selectedAdvisors.includes(a.initials))
      .map(a => a.name),
    [regionalData.advisors, selectedAdvisors]
  );

  const advisorClientNames = useMemo(() => {
    const names = new Set<string>();
    clients.filter(c => selectedAdvisorNames.includes(c.advisor)).forEach(c => names.add(c.client));
    return names;
  }, [clients, selectedAdvisorNames]);

  const advisorTasks = useMemo(() =>
    tasks.filter((t) => t.isPracticeTask || advisorClientNames.has(t.clientName)),
    [tasks, advisorClientNames]
  );

  const filteredTasks = useMemo(() => {
    const open = advisorTasks.filter((t) => t.status !== "Completed" && t.status !== "Cancelled");
    switch (filter) {
      case "due-today":
        return open.filter((t) => isToday(t.dueDate));
      case "overdue":
        return open.filter((t) => isBefore(t.dueDate, startOfDay(today)) && !isToday(t.dueDate));
      default:
        return open;
    }
  }, [advisorTasks, filter, today]);

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Completed" ? "Not Started" : "Completed";
    await updateTask(taskId, { status: newStatus } as any);
  };

  const filters: { id: TaskFilter; label: string; count: number }[] = useMemo(() => {
    const open = advisorTasks.filter((t) => t.status !== "Completed" && t.status !== "Cancelled");
    return [
      { id: "all", label: "All", count: open.length },
      { id: "due-today", label: "Due Today", count: open.filter((t) => isToday(t.dueDate)).length },
      { id: "overdue", label: "Overdue", count: open.filter((t) => isBefore(t.dueDate, startOfDay(today)) && !isToday(t.dueDate)).length },
    ];
  }, [advisorTasks, today]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 pb-2">
        <h1 className="text-xl font-bold text-foreground mb-3">Tasks</h1>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                filter === f.id
                  ? "bg-[hsl(180,70%,45%)] text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="space-y-2 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No tasks found
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {filteredTasks.map((task) => {
              const isOverdue = isBefore(task.dueDate, startOfDay(today)) && !isToday(task.dueDate);
              return (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border"
                >
                  <button
                    onClick={() => handleToggleComplete(task.id, task.status)}
                    className="mt-0.5 shrink-0"
                  >
                    {task.status === "Completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-[hsl(142,76%,36%)]" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{task.clientName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(task.dueDate, "dd MMM")}
                      </span>
                      {isOverdue && (
                        <span className="flex items-center gap-1 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <PriorityDot priority={task.priority} />
                    <span className="text-[10px] text-muted-foreground">{task.taskType}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function PriorityDot({ priority }: { priority: string }) {
  const color: Record<string, string> = {
    High: "bg-destructive",
    Urgent: "bg-destructive",
    Medium: "bg-[hsl(var(--brand-orange))]",
    Low: "bg-muted-foreground",
  };
  return (
    <div className="flex items-center gap-1">
      <div className={cn("h-2 w-2 rounded-full", color[priority] || color.Low)} />
      <span className="text-[10px] text-muted-foreground">{priority}</span>
    </div>
  );
}

export default MobileTasksTab;
