import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminData } from "@/hooks/useAdminData";
import { AdminSectionHeader } from "../AdminSectionHeader";
import { AdminDataTable, ColumnDef } from "../AdminDataTable";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Json } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: Json;
  category: string;
  description: string | null;
}

const tabToCategory: Record<string, string> = {
  "general": "general",
  "audit": "audit",
  "permissions": "permissions",
};

const categoryOptions = ["general", "security", "display", "audit", "permissions", "notifications"];

export function SystemSettingsSection() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "general";

  const section = adminSections.find((s) => s.id === "system");
  const tabs = section?.tabs || [];

  const category = tabToCategory[activeTab] || "general";

  const { data, isLoading, searchTerm, setSearchTerm, create, update, delete: deleteItem, refetch } = useAdminData<SystemSetting>({
    table: "admin_system_settings",
    filters: { category },
    orderBy: { column: "setting_key", ascending: true },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<SystemSetting | null>(null);
  const [formData, setFormData] = useState({
    setting_key: "",
    setting_value: "{}",
    category: "general",
    description: "",
  });

  const formatValue = (value: Json): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "object") {
      const str = JSON.stringify(value);
      return str.length > 50 ? str.substring(0, 50) + "..." : str;
    }
    return String(value);
  };

  const columns: ColumnDef<SystemSetting>[] = [
    { header: "Setting Key", accessor: "setting_key", sortable: true },
    {
      header: "Value",
      accessor: "setting_value",
      render: (value) => (
        <code className="text-sm bg-muted px-2 py-1 rounded">
          {formatValue(value as Json)}
        </code>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      render: (value) => (
        <Badge variant="outline">{value as string}</Badge>
      ),
    },
    { header: "Description", accessor: "description" },
  ];

  const handleAdd = () => {
    setEditItem(null);
    setFormData({
      setting_key: "",
      setting_value: "{}",
      category,
      description: "",
    });
    setShowDialog(true);
  };

  const handleEdit = (item: SystemSetting) => {
    setEditItem(item);
    setFormData({
      setting_key: item.setting_key,
      setting_value: JSON.stringify(item.setting_value, null, 2),
      category: item.category,
      description: item.description || "",
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.setting_key.trim()) return;

    let parsedValue: Json = {};
    try {
      parsedValue = JSON.parse(formData.setting_value);
    } catch {
      // If not valid JSON, store as string
      parsedValue = formData.setting_value;
    }

    const payload = {
      setting_key: formData.setting_key,
      setting_value: parsedValue,
      category: formData.category,
      description: formData.description || null,
    };

    if (editItem) {
      await update({ id: editItem.id, ...payload });
    } else {
      await create(payload);
    }
    setShowDialog(false);
  };

  const handleDelete = async (item: SystemSetting) => {
    await deleteItem(item.id);
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => navigate(`/administration/system/${v}`)}
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
            title={tabs.find((t) => t.id === activeTab)?.label || "System Settings"}
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
              {editItem ? "Edit Setting" : "Add New Setting"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="setting_key">Setting Key</Label>
              <Input
                id="setting_key"
                value={formData.setting_key}
                onChange={(e) =>
                  setFormData({ ...formData, setting_key: e.target.value })
                }
                placeholder="e.g., default_currency"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setting_value">Value (JSON or String)</Label>
              <Textarea
                id="setting_value"
                value={formData.setting_value}
                onChange={(e) =>
                  setFormData({ ...formData, setting_value: e.target.value })
                }
                placeholder='{"key": "value"} or "simple string"'
                className="font-mono text-sm min-h-[100px]"
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
                placeholder="Describe what this setting controls"
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
