import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Client {
  id: string;
  user_id: string;
  profile_state: string;
  profile_type: string;
  client_type: string;
  title: string | null;
  first_name: string;
  surname: string;
  initials: string | null;
  preferred_name: string | null;
  id_number: string | null;
  passport_number: string | null;
  country_of_issue: string | null;
  person_type: string | null;
  nationality: string | null;
  gender: string | null;
  date_of_birth: string | null;
  language: string | null;
  race: string | null;
  religion: string | null;
  email: string | null;
  work_email: string | null;
  cell_number: string | null;
  work_number: string | null;
  work_extension: string | null;
  home_number: string | null;
  fax_number: string | null;
  website: string | null;
  skype: string | null;
  facebook: string | null;
  linkedin: string | null;
  twitter: string | null;
  youtube: string | null;
  is_smoker: boolean;
  is_professional: boolean;
  profession: string | null;
  occupation: string | null;
  industry: string | null;
  employer: string | null;
  disability_type: string | null;
  is_hybrid_client: boolean;
  tax_number: string | null;
  tax_resident_country: string | null;
  residential_address: unknown;
  postal_address: unknown;
  preferred_contact: string | null;
  preferred_phone: string | null;
  preferred_email: string | null;
  otp_delivery_method: string | null;
  advisor: string | null;
  wealth_manager: string | null;
  relationship: string | null;
  rating: number | null;
  sports_interests: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ClientListItem {
  id: string;
  profileState: string;
  profileType: string;
  clientType: string;
  client: string; // Formatted as "Surname, I (FirstName)"
  title: string;
  identification: string;
  age: number | null;
  phone: string;
  email: string;
  advisor: string;
  wealthManager: string;
  language: string;
  dateCreated: string;
}

// Calculate age from date of birth
const calculateAge = (dateOfBirth: string | null): number | null => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

// Transform database client to list item format
const transformClientToListItem = (client: Client): ClientListItem => {
  const initial = client.first_name?.charAt(0).toUpperCase() || "";
  const preferredName = client.preferred_name || client.first_name;
  const clientName = `${client.surname}, ${initial} (${preferredName})`;

  return {
    id: client.id,
    profileState: client.profile_state,
    profileType: client.profile_type,
    clientType: client.client_type,
    client: clientName,
    title: client.title || "",
    identification: client.id_number || client.passport_number || "",
    age: calculateAge(client.date_of_birth),
    phone: client.cell_number || client.work_number || "",
    email: client.email || "",
    advisor: client.advisor || "",
    wealthManager: client.wealth_manager || "",
    language: client.language || "",
    dateCreated: formatDate(client.created_at),
  };
};

export const useClients = () => {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const transformedClients = (data || []).map(transformClientToListItem);
      setClients(transformedClients);
    } catch (err: any) {
      console.error("Error fetching clients:", err);
      setError(err.message);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteClient = async (clientId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId);

      if (deleteError) throw deleteError;

      setClients((prev) => prev.filter((c) => c.id !== clientId));
      toast.success("Client deleted successfully");
      return true;
    } catch (err: any) {
      console.error("Error deleting client:", err);
      toast.error(err.message || "Failed to delete client");
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    deleteClient,
  };
};

// Generate client ID for routing (consistent with existing logic)
export const generateClientId = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z]/g, "-").replace(/-+/g, "-").slice(0, 20);
};
