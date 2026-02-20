import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Mic, Square, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "client" | "system";
  text: string;
}

interface SuggestedAction {
  id: string;
  type: "portfolio" | "meeting" | "insurance" | "document" | "planning";
  label: string;
  response?: string;
  messageAdviser?: string;
}

const actionKeywords: Record<string, SuggestedAction["type"]> = {
  portfolio: "portfolio",
  performance: "portfolio",
  returns: "portfolio",
  investment: "portfolio",
  meeting: "meeting",
  schedule: "meeting",
  appointment: "meeting",
  risk: "insurance",
  cover: "insurance",
  insurance: "insurance",
  life: "insurance",
  statement: "document",
  document: "document",
  report: "document",
  tax: "planning",
  retirement: "planning",
  planning: "planning",
  estate: "planning",
};

const actionConfig: Record<SuggestedAction["type"], { label: string; response?: string; messageAdviser?: string; chipClass: string }> = {
  portfolio: {
    label: "Check portfolio performance",
    response: "Your portfolio is up 8.2% year-to-date, outperforming the benchmark by 1.4%. Your equity allocation is at 62% and fixed income at 28%.",
    chipClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  meeting: {
    label: "Schedule a meeting",
    messageAdviser: "Hi, I'd like to schedule a meeting to discuss my financial plan. Could you please share some available times?",
    chipClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  insurance: {
    label: "Review risk cover",
    response: "Your current life cover is R5.2M with disability cover at 75% of income. I'd recommend reviewing this given recent changes.",
    messageAdviser: "I'd like to discuss my risk cover and whether it's still adequate for my needs.",
    chipClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  document: {
    label: "Request a statement",
    response: "Your latest portfolio statement was generated on 1 Feb 2026. You can find it in the Documents tab.",
    chipClass: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },
  planning: {
    label: "Discuss financial planning",
    messageAdviser: "I'd like to discuss my financial plan, specifically around retirement and tax planning.",
    chipClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20",
  },
};

function extractClientActions(text: string): SuggestedAction[] {
  const lower = text.toLowerCase();
  const found = new Set<SuggestedAction["type"]>();
  const actions: SuggestedAction[] = [];

  for (const [keyword, type] of Object.entries(actionKeywords)) {
    if (lower.includes(keyword) && !found.has(type)) {
      found.add(type);
      const config = actionConfig[type];
      actions.push({
        id: crypto.randomUUID(),
        type,
        label: config.label,
        response: config.response,
        messageAdviser: config.messageAdviser,
      });
    }
  }
  return actions;
}

interface ClientVoiceChatProps {
  onClose: () => void;
  onMessageAdviser: (draft: string) => void;
}

export default function ClientVoiceChat({ onClose, onMessageAdviser }: ClientVoiceChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [actions, setActions] = useState<SuggestedAction[]>([]);
  const [unsupported, setUnsupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fullTranscriptRef = useRef("");

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setUnsupported(true);
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (finalText) {
        fullTranscriptRef.current += finalText;
      }
      setInterimText(interim);
    };

    recognition.onerror = () => stopRecording();

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    fullTranscriptRef.current = "";
    setInterimText("");
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);

    const text = fullTranscriptRef.current.trim();
    if (text) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "client", text }]);
      const extracted = extractClientActions(text);
      setActions(extracted);
      scrollToBottom();
    }
    setInterimText("");
  };

  const handleAction = (action: SuggestedAction) => {
    if (action.response) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "system", text: action.response! }]);
      setActions(prev => prev.filter(a => a.id !== action.id));
      scrollToBottom();
    } else if (action.messageAdviser) {
      onMessageAdviser(action.messageAdviser);
    }
  };

  const handleMessageAdviser = (action: SuggestedAction) => {
    if (action.messageAdviser) {
      onMessageAdviser(action.messageAdviser);
    }
  };

  if (unsupported) {
    return (
      <div className="absolute inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground text-sm text-center">Speech recognition is not supported in this browser.</p>
        <Button variant="outline" className="mt-4" onClick={onClose}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0">
        <button onClick={onClose} className="p-1 -ml-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-sm font-semibold text-foreground">Talk to Adviser</h1>
      </header>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isRecording && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 opacity-60">
            <Mic className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Tap the microphone to start speaking</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.role === "client" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm",
                msg.role === "client"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isRecording && (interimText || fullTranscriptRef.current) && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm bg-primary/80 text-primary-foreground">
              {fullTranscriptRef.current}
              <span className="opacity-60">{interimText}</span>
              {!fullTranscriptRef.current && !interimText && (
                <span className="opacity-50 italic">Listening...</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action chips */}
      {actions.length > 0 && (
        <div className="px-4 py-2 border-t border-border shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {actions.map((action) => (
              <div key={action.id} className="flex gap-1 shrink-0">
                <button
                  onClick={() => handleAction(action)}
                  className={cn("text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap", actionConfig[action.type].chipClass)}
                >
                  {action.label}
                </button>
                {action.response && action.messageAdviser && (
                  <button
                    onClick={() => handleMessageAdviser(action)}
                    className="text-xs px-2 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mic button */}
      <div className="p-4 border-t border-border flex justify-center shrink-0">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform",
            isRecording
              ? "bg-destructive"
              : "bg-primary"
          )}
        >
          {isRecording ? (
            <Square className="h-6 w-6 text-destructive-foreground" />
          ) : (
            <Mic className="h-6 w-6 text-primary-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}
