import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  History,
  Lock,
  Edit,
  Plus,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskHistoryEntry } from "@/hooks/useTaskHistory";

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by?: string;
  is_internal?: boolean;
}

interface TaskTimelineProps {
  notes: Note[];
  internalNotes: Note[];
  history: TaskHistoryEntry[];
}

export function TaskTimeline({ notes, internalNotes, history }: TaskTimelineProps) {
  // Combine and sort all timeline items
  const allItems = [
    ...notes.map((n) => ({ ...n, type: "note" as const })),
    ...internalNotes.map((n) => ({ ...n, type: "internal" as const })),
    ...history.map((h) => ({
      id: h.id,
      content: getHistoryDescription(h),
      created_at: h.changed_at,
      type: "history" as const,
      action: h.action,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (allItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allItems.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex gap-3 p-3 rounded-lg",
            item.type === "internal" && "bg-amber-500/5 border border-amber-500/20",
            item.type === "note" && "bg-muted/30 border",
            item.type === "history" && "bg-muted/10"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              item.type === "internal" && "bg-amber-500/10",
              item.type === "note" && "bg-primary/10",
              item.type === "history" && "bg-muted"
            )}
          >
            {item.type === "internal" ? (
              <Lock className="h-4 w-4 text-amber-600" />
            ) : item.type === "note" ? (
              <MessageSquare className="h-4 w-4 text-primary" />
            ) : (
              <HistoryIcon action={(item as any).action} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">
                {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
              </span>
              {item.type === "internal" && (
                <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                  Internal
                </Badge>
              )}
              {item.type === "history" && (
                <Badge variant="outline" className="text-muted-foreground">
                  System
                </Badge>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap">{item.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getHistoryDescription(entry: TaskHistoryEntry): string {
  switch (entry.action) {
    case "Created":
      return "Task was created";
    case "Updated":
      if (entry.field_name) {
        return `${formatFieldName(entry.field_name)} changed${entry.new_value ? ` to "${entry.new_value}"` : ""}`;
      }
      return "Task was updated";
    case "StatusChanged":
      return `Status changed${entry.old_value ? ` from "${entry.old_value}"` : ""}${entry.new_value ? ` to "${entry.new_value}"` : ""}`;
    case "Deleted":
      return "Task was deleted";
    default:
      return entry.action;
  }
}

function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function HistoryIcon({ action }: { action: string }) {
  switch (action) {
    case "Created":
      return <Plus className="h-4 w-4 text-muted-foreground" />;
    case "Updated":
      return <Edit className="h-4 w-4 text-muted-foreground" />;
    case "StatusChanged":
      return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    case "Deleted":
      return <Trash2 className="h-4 w-4 text-muted-foreground" />;
    default:
      return <History className="h-4 w-4 text-muted-foreground" />;
  }
}
