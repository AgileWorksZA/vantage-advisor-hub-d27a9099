import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { toast } from "sonner";

export type DirectMessageChannel = "whatsapp" | "sms" | "push";
export type MessageDirection = "inbound" | "outbound";
export type MessageStatus = "sent" | "delivered" | "read" | "failed" | "pending";
export type MessageType = "text" | "image" | "poll" | "document";

export interface PollData {
  question: string;
  options: { text: string; votes: number }[];
  total_votes: number;
  is_closed: boolean;
}

export interface DirectMessage {
  id: string;
  user_id: string;
  client_id: string | null;
  channel: DirectMessageChannel;
  direction: MessageDirection;
  content: string;
  media_url: string | null;
  message_type: MessageType;
  poll_data: PollData | null;
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
  client_phone: string | null;
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
  message_type?: MessageType;
  poll_data?: PollData;
}

const regionToCountry: Record<string, string> = {
  ZA: "South Africa",
  AU: "Australia",
  CA: "Canada",
  GB: "United Kingdom",
  US: "United States",
};

export const useDirectMessages = (channel: DirectMessageChannel, jurisdiction?: string) => {
  const { userId } = useKapableAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      if (!userId) { setLoading(false); return; }

      const { data: messagesData, error: messagesError } = await kapable
        .from("direct_messages")
        .select("*")
        .eq("user_id", userId)
        .eq("channel", channel)
        .eq("is_deleted", false)
        .order("sent_at", { ascending: false });

      if (messagesError) throw messagesError;

      const clientIds = [...new Set((messagesData || []).map(m => m.client_id).filter(Boolean))] as string[];

      if (clientIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      let clientQuery = kapable
        .from("clients")
        .select("*")
        .in("id", clientIds);

      if (jurisdiction) {
        const countryName = regionToCountry[jurisdiction] || jurisdiction;
        clientQuery = clientQuery.eq("country_of_issue", countryName);
      }

      const { data: clientsData, error: clientsError } = await clientQuery;
      if (clientsError) throw clientsError;

      const clientMap = new Map(
        (clientsData || []).map(c => [c.id, {
          name: `${c.first_name} ${c.surname}`,
          initials: `${c.first_name[0]}${c.surname[0]}`,
          phone: c.cell_number,
        }])
      );

      // Only include conversations for clients matching jurisdiction
      const allowedClientIds = new Set(clientMap.keys());

      const conversationMap = new Map<string, ConversationSummary>();

      for (const msg of messagesData || []) {
        if (!msg.client_id || !allowedClientIds.has(msg.client_id)) continue;

        const existing = conversationMap.get(msg.client_id);
        const client = clientMap.get(msg.client_id);

        const preview = msg.message_type === "poll" ? "📊 Poll" :
          msg.message_type === "image" ? "📷 Photo" :
          msg.message_type === "document" ? "📎 Document" :
          msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : "");

        if (!existing) {
          conversationMap.set(msg.client_id, {
            client_id: msg.client_id,
            client_name: client?.name || "Unknown",
            client_initials: client?.initials || "??",
            client_phone: client?.phone || null,
            last_message: preview,
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
    } finally {
      setLoading(false);
    }
  }, [channel, jurisdiction]);

  const fetchMessages = useCallback(async (clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) return;

      const { data, error: fetchError } = await kapable
        .from("direct_messages")
        .select("*")
        .eq("user_id", userId)
        .eq("client_id", clientId)
        .eq("channel", channel)
        .eq("is_deleted", false)
        .order("sent_at", { ascending: true });

      if (fetchError) throw fetchError;

      setMessages((data || []).map(d => ({
        ...d,
        message_type: (d as any).message_type || "text",
        poll_data: (d as any).poll_data || null,
      })) as DirectMessage[]);
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [channel]);

  const sendMessage = async (input: SendMessageInput): Promise<boolean> => {
    try {
      if (!userId) throw new Error("Not authenticated");

      const insertPayload: any = {
        user_id: userId,
        client_id: input.client_id,
        channel: input.channel,
        direction: "outbound",
        content: input.content,
        media_url: input.media_url || null,
        status: "sent",
        message_type: input.message_type || "text",
      };
      if (input.poll_data) insertPayload.poll_data = input.poll_data;

      const { data, error: insertError } = await kapable
        .from("direct_messages")
        .insert([insertPayload])
        .select()
        .single();

      if (insertError) throw insertError;

      setMessages(prev => [...prev, {
        ...data,
        message_type: (data as any).message_type || "text",
        poll_data: (data as any).poll_data || null,
      } as DirectMessage]);
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
      await kapable
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
