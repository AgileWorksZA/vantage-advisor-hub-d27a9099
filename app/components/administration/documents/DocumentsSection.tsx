import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAdminData } from "@/hooks/useAdminData";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentTemplate {
  id: string;
  code: string;
  name: string;
  name_secondary: string | null;
  category: string;
  has_content: boolean | null;
  can_public_upload: boolean | null;
  requires_workflow_signature: boolean | null;
  content_template: string | null;
  is_active: boolean | null;
}

const categoryOptions = [
  "Client Documents",
  "Compliance",
  "Contracts",
  "Reports",
  "Templates",
  "Signatures",
  "Public Upload",
];

export function DocumentsSection() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "document-types";

  const section = adminSections.find((s) => s.id === "documents");
  const tabs = section?.tabs || [];

  const { data, isLoading, searchTerm, setSearchTerm, create, update, delete: deleteItem, refetch } = useAdminData<DocumentTemplate>({
    table: "admin_document_templates",
    orderBy: { column: "name", ascending: true },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    name_secondary: "",
    category: "Client Documents",
    has_content: false,
    can_public_upload: false,
    requires_workflow_signature: false,
    content_template: "",
    is_active: true,
  });

  const columns: ColumnDef<DocumentTemplate>[] = [
    { header: "Code", accessor: "code", sortable: true },
    { header: "Name", accessor: "name", sortable: true },
    { header: "Secondary Name", accessor: "name_secondary" },
    { header: "Category", accessor: "category", sortable: true },
    {
      header: "Has Content",
      accessor: "has_content",
      render: (value) => <BooleanIndicator value={value as boolean} />,
    },
    {
      header: "Public Upload",
      accessor: "can_public_upload",
      render: (value) => <BooleanIndicator value={value as boolean} />,
    },
    {
      header: "Workflow Sig",
      accessor: "requires_workflow_signature",
      render: (value) => <BooleanIndicator value={value as boolean} />,
    },
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
      category: "Client Documents",
      has_content: false,
      can_public_upload: false,
      requires_workflow_signature: false,
      content_template: "",
      is_active: true,
    });
    setShowDialog(true);
  };

  const handleEdit = (item: DocumentTemplate) => {
    setEditItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      name_secondary: item.name_secondary || "",
      category: item.category,
      has_content: item.has_content ?? false,
      can_public_upload: item.can_public_upload ?? false,
      requires_workflow_signature: item.requires_workflow_signature ?? false,
      content_template: item.content_template || "",
      is_active: item.is_active ?? true,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim()) return;

    const payload = {
      ...formData,
      name_secondary: formData.name_secondary || null,
      content_template: formData.content_template || null,
    };

    if (editItem) {
      await update({ id: editItem.id, ...payload });
    } else {
      await create(payload);
    }
    setShowDialog(false);
  };

  const handleDelete = async (item: DocumentTemplate) => {
    await deleteItem(item.id);
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => navigate(`/administration/documents/${v}`)}
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
            title={tabs.find((t) => t.id === activeTab)?.label || "Documents"}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Document Template" : "Add New Document Template"}
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
                  placeholder="e.g., DOC_001"
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
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                placeholder="Enter document name"
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

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="has_content" className="text-sm">Has Content</Label>
                <Switch
                  id="has_content"
                  checked={formData.has_content}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, has_content: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="can_public_upload" className="text-sm">Public Upload</Label>
                <Switch
                  id="can_public_upload"
                  checked={formData.can_public_upload}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, can_public_upload: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor="requires_workflow_signature" className="text-sm">Workflow Signature</Label>
                <Switch
                  id="requires_workflow_signature"
                  checked={formData.requires_workflow_signature}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requires_workflow_signature: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_template">Content Template (HTML)</Label>
              <Textarea
                id="content_template"
                value={formData.content_template}
                onChange={(e) =>
                  setFormData({ ...formData, content_template: e.target.value })
                }
                placeholder="<html>...</html>"
                className="font-mono text-sm min-h-[100px]"
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
