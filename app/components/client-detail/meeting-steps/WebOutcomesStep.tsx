import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useMeetingRecordings } from "@/hooks/useMeetingRecordings";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Sparkles, FileText, CheckCircle2, Lightbulb, Users, Loader2, ChevronDown, ChevronUp, StickyNote, Clock, Target } from "lucide-react";
import type { KeyOutcome } from "./WebPrepStep";
import { matchTranscript } from "@/lib/transcript-utils";

interface WebOutcomesStepProps {
  eventId: string;
  clientId: string | null;
  keyOutcomes: KeyOutcome[];
  onAddOutcome: (text: string) => void;
  onToggleOutcome: (id: string) => void;
  onUpdateOutcomeNote: (id: string, note: string) => void;
  setKeyOutcomes: Dispatch<SetStateAction<KeyOutcome[]>>;
}

export default function WebOutcomesStep({ eventId, clientId, keyOutcomes, onAddOutcome, onToggleOutcome, onUpdateOutcomeNote, setKeyOutcomes }: WebOutcomesStepProps) {
  const { recordings, loading } = useMeetingRecordings(eventId, clientId || undefined);
  const [newOutcome, setNewOutcome] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteEditId, setNoteEditId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [matchedOnce, setMatchedOnce] = useState(false);

  const recording = recordings[0];
  const summary = recording?.aiSummary;
  const transcription = recording?.transcription || null;

  useEffect(() => {
    if (matchedOnce || !transcription || keyOutcomes.length === 0) return;
    setMatchedOnce(true);
    setKeyOutcomes(prev => prev.map(o => {
      const match = matchTranscript(o.text, transcription);
      if (match) return { ...o, completed: true, transcriptTimestamp: match.timestamp, transcriptSnippet: match.snippet };
      return o;
    }));
  }, [transcription, keyOutcomes.length, matchedOnce, setKeyOutcomes]);

  const handleAddOutcome = () => {
    if (newOutcome.trim()) { onAddOutcome(newOutcome.trim()); setNewOutcome(""); }
  };

  const handleSaveNote = (id: string) => {
    onUpdateOutcomeNote(id, noteText);
    setNoteEditId(null);
    setNoteText("");
  };

  const originConfig = {
    prep: { label: "Prep", className: "bg-blue-500/10 text-blue-600" },
    meeting: { label: "During Meeting", className: "bg-primary/10 text-primary" },
    "post-meeting": { label: "Post-Meeting", className: "bg-amber-500/10 text-amber-600" },
  };

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Key Outcomes Checklist */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex-1">Key Outcomes</h3>
        </div>

        {keyOutcomes.length === 0 && <p className="text-xs text-muted-foreground py-2">No outcomes defined yet.</p>}

        {keyOutcomes.map((outcome) => {
          const origin = originConfig[outcome.origin];
          const isExpanded = expandedId === outcome.id;
          const isEditingNote = noteEditId === outcome.id;

          return (
            <div key={outcome.id} className="rounded-lg bg-card border border-border overflow-hidden">
              <div className="flex items-start gap-2.5 p-3">
                <Checkbox checked={outcome.completed} onCheckedChange={() => onToggleOutcome(outcome.id)} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <span className={`text-sm ${outcome.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{outcome.text}</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${origin.className}`}>{origin.label}</Badge>
                    {outcome.transcriptTimestamp && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground gap-0.5">
                        <Clock className="h-2.5 w-2.5" />at {outcome.transcriptTimestamp}
                      </Badge>
                    )}
                    {outcome.transcriptSnippet && (
                      <button onClick={() => setExpandedId(isExpanded ? null : outcome.id)} className="text-[10px] text-primary flex items-center gap-0.5">
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {isExpanded ? "Hide" : "Show"} snippet
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { if (isEditingNote) { setNoteEditId(null); } else { setNoteEditId(outcome.id); setNoteText(outcome.note || ""); } }}
                  className={`p-1 rounded-md shrink-0 transition-colors ${outcome.note ? "text-amber-500" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <StickyNote className="h-3.5 w-3.5" />
                </button>
              </div>
              {isExpanded && outcome.transcriptSnippet && (
                <div className="px-3 pb-3 pt-0">
                  <div className="p-2 rounded bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground italic leading-relaxed">"{outcome.transcriptSnippet}"</p>
                  </div>
                </div>
              )}
              {isEditingNote && (
                <div className="px-3 pb-3 pt-0 flex gap-2">
                  <Input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note..." className="text-xs h-8" onKeyDown={(e) => e.key === "Enter" && handleSaveNote(outcome.id)} autoFocus />
                  <button onClick={() => handleSaveNote(outcome.id)} className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground shrink-0">Save</button>
                </div>
              )}
              {outcome.note && !isEditingNote && (
                <div className="px-3 pb-3 pt-0">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><StickyNote className="h-3 w-3 text-amber-500" />{outcome.note}</p>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex gap-2">
          <Input value={newOutcome} onChange={(e) => setNewOutcome(e.target.value)} placeholder="Add post-meeting outcome..." className="text-sm h-9" onKeyDown={(e) => e.key === "Enter" && handleAddOutcome()} />
          <button onClick={handleAddOutcome} className="shrink-0 p-2 rounded-lg bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>
        </div>
      </div>

      {/* AI Summary */}
      {recording && summary && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">AI Summary</h3>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-sm text-foreground leading-relaxed">{summary.summary}</p>
            </div>
          </div>

          {summary.key_topics?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Topics</h3>
              <div className="flex flex-wrap gap-2">
                {summary.key_topics.map((topic: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-violet-500/10 text-violet-600">{topic}</Badge>
                ))}
              </div>
            </div>
          )}

          {summary.decisions_made?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Decisions Made</h3>
              {summary.decisions_made.map((decision: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground flex-1">{decision}</span>
                </div>
              ))}
            </div>
          )}

          {summary.client_facts && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client Insights</h3>
              <div className="space-y-1.5">
                {summary.client_facts.financial_goals?.map((goal: string, i: number) => (
                  <div key={`g-${i}`} className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" /><span className="text-sm text-foreground">Goal: {goal}</span>
                  </div>
                ))}
                {summary.client_facts.concerns?.map((c: string, i: number) => (
                  <div key={`c-${i}`} className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border">
                    <Users className="h-3.5 w-3.5 text-rose-500" /><span className="text-sm text-foreground">Concern: {c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!recording && keyOutcomes.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">No meeting recording or outcomes captured yet.</p>
        </div>
      )}
    </div>
  );
}
