import { useState, useEffect, useCallback } from "react";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
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
  const { userId } = useKapableAuth();

  const fetchProducts = useCallback(async (showInactive: boolean = false) => {
    if (!clientId) return;

    setLoading(true);
    setError(null);
    try {
      let query = kapable
        .from<ClientProduct>("client_products")
        .select("*")
        .eq("client_id", clientId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (!showInactive) {
        query = query.eq("status", "Active");
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Look up product names from the products table
      const productIds = new Set<string>();
      for (const p of (data || []) as any[]) {
        if (p.product_id) productIds.add(p.product_id);
      }

      let productMap: Record<string, any> = {};
      if (productIds.size > 0) {
        const { data: productsData } = await kapable
          .from("products")
          .select("*")
          .in("id", [...productIds]);

        // Also look up product categories
        const categoryIds = new Set<string>();
        for (const prod of (productsData || []) as any[]) {
          productMap[prod.id] = prod;
          if (prod.category_id) categoryIds.add(prod.category_id);
        }

        if (categoryIds.size > 0) {
          const { data: categoriesData } = await kapable
            .from("product_categories")
            .select("*")
            .in("id", [...categoryIds]);
          const categoryMap: Record<string, any> = {};
          for (const cat of (categoriesData || []) as any[]) {
            categoryMap[cat.id] = cat;
          }
          // Attach category names to products
          for (const prodId of Object.keys(productMap)) {
            const prod = productMap[prodId];
            if (prod.category_id && categoryMap[prod.category_id]) {
              prod.category_name = categoryMap[prod.category_id].name;
            }
          }
        }
      }

      const transformedProducts = (data || []).map((product: any) => ({
        ...product,
        product_name: product.product_id ? productMap[product.product_id]?.name : undefined,
        category_name: product.product_id ? productMap[product.product_id]?.category_name : undefined,
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
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await kapable
        .from<ClientProduct>("client_products")
        .insert({
          user_id: userId,
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
          created_by: userId,
          adviser_id: userId,
        } as any)
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
      const { error } = await kapable
        .from<ClientProduct>("client_products")
        .update({
          ...updates,
          updated_by: userId,
          value_updated_at: updates.current_value !== undefined ? new Date().toISOString() : undefined,
        } as any)
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
      const { error } = await kapable
        .from<ClientProduct>("client_products")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() } as any)
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
