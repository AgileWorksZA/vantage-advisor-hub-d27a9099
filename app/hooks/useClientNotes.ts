import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientNote {
  id: string;
  user_id: string;
  client_id: string;
  interaction_type: string;
  subject: string | null;
  content: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  is_complete: boolean;
  completed_at: string | null;
  responsible_user_id: string | null;
  owner_user_id: string | null;
  is_visible_portal: boolean;
  attachment_count: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface NoteListItem {
  id: string;
  dateAdded: string;
  interaction: string;
  interactions: number;
  priority: string;
  subject: string;
  uploads: number;
  complete: boolean;
  completedOn: string;
  responsibleUser: string;
  owner: string;
  visibleMyPSG: boolean;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const transformNoteToListItem = (note: ClientNote): NoteListItem => ({
  id: note.id,
  dateAdded: formatDate(note.created_at),
  interaction: note.interaction_type,
  interactions: 1, // Can be enhanced with related notes count
  priority: note.priority === "Urgent" ? "High" : note.priority,
  subject: note.subject || note.content.substring(0, 50),
  uploads: note.attachment_count,
  complete: note.is_complete,
  completedOn: note.completed_at ? formatDate(note.completed_at) : "-",
  responsibleUser: "Current User", // Will be enhanced with profiles join
  owner: "Current User",
  visibleMyPSG: note.is_visible_portal,
});

export const useClientNotes = (clientId: string) => {
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotes = useCallback(async (filter?: "current" | "all" | "completed" | "pending") => {
    if (!clientId) return;
    
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("client_notes")
        .select("*", { count: "exact" })
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (filter === "completed") {
        query = query.eq("is_complete", true);
      } else if (filter === "pending") {
        query = query.eq("is_complete", false);
      } else if (filter === "current") {
        query = query.eq("is_complete", false);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      const transformedNotes = (data || []).map(transformNoteToListItem);
      setNotes(transformedNotes);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error("Error fetching notes:", err);
      setError(err.message);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const createNote = async (noteData: Partial<ClientNote>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_notes")
        .insert({
          user_id: user.id,
          client_id: clientId,
          interaction_type: noteData.interaction_type || "Note",
          subject: noteData.subject,
          content: noteData.content || "",
          priority: noteData.priority || "Medium",
          is_complete: noteData.is_complete || false,
          is_visible_portal: noteData.is_visible_portal || false,
          attachment_count: noteData.attachment_count || 0,
          responsible_user_id: noteData.responsible_user_id || user.id,
          owner_user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchNotes();
      toast.success("Note added successfully");
      return data;
    } catch (err: any) {
      console.error("Error creating note:", err);
      toast.error(err.message || "Failed to add note");
      return null;
    }
  };

  const updateNote = async (noteId: string, updates: Partial<ClientNote>) => {
    try {
      const { error } = await supabase
        .from("client_notes")
        .update({
          ...updates,
          completed_at: updates.is_complete ? new Date().toISOString() : null,
        })
        .eq("id", noteId);

      if (error) throw error;

      await fetchNotes();
      toast.success("Note updated successfully");
      return true;
    } catch (err: any) {
      console.error("Error updating note:", err);
      toast.error(err.message || "Failed to update note");
      return false;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("client_notes")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", noteId);

      if (error) throw error;

      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success("Note deleted successfully");
      return true;
    } catch (err: any) {
      console.error("Error deleting note:", err);
      toast.error(err.message || "Failed to delete note");
      return false;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    error,
    totalCount,
    refetch: fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  };
};
