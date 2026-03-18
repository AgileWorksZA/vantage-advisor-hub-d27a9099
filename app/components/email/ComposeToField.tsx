import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Filter, X } from "lucide-react";
import { ClientFilterDialog, FilterCondition } from "./ClientFilterDialog";
import { ClientAutocompleteDropdown } from "@/components/clients/ClientAutocompleteDropdown";
import { ClientListItem } from "@/hooks/useClients";
import { toast } from "sonner";

interface ClientListItemLocal {
  id: string;
  name: string;
  email: string;
}

interface ComposeToFieldProps {
  recipientFilter: { conditions: FilterCondition[] };
  onFilterChange: (filter: { conditions: FilterCondition[] }) => void;
  recipientCount: number;
  // Direct client selection
  selectedClientIds?: string[];
  onSelectedClientIdsChange?: (ids: string[]) => void;
  allClients?: ClientListItemLocal[];
}

export const ComposeToField = ({
  recipientFilter,
  onFilterChange,
  recipientCount,
  selectedClientIds = [],
  onSelectedClientIdsChange,
  allClients = [],
}: ComposeToFieldProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasFilters = recipientFilter.conditions.length > 0;
  const hasDirectClients = selectedClientIds.length > 0;

  const handleClearFilters = () => {
    onFilterChange({ conditions: [] });
  };

  const handleRemoveClient = (clientId: string) => {
    onSelectedClientIdsChange?.(selectedClientIds.filter((id) => id !== clientId));
  };

  const handleClientSelect = (client: ClientListItem) => {
    if (!client.email) {
      toast.error("This client has no email address on file");
      return;
    }
    if (!selectedClientIds.includes(client.id)) {
      onSelectedClientIdsChange?.([...selectedClientIds, client.id]);
    }
    setClientSearch("");
    setShowDropdown(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get selected client details
  const selectedClients = selectedClientIds
    .map((id) => allClients.find((c) => c.id === id))
    .filter(Boolean) as ClientListItemLocal[];

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">To</Label>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Direct client badges */}
        {selectedClients.map((client) => (
          <Badge key={client.id} variant="default" className="gap-1 pl-2">
            {client.name}
            <button
              type="button"
              onClick={() => handleRemoveClient(client.id)}
              className="ml-1 hover:bg-primary-foreground/20 rounded p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}

        {/* Inline client search with autocomplete */}
        {onSelectedClientIdsChange && (
          <div className="relative" ref={containerRef}>
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setShowDropdown(e.target.value.length >= 2);
              }}
              onFocus={() => clientSearch.length >= 2 && setShowDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowDropdown(false);
              }}
              placeholder="Search clients..."
              className="h-7 px-2 text-sm bg-transparent border border-input rounded-md outline-none focus:ring-1 focus:ring-ring min-w-[160px]"
            />
            {showDropdown && (
              <ClientAutocompleteDropdown
                query={clientSearch}
                onSelect={handleClientSelect}
                excludeIds={selectedClientIds}
                className="w-72"
              />
            )}
          </div>
        )}

        {/* Filter button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1 h-7"
        >
          <Filter className="w-3 h-3" />
          {hasFilters ? "Edit filters" : "Add filter"}
        </Button>

        {/* Filter badges */}
        {hasFilters && (
          <>
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
              Clear filters
            </Button>
          </>
        )}

        {/* Recipient count */}
        {(hasFilters || hasDirectClients) && (
          <Badge variant="secondary" className="gap-1">
            <Users className="w-3 h-3" />
            {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
          </Badge>
        )}

        {/* Empty state */}
        {!hasFilters && !hasDirectClients && !clientSearch && (
          <span className="text-sm text-muted-foreground">
            No recipients selected
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
