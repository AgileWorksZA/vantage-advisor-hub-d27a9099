import type { PrepTask, PrepDocument } from "@/hooks/useClientMeetingPrep";

export type Priority = "urgent" | "important" | "routine";

// Opportunity type → priority mapping
export function getOpportunityPriority(type: string): Priority {
  const t = type.toLowerCase();
  if (t.includes("tax loss") || t.includes("cross-sell")) return "urgent";
  if (t.includes("platform") || t.includes("idle cash") || t.includes("new business")) return "important";
  return "routine"; // Upsell, Migration, Bank Scrape
}

// Outstanding task → priority
export function getTaskPriority(task: PrepTask): Priority {
  if (task.isOverdue || task.priority === "High") return "urgent";
  if (task.priority === "Medium") return "important";
  return "routine";
}

// Outstanding document → priority
export function getDocumentPriority(doc: PrepDocument): Priority {
  if (doc.status === "Expired") return "urgent";
  if (doc.status === "Expiring Soon" || doc.status === "Expiring") return "important";
  return "routine";
}

// Compute highest urgency across all items → status dot color
export function getStatusDotColor(
  opportunityTypes: string[],
  tasks: PrepTask[],
  documents: PrepDocument[]
): "red" | "orange" | "green" {
  const hasUrgent =
    opportunityTypes.some(t => getOpportunityPriority(t) === "urgent") ||
    tasks.some(t => getTaskPriority(t) === "urgent") ||
    documents.some(d => getDocumentPriority(d) === "urgent");

  if (hasUrgent) return "red";

  const hasImportant =
    opportunityTypes.some(t => getOpportunityPriority(t) === "important") ||
    tasks.some(t => getTaskPriority(t) === "important") ||
    documents.some(d => getDocumentPriority(d) === "important");

  if (hasImportant) return "orange";

  return "green";
}
