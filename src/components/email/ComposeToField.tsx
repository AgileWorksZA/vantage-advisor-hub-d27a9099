import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Filter, X } from "lucide-react";
import { ClientFilterDialog, FilterCondition } from "./ClientFilterDialog";

interface ComposeToFieldProps {
  recipientFilter: { conditions: FilterCondition[] };
  onFilterChange: (filter: { conditions: FilterCondition[] }) => void;
  recipientCount: number;
}

export const ComposeToField = ({
  recipientFilter,
  onFilterChange,
  recipientCount,
}: ComposeToFieldProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasFilters = recipientFilter.conditions.length > 0;

  const handleClearFilters = () => {
    onFilterChange({ conditions: [] });
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">To</Label>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={() => setDialogOpen(true)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          {hasFilters ? "Edit filters" : "Select recipients"}
        </Button>

        {hasFilters && (
          <>
            <Badge variant="secondary" className="gap-1">
              <Users className="w-3 h-3" />
              {recipientCount} recipient{recipientCount !== 1 ? "s" : ""} match
            </Badge>
            
            {recipientFilter.conditions.map((condition, index) => (
              <Badge key={index} variant="outline" className="gap-1">
                {condition.field} {condition.operator} "{condition.value}"
              </Badge>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-6 px-2"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </>
        )}

        {!hasFilters && (
          <span className="text-sm text-muted-foreground">
            No recipients selected. Click to add filters.
          </span>
        )}
      </div>

      <ClientFilterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        filter={recipientFilter}
        onFilterChange={onFilterChange}
      />
    </div>
  );
};
