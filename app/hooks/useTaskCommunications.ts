import { useState, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { toast } from "sonner";

export interface TaskCommunication {
  id: string;
  task_id: string;
  communication_id: string;
  created_at: string;
  subject?: string;
  channel?: string;
  direction?: string;
  sent_at?: string;
  status?: string;
  to_identifier?: string;
}

export const useTaskCommunications = (taskId?: string) => {
  const { userId } = useKapableAuth();
  const [taskCommunications, setTaskCommunications] = useState<TaskCommunication[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTaskCommunications = useCallback(async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const { data, error } = await kapable
        .from("task_communications")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch communication details separately
      const commIds = [...new Set((data || []).map((tc: any) => tc.communication_id).filter(Boolean))];
      let commsMap: Record<string, any> = {};
      if (commIds.length > 0) {
        const { data: commsData } = await kapable.from("communications").select("*").in("id", commIds);
        for (const c of (commsData || [])) {
          commsMap[c.id] = c;
        }
      }

      const transformed = (data || []).map((tc: any) => {
        const comm = commsMap[tc.communication_id];
        return {
          id: tc.id,
          task_id: tc.task_id,
          communication_id: tc.communication_id,
          created_at: tc.created_at,
          subject: comm?.subject,
          channel: comm?.channel,
          direction: comm?.direction,
          sent_at: comm?.sent_at,
          status: comm?.status,
          to_identifier: comm?.to_identifier,
        };
      });

      setTaskCommunications(transformed);
    } catch (err: any) {
      console.error("Error fetching task communications:", err);
      toast.error("Failed to load communications");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const linkCommunication = async (communicationId: string) => {
    if (!taskId) return null;

    try {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from("task_communications")
        .insert({
          user_id: userId,
          task_id: taskId,
          communication_id: communicationId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTaskCommunications();
      toast.success("Communication linked to task");
      return data;
    } catch (err: any) {
      console.error("Error linking communication to task:", err);
      toast.error(err.message || "Failed to link communication");
      return null;
    }
  };

  const unlinkCommunication = async (taskCommunicationId: string) => {
    try {
      const { error } = await kapable
        .from("task_communications")
        .delete()
        .eq("id", taskCommunicationId);

      if (error) throw error;

      setTaskCommunications((prev) => prev.filter((tc) => tc.id !== taskCommunicationId));
      toast.success("Communication unlinked from task");
      return true;
    } catch (err: any) {
      console.error("Error unlinking communication:", err);
      toast.error(err.message || "Failed to unlink communication");
      return false;
    }
  };

  return {
    taskCommunications,
    loading,
    fetchTaskCommunications,
    linkCommunication,
    unlinkCommunication,
  };
};
