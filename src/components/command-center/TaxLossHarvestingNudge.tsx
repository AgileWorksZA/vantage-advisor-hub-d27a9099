import { useState } from "react";
import { TrendingDown, CheckCircle, AlertTriangle } from "lucide-react";
import { NudgeCard } from "./NudgeCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const harvestingOpportunities = [
  {
    id: 1,
    clientName: "John Van Der Berg",
    clientInitials: "JV",
    ticker: "SATRIX TOP 40",
    currentPrice: "R 48.25",
    unrealizedLoss: "-R 12,450",
    washSaleOk: true,
    suggestedReplacement: "1NVEST SA TOP 40 ETF",
    estimatedTaxSavings: "R 3,486",
  },
  {
    id: 2,
    clientName: "Maria Pretorius",
    clientInitials: "MP",
    ticker: "ABSA NEWGOLD",
    currentPrice: "R 292.30",
    unrealizedLoss: "-R 8,920",
    washSaleOk: true,
    suggestedReplacement: "ETFSA GOLD",
    estimatedTaxSavings: "R 2,498",
  },
  {
    id: 3,
    clientName: "Peter Williams",
    clientInitials: "PW",
    ticker: "NASPERS",
    currentPrice: "R 3,250.00",
    unrealizedLoss: "-R 24,680",
    washSaleOk: false,
    suggestedReplacement: "PROSUS",
    estimatedTaxSavings: "R 6,910",
  },
  {
    id: 4,
    clientName: "Susan Khumalo",
    clientInitials: "SK",
    ticker: "MTN GROUP",
    currentPrice: "R 82.45",
    unrealizedLoss: "-R 6,230",
    washSaleOk: true,
    suggestedReplacement: "VODACOM",
    estimatedTaxSavings: "R 1,744",
  },
];

export const TaxLossHarvestingNudge = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tradePreviewOpen, setTradePreviewOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<
    (typeof harvestingOpportunities)[0] | null
  >(null);

  const totalSavings = "R 14,638";
  const opportunityCount = harvestingOpportunities.length;

  const handleQuickSwap = (opportunity: (typeof harvestingOpportunities)[0]) => {
    setSelectedOpportunity(opportunity);
    setTradePreviewOpen(true);
  };

  const handleConfirmTrade = () => {
    toast.success(
      `Trade executed: Sold ${selectedOpportunity?.ticker}, Bought ${selectedOpportunity?.suggestedReplacement}`
    );
    setTradePreviewOpen(false);
    setSelectedOpportunity(null);
  };

  return (
    <>
      <NudgeCard
        title="Tax Loss Harvesting"
        icon={<TrendingDown className="w-4 h-4 text-destructive" />}
        reasoning={`${opportunityCount} client accounts have harvestable losses above R500. Acting now could save your clients ${totalSavings} in taxes before year-end.`}
        actionLabel="Review & Harvest"
        onAction={() => setSheetOpen(true)}
        urgencyColor="hsl(0,84%,60%)"
        badge={`${opportunityCount} opportunities`}
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Harvestable</span>
            <span className="font-semibold text-destructive">-R 52,280</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Est. Tax Savings</span>
            <span className="font-semibold text-[hsl(142,76%,36%)]">
              {totalSavings}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Accounts Affected</span>
            <span className="font-medium">{opportunityCount}</span>
          </div>
        </div>
      </NudgeCard>

      {/* Main Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Tax Loss Harvesting Opportunities</SheetTitle>
            <SheetDescription>
              Review and execute tax-loss harvesting trades for your clients
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead className="text-right">Loss</TableHead>
                  <TableHead className="text-center">Wash Sale</TableHead>
                  <TableHead>Replacement</TableHead>
                  <TableHead className="text-right">Tax Savings</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {harvestingOpportunities.map((opp) => (
                  <TableRow key={opp.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {opp.clientInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {opp.clientName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {opp.currentPrice}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {opp.ticker}
                    </TableCell>
                    <TableCell className="text-right text-destructive font-semibold">
                      {opp.unrealizedLoss}
                    </TableCell>
                    <TableCell className="text-center">
                      {opp.washSaleOk ? (
                        <CheckCircle className="w-4 h-4 text-[hsl(142,76%,36%)] mx-auto" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[hsl(45,93%,47%)] mx-auto" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {opp.suggestedReplacement}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-[hsl(142,76%,36%)] font-semibold">
                      {opp.estimatedTaxSavings}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickSwap(opp)}
                      >
                        Quick Swap
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SheetContent>
      </Sheet>

      {/* Trade Preview Sheet */}
      <Sheet open={tradePreviewOpen} onOpenChange={setTradePreviewOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Trade Preview</SheetTitle>
            <SheetDescription>
              Review and confirm the trade execution
            </SheetDescription>
          </SheetHeader>

          {selectedOpportunity && (
            <div className="mt-6 space-y-6">
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <h4 className="font-semibold text-destructive mb-2">
                  SELL ORDER
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset</span>
                    <span className="font-medium">
                      {selectedOpportunity.ticker}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client</span>
                    <span>{selectedOpportunity.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Value</span>
                    <span>{selectedOpportunity.currentPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Unrealized Loss
                    </span>
                    <span className="text-destructive font-semibold">
                      {selectedOpportunity.unrealizedLoss}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[hsl(142,76%,36%)]/10 rounded-lg border border-[hsl(142,76%,36%)]/20">
                <h4 className="font-semibold text-[hsl(142,76%,36%)] mb-2">
                  BUY ORDER
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset</span>
                    <span className="font-medium">
                      {selectedOpportunity.suggestedReplacement}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>House View Fund</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Est. Tax Savings
                    </span>
                    <span className="text-[hsl(142,76%,36%)] font-semibold">
                      {selectedOpportunity.estimatedTaxSavings}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setTradePreviewOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)]"
                  onClick={handleConfirmTrade}
                >
                  Confirm & Execute
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
