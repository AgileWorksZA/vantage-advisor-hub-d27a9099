import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DirectMessageChannel = "whatsapp" | "sms" | "push";
export type MessageDirection = "inbound" | "outbound";
export type MessageStatus = "sent" | "delivered" | "read" | "failed" | "pending";

export interface DirectMessage {
  id: string;
  user_id: string;
  client_id: string | null;
  channel: DirectMessageChannel;
  direction: MessageDirection;
  content: string;
  media_url: string | null;
  status: MessageStatus;
  external_id: string | null;
  sent_at: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationSummary {
  client_id: string;
  client_name: string;
  client_initials: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  channel: DirectMessageChannel;
}

export interface SendMessageInput {
  client_id: string;
  channel: DirectMessageChannel;
  content: string;
  media_url?: string;
}

export const useDirectMessages = (channel: DirectMessageChannel) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get unique clients with their latest message for this channel
      const { data: messagesData, error: messagesError } = await supabase
        .from("direct_messages")
        .select(`
          id,
          client_id,
          content,
          sent_at,
          direction,
          status
        `)
        .eq("user_id", user.id)
        .eq("channel", channel)
        .eq("is_deleted", false)
        .order("sent_at", { ascending: false });

      if (messagesError) throw messagesError;

      // Get unique client IDs
      const clientIds = [...new Set((messagesData || []).map(m => m.client_id).filter(Boolean))] as string[];
      
      if (clientIds.length === 0) {
        setConversations([]);
        return;
      }

      // Fetch client names
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, first_name, surname")
        .in("id", clientIds);

      if (clientsError) throw clientsError;

      const clientMap = new Map(
        (clientsData || []).map(c => [c.id, { name: `${c.first_name} ${c.surname}`, initials: `${c.first_name[0]}${c.surname[0]}` }])
      );

      // Group messages by client and get summaries
      const conversationMap = new Map<string, ConversationSummary>();
      
      for (const msg of messagesData || []) {
        if (!msg.client_id) continue;
        
        const existing = conversationMap.get(msg.client_id);
        const client = clientMap.get(msg.client_id);
        
        if (!existing) {
          conversationMap.set(msg.client_id, {
            client_id: msg.client_id,
            client_name: client?.name || "Unknown",
            client_initials: client?.initials || "??",
            last_message: msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : ""),
            last_message_time: msg.sent_at,
            unread_count: msg.direction === "inbound" && msg.status !== "read" ? 1 : 0,
            channel,
          });
        } else if (msg.direction === "inbound" && msg.status !== "read") {
          existing.unread_count++;
        }
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (err: any) {
      console.error("Error fetching conversations:", err);
      setError(err.message);
    }
  }, [channel]);

  const fetchMessages = useCallback(async (clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from("direct_messages")
        .select("*")
        .eq("user_id", user.id)
        .eq("client_id", clientId)
        .eq("channel", channel)
        .eq("is_deleted", false)
        .order("sent_at", { ascending: true });

      if (fetchError) throw fetchError;

      setMessages((data || []) as DirectMessage[]);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [channel]);

  const sendMessage = async (input: SendMessageInput): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: insertError } = await supabase
        .from("direct_messages")
        .insert([{
          user_id: user.id,
          client_id: input.client_id,
          channel: input.channel,
          direction: "outbound" as MessageDirection,
          content: input.content,
          media_url: input.media_url || null,
          status: "sent" as MessageStatus,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to local state
      setMessages(prev => [...prev, data as DirectMessage]);
      
      // Update conversation list
      await fetchConversations();
      
      return true;
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(err.message || "Failed to send message");
      return false;
    }
  };

  const markAsRead = async (messageIds: string[]): Promise<void> => {
    try {
      await supabase
        .from("direct_messages")
        .update({ status: "read" as MessageStatus })
        .in("id", messageIds)
        .eq("direction", "inbound");
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    messages,
    conversations,
    loading,
    error,
    fetchMessages,
    sendMessage,
    markAsRead,
    refetch: fetchConversations,
  };
};
