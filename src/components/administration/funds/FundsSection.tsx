import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Switch } from "@/components/ui/switch";
import { ExternalLink } from "lucide-react";

interface AdminFund {
  id: string;
  name: string;
  code: string | null;
  isin: string | null;
  fund_manager: string | null;
  fund_fact_sheet_url: string | null;
  source: string | null;
  asset_classes: number | null;
  is_allocation_approved: boolean | null;
  cat1_status: string | null;
  cat2_status: string | null;
  domicile: string | null;
  fund_type: string | null;
  location: string | null;
  industry: string | null;
  sector: string | null;
  exchange: string | null;
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

type FundItem = AdminFund | GeneralListItem;

const tabToListType: Record<string, string> = {
  "exchanges": "exchanges",
  "sectors": "sectors",
  "industries": "industries",
  "unlisted": "unlisted_funds",
};

export function FundsSection() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "instruments";

  const section = adminSections.find((s) => s.id === "funds");
  const tabs = section?.tabs || [];

  const isInstrumentsTab = activeTab === "instruments";
  const listType = tabToListType[activeTab];

  const fundsHook = useAdminData<AdminFund>({
    table: "admin_funds",
    orderBy: { column: "name", ascending: true },
  });

  const listHook = useAdminData<GeneralListItem>({
    table: "admin_general_lists",
    filters: listType ? { list_type: listType } : undefined,
    orderBy: { column: "name", ascending: true },
  });

  const { data, isLoading, searchTerm, setSearchTerm, create, update, delete: deleteItem, refetch } = 
    isInstrumentsTab ? fundsHook : listHook;

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<FundItem | null>(null);

  // Fund form
  const [fundForm, setFundForm] = useState({
    name: "",
    code: "",
    isin: "",
    fund_manager: "",
    fund_fact_sheet_url: "",
    source: "",
    asset_classes: 0,
    is_allocation_approved: false,
    cat1_status: "",
    cat2_status: "",
    domicile: "",
    fund_type: "",
    location: "",
    is_active: true,
  });

  // List form
  const [listForm, setListForm] = useState({
    code: "",
    name: "",
    description: "",
    display_order: 0,
    is_active: true,
  });

