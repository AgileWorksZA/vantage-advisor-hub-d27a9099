import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type EmailProvider = "gmail" | "microsoft" | "imap";
export type FetchMode = "inbox" | "task_pool";

export interface EmailSettings {
  id: string;
  user_id: string;
  provider: EmailProvider;
  email_address: string;
  fetch_mode: FetchMode;
  oauth_token: string | null;
  settings: Record<string, unknown>;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailSettingsInput {
  provider: EmailProvider;
  email_address: string;
  fetch_mode: FetchMode;
  oauth_token?: string;
  settings?: Record<string, unknown>;
}

export const useEmailSettings = () => {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSettings(null);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("email_settings")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (fetchError) throw fetchError;

      setSettings(data as EmailSettings | null);
    } catch (err: any) {
      console.error("Error fetching email settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (input: EmailSettingsInput): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Deactivate existing settings first
      await supabase
        .from("email_settings")
        .update({ is_active: false })
        .eq("user_id", user.id);

      // Insert new settings
      const { data, error: insertError } = await supabase
        .from("email_settings")
        .insert([{
          user_id: user.id,
          provider: input.provider,
          email_address: input.email_address,
          fetch_mode: input.fetch_mode,
          oauth_token: input.oauth_token || null,
          settings: input.settings ? JSON.parse(JSON.stringify(input.settings)) : {},
          is_active: true,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setSettings(data as EmailSettings);
      toast.success("Email settings saved successfully");
      return true;
    } catch (err: any) {
      console.error("Error saving email settings:", err);
      toast.error(err.message || "Failed to save email settings");
      return false;
    }
  };

  const updateSettings = async (updates: Partial<EmailSettingsInput>): Promise<boolean> => {
    if (!settings) return false;

    try {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.settings) {
        updateData.settings = JSON.parse(JSON.stringify(updates.settings));
      }
      
      const { data, error: updateError } = await supabase
        .from("email_settings")
        .update(updateData)
        .eq("id", settings.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSettings(data as EmailSettings);
      toast.success("Email settings updated");
      return true;
    } catch (err: any) {
      console.error("Error updating email settings:", err);
      toast.error(err.message || "Failed to update email settings");
      return false;
    }
  };

  const updateLastSync = async (): Promise<void> => {
    if (!settings) return;

    try {
      await supabase
        .from("email_settings")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", settings.id);
    } catch (err) {
      console.error("Error updating last sync:", err);
    }
  };

  const disconnectEmail = async (): Promise<boolean> => {
    if (!settings) return false;

    try {
      const { error: updateError } = await supabase
        .from("email_settings")
        .update({ is_active: false })
        .eq("id", settings.id);

      if (updateError) throw updateError;

      setSettings(null);
      toast.success("Email disconnected");
      return true;
    } catch (err: any) {
      console.error("Error disconnecting email:", err);
      toast.error(err.message || "Failed to disconnect email");
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    isConnected: !!settings,
    refetch: fetchSettings,
    saveSettings,
    updateSettings,
    updateLastSync,
    disconnectEmail,
  };
};
