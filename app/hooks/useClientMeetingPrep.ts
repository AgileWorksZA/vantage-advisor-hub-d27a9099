import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";

export interface PrepNote {
  id: string;
  subject: string;
  date: string;
  priority: string;
  interactionType: string;
}

export interface PrepComm {
  id: string;
  subject: string;
  channel: string;
  date: string;
}

export interface PrepTask {
  id: string;
  title: string;
  taskType: string;
  priority: string;
  status: string;
  dueDate: string | null;
  isOverdue: boolean;
}

export interface PrepDocument {
  id: string;
  name: string;
  status: string;
  expiryDate: string | null;
  category: string;
}

export interface PrepOpportunity {
  id: string;
  clientName: string;
  opportunityType: string;
  potentialRevenue: number | null;
  confidence: number | null;
  status: string;
  suggestedAction: string | null;
  reasoning: string | null;
}

export interface PrepProduct {
  id: string;
  productName: string;
  category: string | null;
  currentValue: number | null;
  status: string;
}

export interface ClientPrepData {
  notes: PrepNote[];
  communications: PrepComm[];
  tasks: PrepTask[];
  documents: PrepDocument[];
  opportunities: PrepOpportunity[];
  products: PrepProduct[];
  loading: boolean;
}

export function useClientMeetingPrep(clientId: string | null) {
  const [data, setData] = useState<ClientPrepData>({
    notes: [],
    communications: [],
    tasks: [],
    documents: [],
    opportunities: [],
    products: [],
    loading: true,
  });

  const fetchAll = useCallback(async () => {
    if (!clientId) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    setData(prev => ({ ...prev, loading: true }));

    try {
      const [notesRes, commsRes, tasksRes, docsRes, oppsRes, prodsRes] = await Promise.all([
        kapable
          .from("client_notes")
          .select("*")
          .eq("client_id", clientId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: false })
          .limit(5),
        kapable
          .from("communications")
          .select("*")
          .eq("client_id", clientId)
          .eq("is_deleted", false)
          .order("sent_at", { ascending: false })
          .limit(5),
        kapable
          .from("advisor_tasks")
          .select("*")
          .eq("client_id", clientId)
          .eq("is_deleted", false)
          .order("due_date", { ascending: true }),
        kapable
          .from("documents")
          .select("*")
          .eq("client_id", clientId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: false }),
        kapable
          .from("project_opportunities")
          .select("*")
          .eq("client_id", clientId)
          .order("potential_revenue", { ascending: false }),
        kapable
          .from("client_products")
          .select("*")
          .eq("client_id", clientId)
          .eq("is_deleted", false)
          .eq("status", "Active")
          .order("current_value", { ascending: false })
          .limit(5),
      ]);

      // Filter tasks client-side (replacing .not("status", "in", ...))
      const filteredTasks = (tasksRes.data || []).filter(
        (t: any) => t.status !== "Completed" && t.status !== "Cancelled"
      );

      // Filter documents client-side for Pending/Expired status
      const filteredDocs = (docsRes.data || []).filter(
        (d: any) => d.status === "Pending" || d.status === "Expired"
      );

      // For products, we need to look up product names separately
      const productIds = new Set<string>();
      for (const p of (prodsRes.data || []) as any[]) {
        if (p.product_id) productIds.add(p.product_id);
      }
      let productMap: Record<string, any> = {};
      if (productIds.size > 0) {
        const { data: productsData } = await kapable
          .from("products")
          .select("*")
          .in("id", [...productIds]);
        for (const prod of (productsData || []) as any[]) {
          productMap[prod.id] = prod;
        }
      }

      // For documents, look up document_type categories
      const docTypeIds = new Set<string>();
      for (const d of filteredDocs as any[]) {
        if (d.document_type_id) docTypeIds.add(d.document_type_id);
      }
      let docTypeMap: Record<string, any> = {};
      if (docTypeIds.size > 0) {
        const { data: docTypesData } = await kapable
          .from("document_types")
          .select("*")
          .in("id", [...docTypeIds]);
        for (const dt of (docTypesData || []) as any[]) {
          docTypeMap[dt.id] = dt;
        }
      }

      setData({
        loading: false,
        notes: (notesRes.data || []).map((n: any) => ({
          id: n.id,
          subject: n.subject || "No subject",
          date: n.created_at,
          priority: n.priority,
          interactionType: n.interaction_type,
        })),
        communications: (commsRes.data || []).map((c: any) => ({
          id: c.id,
          subject: c.subject || "(No Subject)",
          channel: c.channel,
          date: c.sent_at || c.created_at,
        })),
        tasks: filteredTasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          taskType: t.task_type,
          priority: t.priority,
          status: t.status,
          dueDate: t.due_date,
          isOverdue: t.due_date ? new Date(t.due_date) < new Date() : false,
        })),
        documents: filteredDocs.map((d: any) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          expiryDate: d.expiry_date,
          category: d.document_type_id ? (docTypeMap[d.document_type_id]?.category || "Client") : "Client",
        })),
        opportunities: (oppsRes.data || []).map((o: any) => ({
          id: o.id,
          clientName: o.client_name,
          opportunityType: o.opportunity_type,
          potentialRevenue: o.potential_revenue,
          confidence: o.confidence,
          status: o.status,
          suggestedAction: o.suggested_action,
          reasoning: o.reasoning,
        })),
        products: (prodsRes.data || []).map((p: any) => ({
          id: p.id,
          productName: p.product_id ? (productMap[p.product_id]?.name || "Unknown") : "Unknown",
          category: p.product_id ? (productMap[p.product_id]?.category_name || null) : null,
          currentValue: p.current_value,
          status: p.status,
        })),
      });
    } catch (err) {
      console.error("Error fetching meeting prep data:", err);
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [clientId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, refetch: fetchAll };
}