  const fundColumns: ColumnDef<AdminFund>[] = [
    { header: "Name", accessor: "name", sortable: true },
    { header: "Code", accessor: "code" },
    { header: "ISIN", accessor: "isin" },
    { header: "Fund Manager", accessor: "fund_manager" },
    {
      header: "Fact Sheet",
      accessor: "fund_fact_sheet_url",
      render: (value) =>
        value ? (
          <a
            href={value as string}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </a>
        ) : (
          "—"
        ),
    },
    { header: "Source", accessor: "source" },
    { header: "Assets", accessor: "asset_classes" },
    {
      header: "Approved",
      accessor: "is_allocation_approved",
      render: (value) => <BooleanIndicator value={value as boolean} />,
    },
    { header: "Cat I", accessor: "cat1_status" },
    { header: "Cat II", accessor: "cat2_status" },
    { header: "Domicile", accessor: "domicile" },
    { header: "Location", accessor: "location" },
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
    if (isInstrumentsTab) {
      setFundForm({
        name: "",
        code: "",
        isin: "",
        fund_manager: "",
        fund_fact_sheet_url: "",
        source: "",
        asset_classes: 0,
        is_allocation_approved: false,
        cat1_status: "",
        cat2_status: "",
        domicile: "",
        fund_type: "",
        location: "",
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

  const handleEdit = (item: FundItem) => {
    setEditItem(item);
    if (isInstrumentsTab) {
      const fund = item as AdminFund;
      setFundForm({
        name: fund.name,
        code: fund.code || "",
        isin: fund.isin || "",
        fund_manager: fund.fund_manager || "",
        fund_fact_sheet_url: fund.fund_fact_sheet_url || "",
        source: fund.source || "",
        asset_classes: fund.asset_classes || 0,
        is_allocation_approved: fund.is_allocation_approved ?? false,
        cat1_status: fund.cat1_status || "",
        cat2_status: fund.cat2_status || "",
        domicile: fund.domicile || "",
        fund_type: fund.fund_type || "",
        location: fund.location || "",
        is_active: fund.is_active ?? true,
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
    if (isInstrumentsTab) {
      if (!fundForm.name.trim()) return;
      const payload = {
        ...fundForm,
        code: fundForm.code || null,
        isin: fundForm.isin || null,
        fund_manager: fundForm.fund_manager || null,
        fund_fact_sheet_url: fundForm.fund_fact_sheet_url || null,
        source: fundForm.source || null,
        cat1_status: fundForm.cat1_status || null,
        cat2_status: fundForm.cat2_status || null,
        domicile: fundForm.domicile || null,
        fund_type: fundForm.fund_type || null,
        location: fundForm.location || null,
      };
      if (editItem) {
        await update({ id: editItem.id, ...payload });
      } else {
        await create(payload);
      }
    } else {
      if (!listForm.code.trim() || !listForm.name.trim()) return;
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

  const handleDelete = async (item: FundItem) => {
    await deleteItem(item.id);
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => navigate(`/administration/funds/${v}`)}
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
            title={tabs.find((t) => t.id === activeTab)?.label || "Funds & Instruments"}
            itemCount={data.length}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            onAdd={handleAdd}
            onReset={() => refetch()}
          />

          <div className="mt-4">
            {isInstrumentsTab ? (
              <AdminDataTable
                data={data as AdminFund[]}
                columns={fundColumns}
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
        </div>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className={isInstrumentsTab ? "max-w-3xl" : ""}>
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>

          {isInstrumentsTab ? (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={fundForm.name}
                    onChange={(e) =>
                      setFundForm({ ...fundForm, name: e.target.value })
                    }
                    placeholder="Fund name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={fundForm.code}
                    onChange={(e) =>
                      setFundForm({ ...fundForm, code: e.target.value })
                    }
                    placeholder="e.g., FND001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isin">ISIN</Label>
                  <Input
                    id="isin"
                    value={fundForm.isin}
                    onChange={(e) =>
                      setFundForm({ ...fundForm, isin: e.target.value })
                    }
                    placeholder="ISIN code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fund_manager">Fund Manager</Label>
                  <Input
                    id="fund_manager"
                    value={fundForm.fund_manager}
                    onChange={(e) =>
                      setFundForm({ ...fundForm, fund_manager: e.target.value })
                    }
                    placeholder="Manager name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fund_fact_sheet_url">Fact Sheet URL</Label>
                  <Input
                    id="fund_fact_sheet_url"
                    value={fundForm.fund_fact_sheet_url}
                    onChange={(e) =>
                      setFundForm({ ...fundForm, fund_fact_sheet_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={fundForm.source}
                    onChange={(e) =>
                      setFundForm({ ...fundForm, source: e.target.value })
                    }
                    placeholder="e.g., Bookreport"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset_classes">Asset Classes</Label>
                  <Input
                    id="asset_classes"
                    type="number"
                    value={fundForm.asset_classes}
                    onChange={(e) =>
                      setFundForm({ ...fundForm, asset_classes: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg mt-6">
                  <Label htmlFor="is_allocation_approved" className="text-sm">Approved</Label>
                  <Switch
                    id="is_allocation_approved"
                    checked={fundForm.is_allocation_approved}
                    onCheckedChange={(checked) =>
                      setFundForm({ ...fundForm, is_allocation_approved: checked })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cat1_status">Cat I Status</Label>
                  <Input
                    id="cat1_status"
                    value={fundForm.cat1_status}
                    onChange={(e) =>
                      setFundForm({ ...fundForm, cat1_status: e.target.value })
                    }
                    placeholder="e.g., Core"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat2_status">Cat II Status</Label>
                  <Input
                    id="cat2_status"
                    value={fundForm.cat2_status}
                    onChange={(e) =>
                      setFundForm({ ...fundForm, cat2_status: e.target.value })
                    }
                    placeholder="e.g., Non-Core"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="domicile">Domicile</Label>
                  <Input
                    id="domicile"
                    value={fundForm.domicile}
                    onChange={(e) =>
                      setFundForm({ ...fundForm, domicile: e.target.value })
                    }
                    placeholder="Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fund_type">Fund Type</Label>
                  <Input
                    id="fund_type"
                    value={fundForm.fund_type}
                    onChange={(e) =>
                      setFundForm({ ...fundForm, fund_type: e.target.value })
                    }
                    placeholder="Type"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={fundForm.location}
                    onChange={(e) =>
                      setFundForm({ ...fundForm, location: e.target.value })
                    }
                    placeholder="Location"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={fundForm.is_active}
                  onCheckedChange={(checked) =>
                    setFundForm({ ...fundForm, is_active: checked })
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
                    placeholder="e.g., EXC_001"
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
                <Input
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
