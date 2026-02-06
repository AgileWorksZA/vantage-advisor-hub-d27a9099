import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TLHOpportunityDemo } from "@/data/tlhDemoData";
import { BeforeAfterComparison } from "./BeforeAfterComparison";
import { useRegion } from "@/contexts/RegionContext";
import { Separator } from "@/components/ui/separator";

interface FundSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: TLHOpportunityDemo | null;
  onConfirm: (opportunity: TLHOpportunityDemo) => void;
}

export const FundSwitchDialog = ({
  open,
  onOpenChange,
  opportunity,
  onConfirm,
}: FundSwitchDialogProps) => {
  const { formatCurrency } = useRegion();
  const [step, setStep] = useState<"compare" | "confirm">("compare");

  if (!opportunity) return null;

  const handleConfirm = () => {
    onConfirm(opportunity);
    setStep("compare");
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setStep("compare");
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "compare" ? "Fund Switch Comparison" : "Confirm Trade Execution"}
          </DialogTitle>
          <DialogDescription>
            {step === "compare"
              ? `Review the before/after comparison for ${opportunity.clientName}`
              : "Review and confirm the trade details below"}
          </DialogDescription>
        </DialogHeader>

        {step === "compare" ? (
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Client</span>
              <span className="font-medium">{opportunity.clientName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Unrealized Loss</span>
              <span className="font-semibold text-destructive">{formatCurrency(opportunity.unrealizedLoss)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Est. Tax Savings</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(opportunity.estimatedTaxSavings)}</span>
            </div>

            <Separator />

            <BeforeAfterComparison
              currentFund={opportunity.currentFund}
              replacementFund={opportunity.replacementFund}
              correlation={opportunity.correlation}
              trackingError={opportunity.trackingError}
              feeDifferential={opportunity.feeDifferential}
            />

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => setStep("confirm")}>
                Proceed to Confirm
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {/* Sell Order */}
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <h4 className="font-semibold text-destructive mb-2">SELL ORDER</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset</span>
                  <span className="font-medium">{opportunity.currentFund.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticker</span>
                  <span>{opportunity.currentFund.ticker}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ISIN</span>
                  <span className="text-xs">{opportunity.currentFund.isin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Value</span>
                  <span>{formatCurrency(opportunity.currentValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unrealized Loss</span>
                  <span className="text-destructive font-semibold">{formatCurrency(opportunity.unrealizedLoss)}</span>
                </div>
              </div>
            </div>

            {/* Buy Order */}
            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <h4 className="font-semibold text-emerald-600 mb-2">BUY ORDER</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset</span>
                  <span className="font-medium">{opportunity.replacementFund.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticker</span>
                  <span>{opportunity.replacementFund.ticker}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ISIN</span>
                  <span className="text-xs">{opportunity.replacementFund.isin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value</span>
                  <span>{formatCurrency(opportunity.currentValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Tax Savings</span>
                  <span className="text-emerald-600 font-semibold">{formatCurrency(opportunity.estimatedTaxSavings)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("compare")}>
                Back
              </Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirm}>
                Confirm & Execute
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
