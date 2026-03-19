import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, parseISO } from "date-fns";

export interface ProjectTask {
  id: string;
  user_id: string;
  project_id: string;
  opportunity_id: string | null;
  client_id: string | null;
  title: string;
  description: string | null;
  task_type: string;
  priority: string;
  status: string;
  due_date: string | null;
  sla_deadline: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateTaskInput {
  project_id: string;
  opportunity_id?: string;
  client_id?: string;
  title: string;
  description?: string;
  task_type?: string;
  priority?: string;
  due_date?: string;
  sla_deadline?: string;
  assigned_to?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  task_type?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  sla_deadline?: string;
  assigned_to?: string;
}

export type SLAStatus = "on-track" | "warning" | "critical" | "overdue";

export const useProjectTasks = (projectId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId } = useKapableAuth();

  const tasksQuery = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: async () => {
      if (!userId) throw new Error("Not authenticated");

      let query = kapable
        .from("project_tasks")
        .select("*")
        .eq("is_deleted", false)
        .order("due_date", { ascending: true });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProjectTask[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from("project_tasks")
        .insert({
          user_id: userId,
          project_id: input.project_id,
          opportunity_id: input.opportunity_id || null,
          client_id: input.client_id || null,
          title: input.title,
          description: input.description || null,
          task_type: input.task_type || "Action",
          priority: input.priority || "Medium",
          due_date: input.due_date || null,
          sla_deadline: input.sla_deadline || null,
          assigned_to: input.assigned_to || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
      toast({ title: "Task created" });
    },
    onError: (error) => {
      toast({ title: "Failed to create task", description: error.message, variant: "destructive" });
    },
  });

  const updateTask = useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const { id, ...updates } = input;
      
      // If status is being set to Completed, add completed_at timestamp
      const finalUpdates = {
        ...updates,
        ...(updates.status === "Completed" ? { completed_at: new Date().toISOString() } : {}),
      };

      const { data, error } = await kapable
        .from("project_tasks")
        .update(finalUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
      toast({ title: "Task updated" });
    },
    onError: (error) => {
      toast({ title: "Failed to update task", description: error.message, variant: "destructive" });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await kapable
        .from("project_tasks")
        .update({ is_deleted: true })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] });
      toast({ title: "Task deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete task", description: error.message, variant: "destructive" });
    },
  });

  // Calculate SLA status for a task
  const getSLAStatus = (task: ProjectTask): SLAStatus => {
    if (!task.sla_deadline || task.status === "Completed" || task.status === "Cancelled") {
      return "on-track";
    }

    const today = new Date();
    const deadline = parseISO(task.sla_deadline);
    const daysRemaining = differenceInDays(deadline, today);

    if (daysRemaining < 0) return "overdue";
    if (daysRemaining <= 3) return "critical";
    if (daysRemaining <= 7) return "warning";
    return "on-track";
  };

  // Calculate SLA health metrics
  const slaMetrics = {
    onTrack: tasksQuery.data?.filter(t => getSLAStatus(t) === "on-track").length || 0,
    warning: tasksQuery.data?.filter(t => getSLAStatus(t) === "warning").length || 0,
    critical: tasksQuery.data?.filter(t => getSLAStatus(t) === "critical").length || 0,
    overdue: tasksQuery.data?.filter(t => getSLAStatus(t) === "overdue").length || 0,
  };

  // Group tasks by status
  const tasksByStatus = {
    notStarted: tasksQuery.data?.filter(t => t.status === "Not Started") || [],
    inProgress: tasksQuery.data?.filter(t => t.status === "In Progress") || [],
    completed: tasksQuery.data?.filter(t => t.status === "Completed") || [],
    cancelled: tasksQuery.data?.filter(t => t.status === "Cancelled") || [],
  };

  return {
    tasks: tasksQuery.data || [],
    tasksByStatus,
    slaMetrics,
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask,
    updateTask,
    deleteTask,
    getSLAStatus,
    refetch: tasksQuery.refetch,
  };
};
