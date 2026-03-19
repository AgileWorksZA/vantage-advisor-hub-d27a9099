import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
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
  relationship_type: "Spouse" | "Child" | "Parent" | "Sibling" | "Business Partner" | "Trustee" | "Beneficiary" | "Director" | "Shareholder" | "Member" | "Owner";
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
  relatedClientId: string | null;
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
  relatedClientId: string | null;
}

const familyRelationshipTypes = ["Spouse", "Child", "Parent", "Sibling"];
const businessRelationshipTypes = ["Business Partner", "Trustee", "Beneficiary", "Director", "Shareholder", "Member", "Owner"];

export const useClientRelationships = (clientId: string) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberListItem[]>([]);
  const [businesses, setBusinesses] = useState<BusinessListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useKapableAuth();

  const fetchRelationships = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await kapable
        .from<ClientRelationship>("client_relationships")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Separate into family and business relationships
      const family: FamilyMemberListItem[] = [];
      const business: BusinessListItem[] = [];

      for (const rel of (data || []) as ClientRelationship[]) {
        if (familyRelationshipTypes.includes(rel.relationship_type)) {
          family.push({
            id: rel.id,
            name: rel.name,
            type: rel.entity_type,
            identification: rel.identification || "",
            identificationType: rel.id_type || "National ID",
            productViewing: rel.product_viewing_level || "None",
            familyType: rel.relationship_type,
            familyName: rel.family_name || "",
            relatedClientId: rel.related_client_id,
          });
        } else {
          business.push({
            id: rel.id,
            name: rel.name,
            type: rel.relationship_type,
            identification: rel.identification || "",
            identificationType: rel.entity_type,
            productViewing: rel.product_viewing_level || "None",
            share: rel.share_percentage ? `${rel.share_percentage}%` : "-",
            familyName: rel.family_name || "-",
            relatedClientId: rel.related_client_id,
          });
        }
      }

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
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from<ClientRelationship>("client_relationships")
        .insert({
          user_id: userId,
          client_id: clientId,
          name: relData.name || "",
          entity_type: relData.entity_type || "Individual",
          identification: relData.identification,
          id_type: relData.id_type || "National ID",
          product_viewing_level: relData.product_viewing_level || "None",
          relationship_type: relData.relationship_type || "Spouse",
          family_name: relData.family_name,
          share_percentage: relData.share_percentage,
          related_client_id: relData.related_client_id,
        } as any)
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
      const { error } = await kapable
        .from<ClientRelationship>("client_relationships")
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
      // First get the relationship to find the reciprocal
      const { data: relData } = await kapable
        .from<ClientRelationship>("client_relationships")
        .select("*")
        .eq("id", relId)
        .maybeSingle();

      // Soft-delete the primary relationship
      const { error } = await kapable
        .from<ClientRelationship>("client_relationships")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() } as any)
        .eq("id", relId);

      if (error) throw error;

      // Find and soft-delete the reciprocal relationship if it exists
      if (relData?.related_client_id) {
        // Fetch reciprocal relationships and soft-delete them
        const { data: reciprocals } = await kapable
          .from<ClientRelationship>("client_relationships")
          .select("*")
          .eq("client_id", (relData as any).related_client_id)
          .eq("related_client_id", (relData as any).client_id)
          .eq("is_deleted", false);

        if (reciprocals) {
          for (const recip of reciprocals as any[]) {
            await kapable
              .from<ClientRelationship>("client_relationships")
              .update({ is_deleted: true, deleted_at: new Date().toISOString() } as any)
              .eq("id", recip.id);
          }
        }
      }

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
