import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { useToast } from "@/hooks/use-toast";

export interface OpportunityProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  project_type: string;
  status: string;
  target_revenue: number;
  realized_revenue: number;
  target_date: string | null;
  sla_days: number;
  region_code: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  project_type: string;
  target_revenue?: number;
  target_date?: string;
  sla_days?: number;
  region_code: string;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  project_type?: string;
  status?: string;
  target_revenue?: number;
  realized_revenue?: number;
  target_date?: string;
  sla_days?: number;
}

export const useOpportunityProjects = (regionCode: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId } = useKapableAuth();

  const projectsQuery = useQuery({
    queryKey: ["opportunity-projects", regionCode],
    queryFn: async () => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from("opportunity_projects")
        .select("*")
        .eq("region_code", regionCode)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OpportunityProject[];
    },
    enabled: !!regionCode,
  });

  const createProject = useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from("opportunity_projects")
        .insert({
          user_id: userId,
          name: input.name,
          description: input.description || null,
          project_type: input.project_type,
          target_revenue: input.target_revenue || 0,
          target_date: input.target_date || null,
          sla_days: input.sla_days || 30,
          region_code: input.region_code,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunity-projects"] });
      toast({ title: "Project created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create project", description: error.message, variant: "destructive" });
    },
  });

  const updateProject = useMutation({
    mutationFn: async (input: UpdateProjectInput) => {
      const { id, ...updates } = input;
      const { data, error } = await kapable
        .from("opportunity_projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunity-projects"] });
      toast({ title: "Project updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update project", description: error.message, variant: "destructive" });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await kapable
        .from("opportunity_projects")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunity-projects"] });
      toast({ title: "Project deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete project", description: error.message, variant: "destructive" });
    },
  });

  // Calculate aggregate metrics
  const metrics = {
    totalOpportunityValue: projectsQuery.data?.reduce((acc, p) => acc + Number(p.target_revenue), 0) || 0,
    realizedRevenue: projectsQuery.data?.reduce((acc, p) => acc + Number(p.realized_revenue), 0) || 0,
    activeProjects: projectsQuery.data?.filter(p => p.status === "Active").length || 0,
    completedProjects: projectsQuery.data?.filter(p => p.status === "Completed").length || 0,
  };

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    metrics,
    createProject,
    updateProject,
    deleteProject,
    refetch: projectsQuery.refetch,
  };
};
