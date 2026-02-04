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

interface CommunicationSetting {
  id: string;
  channel: string;
  provider: string | null;
  settings: Json;
  is_active: boolean | null;
}

const tabToChannel: Record<string, string> = {
  "email-settings": "email",
  "whatsapp": "whatsapp",
  "sms": "sms",
  "push-notifications": "push",
};

const channelOptions = ["email", "whatsapp", "sms", "push"];

export function CommunicationSection() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "email-settings";

  const section = adminSections.find((s) => s.id === "communication");
  const tabs = section?.tabs || [];

  const channel = tabToChannel[activeTab] || "email";

  const { data, isLoading, searchTerm, setSearchTerm, create, update, delete: deleteItem, refetch } = useAdminData<CommunicationSetting>({
    table: "admin_communication_settings",
    filters: { channel },
    orderBy: { column: "created_at", ascending: false },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<CommunicationSetting | null>(null);
  const [formData, setFormData] = useState({
    channel: "email",
    provider: "",
    settings: "{}",
    is_active: true,
  });

  const formatSettings = (settings: Json): string => {
    if (!settings || typeof settings !== "object") return "—";
    const obj = settings as Record<string, unknown>;
    const keys = Object.keys(obj).slice(0, 3);
    if (keys.length === 0) return "—";
    return keys.map(k => `${k}: ${obj[k]}`).join(", ") + (Object.keys(obj).length > 3 ? "..." : "");
  };

  const columns: ColumnDef<CommunicationSetting>[] = [
    { header: "Channel", accessor: "channel", sortable: true },
    { header: "Provider", accessor: "provider", sortable: true },
    {
      header: "Settings",
      accessor: "settings",
      render: (value) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {formatSettings(value as Json)}
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
      channel,
      provider: "",
      settings: "{}",
      is_active: true,
    });
    setShowDialog(true);
  };

  const handleEdit = (item: CommunicationSetting) => {
    setEditItem(item);
    setFormData({
      channel: item.channel,
      provider: item.provider || "",
      settings: JSON.stringify(item.settings, null, 2),
      is_active: item.is_active ?? true,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.channel) return;

    let parsedSettings: Json = {};
    try {
      parsedSettings = JSON.parse(formData.settings);
    } catch {
      parsedSettings = {};
    }

    const payload = {
      channel: formData.channel,
      provider: formData.provider || null,
      settings: parsedSettings,
      is_active: formData.is_active,
    };

    if (editItem) {
      await update({ id: editItem.id, ...payload });
    } else {
      await create(payload);
    }
    setShowDialog(false);
  };

  const handleDelete = async (item: CommunicationSetting) => {
    await deleteItem(item.id);
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => navigate(`/administration/communication/${v}`)}
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
            title={tabs.find((t) => t.id === activeTab)?.label || "Communication"}
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
              {editItem ? "Edit Communication Setting" : "Add New Setting"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select
                value={formData.channel}
                onValueChange={(value) =>
                  setFormData({ ...formData, channel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {channelOptions.map((ch) => (
                    <SelectItem key={ch} value={ch}>
                      {ch.charAt(0).toUpperCase() + ch.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) =>
                  setFormData({ ...formData, provider: e.target.value })
                }
                placeholder="e.g., SendGrid, Twilio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings">Settings (JSON)</Label>
              <Textarea
                id="settings"
                value={formData.settings}
                onChange={(e) =>
                  setFormData({ ...formData, settings: e.target.value })
                }
                placeholder='{"api_key": "xxx", "from_address": "..."}'
                className="font-mono text-sm min-h-[120px]"
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
