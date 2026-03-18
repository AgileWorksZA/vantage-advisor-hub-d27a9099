import { useState, useEffect, useRef, useMemo } from "react";
import { useClients, ClientListItem } from "@/hooks/useClients";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRegion } from "@/contexts/RegionContext";

interface ClientAutocompleteDropdownProps {
  query: string;
  onSelect: (client: ClientListItem) => void;
  excludeIds?: string[];
  className?: string;
  maxResults?: number;
}

// Generate a deterministic color from a name string
const getAvatarColor = (name: string): string => {
  const colors = [
    "hsl(180, 50%, 35%)",
    "hsl(220, 50%, 45%)",
    "hsl(340, 50%, 45%)",
    "hsl(30, 60%, 45%)",
    "hsl(260, 45%, 50%)",
    "hsl(150, 45%, 40%)",
    "hsl(10, 55%, 45%)",
    "hsl(200, 55%, 40%)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get initials for avatar
const getInitials = (client: ClientListItem): string => {
  const parts = client.client.split(",");
  const surname = parts[0]?.trim() || "";
  // Extract first name from "Surname, I (FirstName)" format
  const match = client.client.match(/\(([^)]+)\)/);
  const firstName = match ? match[1] : "";
  const surnameInitial = surname[0] || "";
  const firstInitial = firstName[0] || "";
  return `${firstInitial}${surnameInitial}`.toUpperCase();
};

export const ClientAutocompleteDropdown = ({
  query,
  onSelect,
  excludeIds = [],
  className = "",
  maxResults = 10,
}: ClientAutocompleteDropdownProps) => {
  const { clients } = useClients();
  const { selectedAdvisors, regionalData } = useRegion();
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Derive selected advisor full names from initials
  const selectedAdvisorNames = useMemo(() => {
    return regionalData.advisors
      .filter((a) => selectedAdvisors.includes(a.initials))
      .map((a) => a.name);
  }, [regionalData.advisors, selectedAdvisors]);

  // Filter clients based on query and selected advisors
  const filteredClients = useMemo(() => {
    if (query.length < 2) return [];
    const search = query.toLowerCase();
    return clients
      .filter((client) => {
        if (excludeIds.includes(client.id)) return false;
        // Advisor filter
        if (selectedAdvisorNames.length > 0) {
          if (!client.advisor || !selectedAdvisorNames.includes(client.advisor)) return false;
        }
        return (
          client.client.toLowerCase().includes(search) ||
          client.identification.toLowerCase().includes(search) ||
          client.email.toLowerCase().includes(search)
        );
      })
      .slice(0, maxResults + 1);
  }, [clients, query, excludeIds, maxResults, selectedAdvisorNames]);

  const displayClients = filteredClients.slice(0, maxResults);
  const hasMore = filteredClients.length > maxResults;

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Keyboard navigation handler (to be called from parent)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (query.length < 2 || displayClients.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < displayClients.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : displayClients.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (displayClients[highlightedIndex]) {
          onSelect(displayClients[highlightedIndex]);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [query, displayClients, highlightedIndex, onSelect]);

  // Don't render if query is too short or no results
  if (query.length < 2) return null;

  return (
    <div
      ref={listRef}
      className={`absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden ${className}`}
    >
      {displayClients.length === 0 ? (
        <div className="px-3 py-4 text-sm text-muted-foreground text-center">
          No clients found
        </div>
      ) : (
        <ScrollArea className="max-h-[320px]">
          <div className="py-1">
            {displayClients.map((client, index) => {
              const initials = getInitials(client);
              const avatarColor = getAvatarColor(client.client);

              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => onSelect(client)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    index === highlightedIndex
                      ? "bg-muted/70"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials}
                    </div>
                    {/* Green status dot */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>

                  {/* Client info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {client.client}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {client.identification || "No identification number has been found"}
                    </div>
                  </div>
                </button>
              );
            })}
            {hasMore && (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t border-border">
                Refine your search to see more results
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
