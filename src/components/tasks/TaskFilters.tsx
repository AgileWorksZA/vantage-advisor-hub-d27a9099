import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { Search, CalendarIcon, X, Save, BookmarkCheck, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskFilters as TaskFiltersType } from "@/hooks/useTasksEnhanced";
import { useTaskTypes } from "@/hooks/useTaskTypes";
import { useSavedTaskFilters } from "@/hooks/useSavedTaskFilters";
import type { DateRange } from "react-day-picker";

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const { taskTypes, taskStatuses, taskPriorities, taskCategories } = useTaskTypes();
  const { savedFilters, saveFilter, deleteFilter } = useSavedTaskFilters();
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      dueDateFrom: range?.from?.toISOString().split("T")[0],
      dueDateTo: range?.to?.toISOString().split("T")[0],
    });
  };

  const clearFilters = () => {
    setLocalSearch("");
    onFiltersChange({});
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    saveFilter(filterName.trim(), filters);
    setFilterName("");
    setSaveDialogOpen(false);
  };

  const handleLoadFilter = (savedFilter: typeof savedFilters[0]) => {
    setLocalSearch(savedFilter.filters.search || "");
    onFiltersChange(savedFilter.filters);
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
    (filters.slaStatus && filters.slaStatus.length > 0) ||
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
  (filters.slaStatus || []).forEach((v) => {
    filterTags.push({
      label: `SLA: ${v}`,
      onRemove: () => {
        const current = filters.slaStatus || [];
        const updated = current.filter((s) => s !== v);
        onFiltersChange({ ...filters, slaStatus: updated.length ? updated : undefined });
      },
    });
  });
  if (filters.dueDateFrom || filters.dueDateTo) {
    const fromStr = filters.dueDateFrom ? format(new Date(filters.dueDateFrom), "MMM d, yyyy") : "";
    const toStr = filters.dueDateTo ? format(new Date(filters.dueDateTo), "MMM d, yyyy") : "";
    const label = fromStr && toStr ? `${fromStr} – ${toStr}` : fromStr ? `From ${fromStr}` : `To ${toStr}`;
    filterTags.push({
      label,
      onRemove: () => onFiltersChange({ ...filters, dueDateFrom: undefined, dueDateTo: undefined }),
    });
  }

  // Date range for calendar
  const dateRange: DateRange | undefined =
    filters.dueDateFrom || filters.dueDateTo
      ? {
          from: filters.dueDateFrom ? new Date(filters.dueDateFrom) : undefined,
          to: filters.dueDateTo ? new Date(filters.dueDateTo) : undefined,
        }
      : undefined;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
        {/* Saved Filters Dropdown */}
        {savedFilters.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <BookmarkCheck className="h-4 w-4" />
                Saved Views
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[220px]">
              {savedFilters.map((sf) => (
                <DropdownMenuItem key={sf.id} className="flex items-center justify-between gap-2">
                  <span
                    className="flex-1 truncate cursor-pointer"
                    onClick={() => handleLoadFilter(sf)}
                  >
                    {sf.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFilter(sf.id);
                    }}
                    className="text-muted-foreground hover:text-destructive p-0.5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[220px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM d")} – {format(dateRange.to, "MMM d, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM d, yyyy")
                )
              ) : (
                "Due Date"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
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
          <DropdownMenuSeparator className="h-4 w-px bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-sm h-7"
            onClick={() => setSaveDialogOpen(true)}
          >
            <Save className="h-3.5 w-3.5" />
            Save Filter
          </Button>
        </div>
      )}

      {/* Save Filter Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Save Filter View</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Filter name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveFilter()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFilter} disabled={!filterName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
