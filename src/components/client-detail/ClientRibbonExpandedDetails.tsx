import { Copy, Phone, Mail, MapPin, Tag, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Client } from "@/types/client";

interface ClientRibbonExpandedDetailsProps {
  client: Client;
}

const copyToClipboard = (value: string, label: string) => {
  navigator.clipboard.writeText(value);
  toast({ title: `${label} copied`, description: value });
};

const formatAddress = (address: unknown): string => {
  if (!address || typeof address !== "object") return "No address on file";
  const a = address as Record<string, string>;
  const parts = [
    [a.street_nr, a.street].filter(Boolean).join(" "),
    a.suburb,
    [a.city, a.code].filter(Boolean).join(" "),
    a.province,
    a.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "No address on file";
};

const CopyableField = ({ value, label }: { value: string; label: string }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-sm">{value}</span>
    <Button
      variant="ghost"
      size="icon"
      className="h-5 w-5 shrink-0"
      onClick={() => copyToClipboard(value, label)}
    >
      <Copy className="w-3 h-3" />
    </Button>
  </div>
);

const ClientRibbonExpandedDetails = ({ client }: ClientRibbonExpandedDetailsProps) => {
  const cellNumber = client.cell_number;
  const workNumber = client.work_number;
  const email = client.email || client.work_email;

  return (
    <div className="border-t border-border/50 mt-2.5 pt-2.5">
      <div className="grid grid-cols-3 gap-x-8 gap-y-2">
        {/* Physical Address */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Physical Address
          </p>
          <p className="text-sm">{formatAddress(client.residential_address)}</p>
        </div>

        {/* Cellphone */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
            <Phone className="w-3 h-3" />
            Cellphone
          </p>
          {cellNumber ? (
            <CopyableField value={cellNumber} label="Cellphone" />
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
          {workNumber && (
            <div className="mt-0.5">
              <p className="text-xs text-muted-foreground">Work</p>
              <CopyableField value={workNumber} label="Work number" />
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
            <Mail className="w-3 h-3" />
            Email
          </p>
          {email ? (
            <CopyableField value={email} label="Email" />
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>

        {/* Category */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Category
          </p>
          <p className="text-sm capitalize">{client.client_type || "-"}</p>
        </div>

        {/* Tax Number */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
            <Hash className="w-3 h-3" />
            Tax Number
          </p>
          <p className="text-sm">{client.tax_number || "-"}</p>
        </div>
      </div>
    </div>
  );
};

export default ClientRibbonExpandedDetails;
