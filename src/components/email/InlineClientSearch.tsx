import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClients } from "@/hooks/useClients";
import { LinkedClient } from "@/hooks/useEmailDetail";

interface InlineClientSearchProps {
  selectedClients: LinkedClient[];
  onAddClient: (client: LinkedClient) => void;
  excludeClientIds?: string[];
}

export const InlineClientSearch = ({
  selectedClients,
  onAddClient,
  excludeClientIds = [],
}: InlineClientSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { clients, loading } = useClients();

  // Filter clients based on search and exclude already selected
  const filteredClients = useMemo(() => {
    const excludeIds = new Set([
      ...selectedClients.map((c) => c.id),
      ...excludeClientIds,
    ]);

    return clients.filter((client) => {
      if (excludeIds.has(client.id)) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        client.client.toLowerCase().includes(query) ||
        client.identification?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query)
      );
    });
  }, [clients, selectedClients, excludeClientIds, searchQuery]);

  const handleSelectClient = (client: (typeof clients)[0]) => {
    // Parse client name which is in format "Surname, I (FirstName)"
    const nameParts = client.client.match(/^([^,]+),\s*(\w)\s*\((.+)\)$/);
    const surname = nameParts?.[1] || client.client;
    const firstInitial = nameParts?.[2] || "";
    const firstName = nameParts?.[3] || "";

    const linkedClient: LinkedClient = {
      id: client.id,
      first_name: firstName,
      surname: surname,
      initials: firstInitial,
      email: client.email || null,
      preferred_name: firstName,
      id_number: client.identification || null,
    };

    onAddClient(linkedClient);
    setSearchQuery("");
    setOpen(false);
  };

  const getInitials = (clientName: string): string => {
    const nameParts = clientName.match(/^([^,]+),\s*(\w)/);
    if (nameParts) {
      return `${nameParts[2]}${nameParts[1][0]}`.toUpperCase();
    }
    return clientName.substring(0, 2).toUpperCase();
  };

  // Generate consistent color for avatar based on name
  const getAvatarColor = (name: string): string => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
      "bg-indigo-500",
      "bg-red-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-xs h-8">
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients by name, ID, or email..."
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="max-h-72">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading clients...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? "No clients match your search" : "No clients available"}
            </div>
          ) : (
            <div className="py-1">
              {filteredClients.slice(0, 10).map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                >
                  {/* Avatar with initials */}
                  <div className="relative">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(
                        client.client
                      )}`}
                    >
                      {getInitials(client.client)}
                    </div>
                    {/* Green status dot */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                  </div>

                  {/* Client info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {client.client}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {client.identification || "No identification number found"}
                    </div>
                  </div>
                </button>
              ))}

              {filteredClients.length > 10 && (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t border-border">
                  Showing 10 of {filteredClients.length} results. Refine your search for more specific results.
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
