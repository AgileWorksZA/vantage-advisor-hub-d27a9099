import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { useToast } from "@/hooks/use-toast";

export interface UserSettings {
  id: string;
  user_id: string;
  email_signature: string | null;
  default_from_primary_adviser: boolean;
  timezone: string | null;
  display_name: string | null;
  notification_email: boolean;
  notification_task_reminders: boolean;
  notification_calendar_reminders: boolean;
  notification_client_updates: boolean;
  notification_compliance_alerts: boolean;
  date_format: string | null;
  time_format: string | null;
  default_calendar_view: string | null;
  notification_sound_enabled: boolean;
  notification_push_enabled: boolean;
  notification_critical_only_sound: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId } = useKapableAuth();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["user-settings", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from<UserSettings>("user_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as UserSettings | null;
    },
    enabled: !!userId,
  });

  const upsertSettings = useMutation({
    mutationFn: async (updates: Partial<Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at">>) => {
      if (!userId) throw new Error("Not authenticated");

      // No native upsert — check if settings exist, then POST or PATCH
      const { data: existing } = await kapable
        .from<UserSettings>("user_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        // Update existing settings
        const { data, error } = await kapable
          .from<UserSettings>("user_settings")
          .update(updates)
          .eq("id", existing.id);

        if (error) throw error;
        return data;
      } else {
        // Create new settings
        const { data, error } = await kapable
          .from<UserSettings>("user_settings")
          .insert({ user_id: userId, ...updates });

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast({ title: "Settings saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Error saving settings", description: error.message, variant: "destructive" });
    },
  });

  return {
    settings,
    isLoading,
    error,
    upsertSettings,
  };
};
