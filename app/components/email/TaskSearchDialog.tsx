import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { useTaskSearch, TaskSearchFilters, TaskSearchResult } from "@/hooks/useTaskSearch";
import { format } from "date-fns";

interface TaskSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientIds?: string[];
  onLinkTasks: (taskIds: string[]) => void;
}

const TASK_TYPES = [
  "Client Complaint",
  "Follow-up",
  "Annual Review",
  "Portfolio Review",
  "Compliance",
  "Onboarding",
  "Document Request",
];

const TASK_STATUSES = [
  "Not Started",
  "In Progress",
  "Pending Client",
  "Completed",
  "Cancelled",
];

export const TaskSearchDialog = ({
  open,
  onOpenChange,
  clientIds = [],
  onLinkTasks,
}: TaskSearchDialogProps) => {
  const { tasks, loading, totalCount, searchTasks } = useTaskSearch();
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TaskSearchFilters>({
    clientIds,
    showCompleted: false,
    dateFilter: "all",
  });

  const pageSize = 5;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedTaskIds(new Set());
      setCurrentPage(1);
      setSearchQuery("");
      setFilters({
        clientIds,
        showCompleted: false,
        dateFilter: "all",
      });
    }
  }, [open, clientIds]);

  // Fetch tasks when filters change
  useEffect(() => {
    if (open) {
      searchTasks({ ...filters, search: searchQuery }, currentPage, pageSize);
    }
  }, [open, filters, searchQuery, currentPage, searchTasks]);

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleLinkTasks = () => {
    onLinkTasks(Array.from(selectedTaskIds));
    onOpenChange(false);
  };

  const handleQuickFilter = (filterType: string) => {
    switch (filterType) {
      case "in_progress":
        setFilters((f) => ({ ...f, status: ["In Progress"] }));
        break;
      case "high_priority":
        setFilters((f) => ({ ...f, priority: ["High", "Urgent"] }));
        break;
      case "reviews":
        setFilters((f) => ({ ...f, taskType: ["Annual Review", "Portfolio Review"] }));
        break;
      default:
        break;
    }
  };

  const handleResetFilters = () => {
    setFilters({
      clientIds,
      showCompleted: false,
      dateFilter: "all",
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yy");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search and Link Tasks</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleQuickFilter("in_progress")}
            >
              In Progress
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleQuickFilter("high_priority")}
            >
              High Priority
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleQuickFilter("reviews")}
            >
              Reviews
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <Label htmlFor="show-completed" className="text-xs">
                Show Closed and Completed Cases
              </Label>
              <Switch
                id="show-completed"
                checked={filters.showCompleted}
                onCheckedChange={(checked) =>
                  setFilters((f) => ({ ...f, showCompleted: checked }))
                }
              />
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Description, Task Number, Task Type, Client, Advisor, Assignee..."
              className="pl-9"
            />
          </div>

          {/* Advanced Filters Row */}
          <div className="flex items-start gap-4">
            {/* Date Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Date Filter</Label>
              <RadioGroup
                value={filters.dateFilter}
                onValueChange={(value: any) =>
                  setFilters((f) => ({ ...f, dateFilter: value }))
                }
                className="flex flex-col gap-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="text-xs">All Dates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="today_forward" id="today_forward" />
                  <Label htmlFor="today_forward" className="text-xs">Today Going Forward</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overdue" id="overdue" />
                  <Label htmlFor="overdue" className="text-xs">Overdue</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="this_week" id="this_week" />
                  <Label htmlFor="this_week" className="text-xs">This Week</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Task Type Filter */}
            <div className="space-y-2 flex-1">
              <Label className="text-xs font-medium">Task Type</Label>
              <Select
                value={filters.taskType?.[0] || "__all__"}
                onValueChange={(value) =>
                  setFilters((f) => ({ ...f, taskType: value === "__all__" ? [] : [value] }))
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Types</SelectItem>
                  {TASK_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2 flex-1">
              <Label className="text-xs font-medium">Status</Label>
              <Select
                value={filters.status?.[0] || "__all__"}
                onValueChange={(value) =>
                  setFilters((f) => ({ ...f, status: value === "__all__" ? [] : [value] }))
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Statuses</SelectItem>
                  {TASK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Table */}
          <div className="flex-1 overflow-auto border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="text-xs">Client</TableHead>
                  <TableHead className="text-xs">Task Type</TableHead>
                  <TableHead className="text-xs">Due date</TableHead>
                  <TableHead className="text-xs">Followup date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Advisor</TableHead>
                  <TableHead className="text-xs">Task Number</TableHead>
                  <TableHead className="text-xs">Assignee</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className={`hover:bg-muted/50 ${
                        selectedTaskIds.has(task.id) ? "bg-muted/30" : ""
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedTaskIds.has(task.id)}
                          onCheckedChange={() => handleToggleTask(task.id)}
                        />
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          {task.client_initials && (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {task.client_initials}
                            </div>
                          )}
                          {task.client_name || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{task.task_type}</TableCell>
                      <TableCell className="text-sm">{formatDate(task.due_date)}</TableCell>
                      <TableCell className="text-sm">{formatDate(task.follow_up_date)}</TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{task.advisor || "-"}</TableCell>
                      <TableCell className="text-sm font-mono">
                        Task-{task.task_number}
                      </TableCell>
                      <TableCell className="text-sm">{task.assignee || "-"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {tasks.length > 0
                ? `${(currentPage - 1) * pageSize + 1} to ${Math.min(
                    currentPage * pageSize,
                    totalCount
                  )} of ${totalCount}`
                : "0 results"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleLinkTasks}
            disabled={selectedTaskIds.size === 0}
            className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
          >
            Link Task{selectedTaskIds.size !== 1 ? "s" : ""} ({selectedTaskIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
