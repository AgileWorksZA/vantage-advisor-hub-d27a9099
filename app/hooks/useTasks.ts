import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Task {
  id: string;
  user_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  task_type: "Client Complaint" | "Follow-up" | "Annual Review" | "Portfolio Review" | "Compliance" | "Onboarding" | "Document Request";
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Not Started" | "In Progress" | "Pending Client" | "Completed" | "Cancelled";
  due_date: string | null;
  assigned_to_user_id: string | null;
  created_by: string | null;
  notes: any[];
  is_practice_task: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  is_deleted: boolean;
  // Joined data
  client_name?: string;
  assigned_to_name?: string;
}

export interface TaskListItem {
  id: string;
  title: string;
  clientName: string;
  clientId: string;
  taskType: Task["task_type"];
  priority: Task["priority"];
  status: Task["status"];
  dueDate: Date;
  createdDate: Date;
  assignedTo: { name: string; initials: string };
  description?: string;
  notes?: string[];
  isPracticeTask: boolean;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const transformTaskToListItem = (task: Task): TaskListItem => {
  const assignedName = task.assigned_to_name || "Unassigned";
  return {
    id: task.id,
    title: task.title,
    clientName: task.client_name || (task.is_practice_task ? "N/A - Practice Task" : "No Client"),
    clientId: task.client_id || "practice",
    taskType: task.task_type,
    priority: task.priority === "Urgent" ? "High" : task.priority,
    status: task.status,
    dueDate: task.due_date ? new Date(task.due_date) : new Date(),
    createdDate: new Date(task.created_at),
    assignedTo: { name: assignedName, initials: getInitials(assignedName) },
    description: task.description || undefined,
    notes: Array.isArray(task.notes) ? task.notes : [],
    isPracticeTask: task.is_practice_task,
  };
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select(`
          *,
          clients!tasks_client_id_fkey(first_name, surname)
        `)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const transformedTasks = (data || []).map((task: any) => ({
        ...task,
        client_name: task.clients 
          ? `${task.clients.first_name} ${task.clients.surname}`
          : null,
        assigned_to_name: "Current User", // Will be enhanced later with profiles join
      })).map(transformTaskToListItem);

      setTasks(transformedTasks);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: user.id,
          title: taskData.title || "New Task",
          description: taskData.description,
          task_type: taskData.task_type || "Follow-up",
          priority: taskData.priority || "Medium",
          status: taskData.status || "Not Started",
          due_date: taskData.due_date,
          client_id: taskData.client_id,
          assigned_to_user_id: taskData.assigned_to_user_id || user.id,
          created_by: user.id,
          is_practice_task: taskData.is_practice_task || false,
          notes: taskData.notes || [],
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTasks();
      toast.success("Task created successfully");
      return data;
    } catch (err: any) {
      console.error("Error creating task:", err);
      toast.error(err.message || "Failed to create task");
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          ...updates,
          completed_at: updates.status === "Completed" ? new Date().toISOString() : null,
        })
        .eq("id", taskId);

      if (error) throw error;

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
      const { error } = await supabase
        .from("tasks")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", taskId);

      if (error) throw error;

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted successfully");
      return true;
    } catch (err: any) {
      console.error("Error deleting task:", err);
      toast.error(err.message || "Failed to delete task");
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};
