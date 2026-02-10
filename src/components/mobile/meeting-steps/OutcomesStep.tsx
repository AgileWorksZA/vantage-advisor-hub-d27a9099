import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useMeetingRecordings } from "@/hooks/useMeetingRecordings";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Sparkles, FileText, CheckCircle2, Lightbulb, Users, Loader2, ChevronDown, ChevronUp, StickyNote, Clock, Target } from "lucide-react";
import { KeyOutcome } from "../MobileMeetingScreen";
import { matchTranscript } from "@/lib/transcript-utils";

interface OutcomesStepProps {
  eventId: string;
  clientId: string | null;
  onConvertToTask: (title: string, description: string) => void;
  keyOutcomes: KeyOutcome[];
  onAddOutcome: (text: string) => void;
  onToggleOutcome: (id: string) => void;
  onUpdateOutcomeNote: (id: string, note: string) => void;
  setKeyOutcomes: Dispatch<SetStateAction<KeyOutcome[]>>;
}

export default function OutcomesStep({ eventId, clientId, onConvertToTask, keyOutcomes, onAddOutcome, onToggleOutcome, onUpdateOutcomeNote, setKeyOutcomes }: OutcomesStepProps) {
  const { recordings, loading } = useMeetingRecordings(eventId, clientId || undefined);
  const [newOutcome, setNewOutcome] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteEditId, setNoteEditId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [matchedOnce, setMatchedOnce] = useState(false);

  const recording = recordings[0];
  const summary = recording?.aiSummary;
  const transcription = recording?.transcription || null;

  // Auto-match outcomes with transcription once
  useEffect(() => {
    if (matchedOnce || !transcription || keyOutcomes.length === 0) return;
    setMatchedOnce(true);
    setKeyOutcomes(prev => prev.map(o => {
      const match = matchTranscript(o.text, transcription);
      if (match) {
        return { ...o, completed: true, transcriptTimestamp: match.timestamp, transcriptSnippet: match.snippet };
      }
      return o;
    }));
  }, [transcription, keyOutcomes.length, matchedOnce, setKeyOutcomes]);

  const handleAddOutcome = () => {
    if (newOutcome.trim()) {
      onAddOutcome(newOutcome.trim());
      setNewOutcome("");
    }
  };

  const handleSaveNote = (id: string) => {
    onUpdateOutcomeNote(id, noteText);
    setNoteEditId(null);
    setNoteText("");
  };

  const originConfig = {
    prep: { label: "Prep", className: "bg-blue-500/10 text-blue-600" },
    meeting: { label: "During Meeting", className: "bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)]" },
    "post-meeting": { label: "Post-Meeting", className: "bg-amber-500/10 text-amber-600" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Key Outcomes Checklist */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Target className="h-4 w-4 text-[hsl(180,70%,45%)]" />
          <h3 className="text-xs font-semibold text-[hsl(180,70%,45%)] uppercase tracking-wider flex-1">Key Outcomes</h3>
        </div>

        {keyOutcomes.length === 0 && (
          <p className="text-xs text-muted-foreground px-1 py-2">No outcomes defined yet. Add some below.</p>
        )}

        {keyOutcomes.map((outcome) => {
          const origin = originConfig[outcome.origin];
          const isExpanded = expandedId === outcome.id;
          const isEditingNote = noteEditId === outcome.id;

          return (
            <div key={outcome.id} className="rounded-lg bg-card border border-border overflow-hidden">
              <div className="flex items-start gap-2.5 p-2.5">
                <Checkbox
                  checked={outcome.completed}
                  onCheckedChange={() => onToggleOutcome(outcome.id)}
                  className="mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <span className={`text-sm ${outcome.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {outcome.text}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${origin.className}`}>
                      {origin.label}
                    </Badge>
                    {outcome.transcriptTimestamp && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        at {outcome.transcriptTimestamp}
                      </Badge>
                    )}
                    {outcome.transcriptSnippet && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : outcome.id)}
                        className="text-[10px] text-[hsl(180,70%,45%)] flex items-center gap-0.5"
                      >
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {isExpanded ? "Hide" : "Show"} snippet
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isEditingNote) {
                      setNoteEditId(null);
                    } else {
                      setNoteEditId(outcome.id);
                      setNoteText(outcome.note || "");
                    }
                  }}
                  className={`p-1 rounded-md shrink-0 transition-colors ${outcome.note ? "text-amber-500" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <StickyNote className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Expanded transcript snippet */}
              {isExpanded && outcome.transcriptSnippet && (
                <div className="px-3 pb-2.5 pt-0">
                  <div className="p-2 rounded bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground italic leading-relaxed">"{outcome.transcriptSnippet}"</p>
                  </div>
                </div>
              )}

              {/* Note editor */}
              {isEditingNote && (
                <div className="px-3 pb-2.5 pt-0 flex gap-2">
                  <Input
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note..."
                    className="text-xs h-8"
                    onKeyDown={(e) => e.key === "Enter" && handleSaveNote(outcome.id)}
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveNote(outcome.id)}
                    className="text-xs px-2 py-1 rounded bg-[hsl(180,70%,45%)] text-white shrink-0"
                  >
                    Save
                  </button>
                </div>
              )}

              {/* Existing note display */}
              {outcome.note && !isEditingNote && (
                <div className="px-3 pb-2.5 pt-0">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <StickyNote className="h-3 w-3 text-amber-500" />
                    {outcome.note}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Add new outcome */}
        <div className="flex gap-2">
          <Input
            value={newOutcome}
            onChange={(e) => setNewOutcome(e.target.value)}
            placeholder="Add post-meeting outcome..."
            className="text-sm h-9"
            onKeyDown={(e) => e.key === "Enter" && handleAddOutcome()}
          />
          <button
            onClick={handleAddOutcome}
            className="shrink-0 p-2 rounded-lg bg-[hsl(180,70%,45%)] text-white"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* AI Summary (existing, shown below outcomes) */}
      {recording && summary && (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="h-4 w-4 text-[hsl(180,70%,45%)]" />
              <h3 className="text-xs font-semibold text-[hsl(180,70%,45%)] uppercase tracking-wider">AI Summary</h3>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-sm text-foreground leading-relaxed">{summary.summary}</p>
            </div>
          </div>

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
        </>
      )}

      {/* Empty state when no recording */}
      {!recording && keyOutcomes.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">No meeting recording or outcomes captured yet.</p>
          <p className="text-xs text-muted-foreground">Record the meeting to generate AI outcomes automatically.</p>
        </div>
      )}

      {/* Manual capture action when no recording but has outcomes */}
      {!recording && keyOutcomes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Recommended Actions</h3>
          <ActionRow
            text="Manually capture meeting outcomes"
            onConvert={() => onConvertToTask("Capture meeting outcomes", "Review and document key decisions and action items from the meeting")}
          />
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
