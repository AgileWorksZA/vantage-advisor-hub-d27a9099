import { useMeetingRecordings } from "@/hooks/useMeetingRecordings";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, FileText, CheckCircle2, Lightbulb, Users, Loader2 } from "lucide-react";

interface OutcomesStepProps {
  eventId: string;
  clientId: string | null;
  onConvertToTask: (title: string, description: string) => void;
}

export default function OutcomesStep({ eventId, clientId, onConvertToTask }: OutcomesStepProps) {
  const { recordings, loading } = useMeetingRecordings(eventId, clientId || undefined);

  const recording = recordings[0];
  const summary = recording?.aiSummary;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!recording || !summary) {
    return (
      <div className="space-y-5 pb-6">
        <div className="text-center py-12 space-y-3">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">No meeting recording or outcomes captured yet.</p>
          <p className="text-xs text-muted-foreground">Record the meeting to generate AI outcomes automatically.</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Recommended Actions</h3>
          <ActionRow
            text="Manually capture meeting outcomes"
            onConvert={() => onConvertToTask("Capture meeting outcomes", "Review and document key decisions and action items from the meeting")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* AI Summary */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="h-4 w-4 text-[hsl(180,70%,45%)]" />
          <h3 className="text-xs font-semibold text-[hsl(180,70%,45%)] uppercase tracking-wider">AI Summary</h3>
        </div>
        <div className="p-3 rounded-lg bg-card border border-border">
          <p className="text-sm text-foreground leading-relaxed">{summary.summary}</p>
        </div>
      </div>

      {/* Key Topics */}
      {summary.key_topics?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Key Topics</h3>
          <div className="flex flex-wrap gap-2">
            {summary.key_topics.map((topic, i) => (
              <Badge key={i} variant="secondary" className="text-xs bg-violet-500/10 text-violet-600">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Decisions Made */}
      {summary.decisions_made?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Decisions Made</h3>
          {summary.decisions_made.map((decision, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-sm text-foreground flex-1">{decision}</span>
              <button
                onClick={() => onConvertToTask(`Follow up: ${decision}`, `Decision made during meeting: ${decision}`)}
                className="p-1 rounded-md bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/20"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Client Facts */}
      {summary.client_facts && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Client Insights</h3>
          <div className="space-y-1.5">
            {summary.client_facts.financial_goals?.map((goal, i) => (
              <InsightRow key={`goal-${i}`} icon={<Lightbulb className="h-3.5 w-3.5 text-amber-500" />} text={`Goal: ${goal}`} />
            ))}
            {summary.client_facts.concerns?.map((concern, i) => (
              <InsightRow key={`concern-${i}`} icon={<Users className="h-3.5 w-3.5 text-rose-500" />} text={`Concern: ${concern}`} />
            ))}
            {summary.client_facts.risk_tolerance && (
              <InsightRow icon={<Lightbulb className="h-3.5 w-3.5 text-amber-500" />} text={`Risk tolerance: ${summary.client_facts.risk_tolerance}`} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InsightRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
      {icon}
      <span className="text-sm text-foreground">{text}</span>
    </div>
  );
}

function ActionRow({ text, onConvert }: { text: string; onConvert: () => void }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[hsl(180,70%,45%)]/5 border border-[hsl(180,70%,45%)]/20">
      <Sparkles className="h-3.5 w-3.5 text-[hsl(180,70%,45%)] shrink-0" />
      <span className="text-sm text-foreground flex-1">{text}</span>
      <button
        onClick={onConvert}
        className="p-1 rounded-md bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/20"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
