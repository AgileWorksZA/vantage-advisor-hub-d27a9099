import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kapable } from "@/integrations/kapable/client";
import { useKapableAuth } from "@/integrations/kapable/auth-context";
import { useToast } from "@/hooks/use-toast";

type AdminTable = 
  | "admin_general_lists"
  | "admin_data_imports"
  | "admin_document_templates"
  | "admin_product_benefits"
  | "admin_funds"
  | "admin_note_subjects"
  | "admin_events"
  | "admin_communication_settings"
  | "admin_system_settings";

interface UseAdminDataOptions {
  table: AdminTable;
  filters?: Record<string, string | number | boolean>;
  orderBy?: { column: string; ascending?: boolean };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

async function fetchAdminData(
  table: AdminTable, 
  filters: Record<string, string | number | boolean>,
  orderBy: { column: string; ascending?: boolean }
): Promise<AnyRecord[]> {
  // Build query parts as URL params approach to avoid deep type issues
  let queryBuilder = kapable.from(table).select("*");
  
  // We need to use a workaround for the deep type instantiation issue
  // by building the query string manually via RPC or using any
  const { data, error } = await queryBuilder
    .eq("is_deleted" as never, false as never)
    .order(orderBy.column, { ascending: orderBy.ascending ?? false });

  if (error) throw error;
  
  // Apply additional filters in memory for simplicity
  let result = data ?? [];
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      result = result.filter((item: AnyRecord) => item[key] === value);
    }
  }
  
  return result as AnyRecord[];
}

export function useAdminData<T extends AnyRecord = AnyRecord>({
  table,
  filters = {},
  orderBy = { column: "created_at", ascending: false }
}: UseAdminDataOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId } = useKapableAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const queryKey = [table, filters, orderBy];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchAdminData(table, filters, orderBy),
  });

  const createMutation = useMutation({
    mutationFn: async (newItem: AnyRecord) => {
      if (!userId) throw new Error("Not authenticated");

      const insertData = { ...newItem, user_id: userId };

      const { data: result, error: insertError } = await kapable
        .from(table)
        .insert(insertData as never)
        .select()
        .single();

      if (insertError) throw insertError;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      toast({ title: "Success", description: "Item created successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (itemWithId: AnyRecord & { id: string }) => {
      const { id, ...updates } = itemWithId;
      const { data: result, error: updateError } = await kapable
        .from(table)
        .update(updates as never)
        .eq("id" as never, id as never)
        .select()
        .single();

      if (updateError) throw updateError;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      toast({ title: "Success", description: "Item updated successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const deleteUpdate = { is_deleted: true, deleted_at: new Date().toISOString() };
      
      const { error: deleteError } = await kapable
        .from(table)
        .update(deleteUpdate as never)
        .eq("id" as never, id as never);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      toast({ title: "Success", description: "Item deleted successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Filter data by search term
  const filteredData = (data ?? []).filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some(
      (value) => 
        typeof value === "string" && 
        value.toLowerCase().includes(searchLower)
    );
  }) as T[];

  return {
    data: filteredData,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook for general lists with list_type filtering
export function useAdminGeneralList(listType: string) {
  return useAdminData({
    table: "admin_general_lists",
    filters: { list_type: listType },
    orderBy: { column: "display_order", ascending: true },
  });
}
