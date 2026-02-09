import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, Clock, Users, Phone as PhoneIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { ConversationSummary, DirectMessageChannel } from "@/hooks/useDirectMessages";
import { useWhatsAppFavourites } from "@/hooks/useWhatsAppFavourites";
import { useClients } from "@/hooks/useClients";

type TabType = "recent" | "favourites" | "contacts";

interface ConversationListProps {
  channel: DirectMessageChannel;
  conversations: ConversationSummary[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
  loading?: boolean;
  jurisdiction?: string;
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "dd/MM/yyyy");
};

export const ConversationList = ({
  channel,
  conversations,
  selectedClientId,
  onSelectClient,
  loading = false,
  jurisdiction,
}: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("recent");
  const { favouriteClientIds, toggleFavourite } = useWhatsAppFavourites();
  const { clients } = useClients();

  const channelLabel = channel === "whatsapp" ? "WhatsApp" : channel === "sms" ? "SMS" : "Push";

  const filteredConversations = conversations.filter(c =>
    c.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Favourites: conversations whose client_id is in favourites
  const favouriteConversations = filteredConversations.filter(c =>
    favouriteClientIds.includes(c.client_id)
  );

  // Contacts: all clients for this jurisdiction
  const contactClients = clients
    .filter(c => {
      if (jurisdiction && c.countryOfIssue !== jurisdiction) return false;
      if (searchQuery && !c.client.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => a.client.localeCompare(b.client));

  const renderConversationItem = (conversation: ConversationSummary) => (
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
          <span className={cn("font-medium text-sm truncate", conversation.unread_count > 0 && "text-foreground")}>
            {conversation.client_name}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatTime(conversation.last_message_time)}
          </span>
        </div>
        {conversation.client_phone && (
          <p className="text-[10px] text-muted-foreground truncate">{conversation.client_phone}</p>
        )}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className={cn("text-xs truncate", conversation.unread_count > 0 ? "text-foreground" : "text-muted-foreground")}>
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
  );

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

      {/* Content */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">Loading conversations...</div>
        ) : activeTab === "recent" ? (
          filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No {channelLabel} conversations yet.</div>
          ) : (
            <div className="divide-y divide-border">{filteredConversations.map(renderConversationItem)}</div>
          )
        ) : activeTab === "favourites" ? (
          favouriteConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No favourites yet. Star a contact to add them.</div>
          ) : (
            <div className="divide-y divide-border">{favouriteConversations.map(renderConversationItem)}</div>
          )
        ) : (
          contactClients.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No contacts found.</div>
          ) : (
            <div className="divide-y divide-border">
              {contactClients.map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelectClient(c.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors",
                    selectedClientId === c.id && "bg-muted"
                  )}
                >
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {c.client.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.client}</p>
                    {c.cellNumber && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <PhoneIcon className="w-3 h-3" />
                        {c.cellNumber}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavourite(c.id); }}
                    className="shrink-0 p-1"
                  >
                    <Star className={cn("w-4 h-4", favouriteClientIds.includes(c.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                  </button>
                </button>
              ))}
            </div>
          )
        )}
      </ScrollArea>

      {/* Bottom Tabs */}
      <div className="border-t border-border flex">
        {([
          { key: "recent" as TabType, icon: Clock, label: "Recent" },
          { key: "favourites" as TabType, icon: Star, label: "Favourites" },
          { key: "contacts" as TabType, icon: Users, label: "Contacts" },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors",
              activeTab === tab.key
                ? "text-[hsl(180,70%,45%)] font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
