import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ProductProvider, useProviderProducts } from "@/hooks/useProductProviders";
import { Link2, Unlink, Plus } from "lucide-react";

interface ProviderDetailDialogProps {
  provider: ProductProvider | null;
  allProviders: ProductProvider[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (provider: Partial<ProductProvider> & { id: string }) => Promise<unknown>;
}

const SERVICE_TYPES = [
  "Fiduciary Services",
  "Investments",
  "Life and Risk",
  "Medical",
  "Short Term Insurance (Commercial)",
  "Short Term Insurance (Personal)",
  "Stockbroking",
];

const COUNTRY_OPTIONS = [
  { value: "ZA", label: "South Africa" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
];

const PROVIDER_TYPES = [
  "Insurance",
  "Asset Management",
  "Banking/Investment",
  "Brokerage",
  "Investment",
  "Banking",
  "Superannuation",
];

export function ProviderDetailDialog({
  provider,
  allProviders,
  open,
  onOpenChange,
  onSave,
}: ProviderDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("configuration");
  const [formData, setFormData] = useState<Partial<ProductProvider>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const { products, availableProducts, linkProduct, unlinkProduct } = useProviderProducts(
    provider?.id || null
  );

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        code: provider.code,
        provider_type: provider.provider_type,
        country: provider.country || "ZA",
        contact_email: provider.contact_email,
        contact_phone: provider.contact_phone,
        is_active: provider.is_active,
        astute_code: provider.astute_code,
        tel_number: provider.tel_number,
        tel_number_legal: provider.tel_number_legal,
        fax_number_legal: provider.fax_number_legal,
        email_legal: provider.email_legal,
        portal_url: provider.portal_url,
        services: provider.services || [],
        umbrella_provider_id: provider.umbrella_provider_id,
        contract_padding: provider.contract_padding || 0,
        exclude_from_aging: provider.exclude_from_aging || false,
        is_hidden: provider.is_hidden || false,
        auto_notify_changes: provider.auto_notify_changes || false,
        disable_manual_contract_update: provider.disable_manual_contract_update || false,
        is_approved: provider.is_approved,
        is_umbrella_provider: provider.is_umbrella_provider || false,
        cc_static_update: provider.cc_static_update,
      });
    }
  }, [provider]);

  const handleSave = async () => {
    if (!provider) return;
    setIsSaving(true);
    try {
      await onSave({ id: provider.id, ...formData });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleServiceToggle = (service: string) => {
    const currentServices = formData.services || [];
    const newServices = currentServices.includes(service)
      ? currentServices.filter((s) => s !== service)
      : [...currentServices, service];
    setFormData({ ...formData, services: newServices });
  };

  const handleLinkProduct = async (productId: string) => {
    if (!provider) return;
    await linkProduct({ productId, providerId: provider.id });
    setShowLinkDialog(false);
  };

  const unlinkedProducts = availableProducts.filter(
    (p) => !p.provider_id || p.provider_id !== provider?.id
  );

  const umbrellaProviders = allProviders.filter(
    (p) => p.is_umbrella_provider && p.id !== provider?.id
  );

  if (!provider) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
          <SheetHeader>
            <SheetTitle>{provider.name}</SheetTitle>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>

            <TabsContent value="configuration" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                <div className="space-y-6 pb-6">
                  {/* Control Options Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Control Options
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contract_padding">Contract Padding (days)</Label>
                        <Input
                          id="contract_padding"
                          type="number"
                          value={formData.contract_padding || 0}
                          onChange={(e) =>
                            setFormData({ ...formData, contract_padding: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Exclude from Aging</Label>
                        <Select
                          value={formData.exclude_from_aging ? "yes" : "no"}
                          onValueChange={(v) =>
                            setFormData({ ...formData, exclude_from_aging: v === "yes" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Is Hidden</Label>
                        <Select
                          value={formData.is_hidden ? "yes" : "no"}
                          onValueChange={(v) =>
                            setFormData({ ...formData, is_hidden: v === "yes" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Auto Notify Changes</Label>
                        <Select
                          value={formData.auto_notify_changes ? "yes" : "no"}
                          onValueChange={(v) =>
                            setFormData({ ...formData, auto_notify_changes: v === "yes" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Automatically notify of client detail changes
                        </p>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Disable Manual Contract Nr Updating</Label>
                        <Select
                          value={formData.disable_manual_contract_update ? "yes" : "no"}
                          onValueChange={(v) =>
                            setFormData({ ...formData, disable_manual_contract_update: v === "yes" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* General Details Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      General Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name || ""}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="code">Code</Label>
                        <Input
                          id="code"
                          value={formData.code || ""}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Is Approved</Label>
                        <Select
                          value={formData.is_approved === true ? "yes" : formData.is_approved === false ? "no" : ""}
                          onValueChange={(v) =>
                            setFormData({ ...formData, is_approved: v === "yes" ? true : v === "no" ? false : null })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Is Umbrella Provider</Label>
                        <Select
                          value={formData.is_umbrella_provider ? "yes" : "no"}
                          onValueChange={(v) =>
                            setFormData({ ...formData, is_umbrella_provider: v === "yes" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Provider Type</Label>
                        <Select
                          value={formData.provider_type || ""}
                          onValueChange={(v) => setFormData({ ...formData, provider_type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type..." />
                          </SelectTrigger>
                          <SelectContent>
                            {PROVIDER_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select
                          value={formData.country || "ZA"}
                          onValueChange={(v) => setFormData({ ...formData, country: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRY_OPTIONS.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="astute_code">Astute Code</Label>
                        <Input
                          id="astute_code"
                          value={formData.astute_code || ""}
                          onChange={(e) => setFormData({ ...formData, astute_code: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tel_number">Tel Number</Label>
                        <Input
                          id="tel_number"
                          value={formData.tel_number || ""}
                          onChange={(e) => setFormData({ ...formData, tel_number: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tel_number_legal">Tel Number (Legal)</Label>
                        <Input
                          id="tel_number_legal"
                          value={formData.tel_number_legal || ""}
                          onChange={(e) => setFormData({ ...formData, tel_number_legal: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fax_number_legal">Fax Number (Legal)</Label>
                        <Input
                          id="fax_number_legal"
                          value={formData.fax_number_legal || ""}
                          onChange={(e) => setFormData({ ...formData, fax_number_legal: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email_legal">Email (Legal)</Label>
                        <Input
                          id="email_legal"
                          type="email"
                          value={formData.email_legal || ""}
                          onChange={(e) => setFormData({ ...formData, email_legal: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Email</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email || ""}
                          onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cc_static_update">CC Static Update</Label>
                        <Input
                          id="cc_static_update"
                          value={formData.cc_static_update || ""}
                          onChange={(e) => setFormData({ ...formData, cc_static_update: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="portal_url">Portal URL</Label>
                        <Input
                          id="portal_url"
                          type="url"
                          value={formData.portal_url || ""}
                          onChange={(e) => setFormData({ ...formData, portal_url: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Umbrella Provider</Label>
                        <Select
                          value={formData.umbrella_provider_id || "none"}
                          onValueChange={(v) =>
                            setFormData({ ...formData, umbrella_provider_id: v === "none" ? null : v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select umbrella provider..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {umbrellaProviders.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Services Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Services
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {SERVICE_TYPES.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={service}
                            checked={(formData.services || []).includes(service)}
                            onCheckedChange={() => handleServiceToggle(service)}
                          />
                          <Label htmlFor={service} className="text-sm font-normal cursor-pointer">
                            {service}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="products" className="flex-1 overflow-hidden">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Linked Products</h3>
                  <Button size="sm" onClick={() => setShowLinkDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Link Product
                  </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-280px)]">
                  {products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No products linked to this provider
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.product_code || "-"}</TableCell>
                            <TableCell>{product.premium_type || "-"}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => unlinkProduct(product.id)}
                              >
                                <Unlink className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Link Product Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Product to {provider?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {unlinkedProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products available to link
              </div>
            ) : (
              <div className="space-y-2">
                {unlinkedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleLinkProduct(product.id)}
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.product_code || "-"}</p>
                    </div>
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
