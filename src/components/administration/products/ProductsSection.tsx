import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminData } from "@/hooks/useAdminData";
import { useProductProviders, ProductProvider } from "@/hooks/useProductProviders";
import { AdminSectionHeader } from "../AdminSectionHeader";
import { AdminDataTable, ColumnDef, StatusBadge, BooleanIndicator } from "../AdminDataTable";
import { adminSections } from "../AdminLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ProviderDetailDialog } from "./ProviderDetailDialog";
import { Database } from "lucide-react";

interface ProductBenefit {
  id: string;
  name: string;
  field_mapping: string | null;
  is_mapped: boolean | null;
  display_order: number | null;
  is_active: boolean | null;
}

interface GeneralListItem {
  id: string;
  list_type: string;
  code: string;
  name: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean;
}

type ProductItem = ProductBenefit | GeneralListItem;

const COUNTRY_LABELS: Record<string, string> = {
  ZA: "South Africa",
  US: "United States",
  UK: "United Kingdom",
  AU: "Australia",
  CA: "Canada",
};

export function ProductsSection() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "providers";

  const section = adminSections.find((s) => s.id === "products");
  const tabs = section?.tabs || [];

  // Provider hooks
  const {
    providers,
    allProviders,
    isLoading: providersLoading,
    searchTerm: providerSearchTerm,
    setSearchTerm: setProviderSearchTerm,
    updateProvider,
    deleteProvider,
    seedProviders,
    refetch: refetchProviders,
  } = useProductProviders();

  const [selectedProvider, setSelectedProvider] = useState<ProductProvider | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Use different hooks based on active tab
  const isBenefitsTab = activeTab === "benefits";
  const isClassificationTab = activeTab === "classification";
  const isProvidersTab = activeTab === "providers";
  
  const benefitsHook = useAdminData<ProductBenefit>({
    table: "admin_product_benefits",
    orderBy: { column: "display_order", ascending: true },
  });

  const classificationHook = useAdminData<GeneralListItem>({
    table: "admin_general_lists",
    filters: { list_type: "product_classification" },
    orderBy: { column: "display_order", ascending: true },
  });

  const productsHook = useAdminData<GeneralListItem>({
    table: "admin_general_lists",
    filters: { list_type: "products" },
    orderBy: { column: "name", ascending: true },
  });

  // Select the appropriate hook data for non-provider tabs
  const getActiveHookData = () => {
    switch (activeTab) {
      case "benefits":
        return benefitsHook;
      case "classification":
        return classificationHook;
      default:
        return productsHook;
    }
  };

  const { data, isLoading, searchTerm, setSearchTerm, create, update, delete: deleteItem, refetch } = getActiveHookData();

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<ProductItem | null>(null);
  
  // Benefits form
  const [benefitForm, setBenefitForm] = useState({
    name: "",
    field_mapping: "",
    is_mapped: false,
    display_order: 0,
    is_active: true,
  });

  // General list form
  const [listForm, setListForm] = useState({
    code: "",
    name: "",
    description: "",
    display_order: 0,
    is_active: true,
  });

  // Provider columns
  const providerColumns: ColumnDef<ProductProvider>[] = [
    { header: "Name", accessor: "name", sortable: true },
    { header: "Code", accessor: "code", sortable: true },
    { header: "Type", accessor: "provider_type", sortable: true },
    {
      header: "Country",
      accessor: "country",
      render: (value) => (
        <Badge variant="outline">
          {COUNTRY_LABELS[value as string] || (value as string) || "-"}
        </Badge>
      ),
    },
    {
      header: "Services",
      accessor: "services",
      render: (value) => {
        const services = value as string[] | null;
        if (!services || services.length === 0) return "-";
        return (
          <div className="flex flex-wrap gap-1">
            {services.slice(0, 2).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
            {services.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{services.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "is_active",
      render: (value) => <StatusBadge isActive={value as boolean} />,
    },
  ];

  const benefitColumns: ColumnDef<ProductBenefit>[] = [
    { header: "Name", accessor: "name", sortable: true },
    { header: "Field Mapping", accessor: "field_mapping" },
    {
      header: "Is Mapped",
      accessor: "is_mapped",
      render: (value) => <BooleanIndicator value={value as boolean} />,
    },
    { header: "Order", accessor: "display_order" },
    {
      header: "Status",
      accessor: "is_active",
      render: (value) => <StatusBadge isActive={value as boolean} />,
    },
  ];

  const listColumns: ColumnDef<GeneralListItem>[] = [
    { header: "Code", accessor: "code", sortable: true },
    { header: "Name", accessor: "name", sortable: true },
    { header: "Description", accessor: "description" },
    { header: "Order", accessor: "display_order" },
    {
      header: "Status",
      accessor: "is_active",
      render: (value) => <StatusBadge isActive={value as boolean} />,
    },
  ];

  const handleAdd = () => {
    setEditItem(null);
    if (isBenefitsTab) {
      setBenefitForm({
        name: "",
        field_mapping: "",
        is_mapped: false,
        display_order: data.length + 1,
        is_active: true,
      });
    } else {
      setListForm({
        code: "",
        name: "",
        description: "",
        display_order: data.length + 1,
        is_active: true,
      });
    }
    setShowDialog(true);
  };

  const handleEdit = (item: ProductItem) => {
    setEditItem(item);
    if (isBenefitsTab) {
      const benefit = item as ProductBenefit;
      setBenefitForm({
        name: benefit.name,
        field_mapping: benefit.field_mapping || "",
        is_mapped: benefit.is_mapped ?? false,
        display_order: benefit.display_order || 0,
        is_active: benefit.is_active ?? true,
      });
    } else {
      const listItem = item as GeneralListItem;
      setListForm({
        code: listItem.code,
        name: listItem.name,
        description: listItem.description || "",
        display_order: listItem.display_order || 0,
        is_active: listItem.is_active,
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (isBenefitsTab) {
      if (!benefitForm.name.trim()) return;
      const payload = {
        ...benefitForm,
        field_mapping: benefitForm.field_mapping || null,
      };
      if (editItem) {
        await update({ id: editItem.id, ...payload });
      } else {
        await create(payload);
      }
    } else {
      if (!listForm.code.trim() || !listForm.name.trim()) return;
      const listType = activeTab === "classification" ? "product_classification" : "products";
      const payload = {
        ...listForm,
        list_type: listType,
        description: listForm.description || null,
      };
      if (editItem) {
        await update({ id: editItem.id, ...payload });
      } else {
        await create(payload);
      }
    }
    setShowDialog(false);
  };

  const handleDelete = async (item: ProductItem) => {
    await deleteItem(item.id);
  };

  const handleProviderClick = (provider: ProductProvider) => {
    setSelectedProvider(provider);
  };

  const handleSeedProviders = async () => {
    setIsSeeding(true);
    try {
      await seedProviders();
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => navigate(`/administration/products/${v}`)}
      >
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          {isProvidersTab ? (
            <>
              <AdminSectionHeader
                title="Providers"
                itemCount={providers.length}
                searchValue={providerSearchTerm}
                onSearchChange={setProviderSearchTerm}
                onReset={() => refetchProviders()}
                customActions={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSeedProviders}
                    disabled={isSeeding}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {isSeeding ? "Seeding..." : "Seed Providers Data"}
                  </Button>
                }
              />

              <div className="mt-4">
                <AdminDataTable
                  data={providers}
                  columns={providerColumns}
                  onEdit={handleProviderClick}
                  onDelete={(p) => deleteProvider(p.id)}
                  isLoading={providersLoading}
                />
              </div>
            </>
          ) : (
            <>
              <AdminSectionHeader
                title={tabs.find((t) => t.id === activeTab)?.label || "Products"}
                itemCount={data.length}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                onAdd={handleAdd}
                onReset={() => refetch()}
              />

              <div className="mt-4">
                {isBenefitsTab ? (
                  <AdminDataTable
                    data={data as ProductBenefit[]}
                    columns={benefitColumns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                  />
                ) : (
                  <AdminDataTable
                    data={data as GeneralListItem[]}
                    columns={listColumns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </Tabs>

      {/* Provider Detail Dialog */}
      <ProviderDetailDialog
        provider={selectedProvider}
        allProviders={allProviders}
        open={!!selectedProvider}
        onOpenChange={(open) => !open && setSelectedProvider(null)}
        onSave={updateProvider}
      />

      {/* Add/Edit Dialog for non-provider items */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>

          {isBenefitsTab ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={benefitForm.name}
                  onChange={(e) =>
                    setBenefitForm({ ...benefitForm, name: e.target.value })
                  }
                  placeholder="Enter benefit name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field_mapping">Field Mapping</Label>
                <Input
                  id="field_mapping"
                  value={benefitForm.field_mapping}
                  onChange={(e) =>
                    setBenefitForm({ ...benefitForm, field_mapping: e.target.value })
                  }
                  placeholder="e.g., premium_amount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={benefitForm.display_order}
                    onChange={(e) =>
                      setBenefitForm({ ...benefitForm, display_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor="is_mapped" className="text-sm">Is Mapped</Label>
                  <Switch
                    id="is_mapped"
                    checked={benefitForm.is_mapped}
                    onCheckedChange={(checked) =>
                      setBenefitForm({ ...benefitForm, is_mapped: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={benefitForm.is_active}
                  onCheckedChange={(checked) =>
                    setBenefitForm({ ...benefitForm, is_active: checked })
                  }
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={listForm.code}
                    onChange={(e) =>
                      setListForm({ ...listForm, code: e.target.value })
                    }
                    placeholder="e.g., PROD_001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={listForm.display_order}
                    onChange={(e) =>
                      setListForm({ ...listForm, display_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={listForm.name}
                  onChange={(e) =>
                    setListForm({ ...listForm, name: e.target.value })
                  }
                  placeholder="Enter name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={listForm.description}
                  onChange={(e) =>
                    setListForm({ ...listForm, description: e.target.value })
                  }
                  placeholder="Enter description"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={listForm.is_active}
                  onCheckedChange={(checked) =>
                    setListForm({ ...listForm, is_active: checked })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editItem ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
