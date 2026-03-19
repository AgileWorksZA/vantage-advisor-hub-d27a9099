import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { useToast } from "@/hooks/use-toast";

export interface ProjectOpportunity {
  id: string;
  user_id: string;
  project_id: string;
  client_id: string | null;
  opportunity_type: string;
  client_name: string;
  current_value: number;
  potential_revenue: number;
  confidence: number;
  reasoning: string | null;
  suggested_action: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOpportunityInput {
  project_id: string;
  client_id?: string;
  opportunity_type: string;
  client_name: string;
  current_value?: number;
  potential_revenue?: number;
  confidence?: number;
  reasoning?: string;
  suggested_action?: string;
}

export interface UpdateOpportunityInput {
  id: string;
  status?: string;
  potential_revenue?: number;
  confidence?: number;
  reasoning?: string;
  suggested_action?: string;
}

export const useProjectOpportunities = (projectId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId } = useKapableAuth();

  const opportunitiesQuery = useQuery({
    queryKey: ["project-opportunities", projectId],
    queryFn: async () => {
      if (!userId) throw new Error("Not authenticated");

      let query = kapable
        .from("project_opportunities")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProjectOpportunity[];
    },
  });

  const createOpportunity = useMutation({
    mutationFn: async (input: CreateOpportunityInput) => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from("project_opportunities")
        .insert({
          user_id: userId,
          project_id: input.project_id,
          client_id: input.client_id || null,
          opportunity_type: input.opportunity_type,
          client_name: input.client_name,
          current_value: input.current_value || 0,
          potential_revenue: input.potential_revenue || 0,
          confidence: input.confidence || 50,
          reasoning: input.reasoning || null,
          suggested_action: input.suggested_action || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-opportunities"] });
      toast({ title: "Opportunity added to project" });
    },
    onError: (error) => {
      toast({ title: "Failed to add opportunity", description: error.message, variant: "destructive" });
    },
  });

  const updateOpportunity = useMutation({
    mutationFn: async (input: UpdateOpportunityInput) => {
      const { id, ...updates } = input;
      const { data, error } = await kapable
        .from("project_opportunities")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-opportunities"] });
      toast({ title: "Opportunity updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update opportunity", description: error.message, variant: "destructive" });
    },
  });

  const deleteOpportunity = useMutation({
    mutationFn: async (opportunityId: string) => {
      const { error } = await kapable
        .from("project_opportunities")
        .delete()
        .eq("id", opportunityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-opportunities"] });
      toast({ title: "Opportunity removed" });
    },
    onError: (error) => {
      toast({ title: "Failed to remove opportunity", description: error.message, variant: "destructive" });
    },
  });

  // Group opportunities by status
  const opportunitiesByStatus = {
    identified: opportunitiesQuery.data?.filter(o => o.status === "Identified") || [],
    inProgress: opportunitiesQuery.data?.filter(o => o.status === "In Progress") || [],
    actioned: opportunitiesQuery.data?.filter(o => o.status === "Actioned") || [],
    won: opportunitiesQuery.data?.filter(o => o.status === "Won") || [],
    lost: opportunitiesQuery.data?.filter(o => o.status === "Lost") || [],
  };

  return {
    opportunities: opportunitiesQuery.data || [],
    opportunitiesByStatus,
    isLoading: opportunitiesQuery.isLoading,
    error: opportunitiesQuery.error,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    refetch: opportunitiesQuery.refetch,
  };
};
