import { useState, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { toast } from "sonner";

export interface TaskClient {
  id: string;
  task_id: string;
  client_id: string;
  role: string;
  created_at: string;
  client_name?: string;
  client_email?: string;
}

export const useTaskClients = (taskId?: string) => {
  const { userId } = useKapableAuth();
  const [taskClients, setTaskClients] = useState<TaskClient[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTaskClients = useCallback(async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const { data, error } = await kapable
        .from("task_clients")
        .select("*")
        .eq("task_id", taskId);

      if (error) throw error;

      // Fetch client details separately
      const clientIds = [...new Set((data || []).map((tc: any) => tc.client_id).filter(Boolean))];
      let clientsMap: Record<string, any> = {};
      if (clientIds.length > 0) {
        const { data: clientsData } = await kapable.from("clients").select("*").in("id", clientIds);
        for (const c of (clientsData || [])) {
          clientsMap[c.id] = c;
        }
      }

      const transformed = (data || []).map((tc: any) => {
        const client = clientsMap[tc.client_id];
        return {
          id: tc.id,
          task_id: tc.task_id,
          client_id: tc.client_id,
          role: tc.role,
          created_at: tc.created_at,
          client_name: client ? `${client.first_name} ${client.surname}` : "Unknown",
          client_email: client?.email,
        };
      });

      setTaskClients(transformed);
    } catch (err: any) {
      console.error("Error fetching task clients:", err);
      toast.error("Failed to load linked clients");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const addClient = async (clientId: string, role: string = "Related") => {
    if (!taskId) return null;

    try {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from("task_clients")
        .insert({
          user_id: userId,
          task_id: taskId,
          client_id: clientId,
          role,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTaskClients();
      toast.success("Client linked to task");
      return data;
    } catch (err: any) {
      console.error("Error adding client to task:", err);
      toast.error(err.message || "Failed to link client");
      return null;
    }
  };

  const removeClient = async (taskClientId: string) => {
    try {
      const { error } = await kapable
        .from("task_clients")
        .delete()
        .eq("id", taskClientId);

      if (error) throw error;

      setTaskClients((prev) => prev.filter((tc) => tc.id !== taskClientId));
      toast.success("Client unlinked from task");
      return true;
    } catch (err: any) {
      console.error("Error removing client from task:", err);
      toast.error(err.message || "Failed to unlink client");
      return false;
    }
  };

  const updateRole = async (taskClientId: string, newRole: string) => {
    try {
      const { error } = await kapable
        .from("task_clients")
        .update({ role: newRole })
        .eq("id", taskClientId);

      if (error) throw error;

      await fetchTaskClients();
      toast.success("Client role updated");
      return true;
    } catch (err: any) {
      console.error("Error updating client role:", err);
      toast.error(err.message || "Failed to update role");
      return false;
    }
  };

  return {
    taskClients,
    loading,
    fetchTaskClients,
    addClient,
    removeClient,
    updateRole,
  };
};
