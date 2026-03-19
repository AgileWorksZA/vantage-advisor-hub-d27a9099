import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { useToast } from "@/hooks/use-toast";

export type CommunicationChannel = "Email" | "SMS" | "WhatsApp" | "Push";
export type CampaignStatus = "Draft" | "Scheduled" | "Sending" | "Sent" | "Failed";
export type ImportanceLevel = "Low" | "Normal" | "High" | "Urgent";

export interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

export interface RecipientFilter {
  conditions: FilterCondition[];
}

export interface CommunicationCampaign {
  id: string;
  user_id: string;
  channel: CommunicationChannel;
  campaign_type: "Single" | "Bulk";
  description: string | null;
  from_team_member_id: string | null;
  from_primary_adviser: boolean;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  scheduled_at: string | null;
  importance: ImportanceLevel;
  request_read_receipt: boolean;
  is_newsletter: boolean;
  allow_duplicates: boolean;
  auto_note_completion: boolean;
  recipient_filter: RecipientFilter;
  recipient_client_ids: string[];
  attachment_types: string[];
  status: CampaignStatus;
  sent_at: string | null;
  sent_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
}

export type CampaignInput = Omit<CommunicationCampaign, "id" | "user_id" | "created_at" | "updated_at" | "is_deleted" | "deleted_at">;

// Helper to transform database row to typed campaign
const transformDbToCampaign = (row: any): CommunicationCampaign => ({
  ...row,
  channel: row.channel as CommunicationChannel,
  campaign_type: row.campaign_type as "Single" | "Bulk",
  importance: row.importance as ImportanceLevel,
  status: row.status as CampaignStatus,
  recipient_filter: (row.recipient_filter as RecipientFilter) || { conditions: [] },
});

export const useCommunicationCampaigns = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId } = useKapableAuth();

  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ["communication-campaigns"],
    queryFn: async () => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from("communication_campaigns")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(transformDbToCampaign);
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (campaign: CampaignInput) => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from("communication_campaigns")
        .insert({
          ...campaign,
          user_id: userId,
          recipient_filter: campaign.recipient_filter as unknown as Record<string, unknown>,
        })
        .select()
        .single();

      if (error) throw error;
      return transformDbToCampaign(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-campaigns"] });
      toast({ title: "Campaign created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating campaign", description: error.message, variant: "destructive" });
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CampaignInput> & { id: string }) => {
      const dbUpdates: any = { ...updates };
      if (updates.recipient_filter) {
        dbUpdates.recipient_filter = updates.recipient_filter as unknown as Record<string, unknown>;
      }
      
      const { data, error } = await kapable
        .from("communication_campaigns")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return transformDbToCampaign(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-campaigns"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating campaign", description: error.message, variant: "destructive" });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await kapable
        .from("communication_campaigns")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-campaigns"] });
      toast({ title: "Campaign deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting campaign", description: error.message, variant: "destructive" });
    },
  });

  return {
    campaigns,
    isLoading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
};
