import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAdminData } from "@/hooks/useAdminData";
import { AdminSectionHeader } from "../AdminSectionHeader";
import { AdminDataTable, ColumnDef, ImportStatusBadge, formatDuration } from "../AdminDataTable";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface DataImport {
  id: string;
  import_name: string;
  import_type: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  duration_seconds: number | null;
  total_lines: number | null;
  processed_items: number | null;
  total_items: number | null;
  progress_percentage: number | null;
  changed_by: string | null;
  source_reference: string | null;
  error_message: string | null;
}

const importTypes = [
  "bookreport",
  "commission",
  "crs",
  "fatca",
  "client_data",
  "transactions",
  "funds",
  "providers",
];

const statusOptions = ["Pending", "In Progress", "Paused", "Completed", "Failed", "Cancelled"];

export function DataIntegrationsSection() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "activity";

  const section = adminSections.find((s) => s.id === "data-integrations");
  const tabs = section?.tabs || [];

  const { data, isLoading, searchTerm, setSearchTerm, create, update, delete: deleteItem, refetch } = useAdminData<DataImport>({
    table: "admin_data_imports",
    orderBy: { column: "created_at", ascending: false },
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<DataImport | null>(null);
  const [formData, setFormData] = useState({
    import_name: "",
    import_type: "bookreport",
    status: "Pending",
    source_reference: "",
  });

  const columns: ColumnDef<DataImport>[] = [
    { header: "Import Name", accessor: "import_name", sortable: true },
    { header: "Type", accessor: "import_type", sortable: true },
    {
      header: "Status",
      accessor: "status",
      render: (value) => <ImportStatusBadge status={value as string} />,
    },
    {
      header: "Start Time",
      accessor: "start_time",
      render: (value) =>
        value ? format(new Date(value as string), "dd MMM yyyy HH:mm") : "—",
    },
    {
      header: "Duration",
      accessor: "duration_seconds",
      render: (value) => formatDuration(value as number | null),
    },
    { header: "Lines", accessor: "total_lines" },
    {
      header: "Progress",
      accessor: "progress_percentage",
      render: (value, item) => {
        const progress = (value as number) || 0;
        if (item.status === "In Progress") {
          return (
            <div className="flex items-center gap-2 min-w-[100px]">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          );
        }
        return item.processed_items ? `${item.processed_items}/${item.total_items || 0}` : "—";
      },
    },
    { header: "Changed By", accessor: "changed_by" },
  ];

  const handleAdd = () => {
    setEditItem(null);
    setFormData({
      import_name: "",
      import_type: "bookreport",
      status: "Pending",
      source_reference: "",
    });
    setShowDialog(true);
  };

  const handleEdit = (item: DataImport) => {
    setEditItem(item);
    setFormData({
      import_name: item.import_name,
      import_type: item.import_type,
      status: item.status,
      source_reference: item.source_reference || "",
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.import_name.trim()) return;

    if (editItem) {
      await update({ id: editItem.id, ...formData });
    } else {
      await create(formData);
    }
    setShowDialog(false);
  };

  const handleDelete = async (item: DataImport) => {
    await deleteItem(item.id);
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => navigate(`/administration/data-integrations/${v}`)}
      >
        <TabsList className="flex-wrap h-auto gap-1">
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <AdminSectionHeader
            title={tabs.find((t) => t.id === activeTab)?.label || "Data Integrations"}
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
              {editItem ? "Edit Import" : "Add New Import"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import_name">Import Name</Label>
              <Input
                id="import_name"
                value={formData.import_name}
                onChange={(e) =>
                  setFormData({ ...formData, import_name: e.target.value })
                }
                placeholder="Enter import name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="import_type">Import Type</Label>
              <Select
                value={formData.import_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, import_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {importTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_reference">Source Reference</Label>
              <Input
                id="source_reference"
                value={formData.source_reference}
                onChange={(e) =>
                  setFormData({ ...formData, source_reference: e.target.value })
                }
                placeholder="e.g., Provider name"
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
