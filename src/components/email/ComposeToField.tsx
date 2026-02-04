import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Filter, X, UserPlus } from "lucide-react";
import { ClientFilterDialog, FilterCondition } from "./ClientFilterDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClientListItem {
  id: string;
  name: string;
  email: string;
}

interface ComposeToFieldProps {
  recipientFilter: { conditions: FilterCondition[] };
  onFilterChange: (filter: { conditions: FilterCondition[] }) => void;
  recipientCount: number;
  // NEW: Direct client selection
  selectedClientIds?: string[];
  onSelectedClientIdsChange?: (ids: string[]) => void;
  allClients?: ClientListItem[];
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
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const hasFilters = recipientFilter.conditions.length > 0;
  const hasDirectClients = selectedClientIds.length > 0;

  const handleClearFilters = () => {
    onFilterChange({ conditions: [] });
  };

  const handleRemoveClient = (clientId: string) => {
    onSelectedClientIdsChange?.(selectedClientIds.filter((id) => id !== clientId));
  };

  const handleAddClient = (clientId: string) => {
    if (!selectedClientIds.includes(clientId)) {
      onSelectedClientIdsChange?.([...selectedClientIds, clientId]);
    }
    setClientPopoverOpen(false);
    setClientSearch("");
  };

  // Filter clients for the popover
  const filteredClients = allClients.filter((client) => {
    if (selectedClientIds.includes(client.id)) return false;
    if (!clientSearch) return true;
    const search = clientSearch.toLowerCase();
    return (
      client.name.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search)
    );
  });

  // Get selected client details
  const selectedClients = selectedClientIds
    .map((id) => allClients.find((c) => c.id === id))
    .filter(Boolean) as ClientListItem[];

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

        {/* Add client popover */}
        {onSelectedClientIdsChange && allClients.length > 0 && (
          <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="gap-1 h-7">
                <UserPlus className="w-3 h-3" />
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <Input
                placeholder="Search clients..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="mb-2"
              />
              <ScrollArea className="h-48">
                {filteredClients.length > 0 ? (
                  <div className="space-y-1">
                    {filteredClients.slice(0, 20).map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleAddClient(client.id)}
                        className="w-full text-left p-2 rounded hover:bg-muted text-sm"
                      >
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-muted-foreground">{client.email}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No clients found
                  </p>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
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
        {!hasFilters && !hasDirectClients && (
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
