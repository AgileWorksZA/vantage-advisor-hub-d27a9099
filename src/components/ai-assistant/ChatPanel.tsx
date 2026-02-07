import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
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
        "Which clients need attention this week?",
        "Show AUM trends",
        "Any upcoming birthdays?",
      ];
    case "clients":
      return [
        "Find clients with incomplete FICA",
        "Which clients haven't been reviewed in 12 months?",
        "Show high-value clients without protection",
        "Identify clients at risk of leaving",
      ];
    case "portfolio":
      return [
        "Show portfolios drifting from mandate",
        "Which clients are over-exposed to equities?",
        "Identify tax-loss harvesting opportunities",
        "Compare fund performance",
      ];
    case "email":
      return [
        "Draft a follow-up email for my last meeting",
        "Summarise unread messages",
        "Find emails about policy renewals",
        "Create a birthday greeting template",
      ];
    case "calendar":
      return [
        "What meetings do I have this week?",
        "Schedule follow-ups for overdue reviews",
        "Find gaps in my calendar for client calls",
        "Prepare agenda for my next meeting",
      ];
    case "tasks":
      return [
        "Show overdue tasks",
        "Which tasks are due this week?",
        "Prioritise my task list",
        "Find tasks without assigned clients",
      ];
    case "insights":
      return [
        "What are the top growth opportunities?",
        "Show revenue trends",
        "Identify cross-sell potential",
        "Compare advisor performance",
      ];
    case "practice":
      return [
        "Show team utilisation",
        "Which advisors have the most clients?",
        "Identify training needs",
        "Review practice compliance status",
      ];
    case "command-center":
      return [
        "What are today's priority nudges?",
        "Show compliance alerts",
        "Which clients need immediate attention?",
        "Summarise portfolio drift alerts",
      ];
    case "ai-assistant":
      return [
        "Show me upsell opportunities",
        "Which clients should migrate to house portfolios?",
        "Identify cross-sell potential this month",
        "Find clients at risk of churning",
        "Top growth opportunities in my book",
      ];
    default:
      return [
        "How can I grow my practice?",
        "Show me client insights",
        "What tasks need attention?",
        "Help me find opportunities",
      ];
  }
};

const ChatPanel = ({ isOpen, onClose, onSendMessage, messages, isTyping, currentPage }: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = getPromptsForPage(currentPage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  return (
    <>
      {/* Backdrop - closes panel when clicked */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Chat Panel - always dark themed via glassmorphism */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-[25vw] min-w-[320px] max-w-[400px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">AI Assistant</h3>
            <p className="text-white/50 text-xs">Powered by Vantage AI</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-180px)]">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-white/60 text-center text-sm">
              Ask me about opportunities in your client base
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors border border-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2",
                  message.role === "user"
                    ? "ml-auto bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
                    : "bg-white/10 text-white/90"
                )}
              >
                {message.content}
              </div>
            ))}
            {isTyping && (
              <div className="bg-white/10 text-white/90 max-w-[85%] rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about opportunities..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:opacity-90 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
    </>
  );
};

export default ChatPanel;
