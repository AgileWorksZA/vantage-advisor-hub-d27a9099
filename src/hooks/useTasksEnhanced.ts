import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EnhancedTask {
  id: string;
  user_id: string;
  task_number: number | null;
  title: string;
  description: string | null;
  task_type: string;
  priority: string;
  status: string;
  due_date: string | null;
  follow_up_date: string | null;
  sla_deadline: string | null;
  client_id: string | null;
  assigned_to_user_id: string | null;
  created_by: string | null;
  notes: any[];
  internal_notes: any[];
  is_practice_task: boolean;
  is_pinned: boolean;
  resolution: string | null;
  resolution_category: string | null;
  tags: string[];
  watchers: string[];
  source: string | null;
  source_reference: string | null;
  first_response_at: string | null;
  last_activity_at: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  category: string | null;
  subcategory: string | null;
  standard_execution_minutes: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  is_deleted: boolean;
  // Joined data
  client_name?: string;
  client_advisor?: string;
  assigned_to_name?: string;
  linked_clients?: Array<{ id: string; client_id: string; client_name: string; role: string }>;
}

export interface TaskFilters {
  search?: string;
  status?: string[];
  priority?: string[];
  taskType?: string[];
  category?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  assignedTo?: string;
  isPinned?: boolean;
}

export interface TaskStats {
  totalOpen: number;
  dueToday: number;
  overdue: number;
  completedThisWeek: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const useTasksEnhanced = (filters?: TaskFilters) => {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    totalOpen: 0,
    dueToday: 0,
    overdue: 0,
    completedThisWeek: 0,
    byStatus: {},
    byType: {},
    byPriority: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("tasks")
        .select(`
          *,
          clients!tasks_client_id_fkey(first_name, surname, advisor)
        `)
        .eq("is_deleted", false)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      // Apply filters - cast to any to avoid Supabase enum type restrictions
      if (filters?.status && filters.status.length > 0) {
        query = query.in("status", filters.status as any);
      }
      if (filters?.priority && filters.priority.length > 0) {
        query = query.in("priority", filters.priority as any);
      }
      if (filters?.taskType && filters.taskType.length > 0) {
        query = query.in("task_type", filters.taskType as any);
      }
      if (filters?.category && filters.category.length > 0) {
        query = query.in("category", filters.category);
      }
      if (filters?.dueDateFrom) {
        query = query.gte("due_date", filters.dueDateFrom);
      }
      if (filters?.dueDateTo) {
        query = query.lte("due_date", filters.dueDateTo);
      }
      if (filters?.assignedTo) {
        query = query.eq("assigned_to_name", filters.assignedTo);
      }
      if (filters?.isPinned !== undefined) {
        query = query.eq("is_pinned", filters.isPinned);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Fetch linked clients for all tasks
      const taskIds = (data || []).map((t: any) => t.id);
      let linkedClientsMap: Record<string, Array<{ id: string; client_id: string; client_name: string; role: string }>> = {};

      if (taskIds.length > 0) {
        const { data: taskClients } = await supabase
          .from("task_clients")
          .select(`
            id,
            task_id,
            client_id,
            role,
            clients!task_clients_client_id_fkey(first_name, surname)
          `)
          .in("task_id", taskIds);

        if (taskClients) {
          taskClients.forEach((tc: any) => {
            if (!linkedClientsMap[tc.task_id]) {
              linkedClientsMap[tc.task_id] = [];
            }
            linkedClientsMap[tc.task_id].push({
              id: tc.id,
              client_id: tc.client_id,
              client_name: tc.clients ? `${tc.clients.first_name} ${tc.clients.surname}` : "Unknown",
              role: tc.role,
            });
          });
        }
      }

      const transformedTasks: EnhancedTask[] = (data || []).map((task: any) => ({
        ...task,
        client_name: task.clients
          ? `${task.clients.first_name} ${task.clients.surname}`
          : null,
        client_advisor: task.clients?.advisor || null,
        assigned_to_name: task.assigned_to_name || "Current User",
        linked_clients: linkedClientsMap[task.id] || [],
        notes: Array.isArray(task.notes) ? task.notes : [],
        internal_notes: Array.isArray(task.internal_notes) ? task.internal_notes : [],
        tags: Array.isArray(task.tags) ? task.tags : [],
        watchers: Array.isArray(task.watchers) ? task.watchers : [],
      }));

      setTasks(transformedTasks);

      // Calculate stats
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const statsData: TaskStats = {
        totalOpen: transformedTasks.filter((t) => !["Completed", "Cancelled"].includes(t.status)).length,
        dueToday: transformedTasks.filter((t) => t.due_date === today && !["Completed", "Cancelled"].includes(t.status)).length,
        overdue: transformedTasks.filter((t) => t.due_date && t.due_date < today && !["Completed", "Cancelled"].includes(t.status)).length,
        completedThisWeek: transformedTasks.filter((t) => t.status === "Completed" && t.completed_at && t.completed_at >= weekAgo).length,
        byStatus: {},
        byType: {},
        byPriority: {},
      };

      transformedTasks.forEach((t) => {
        statsData.byStatus[t.status] = (statsData.byStatus[t.status] || 0) + 1;
        statsData.byType[t.task_type] = (statsData.byType[t.task_type] || 0) + 1;
        statsData.byPriority[t.priority] = (statsData.byPriority[t.priority] || 0) + 1;
      });

      setStats(statsData);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createTask = async (taskData: Partial<EnhancedTask>, linkedClientIds?: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const insertData: any = {
        user_id: user.id,
        title: taskData.title || "New Task",
        description: taskData.description,
        task_type: (taskData.task_type || "Follow-up") as any,
        priority: (taskData.priority || "Medium") as any,
        status: (taskData.status || "Not Started") as any,
        due_date: taskData.due_date,
        client_id: taskData.client_id,
        assigned_to_user_id: taskData.assigned_to_user_id || user.id,
        created_by: user.id,
        is_practice_task: taskData.is_practice_task || false,
        notes: taskData.notes || [],
        source: taskData.source || "Manual",
      };

      // Include SLA and execution time if provided
      if ((taskData as any).standard_execution_minutes != null) {
        insertData.standard_execution_minutes = (taskData as any).standard_execution_minutes;
      }
      if ((taskData as any).sla_deadline) {
        insertData.sla_deadline = (taskData as any).sla_deadline;
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Create linked clients
      if (linkedClientIds && linkedClientIds.length > 0) {
        const clientLinks = linkedClientIds.map((clientId, index) => ({
          user_id: user.id,
          task_id: data.id,
          client_id: clientId,
          role: index === 0 ? "Primary" : "Related",
        }));

        await supabase.from("task_clients").insert(clientLinks);
      }

      // Log to history
      await supabase.from("task_history").insert({
        user_id: user.id,
        task_id: data.id,
        action: "Created",
        changed_by: user.id,
      });

      await fetchTasks();
      toast.success("Task created successfully");
      return data;
    } catch (err: any) {
      console.error("Error creating task:", err);
      toast.error(err.message || "Failed to create task");
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<EnhancedTask>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updatePayload: any = { ...updates };
      
      // Handle completed_at
      if (updates.status === "Completed" && !updatePayload.completed_at) {
        updatePayload.completed_at = new Date().toISOString();
      } else if (updates.status && updates.status !== "Completed") {
        updatePayload.completed_at = null;
      }

      // Remove joined data from update
      delete updatePayload.client_name;
      delete updatePayload.assigned_to_name;
      delete updatePayload.linked_clients;

      const { error } = await supabase
        .from("tasks")
        .update(updatePayload)
        .eq("id", taskId);

      if (error) throw error;

      // Log to history
      const changedFields = Object.keys(updates);
      for (const field of changedFields) {
        await supabase.from("task_history").insert({
          user_id: user.id,
          task_id: taskId,
          action: "Updated",
          field_name: field,
          new_value: String((updates as any)[field]),
          changed_by: user.id,
        });
      }

      await fetchTasks();
      toast.success("Task updated successfully");
      return true;
    } catch (err: any) {
      console.error("Error updating task:", err);
      toast.error(err.message || "Failed to update task");
      return false;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("tasks")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", taskId);

      if (error) throw error;

      // Log to history
      await supabase.from("task_history").insert({
        user_id: user.id,
        task_id: taskId,
        action: "Deleted",
        changed_by: user.id,
      });

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted successfully");
      return true;
    } catch (err: any) {
      console.error("Error deleting task:", err);
      toast.error(err.message || "Failed to delete task");
      return false;
    }
  };

  const togglePin = async (taskId: string, isPinned: boolean) => {
    return updateTask(taskId, { is_pinned: !isPinned });
  };

  const addNote = async (taskId: string, note: string, isInternal: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error("Task not found");

      const newNote = {
        id: crypto.randomUUID(),
        content: note,
        created_at: new Date().toISOString(),
        created_by: user.id,
        is_internal: isInternal,
      };

      if (isInternal) {
        const updatedNotes = [...(task.internal_notes || []), newNote];
        await updateTask(taskId, { internal_notes: updatedNotes } as any);
      } else {
        const updatedNotes = [...(task.notes || []), newNote];
        await updateTask(taskId, { notes: updatedNotes } as any);
      }

      return true;
    } catch (err: any) {
      console.error("Error adding note:", err);
      toast.error(err.message || "Failed to add note");
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    stats,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    togglePin,
    addNote,
  };
};
