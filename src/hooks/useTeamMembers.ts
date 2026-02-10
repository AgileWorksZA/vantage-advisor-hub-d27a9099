import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string | null;
  is_primary_adviser: boolean;
  is_active: boolean;
  team_name: string | null;
  jurisdiction: string | null;
  created_at: string;
  updated_at: string;
}

export const useTeamMembers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading, error } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const addTeamMember = useMutation({
    mutationFn: async (member: Omit<TeamMember, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("team_members")
        .insert({
          ...member,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Team member added" });
    },
    onError: (error: Error) => {
      toast({ title: "Error adding team member", description: error.message, variant: "destructive" });
    },
  });

  const getPrimaryAdviser = () => {
    return teamMembers.find((m) => m.is_primary_adviser);
  };

  return {
    teamMembers,
    isLoading,
    error,
    addTeamMember,
    getPrimaryAdviser,
  };
};
