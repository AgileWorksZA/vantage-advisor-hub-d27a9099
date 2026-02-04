import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Json } from "@/integrations/supabase/types";

interface AdminEvent {
  id: string;
  name: string;
  module: string;
  trigger_type: string;
  trigger_conditions: Json;
  actions: Json;
  is_active: boolean | null;
}

const moduleOptions = [
  "Documents",
  "Compliance",
  "Notes",
  "Tasks",
  "Products",
  "Clients",
  "Communications",
  "Calendar",
];

const triggerTypeOptions = [
  "Outstanding",
  "Import failure",
  "Risk Rating Changed",
  "Document Expired",
  "Task Overdue",
  "Client Created",
  "Product Added",
  "Scheduled",
];

export function EventsSection() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "events-list";

  const section = adminSections.find((s) => s.id === "events");
  const tabs = section?.tabs || [];

  const { data, isLoading, searchTerm, setSearchTerm, create, update, delete: deleteItem, refetch } = useAdminData<AdminEvent>({
    table: "admin_events",
    orderBy: { column: "name", ascending: true },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<AdminEvent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    module: "Documents",
    trigger_type: "Outstanding",
    trigger_conditions: "{}",
    actions: "[]",
    is_active: true,
  });

  const formatJsonSummary = (json: Json): string => {
    if (!json) return "—";
    if (Array.isArray(json)) {
      return json.length > 0 ? `${json.length} action(s)` : "None";
    }
    if (typeof json === "object") {
      const keys = Object.keys(json);
      return keys.length > 0 ? keys.slice(0, 2).join(", ") + (keys.length > 2 ? "..." : "") : "—";
    }
    return String(json);
  };

  const columns: ColumnDef<AdminEvent>[] = [
    { header: "Name", accessor: "name", sortable: true },
    { header: "Module", accessor: "module", sortable: true },
    { header: "Trigger Type", accessor: "trigger_type", sortable: true },
    {
      header: "Conditions",
      accessor: "trigger_conditions",
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {formatJsonSummary(value as Json)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {formatJsonSummary(value as Json)}
        </span>
      ),
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
      name: "",
      module: "Documents",
      trigger_type: "Outstanding",
      trigger_conditions: "{}",
      actions: "[]",
      is_active: true,
    });
    setShowDialog(true);
  };

  const handleEdit = (item: AdminEvent) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      module: item.module,
      trigger_type: item.trigger_type,
      trigger_conditions: JSON.stringify(item.trigger_conditions, null, 2),
      actions: JSON.stringify(item.actions, null, 2),
      is_active: item.is_active ?? true,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    let parsedConditions: Json = {};
    let parsedActions: Json = [];
    
    try {
      parsedConditions = JSON.parse(formData.trigger_conditions);
    } catch {
      parsedConditions = {};
    }
    
    try {
      parsedActions = JSON.parse(formData.actions);
    } catch {
      parsedActions = [];
    }

    const payload = {
      name: formData.name,
      module: formData.module,
      trigger_type: formData.trigger_type,
      trigger_conditions: parsedConditions,
      actions: parsedActions,
      is_active: formData.is_active,
    };

    if (editItem) {
      await update({ id: editItem.id, ...payload });
    } else {
      await create(payload);
    }
    setShowDialog(false);
  };

  const handleDelete = async (item: AdminEvent) => {
    await deleteItem(item.id);
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => navigate(`/administration/events/${v}`)}
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
            title={tabs.find((t) => t.id === activeTab)?.label || "Events"}
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
              {editItem ? "Edit Event" : "Add New Event"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter event name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="module">Module</Label>
                <Select
                  value={formData.module}
                  onValueChange={(value) =>
                    setFormData({ ...formData, module: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {moduleOptions.map((mod) => (
                      <SelectItem key={mod} value={mod}>
                        {mod}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger_type">Trigger Type</Label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, trigger_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypeOptions.map((trigger) => (
                      <SelectItem key={trigger} value={trigger}>
                        {trigger}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger_conditions">Trigger Conditions (JSON)</Label>
              <Textarea
                id="trigger_conditions"
                value={formData.trigger_conditions}
                onChange={(e) =>
                  setFormData({ ...formData, trigger_conditions: e.target.value })
                }
                placeholder='{"field": "value", "operator": "equals"}'
                className="font-mono text-sm min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actions">Actions (JSON Array)</Label>
              <Textarea
                id="actions"
                value={formData.actions}
                onChange={(e) =>
                  setFormData({ ...formData, actions: e.target.value })
                }
                placeholder='[{"type": "send_email", "to": "..."}, ...]'
                className="font-mono text-sm min-h-[80px]"
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
