import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Pencil, Download, Search, List, FileText } from "lucide-react";

const clientDocuments = [
  { name: "Tandocument Notes", status: "complete", workflow: null },
  { name: "Power of Attorney", status: "complete", workflow: null },
  { name: "Will (Version 2)", status: "complete", workflow: null },
  { name: "Qualifications", status: "complete", workflow: null },
  { name: "Policy Documents Notes", status: "complete", workflow: null },
];

const ficaDocuments = [
  { name: "Proof of address", status: "pending", workflow: "FICA - Address change" },
  { name: "Identity document (Version 3) - RSAID", status: "complete", workflow: null },
  { name: "Proof of bank details", status: "complete", workflow: null },
  { name: "Proof of address", status: "complete", workflow: "FICA - Address change" },
  { name: "Proof of tax registration", status: "complete", workflow: null },
  { name: "Proof of address (Version 2)", status: "complete", workflow: null },
];

const productDocuments = [
  {
    productName: "Allan Gray - Retirement Annuity (Inactive)",
    documents: [
      { name: "Application form (Version 4)", status: "complete" },
      { name: "Cancellation instruction", status: "cancelled" },
    ],
  },
  {
    productName: "Allan Gray - Retirement Annuity (Inactive)",
    documents: [
      { name: "Cancellation instruction", status: "cancelled" },
    ],
  },
  {
    productName: "PSG Securities Ltd Local - Share portfolio (Offshore) (Inactive)",
    documents: [
      { name: "Cancellation instruction", status: "cancelled" },
    ],
  },
  {
    productName: "PSG Securities Ltd Local - Derivatives (Inactive)",
    documents: [
      { name: "Cancellation instruction", status: "cancelled" },
    ],
  },
  {
    productName: "Glacier - Collective Investments (Local) - ABC1234567 (Inactive)",
    documents: [
      { name: "Application form", status: "complete" },
    ],
  },
];

const DocumentRow = ({ name, status, workflow }: { name: string; status: string; workflow?: string | null }) => (
  <div className={`flex items-center justify-between py-2 px-4 border-b border-border last:border-0 ${
    status === "complete" ? "bg-green-50 dark:bg-green-950/20" :
    status === "cancelled" ? "bg-red-50 dark:bg-red-950/20" : ""
  }`}>
    <div className="flex items-center gap-3">
      <FileText className="w-4 h-4 text-muted-foreground" />
      <div>
        <span className="text-sm">{name}</span>
        {workflow && (
          <span className="text-xs text-muted-foreground ml-2">({workflow})</span>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Pencil className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Download className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Search className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <List className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

const ClientDocumentsTab = () => {
  const [showInactiveProducts, setShowInactiveProducts] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Client & FICA Documentation */}
      <div className="space-y-4">
        <Accordion type="multiple" defaultValue={["client-docs", "fica-docs"]} className="space-y-4">
          {/* Client Documentation */}
          <AccordionItem value="client-docs" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="font-medium">Client documentation</span>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              {clientDocuments.map((doc, index) => (
                <DocumentRow key={index} name={doc.name} status={doc.status} workflow={doc.workflow} />
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* FICA Documentation */}
          <AccordionItem value="fica-docs" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="font-medium">FICA documentation</span>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              {ficaDocuments.map((doc, index) => (
                <DocumentRow key={index} name={doc.name} status={doc.status} workflow={doc.workflow} />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Right Column - Products */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Products</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="show-inactive-products" 
                checked={showInactiveProducts} 
                onCheckedChange={(checked) => setShowInactiveProducts(checked as boolean)} 
              />
              <Label htmlFor="show-inactive-products" className="text-sm">Show inactive products</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion type="multiple" className="space-y-0">
            {productDocuments.map((product, productIndex) => (
              <AccordionItem key={productIndex} value={`product-${productIndex}`} className="border-b last:border-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline text-left">
                  <span className="text-sm">{product.productName}</span>
                </AccordionTrigger>
                <AccordionContent className="p-0 pl-4">
                  {product.documents.map((doc, docIndex) => (
                    <DocumentRow key={docIndex} name={doc.name} status={doc.status} />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDocumentsTab;
