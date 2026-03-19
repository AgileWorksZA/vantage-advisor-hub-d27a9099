import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { toast } from "sonner";

export interface Workflow {
  id: string;
  user_id: string;
  client_id: string | null;
  template_id: string | null;
  name: string;
  service_area: string | null;
  current_step: number;
  status: "Active" | "Complete" | "Inactive" | "Cancelled";
  adviser_id: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface AdviceWorkflow {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  current_step: number;
  status: "Active" | "Complete" | "Inactive" | "Cancelled";
  adviser_id: string | null;
  date: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface FaisControl {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  products: string[];
  current_step: number;
  date: string | null;
  status: "Active" | "Complete" | "Inactive" | "Cancelled";
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface WorkflowListItem {
  id: string;
  service: string;
  name: string;
  adviser: string;
  endDate: string;
  status: string;
}

export interface AdviceWorkflowListItem {
  id: number;
  name: string;
  currentStep: string;
  status: string;
  adviser: string;
  date: string;
}

export interface FaisControlListItem {
  id: number;
  name: string;
  products: string[];
  step: string;
  date: string;
}

const stepNames = [
  "Not Started",
  "Basic information",
  "Design a plan",
  "Proposal/Report",
  "Implementation",
  "Complete",
];

const getStepName = (step: number): string => stepNames[step] || `Step ${step}`;

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
};

export const useClientWorkflows = (clientId: string) => {
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [adviceWorkflows, setAdviceWorkflows] = useState<AdviceWorkflowListItem[]>([]);
  const [faisControls, setFaisControls] = useState<FaisControlListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowCount, setWorkflowCount] = useState(0);
  const [adviceCount, setAdviceCount] = useState(0);
  const [faisCount, setFaisCount] = useState(0);
  const { userId } = useKapableAuth();

  const fetchWorkflows = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);
    try {
      // Fetch workflows
      const { data: workflowData, error: workflowError } = await kapable
        .from<Workflow>("workflows")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (workflowError) throw workflowError;

      const allWorkflows = (workflowData || []) as Workflow[];
      const transformedWorkflows = allWorkflows.map((w: Workflow) => ({
        id: w.id,
        service: w.service_area || "General",
        name: w.name,
        adviser: "Current Adviser",
        endDate: formatDate(w.end_date),
        status: w.status,
      }));
      setWorkflows(transformedWorkflows);
      setWorkflowCount(allWorkflows.length);

      // Fetch advice workflows
      const { data: adviceData, error: adviceError } = await kapable
        .from<AdviceWorkflow>("advice_workflows")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (adviceError) throw adviceError;

      const allAdvice = (adviceData || []) as AdviceWorkflow[];
      const transformedAdvice = allAdvice.map((a: AdviceWorkflow, idx) => ({
        id: idx + 1,
        name: a.name,
        currentStep: getStepName(a.current_step),
        status: a.status === "Active" ? "Open" : a.status,
        adviser: "Current Adviser",
        date: formatDate(a.date),
      }));
      setAdviceWorkflows(transformedAdvice);
      setAdviceCount(allAdvice.length);

      // Fetch FAIS controls
      const { data: faisData, error: faisError } = await kapable
        .from<FaisControl>("fais_controls")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (faisError) throw faisError;

      const allFais = (faisData || []) as any[];
      const faisStepNames = ["Active", "Consent", "Disclosure", "Complete"];
      const transformedFais: FaisControlListItem[] = allFais.map((f: any, idx: number) => ({
        id: idx + 1,
        name: f.name,
        products: Array.isArray(f.products) ? f.products as string[] : [],
        step: faisStepNames[f.current_step - 1] || f.status,
        date: formatDate(f.date),
      }));
      setFaisControls(transformedFais);
      setFaisCount(allFais.length);
    } catch (err: any) {
      console.error("Error fetching workflows:", err);
      setError(err.message);
      toast.error("Failed to load workflows");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const createWorkflow = async (workflowData: Partial<Workflow>) => {
    try {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from<Workflow>("workflows")
        .insert({
          user_id: userId,
          client_id: clientId,
          name: workflowData.name || "New Workflow",
          service_area: workflowData.service_area || "General",
          current_step: workflowData.current_step || 1,
          status: "Active",
          adviser_id: userId,
          start_date: new Date().toISOString().split("T")[0],
        } as any)
        .single();

      if (error) throw error;

      await fetchWorkflows();
      toast.success("Workflow created successfully");
      return data;
    } catch (err: any) {
      console.error("Error creating workflow:", err);
      toast.error(err.message || "Failed to create workflow");
      return null;
    }
  };

  const createFaisControl = async (faisData: Partial<FaisControl>) => {
    try {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from<FaisControl>("fais_controls")
        .insert({
          user_id: userId,
          client_id: clientId,
          name: faisData.name || "FAIS Disclosure",
          products: faisData.products || [],
          current_step: 1,
          status: "Active",
          date: new Date().toISOString().split("T")[0],
        } as any)
        .single();

      if (error) throw error;

      await fetchWorkflows();
      toast.success("FAIS control created successfully");
      return data;
    } catch (err: any) {
      console.error("Error creating FAIS control:", err);
      toast.error(err.message || "Failed to create FAIS control");
      return null;
    }
  };

  const updateWorkflowStatus = async (workflowId: string, newStatus: string) => {
    try {
      const { error } = await kapable
        .from<Workflow>("workflows")
        .update({ status: newStatus as any })
        .eq("id", workflowId);

      if (error) throw error;

      // Optimistic update
      setWorkflows(prev =>
        prev.map(w => w.id === workflowId ? { ...w, status: newStatus } : w)
      );
      toast.success("Workflow status updated");
    } catch (err: any) {
      console.error("Error updating workflow status:", err);
      toast.error("Failed to update status");
      await fetchWorkflows();
    }
  };

  const createAdviceWorkflow = async (name: string) => {
    try {
      if (!userId) throw new Error("Not authenticated");

      const { error } = await kapable
        .from<AdviceWorkflow>("advice_workflows")
        .insert({
          user_id: userId,
          client_id: clientId,
          name,
          current_step: 0,
          status: "Active",
          date: new Date().toISOString().split("T")[0],
        } as any);

      if (error) throw error;

      await fetchWorkflows();
      toast.success("Advice workflow created");
    } catch (err: any) {
      console.error("Error creating advice workflow:", err);
      toast.error(err.message || "Failed to create advice workflow");
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return {
    workflows,
    adviceWorkflows,
    faisControls,
    workflowCount,
    adviceCount,
    faisCount,
    loading,
    error,
    refetch: fetchWorkflows,
    createWorkflow,
    createFaisControl,
    updateWorkflowStatus,
    createAdviceWorkflow,
  };
};
