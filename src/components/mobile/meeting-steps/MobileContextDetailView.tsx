import { useEffect } from "react";
import { ArrowLeft, Plus, FileText, Mail, ListTodo, File, Package, TrendingUp, Clock, Target, Loader2, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { isPast } from "date-fns";
import type { DetailView } from "./PrepStep";
import { useTaskHistory } from "@/hooks/useTaskHistory";
import { matchAllTranscriptQuotes } from "@/lib/transcript-utils";
import type { KeyOutcome } from "../MobileMeetingScreen";

interface MobileContextDetailViewProps {
  view: DetailView;
  onBack: () => void;
  onConvertToTask?: (title: string, description: string) => void;
}

export default function MobileContextDetailView({ view, onBack, onConvertToTask }: MobileContextDetailViewProps) {
  const { type, data } = view;

  const configs: Record<string, { icon: typeof FileText; color: string; label: string }> = {
    note: { icon: FileText, color: "bg-blue-500/10 text-blue-600", label: "Note" },
    communication: { icon: Mail, color: "bg-violet-500/10 text-violet-600", label: "Communication" },
    task: { icon: ListTodo, color: "bg-orange-500/10 text-orange-600", label: "Task" },
    document: { icon: File, color: "bg-rose-500/10 text-rose-600", label: "Document" },
    product: { icon: Package, color: "bg-emerald-500/10 text-emerald-600", label: "Product" },
    opportunity: { icon: TrendingUp, color: "bg-amber-500/10 text-amber-600", label: "Opportunity" },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <Badge variant="secondary" className={`text-xs gap-1 ${config.color}`}>
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        {type === "note" && <NoteDetail data={data} />}
        {type === "communication" && <CommDetail data={data} />}
        {type === "task" && <TaskDetail data={data} onConvertToTask={onConvertToTask} />}
        {type === "document" && <DocumentDetail data={data} />}
        {type === "product" && <ProductDetail data={data} />}
        {type === "opportunity" && <OpportunityDetail data={data} onConvertToTask={onConvertToTask} />}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground">{typeof value === "string" ? value : value}</p>
    </div>
  );
}

function NoteDetail({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{data.subject}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" value={format(new Date(data.date), "dd MMM yyyy")} />
        <Field label="Priority" value={data.priority} />
        <Field label="Type" value={data.interactionType} />
      </div>
    </div>
  );
}

function CommDetail({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{data.subject}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Channel" value={data.channel} />
        <Field label="Date" value={format(new Date(data.date), "dd MMM yyyy")} />
      </div>
    </div>
  );
}

const statusToProgress: Record<string, number> = {
  "Not Started": 0,
  "In Progress": 50,
  "Completed": 100,
  "Cancelled": 0,
};

const originConfig: Record<string, { label: string; className: string }> = {
  prep: { label: "Prep", className: "bg-blue-500/10 text-blue-600" },
  meeting: { label: "During Meeting", className: "bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)]" },
  "post-meeting": { label: "Post-Meeting", className: "bg-amber-500/10 text-amber-600" },
};

function TaskDetail({ data, onConvertToTask }: { data: any; onConvertToTask?: (t: string, d: string) => void }) {
  const { history, loading: historyLoading, fetchHistory } = useTaskHistory(data.id);
  const transcription: string | null = data.transcription || null;
  const keyOutcomes: KeyOutcome[] = data.keyOutcomes || [];

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const progress = statusToProgress[data.status] ?? 0;
  const isOverdue = data.isOverdue || (data.dueDate && isPast(new Date(data.dueDate)));

  // Find linked outcome
  const linkedOutcome = findLinkedOutcome(data.title, keyOutcomes);

  // Find transcript quotes
  const quotes = matchAllTranscriptQuotes(data.title, transcription);

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">{data.title}</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type" value={data.taskType} />
          <Field label="Priority" value={data.priority} />
          <Field label="Status" value={data.status} />
          <Field label="Due Date" value={data.dueDate ? format(new Date(data.dueDate), "dd MMM yyyy") : "No date"} />
        </div>
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Progress</span>
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {isOverdue && (
          <Badge variant="destructive" className="text-xs">Overdue</Badge>
        )}
      </div>

      {/* Linked Outcome */}
      {linkedOutcome && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-[hsl(180,70%,45%)]" />
            Linked Outcome
          </h3>
          <div className="p-3 rounded-lg bg-card border border-border space-y-1.5">
            <div className="flex items-start gap-2">
              <div className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center ${linkedOutcome.completed ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground"}`}>
                {linkedOutcome.completed && <span className="text-white text-[10px]">✓</span>}
              </div>
              <span className={`text-sm flex-1 ${linkedOutcome.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {linkedOutcome.text}
              </span>
            </div>
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${originConfig[linkedOutcome.origin]?.className || ""}`}>
              {originConfig[linkedOutcome.origin]?.label || linkedOutcome.origin}
            </Badge>
          </div>
        </div>
      )}

      {/* Recording Quotes */}
      {quotes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-[hsl(180,70%,45%)]" />
            Recording Quotes
          </h3>
          {quotes.map((q, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                at {q.timestamp}
              </Badge>
              <p className="text-xs text-muted-foreground italic leading-relaxed">"{q.snippet}"</p>
            </div>
          ))}
        </div>
      )}

      {/* Audit Trail */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 text-[hsl(180,70%,45%)]" />
          Audit Trail
        </h3>
        {historyLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : history.length > 0 ? (
          <div className="relative pl-4 border-l-2 border-border space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="relative">
                <div className="absolute -left-[calc(1rem+5px)] top-1 w-2 h-2 rounded-full bg-[hsl(180,70%,45%)]" />
                <div className="space-y-0.5">
                  <p className="text-sm text-foreground">
                    {formatHistoryAction(entry)}
                  </p>
                  {entry.field_name && entry.old_value && entry.new_value && (
                    <p className="text-xs text-muted-foreground">
                      {entry.old_value} → {entry.new_value}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(entry.changed_at), "dd MMM yyyy, HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
            <p className="text-xs text-muted-foreground">No activity recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatHistoryAction(entry: { action: string; field_name: string | null; old_value: string | null; new_value: string | null }): string {
  if (entry.field_name) {
    return `${entry.field_name.charAt(0).toUpperCase() + entry.field_name.slice(1).replace(/_/g, " ")} changed`;
  }
  return entry.action.charAt(0).toUpperCase() + entry.action.slice(1).replace(/_/g, " ");
}

function findLinkedOutcome(taskTitle: string, keyOutcomes: KeyOutcome[]): KeyOutcome | null {
  if (!keyOutcomes.length) return null;
  const taskWords = taskTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  for (const outcome of keyOutcomes) {
    const outcomeWords = outcome.text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const overlap = taskWords.filter(w => outcomeWords.some(ow => ow.includes(w) || w.includes(ow)));
    if (overlap.length >= 1) return outcome;
  }
  return null;
}

function DocumentDetail({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{data.name}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Status" value={data.status} />
        <Field label="Category" value={data.category} />
        <Field label="Expiry Date" value={data.expiryDate ? format(new Date(data.expiryDate), "dd MMM yyyy") : "N/A"} />
      </div>
    </div>
  );
}

function ProductDetail({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{data.productName}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" value={data.category || "Uncategorised"} />
        <Field label="Current Value" value={data.currentValue ? `R ${data.currentValue.toLocaleString()}` : "N/A"} />
        <Field label="Status" value={data.status} />
      </div>
    </div>
  );
}

function OpportunityDetail({ data, onConvertToTask }: { data: any; onConvertToTask?: (t: string, d: string) => void }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{data.opportunityType}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Potential Revenue" value={data.potentialRevenue ? `R ${data.potentialRevenue.toLocaleString()}` : "N/A"} />
        <Field label="Confidence" value={data.confidence ? `${data.confidence}%` : "N/A"} />
        <Field label="Status" value={data.status} />
      </div>
      {data.suggestedAction && <Field label="Suggested Action" value={data.suggestedAction} />}
      {data.reasoning && <Field label="Reasoning" value={data.reasoning} />}
      {onConvertToTask && (
        <button
          onClick={() => onConvertToTask(
            `Follow up: ${data.opportunityType}`,
            `${data.suggestedAction || data.reasoning || data.opportunityType}`
          )}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)] border border-[hsl(180,70%,45%)]/20 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Convert to Task
        </button>
      )}
    </div>
  );
}
