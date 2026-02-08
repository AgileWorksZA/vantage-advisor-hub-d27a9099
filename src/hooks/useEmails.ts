import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Email {
  id: string;
  user_id: string;
  client_id: string | null;
  folder: "Task Pool" | "Inbox" | "Draft" | "Sent" | "Queue" | "Failed" | "Archived";
  direction: string;
  from_address: string;
  to_addresses: string[];
  cc_addresses: string[];
  subject: string | null;
  body_preview: string | null;
  body_html: string | null;
  has_attachments: boolean;
  sent_at: string | null;
  received_at: string | null;
  is_read: boolean;
  status: string | null;
  external_id: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Joined data
  client_name?: string;
}

export interface MatchedClient {
  id: string;
  name: string;
}

export interface EmailListItem {
  id: string;
  from: string;
  subject: string;
  receivedOn: string;
  clients: MatchedClient[];
  clientAdvisor?: string;
  clientCountry?: string;
  hasAttachment: boolean;
  isRead: boolean;
  folder: Email["folder"];
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${day}/${month}/${year} ${hour12}:${minutes} ${ampm}`;
};

interface ClientRecord {
  id: string;
  first_name: string;
  surname: string;
  preferred_name: string | null;
  email: string | null;
  work_email: string | null;
  advisor: string | null;
  country_of_issue: string | null;
}

// Match sender email against clients database
const matchClientsForEmail = (fromAddress: string, clients: ClientRecord[]): MatchedClient[] => {
  if (!fromAddress || !clients.length) return [];
  
  const emailLower = fromAddress.toLowerCase();
  
  return clients
    .filter((client) => {
      const clientEmail = client.email?.toLowerCase() || "";
      const workEmail = client.work_email?.toLowerCase() || "";
      return clientEmail === emailLower || workEmail === emailLower;
    })
    .map((client) => ({
      id: client.id,
      name: `${client.surname}, ${client.first_name?.charAt(0) || ""} (${client.preferred_name || client.first_name})`,
    }));
};

export const useEmails = (folder?: Email["folder"] | null) => {
  const [emails, setEmails] = useState<EmailListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [allClients, setAllClients] = useState<ClientRecord[]>([]);

  // Fetch all clients for email matching
  const fetchClients = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("clients")
        .select("id, first_name, surname, preferred_name, email, work_email, advisor, country_of_issue");
      
      setAllClients((data as ClientRecord[]) || []);
    } catch (err) {
      console.error("Error fetching clients for matching:", err);
    }
  }, []);

  const fetchEmails = useCallback(async (showFetchingSpinner = false) => {
    // Skip fetch if folder is not yet determined
    if (folder === null || folder === undefined) {
      setLoading(true);
      return;
    }

    if (showFetchingSpinner) {
      setIsFetching(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Fetch clients if not loaded
      if (allClients.length === 0) {
        await fetchClients();
      }
      
      let query = supabase
        .from("emails")
        .select("*")
        .eq("is_deleted", false)
        .order("received_at", { ascending: false });

      query = query.eq("folder", folder);

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Get latest clients for matching
      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, first_name, surname, preferred_name, email, work_email, advisor, country_of_issue");
      
      const clientsList = (clientsData as ClientRecord[]) || [];

      const transformedEmails: EmailListItem[] = (data || []).map((email: any) => {
        // Try matching by from_address first
        let matchedClients = matchClientsForEmail(email.from_address, clientsList);
        let resolvedClient: ClientRecord | null = null;

        // If no match by from_address, try matching by client_id (for outbound emails)
        if (matchedClients.length === 0 && email.client_id) {
          const clientById = clientsList.find(c => c.id === email.client_id);
          if (clientById) {
            matchedClients = [{
              id: clientById.id,
              name: `${clientById.surname}, ${clientById.first_name?.charAt(0) || ""} (${clientById.preferred_name || clientById.first_name})`,
            }];
            resolvedClient = clientById;
          }
        }

        // Get the first matched client record
        if (!resolvedClient && matchedClients.length > 0) {
          resolvedClient = clientsList.find(c => c.id === matchedClients[0].id) || null;
        }
        
        return {
          id: email.id,
          from: email.from_address,
          subject: email.subject || "(No Subject)",
          receivedOn: formatDate(email.received_at || email.created_at),
          clients: matchedClients,
          clientAdvisor: resolvedClient?.advisor || undefined,
          clientCountry: resolvedClient?.country_of_issue || undefined,
          hasAttachment: email.has_attachments,
          isRead: email.is_read,
          folder: email.folder,
        };
      });

      setEmails(transformedEmails);

      // Get folder counts
      const { data: countData } = await supabase
        .from("emails")
        .select("folder")
        .eq("is_deleted", false);

      if (countData) {
        const counts: Record<string, number> = {};
        countData.forEach((e: { folder: string }) => {
          counts[e.folder] = (counts[e.folder] || 0) + 1;
        });
        setFolderCounts(counts);
      }
    } catch (err: any) {
      console.error("Error fetching emails:", err);
      setError(err.message);
      toast.error("Failed to load emails");
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [folder, allClients.length, fetchClients]);

  // Trigger fetch with spinner (for refresh button)
  const triggerFetch = useCallback(() => {
    fetchEmails(true);
  }, [fetchEmails]);

  const createEmail = async (emailData: Partial<Email>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("emails")
        .insert({
          user_id: user.id,
          folder: emailData.folder || "Draft",
          direction: emailData.direction || "Outbound",
          from_address: emailData.from_address || user.email || "",
          to_addresses: emailData.to_addresses || [],
          cc_addresses: emailData.cc_addresses || [],
          subject: emailData.subject,
          body_preview: emailData.body_preview,
          body_html: emailData.body_html,
          has_attachments: emailData.has_attachments || false,
          client_id: emailData.client_id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchEmails();
      toast.success("Email saved successfully");
      return data;
    } catch (err: any) {
      console.error("Error creating email:", err);
      toast.error(err.message || "Failed to save email");
      return null;
    }
  };

  const updateEmail = async (emailId: string, updates: Partial<Email>) => {
    try {
      const { error } = await supabase
        .from("emails")
        .update(updates)
        .eq("id", emailId);

      if (error) throw error;

      await fetchEmails();
      return true;
    } catch (err: any) {
      console.error("Error updating email:", err);
      toast.error(err.message || "Failed to update email");
      return false;
    }
  };

  const moveToFolder = async (emailIds: string[], targetFolder: Email["folder"]) => {
    try {
      const { error } = await supabase
        .from("emails")
        .update({ folder: targetFolder })
        .in("id", emailIds);

      if (error) throw error;

      await fetchEmails();
      toast.success(`Moved ${emailIds.length} email(s) to ${targetFolder}`);
      return true;
    } catch (err: any) {
      console.error("Error moving emails:", err);
      toast.error(err.message || "Failed to move emails");
      return false;
    }
  };

  const markAsRead = async (emailIds: string[], isRead: boolean = true) => {
    try {
      const { error } = await supabase
        .from("emails")
        .update({ is_read: isRead })
        .in("id", emailIds);

      if (error) throw error;

      await fetchEmails();
      return true;
    } catch (err: any) {
      console.error("Error updating read status:", err);
      return false;
    }
  };

  const deleteEmail = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from("emails")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", emailId);

      if (error) throw error;

      setEmails((prev) => prev.filter((e) => e.id !== emailId));
      toast.success("Email deleted");
      return true;
    } catch (err: any) {
      console.error("Error deleting email:", err);
      toast.error(err.message || "Failed to delete email");
      return false;
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  return {
    emails,
    loading,
    isFetching,
    error,
    folderCounts,
    refetch: fetchEmails,
    triggerFetch,
    createEmail,
    updateEmail,
    moveToFolder,
    markAsRead,
    deleteEmail,
  };
};
