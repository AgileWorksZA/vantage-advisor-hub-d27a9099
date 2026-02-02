import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Communication {
  id: string;
  user_id: string;
  client_id: string;
  channel: "Email" | "SMS" | "Phone" | "WhatsApp" | "Push" | "Webinar" | "Office Event";
  direction: string;
  from_identifier: string | null;
  to_identifier: string | null;
  subject: string | null;
  content: string | null;
  sent_at: string | null;
  status: string | null;
  created_at: string;
  is_deleted: boolean;
}

export interface CommunicationListItem {
  id: string;
  dateSent: string;
  from: string;
  subject: string;
  channel: Communication["channel"];
}

export interface ChannelCount {
  channel: Communication["channel"];
  count: number;
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const transformCommunicationToListItem = (comm: Communication): CommunicationListItem => ({
  id: comm.id,
  dateSent: formatDate(comm.sent_at || comm.created_at),
  from: comm.from_identifier || "System",
  subject: comm.subject || "(No Subject)",
  channel: comm.channel,
});

export const useClientCommunications = (clientId: string) => {
  const [communications, setCommunications] = useState<CommunicationListItem[]>([]);
  const [channelCounts, setChannelCounts] = useState<ChannelCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunications = useCallback(async (channel?: Communication["channel"]) => {
    if (!clientId) return;
    
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("communications")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("sent_at", { ascending: false });

      if (channel) {
        query = query.eq("channel", channel);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const transformedComms = (data || []).map(transformCommunicationToListItem);
      setCommunications(transformedComms);

      // Get channel counts
      const { data: countData } = await supabase
        .from("communications")
        .select("channel")
        .eq("client_id", clientId)
        .eq("is_deleted", false);

      if (countData) {
        const counts: Record<string, number> = {};
        countData.forEach((c: any) => {
          counts[c.channel] = (counts[c.channel] || 0) + 1;
        });
        
        const channelList: ChannelCount[] = [
          { channel: "Email", count: counts["Email"] || 0 },
          { channel: "SMS", count: counts["SMS"] || 0 },
          { channel: "Phone", count: counts["Phone"] || 0 },
          { channel: "WhatsApp", count: counts["WhatsApp"] || 0 },
          { channel: "Push", count: counts["Push"] || 0 },
          { channel: "Webinar", count: counts["Webinar"] || 0 },
          { channel: "Office Event", count: counts["Office Event"] || 0 },
        ];
        setChannelCounts(channelList);
      }
    } catch (err: any) {
      console.error("Error fetching communications:", err);
      setError(err.message);
      toast.error("Failed to load communications");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const logCommunication = async (commData: Partial<Communication>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("communications")
        .insert({
          user_id: user.id,
          client_id: clientId,
          channel: commData.channel || "Email",
          direction: commData.direction || "Outbound",
          from_identifier: commData.from_identifier,
          to_identifier: commData.to_identifier,
          subject: commData.subject,
          content: commData.content,
          sent_at: commData.sent_at || new Date().toISOString(),
          status: commData.status || "Sent",
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCommunications();
      toast.success("Communication logged successfully");
      return data;
    } catch (err: any) {
      console.error("Error logging communication:", err);
      toast.error(err.message || "Failed to log communication");
      return null;
    }
  };

  const deleteCommunication = async (commId: string) => {
    try {
      const { error } = await supabase
        .from("communications")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", commId);

      if (error) throw error;

      setCommunications((prev) => prev.filter((c) => c.id !== commId));
      toast.success("Communication deleted");
      return true;
    } catch (err: any) {
      console.error("Error deleting communication:", err);
      toast.error(err.message || "Failed to delete communication");
      return false;
    }
  };

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  return {
    communications,
    channelCounts,
    loading,
    error,
    refetch: fetchCommunications,
    logCommunication,
    deleteCommunication,
  };
};
