import { useState, useEffect, useRef } from "react";
import { Mic, Plus, Sparkles, MessageSquare, Target, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { KeyOutcome } from "./WebPrepStep";

interface WebMeetStepProps {
  startTime: Date;
  endTime: Date;
  talkingPoints: string[];
  keyOutcomes: KeyOutcome[];
  onAddOutcome: (text: string) => void;
}

export default function WebMeetStep({ startTime, endTime, talkingPoints, keyOutcomes, onAddOutcome }: WebMeetStepProps) {
  const [elapsed, setElapsed] = useState(0);
  const [quickNote, setQuickNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [newOutcome, setNewOutcome] = useState("");
  const [outcomesOpen, setOutcomesOpen] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Math.floor((Date.now() - startTime.getTime()) / 1000));
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
    <div className="space-y-5">
      {/* Timer */}
      <div className="text-center py-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Elapsed Time</p>
        <p className="text-4xl font-mono font-bold text-foreground tracking-wider">
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </p>
      </div>

      {/* Record Button */}
      <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium text-sm">
        <Mic className="h-4 w-4" />
        Record Meeting
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Notes */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Note</h3>
          <div className="flex gap-2">
            <Textarea value={quickNote} onChange={(e) => setQuickNote(e.target.value)} placeholder="Jot something down..." className="min-h-[80px] text-sm flex-1" />
            <button onClick={addNote} className="self-end p-2.5 rounded-lg bg-primary text-primary-foreground">
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

        {/* Right: Talking Points + Outcomes */}
        <div className="space-y-4">
          {/* Talking Points */}
          {talkingPoints.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Talking Points</h3>
              <div className="flex flex-wrap gap-2">
                {talkingPoints.map((point, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-primary/10 text-primary">{point}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Key Outcomes */}
          <div className="space-y-2">
            <button onClick={() => setOutcomesOpen(!outcomesOpen)} className="flex items-center gap-2 w-full">
              <Target className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1 text-left">Key Outcomes ({keyOutcomes.length})</h3>
              {outcomesOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
            {outcomesOpen && (
              <div className="space-y-1.5">
                {keyOutcomes.map((outcome) => (
                  <div key={outcome.id} className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      outcome.origin === "prep" ? "bg-blue-500/10 text-blue-600" :
                      outcome.origin === "meeting" ? "bg-primary/10 text-primary" :
                      "bg-amber-500/10 text-amber-600"
                    }`}>
                      {outcome.origin === "prep" ? "Prep" : outcome.origin === "meeting" ? "Meeting" : "Post"}
                    </Badge>
                    <span className="text-sm text-foreground flex-1 truncate">{outcome.text}</span>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input value={newOutcome} onChange={(e) => setNewOutcome(e.target.value)} placeholder="Add outcome..." className="text-sm h-9" onKeyDown={(e) => e.key === "Enter" && handleAddOutcome()} />
                  <button onClick={handleAddOutcome} className="shrink-0 p-2 rounded-lg bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Actions */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recommended Actions</h3>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-sm text-foreground flex-1">Add meeting notes to CRM</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-sm text-foreground flex-1">Schedule follow-up</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
