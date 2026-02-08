import { useState, useCallback, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const generateResponse = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes("upsell") || lower.includes("growth"))
    return "I've identified 12 upsell opportunities across your client base. The top 3 involve clients with significant investable assets who currently only have basic investment products. Would you like me to show the details?";
  if (lower.includes("risk") || lower.includes("churn"))
    return "Based on engagement patterns and portfolio activity, I've flagged 5 clients who may be at risk. Key indicators include reduced communication frequency and recent competitor inquiries. Shall I list them?";
  if (lower.includes("task") || lower.includes("overdue"))
    return "You currently have 14 open tasks, 5 of which are overdue. The most critical ones involve annual reviews and document follow-ups. Want me to help prioritise?";
  if (lower.includes("meeting") || lower.includes("calendar"))
    return "You have 6 meetings scheduled this week. I can prepare briefing notes for each, including recent portfolio performance and outstanding action items. Shall I proceed?";
  if (lower.includes("compliance") || lower.includes("fica"))
    return "There are 6 clients with outstanding compliance items — 3 need updated FICA documents and 3 have overdue annual reviews. I can create tasks for each if you'd like.";
  return "I'll analyse your client data to help with that. Based on your practice metrics, I can provide targeted insights and actionable recommendations. Could you tell me more about what you're looking for?";
};

const suggestedPrompts = [
  "Show upsell opportunities",
  "Any overdue tasks?",
  "Prepare meeting briefs",
  "Compliance alerts",
];

const MobileAITab = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      setTimeout(() => {
        const response = generateResponse(content);
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);
      }, 1200);
    },
    []
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[hsl(180,70%,45%)] to-[hsl(280,70%,60%)] flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">
                Ask me about your clients, tasks, portfolio, or practice metrics
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                msg.role === "user"
                  ? "bg-[hsl(180,70%,45%)] text-white rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              )}
            >
              {msg.content}
              <p
                className={cn(
                  "text-[10px] mt-1",
                  msg.role === "user" ? "text-white/60" : "text-muted-foreground"
                )}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 h-10 px-4 rounded-full bg-muted text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[hsl(180,70%,45%)] transition-shadow"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping}
            className="h-10 w-10 rounded-full bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MobileAITab;
