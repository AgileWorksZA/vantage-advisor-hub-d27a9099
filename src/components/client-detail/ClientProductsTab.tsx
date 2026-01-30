import { useState } from "react";
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
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Plus } from "lucide-react";

const clientProductsData = [
  { product: "Tax Planning", adviser: "Jordaan, Danile", role: "Owner", premium: "R 0.00", frequency: "Monthly", value: "R 0.00", valueUpdated: "15 Jan 2026", inactive: false, linked: true },
  { product: "Estate Planning - Will", adviser: "Jordaan, Danile", role: "Owner", premium: "R 0.00", frequency: "Monthly", value: "R 0.00", valueUpdated: "10 Jan 2026", inactive: false, linked: true },
  { product: "Estate Planning Will", adviser: "Van Zyl, Christo", role: "Owner", premium: "R 0.00", frequency: "Monthly", value: "R 0.00", valueUpdated: "05 Jan 2026", inactive: true, linked: false },
];

const investmentProductsData = [
  { product: "Allan Gray - Retirement Annuity", adviser: "Jordaan, Danile", role: "Owner", premium: "R 0.00", frequency: "Monthly", value: "R 1,250,000.00", valueUpdated: "28 Jan 2026", inactive: false, linked: true },
];

const ClientProductsTab = () => {
  const [showInactive, setShowInactive] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [subTab, setSubTab] = useState("products");

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
              <Button className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white gap-2">
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
                onCheckedChange={(checked) => setShowInactive(checked as boolean)} 
              />
              <Label htmlFor="show-inactive">Show Inactive products</Label>
            </div>
          </div>

          {/* Products Accordion */}
          <Accordion type="multiple" defaultValue={["client-products", "investments"]} className="space-y-4">
            {/* Fiduciary Services */}
            <AccordionItem value="client-products" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <span className="font-medium">PSG Trust (Pty) Ltd - Estate</span>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Product</TableHead>
                      <TableHead className="text-xs">Adviser</TableHead>
                      <TableHead className="text-xs">Role</TableHead>
                      <TableHead className="text-xs">Premium</TableHead>
                      <TableHead className="text-xs">Frequency</TableHead>
                      <TableHead className="text-xs">Value</TableHead>
                      <TableHead className="text-xs">Value updated</TableHead>
                      <TableHead className="text-xs">Inactive</TableHead>
                      <TableHead className="text-xs">Linked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientProductsData
                      .filter(p => showInactive || !p.inactive)
                      .map((product, index) => (
                        <TableRow key={index} className={product.inactive ? "opacity-50" : ""}>
                          <TableCell className="text-sm">{product.product}</TableCell>
                          <TableCell className="text-sm">{product.adviser}</TableCell>
                          <TableCell className="text-sm">{product.role}</TableCell>
                          <TableCell className="text-sm">{product.premium}</TableCell>
                          <TableCell className="text-sm">{product.frequency}</TableCell>
                          <TableCell className="text-sm">{product.value}</TableCell>
                          <TableCell className="text-sm">{product.valueUpdated}</TableCell>
                          <TableCell className="text-sm">{product.inactive ? "Yes" : "No"}</TableCell>
                          <TableCell className="text-sm">{product.linked ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>

            {/* Investments */}
            <AccordionItem value="investments" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <span className="font-medium">Investments</span>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Product</TableHead>
                      <TableHead className="text-xs">Adviser</TableHead>
                      <TableHead className="text-xs">Role</TableHead>
                      <TableHead className="text-xs">Premium</TableHead>
                      <TableHead className="text-xs">Frequency</TableHead>
                      <TableHead className="text-xs">Value</TableHead>
                      <TableHead className="text-xs">Value updated</TableHead>
                      <TableHead className="text-xs">Inactive</TableHead>
                      <TableHead className="text-xs">Linked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investmentProductsData.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm">{product.product}</TableCell>
                        <TableCell className="text-sm">{product.adviser}</TableCell>
                        <TableCell className="text-sm">{product.role}</TableCell>
                        <TableCell className="text-sm">{product.premium}</TableCell>
                        <TableCell className="text-sm">{product.frequency}</TableCell>
                        <TableCell className="text-sm">{product.value}</TableCell>
                        <TableCell className="text-sm">{product.valueUpdated}</TableCell>
                        <TableCell className="text-sm">{product.inactive ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-sm">{product.linked ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Pagination */}
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={productPage === 1}>
              <ChevronFirst className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={productPage === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground mx-2">Page {productPage} of 4</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setProductPage(p => Math.min(4, p + 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
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
    </div>
  );
};

export default ClientProductsTab;
