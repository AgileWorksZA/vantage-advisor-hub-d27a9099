import { useState, useMemo } from "react";
import { useClients } from "@/hooks/useClients";
import { Search, Phone, Mail, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import MobileClientProfile from "./MobileClientProfile";

const MobileClientsTab = () => {
  const { clients, loading } = useClients();
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const lower = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.client.toLowerCase().includes(lower) ||
        c.email.toLowerCase().includes(lower) ||
        c.phone.includes(search)
    );
  }, [clients, search]);

  if (selectedClientId) {
    return (
      <MobileClientProfile
        clientId={selectedClientId}
        onBack={() => setSelectedClientId(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {filtered.length} client{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Client List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No clients found
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((client) => {
              const initial = client.client.charAt(0).toUpperCase();
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-card border border-border active:bg-muted transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-[hsl(180,70%,45%)] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{client.client}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {client.phone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{client.phone}</span>
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{client.email}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileClientsTab;
