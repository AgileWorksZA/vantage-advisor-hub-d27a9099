import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserSettings {
  id: string;
  user_id: string;
  email_signature: string | null;
  default_from_primary_adviser: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserSettings | null;
    },
  });

  const upsertSettings = useMutation({
    mutationFn: async (updates: Partial<Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at">>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          ...updates,
        }, {
          onConflict: "user_id",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
