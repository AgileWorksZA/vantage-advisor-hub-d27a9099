import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { toast } from "sonner";

export interface FinancialPlanningWorkflow {
  id: string;
  user_id: string;
  client_id: string;
  workflow_name: string;
  current_step: number;
  status: string;
  adviser_id: string | null;
  started_at: string;
  completed_at: string | null;
  step_data: Record<string, { completed: boolean; data?: Record<string, unknown> }>;
  last_auto_save: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
}

export const useFinancialPlanningWorkflow = (clientId: string, workflowId?: string) => {
  const { userId } = useKapableAuth();
  const [workflow, setWorkflow] = useState<FinancialPlanningWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchWorkflow = useCallback(async () => {
    if (!workflowId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await kapable
        .from("financial_planning_workflows")
        .select("*")
        .eq("id", workflowId)
        .eq("is_deleted", false)
        .single();

      if (error) throw error;
      setWorkflow(data as FinancialPlanningWorkflow);
    } catch (err) {
      console.error("Error fetching workflow:", err);
      toast.error("Failed to load workflow");
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  const createWorkflow = useCallback(async (name: string): Promise<string | null> => {
    try {
      setSaving(true);
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from("financial_planning_workflows")
        .insert({
          user_id: userId,
          client_id: clientId,
          workflow_name: name,
          current_step: 1,
          status: "Active",
        })
        .select()
        .single();

      if (error) throw error;
      setWorkflow(data as FinancialPlanningWorkflow);
      toast.success("Workflow created");
      return data.id;
    } catch (err) {
      console.error("Error creating workflow:", err);
      toast.error("Failed to create workflow");
      return null;
    } finally {
      setSaving(false);
    }
  }, [clientId]);

  const updateWorkflow = useCallback(async (updates: Partial<FinancialPlanningWorkflow>) => {
    if (!workflow) return;

    try {
      setSaving(true);
      // Convert step_data to JSON-compatible format
      const dbUpdates: Record<string, unknown> = {
        ...updates,
        last_auto_save: new Date().toISOString(),
      };
      if (updates.step_data) {
        dbUpdates.step_data = JSON.parse(JSON.stringify(updates.step_data));
      }
      
      const { error } = await kapable
        .from("financial_planning_workflows")
        .update(dbUpdates)
        .eq("id", workflow.id);

      if (error) throw error;
      setWorkflow(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error("Error updating workflow:", err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }, [workflow]);

  const updateCurrentStep = useCallback(async (step: number) => {
    await updateWorkflow({ current_step: step });
  }, [updateWorkflow]);

  const markStepComplete = useCallback(async (step: number, data?: Record<string, unknown>) => {
    if (!workflow) return;

    const newStepData = {
      ...workflow.step_data,
      [step]: { completed: true, data },
    };

    await updateWorkflow({ step_data: newStepData });
  }, [workflow, updateWorkflow]);

  const completeWorkflow = useCallback(async () => {
    await updateWorkflow({
      status: "Complete",
      completed_at: new Date().toISOString(),
    });
    toast.success("Workflow completed!");
  }, [updateWorkflow]);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
    }
  }, [workflowId, fetchWorkflow]);

  return {
    workflow,
    loading,
    saving,
    createWorkflow,
    updateWorkflow,
    updateCurrentStep,
    markStepComplete,
    completeWorkflow,
    refetch: fetchWorkflow,
  };
};
