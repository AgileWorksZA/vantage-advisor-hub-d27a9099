import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Link2, Loader2 } from "lucide-react";
import { useClientAssets, ClientAsset } from "@/hooks/useClientAssets";
import { useClientLiabilities, ClientLiability } from "@/hooks/useClientLiabilities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AssetsLiabilitiesManagerProps {
  clientId: string;
  onDataChange: () => void;
}

const ASSET_TYPES = ["Property", "Vehicle", "Savings", "Investment", "Retirement", "Business", "Personal", "Other"];
const LIABILITY_TYPES = ["Bond", "Vehicle Finance", "Personal Loan", "Credit Card", "Overdraft", "Student Loan", "Other"];

export const AssetsLiabilitiesManager = ({ clientId, onDataChange }: AssetsLiabilitiesManagerProps) => {
  const { assets, loading: assetsLoading, addAsset, updateAsset, deleteAsset, getTotalAssets } = useClientAssets(clientId);
  const { liabilities, loading: liabilitiesLoading, addLiability, updateLiability, deleteLiability, getTotalLiabilities } = useClientLiabilities(clientId);

  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [showLiabilityDialog, setShowLiabilityDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ClientAsset | null>(null);
  const [editingLiability, setEditingLiability] = useState<ClientLiability | null>(null);

  const [assetForm, setAssetForm] = useState({
    asset_type: "Property",
    name: "",
    current_value: 0,
    purchase_value: 0,
    notes: "",
  });

  const [liabilityForm, setLiabilityForm] = useState({
    liability_type: "Bond",
    name: "",
    original_amount: 0,
    current_balance: 0,
    interest_rate: 0,
    monthly_payment: 0,
    creditor_name: "",
    linked_asset_id: "",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddAsset = () => {
    setEditingAsset(null);
    setAssetForm({ asset_type: "Property", name: "", current_value: 0, purchase_value: 0, notes: "" });
    setShowAssetDialog(true);
  };

  const handleEditAsset = (asset: ClientAsset) => {
    setEditingAsset(asset);
    setAssetForm({
      asset_type: asset.asset_type,
      name: asset.name,
      current_value: asset.current_value,
      purchase_value: asset.purchase_value || 0,
      notes: asset.notes || "",
    });
    setShowAssetDialog(true);
  };

  const handleSaveAsset = async () => {
    if (editingAsset) {
      await updateAsset(editingAsset.id, assetForm);
    } else {
      await addAsset({
        client_id: clientId,
        ...assetForm,
        purchase_value: assetForm.purchase_value || null,
        purchase_date: null,
        growth_rate: null,
        linked_income_id: null,
        linked_liability_id: null,
        notes: assetForm.notes || null,
        is_portal_visible: true,
      });
    }
    setShowAssetDialog(false);
    onDataChange();
  };

  const handleAddLiability = () => {
    setEditingLiability(null);
    setLiabilityForm({
      liability_type: "Bond",
      name: "",
      original_amount: 0,
      current_balance: 0,
      interest_rate: 0,
      monthly_payment: 0,
      creditor_name: "",
      linked_asset_id: "",
    });
    setShowLiabilityDialog(true);
  };

  const handleEditLiability = (liability: ClientLiability) => {
    setEditingLiability(liability);
    setLiabilityForm({
      liability_type: liability.liability_type,
      name: liability.name,
      original_amount: liability.original_amount,
      current_balance: liability.current_balance,
      interest_rate: liability.interest_rate || 0,
      monthly_payment: liability.monthly_payment || 0,
      creditor_name: liability.creditor_name || "",
      linked_asset_id: liability.linked_asset_id || "",
    });
    setShowLiabilityDialog(true);
  };

  const handleSaveLiability = async () => {
    if (editingLiability) {
      await updateLiability(editingLiability.id, liabilityForm);
    } else {
      await addLiability({
        client_id: clientId,
        ...liabilityForm,
        interest_rate: liabilityForm.interest_rate || null,
        monthly_payment: liabilityForm.monthly_payment || null,
        term_months: null,
        start_date: null,
        end_date: null,
        linked_asset_id: liabilityForm.linked_asset_id || null,
        creditor_name: liabilityForm.creditor_name || null,
        is_portal_visible: true,
      });
    }
    setShowLiabilityDialog(false);
    onDataChange();
  };

  const netWorth = getTotalAssets() - getTotalLiabilities();

  if (assetsLoading || liabilitiesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Assets</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(getTotalAssets())}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Liabilities</p>
          <p className="text-lg font-bold text-destructive">{formatCurrency(getTotalLiabilities())}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Net Worth</p>
          <p className={`text-lg font-bold ${netWorth >= 0 ? "text-primary" : "text-destructive"}`}>
            {formatCurrency(netWorth)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="assets">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">Assets ({assets.length})</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities ({liabilities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleAddAsset} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Asset
            </Button>
          </div>

          {assets.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No assets recorded</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map(asset => (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.asset_type}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(asset.current_value)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditAsset(asset)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteAsset(asset.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleAddLiability} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Liability
            </Button>
          </div>

          {liabilities.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No liabilities recorded</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liabilities.map(liability => (
                  <TableRow key={liability.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {liability.liability_type}
                        {liability.linked_asset_id && <Link2 className="w-3 h-3 text-primary" />}
                      </div>
                    </TableCell>
                    <TableCell>{liability.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(liability.current_balance)}</TableCell>
                    <TableCell className="text-right">
                      {liability.monthly_payment ? formatCurrency(liability.monthly_payment) : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditLiability(liability)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteLiability(liability.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {/* Asset Dialog */}
      <Dialog open={showAssetDialog} onOpenChange={setShowAssetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAsset ? "Edit Asset" : "Add Asset"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Asset Type</Label>
              <Select value={assetForm.asset_type} onValueChange={v => setAssetForm(f => ({ ...f, asset_type: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={assetForm.name}
                onChange={e => setAssetForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Primary Residence"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Value (R)</Label>
                <Input
                  type="number"
                  value={assetForm.current_value}
                  onChange={e => setAssetForm(f => ({ ...f, current_value: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Purchase Value (R)</Label>
                <Input
                  type="number"
                  value={assetForm.purchase_value}
                  onChange={e => setAssetForm(f => ({ ...f, purchase_value: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={assetForm.notes}
                onChange={e => setAssetForm(f => ({ ...f, notes: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssetDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveAsset} disabled={!assetForm.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Liability Dialog */}
      <Dialog open={showLiabilityDialog} onOpenChange={setShowLiabilityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLiability ? "Edit Liability" : "Add Liability"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Liability Type</Label>
              <Select value={liabilityForm.liability_type} onValueChange={v => setLiabilityForm(f => ({ ...f, liability_type: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIABILITY_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={liabilityForm.name}
                onChange={e => setLiabilityForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Home Loan"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Original Amount (R)</Label>
                <Input
                  type="number"
                  value={liabilityForm.original_amount}
                  onChange={e => setLiabilityForm(f => ({ ...f, original_amount: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Current Balance (R)</Label>
                <Input
                  type="number"
                  value={liabilityForm.current_balance}
                  onChange={e => setLiabilityForm(f => ({ ...f, current_balance: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Interest Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={liabilityForm.interest_rate}
                  onChange={e => setLiabilityForm(f => ({ ...f, interest_rate: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Monthly Payment (R)</Label>
                <Input
                  type="number"
                  value={liabilityForm.monthly_payment}
                  onChange={e => setLiabilityForm(f => ({ ...f, monthly_payment: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
            {assets.length > 0 && (
              <div>
                <Label>Link to Asset</Label>
                <Select value={liabilityForm.linked_asset_id} onValueChange={v => setLiabilityForm(f => ({ ...f, linked_asset_id: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select asset (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {assets.map(asset => (
                      <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLiabilityDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveLiability} disabled={!liabilityForm.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
