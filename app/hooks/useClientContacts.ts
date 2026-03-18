import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientContact {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  job_title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  contact_type: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface ContactListItem {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  contactType: string;
}

const transformContactToListItem = (contact: ClientContact): ContactListItem => ({
  id: contact.id,
  name: contact.name,
  jobTitle: contact.job_title || "",
  company: contact.company || "",
  email: contact.email || "",
  phone: contact.phone || "",
  contactType: contact.contact_type || "Other",
});

export const useClientContacts = (clientId: string) => {
  const [contacts, setContacts] = useState<ContactListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!clientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("client_contacts")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("name", { ascending: true });

      if (fetchError) throw fetchError;

      const transformedContacts = (data || []).map(transformContactToListItem);
      setContacts(transformedContacts);
    } catch (err: any) {
      console.error("Error fetching contacts:", err);
      setError(err.message);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const createContact = async (contactData: Partial<ClientContact>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_contacts")
        .insert({
          user_id: user.id,
          client_id: clientId,
          name: contactData.name || "",
          job_title: contactData.job_title,
          company: contactData.company,
          email: contactData.email,
          phone: contactData.phone,
          notes: contactData.notes,
          contact_type: contactData.contact_type || "Other",
        })
        .select()
        .single();

      if (error) throw error;

      await fetchContacts();
      toast.success("Contact added successfully");
      return data;
    } catch (err: any) {
      console.error("Error creating contact:", err);
      toast.error(err.message || "Failed to add contact");
      return null;
    }
  };

  const updateContact = async (contactId: string, updates: Partial<ClientContact>) => {
    try {
      const { error } = await supabase
        .from("client_contacts")
        .update(updates)
        .eq("id", contactId);

      if (error) throw error;

      await fetchContacts();
      toast.success("Contact updated successfully");
      return true;
    } catch (err: any) {
      console.error("Error updating contact:", err);
      toast.error(err.message || "Failed to update contact");
      return false;
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from("client_contacts")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", contactId);

      if (error) throw error;

      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      toast.success("Contact removed successfully");
      return true;
    } catch (err: any) {
      console.error("Error deleting contact:", err);
      toast.error(err.message || "Failed to remove contact");
      return false;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  };
};
