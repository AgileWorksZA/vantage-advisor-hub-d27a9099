import { useState } from "react";
import { useMeetingRecordings } from "@/hooks/useMeetingRecordings";
import { useClientMeetingPrep } from "@/hooks/useClientMeetingPrep";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Sparkles, CalendarDays, CheckSquare, TrendingUp, Loader2, ChevronRight, Target, ChevronDown, ChevronUp, Mail, AlertTriangle, Check } from "lucide-react";
import { format, addDays, isPast } from "date-fns";
import { showMobileNotification } from "../MobileNotificationBanner";
import type { DetailView } from "./PrepStep";
import type { KeyOutcome } from "../MobileMeetingScreen";
import ScheduleFollowUpPanel from "./ScheduleFollowUpPanel";
import MobileComposeMessageSheet from "./MobileComposeMessageSheet";

interface FollowUpsStepProps {
  eventId: string;
  clientId: string | null;
  clientName?: string;
  meetingTitle?: string;
  onConvertToTask: (title: string, description: string) => void;
  onTagClick: (view: DetailView) => void;
  keyOutcomes?: KeyOutcome[];
  transcription?: string | null;
  onMessageSent?: (channel: string, sentAt: string, clientName: string) => void;
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

export default function FollowUpsStep({ eventId, clientId, clientName, meetingTitle, onConvertToTask, onTagClick, keyOutcomes = [], transcription = null, onMessageSent }: FollowUpsStepProps) {
  const { recordings, loading: recLoading } = useMeetingRecordings(eventId, clientId || undefined);
  const { tasks, opportunities, loading: prepLoading } = useClientMeetingPrep(clientId);
  

  const [followUpExpanded, setFollowUpExpanded] = useState(false);
  const [scheduledTaskIds, setScheduledTaskIds] = useState<string[]>([]);
  const [scheduledInfo, setScheduledInfo] = useState<{ date: string; time: string; type: string } | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [sentMessages, setSentMessages] = useState<Record<string, { channel: string; sentAt: string }>>({});

  const recording = recordings[0];
  const actionItems = recording?.aiActionItems || [];
  const summary = recording?.aiSummary;
  const followUpDate = summary?.follow_up_date
    ? format(new Date(summary.follow_up_date), "dd MMMM yyyy")
    : format(addDays(new Date(), 14), "dd MMMM yyyy");
  const followUpDateISO = summary?.follow_up_date || addDays(new Date(), 14).toISOString();

  const recTranscription = recording?.transcription || transcription;
  const loading = recLoading || prepLoading;

  const unaddressedTasks = tasks.filter(t => !scheduledTaskIds.includes(t.id) && t.status !== "Completed");

  const handleScheduled = (taskIds: string[], details: { date: string; time: string; type: string }) => {
    setScheduledTaskIds(prev => [...prev, ...taskIds]);
    setScheduledInfo(details);
    setFollowUpExpanded(false);
  };

  const handleResolveTask = (taskId: string, taskTitle: string) => {
    setScheduledTaskIds(prev => [...prev, taskId]);
    showMobileNotification("success", "Task resolved", taskTitle);
  };

  const handleAddToFollowUp = (taskId: string) => {
    setFollowUpExpanded(true);
    // Task will be included in the panel's task list
  };

  const generateMessageBody = () => {
    const items = tasks.filter(t => t.status !== "Completed").slice(0, 8);
    const outcomes = keyOutcomes.filter(o => !o.completed).slice(0, 5);
    let body = `Hi ${clientName || "there"},\n\nThank you for our meeting. Here is a summary of our follow-up items:\n\n`;
    if (items.length > 0) {
      body += "Outstanding Tasks:\n";
      items.forEach(t => { body += `• ${t.title}\n`; });
      body += "\n";
    }
    if (outcomes.length > 0) {
      body += "Key Outcomes to Address:\n";
      outcomes.forEach(o => { body += `• ${o.text}\n`; });
      body += "\n";
    }
    if (scheduledInfo) {
      body += `Our next follow-up is scheduled for ${scheduledInfo.date} at ${scheduledInfo.time} (${scheduledInfo.type}).\n\n`;
    }
    body += "Please don't hesitate to reach out if you have any questions.\n\nKind regards";
    return body;
  };

  const handleMessageSent = (channel: string, sentAt: string) => {
    // Mark all open tasks as having a message sent
    const openTaskIds = tasks.filter(t => t.status !== "Completed").map(t => t.id);
    const newSent: Record<string, { channel: string; sentAt: string }> = {};
    openTaskIds.forEach(id => { newSent[id] = { channel, sentAt }; });
    setSentMessages(prev => ({ ...prev, ...newSent }));
    setShowCompose(false);
    onMessageSent?.(channel, sentAt, clientName || "Client");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showCompose && clientId) {
    return (
      <MobileComposeMessageSheet
        clientId={clientId}
        clientName={clientName || "Client"}
        subject={`Follow-up: ${meetingTitle || "Meeting"} - ${format(new Date(), "dd MMM yyyy")}`}
        bodyText={generateMessageBody()}
        onClose={() => setShowCompose(false)}
        onSent={(ch, at) => handleMessageSent(ch, at)}
      />
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Suggested Follow-up - Expandable */}
      <div className="rounded-lg border border-[hsl(180,70%,45%)]/20 overflow-hidden">
        <button
          onClick={() => setFollowUpExpanded(!followUpExpanded)}
          className="w-full flex items-center gap-3 p-3 bg-[hsl(180,70%,45%)]/5 hover:bg-[hsl(180,70%,45%)]/10 transition-colors"
        >
          <CalendarDays className="h-5 w-5 text-[hsl(180,70%,45%)]" />
          <div className="text-left flex-1">
            <p className="text-xs text-muted-foreground">Suggested Follow-up</p>
            <p className="text-sm font-medium text-foreground">{followUpDate}</p>
          </div>
          {scheduledInfo ? (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-[10px]">
              <Check className="h-3 w-3 mr-0.5" />
              Scheduled
            </Badge>
          ) : (
            followUpExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {followUpExpanded && !scheduledInfo && (
          <div className="border-t border-[hsl(180,70%,45%)]/20">
            <ScheduleFollowUpPanel
              tasks={tasks.filter(t => t.status !== "Completed").map(t => ({ id: t.id, title: t.title, status: t.status }))}
              clientId={clientId}
              clientName={clientName}
              suggestedDate={followUpDateISO}
              meetingTitle={meetingTitle || "Follow-up"}
              onScheduled={handleScheduled}
            />
          </div>
        )}
      </div>

      {/* Send Message Button */}
      {clientId && (
        <button
          onClick={() => setShowCompose(true)}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent/50 transition-colors"
        >
          <Mail className="h-5 w-5 text-[hsl(180,70%,45%)]" />
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-foreground">Send Follow-up Message</p>
            <p className="text-xs text-muted-foreground">Draft email, WhatsApp, or SMS to {clientName}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

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
            const sent = sentMessages[t.id];

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

                  {/* Message sent badge */}
                  {sent && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-purple-500 shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        {sent.channel} sent {format(new Date(sent.sentAt), "dd MMM HH:mm")}
                      </span>
                    </div>
                  )}

                  {/* Scheduled badge */}
                  {scheduledTaskIds.includes(t.id) && (
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span className="text-xs text-emerald-600">Scheduled for follow-up</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Unaddressed Tasks Warning */}
      {unaddressedTasks.length > 0 && scheduledTaskIds.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Unaddressed Tasks</h3>
          </div>
          <p className="text-xs text-muted-foreground px-1">These tasks have not been included in a follow-up meeting.</p>
          {unaddressedTasks.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <span className="text-sm text-foreground truncate flex-1">{t.title}</span>
              <button
                onClick={() => handleResolveTask(t.id, t.title)}
                className="px-2 py-1 text-[10px] font-medium rounded bg-emerald-500/10 text-emerald-600"
              >
                Resolve
              </button>
              <button
                onClick={() => handleAddToFollowUp(t.id)}
                className="px-2 py-1 text-[10px] font-medium rounded bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)]"
              >
                Add to Follow-up
              </button>
            </div>
          ))}
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
