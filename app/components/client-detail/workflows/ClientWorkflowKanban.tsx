import { useState, useMemo, useCallback } from "react";
import { Calendar } from "lucide-react";
import { WorkflowListItem } from "@/hooks/useClientWorkflows";

const COLUMN_ORDER = ["Active", "Complete", "Inactive", "Cancelled"];

const columnColors: Record<string, string> = {
  Active: "bg-blue-500",
  Complete: "bg-green-500",
  Inactive: "bg-muted-foreground/60",
  Cancelled: "bg-red-400",
};

interface ClientWorkflowKanbanProps {
  workflows: WorkflowListItem[];
  onUpdateStatus: (workflowId: string, newStatus: string) => void;
}

export function ClientWorkflowKanban({ workflows, onUpdateStatus }: ClientWorkflowKanbanProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byStatus: Record<string, WorkflowListItem[]> = {};
    COLUMN_ORDER.forEach(s => (byStatus[s] = []));
    workflows.forEach(w => {
      const col = COLUMN_ORDER.includes(w.status) ? w.status : "Active";
      byStatus[col].push(w);
    });
    return byStatus;
  }, [workflows]);

  const handleDrop = useCallback((e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const workflowId = e.dataTransfer.getData("workflowId");
    if (!workflowId) return;
    const wf = workflows.find(w => w.id === workflowId);
    if (wf && wf.status !== newStatus) {
      onUpdateStatus(workflowId, newStatus);
    }
  }, [workflows, onUpdateStatus]);

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto min-h-[300px]">
      {COLUMN_ORDER.map(status => {
        const items = grouped[status] || [];
        return (
          <div
            key={status}
            className={`flex flex-col flex-1 min-w-[200px] rounded-lg border transition-colors ${
              dragOverColumn === status ? "border-primary bg-primary/5" : "border-border bg-muted/30"
            }`}
            onDragOver={e => handleDragOver(e, status)}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={e => handleDrop(e, status)}
          >
            <div className="flex items-center gap-2 px-3 py-2.5 border-b">
              <div className={`h-2.5 w-2.5 rounded-full ${columnColors[status] || "bg-muted"}`} />
              <span className="text-sm font-medium truncate">{status}</span>
              <span className="ml-auto text-xs font-semibold rounded-full px-2 py-0.5 bg-muted text-muted-foreground">
                {items.length}
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-2 p-2 overflow-hidden">
              {items.length === 0 && (
                <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                  No workflows
                </div>
              )}
              {items.map(w => (
                <WorkflowKanbanCard key={w.id} workflow={w} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WorkflowKanbanCard({ workflow }: { workflow: WorkflowListItem }) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("workflowId", workflow.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="relative flex cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="ml-1 flex flex-1 flex-col gap-1 min-w-0">
        <span className="text-sm font-medium leading-tight line-clamp-2">{workflow.name}</span>
        <span className="text-xs text-muted-foreground truncate">{workflow.service}</span>
        <div className="flex items-center justify-between mt-1">
          {workflow.endDate !== "-" ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {workflow.endDate}
            </span>
          ) : <span />}
          <span className="text-xs text-muted-foreground">{workflow.adviser}</span>
        </div>
      </div>
    </div>
  );
}
