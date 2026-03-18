import { Tables } from "@/integrations/supabase/types";

// Re-export the database client type for use throughout the app
export type Client = Tables<"clients">;

// Helper to calculate age from date of birth
export const calculateAge = (dateOfBirth: string | null): number => {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper to format birthday display
export const formatBirthday = (dateOfBirth: string | null): string => {
  if (!dateOfBirth) return "-";
  const date = new Date(dateOfBirth);
  return date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
};

// Helper to get display name (Surname, FirstName (PreferredName))
export const getDisplayName = (client: Client): string => {
  const preferredPart = client.preferred_name ? ` (${client.preferred_name})` : "";
  return `${client.surname}, ${client.first_name}${preferredPart}`;
};

// Helper to get initials
export const getInitials = (client: Client): string => {
  if (client.initials) return client.initials;
  const firstInitial = client.first_name?.[0] || "";
  const surnameInitial = client.surname?.[0] || "";
  return `${firstInitial}${surnameInitial}`.toUpperCase();
};
