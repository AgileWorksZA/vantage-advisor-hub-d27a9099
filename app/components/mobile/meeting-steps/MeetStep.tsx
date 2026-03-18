import { useState, useEffect, useRef } from "react";
import { Mic, Plus, Sparkles, MessageSquare, Target, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { KeyOutcome } from "../MobileMeetingScreen";

interface MeetStepProps {
  startTime: Date;
  endTime: Date;
  talkingPoints: string[];
  onConvertToTask: (title: string, description: string) => void;
  keyOutcomes: KeyOutcome[];
  onAddOutcome: (text: string) => void;
}

export default function MeetStep({ startTime, endTime, talkingPoints, onConvertToTask, keyOutcomes, onAddOutcome }: MeetStepProps) {
  const [elapsed, setElapsed] = useState(0);
  const [quickNote, setQuickNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [newOutcome, setNewOutcome] = useState("");
  const [outcomesOpen, setOutcomesOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((now.getTime() - startTime.getTime()) / 1000));
      setElapsed(diff);
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startTime]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  const addNote = () => {
    if (quickNote.trim()) {
      setNotes(prev => [...prev, quickNote.trim()]);
      setQuickNote("");
    }
  };

  const handleAddOutcome = () => {
    if (newOutcome.trim()) {
      onAddOutcome(newOutcome.trim());
      setNewOutcome("");
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Timer */}
      <div className="text-center py-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Elapsed Time</p>
        <p className="text-4xl font-mono font-bold text-foreground tracking-wider">
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </p>
      </div>

      {/* Record Meeting */}
      <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium text-sm">
        <Mic className="h-4 w-4" />
        Record Meeting
      </button>

      {/* Quick Note */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Quick Note</h3>
        <div className="flex gap-2">
          <Textarea
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="Jot something down..."
            className="min-h-[60px] text-sm flex-1"
          />
          <button
            onClick={addNote}
            className="self-end p-2.5 rounded-lg bg-[hsl(180,70%,45%)] text-white"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {notes.length > 0 && (
          <div className="space-y-1">
            {notes.map((note, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-card border border-border">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{note}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Key Outcomes (collapsible) */}
      <div className="space-y-2">
        <button
          onClick={() => setOutcomesOpen(!outcomesOpen)}
          className="flex items-center gap-2 w-full px-1"
        >
          <Target className="h-3.5 w-3.5 text-[hsl(180,70%,45%)]" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1 text-left">
            Key Outcomes ({keyOutcomes.length})
          </h3>
          {outcomesOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
        {outcomesOpen && (
          <div className="space-y-1.5">
            {keyOutcomes.map((outcome) => (
              <div key={outcome.id} className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 shrink-0 ${
                  outcome.origin === "prep" ? "bg-blue-500/10 text-blue-600" :
                  outcome.origin === "meeting" ? "bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)]" :
                  "bg-amber-500/10 text-amber-600"
                }`}>
                  {outcome.origin === "prep" ? "Prep" : outcome.origin === "meeting" ? "Meeting" : "Post"}
                </Badge>
                <span className="text-sm text-foreground flex-1 truncate">{outcome.text}</span>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                placeholder="Add outcome..."
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
        )}
      </div>

      {/* Talking Points */}
      {talkingPoints.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Key Talking Points</h3>
          <div className="flex flex-wrap gap-2">
            {talkingPoints.map((point, i) => (
              <Badge key={i} variant="secondary" className="text-xs bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)]">
                {point}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Recommended Actions</h3>
        <ActionRow
          text="Add meeting notes to CRM"
          onConvert={() => onConvertToTask("Add meeting notes to CRM", "Capture key discussion points and decisions from the meeting")}
        />
        <ActionRow
          text="Schedule follow-up"
          onConvert={() => onConvertToTask("Schedule follow-up meeting", "Book a follow-up meeting based on outcomes discussed")}
        />
      </div>
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
        className="p-1 rounded-md bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/20 transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
