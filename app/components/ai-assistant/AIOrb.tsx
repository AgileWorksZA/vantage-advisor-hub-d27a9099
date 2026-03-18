import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIOrbProps {
  isProcessing: boolean;
  isChatOpen: boolean;
  onClick: () => void;
}

const AIOrb = ({ isProcessing, isChatOpen, onClick }: AIOrbProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center",
        "shadow-lg hover:scale-105 active:scale-95 transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isChatOpen && "scale-0 opacity-0 pointer-events-none"
      )}
      aria-label={isChatOpen ? "Close chat" : "Open chat"}
    >
      <MessageCircle className="w-6 h-6" />
      {isProcessing && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full animate-pulse" />
      )}
    </button>
  );
};

export default AIOrb;
