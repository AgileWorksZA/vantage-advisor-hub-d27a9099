import { useState, useRef, useEffect } from "react";
import { Mic, Square, X, CheckSquare, Clock, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { showMobileNotification } from "./MobileNotificationBanner";

interface SuggestedAction {
  id: string;
  type: "task" | "reminder" | "email" | "call";
  text: string;
}

const actionKeywords: Record<string, SuggestedAction["type"]> = {
  schedule: "reminder",
  remind: "reminder",
  follow: "task",
  task: "task",
  email: "email",
  send: "email",
  call: "call",
  phone: "call",
  contact: "call",
  review: "task",
  prepare: "task",
  update: "task",
};

function extractActions(text: string): SuggestedAction[] {
  const sentences = text.split(/[.!?\n]+/).map(s => s.trim()).filter(Boolean);
  const actions: SuggestedAction[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    for (const [keyword, type] of Object.entries(actionKeywords)) {
      if (lower.includes(keyword)) {
        actions.push({ id: crypto.randomUUID(), type, text: sentence });
        break;
      }
    }
  }

  return actions;
}

const actionTypeConfig: Record<string, { label: string; className: string }> = {
  task: { label: "Task", className: "bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)]" },
  reminder: { label: "Reminder", className: "bg-amber-500/10 text-amber-600" },
  email: { label: "Email", className: "bg-purple-500/10 text-purple-600" },
  call: { label: "Call", className: "bg-blue-500/10 text-blue-600" },
};

export default function MobileVoiceMemo() {
  const [state, setState] = useState<"idle" | "recording" | "done">("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [actions, setActions] = useState<SuggestedAction[]>([]);
  const [unsupported, setUnsupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setUnsupported(true);
  }, []);

  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setUnsupported(true);
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = () => {
      stopRecording();
    };

    recognition.start();
    recognitionRef.current = recognition;
    setState("recording");
    setTranscript("");
    setInterimTranscript("");
    setElapsed(0);
    setActions([]);

    timerRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setState("done");

    // Extract actions from full transcript
    setTimeout(() => {
      setActions(extractActions(transcript));
    }, 200);
  };

  const handleClose = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setState("idle");
    setTranscript("");
    setInterimTranscript("");
    setElapsed(0);
    setActions([]);
  };

  const handleCreateTask = (action: SuggestedAction) => {
    showMobileNotification("success", "Task created", action.text);
    setActions(prev => prev.filter(a => a.id !== action.id));
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (unsupported) return null;

  // Recording overlay
  if (state === "recording") {
    return (
      <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur flex flex-col">
        <header className="flex items-center justify-between px-4 h-12 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm font-medium text-destructive">Recording</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(elapsed)}
            </Badge>
          </div>
        </header>

        <div className="flex-1 p-4 overflow-y-auto">
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {transcript}
            <span className="text-muted-foreground">{interimTranscript}</span>
            {!transcript && !interimTranscript && (
              <span className="text-muted-foreground italic">Listening...</span>
            )}
          </p>
        </div>

        <div className="p-4 border-t border-border flex justify-center">
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Square className="h-6 w-6 text-destructive-foreground" />
          </button>
        </div>
      </div>
    );
  }

  // Done overlay
  if (state === "done") {
    return (
      <div className="absolute inset-0 z-50 bg-background flex flex-col">
        <header className="flex items-center justify-between px-4 h-12 border-b border-border">
          <h1 className="text-sm font-semibold text-foreground">Voice Memo</h1>
          <button onClick={handleClose} className="p-1">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Transcript */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Transcription</p>
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {transcript || "No speech detected."}
              </p>
            </div>
          </div>

          {/* Suggested actions */}
          {actions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[hsl(180,70%,45%)]" />
                <p className="text-xs font-semibold text-[hsl(180,70%,45%)] uppercase tracking-wider">Suggested Actions</p>
              </div>
              <div className="space-y-2">
                {actions.map(action => {
                  const config = actionTypeConfig[action.type];
                  return (
                    <div key={action.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 shrink-0 ${config.className}`}>
                        {config.label}
                      </Badge>
                      <span className="text-sm text-foreground flex-1">{action.text}</span>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleCreateTask(action)}
                          className="p-1 rounded bg-[hsl(180,70%,45%)]/10 text-[hsl(180,70%,45%)]"
                        >
                          <CheckSquare className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setActions(prev => prev.filter(a => a.id !== action.id))}
                          className="p-1 rounded bg-muted text-muted-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {transcript && actions.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">No actionable items detected.</p>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <Button onClick={handleClose} className="w-full">Done</Button>
        </div>
      </div>
    );
  }

  // Idle FAB
  return (
    <button
      onClick={startRecording}
      className="absolute bottom-[4.5rem] right-4 z-20 w-12 h-12 rounded-full bg-[hsl(180,70%,45%)] text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      aria-label="Record voice memo"
    >
      <Mic className="h-5 w-5" />
    </button>
  );
}
