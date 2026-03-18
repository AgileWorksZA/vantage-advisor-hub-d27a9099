import { useState } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Plus, Loader2 } from "lucide-react";
import { useClientProducts } from "@/hooks/useClientProducts";
import { useClientDetail } from "@/hooks/useClientDetail";
import { FinancialPlanningWizard } from "@/components/financial-planning-workflow/FinancialPlanningWizard";

const ClientProductsTab = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [showInactive, setShowInactive] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [subTab, setSubTab] = useState("products");
  const [showWizard, setShowWizard] = useState(false);
  
  const { products, loading, refetch } = useClientProducts(clientId || "");
  const { client } = useClientDetail(clientId);

  const handleShowInactiveChange = (checked: boolean) => {
    setShowInactive(checked);
    refetch(checked);
  };

  // Group products by category
  const productsByCategory: Record<string, typeof products> = {};
  products.forEach(product => {
    const category = product.category || "Other Products";
    if (!productsByCategory[category]) {
      productsByCategory[category] = [];
    }
    productsByCategory[category].push(product);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button 
                className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white gap-2"
                onClick={() => setShowWizard(true)}
              >
                <Plus className="w-4 h-4" />
                Add new product
              </Button>
              <Button variant="outline">Request astute life update</Button>
              <Button variant="outline">Astute report</Button>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="show-inactive" 
                checked={showInactive} 
                onCheckedChange={(checked) => handleShowInactiveChange(checked as boolean)} 
              />
              <Label htmlFor="show-inactive">Show Inactive products</Label>
            </div>
          </div>

          {/* Products Accordion */}
          {Object.keys(productsByCategory).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              No products found. Click "Add new product" to add a product.
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={Object.keys(productsByCategory)} className="space-y-4">
              {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                <AccordionItem key={category} value={category} className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <span className="font-medium">{category}</span>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Product</TableHead>
                          <TableHead className="text-xs">Adviser</TableHead>
                          <TableHead className="text-xs">Role</TableHead>
                          <TableHead className="text-xs text-right">Premium</TableHead>
                          <TableHead className="text-xs">Frequency</TableHead>
                          <TableHead className="text-xs text-right">Value</TableHead>
                          <TableHead className="text-xs">Value updated</TableHead>
                          <TableHead className="text-xs">Inactive</TableHead>
                          <TableHead className="text-xs">Linked</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryProducts.map((product) => (
                          <TableRow key={product.id} className={product.inactive ? "opacity-50" : ""}>
                            <TableCell className="text-sm">{product.product}</TableCell>
                            <TableCell className="text-sm">{product.adviser}</TableCell>
                            <TableCell className="text-sm">{product.role}</TableCell>
                            <TableCell className="text-sm text-right">{product.premium}</TableCell>
                            <TableCell className="text-sm">{product.frequency}</TableCell>
                            <TableCell className="text-sm text-right">{product.value}</TableCell>
                            <TableCell className="text-sm">{product.valueUpdated}</TableCell>
                            <TableCell className="text-sm">{product.inactive ? "Yes" : "No"}</TableCell>
                            <TableCell className="text-sm">{product.linked ? "Yes" : "No"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* Pagination */}
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={productPage === 1}>
              <ChevronFirst className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={productPage === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground mx-2">Page {productPage} of 1</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronLast className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="balance-sheet" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            Balance Sheet view coming soon
          </div>
        </TabsContent>

        <TabsContent value="income-statement" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            Income Statement view coming soon
          </div>
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            Overview coming soon
          </div>
        </TabsContent>
      </Tabs>

      {/* Financial Planning Wizard */}
      {clientId && (
        <FinancialPlanningWizard
          open={showWizard}
          onOpenChange={setShowWizard}
          clientId={clientId}
          clientName={client ? `${client.first_name} ${client.surname}` : "Client"}
        />
      )}
    </div>
  );
};

export default ClientProductsTab;
