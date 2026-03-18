import { useState } from "react";
import { useNavigate } from "react-router";
import { User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EnrichedOpportunityClient } from "@/hooks/useOpportunityClients";
import { TLHDashboard } from "@/components/tax-loss-harvesting/TLHDashboard";

const isValidUUID = (id: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

interface ClientOpportunityListProps {
  clients: EnrichedOpportunityClient[];
  formatCurrency: (value: number) => string;
  opportunityType?: string;
}

const ClientOpportunityList = ({ clients, formatCurrency, opportunityType }: ClientOpportunityListProps) => {
  const navigate = useNavigate();
  const [tlhDashboardOpen, setTlhDashboardOpen] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState<string | undefined>();
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();

  const handleClientClick = (client: EnrichedOpportunityClient) => {
    if (opportunityType === "tax-loss-harvesting") {
      setSelectedClientName(client.name);
      setSelectedClientId(client.dbClientId || client.id);
      setTlhDashboardOpen(true);
      return;
    }

    // Use dbClientId (real UUID from DB) if available, otherwise check the static id
    const navId = client.dbClientId || client.id;
    if (!isValidUUID(navId)) {
      toast.info("This is a demo client. Seed TLH data to link to real client records.");
      return;
    }
    navigate(`/clients/${navId}?from=ai-assistant`);
  };

  return (
    <>
      <div className="space-y-1 pt-2">
        <div className="text-xs text-white/50 uppercase tracking-wide mb-2 px-2">
          Client Details
        </div>
        <div className="space-y-1">
          {clients.map((client, index) => (
            <div
              key={client.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg transition-colors",
                "bg-white/5 hover:bg-white/10 border border-white/5"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleClientClick(client)}
                    className="text-sm font-medium text-white hover:text-amber-400 transition-colors truncate block text-left"
                  >
                    {client.name}
                  </button>
                  <p className="text-xs text-white/50 truncate">{client.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-medium text-amber-400">
                  {formatCurrency(client.value)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10"
                  onClick={() => handleClientClick(client)}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TLHDashboard
        open={tlhDashboardOpen}
        onOpenChange={setTlhDashboardOpen}
        clientName={selectedClientName}
        clientId={selectedClientId}
      />
    </>
  );
};

export default ClientOpportunityList;
