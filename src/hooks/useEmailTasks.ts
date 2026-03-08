import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmailTask {
  id: string;
  user_id: string;
  email_id: string;
  task_id: string;
  is_linked: boolean;
  created_at: string;
  updated_at: string;
  // Joined task data
  task_number?: number;
  title?: string;
  task_type?: string;
  due_date?: string;
  assignee?: string;
  client_initials?: string;
}

export interface LinkedTaskDisplay {
  id: string;
  task_id: string;
  client_id: string | null;
  task_number: number;
  title: string | null;
  task_type: string | null;
  assignee: string | null;
  due_date: string | null;
  client_initials: string | null;
  client_name: string | null;
  is_linked: boolean;
}

export const useEmailTasks = (emailId: string | null) => {
  const [linkedTasks, setLinkedTasks] = useState<LinkedTaskDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinkedTasks = useCallback(async () => {
    if (!emailId) {
      setLinkedTasks([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("email_tasks")
        .select(`
          *,
          tasks!email_tasks_task_id_fkey(
            task_number,
            title,
            task_type,
            due_date,
            clients!tasks_client_id_fkey(first_name, surname)
          )
        `)
        .eq("email_id", emailId);

      if (fetchError) throw fetchError;

      const transformedTasks: LinkedTaskDisplay[] = (data || []).map((et: any) => {
        const firstName = et.tasks?.clients?.first_name || "";
        const surname = et.tasks?.clients?.surname || "";
        const clientName = surname && firstName
          ? `${surname}, ${firstName[0]} (${firstName})`
          : surname || firstName || null;
        return {
          id: et.id,
          task_number: et.tasks?.task_number || 0,
          title: et.tasks?.title || null,
          task_type: et.tasks?.task_type || null,
          assignee: null,
          due_date: et.tasks?.due_date || null,
          client_initials: et.tasks?.clients
            ? `${firstName?.[0] || ""}${surname?.[0] || ""}`.toUpperCase()
            : null,
          client_name: clientName,
          is_linked: et.is_linked,
        };
      });

      setLinkedTasks(transformedTasks);
    } catch (err: any) {
      console.error("Error fetching linked tasks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [emailId]);

  const linkTask = async (taskId: string): Promise<boolean> => {
    if (!emailId) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: insertError } = await supabase
        .from("email_tasks")
        .insert({
          user_id: user.id,
          email_id: emailId,
          task_id: taskId,
          is_linked: true,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          toast.error("Task is already linked to this email");
          return false;
        }
        throw insertError;
      }

      await fetchLinkedTasks();
      return true;
    } catch (err: any) {
      console.error("Error linking task:", err);
      toast.error(err.message || "Failed to link task");
      return false;
    }
  };

  const unlinkTask = async (emailTaskId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from("email_tasks")
        .delete()
        .eq("id", emailTaskId);

      if (deleteError) throw deleteError;

      setLinkedTasks((prev) => prev.filter((t) => t.id !== emailTaskId));
      toast.success("Task unlinked");
      return true;
    } catch (err: any) {
      console.error("Error unlinking task:", err);
      toast.error(err.message || "Failed to unlink task");
      return false;
    }
  };

  const toggleTaskLink = async (emailTaskId: string, linked: boolean): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from("email_tasks")
        .update({ is_linked: linked })
        .eq("id", emailTaskId);

      if (updateError) throw updateError;

      setLinkedTasks((prev) =>
        prev.map((t) =>
          t.id === emailTaskId ? { ...t, is_linked: linked } : t
        )
      );
      return true;
    } catch (err: any) {
      console.error("Error toggling task link:", err);
      toast.error(err.message || "Failed to update task link");
      return false;
    }
  };

  useEffect(() => {
    fetchLinkedTasks();
  }, [fetchLinkedTasks]);

  return {
    linkedTasks,
    loading,
    error,
    refetch: fetchLinkedTasks,
    linkTask,
    unlinkTask,
    toggleTaskLink,
  };
};
