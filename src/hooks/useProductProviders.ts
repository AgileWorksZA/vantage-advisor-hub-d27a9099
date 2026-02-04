import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface ProductProvider {
  id: string;
  user_id: string;
  name: string;
  code: string;
  provider_type: string;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  country: string | null;
  astute_code: string | null;
  tel_number: string | null;
  tel_number_legal: string | null;
  fax_number_legal: string | null;
  email_legal: string | null;
  portal_url: string | null;
  residential_address: Json | null;
  postal_address: Json | null;
  services: string[] | null;
  umbrella_provider_id: string | null;
  contract_padding: number | null;
  exclude_from_aging: boolean | null;
  is_hidden: boolean | null;
  auto_notify_changes: boolean | null;
  disable_manual_contract_update: boolean | null;
  is_approved: boolean | null;
  is_umbrella_provider: boolean | null;
  cc_static_update: string | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  product_code: string | null;
  provider_id: string | null;
  premium_type: string | null;
  is_active: boolean;
}

export function useProductProviders() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["product-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_providers")
        .select("*")
        .eq("is_deleted", false)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as ProductProvider[];
    },
  });

  const filteredProviders = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createProvider = useMutation({
    mutationFn: async (provider: Partial<ProductProvider>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const insertData = {
        name: provider.name || "",
        code: provider.code || "",
        provider_type: provider.provider_type || "Insurance",
        user_id: userData.user.id,
        contact_email: provider.contact_email,
        contact_phone: provider.contact_phone,
        is_active: provider.is_active ?? true,
        country: provider.country,
        astute_code: provider.astute_code,
        tel_number: provider.tel_number,
        tel_number_legal: provider.tel_number_legal,
        fax_number_legal: provider.fax_number_legal,
        email_legal: provider.email_legal,
        portal_url: provider.portal_url,
        residential_address: provider.residential_address,
        postal_address: provider.postal_address,
        services: provider.services as Json,
        umbrella_provider_id: provider.umbrella_provider_id,
        contract_padding: provider.contract_padding,
        exclude_from_aging: provider.exclude_from_aging,
        is_hidden: provider.is_hidden,
        auto_notify_changes: provider.auto_notify_changes,
        disable_manual_contract_update: provider.disable_manual_contract_update,
        is_approved: provider.is_approved,
        is_umbrella_provider: provider.is_umbrella_provider,
        cc_static_update: provider.cc_static_update,
      };

      const { data, error } = await supabase
        .from("product_providers")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-providers"] });
      toast.success("Provider created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create provider: ${error.message}`);
    },
  });

  const updateProvider = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductProvider> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.code !== undefined) updateData.code = updates.code;
      if (updates.provider_type !== undefined) updateData.provider_type = updates.provider_type;
      if (updates.contact_email !== undefined) updateData.contact_email = updates.contact_email;
      if (updates.contact_phone !== undefined) updateData.contact_phone = updates.contact_phone;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      if (updates.country !== undefined) updateData.country = updates.country;
      if (updates.astute_code !== undefined) updateData.astute_code = updates.astute_code;
      if (updates.tel_number !== undefined) updateData.tel_number = updates.tel_number;
      if (updates.tel_number_legal !== undefined) updateData.tel_number_legal = updates.tel_number_legal;
      if (updates.fax_number_legal !== undefined) updateData.fax_number_legal = updates.fax_number_legal;
      if (updates.email_legal !== undefined) updateData.email_legal = updates.email_legal;
      if (updates.portal_url !== undefined) updateData.portal_url = updates.portal_url;
      if (updates.residential_address !== undefined) updateData.residential_address = updates.residential_address;
      if (updates.postal_address !== undefined) updateData.postal_address = updates.postal_address;
      if (updates.services !== undefined) updateData.services = updates.services;
      if (updates.umbrella_provider_id !== undefined) updateData.umbrella_provider_id = updates.umbrella_provider_id;
      if (updates.contract_padding !== undefined) updateData.contract_padding = updates.contract_padding;
      if (updates.exclude_from_aging !== undefined) updateData.exclude_from_aging = updates.exclude_from_aging;
      if (updates.is_hidden !== undefined) updateData.is_hidden = updates.is_hidden;
      if (updates.auto_notify_changes !== undefined) updateData.auto_notify_changes = updates.auto_notify_changes;
      if (updates.disable_manual_contract_update !== undefined) updateData.disable_manual_contract_update = updates.disable_manual_contract_update;
      if (updates.is_approved !== undefined) updateData.is_approved = updates.is_approved;
      if (updates.is_umbrella_provider !== undefined) updateData.is_umbrella_provider = updates.is_umbrella_provider;
      if (updates.cc_static_update !== undefined) updateData.cc_static_update = updates.cc_static_update;

      const { data, error } = await supabase
        .from("product_providers")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-providers"] });
      toast.success("Provider updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update provider: ${error.message}`);
    },
  });

  const deleteProvider = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("product_providers")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-providers"] });
      toast.success("Provider deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete provider: ${error.message}`);
    },
  });

  const seedProviders = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Please sign in to seed providers");
        return;
      }

      const response = await supabase.functions.invoke("seed-providers-data");

      if (response.error) {
        throw new Error(response.error.message);
      }

      queryClient.invalidateQueries({ queryKey: ["product-providers"] });
      toast.success(response.data.message);
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to seed providers: ${message}`);
      throw error;
    }
  }, [queryClient]);

  return {
    providers: filteredProviders,
    allProviders: providers,
    isLoading,
    searchTerm,
    setSearchTerm,
    createProvider: createProvider.mutateAsync,
    updateProvider: updateProvider.mutateAsync,
    deleteProvider: deleteProvider.mutateAsync,
    seedProviders,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["product-providers"] }),
  };
}

export function useProviderProducts(providerId: string | null) {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["provider-products", providerId],
    queryFn: async () => {
      if (!providerId) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("provider_id", providerId)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!providerId,
  });

  const { data: availableProducts = [] } = useQuery({
    queryKey: ["available-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
  });

  const linkProduct = useMutation({
    mutationFn: async ({ productId, providerId }: { productId: string; providerId: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update({ provider_id: providerId })
        .eq("id", productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-products"] });
      queryClient.invalidateQueries({ queryKey: ["available-products"] });
      toast.success("Product linked successfully");
    },
    onError: (error) => {
      toast.error(`Failed to link product: ${error.message}`);
    },
  });

  const unlinkProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { data, error } = await supabase
        .from("products")
        .update({ provider_id: null })
        .eq("id", productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-products"] });
      queryClient.invalidateQueries({ queryKey: ["available-products"] });
      toast.success("Product unlinked successfully");
    },
    onError: (error) => {
      toast.error(`Failed to unlink product: ${error.message}`);
    },
  });

  return {
    products,
    availableProducts,
    isLoading,
    linkProduct: linkProduct.mutateAsync,
    unlinkProduct: unlinkProduct.mutateAsync,
  };
}
