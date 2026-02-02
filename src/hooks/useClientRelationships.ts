import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientRelationship {
  id: string;
  user_id: string;
  client_id: string;
  related_client_id: string | null;
  name: string;
  entity_type: "Individual" | "Trust" | "Company" | "Close Corporation";
  identification: string | null;
  id_type: string | null;
  product_viewing_level: string | null;
  relationship_type: "Spouse" | "Child" | "Parent" | "Sibling" | "Business Partner" | "Trustee";
  family_name: string | null;
  share_percentage: number | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface FamilyMemberListItem {
  id: string;
  name: string;
  type: string;
  identification: string;
  identificationType: string;
  productViewing: string;
  familyType: string;
  familyName: string;
}

export interface BusinessListItem {
  id: string;
  name: string;
  type: string;
  identification: string;
  identificationType: string;
  productViewing: string;
  share: string;
  familyName: string;
}

const familyRelationshipTypes = ["Spouse", "Child", "Parent", "Sibling"];
const businessRelationshipTypes = ["Business Partner", "Trustee"];

export const useClientRelationships = (clientId: string) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberListItem[]>([]);
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationships = useCallback(async () => {
    if (!clientId) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("client_relationships")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Separate into family and business relationships
      const family: FamilyMemberListItem[] = [];
      const business: BusinessListItem[] = [];

      (data || []).forEach((rel: ClientRelationship) => {
        if (familyRelationshipTypes.includes(rel.relationship_type)) {
          family.push({
            id: rel.id,
            name: rel.name,
            type: rel.entity_type,
            identification: rel.identification || "",
            identificationType: rel.id_type || "SA ID",
            productViewing: rel.product_viewing_level || "None",
            familyType: rel.relationship_type,
            familyName: rel.family_name || "",
          });
        } else {
          business.push({
            id: rel.id,
            name: rel.name,
            type: rel.entity_type,
            identification: rel.identification || "",
            identificationType: rel.id_type || "Registration",
            productViewing: rel.product_viewing_level || "None",
            share: rel.share_percentage ? `${rel.share_percentage}%` : "-",
            familyName: rel.family_name || "-",
          });
        }
      });

      setFamilyMembers(family);
      setBusinesses(business);
    } catch (err: any) {
      console.error("Error fetching relationships:", err);
      setError(err.message);
      toast.error("Failed to load relationships");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const createRelationship = async (relData: Partial<ClientRelationship>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_relationships")
        .insert({
          user_id: user.id,
          client_id: clientId,
          name: relData.name || "",
          entity_type: relData.entity_type || "Individual",
          identification: relData.identification,
          id_type: relData.id_type || "SA ID",
          product_viewing_level: relData.product_viewing_level || "None",
          relationship_type: relData.relationship_type || "Spouse",
          family_name: relData.family_name,
          share_percentage: relData.share_percentage,
          related_client_id: relData.related_client_id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchRelationships();
      toast.success("Relationship added successfully");
      return data;
    } catch (err: any) {
      console.error("Error creating relationship:", err);
      toast.error(err.message || "Failed to add relationship");
      return null;
    }
  };

  const updateRelationship = async (relId: string, updates: Partial<ClientRelationship>) => {
    try {
      const { error } = await supabase
        .from("client_relationships")
        .update(updates)
        .eq("id", relId);

      if (error) throw error;

      await fetchRelationships();
      toast.success("Relationship updated successfully");
      return true;
    } catch (err: any) {
      console.error("Error updating relationship:", err);
      toast.error(err.message || "Failed to update relationship");
      return false;
    }
  };

  const deleteRelationship = async (relId: string) => {
    try {
      const { error } = await supabase
        .from("client_relationships")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", relId);

      if (error) throw error;

      setFamilyMembers((prev) => prev.filter((f) => f.id !== relId));
      setBusinesses((prev) => prev.filter((b) => b.id !== relId));
      toast.success("Relationship removed successfully");
      return true;
    } catch (err: any) {
      console.error("Error deleting relationship:", err);
      toast.error(err.message || "Failed to remove relationship");
      return false;
    }
  };

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  return {
    familyMembers,
    businesses,
    loading,
    error,
    refetch: fetchRelationships,
    createRelationship,
    updateRelationship,
    deleteRelationship,
  };
};
