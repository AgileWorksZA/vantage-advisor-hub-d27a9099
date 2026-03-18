import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Phone, Mail, MapPin, Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileClientProfileProps {
  clientId: string;
  onBack: () => void;
}

interface ClientProfile {
  id: string;
  first_name: string;
  surname: string;
  title: string | null;
  email: string | null;
  cell_number: string | null;
  work_number: string | null;
  date_of_birth: string | null;
  occupation: string | null;
  employer: string | null;
  advisor: string | null;
  profile_state: string;
  client_type: string;
  id_number: string | null;
}

const MobileClientProfile = ({ clientId, onBack }: MobileClientProfileProps) => {
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("clients")
        .select("id, first_name, surname, title, email, cell_number, work_number, date_of_birth, occupation, employer, advisor, profile_state, client_type, id_number")
        .eq("id", clientId)
        .single();

      setClient(data);
      setLoading(false);
    };
    fetchClient();
  }, [clientId]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <p className="text-center text-muted-foreground">Client not found</p>
      </div>
    );
  }

  const initial = client.first_name.charAt(0).toUpperCase();
  const fullName = `${client.title ? client.title + " " : ""}${client.first_name} ${client.surname}`;

  return (
    <div className="p-4 space-y-4">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Clients
      </Button>

      {/* Profile Header */}
      <div className="flex flex-col items-center text-center py-4 rounded-lg bg-card border border-border">
        <div className="h-16 w-16 rounded-full bg-[hsl(180,70%,45%)] flex items-center justify-center text-white font-bold text-2xl mb-3">
          {initial}
        </div>
        <h2 className="text-lg font-bold text-foreground">{fullName}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground mt-1">
          {client.profile_state} • {client.client_type}
        </span>
      </div>

      {/* Contact Info */}
      <div className="rounded-lg bg-card border border-border divide-y divide-border">
        {client.cell_number && (
          <a href={`tel:${client.cell_number}`} className="flex items-center gap-3 p-3 active:bg-muted">
            <Phone className="h-4 w-4 text-[hsl(180,70%,45%)]" />
            <div>
              <p className="text-xs text-muted-foreground">Mobile</p>
              <p className="text-sm text-foreground">{client.cell_number}</p>
            </div>
          </a>
        )}
        {client.work_number && (
          <a href={`tel:${client.work_number}`} className="flex items-center gap-3 p-3 active:bg-muted">
            <Phone className="h-4 w-4 text-[hsl(var(--brand-blue))]" />
            <div>
              <p className="text-xs text-muted-foreground">Work</p>
              <p className="text-sm text-foreground">{client.work_number}</p>
            </div>
          </a>
        )}
        {client.email && (
          <a href={`mailto:${client.email}`} className="flex items-center gap-3 p-3 active:bg-muted">
            <Mail className="h-4 w-4 text-[hsl(var(--brand-orange))]" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm text-foreground">{client.email}</p>
            </div>
          </a>
        )}
      </div>

      {/* Details */}
      <div className="rounded-lg bg-card border border-border divide-y divide-border">
        {client.occupation && (
          <div className="flex items-center gap-3 p-3">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Occupation</p>
              <p className="text-sm text-foreground">{client.occupation}</p>
            </div>
          </div>
        )}
        {client.employer && (
          <div className="flex items-center gap-3 p-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Employer</p>
              <p className="text-sm text-foreground">{client.employer}</p>
            </div>
          </div>
        )}
        {client.advisor && (
          <div className="flex items-center gap-3 p-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Advisor</p>
              <p className="text-sm text-foreground">{client.advisor}</p>
            </div>
          </div>
        )}
        {client.id_number && (
          <div className="flex items-center gap-3 p-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">ID Number</p>
              <p className="text-sm text-foreground">{client.id_number}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileClientProfile;
