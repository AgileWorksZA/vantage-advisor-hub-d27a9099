import { useState, useRef, useEffect } from "react";
import { X, Send, Maximize2, Minimize2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import aiChatIcon from "@/assets/ai-chat-icon.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  isOpen: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onToggleExpand: () => void;
  onSendMessage: (message: string) => void;
  messages: Message[];
  isTyping: boolean;
  currentPage?: string;
}

const getPromptsForPage = (page?: string): string[] => {
  switch (page) {
    case "dashboard":
      return [
        "Summarise my practice performance",
        "Which clients need attention?",
        "Show AUM trends",
      ];
    case "clients":
      return [
        "Find clients with incomplete FICA",
        "Clients not reviewed in 12 months",
        "High-value clients without protection",
      ];
    case "portfolio":
      return [
        "Portfolios drifting from mandate",
        "Tax-loss harvesting opportunities",
        "Compare fund performance",
      ];
    case "email":
      return [
        "Draft a follow-up email",
        "Summarise unread messages",
        "Birthday greeting template",
      ];
    case "calendar":
      return [
        "Meetings this week?",
        "Schedule overdue review follow-ups",
        "Prepare next meeting agenda",
      ];
    case "tasks":
      return [
        "Show overdue tasks",
        "Tasks due this week",
        "Prioritise my task list",
      ];
    case "insights":
      return [
        "Top growth opportunities",
        "Show revenue trends",
        "Cross-sell potential",
      ];
    case "practice":
      return [
        "Show team utilisation",
        "Advisors with most clients",
        "Practice compliance status",
      ];
    case "command-center":
      return [
        "Today's priority nudges",
        "Compliance alerts",
        "Portfolio drift alerts",
      ];
    case "ai-assistant":
      return [
        "Show upsell opportunities",
        "Clients at risk of churning",
        "Top growth opportunities",
      ];
    default:
      return [
        "How can I grow my practice?",
        "Show me client insights",
        "What tasks need attention?",
      ];
  }
};

const ChatPanel = ({
  isOpen,
  isExpanded,
  onClose,
  onToggleExpand,
  onSendMessage,
  messages,
  isTyping,
  currentPage,
}: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = getPromptsForPage(currentPage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  const handleDocsClick = () => {
    window.open("/help", "_blank");
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col bg-background border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
        isExpanded
          ? "inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[700px] sm:h-[80vh] sm:max-w-[90vw]"
          : "bottom-24 right-6 w-[380px] max-h-[550px] sm:w-[400px]"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-foreground p-1.5 flex-shrink-0 flex items-center justify-center">
            <img src={aiChatIcon} alt="AI" className="w-full h-full object-contain dark:invert" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              Vantage AI Assistant
            </h3>
            <p className="text-xs text-muted-foreground">Powered by Vantage AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDocsClick}
            className="h-8 px-2.5 text-muted-foreground hover:text-foreground gap-1.5 text-xs"
            title="Help docs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Docs
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={isExpanded ? "Compact view" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-foreground p-1.5 flex-shrink-0 mt-0.5 flex items-center justify-center">
                  <img src={aiChatIcon} alt="" className="w-full h-full object-contain dark:invert" />
                </div>
                <div>
                  <div className="bg-muted text-foreground rounded-2xl rounded-tl-md px-4 py-2.5 text-sm">
                    Hi! I'm your Vantage AI Assistant. How can I help you today?
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                    {format(new Date(), "h:mm a")}
                  </p>
                </div>
              </div>

              <div className="pl-10">
                <p className="text-xs text-muted-foreground mb-2">
                  Suggested questions
                </p>
                <div className={cn(
                  "flex gap-2",
                  isExpanded ? "flex-row flex-wrap" : "flex-col"
                )}>
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handlePromptClick(prompt)}
                      className="text-left text-xs px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === "assistant" ? (
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-foreground p-1.5 flex-shrink-0 mt-0.5 flex items-center justify-center">
                        <img src={aiChatIcon} alt="" className="w-full h-full object-contain dark:invert" />
                      </div>
                      <div className="max-w-[80%]">
                        <div className="bg-muted text-foreground rounded-2xl rounded-tl-md px-4 py-2.5 text-sm">
                          {message.content}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                          {format(message.timestamp, "h:mm a")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="max-w-[80%]">
                        <div className="bg-foreground text-background rounded-2xl rounded-tr-md px-4 py-2.5 text-sm">
                          {message.content}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 mr-1 text-right">
                          {format(message.timestamp, "h:mm a")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-foreground p-1.5 flex-shrink-0 mt-0.5 flex items-center justify-center">
                    <img src={aiChatIcon} alt="" className="w-full h-full object-contain dark:invert" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested prompts after messages */}
              <div className="pt-2">
                <div className={cn(
                  "flex gap-2",
                  isExpanded ? "flex-row flex-wrap" : "flex-col"
                )}>
                  {suggestedPrompts.slice(0, 2).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handlePromptClick(prompt)}
                      className="text-left text-xs px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-border bg-background"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about Vantage..."
            className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
