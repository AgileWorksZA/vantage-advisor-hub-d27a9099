import { useState } from "react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Check, Circle, Info, Trash2, Plus } from "lucide-react";
import { getQuoteProducts } from "@/data/regional360ViewData";

function generateContractNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return datePart + randomPart;
}

interface FundRow {
  id: string;
  type: string;
  name: string;
  percentage: string;
  amount: string;
}

const createEmptyFundRow = (): FundRow => ({
  id: crypto.randomUUID(),
  type: "",
  name: "",
  percentage: "",
  amount: "",
});

interface QuoteWizardViewProps {
  onClose: () => void;
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

const QuoteWizardView = ({ onClose, jurisdiction }: QuoteWizardViewProps) => {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [contractNumber, setContractNumber] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isProductSectionOpen, setIsProductSectionOpen] = useState(true);

  // Step 2 state
  const [lumpSumAmount, setLumpSumAmount] = useState("0.00");
  const [phaseIn, setPhaseIn] = useState("no");
  const [lumpSumFunds, setLumpSumFunds] = useState<FundRow[]>([createEmptyFundRow()]);
  const [isLumpSumOpen, setIsLumpSumOpen] = useState(true);

  const [recurringAmount, setRecurringAmount] = useState("0.00");
  const [recurringStartDate, setRecurringStartDate] = useState("");
  const [recurringFrequency, setRecurringFrequency] = useState("");
  const [recurringEscalation, setRecurringEscalation] = useState("");
  const [recurringFunds, setRecurringFunds] = useState<FundRow[]>([createEmptyFundRow()]);
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);

  const [onPlatformInvestments, setOnPlatformInvestments] = useState("0.00");
  const [externalInvestments, setExternalInvestments] = useState("0.00");
  const [isOtherOpen, setIsOtherOpen] = useState(false);

  const [lumpSumFilter, setLumpSumFilter] = useState("all");
  const [recurringFilter, setRecurringFilter] = useState("all");

  const handleProductChange = (product: string) => {
    setSelectedProduct(product);
    setContractNumber(generateContractNumber());
  };

  const quoteTitle = selectedProduct
    ? `Quote - ${selectedProduct} (${contractNumber})`
    : "Quote";

  const products = getQuoteProducts(jurisdiction);

  const handleNext = () => {
    if (currentStep === 0 && selectedProduct) {
      setCurrentStep(1);
    }
  };

  const addFundRow = (target: "lumpsum" | "recurring") => {
    if (target === "lumpsum") {
      setLumpSumFunds([...lumpSumFunds, createEmptyFundRow()]);
    } else {
      setRecurringFunds([...recurringFunds, createEmptyFundRow()]);
    }
  };

  const removeFundRow = (target: "lumpsum" | "recurring", id: string) => {
    if (target === "lumpsum") {
      setLumpSumFunds(lumpSumFunds.filter(f => f.id !== id));
    } else {
      setRecurringFunds(recurringFunds.filter(f => f.id !== id));
    }
  };

  const updateFundRow = (target: "lumpsum" | "recurring", id: string, field: keyof FundRow, value: string) => {
    const updater = (rows: FundRow[]) => rows.map(r => r.id === id ? { ...r, [field]: value } : r);
    if (target === "lumpsum") {
      setLumpSumFunds(updater(lumpSumFunds));
    } else {
      setRecurringFunds(updater(recurringFunds));
    }
  };

  const copyLumpSumToRecurring = () => {
    setRecurringFunds(lumpSumFunds.map(f => ({ ...f, id: crypto.randomUUID() })));
  };

  const renderFundAllocation = (target: "lumpsum" | "recurring", funds: FundRow[], filter: string, setFilter: (v: string) => void) => (
    <div className="space-y-3 mt-4">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Allocation of funds</h5>
        <button className="text-xs text-[hsl(180,70%,45%)] hover:underline">Use template</button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Filter:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="equity">Equity</SelectItem>
            <SelectItem value="bond">Bond</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[1fr_1fr_80px_100px_32px] gap-2 text-xs font-medium text-muted-foreground border-b pb-1">
        <span>Type</span>
        <span>Name</span>
        <span>%</span>
        <span>Amount</span>
        <span></span>
      </div>

      {/* Rows */}
      {funds.map((fund) => (
        <div key={fund.id} className="grid grid-cols-[1fr_1fr_80px_100px_32px] gap-2 items-center">
          <Select value={fund.type} onValueChange={(v) => updateFundRow(target, fund.id, "type", v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unit-trust">Unit Trust</SelectItem>
              <SelectItem value="etf">ETF</SelectItem>
              <SelectItem value="money-market">Money Market</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fund.name} onValueChange={(v) => updateFundRow(target, fund.id, "name", v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select fund" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced-fund">Balanced Fund</SelectItem>
              <SelectItem value="growth-fund">Growth Fund</SelectItem>
              <SelectItem value="income-fund">Income Fund</SelectItem>
              <SelectItem value="stable-fund">Stable Fund</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="h-8 text-xs"
            value={fund.percentage}
            onChange={(e) => updateFundRow(target, fund.id, "percentage", e.target.value)}
            placeholder="0.00"
          />
          <Input
            className="h-8 text-xs"
            value={fund.amount}
            onChange={(e) => updateFundRow(target, fund.id, "amount", e.target.value)}
            placeholder="0.00"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => removeFundRow(target, fund.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      {/* Total row */}
      <div className="grid grid-cols-[1fr_1fr_80px_100px_32px] gap-2 items-center border-t pt-2">
        <span className="text-xs font-semibold col-span-2">Total</span>
        <span className="text-xs font-semibold">0.00%</span>
        <span className="text-xs font-semibold">R 0.00</span>
        <span></span>
      </div>

      {/* Add row */}
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-[hsl(180,70%,45%)] hover:text-[hsl(180,70%,40%)] p-0 h-auto"
        onClick={() => addFundRow(target)}
      >
        <Plus className="h-3.5 w-3.5 mr-1" /> Add fund
      </Button>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="text-xs border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)]">
          Save as a Template
        </Button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <>
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
        </>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            How would you like to invest
          </h3>

          {/* Lump-sum Section */}
          <Collapsible open={isLumpSumOpen} onOpenChange={setIsLumpSumOpen}>
            <div className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
                <span className="text-sm font-medium">Lump-sum and phase-in investments</span>
                {isLumpSumOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t px-4 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Lump-sum amount</Label>
                      <Input className="mt-1 h-9" value={lumpSumAmount} onChange={(e) => setLumpSumAmount(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phase in</Label>
                      <RadioGroup value={phaseIn} onValueChange={setPhaseIn} className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="phase-yes" />
                          <Label htmlFor="phase-yes" className="text-sm cursor-pointer">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="phase-no" />
                          <Label htmlFor="phase-no" className="text-sm cursor-pointer">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  {renderFundAllocation("lumpsum", lumpSumFunds, lumpSumFilter, setLumpSumFilter)}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Recurring Contribution */}
          <Collapsible open={isRecurringOpen} onOpenChange={setIsRecurringOpen}>
            <div className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
                <span className="text-sm font-medium">Recurring contribution</span>
                {isRecurringOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t px-4 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Amount</Label>
                      <Input className="mt-1 h-9" value={recurringAmount} onChange={(e) => setRecurringAmount(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Start date</Label>
                      <Input className="mt-1 h-9" type="date" value={recurringStartDate} onChange={(e) => setRecurringStartDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Frequency</Label>
                      <Select value={recurringFrequency} onValueChange={setRecurringFrequency}>
                        <SelectTrigger className="mt-1 h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Escalate %</Label>
                      <Input className="mt-1 h-9" value={recurringEscalation} onChange={(e) => setRecurringEscalation(e.target.value)} placeholder="0.00" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-[hsl(180,70%,45%)] text-[hsl(180,70%,45%)]"
                      onClick={copyLumpSumToRecurring}
                    >
                      Same as lump sum
                    </Button>
                  </div>

                  {renderFundAllocation("recurring", recurringFunds, recurringFilter, setRecurringFilter)}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Other Investments */}
          <TooltipProvider>
            <Collapsible open={isOtherOpen} onOpenChange={setIsOtherOpen}>
              <div className="border rounded-lg">
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-medium">Other Investments</span>
                  {isOtherOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t px-4 py-4 space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Label className="text-xs text-muted-foreground">Efficient On-Platform Investments</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Investments managed within the platform ecosystem</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input className="mt-1 h-9" value={onPlatformInvestments} onChange={(e) => setOnPlatformInvestments(e.target.value)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Label className="text-xs text-muted-foreground">External Investments</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Investments held outside the platform</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input className="mt-1 h-9" value={externalInvestments} onChange={(e) => setExternalInvestments(e.target.value)} />
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </TooltipProvider>
        </div>
      );
    }

    return null;
  };

  const getStepIcon = (index: number) => {
    if (index < currentStep) {
      // Completed
      return (
        <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <Check className="h-3 w-3 text-white" />
        </div>
      );
    }
    if (index === currentStep) {
      // Current
      return (
        <div className="h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
          <Circle className="h-2.5 w-2.5 fill-white text-white" />
        </div>
      );
    }
    // Future
    return <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />;
  };

  const getStepTextClass = (index: number) => {
    if (index < currentStep) return "text-[hsl(180,70%,45%)] font-medium";
    if (index === currentStep) return "text-foreground font-medium";
    return "text-muted-foreground";
  };

  return (
        <div className="flex h-full min-h-[600px]">
          {/* Left Panel */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-8 pb-0">
              <h2 className="text-xl font-bold text-foreground tracking-wide uppercase">{quoteTitle}</h2>
              <div className="h-1 w-full bg-[hsl(180,70%,45%)] mt-2 mb-6" />
            </div>
            <ScrollArea className="flex-1 px-8 pb-8">
              {renderStepContent()}
            </ScrollArea>
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
                      {getStepIcon(index)}
                      <span className={`text-xs ${getStepTextClass(index)}`}>
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
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
                  onClick={onClose}
                >
                  Save and close
                </Button>
              </div>
              <Button
                className="w-full bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
                disabled={currentStep === 0 && !selectedProduct}
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
  );
};

export default QuoteWizardView;
