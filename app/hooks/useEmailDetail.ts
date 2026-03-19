import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";

export interface EmailAttachment {
  id: string;
  email_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  content_type: string;
  created_at: string;
}

export interface EmailDetail {
  id: string;
  user_id: string;
  client_id: string | null;
  folder: string;
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
}

export interface RelatedEmail {
  id: string;
  subject: string | null;
  from_address: string;
  received_at: string | null;
  body_preview: string | null;
  direction: string;
}

export interface LinkedClient {
  id: string;
  first_name: string;
  surname: string;
  initials: string | null;
  email: string | null;
  preferred_name?: string | null;
  id_number?: string | null;
}

export const useEmailDetail = (emailId: string | null) => {
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [relatedEmails, setRelatedEmails] = useState<RelatedEmail[]>([]);
  const [linkedClients, setLinkedClients] = useState<LinkedClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmailDetail = useCallback(async () => {
    if (!emailId) {
      setEmail(null);
      setAttachments([]);
      setRelatedEmails([]);
      setLinkedClients([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch email detail
      const { data: emailData, error: emailError } = await kapable
        .from("emails")
        .select("*")
        .eq("id", emailId)
        .single();

      if (emailError) throw emailError;
      
      // Cast to EmailDetail type
      const typedEmail: EmailDetail = {
        ...emailData,
        to_addresses: emailData.to_addresses as string[] || [],
        cc_addresses: emailData.cc_addresses as string[] || [],
      };
      
      setEmail(typedEmail);

      // Mark as read if not already
      if (!emailData.is_read) {
        await kapable
          .from("emails")
          .update({ is_read: true })
          .eq("id", emailId);
      }

      // Fetch attachments
      const { data: attachmentData } = await kapable
        .from("email_attachments")
        .select("*")
        .eq("email_id", emailId);

      setAttachments((attachmentData as EmailAttachment[]) || []);

      // Fetch linked clients via email_clients junction table
      const { data: emailClientsData } = await kapable
        .from("email_clients")
        .select("*")
        .eq("email_id", emailId);

      if (emailClientsData && emailClientsData.length > 0) {
        const clientIds = emailClientsData.map((ec) => ec.client_id);
        const { data: clientsData } = await kapable
          .from("clients")
          .select("*")
          .in("id", clientIds);

        setLinkedClients((clientsData as LinkedClient[]) || []);
      } else {
        // Fallback: if email has client_id directly
        if (emailData.client_id) {
          const { data: clientData } = await kapable
            .from("clients")
            .select("*")
            .eq("id", emailData.client_id)
            .single();

          setLinkedClients(clientData ? [clientData as LinkedClient] : []);
        } else {
          setLinkedClients([]);
        }
      }

      // Fetch related emails (same thread based on subject)
      if (emailData.subject) {
        // Get base subject (remove RE:, FW: prefixes)
        const baseSubject = emailData.subject
          .replace(/^(RE:|FW:|Fwd:)\s*/gi, "")
          .trim();

        const { data: relatedData } = await kapable
          .from("emails")
          .select("*")
          .neq("id", emailId)
          .or(`subject.ilike.%${baseSubject}%`)
          .order("received_at", { ascending: true })
          .limit(10);

        setRelatedEmails((relatedData as RelatedEmail[]) || []);
      }
    } catch (err: any) {
      console.error("Error fetching email detail:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [emailId]);

  useEffect(() => {
    fetchEmailDetail();
  }, [fetchEmailDetail]);

  return {
    email,
    attachments,
    relatedEmails,
    linkedClients,
    loading,
    error,
    refetch: fetchEmailDetail,
  };
};
