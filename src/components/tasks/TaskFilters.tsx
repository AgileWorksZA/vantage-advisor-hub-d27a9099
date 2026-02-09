import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { Search, CalendarIcon, X } from "lucide-react";
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

  const handleDueDateFromChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dueDateFrom: date?.toISOString().split("T")[0] });
  };

  const handleDueDateToChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dueDateTo: date?.toISOString().split("T")[0] });
  };

  const clearFilters = () => {
    setLocalSearch("");
    onFiltersChange({});
  };

  const statusOptions = taskStatuses.map((s) => ({ value: s.code, label: s.name }));
  const priorityOptions = taskPriorities.map((p) => ({ value: p.code, label: p.name }));
  const typeOptions = taskTypes.map((t) => ({ value: t.code, label: t.name }));
  const categoryOptions = taskCategories.map((c) => ({ value: c.code, label: c.name }));

  const removeFilterValue = (key: "status" | "priority" | "taskType" | "category", value: string) => {
    const current = filters[key] || [];
    const updated = current.filter((v) => v !== value);
    onFiltersChange({ ...filters, [key]: updated.length ? updated : undefined });
  };

  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status.length > 0) ||
    (filters.priority && filters.priority.length > 0) ||
    (filters.taskType && filters.taskType.length > 0) ||
    (filters.category && filters.category.length > 0) ||
    filters.dueDateFrom ||
    filters.dueDateTo;

  // Build filter tags
  const filterTags: { label: string; onRemove: () => void }[] = [];

  (filters.status || []).forEach((v) => {
    const name = statusOptions.find((o) => o.value === v)?.label || v;
    filterTags.push({ label: name, onRemove: () => removeFilterValue("status", v) });
  });
  (filters.priority || []).forEach((v) => {
    const name = priorityOptions.find((o) => o.value === v)?.label || v;
    filterTags.push({ label: name, onRemove: () => removeFilterValue("priority", v) });
  });
  (filters.taskType || []).forEach((v) => {
    const name = typeOptions.find((o) => o.value === v)?.label || v;
    filterTags.push({ label: name, onRemove: () => removeFilterValue("taskType", v) });
  });
  (filters.category || []).forEach((v) => {
    const name = categoryOptions.find((o) => o.value === v)?.label || v;
    filterTags.push({ label: name, onRemove: () => removeFilterValue("category", v) });
  });
  if (filters.dueDateFrom) {
    filterTags.push({
      label: `From: ${format(new Date(filters.dueDateFrom), "PPP")}`,
      onRemove: () => onFiltersChange({ ...filters, dueDateFrom: undefined }),
    });
  }
  if (filters.dueDateTo) {
    filterTags.push({
      label: `To: ${format(new Date(filters.dueDateTo), "PPP")}`,
      onRemove: () => onFiltersChange({ ...filters, dueDateTo: undefined }),
    });
  }

  return (
    <div className="space-y-2">
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

        {/* Status Multi-Select */}
        <MultiSelect
          options={statusOptions}
          selected={filters.status || []}
          onChange={(vals) => onFiltersChange({ ...filters, status: vals.length ? vals : undefined })}
          placeholder="Status"
          className="w-[160px]"
        />

        {/* Priority Multi-Select */}
        <MultiSelect
          options={priorityOptions}
          selected={filters.priority || []}
          onChange={(vals) => onFiltersChange({ ...filters, priority: vals.length ? vals : undefined })}
          placeholder="Priority"
          className="w-[160px]"
        />

        {/* Type Multi-Select */}
        <MultiSelect
          options={typeOptions}
          selected={filters.taskType || []}
          onChange={(vals) => onFiltersChange({ ...filters, taskType: vals.length ? vals : undefined })}
          placeholder="Type"
          className="w-[160px]"
        />

        {/* Category Multi-Select */}
        {categoryOptions.length > 0 && (
          <MultiSelect
            options={categoryOptions}
            selected={filters.category || []}
            onChange={(vals) => onFiltersChange({ ...filters, category: vals.length ? vals : undefined })}
            placeholder="Category"
            className="w-[160px]"
          />
        )}

        {/* Due From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !filters.dueDateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dueDateFrom ? format(new Date(filters.dueDateFrom), "PPP") : "Due from"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dueDateFrom ? new Date(filters.dueDateFrom) : undefined}
              onSelect={handleDueDateFromChange}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {/* Due To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !filters.dueDateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dueDateTo ? format(new Date(filters.dueDateTo), "PPP") : "Due to"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dueDateTo ? new Date(filters.dueDateTo) : undefined}
              onSelect={handleDueDateToChange}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Filter Tags Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-4">
          <span className="text-sm text-muted-foreground font-medium">Filtered by:</span>
          {filterTags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1">
              {tag.label}
              <button
                onClick={tag.onRemove}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:text-primary/80 font-medium ml-2"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
