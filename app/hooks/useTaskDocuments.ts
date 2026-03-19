import { useState, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { toast } from "sonner";

export interface TaskDocument {
  id: string;
  task_id: string;
  document_id: string;
  document_type: string;
  notes: string | null;
  uploaded_at: string;
  uploaded_by: string | null;
  document_name?: string;
  file_path?: string;
  mime_type?: string;
}

export const useTaskDocuments = (taskId?: string) => {
  const { userId } = useKapableAuth();
  const [taskDocuments, setTaskDocuments] = useState<TaskDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTaskDocuments = useCallback(async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const { data, error } = await kapable
        .from("task_documents")
        .select("*")
        .eq("task_id", taskId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;

      // Fetch document details separately
      const docIds = [...new Set((data || []).map((td: any) => td.document_id).filter(Boolean))];
      let docsMap: Record<string, any> = {};
      if (docIds.length > 0) {
        const { data: docsData } = await kapable.from("documents").select("*").in("id", docIds);
        for (const d of (docsData || [])) {
          docsMap[d.id] = d;
        }
      }

      const transformed = (data || []).map((td: any) => {
        const doc = docsMap[td.document_id];
        return {
          id: td.id,
          task_id: td.task_id,
          document_id: td.document_id,
          document_type: td.document_type,
          notes: td.notes,
          uploaded_at: td.uploaded_at,
          uploaded_by: td.uploaded_by,
          document_name: doc?.name,
          file_path: doc?.file_path,
          mime_type: doc?.mime_type,
        };
      });

      setTaskDocuments(transformed);
    } catch (err: any) {
      console.error("Error fetching task documents:", err);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const linkDocument = async (documentId: string, documentType: string, notes?: string) => {
    if (!taskId) return null;

    try {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from("task_documents")
        .insert({
          user_id: userId,
          task_id: taskId,
          document_id: documentId,
          document_type: documentType,
          notes,
          uploaded_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTaskDocuments();
      toast.success("Document linked to task");
      return data;
    } catch (err: any) {
      console.error("Error linking document to task:", err);
      toast.error(err.message || "Failed to link document");
      return null;
    }
  };

  const unlinkDocument = async (taskDocumentId: string) => {
    try {
      const { error } = await kapable
        .from("task_documents")
        .delete()
        .eq("id", taskDocumentId);

      if (error) throw error;

      setTaskDocuments((prev) => prev.filter((td) => td.id !== taskDocumentId));
      toast.success("Document unlinked from task");
      return true;
    } catch (err: any) {
      console.error("Error unlinking document:", err);
      toast.error(err.message || "Failed to unlink document");
      return false;
    }
  };

  const updateDocumentNotes = async (taskDocumentId: string, notes: string) => {
    try {
      const { error } = await kapable
        .from("task_documents")
        .update({ notes })
        .eq("id", taskDocumentId);

      if (error) throw error;

      await fetchTaskDocuments();
      toast.success("Notes updated");
      return true;
    } catch (err: any) {
      console.error("Error updating document notes:", err);
      toast.error(err.message || "Failed to update notes");
      return false;
    }
  };

  return {
    taskDocuments,
    loading,
    fetchTaskDocuments,
    linkDocument,
    unlinkDocument,
    updateDocumentNotes,
  };
};
