import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpportunitySelectionBarProps {
  selectedCount: number;
  totalCount: number;
  totalValue: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onAddToProject: () => void;
  allSelected: boolean;
  formatCurrency: (value: number) => string;
}

const OpportunitySelectionBar = ({
  selectedCount,
  totalCount,
  totalValue,
  onSelectAll,
  onClearSelection,
  onAddToProject,
  allSelected,
  formatCurrency,
}: OpportunitySelectionBarProps) => {
  if (totalCount === 0) return null;

  return (
    <div
      className={cn(
        "glass-panel rounded-xl p-4 border border-white/10",
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
        "sticky top-20 z-10 bg-black/40 backdrop-blur-md"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Select All Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectAll();
              } else {
                onClearSelection();
              }
            }}
            className="border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <span className="text-sm text-white/70">
            {allSelected ? "Deselect All" : "Select All"} ({totalCount} opportunities)
          </span>
        </div>

        {/* Clear selection button */}
        {selectedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-white/60 hover:text-white hover:bg-white/10 h-8"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Selection summary and action */}
      <div className="flex items-center gap-4">
        {selectedCount > 0 && (
          <>
            <div className="text-sm">
              <span className="text-white/60">Selected: </span>
              <span className="text-white font-medium">{selectedCount} opportunities</span>
              <span className="text-white/40 mx-2">•</span>
              <span className="text-white/60">Value: </span>
              <span className="text-emerald-400 font-semibold">
                +{formatCurrency(totalValue)}
              </span>
            </div>

            <Button
              size="sm"
              onClick={onAddToProject}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add to Project
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default OpportunitySelectionBar;
