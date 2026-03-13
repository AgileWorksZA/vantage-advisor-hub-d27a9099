import { useState } from "react";
import { useClientMeetingPrep } from "@/hooks/useClientMeetingPrep";
import { useMeetingRecordings } from "@/hooks/useMeetingRecordings";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, CalendarDays, CheckSquare, TrendingUp, Loader2, ChevronRight, Target, Mail } from "lucide-react";
import { format, addDays, isPast } from "date-fns";
import type { KeyOutcome } from "./WebPrepStep";

interface WebFollowUpsStepProps {
  eventId: string;
  clientId: string | null;
  clientName?: string;
  keyOutcomes?: KeyOutcome[];
}

const originConfig: Record<string, { label: string; className: string }> = {
  prep: { label: "Prep", className: "bg-blue-500/10 text-blue-600" },
  meeting: { label: "Meeting", className: "bg-primary/10 text-primary" },
  "post-meeting": { label: "Post", className: "bg-amber-500/10 text-amber-600" },
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

export default function WebFollowUpsStep({ eventId, clientId, clientName, keyOutcomes = [] }: WebFollowUpsStepProps) {
  const { recordings, loading: recLoading } = useMeetingRecordings(eventId, clientId || undefined);
  const { tasks, opportunities, loading: prepLoading } = useClientMeetingPrep(clientId);

  const recording = recordings[0];
  const actionItems = recording?.aiActionItems || [];
  const summary = recording?.aiSummary;
  const followUpDate = summary?.follow_up_date
    ? format(new Date(summary.follow_up_date), "dd MMMM yyyy")
    : format(addDays(new Date(), 14), "dd MMMM yyyy");

  const loading = recLoading || prepLoading;

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Suggested Follow-up */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <CalendarDays className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Suggested Follow-up</p>
          <p className="text-sm font-medium text-foreground">{followUpDate}</p>
        </div>
      </div>

      {/* Send Message */}
      {clientId && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
          <Mail className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Send Follow-up Message</p>
            <p className="text-xs text-muted-foreground">Draft email, WhatsApp, or SMS to {clientName}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: AI Action Items + Tasks */}
        <div className="space-y-4">
          {actionItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">AI Action Items</h3>
              </div>
              {actionItems.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border">
                  <PriorityDot priority={item.priority} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Outstanding Tasks */}
          {tasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outstanding Tasks</h3>
              {tasks.slice(0, 5).map((t) => {
                const isOverdue = t.isOverdue || (t.dueDate && isPast(new Date(t.dueDate)));
                const linkedOutcome = findLinkedOutcome(t.title, keyOutcomes);
                return (
                  <div key={t.id} className="rounded-lg bg-card border border-border p-2.5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 shrink-0 ${isOverdue ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-600"}`}>
                        <CheckSquare className="h-3 w-3 mr-0.5" />{t.status}
                      </Badge>
                      <span className="text-sm font-medium text-foreground truncate flex-1">{t.title}</span>
                    </div>
                    {t.dueDate && (
                      <span className={`text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        Due: {format(new Date(t.dueDate), "dd MMM yyyy")}{isOverdue ? " • Overdue" : ""}
                      </span>
                    )}
                    {linkedOutcome && (
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-xs text-muted-foreground truncate flex-1">{linkedOutcome.text}</span>
                        <Badge variant="secondary" className={`text-[9px] px-1 py-0 ${originConfig[linkedOutcome.origin]?.className}`}>
                          {originConfig[linkedOutcome.origin]?.label}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Opportunities */}
        <div className="space-y-4">
          {opportunities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opportunities</h3>
              {opportunities.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 bg-amber-500/10 text-amber-600">
                    <TrendingUp className="h-3 w-3 mr-0.5" />Opportunity
                  </Badge>
                  <span className="text-sm text-foreground truncate flex-1">{o.opportunityType}</span>
                  {o.potentialRevenue && <span className="text-xs text-muted-foreground shrink-0">R {o.potentialRevenue.toLocaleString()}</span>}
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
      </div>
    </div>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = { High: "bg-destructive", Medium: "bg-amber-500", Low: "bg-muted-foreground" };
  return <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colors[priority] || colors.Low}`} />;
}
