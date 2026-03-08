import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  CheckSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface LinkedTask {
  id: string;
  task_id: string;
  client_id: string | null;
  task_number: number;
  title: string | null;
  task_type: string | null;
  assignee: string | null;
  due_date: string | null;
  client_initials: string | null;
  client_name: string | null;
  is_linked: boolean;
}

interface TaskLinkingSectionProps {
  linkedTasks: LinkedTask[];
  onToggleLink?: (taskId: string, linked: boolean) => void;
  onGuessTask?: () => void;
  onSearchTask?: () => void;
  onNewTask?: () => void;
  onGuessCompletedTask?: () => void;
  isReadOnly?: boolean;
  isGuessing?: boolean;
}

export const TaskLinkingSection = ({
  linkedTasks,
  onToggleLink,
  onGuessTask,
  onSearchTask,
  onNewTask,
  onGuessCompletedTask,
  isReadOnly = false,
  isGuessing = false,
}: TaskLinkingSectionProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(linkedTasks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleTasks = linkedTasks.slice(startIndex, startIndex + pageSize);

  const formatDueDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yy");
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border rounded-lg bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              {isOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Task linking ({linkedTasks.length})
            </button>
          </CollapsibleTrigger>

          {!isReadOnly && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onGuessTask}
                className="gap-1.5 text-xs h-7"
                disabled={isGuessing}
              >
                {isGuessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Guess Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSearchTask}
                className="gap-1.5 text-xs h-7"
              >
                <Search className="w-3.5 h-3.5" />
                Search Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNewTask}
                className="gap-1.5 text-xs h-7"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                New Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onGuessCompletedTask}
                className="gap-1.5 text-xs h-7"
              >
                <FileText className="w-3.5 h-3.5" />
                Guess Completed Task
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <CollapsibleContent>
          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16 text-xs">Linked</TableHead>
                  <TableHead className="text-xs">Task number</TableHead>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="text-xs">Task type</TableHead>
                  <TableHead className="text-xs">Assignee</TableHead>
                  <TableHead className="text-xs">Due date</TableHead>
                  <TableHead className="text-xs">Client</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      No linked tasks
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Switch
                          checked={task.is_linked}
                          onCheckedChange={(checked) =>
                            onToggleLink?.(task.id, checked)
                          }
                          disabled={isReadOnly}
                        />
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {task.task_type === "Switch" || task.task_type === "Quote"
                          ? `Transaction-${task.task_number}`
                          : `Task-${task.task_number}`}
                      </TableCell>
                      <TableCell className="text-sm">
                        {task.title ? (
                          <span
                            className="cursor-pointer text-primary hover:underline"
                            onClick={() => navigate(`/tasks`)}
                          >
                            {task.title}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {task.task_type || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {task.assignee || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDueDate(task.due_date)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {task.client_name || task.client_initials ? (
                          <span
                            className="cursor-pointer text-primary hover:underline"
                            onClick={() => task.client_id && navigate(`/client/${task.client_id}`)}
                          >
                            {task.client_name || task.client_initials}
                          </span>
                        ) : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {linkedTasks.length > 0 && (
              <div className="flex items-center justify-end gap-2 p-3 border-t border-border text-xs text-muted-foreground">
                <span>
                  {startIndex + 1} to{" "}
                  {Math.min(startIndex + pageSize, linkedTasks.length)} of{" "}
                  {linkedTasks.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
