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

export interface EmailListItem {
  id: string;
  from: string;
  subject: string;
  receivedOn: string;
  clients: string;
  hasAttachment: boolean;
  isRead: boolean;
  folder: Email["folder"];
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const transformEmailToListItem = (email: Email): EmailListItem => ({
  id: email.id,
  from: email.from_address,
  subject: email.subject || "(No Subject)",
  receivedOn: formatDate(email.received_at || email.created_at),
  clients: email.client_name || "",
  hasAttachment: email.has_attachments,
  isRead: email.is_read,
  folder: email.folder,
});

export const useEmails = (folder?: Email["folder"]) => {
  const [emails, setEmails] = useState<EmailListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("emails")
        .select(`
          *,
          clients!emails_client_id_fkey(first_name, surname)
        `)
        .eq("is_deleted", false)
        .order("received_at", { ascending: false });

      if (folder) {
        query = query.eq("folder", folder);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const transformedEmails = (data || []).map((email: any) => ({
        ...email,
        client_name: email.clients 
          ? `${email.clients.surname}, ${email.clients.first_name?.charAt(0)} (${email.clients.first_name})`
          : "",
      })).map(transformEmailToListItem);

      setEmails(transformedEmails);

      // Get folder counts
      const { data: countData } = await supabase
        .from("emails")
        .select("folder")
        .eq("is_deleted", false);

      if (countData) {
        const counts: Record<string, number> = {};
        countData.forEach((e: any) => {
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
    }
  }, [folder]);

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
    error,
    folderCounts,
    refetch: fetchEmails,
    createEmail,
    updateEmail,
    moveToFolder,
    markAsRead,
    deleteEmail,
  };
};
