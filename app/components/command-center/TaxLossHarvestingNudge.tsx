import { useState } from "react";
import { TrendingDown } from "lucide-react";
import { NudgeCard } from "./NudgeCard";
import { TLHDashboard } from "@/components/tax-loss-harvesting/TLHDashboard";
import { useTLHData } from "@/hooks/useTLHData";

export const TaxLossHarvestingNudge = () => {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const { opportunities, totalUnrealizedLoss, totalEstimatedSavings, formatCurrency } = useTLHData();

  const opportunityCount = opportunities.length;

  return (
    <>
      <NudgeCard
        title="Tax Loss Harvesting"
        icon={<TrendingDown className="w-4 h-4 text-destructive" />}
        reasoning={`${opportunityCount} client accounts have harvestable losses above R500. Acting now could save your clients ${formatCurrency(totalEstimatedSavings)} in taxes before year-end.`}
        actionLabel="Review & Harvest"
        onAction={() => setDashboardOpen(true)}
        urgencyColor="hsl(0,84%,60%)"
        badge={`${opportunityCount} opportunities`}
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Harvestable</span>
            <span className="font-semibold text-destructive">{formatCurrency(totalUnrealizedLoss)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Est. Tax Savings</span>
            <span className="font-semibold text-emerald-600">
              {formatCurrency(totalEstimatedSavings)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Accounts Affected</span>
            <span className="font-medium">{opportunityCount}</span>
          </div>
        </div>
      </NudgeCard>

      <TLHDashboard open={dashboardOpen} onOpenChange={setDashboardOpen} />
    </>
  );
};
