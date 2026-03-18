import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [taskCommunications, setTaskCommunications] = useState<TaskCommunication[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTaskCommunications = useCallback(async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("task_communications")
        .select(`
          id,
          task_id,
          communication_id,
          created_at,
          communications!task_communications_communication_id_fkey(subject, channel, direction, sent_at, status, to_identifier)
        `)
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformed = (data || []).map((tc: any) => ({
        id: tc.id,
        task_id: tc.task_id,
        communication_id: tc.communication_id,
        created_at: tc.created_at,
        subject: tc.communications?.subject,
        channel: tc.communications?.channel,
        direction: tc.communications?.direction,
        sent_at: tc.communications?.sent_at,
        status: tc.communications?.status,
        to_identifier: tc.communications?.to_identifier,
      }));

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("task_communications")
        .insert({
          user_id: user.id,
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
      const { error } = await supabase
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
