import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TimeBucket = "today" | "lt7days" | "lt14days" | "lt1month" | "gte1month";
export type OnboardingStatus = "In Progress" | "Pending Client" | "Not Started";

export interface OnboardingMatrix {
  [bucket: string]: {
    [status: string]: number;
  };
}

const TIME_BUCKETS: TimeBucket[] = ["today", "lt7days", "lt14days", "lt1month", "gte1month"];
const STATUSES: OnboardingStatus[] = ["In Progress", "Pending Client", "Not Started"];

function getEmptyMatrix(): OnboardingMatrix {
  const matrix: OnboardingMatrix = {};
  for (const bucket of TIME_BUCKETS) {
    matrix[bucket] = {};
    for (const status of STATUSES) {
      matrix[bucket][status] = 0;
    }
  }
  return matrix;
}

function classifyBucket(dueDate: string | null, todayStr: string, todayDate: Date): TimeBucket {
  if (!dueDate) return "gte1month";
  if (dueDate === todayStr) return "today";

  const due = new Date(dueDate + "T00:00:00");
  const diffDays = Math.ceil((due.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "today"; // overdue counts as today
  if (diffDays <= 7) return "lt7days";
  if (diffDays <= 14) return "lt14days";
  if (diffDays <= 30) return "lt1month";
  return "gte1month";
}

export function useOnboardingProgress(selectedAdvisorNames: string[]) {
  const [rawTasks, setRawTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOnboardingTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select(`
            id, status, due_date, client_id,
            clients!tasks_client_id_fkey(advisor)
          `)
          .eq("task_type", "Onboarding")
          .eq("is_deleted", false)
          .in("status", ["In Progress", "Pending Client", "Not Started"] as any);

        if (error) throw error;
        setRawTasks(data || []);
      } catch (err) {
        console.error("Error fetching onboarding tasks:", err);
        setRawTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingTasks();
  }, []);

  const matrix = useMemo(() => {
    const m = getEmptyMatrix();
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayStr = todayDate.toISOString().split("T")[0];

    for (const task of rawTasks) {
      // Filter by advisor
      const advisor = task.clients?.advisor;
      if (task.client_id && advisor && !selectedAdvisorNames.includes(advisor)) {
        continue;
      }

      const status = task.status as OnboardingStatus;
      if (!STATUSES.includes(status)) continue;

      const bucket = classifyBucket(task.due_date, todayStr, todayDate);
      m[bucket][status]++;
    }

    return m;
  }, [rawTasks, selectedAdvisorNames]);

  return { matrix, loading };
}
