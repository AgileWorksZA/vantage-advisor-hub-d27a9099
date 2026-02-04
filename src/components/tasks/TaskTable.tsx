import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pin, PinOff, MoreHorizontal, Trash2, Eye, Edit } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { EnhancedTask } from "@/hooks/useTasksEnhanced";

interface TaskTableProps {
  tasks: EnhancedTask[];
  loading: boolean;
  onTaskClick: (task: EnhancedTask) => void;
  onTogglePin: (taskId: string, isPinned: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  selectedTasks: string[];
  onSelectionChange: (taskIds: string[]) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Urgent":
      return "bg-destructive text-destructive-foreground";
    case "High":
      return "bg-orange-500 text-white";
    case "Medium":
      return "bg-amber-500 text-white";
    case "Low":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "In Progress":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "Pending Client":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "Not Started":
      return "bg-muted text-muted-foreground border-muted";
    case "Cancelled":
      return "bg-muted/50 text-muted-foreground/70 border-muted";
    default:
      return "bg-muted text-muted-foreground border-muted";
  }
};

export function TaskTable({
  tasks,
  loading,
  onTaskClick,
  onTogglePin,
  onDeleteTask,
  selectedTasks,
  onSelectionChange,
}: TaskTableProps) {
  const today = startOfDay(new Date());

  const toggleTaskSelection = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      onSelectionChange(selectedTasks.filter((id) => id !== taskId));
    } else {
      onSelectionChange([...selectedTasks, taskId]);
    }
  };

  const toggleAllSelection = () => {
    if (selectedTasks.length === tasks.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tasks.map((t) => t.id));
    }
  };

  const getClientDisplay = (task: EnhancedTask) => {
    if (task.linked_clients && task.linked_clients.length > 0) {
      const primary = task.linked_clients.find((c) => c.role === "Primary");
      const displayName = primary?.client_name || task.linked_clients[0].client_name;
      if (task.linked_clients.length > 1) {
        return `${displayName} +${task.linked_clients.length - 1}`;
      }
      return displayName;
    }
    return task.client_name || (task.is_practice_task ? "Practice Task" : "—");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No tasks found. Create your first task to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={selectedTasks.length === tasks.length && tasks.length > 0}
                onCheckedChange={toggleAllSelection}
              />
            </TableHead>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="w-[80px]">Task #</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Client(s)</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>SLA</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const isOverdue = task.due_date && isBefore(new Date(task.due_date), today) && task.status !== "Completed" && task.status !== "Cancelled";
            const slaBreached = task.sla_deadline && isBefore(new Date(task.sla_deadline), today) && task.status !== "Completed";
            
            return (
              <TableRow
                key={task.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  task.is_pinned && "bg-primary/5"
                )}
                onClick={() => onTaskClick(task)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTaskSelection(task.id)}
                  />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onTogglePin(task.id, task.is_pinned)}
                  >
                    {task.is_pinned ? (
                      <Pin className="h-4 w-4 text-primary fill-primary" />
                    ) : (
                      <PinOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {task.task_number ? `#${task.task_number}` : "—"}
                </TableCell>
                <TableCell className="font-medium max-w-[250px] truncate">
                  {task.title}
                </TableCell>
                <TableCell className="max-w-[150px] truncate">
                  {getClientDisplay(task)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {task.task_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={cn("font-normal", getPriorityColor(task.priority))}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-normal", getStatusColor(task.status))}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.due_date ? (
                    <span className={cn(isOverdue && "text-destructive font-medium")}>
                      {format(new Date(task.due_date), "MMM d, yyyy")}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {task.sla_deadline ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-normal",
                        slaBreached ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      )}
                    >
                      {slaBreached ? "Breached" : "On Track"}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onTaskClick(task)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTaskClick(task)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteTask(task.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
