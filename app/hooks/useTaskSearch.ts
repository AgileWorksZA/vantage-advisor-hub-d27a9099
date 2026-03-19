import { useState, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";

export interface TaskSearchFilters {
  clientIds?: string[];
  search?: string;
  status?: string[];
  taskType?: string[];
  priority?: string[];
  dateFilter?: "all" | "today_forward" | "due_today" | "overdue" | "this_week" | "this_month";
  assignee?: "me" | "my_team" | "all";
  showCompleted?: boolean;
}

export interface TaskSearchResult {
  id: string;
  task_number: number;
  title: string;
  description: string | null;
  task_type: string;
  priority: string;
  status: string;
  due_date: string | null;
  follow_up_date: string | null;
  client_id: string | null;
  client_name: string | null;
  client_initials: string | null;
  advisor: string | null;
  assignee: string | null;
  last_comment: string | null;
  created_at: string;
}

export const useTaskSearch = () => {
  const [tasks, setTasks] = useState<TaskSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const searchTasks = useCallback(
    async (filters: TaskSearchFilters, page: number = 1, pageSize: number = 5) => {
      setLoading(true);
      setError(null);

      try {
        let query = kapable
          .from("advisor_tasks")
          .select("*")
          .eq("is_deleted", false);

        // Filter by client IDs if provided
        if (filters.clientIds && filters.clientIds.length > 0) {
          query = query.in("client_id", filters.clientIds);
        }

        // Search across multiple fields
        if (filters.search) {
          const searchTerm = `%${filters.search}%`;
          const taskNum = parseInt(filters.search);
          if (!isNaN(taskNum)) {
            query = query.or(
              `title.ilike.${searchTerm},description.ilike.${searchTerm},task_number.eq.${taskNum}`
            );
          } else {
            query = query.or(
              `title.ilike.${searchTerm},description.ilike.${searchTerm}`
            );
          }
        }

        // Status filter - cast to proper type
        if (filters.status && filters.status.length > 0) {
          const statusValues = filters.status as ("Not Started" | "In Progress" | "Pending Client" | "Completed" | "Cancelled")[];
          query = query.in("status", statusValues);
        } else if (!filters.showCompleted) {
          query = query.not("status", "in", '("Completed","Cancelled")');
        }

        // Task type filter - cast to proper type
        if (filters.taskType && filters.taskType.length > 0) {
          const taskTypeValues = filters.taskType as ("Client Complaint" | "Follow-up" | "Annual Review" | "Portfolio Review" | "Compliance" | "Onboarding" | "Document Request")[];
          query = query.in("task_type", taskTypeValues);
        }

        // Priority filter - cast to proper type
        if (filters.priority && filters.priority.length > 0) {
          const priorityValues = filters.priority as ("Low" | "Medium" | "High" | "Urgent")[];
          query = query.in("priority", priorityValues);
        }

        // Date filters
        const now = new Date();
        const today = now.toISOString().split("T")[0];

        if (filters.dateFilter === "today_forward") {
          query = query.gte("due_date", today);
        } else if (filters.dateFilter === "due_today") {
          query = query.eq("due_date", today);
        } else if (filters.dateFilter === "overdue") {
          query = query.lt("due_date", today);
        } else if (filters.dateFilter === "this_week") {
          const weekEnd = new Date(now);
          weekEnd.setDate(now.getDate() + 7);
          query = query.gte("due_date", today).lte("due_date", weekEnd.toISOString().split("T")[0]);
        } else if (filters.dateFilter === "this_month") {
          const monthEnd = new Date(now);
          monthEnd.setMonth(now.getMonth() + 1);
          query = query.gte("due_date", today).lte("due_date", monthEnd.toISOString().split("T")[0]);
        }

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to).order("created_at", { ascending: false });

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Fetch client details separately
        const clientIds = [...new Set((data || []).map((t: any) => t.client_id).filter(Boolean))];
        let clientsMap: Record<string, any> = {};
        if (clientIds.length > 0) {
          const { data: clientsData } = await kapable.from("clients").select("*").in("id", clientIds);
          for (const c of (clientsData || [])) {
            clientsMap[c.id] = c;
          }
        }

        const transformedTasks: TaskSearchResult[] = (data || []).map((task: any) => {
          const client = clientsMap[task.client_id];
          return {
            id: task.id,
            task_number: task.task_number,
            title: task.title,
            description: task.description,
            task_type: task.task_type,
            priority: task.priority,
            status: task.status,
            due_date: task.due_date,
            follow_up_date: task.follow_up_date,
            client_id: task.client_id,
            client_name: client
              ? `${client.first_name} ${client.surname}`
              : null,
            client_initials: client
              ? `${client.first_name?.[0] || ""}${client.surname?.[0] || ""}`.toUpperCase()
              : null,
            advisor: client?.advisor || null,
            assignee: null,
            last_comment: null,
            created_at: task.created_at,
          };
        });

        setTasks(transformedTasks);
        setTotalCount((data || []).length);
      } catch (err: any) {
        console.error("Error searching tasks:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    tasks,
    loading,
    error,
    totalCount,
    searchTasks,
  };
};
