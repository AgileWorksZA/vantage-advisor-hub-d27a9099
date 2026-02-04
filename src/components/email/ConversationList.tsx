import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Archive, ChevronRight, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { ConversationSummary, DirectMessageChannel } from "@/hooks/useDirectMessages";

interface ConversationListProps {
  channel: DirectMessageChannel;
  conversations: ConversationSummary[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
  loading?: boolean;
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, "HH:mm");
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "dd/MM/yyyy");
  }
};

export const ConversationList = ({
  channel,
  conversations,
  selectedClientId,
  onSelectClient,
  loading = false,
}: ConversationListProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const filteredConversations = conversations.filter(c =>
    c.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const channelLabel = channel === "whatsapp" ? "WhatsApp" : channel === "sms" ? "SMS" : "Push";

  return (
    <div className="w-72 border-r border-border flex flex-col bg-background">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${channelLabel}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* Compose Button */}
      <div className="p-3 border-b border-border">
        <Button 
          size="sm" 
          className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
          onClick={() => navigate("/email/compose")}
        >
          <PenSquare className="w-4 h-4 mr-1" />
          Compose
        </Button>
      </div>

      {/* Archived toggle */}
      <button
        onClick={() => setShowArchived(!showArchived)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50 border-b border-border"
      >
        <Archive className="w-4 h-4" />
        <span>Archived</span>
        <ChevronRight className={cn("w-4 h-4 ml-auto transition-transform", showArchived && "rotate-90")} />
        <Badge variant="secondary" className="ml-1">0</Badge>
      </button>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No {channelLabel} conversations yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.client_id}
                onClick={() => onSelectClient(conversation.client_id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors",
                  selectedClientId === conversation.client_id && "bg-muted"
                )}
              >
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {conversation.client_initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "font-medium text-sm truncate",
                      conversation.unread_count > 0 && "text-foreground"
                    )}>
                      {conversation.client_name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTime(conversation.last_message_time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className={cn(
                      "text-xs truncate",
                      conversation.unread_count > 0 ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {conversation.last_message}
                    </span>
                    {conversation.unread_count > 0 && (
                      <Badge className="bg-[hsl(180,70%,45%)] text-white h-5 min-w-5 px-1.5 text-xs shrink-0">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
