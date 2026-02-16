import { useState, useMemo, useCallback } from "react";
import { EnhancedTask } from "@/hooks/useTasksEnhanced";
import KanbanCard from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { Users, Signal, Minus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const COLUMN_ORDER = [
  "Not Started",
  "In Progress",
  "Pending Client",
  "Completed",
  "Cancelled",
];

const columnColors: Record<string, string> = {
  "Not Started": "bg-muted-foreground/60",
  "In Progress": "bg-blue-500",
  "Pending Client": "bg-yellow-500",
  "Completed": "bg-green-500",
  "Cancelled": "bg-red-400",
};

const WIP_LIMIT = 15;

type GroupBy = "none" | "assignee" | "priority";

interface TaskKanbanBoardProps {
  tasks: EnhancedTask[];
  onTaskClick: (task: EnhancedTask) => void;
  onUpdateTask: (taskId: string, updates: Partial<EnhancedTask>) => void;
}

const TaskKanbanBoard = ({ tasks, onTaskClick, onUpdateTask }: TaskKanbanBoardProps) => {
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const groupedTasks = useMemo(() => {
    const byStatus: Record<string, EnhancedTask[]> = {};
    COLUMN_ORDER.forEach((s) => (byStatus[s] = []));
    tasks.forEach((t) => {
      const col = COLUMN_ORDER.includes(t.status) ? t.status : "Not Started";
      byStatus[col].push(t);
    });
    return byStatus;
  }, [tasks]);

  const swimlaneKeys = useMemo(() => {
    if (groupBy === "none") return ["all"];
    const set = new Set<string>();
    tasks.forEach((t) => {
      const key =
        groupBy === "assignee"
          ? t.assigned_to_name || "Unassigned"
          : t.priority || "None";
      set.add(key);
    });
    return Array.from(set).sort();
  }, [tasks, groupBy]);

  const handleDrop = useCallback(
    (e: React.DragEvent, newStatus: string) => {
      e.preventDefault();
      setDragOverColumn(null);
      const taskId = e.dataTransfer.getData("taskId");
      if (!taskId) return;
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== newStatus) {
        onUpdateTask(taskId, { status: newStatus });
      }
    },
    [tasks, onUpdateTask]
  );

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => setDragOverColumn(null);

  const filterBySwimLane = (list: EnhancedTask[], lane: string) => {
    if (groupBy === "none") return list;
    return list.filter((t) => {
      const key =
        groupBy === "assignee"
          ? t.assigned_to_name || "Unassigned"
          : t.priority || "None";
      return key === lane;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b bg-background">
        <span className="text-xs font-medium text-muted-foreground mr-1">Group by:</span>
        <Button
          size="sm"
          variant={groupBy === "none" ? "default" : "outline"}
          className="h-7 text-xs gap-1"
          onClick={() => setGroupBy("none")}
        >
          <Minus className="h-3 w-3" /> None
        </Button>
        <Button
          size="sm"
          variant={groupBy === "assignee" ? "default" : "outline"}
          className="h-7 text-xs gap-1"
          onClick={() => setGroupBy("assignee")}
        >
          <Users className="h-3 w-3" /> Assignee
        </Button>
        <Button
          size="sm"
          variant={groupBy === "priority" ? "default" : "outline"}
          className="h-7 text-xs gap-1"
          onClick={() => setGroupBy("priority")}
        >
          <Signal className="h-3 w-3" /> Priority
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-y-auto">
        {swimlaneKeys.map((lane) => (
          <div key={lane}>
            {groupBy !== "none" && (
              <div className="px-6 pt-4 pb-2">
                <h3 className="text-sm font-semibold text-foreground">{lane}</h3>
              </div>
            )}
            <div className="flex gap-4 px-6 py-3 overflow-x-auto min-h-[200px]">
              {COLUMN_ORDER.map((status) => {
                const columnTasks = filterBySwimLane(groupedTasks[status] || [], lane);
                const count = columnTasks.length;
                const overWip = count > WIP_LIMIT && !["Completed", "Cancelled"].includes(status);

                return (
                  <div
                    key={status}
                    className={`flex flex-col min-w-[240px] w-[240px] shrink-0 rounded-lg border transition-colors ${
                      dragOverColumn === status ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                    }`}
                    onDragOver={(e) => handleDragOver(e, status)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    {/* Column header */}
                    <div className="flex items-center gap-2 px-3 py-2.5 border-b">
                      <div className={`h-2.5 w-2.5 rounded-full ${columnColors[status] || "bg-muted"}`} />
                      <span className="text-sm font-medium truncate">{status}</span>
                      <span
                        className={`ml-auto text-xs font-semibold rounded-full px-2 py-0.5 ${
                          overWip
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    </div>

                    {/* Cards */}
                    <ScrollArea className="flex-1 max-h-[calc(100vh-320px)]">
                      <div className="flex flex-col gap-2 p-2">
                        {columnTasks.length === 0 && (
                          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                            No tasks
                          </div>
                        )}
                        {columnTasks.map((task) => (
                          <KanbanCard key={task.id} task={task} onTaskClick={onTaskClick} />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskKanbanBoard;
