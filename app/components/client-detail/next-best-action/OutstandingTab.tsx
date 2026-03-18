import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, FileWarning, ClipboardList, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import type { PrepTask, PrepDocument } from "@/hooks/useClientMeetingPrep";
import { getTaskPriority, getDocumentPriority, type Priority } from "@/lib/opportunity-priority";
import PrioritySectionHeader from "./PrioritySectionHeader";

interface OutstandingTabProps {
  tasks: PrepTask[];
  documents: PrepDocument[];
  householdView?: boolean;
}

const categorizeTask = (taskType: string) => {
  const t = taskType.toLowerCase();
  if (t.includes("compliance")) return { icon: <Shield className="w-3.5 h-3.5 text-amber-500" />, label: "Compliance" };
  if (t.includes("review")) return { icon: <RefreshCw className="w-3.5 h-3.5 text-blue-500" />, label: "Review" };
  if (t.includes("onboarding")) return { icon: <ClipboardList className="w-3.5 h-3.5 text-violet-500" />, label: "Onboarding" };
  return { icon: <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />, label: taskType };
};

const priorityColor: Record<string, string> = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-green-100 text-green-700 border-green-200",
};

const ClientNameTag = ({ name }: { name: string }) => (
  <span className="text-[10px] px-1.5 py-0 rounded bg-muted text-muted-foreground font-medium">{name}</span>
);

const renderTask = (task: PrepTask, householdView?: boolean) => {
  const cat = categorizeTask(task.taskType);
  const clientName = householdView && (task as any).clientName;
  return (
    <div key={task.id} className="flex gap-2 py-1.5 border-b border-border/50 last:border-0">
      <div className="shrink-0 mt-0.5">{cat.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="font-medium text-xs truncate">{task.title}</p>
            {clientName && <ClientNameTag name={clientName} />}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {task.priority && (
              <Badge variant="outline" className={`${priorityColor[task.priority] || ""} text-[10px] px-1.5 py-0`}>
                {task.priority}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{cat.label}</span>
          {task.dueDate && (
            <span className={`text-[10px] ${task.isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
              {task.isOverdue ? "Overdue: " : "Due: "}{format(new Date(task.dueDate), "dd MMM yyyy")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const renderDoc = (doc: PrepDocument, householdView?: boolean) => {
  const clientName = householdView && (doc as any).clientName;
  return (
    <div key={doc.id} className="flex gap-2 py-1.5 border-b border-border/50 last:border-0">
      <div className="shrink-0 mt-0.5">
        <FileWarning className="w-3.5 h-3.5 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="font-medium text-xs truncate">{doc.name}</p>
            {clientName && <ClientNameTag name={clientName} />}
          </div>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${doc.status === "Expired" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
            {doc.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{doc.category}</span>
          {doc.expiryDate && (
            <span className="text-[10px] text-muted-foreground">
              Expires: {format(new Date(doc.expiryDate), "dd MMM yyyy")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const OutstandingTab = ({ tasks, documents, householdView }: OutstandingTabProps) => {
  if (tasks.length === 0 && documents.length === 0) {
    return <p className="text-xs text-muted-foreground py-4 text-center">No outstanding items.</p>;
  }

  const grouped = useMemo(() => {
    const groups: Record<Priority, React.ReactNode[]> = { urgent: [], important: [], routine: [] };

    tasks.forEach(task => {
      const p = getTaskPriority(task);
      groups[p].push(renderTask(task, householdView));
    });

    documents.forEach(doc => {
      const p = getDocumentPriority(doc);
      groups[p].push(renderDoc(doc, householdView));
    });

    return groups;
  }, [tasks, documents, householdView]);

  return (
    <div className="space-y-1">
      {grouped.urgent.length > 0 && (
        <div>
          <PrioritySectionHeader priority="urgent" count={grouped.urgent.length} />
          {grouped.urgent}
        </div>
      )}
      {grouped.important.length > 0 && (
        <div>
          <PrioritySectionHeader priority="important" count={grouped.important.length} />
          {grouped.important}
        </div>
      )}
      {grouped.routine.length > 0 && (
        <div>
          <PrioritySectionHeader priority="routine" count={grouped.routine.length} />
          {grouped.routine}
        </div>
      )}
    </div>
  );
};

export default OutstandingTab;
