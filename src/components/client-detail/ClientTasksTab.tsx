import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ListTodo } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { EnhancedTask } from "@/hooks/useTasksEnhanced";
import { TaskDetailSheet } from "@/components/tasks/TaskDetailSheet";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { toast } from "sonner";

interface ClientTasksTabProps {
  clientId: string;
}

const priorityColors: Record<string, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Urgent: "bg-destructive/10 text-destructive",
};

const statusColors: Record<string, string> = {
  "Not Started": "bg-muted text-muted-foreground",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Pending Client": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Cancelled: "bg-muted text-muted-foreground line-through",
};

const ClientTasksTab = ({ clientId }: ClientTasksTabProps) => {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<EnhancedTask | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          clients!tasks_client_id_fkey(first_name, surname, advisor),
          team_members!tasks_assigned_to_user_id_fkey(first_name, last_name)
        `)
        .eq("is_deleted", false)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformed: EnhancedTask[] = (data || []).map((t: any) => ({
        ...t,
        client_name: t.clients
          ? `${t.clients.first_name} ${t.clients.surname}`
          : null,
        client_advisor: t.clients?.advisor || null,
        assigned_to_name: t.team_members
          ? `${t.team_members.first_name} ${t.team_members.last_name}`
          : "Unassigned",
        internal_notes: t.internal_notes || [],
        notes: t.notes || [],
        tags: t.tags || [],
        watchers: t.watchers || [],
      }));

      setTasks(transformed);
    } catch (err: any) {
      console.error("Error fetching client tasks:", err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleUpdate = async (taskId: string, updates: Partial<EnhancedTask>) => {
    try {
      const { client_name, client_advisor, assigned_to_name, linked_clients, ...dbUpdates } = updates as any;
      const { error } = await supabase
        .from("tasks")
        .update({
          ...dbUpdates,
          completed_at: updates.status === "Completed" ? new Date().toISOString() : undefined,
        })
        .eq("id", taskId);
      if (error) throw error;
      await fetchTasks();
      toast.success("Task updated");
      return true;
    } catch {
      toast.error("Failed to update task");
      return false;
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", taskId);
      if (error) throw error;
      setDetailOpen(false);
      await fetchTasks();
      toast.success("Task deleted");
      return true;
    } catch {
      toast.error("Failed to delete task");
      return false;
    }
  };

  const handleTogglePin = async (taskId: string, isPinned: boolean) => {
    await handleUpdate(taskId, { is_pinned: !isPinned } as any);
  };

  const handleAddNote = async (taskId: string, note: string, isInternal: boolean) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;
    const field = isInternal ? "internal_notes" : "notes";
    const existing = Array.isArray(task[field]) ? task[field] : [];
    const newNote = { text: note, date: new Date().toISOString() };
    return handleUpdate(taskId, { [field]: [...existing, newNote] } as any);
  };

  const handleCreate = async (taskData: Partial<EnhancedTask>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("tasks")
        .insert([{
          user_id: user.id,
          title: taskData.title || "New Task",
          description: taskData.description,
          task_type: (taskData.task_type as any) || "Follow-up",
          priority: (taskData.priority as any) || "Medium",
          status: (taskData.status as any) || "Not Started",
          due_date: taskData.due_date,
          client_id: taskData.client_id || clientId,
          assigned_to_user_id: taskData.assigned_to_user_id || user.id,
          created_by: user.id,
          is_practice_task: false,
          notes: taskData.notes || [],
          category: taskData.category,
        }])
        .select()
        .single();
      if (error) throw error;
      await fetchTasks();
      toast.success("Task created");
      return data;
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
      return null;
    }
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === "Completed" || status === "Cancelled") return false;
    return isPast(new Date(dueDate)) && !isToday(new Date(dueDate));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tasks ({tasks.length})</h3>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Create Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ListTodo className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">No tasks for this client</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Create First Task
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedTask(task);
                    setDetailOpen(true);
                  }}
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {task.task_number || "—"}
                  </TableCell>
                  <TableCell className="font-medium text-sm max-w-[200px] truncate">
                    {task.title}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{task.task_type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${priorityColors[task.priority] || ""}`}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[task.status] || ""}`}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-xs ${isOverdue(task.due_date, task.status) ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {task.due_date ? format(new Date(task.due_date), "dd MMM yyyy") : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {task.assigned_to_name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TaskDetailSheet
        task={selectedTask}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
        onAddNote={handleAddNote}
      />

      <CreateTaskDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default ClientTasksTab;
