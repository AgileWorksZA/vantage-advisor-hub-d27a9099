import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Phone, Search, Smile, Paperclip, Send, Check, CheckCheck, MessageSquare, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { DirectMessage, DirectMessageChannel, useDirectMessages } from "@/hooks/useDirectMessages";
import { useClients } from "@/hooks/useClients";
import { WhatsAppPollBubble } from "./WhatsAppPollBubble";
import { CreatePollDialog } from "./CreatePollDialog";

interface ChatPanelProps {
  channel: DirectMessageChannel;
  clientId: string | null;
}

const formatMessageTime = (dateStr: string) => format(new Date(dateStr), "HH:mm");

const formatDateDivider = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, dd MMMM yyyy");
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "read") return <CheckCheck className="w-3.5 h-3.5 text-[hsl(180,70%,45%)]" />;
  if (status === "delivered") return <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />;
  if (status === "sent") return <Check className="w-3.5 h-3.5 text-muted-foreground" />;
  return null;
};

export const ChatPanel = ({ channel, clientId }: ChatPanelProps) => {
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  const [pollDialogOpen, setPollDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, loading, fetchMessages, sendMessage, markAsRead } = useDirectMessages(channel);
  const { clients } = useClients();

  const client = clients.find(c => c.id === clientId);
  const clientName = client?.client || "Unknown";
  const clientInitials = client ? clientName.split(",")[0].substring(0, 2).toUpperCase() : "??";

  useEffect(() => { if (clientId) fetchMessages(clientId); }, [clientId, fetchMessages]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);
  useEffect(() => {
    if (clientId && messages.length > 0) {
      const unreadIds = messages.filter(m => m.direction === "inbound" && m.status !== "read").map(m => m.id);
      if (unreadIds.length > 0) markAsRead(unreadIds);
    }
  }, [clientId, messages, markAsRead]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !clientId) return;
    const success = await sendMessage({ client_id: clientId, channel, content: inputMessage.trim() });
    if (success) setInputMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCreatePoll = async (question: string, options: string[]) => {
    if (!clientId) return;
    await sendMessage({
      client_id: clientId,
      channel,
      content: question,
      message_type: "poll",
      poll_data: {
        question,
        options: options.map(o => ({ text: o, votes: 0 })),
        total_votes: 0,
        is_closed: false,
      },
    });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: DirectMessage[] }[] = [];
  let currentDate = "";
  for (const msg of messages) {
    const msgDate = format(new Date(msg.sent_at), "yyyy-MM-dd");
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msg.sent_at, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  }

  const channelLabel = channel === "whatsapp" ? "WhatsApp" : channel === "sms" ? "SMS" : "Push";

  if (!clientId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a conversation to view messages</p>
        </div>
      </div>
    );
  }

  const renderMessageContent = (msg: DirectMessage) => {
    const isOutbound = msg.direction === "outbound";

    if (msg.message_type === "poll" && msg.poll_data) {
      return <WhatsAppPollBubble pollData={msg.poll_data} isOutbound={isOutbound} />;
    }

    if (msg.message_type === "image" && msg.media_url) {
      return (
        <div className="space-y-1">
          <img
            src={msg.media_url}
            alt="Shared image"
            className="rounded max-w-full max-h-48 object-cover cursor-pointer"
            onClick={() => window.open(msg.media_url!, "_blank")}
          />
          {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
        </div>
      );
    }

    if (msg.message_type === "document") {
      return (
        <div className="flex items-center gap-2">
          <FileText className={cn("w-5 h-5", isOutbound ? "text-white/80" : "text-muted-foreground")} />
          <span className="text-sm underline cursor-pointer">{msg.content || "Document"}</span>
        </div>
      );
    }

    return <p className="text-sm whitespace-pre-wrap">{msg.content}</p>;
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary">{clientInitials}</AvatarFallback>
          </Avatar>
          <div>
            <button onClick={() => navigate(`/clients/${clientId}`)} className="font-medium text-sm hover:text-[hsl(180,70%,45%)] transition-colors">
              {clientName}
            </button>
            <p className="text-xs text-muted-foreground">{channelLabel} • Click to view profile</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Search className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">No messages yet. Start the conversation!</div>
        ) : (
          <div className="space-y-4">
            {groupedMessages.map((group, groupIdx) => (
              <div key={groupIdx}>
                <div className="flex items-center justify-center my-4">
                  <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {formatDateDivider(group.date)}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.messages.map((msg) => (
                    <div key={msg.id} className={cn("flex", msg.direction === "outbound" ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[70%] rounded-lg px-3 py-2",
                        msg.direction === "outbound"
                          ? "bg-[hsl(180,70%,45%)] text-white rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      )}>
                        {renderMessageContent(msg)}
                        <div className={cn("flex items-center justify-end gap-1 mt-1", msg.direction === "outbound" ? "text-white/70" : "text-muted-foreground")}>
                          <span className="text-[10px]">{formatMessageTime(msg.sent_at)}</span>
                          {msg.direction === "outbound" && <StatusIcon status={msg.status} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Smile className="w-5 h-5 text-muted-foreground" /></Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Paperclip className="w-5 h-5 text-muted-foreground" /></Button>
          {channel === "whatsapp" && (
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setPollDialogOpen(true)}>
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </Button>
          )}
          <Input placeholder="Type a message..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={handleKeyDown} className="flex-1" />
          <Button size="icon" className="h-9 w-9 shrink-0 bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)]" onClick={handleSend} disabled={!inputMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CreatePollDialog open={pollDialogOpen} onOpenChange={setPollDialogOpen} onCreatePoll={handleCreatePoll} />
    </div>
  );
};
