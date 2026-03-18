import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClientProduct {
  id: string;
  user_id: string;
  client_id: string;
  product_id: string | null;
  policy_number: string | null;
  role: string;
  premium_amount: number | null;
  frequency: string | null;
  current_value: number | null;
  value_updated_at: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  adviser_id: string | null;
  is_linked: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Joined data
  product_name?: string;
  provider_name?: string;
  category_name?: string;
}

export interface ProductListItem {
  id: string;
  product: string;
  adviser: string;
  role: string;
  premium: string;
  frequency: string;
  value: string;
  valueUpdated: string;
  inactive: boolean;
  linked: boolean;
  category?: string;
}

const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) return "R 0.00";
  return `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
};

const transformProductToListItem = (product: ClientProduct): ProductListItem => ({
  id: product.id,
  product: product.product_name || product.policy_number || "Unknown Product",
  adviser: "Current Adviser", // Will be enhanced with profiles join
  role: product.role,
  premium: formatCurrency(product.premium_amount),
  frequency: product.frequency || "Monthly",
  value: formatCurrency(product.current_value),
  valueUpdated: formatDate(product.value_updated_at),
  inactive: product.status !== "Active",
  linked: product.is_linked,
  category: product.category_name,
});

export const useClientProducts = (clientId: string) => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (showInactive: boolean = false) => {
    if (!clientId) return;
    
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("client_products")
        .select(`
          *,
          products!client_products_product_id_fkey(
            name,
            product_categories!products_category_id_fkey(name)
          )
        `)
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (!showInactive) {
        query = query.eq("status", "Active");
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const transformedProducts = (data || []).map((product: any) => ({
        ...product,
        product_name: product.products?.name,
        category_name: product.products?.product_categories?.name,
      })).map(transformProductToListItem);

      setProducts(transformedProducts);
    } catch (err: any) {
      console.error("Error fetching client products:", err);
      setError(err.message);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const createProduct = async (productData: Partial<ClientProduct>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_products")
        .insert({
          user_id: user.id,
          client_id: clientId,
          product_id: productData.product_id,
          policy_number: productData.policy_number,
          role: productData.role || "Owner",
          premium_amount: productData.premium_amount,
          frequency: productData.frequency || "Monthly",
          current_value: productData.current_value,
          status: productData.status || "Active",
          start_date: productData.start_date,
          is_linked: productData.is_linked ?? true,
          notes: productData.notes,
          created_by: user.id,
          adviser_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProducts();
      toast.success("Product added successfully");
      return data;
    } catch (err: any) {
      console.error("Error creating product:", err);
      toast.error(err.message || "Failed to add product");
      return null;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<ClientProduct>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("client_products")
        .update({
          ...updates,
          updated_by: user?.id,
          value_updated_at: updates.current_value !== undefined ? new Date().toISOString() : undefined,
        })
        .eq("id", productId);

      if (error) throw error;

      await fetchProducts();
      toast.success("Product updated successfully");
      return true;
    } catch (err: any) {
      console.error("Error updating product:", err);
      toast.error(err.message || "Failed to update product");
      return false;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("client_products")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", productId);

      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product removed successfully");
      return true;
    } catch (err: any) {
      console.error("Error deleting product:", err);
      toast.error(err.message || "Failed to remove product");
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
