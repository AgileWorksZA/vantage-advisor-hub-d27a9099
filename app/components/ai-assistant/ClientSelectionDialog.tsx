import { useState, useMemo } from "react";
import { Search, User, Plus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useClientOpportunityValues, ClientWithValue } from "@/hooks/useClientOpportunityValues";

interface ClientSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClients: (clients: ClientWithValue[]) => void;
  projectType: string;
  projectName: string;
  existingClientIds: string[];
  formatCurrency: (value: number) => string;
  isLoading?: boolean;
}

const ClientSelectionDialog = ({
  isOpen,
  onClose,
  onAddClients,
  projectType,
  projectName,
  existingClientIds,
  formatCurrency,
  isLoading = false,
}: ClientSelectionDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());

  const { clients, isLoading: clientsLoading } = useClientOpportunityValues(
    projectType,
    existingClientIds
  );

  // Filter clients by search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  // Calculate totals
  const selectedTotal = useMemo(() => {
    return clients
      .filter((c) => selectedClients.has(c.id))
      .reduce((acc, c) => acc + c.opportunityValue, 0);
  }, [clients, selectedClients]);

  const handleToggleClient = (clientId: string) => {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedClients.size === filteredClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filteredClients.map((c) => c.id)));
    }
  };

  const handleConfirm = () => {
    const selected = clients.filter((c) => selectedClients.has(c.id));
    onAddClients(selected);
    setSelectedClients(new Set());
    setSearchQuery("");
  };

  const handleClose = () => {
    setSelectedClients(new Set());
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Add Clients to Project</DialogTitle>
          <DialogDescription className="text-white/60">
            Select clients to add to "{projectName}". Tasks will be created automatically.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>

        {/* Select All */}
        {filteredClients.length > 0 && (
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <button
              onClick={handleSelectAll}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {selectedClients.size === filteredClients.length ? "Deselect All" : "Select All"}
            </button>
            <Badge variant="outline" className="text-white/60 border-white/20">
              {selectedClients.size} selected
            </Badge>
          </div>
        )}

        {/* Client List */}
        <ScrollArea className="h-[300px] pr-4">
          {clientsLoading ? (
            <div className="flex items-center justify-center h-full text-white/50">
              Loading clients...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50">
              <User className="w-8 h-8 mb-2 opacity-50" />
              <p>{searchQuery ? "No clients match your search" : "No eligible clients found"}</p>
              <p className="text-xs mt-1">Clients need portfolio value to show here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClients.map((client) => {
                const isSelected = selectedClients.has(client.id);
                return (
                  <div
                    key={client.id}
                    onClick={() => handleToggleClient(client.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                      isSelected
                        ? "bg-emerald-500/20 border border-emerald-500/30"
                        : "bg-white/5 hover:bg-white/10 border border-transparent"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleClient(client.id)}
                      className="border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{client.name}</p>
                      <p className="text-white/50 text-sm truncate">
                        Current: {formatCurrency(client.currentValue)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-medium">
                        +{formatCurrency(client.opportunityValue)}
                      </p>
                      <p className="text-white/40 text-xs">Opportunity</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer with totals */}
        <DialogFooter className="flex-col sm:flex-row gap-3 border-t border-white/10 pt-4">
          <div className="flex-1 text-left">
            <p className="text-white/60 text-sm">Total Opportunity Value</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatCurrency(selectedTotal)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedClients.size === 0 || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? (
                "Adding..."
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add {selectedClients.size} Client{selectedClients.size !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientSelectionDialog;
