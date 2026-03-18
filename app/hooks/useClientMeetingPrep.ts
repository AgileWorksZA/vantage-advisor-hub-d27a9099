import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    const now = new Date().toISOString();

    try {
      const [notesRes, commsRes, tasksRes, docsRes, oppsRes, prodsRes] = await Promise.all([
        supabase
          .from("client_notes")
          .select("id, subject, created_at, priority, interaction_type")
          .eq("client_id", clientId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("communications")
          .select("id, subject, channel, sent_at, created_at")
          .eq("client_id", clientId)
          .eq("is_deleted", false)
          .order("sent_at", { ascending: false })
          .limit(5),
        supabase
          .from("tasks")
          .select("id, title, task_type, priority, status, due_date")
          .eq("client_id", clientId)
          .eq("is_deleted", false)
          .not("status", "in", '("Completed","Cancelled")')
          .order("due_date", { ascending: true }),
        supabase
          .from("documents")
          .select("id, name, status, expiry_date, document_types!documents_document_type_id_fkey(category)")
          .eq("client_id", clientId)
          .eq("is_deleted", false)
          .in("status", ["Pending", "Expired"])
          .order("created_at", { ascending: false }),
        supabase
          .from("project_opportunities")
          .select("id, client_name, opportunity_type, potential_revenue, confidence, status, suggested_action, reasoning")
          .eq("client_id", clientId)
          .order("potential_revenue", { ascending: false }),
        supabase
          .from("client_products")
          .select("id, current_value, status, products!client_products_product_id_fkey(name, product_categories!products_category_id_fkey(name))")
          .eq("client_id", clientId)
          .eq("is_deleted", false)
          .eq("status", "Active")
          .order("current_value", { ascending: false })
          .limit(5),
      ]);

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
        tasks: (tasksRes.data || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          taskType: t.task_type,
          priority: t.priority,
          status: t.status,
          dueDate: t.due_date,
          isOverdue: t.due_date ? new Date(t.due_date) < new Date() : false,
        })),
        documents: (docsRes.data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          expiryDate: d.expiry_date,
          category: d.document_types?.category || "Client",
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
          productName: p.products?.name || "Unknown",
          category: p.products?.product_categories?.name || null,
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
