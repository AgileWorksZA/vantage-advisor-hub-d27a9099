import { Copy, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Client, getDisplayName, getInitials, calculateAge, formatBirthday } from "@/types/client";

interface ClientRibbonExpandedDetailsProps {
  client: Client;
  onEdit?: () => void;
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

const ClientRibbonExpandedDetails = ({ client, onEdit }: ClientRibbonExpandedDetailsProps) => {
  const displayName = getDisplayName(client);
  const initials = getInitials(client);
  const age = calculateAge(client.date_of_birth);
  const birthday = formatBirthday(client.date_of_birth);
  const cellNumber = client.cell_number;
  const workNumber = client.work_number;
  const email = client.email || client.work_email;

  const details = [
    { label: "Name", value: displayName },
    { label: "Title", value: client.title || "-" },
    { label: "Initials", value: client.initials || initials },
    { label: "Person type", value: client.person_type || "Individual" },
    { label: "ID Number", value: client.id_number || "-" },
    { label: "Country of issue", value: client.country_of_issue || "South Africa" },
    { label: "Gender", value: client.gender || "-" },
    { label: "Age", value: age.toString() },
    { label: "Birthday", value: birthday },
    { label: "Language", value: client.language || "English" },
    { label: "Tax number", value: client.tax_number || "-" },
    { label: "Cellphone", value: cellNumber || "-" },
    { label: "Work phone", value: workNumber || "-" },
    { label: "Email", value: email || "-" },
    { label: "Address", value: formatAddress(client.residential_address) },
    { label: "Category", value: client.client_type || "-" },
  ];

  return (
    <div className="border-t border-border/50 mt-2.5 pt-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Client Details</span>
        {onEdit && (
          <Button variant="ghost" size="sm" className="h-6 gap-1.5 text-xs" onClick={onEdit}>
            <Pencil className="w-3 h-3" />
            Edit
          </Button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-x-6 gap-y-1">
        {details.map((item) => (
          <div key={item.label} className="flex justify-between items-center py-0.5 border-b border-border/50 last:border-0">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            {(item.label === "Cellphone" || item.label === "Email") && item.value !== "-" ? (
              <CopyableField value={item.value} label={item.label} />
            ) : (
              <span className="text-sm font-medium truncate ml-2">{item.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientRibbonExpandedDetails;
