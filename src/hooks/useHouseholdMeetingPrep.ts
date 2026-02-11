import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PrepTask, PrepDocument, PrepOpportunity, PrepProduct } from "./useClientMeetingPrep";

export interface HouseholdPrepTask extends PrepTask {
  clientName: string;
}

export interface HouseholdPrepDocument extends PrepDocument {
  clientName: string;
}

export interface HouseholdPrepOpportunity extends PrepOpportunity {
  clientName: string;
}

export interface HouseholdPrepProduct extends PrepProduct {
  clientName: string;
}

export interface HouseholdMember {
  id: string;
  firstName: string;
  surname: string;
  nationality: string | null;
  countryOfIssue: string | null;
}

export interface HouseholdPrepData {
  tasks: HouseholdPrepTask[];
  documents: HouseholdPrepDocument[];
  opportunities: HouseholdPrepOpportunity[];
  products: HouseholdPrepProduct[];
  householdClients: HouseholdMember[];
  loading: boolean;
}

const formatClientName = (firstName: string, surname: string) => {
  return `${firstName} ${surname.charAt(0)}.`;
};

export function useHouseholdMeetingPrep(householdGroup: string | null, enabled: boolean) {
  const [data, setData] = useState<HouseholdPrepData>({
    tasks: [],
    documents: [],
    opportunities: [],
    products: [],
    householdClients: [],
    loading: false,
  });

  const fetchAll = useCallback(async () => {
    if (!householdGroup || !enabled) {
      setData({ tasks: [], documents: [], opportunities: [], products: [], householdClients: [], loading: false });
      return;
    }

    setData(prev => ({ ...prev, loading: true }));

    try {
      // Get all clients in the household
      const { data: householdClients } = await supabase
        .from("clients")
        .select("id, first_name, surname, nationality, country_of_issue")
        .eq("household_group", householdGroup);

      if (!householdClients || householdClients.length === 0) {
        setData({ tasks: [], documents: [], opportunities: [], products: [], householdClients: [], loading: false });
        return;
      }

      const clientIds = householdClients.map(c => c.id);
      const clientNameMap = new Map(householdClients.map(c => [c.id, formatClientName(c.first_name, c.surname)]));

      // Fetch all data in parallel across all household clients
      const [tasksRes, docsRes, oppsRes, prodsRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, task_type, priority, status, due_date, client_id")
          .in("client_id", clientIds)
          .eq("is_deleted", false)
          .not("status", "in", '("Completed","Cancelled")')
          .order("due_date", { ascending: true }),
        supabase
          .from("documents")
          .select("id, name, status, expiry_date, client_id, document_types!documents_document_type_id_fkey(category)")
          .in("client_id", clientIds)
          .eq("is_deleted", false)
          .in("status", ["Pending", "Expired"])
          .order("created_at", { ascending: false }),
        supabase
          .from("project_opportunities")
          .select("id, client_name, opportunity_type, potential_revenue, confidence, status, suggested_action, reasoning, client_id")
          .in("client_id", clientIds)
          .order("potential_revenue", { ascending: false }),
        supabase
          .from("client_products")
          .select("id, current_value, status, client_id, products!client_products_product_id_fkey(name, product_categories!products_category_id_fkey(name))")
          .in("client_id", clientIds)
          .eq("is_deleted", false)
          .eq("status", "Active")
          .order("current_value", { ascending: false }),
      ]);

      setData({
        loading: false,
        householdClients: householdClients.map(c => ({
          id: c.id,
          firstName: c.first_name,
          surname: c.surname,
          nationality: (c as any).nationality || null,
          countryOfIssue: (c as any).country_of_issue || null,
        })),
        tasks: (tasksRes.data || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          taskType: t.task_type,
          priority: t.priority,
          status: t.status,
          dueDate: t.due_date,
          isOverdue: t.due_date ? new Date(t.due_date) < new Date() : false,
          clientName: clientNameMap.get(t.client_id) || "Unknown",
        })),
        documents: (docsRes.data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          expiryDate: d.expiry_date,
          category: d.document_types?.category || "Client",
          clientName: clientNameMap.get(d.client_id) || "Unknown",
        })),
        opportunities: (oppsRes.data || []).map((o: any) => ({
          id: o.id,
          clientName: clientNameMap.get(o.client_id) || o.client_name,
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
          clientName: clientNameMap.get(p.client_id) || "Unknown",
        })),
      });
    } catch (err) {
      console.error("Error fetching household prep data:", err);
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [householdGroup, enabled]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return data;
}
