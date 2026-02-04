import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RotateCcw, Settings2, ChevronLeft, ChevronRight } from "lucide-react";

interface AdminSectionHeaderProps {
  title: string;
  itemCount?: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAdd?: () => void;
  onReset?: () => void;
  addButtonLabel?: string;
  customActions?: ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function AdminSectionHeader({
  title,
  itemCount,
  searchValue,
  onSearchChange,
  onAdd,
  onReset,
  addButtonLabel = "Add new",
  customActions,
  pagination,
}: AdminSectionHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          {itemCount !== undefined && (
            <span className="text-sm text-muted-foreground">
              ({itemCount} items)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {customActions}
          {onAdd && (
            <Button onClick={onAdd} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              {addButtonLabel}
            </Button>
          )}
          {onReset && (
            <Button variant="outline" size="icon" onClick={onReset} title="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" title="Settings">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
