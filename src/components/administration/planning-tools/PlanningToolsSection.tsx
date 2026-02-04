import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminData } from "@/hooks/useAdminData";
import { AdminSectionHeader } from "../AdminSectionHeader";
import { AdminDataTable, ColumnDef, StatusBadge } from "../AdminDataTable";
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

interface GeneralListItem {
  id: string;
  list_type: string;
  code: string;
  name: string;
  name_secondary: string | null;
  description: string | null;
  display_order: number | null;
  is_active: boolean;
}

const tabToListType: Record<string, string> = {
  "bucket-settings": "bucket_settings",
  "goal-categories": "goal_categories",
  "risk-profiles": "risk_profiles",
};

export function PlanningToolsSection() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "bucket-settings";

  const section = adminSections.find((s) => s.id === "planning-tools");
  const tabs = section?.tabs || [];

  const listType = tabToListType[activeTab] || "bucket_settings";

  const { data, isLoading, searchTerm, setSearchTerm, create, update, delete: deleteItem, refetch } = useAdminData<GeneralListItem>({
    table: "admin_general_lists",
    filters: { list_type: listType },
    orderBy: { column: "display_order", ascending: true },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<GeneralListItem | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    name_secondary: "",
    description: "",
    display_order: 0,
    is_active: true,
  });

  const columns: ColumnDef<GeneralListItem>[] = [
    { header: "Code", accessor: "code", sortable: true },
    { header: "Name", accessor: "name", sortable: true },
    { header: "Secondary Name", accessor: "name_secondary" },
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
    setFormData({
      code: "",
      name: "",
      name_secondary: "",
      description: "",
      display_order: data.length + 1,
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
      display_order: item.display_order || 0,
      is_active: item.is_active,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim()) return;

    const payload = {
      ...formData,
      list_type: listType,
      name_secondary: formData.name_secondary || null,
      description: formData.description || null,
    };

    if (editItem) {
      await update({ id: editItem.id, ...payload });
    } else {
      await create(payload);
    }
    setShowDialog(false);
  };

  const handleDelete = async (item: GeneralListItem) => {
    await deleteItem(item.id);
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => navigate(`/administration/planning-tools/${v}`)}
      >
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <AdminSectionHeader
            title={tabs.find((t) => t.id === activeTab)?.label || "Planning Tools"}
            itemCount={data.length}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            onAdd={handleAdd}
            onReset={() => refetch()}
          />

          <div className="mt-4">
            <AdminDataTable
              data={data}
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
                  placeholder="e.g., BUCKET_01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
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
