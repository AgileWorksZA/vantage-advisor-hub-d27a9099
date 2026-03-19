import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
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
  const { userId } = useKapableAuth();
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
      const { data, error: fetchError } = await kapable
        .from("email_tasks")
        .select("*")
        .eq("email_id", emailId);

      // Fetch related tasks separately (Kapable doesn't support nested selects)
      const taskIds = (data || []).map((et: any) => et.task_id).filter(Boolean);
      let tasksMap: Record<string, any> = {};
      if (taskIds.length > 0) {
        const { data: tasksData } = await kapable.from("advisor_tasks").select("*").in("id", taskIds);
        for (const t of (tasksData || [])) {
          tasksMap[t.id] = t;
        }
        // Fetch clients for those tasks
        const clientIds = (tasksData || []).map((t: any) => t.client_id).filter(Boolean);
        let clientsMap: Record<string, any> = {};
        if (clientIds.length > 0) {
          const { data: clientsData } = await kapable.from("clients").select("*").in("id", clientIds);
          for (const c of (clientsData || [])) {
            clientsMap[c.id] = c;
          }
        }
        // Merge client data into tasks
        for (const t of Object.values(tasksMap)) {
          if (t.client_id && clientsMap[t.client_id]) {
            t.clients = clientsMap[t.client_id];
          }
        }
      }

      if (fetchError) throw fetchError;

      const transformedTasks: LinkedTaskDisplay[] = (data || []).map((et: any) => {
        const task = tasksMap[et.task_id];
        const firstName = task?.clients?.first_name || "";
        const surname = task?.clients?.surname || "";
        const clientName = surname && firstName
          ? `${surname}, ${firstName[0]} (${firstName})`
          : surname || firstName || null;
        return {
          id: et.id,
          task_id: task?.id || et.task_id,
          client_id: task?.client_id || null,
          task_number: task?.task_number || 0,
          title: task?.title || null,
          task_type: task?.task_type || null,
          assignee: null,
          due_date: task?.due_date || null,
          client_initials: task?.clients
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
      if (!userId) throw new Error("Not authenticated");

      const { error: insertError } = await kapable
        .from("email_tasks")
        .insert({
          user_id: userId,
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
      const { error: deleteError } = await kapable
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
      const { error: updateError } = await kapable
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
