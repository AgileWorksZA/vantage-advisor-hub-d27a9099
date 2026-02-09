import { cn } from "@/lib/utils";

interface PollOption {
  text: string;
  votes: number;
}

interface PollData {
  question: string;
  options: PollOption[];
  total_votes: number;
  is_closed: boolean;
}

interface WhatsAppPollBubbleProps {
  pollData: PollData;
  isOutbound: boolean;
}

export const WhatsAppPollBubble = ({ pollData, isOutbound }: WhatsAppPollBubbleProps) => {
  return (
    <div className="space-y-2">
      <p className={cn("text-sm font-semibold", isOutbound ? "text-white" : "text-foreground")}>
        📊 {pollData.question}
      </p>
      <div className="space-y-1.5">
        {pollData.options.map((option, idx) => {
          const percentage = pollData.total_votes > 0
            ? Math.round((option.votes / pollData.total_votes) * 100)
            : 0;
          return (
            <div key={idx} className="relative rounded overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded",
                  isOutbound ? "bg-white/20" : "bg-primary/15"
                )}
                style={{ width: `${percentage}%` }}
              />
              <div className="relative flex items-center justify-between px-2 py-1.5 text-xs">
                <span className={isOutbound ? "text-white" : "text-foreground"}>
                  {option.text}
                </span>
                <span className={cn("font-medium ml-2", isOutbound ? "text-white/80" : "text-muted-foreground")}>
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className={cn("text-[10px]", isOutbound ? "text-white/60" : "text-muted-foreground")}>
        {pollData.total_votes} vote{pollData.total_votes !== 1 ? "s" : ""}
        {pollData.is_closed && " • Poll closed"}
      </p>
    </div>
  );
};
