import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientDocument {
  id: string;
  user_id: string;
  client_id: string | null;
  product_id: string | null;
  document_type_id: string | null;
  name: string;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  version: number;
  status: "Pending" | "Complete" | "Cancelled" | "Expired";
  workflow_id: string | null;
  expiry_date: string | null;
  uploaded_by: string | null;
  approved_by: string | null;
  approval_date: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Joined data
  document_type_name?: string;
  document_type_category?: string;
  product_name?: string;
  workflow_name?: string;
}

export interface DocumentListItem {
  id: string;
  name: string;
  status: string;
  workflow: string | null;
  category: string;
  expiryDate: string | null;
  productName: string | null;
}

const transformDocumentToListItem = (doc: ClientDocument): DocumentListItem => ({
  id: doc.id,
  name: doc.name,
  status: doc.status.toLowerCase(),
  workflow: doc.workflow_name || null,
  category: doc.document_type_category || "Client",
  expiryDate: doc.expiry_date,
  productName: doc.product_name || null,
});

export const useClientDocuments = (clientId: string) => {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!clientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("documents")
        .select(`
          *,
          document_types!documents_document_type_id_fkey(name, category),
          products!documents_product_id_fkey(name),
          workflows!documents_workflow_id_fkey(name)
        `)
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const transformedDocs = (data || []).map((doc: any) => ({
        ...doc,
        document_type_name: doc.document_types?.name,
        document_type_category: doc.document_types?.category,
        product_name: doc.products?.name,
        workflow_name: doc.workflows?.name,
      })).map(transformDocumentToListItem);

      setDocuments(transformedDocs);
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      setError(err.message);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const uploadDocument = async (documentData: Partial<ClientDocument>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          client_id: clientId,
          product_id: documentData.product_id,
          document_type_id: documentData.document_type_id,
          name: documentData.name || "Untitled Document",
          file_path: documentData.file_path,
          file_size: documentData.file_size,
          mime_type: documentData.mime_type,
          version: 1,
          status: "Pending",
          expiry_date: documentData.expiry_date,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchDocuments();
      toast.success("Document uploaded successfully");
      return data;
    } catch (err: any) {
      console.error("Error uploading document:", err);
      toast.error(err.message || "Failed to upload document");
      return null;
    }
  };

  const updateDocument = async (documentId: string, updates: Partial<ClientDocument>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = { ...updates };
      if (updates.status === "Complete" && !updates.approved_by) {
        updateData.approved_by = user?.id;
        updateData.approval_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from("documents")
        .update(updateData)
        .eq("id", documentId);

      if (error) throw error;

      await fetchDocuments();
      toast.success("Document updated successfully");
      return true;
    } catch (err: any) {
      console.error("Error updating document:", err);
      toast.error(err.message || "Failed to update document");
      return false;
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", documentId);

      if (error) throw error;

      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
      toast.success("Document deleted successfully");
      return true;
    } catch (err: any) {
      console.error("Error deleting document:", err);
      toast.error(err.message || "Failed to delete document");
      return false;
    }
  };

  // Group documents by category
  const getDocumentsByCategory = () => {
    const clientDocs = documents.filter(d => d.category === "Client");
    const ficaDocs = documents.filter(d => d.category === "FICA");
    const productDocs = documents.filter(d => d.category === "Product" && d.productName);
    
    // Group product docs by product name
    const productGroups: Record<string, DocumentListItem[]> = {};
    productDocs.forEach(doc => {
      const key = doc.productName || "Other";
      if (!productGroups[key]) productGroups[key] = [];
      productGroups[key].push(doc);
    });

    return { clientDocs, ficaDocs, productGroups };
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByCategory,
  };
};
