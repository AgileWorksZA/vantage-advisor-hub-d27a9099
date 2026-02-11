import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Check, Circle } from "lucide-react";
import { getQuoteProducts } from "@/data/regional360ViewData";

function generateContractNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return datePart + randomPart;
}

interface QuoteWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jurisdiction: string;
}

const QUOTE_STEPS = {
  capture: [
    "Select product",
    "How would you like to invest",
    "Recurring withdrawal",
    "Financial adviser",
  ],
  review: "Review and Sign",
  submitted: "Submitted",
};

const QuoteWizardDialog = ({ open, onOpenChange, jurisdiction }: QuoteWizardDialogProps) => {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [contractNumber, setContractNumber] = useState<string>("");

  const handleProductChange = (product: string) => {
    setSelectedProduct(product);
    setContractNumber(generateContractNumber());
  };

  const quoteTitle = selectedProduct
    ? `Quote - ${selectedProduct} (${contractNumber})`
    : "Quote";
  const [isProductSectionOpen, setIsProductSectionOpen] = useState(true);
  const [currentStep] = useState(0);

  const products = getQuoteProducts(jurisdiction);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 gap-0 overflow-hidden [&>button]:hidden">
        <div className="flex min-h-[600px]">
          {/* Left Panel */}
          <div className="flex-1 p-8">
            <h2 className="text-xl font-bold text-foreground tracking-wide uppercase">{quoteTitle}</h2>
            <div className="h-1 w-full bg-[hsl(180,70%,45%)] mt-2 mb-6" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Select your desired products
            </h3>

            <Collapsible open={isProductSectionOpen} onOpenChange={setIsProductSectionOpen}>
              <div className="border rounded-lg">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-medium">Product Selection</span>
                  {isProductSectionOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t px-4 py-4">
                    <RadioGroup value={selectedProduct} onValueChange={handleProductChange}>
                      <div className="space-y-3">
                        {products.map((product) => (
                          <div key={product} className="flex items-center space-x-3">
                            <RadioGroupItem value={product} id={`quote-${product}`} />
                            <Label htmlFor={`quote-${product}`} className="text-sm font-normal cursor-pointer">
                              {product}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* Right Sidebar */}
          <div className="w-64 bg-muted/30 border-l flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-center font-bold text-sm uppercase tracking-wider text-foreground">{quoteTitle}</h3>
            </div>

            <div className="flex-1 p-6 space-y-6">
              {/* Capture Section */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Capture</h4>
                <div className="space-y-2.5">
                  {QUOTE_STEPS.capture.map((step, index) => (
                    <div key={step} className="flex items-center gap-2.5">
                      {index === currentStep ? (
                        <div className="h-5 w-5 rounded-full bg-[hsl(180,70%,45%)] flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span className={`text-xs ${index === currentStep ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review and Sign */}
              <div>
                <div className="flex items-center gap-2.5">
                  <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {QUOTE_STEPS.review}
                  </span>
                </div>
              </div>

              {/* Submitted */}
              <div>
                <div className="flex items-center gap-2.5">
                  <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {QUOTE_STEPS.submitted}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="p-4 space-y-2 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,45%)]/10"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
                  onClick={() => onOpenChange(false)}
                >
                  Save and close
                </Button>
              </div>
              <Button
                className="w-full bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
                disabled={!selectedProduct}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteWizardDialog;
