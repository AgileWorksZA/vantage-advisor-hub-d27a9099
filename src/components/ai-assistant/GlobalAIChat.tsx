import { useState, useEffect, useCallback } from "react";
import AIOrb from "./AIOrb";
import ChatPanel from "./ChatPanel";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface GlobalAIChatProps {
  currentPage: string;
}

const STORAGE_KEY = "vantage-ai-chat-enabled";

const generateResponse = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes("upsell") || lower.includes("growth")) {
    return "I've identified 12 upsell opportunities across your client base. The top 3 involve clients with significant investable assets who currently only have basic investment products. Would you like me to show the details?";
  }
  if (lower.includes("risk") || lower.includes("churn") || lower.includes("leaving")) {
    return "Based on engagement patterns and portfolio activity, I've flagged 5 clients who may be at risk. Key indicators include reduced communication frequency and recent competitor inquiries. Shall I list them?";
  }
  if (lower.includes("cross-sell") || lower.includes("protection") || lower.includes("insurance")) {
    return "I found 8 clients with investment portfolios but no life or disability cover. This represents a significant cross-sell opportunity. Want me to prioritise them by portfolio value?";
  }
  if (lower.includes("compliance") || lower.includes("fica")) {
    return "There are 6 clients with outstanding compliance items — 3 need updated FICA documents and 3 have overdue annual reviews. I can create tasks for each if you'd like.";
  }
  if (lower.includes("birthday") || lower.includes("engagement")) {
    return "You have 4 client birthdays coming up this week. I can draft personalised greeting messages for each. Would you like me to prepare those?";
  }
  if (lower.includes("task") || lower.includes("overdue") || lower.includes("due")) {
    return "You currently have 14 open tasks, 5 of which are overdue. The most critical ones involve annual reviews and document follow-ups. Want me to help prioritise?";
  }
  if (lower.includes("portfolio") || lower.includes("drift") || lower.includes("mandate")) {
    return "I've detected 3 portfolios drifting from their mandates — primarily due to equity overweight after recent market gains. Shall I show the rebalancing recommendations?";
  }
  if (lower.includes("meeting") || lower.includes("calendar") || lower.includes("agenda")) {
    return "You have 6 meetings scheduled this week. I can prepare briefing notes for each, including recent portfolio performance and outstanding action items. Shall I proceed?";
  }
  if (lower.includes("email") || lower.includes("message") || lower.includes("draft")) {
    return "I can help you draft that. Would you like a formal or conversational tone? I'll also pull in relevant client details to personalise the message.";
  }
  if (lower.includes("team") || lower.includes("advisor") || lower.includes("utilisation")) {
    return "Your team of 6 advisors has an average utilisation of 72%. Two advisors have capacity for additional clients. Want me to show the full breakdown?";
  }
  return "I'll analyse your client data to help with that. Based on your practice metrics, I can provide targeted insights and actionable recommendations. Could you tell me more about what you're looking for?";
};

const GlobalAIChat = ({ currentPage }: GlobalAIChatProps) => {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== "false";
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      setEnabled(customEvent.detail.enabled);
      if (!customEvent.detail.enabled) {
        setIsChatOpen(false);
        setIsExpanded(false);
      }
    };
    window.addEventListener("ai-chat-toggle", handler);
    return () => window.removeEventListener("ai-chat-toggle", handler);
  }, []);

  const handleOrbClick = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
    setIsExpanded(false);
  }, []);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(content);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1200);
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Backdrop blur overlay */}
      {isChatOpen && (
        <div
          className={cn(
            "fixed inset-0 z-40 transition-all duration-300",
            "bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          )}
          onClick={handleCloseChat}
        />
      )}

      {/* Chat trigger button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AIOrb
          isProcessing={isTyping}
          isChatOpen={isChatOpen}
          onClick={handleOrbClick}
        />
      </div>

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        isExpanded={isExpanded}
        onClose={handleCloseChat}
        onToggleExpand={handleToggleExpand}
        onSendMessage={handleSendMessage}
        messages={messages}
        isTyping={isTyping}
        currentPage={currentPage}
      />
    </>
  );
};

export default GlobalAIChat;
