import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
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
  const { userId } = useKapableAuth();

  const fetchDocuments = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);
    try {
      // Kapable doesn't support Supabase-style joins, so fetch documents and related data separately
      const { data: docsData, error: fetchError } = await kapable
        .from<ClientDocument>("documents")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Collect unique IDs for related lookups
      const docTypeIds = new Set<string>();
      const productIds = new Set<string>();
      const workflowIds = new Set<string>();
      for (const doc of (docsData || []) as any[]) {
        if (doc.document_type_id) docTypeIds.add(doc.document_type_id);
        if (doc.product_id) productIds.add(doc.product_id);
        if (doc.workflow_id) workflowIds.add(doc.workflow_id);
      }

      // Fetch related data in parallel
      const [docTypesRes, productsRes, workflowsRes] = await Promise.all([
        docTypeIds.size > 0
          ? kapable.from("document_types").select("*").in("id", [...docTypeIds])
          : Promise.resolve({ data: [], error: null }),
        productIds.size > 0
          ? kapable.from("products").select("*").in("id", [...productIds])
          : Promise.resolve({ data: [], error: null }),
        workflowIds.size > 0
          ? kapable.from("workflows").select("*").in("id", [...workflowIds])
          : Promise.resolve({ data: [], error: null }),
      ]);

      // Build lookup maps
      const docTypeMap: Record<string, any> = {};
      for (const dt of (docTypesRes.data || []) as any[]) {
        docTypeMap[dt.id] = dt;
      }
      const productMap: Record<string, any> = {};
      for (const p of (productsRes.data || []) as any[]) {
        productMap[p.id] = p;
      }
      const workflowMap: Record<string, any> = {};
      for (const w of (workflowsRes.data || []) as any[]) {
        workflowMap[w.id] = w;
      }

      const transformedDocs = (docsData || []).map((doc: any) => ({
        ...doc,
        document_type_name: doc.document_type_id ? docTypeMap[doc.document_type_id]?.name : undefined,
        document_type_category: doc.document_type_id ? docTypeMap[doc.document_type_id]?.category : undefined,
        product_name: doc.product_id ? productMap[doc.product_id]?.name : undefined,
        workflow_name: doc.workflow_id ? workflowMap[doc.workflow_id]?.name : undefined,
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
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from<ClientDocument>("documents")
        .insert({
          user_id: userId,
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
          uploaded_by: userId,
        } as any)
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
      const updateData: any = { ...updates };
      if (updates.status === "Complete" && !updates.approved_by) {
        updateData.approved_by = userId;
        updateData.approval_date = new Date().toISOString();
      }

      const { error } = await kapable
        .from<ClientDocument>("documents")
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
      const { error } = await kapable
        .from<ClientDocument>("documents")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() } as any)
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
    for (const doc of productDocs) {
      const key = doc.productName || "Other";
      if (!productGroups[key]) productGroups[key] = [];
      productGroups[key].push(doc);
    }

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
