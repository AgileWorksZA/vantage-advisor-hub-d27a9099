import { useMeetingRecordings } from "@/hooks/useMeetingRecordings";
import { useClientMeetingPrep } from "@/hooks/useClientMeetingPrep";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Sparkles, CalendarDays, CheckSquare, TrendingUp, Loader2, ChevronRight, Target } from "lucide-react";
import { format, addDays, isPast } from "date-fns";
import type { DetailView } from "./PrepStep";
import type { KeyOutcome } from "../MobileMeetingScreen";

interface FollowUpsStepProps {
  eventId: string;
  clientId: string | null;
  clientName?: string;
  onConvertToTask: (title: string, description: string) => void;
  onTagClick: (view: DetailView) => void;
  keyOutcomes?: KeyOutcome[];
  transcription?: string | null;
}

const statusToProgress: Record<string, number> = {
  "Not Started": 0,
  "In Progress": 50,
  "Completed": 100,
  "Cancelled": 0,
};

const statusColors: Record<string, string> = {
  "Not Started": "bg-muted-foreground",
  "In Progress": "bg-[hsl(180,70%,45%)]",
  "Completed": "bg-emerald-500",
  "Cancelled": "bg-muted-foreground",
};

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

const originConfig: Record<string, { label: string; className: string }> = {
  prep: { label: "Prep", className: "bg-blue-500/10 text-blue-600" },
  meeting: { label: "Meeting", className: "bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)]" },
  "post-meeting": { label: "Post", className: "bg-amber-500/10 text-amber-600" },
};

export default function FollowUpsStep({ eventId, clientId, clientName, onConvertToTask, onTagClick, keyOutcomes = [], transcription = null }: FollowUpsStepProps) {
  const { recordings, loading: recLoading } = useMeetingRecordings(eventId, clientId || undefined);
  const { tasks, opportunities, loading: prepLoading } = useClientMeetingPrep(clientId);

  const recording = recordings[0];
  const actionItems = recording?.aiActionItems || [];
  const summary = recording?.aiSummary;
  const followUpDate = summary?.follow_up_date
    ? format(new Date(summary.follow_up_date), "dd MMMM yyyy")
    : format(addDays(new Date(), 14), "dd MMMM yyyy");

  const recTranscription = recording?.transcription || transcription;

  const loading = recLoading || prepLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Suggested Follow-up Date */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(180,70%,45%)]/5 border border-[hsl(180,70%,45%)]/20">
        <CalendarDays className="h-5 w-5 text-[hsl(180,70%,45%)]" />
        <div>
          <p className="text-xs text-muted-foreground">Suggested Follow-up</p>
          <p className="text-sm font-medium text-foreground">{followUpDate}</p>
        </div>
        <button
          onClick={() => onConvertToTask(
            `Follow-up meeting with ${clientName || "client"}`,
            `Schedule follow-up meeting by ${followUpDate}`
          )}
          className="ml-auto p-1.5 rounded-md bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* AI Action Items */}
      {actionItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-4 w-4 text-[hsl(180,70%,45%)]" />
            <h3 className="text-xs font-semibold text-[hsl(180,70%,45%)] uppercase tracking-wider">AI Action Items</h3>
          </div>
          {actionItems.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border">
              <PriorityDot priority={item.priority} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
              <button
                onClick={() => onConvertToTask(item.title, item.description)}
                className="p-1 rounded-md bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/20 shrink-0"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Outstanding Tasks - Enhanced */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Outstanding Tasks</h3>
          {tasks.slice(0, 5).map((t) => {
            const progress = statusToProgress[t.status] ?? 0;
            const progressColor = statusColors[t.status] ?? "bg-muted-foreground";
            const isOverdue = t.isOverdue || (t.dueDate && isPast(new Date(t.dueDate)));
            const linkedOutcome = findLinkedOutcome(t.title, keyOutcomes);

            return (
              <button
                key={t.id}
                onClick={() => onTagClick({
                  type: "task",
                  id: t.id,
                  data: { ...t, transcription: recTranscription, keyOutcomes }
                })}
                className="w-full text-left rounded-lg bg-card border border-border overflow-hidden hover:bg-accent/50 transition-colors"
              >
                {/* Progress bar at top */}
                <div className="h-1.5 w-full bg-muted">
                  <div
                    className={`h-full transition-all ${progressColor}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="p-2.5 space-y-1.5">
                  {/* Title row */}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 shrink-0 ${isOverdue ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-600"}`}>
                      <CheckSquare className="h-3 w-3 mr-0.5" />
                      {t.status || "Task"}
                    </Badge>
                    <span className="text-sm font-medium text-foreground truncate flex-1">{t.title}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>

                  {/* Due date row */}
                  <div className="flex items-center gap-2">
                    {t.dueDate && (
                      <span className={`text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        Due: {format(new Date(t.dueDate), "dd MMM yyyy")}
                        {isOverdue && " • Overdue"}
                      </span>
                    )}
                  </div>

                  {/* Linked outcome */}
                  {linkedOutcome && (
                    <div className="flex items-center gap-1.5">
                      <Target className="h-3 w-3 text-[hsl(180,70%,45%)] shrink-0" />
                      <span className="text-xs text-muted-foreground truncate flex-1">{linkedOutcome.text}</span>
                      <Badge variant="secondary" className={`text-[9px] px-1 py-0 ${originConfig[linkedOutcome.origin]?.className || ""}`}>
                        {originConfig[linkedOutcome.origin]?.label || linkedOutcome.origin}
                      </Badge>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Opportunities */}
      {opportunities.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Opportunities</h3>
          {opportunities.slice(0, 3).map((o) => (
            <div key={o.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 bg-amber-500/10 text-amber-600">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                Opportunity
              </Badge>
              <span className="text-sm text-foreground truncate flex-1">{o.opportunityType}</span>
              <button
                onClick={() => onConvertToTask(
                  `Follow up on ${o.opportunityType}`,
                  `Opportunity: ${o.opportunityType}. ${o.reasoning || ""}`
                )}
                className="p-1 rounded-md bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)] shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {actionItems.length === 0 && tasks.length === 0 && opportunities.length === 0 && (
        <div className="text-center py-8 space-y-2">
          <CheckSquare className="h-8 w-8 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">No follow-up items identified yet.</p>
        </div>
      )}
    </div>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    High: "bg-destructive",
    Medium: "bg-[hsl(var(--brand-orange))]",
    Low: "bg-muted-foreground",
  };
  return <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colors[priority] || colors.Low}`} />;
}
