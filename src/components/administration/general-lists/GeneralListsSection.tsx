import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminSectionHeader } from "../AdminSectionHeader";
import { AdminDataTable, ColumnDef, StatusBadge } from "../AdminDataTable";
import { useAdminGeneralList } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminSections } from "../AdminLayout";

interface GeneralListItem {
  id: string;
  list_type: string;
  code: string;
  name: string;
  name_secondary?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

const listTypeMap: Record<string, string> = {
  "advisor-codes": "advisor_codes",
  "banks": "banks",
  "currencies": "currencies",
  "campaigns": "campaigns",
  "corporate": "corporate_types",
  "crm-details": "crm_details",
  "ibase": "ibase",
  "locations": "locations",
  "service": "service_types",
  "sanction-lists": "sanction_list_sources",
  "alternate-providers": "alternate_providers",
  "sub-agents": "sub_agents",
  "portfolio-categories": "portfolio_categories",
  "acquisition-sources": "acquisition_sources",
  "sources": "sources",
  "wealth-sources": "wealth_sources",
  "fund-sources": "fund_sources",
};

export function GeneralListsSection() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "advisor-codes";
  const listType = listTypeMap[activeTab] || "advisor_codes";

  const {
    data,
    isLoading,
    searchTerm,
    setSearchTerm,
    create,
    update,
    delete: deleteItem,
    refetch,
  } = useAdminGeneralList(listType);

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<GeneralListItem | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    name_secondary: "",
    description: "",
    is_active: true,
  });

  const section = adminSections.find((s) => s.id === "general-lists");
  const tabs = section?.tabs || [];

  const columns: ColumnDef<GeneralListItem>[] = [
    { header: "Code", accessor: "code", sortable: true },
    { header: "Name", accessor: "name", sortable: true },
    { header: "Secondary Name", accessor: "name_secondary" },
    { header: "Description", accessor: "description" },
    {
      header: "Status",
      accessor: "is_active",
      render: (value) => <StatusBadge isActive={value as boolean} />,
    },
  ];

  const handleAdd = () => {
    setEditItem(null);
    setFormData({
      code: "",
      name: "",
      name_secondary: "",
      description: "",
      is_active: true,
    });
    setShowDialog(true);
  };

  const handleEdit = (item: GeneralListItem) => {
    setEditItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      name_secondary: item.name_secondary || "",
      description: item.description || "",
      is_active: item.is_active,
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editItem) {
      update({ id: editItem.id, updates: formData });
    } else {
      create({ ...formData, list_type: listType });
    }
    setShowDialog(false);
  };

  const handleDelete = (item: GeneralListItem) => {
    deleteItem(item.id);
  };

  const handleTabChange = (value: string) => {
    navigate(`/administration/general-lists/${value}`);
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <AdminSectionHeader
            title={tabs.find((t) => t.id === activeTab)?.label || "General Lists"}
            itemCount={data.length}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            onAdd={handleAdd}
            onReset={() => refetch()}
          />

          <div className="mt-4">
            <AdminDataTable
              data={data as unknown as GeneralListItem[]}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          </div>
        </div>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="Enter code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_secondary">Secondary Name</Label>
              <Input
                id="name_secondary"
                value={formData.name_secondary}
                onChange={(e) =>
                  setFormData({ ...formData, name_secondary: e.target.value })
                }
                placeholder="e.g., Afrikaans name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter description"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>
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
