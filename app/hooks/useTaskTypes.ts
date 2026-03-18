import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TaskTypeOption {
  code: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export const useTaskTypes = () => {
  const [taskTypes, setTaskTypes] = useState<TaskTypeOption[]>([]);
  const [taskCategories, setTaskCategories] = useState<TaskTypeOption[]>([]);
  const [taskResolutionTypes, setTaskResolutionTypes] = useState<TaskTypeOption[]>([]);
  const [taskSources, setTaskSources] = useState<TaskTypeOption[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<TaskTypeOption[]>([]);
  const [taskPriorities, setTaskPriorities] = useState<TaskTypeOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_general_lists")
        .select("*")
        .in("list_type", ["task_types", "task_categories", "task_resolution_types", "task_sources", "task_statuses", "task_priorities", "priorities"])
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      const types: TaskTypeOption[] = [];
      const categories: TaskTypeOption[] = [];
      const resolutions: TaskTypeOption[] = [];
      const sources: TaskTypeOption[] = [];
      const statuses: TaskTypeOption[] = [];
      const priorities: TaskTypeOption[] = [];

      (data || []).forEach((item: any) => {
        const option: TaskTypeOption = {
          code: item.name,
          name: item.name,
          description: item.description,
          display_order: item.display_order || 0,
          is_active: item.is_active,
        };

        switch (item.list_type) {
          case "task_types":
            types.push(option);
            break;
          case "task_categories":
            categories.push(option);
            break;
          case "task_resolution_types":
            resolutions.push(option);
            break;
          case "task_sources":
            sources.push(option);
            break;
          case "task_statuses":
            statuses.push(option);
            break;
          case "task_priorities":
          case "priorities":
            priorities.push(option);
            break;
        }
      });

      setTaskTypes(types);
      setTaskCategories(categories);
      setTaskResolutionTypes(resolutions);
      setTaskSources(sources);
      setTaskStatuses(statuses);
      setTaskPriorities(priorities);
    } catch (err) {
      console.error("Error fetching task types:", err);
      // Fallback to default values
      setTaskTypes([
        { code: "Follow-up", name: "Follow-up", display_order: 1, is_active: true },
        { code: "Client Complaint", name: "Client Complaint", display_order: 2, is_active: true },
        { code: "Annual Review", name: "Annual Review", display_order: 3, is_active: true },
        { code: "Portfolio Review", name: "Portfolio Review", display_order: 4, is_active: true },
        { code: "Compliance", name: "Compliance", display_order: 5, is_active: true },
        { code: "Onboarding", name: "Onboarding", display_order: 6, is_active: true },
        { code: "Document Request", name: "Document Request", display_order: 7, is_active: true },
      ]);
      setTaskStatuses([
        { code: "Not Started", name: "Not Started", display_order: 1, is_active: true },
        { code: "In Progress", name: "In Progress", display_order: 2, is_active: true },
        { code: "Pending Client", name: "Pending Client", display_order: 3, is_active: true },
        { code: "Completed", name: "Completed", display_order: 4, is_active: true },
        { code: "Cancelled", name: "Cancelled", display_order: 5, is_active: true },
      ]);
      setTaskPriorities([
        { code: "Low", name: "Low", display_order: 1, is_active: true },
        { code: "Medium", name: "Medium", display_order: 2, is_active: true },
        { code: "High", name: "High", display_order: 3, is_active: true },
        { code: "Urgent", name: "Urgent", display_order: 4, is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return {
    taskTypes,
    taskCategories,
    taskResolutionTypes,
    taskSources,
    taskStatuses,
    taskPriorities,
    loading,
    refetch: fetchTypes,
  };
};
