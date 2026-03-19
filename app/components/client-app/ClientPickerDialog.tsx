import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { kapable } from "@/integrations/kapable/client";

interface SelectedClient {
  id: string;
  first_name: string;
  surname: string;
  email: string | null;
}

interface ClientPickerDialogProps {
  onSelect: (client: SelectedClient) => void;
}

const ClientPickerDialog = ({ onSelect }: ClientPickerDialogProps) => {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<SelectedClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await kapable
        .from("clients")
        .select("*")
        .order("surname", { ascending: true })
        .limit(100);
      setClients((data as SelectedClient[]) || []);
      setLoading(false);
    };
    fetchClients();
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.surname.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col">
      <div className="px-4 pt-6 pb-3">
        <h2 className="text-lg font-bold text-foreground mb-1">Select a Client</h2>
        <p className="text-xs text-muted-foreground mb-3">Choose a client to view their experience</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No clients found</div>
        ) : (
          filtered.map((client) => (
            <button
              key={client.id}
              onClick={() => onSelect(client)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-[hsl(220,60%,50%)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {client.first_name.charAt(0)}{client.surname.charAt(0)}
              </div>
              <div className="text-left min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{client.first_name} {client.surname}</div>
                {client.email && <div className="text-xs text-muted-foreground truncate">{client.email}</div>}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientPickerDialog;
