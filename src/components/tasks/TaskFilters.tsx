import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Search, CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskFilters as TaskFiltersType } from "@/hooks/useTasksEnhanced";
import { useTaskTypes } from "@/hooks/useTaskTypes";

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const { taskTypes, taskStatuses, taskPriorities, taskCategories } = useTaskTypes();
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch });
  };

  const handleStatusChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, status: undefined });
    } else {
      onFiltersChange({ ...filters, status: [value] });
    }
  };

  const handlePriorityChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, priority: undefined });
    } else {
      onFiltersChange({ ...filters, priority: [value] });
    }
  };

  const handleTypeChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, taskType: undefined });
    } else {
      onFiltersChange({ ...filters, taskType: [value] });
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, category: undefined });
    } else {
      onFiltersChange({ ...filters, category: [value] });
    }
  };

  const handleDueDateChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dueDateTo: date?.toISOString().split("T")[0] });
  };

  const clearFilters = () => {
    setLocalSearch("");
    onFiltersChange({});
  };

  const hasActiveFilters = filters.search || filters.status || filters.priority || filters.taskType || filters.category || filters.dueDateTo;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks, clients, task number..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </form>

      {/* Status Filter */}
      <Select value={filters.status?.[0] || "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {taskStatuses.map((status) => (
            <SelectItem key={status.code} value={status.code}>
              {status.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select value={filters.priority?.[0] || "all"} onValueChange={handlePriorityChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          {taskPriorities.map((priority) => (
            <SelectItem key={priority.code} value={priority.code}>
              {priority.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select value={filters.taskType?.[0] || "all"} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {taskTypes.map((type) => (
            <SelectItem key={type.code} value={type.code}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Filter */}
      {taskCategories.length > 0 && (
        <Select value={filters.category?.[0] || "all"} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {taskCategories.map((cat) => (
              <SelectItem key={cat.code} value={cat.code}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Due Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[150px] justify-start text-left font-normal",
              !filters.dueDateTo && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dueDateTo ? format(new Date(filters.dueDateTo), "PPP") : "Due by"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dueDateTo ? new Date(filters.dueDateTo) : undefined}
            onSelect={handleDueDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
