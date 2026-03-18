import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Calculator, TrendingUp, PieChart, Play } from "lucide-react";
import { BucketAllocationChart } from "../components/BucketAllocationChart";
import { CashflowProjection } from "../components/CashflowProjection";
import { useClientAssets } from "@/hooks/useClientAssets";
import { useClientLiabilities } from "@/hooks/useClientLiabilities";
import { useClientIncome } from "@/hooks/useClientIncome";
import { useClientExpenses } from "@/hooks/useClientExpenses";
import { toast } from "sonner";

interface Step3Props {
  clientId: string;
  workflowId: string;
  onDataChange: () => void;
}

export const Step3AnalysePosition = ({ clientId, workflowId, onDataChange }: Step3Props) => {
  const [cashflowOpen, setCashflowOpen] = useState(false);

  const { getTotalAssets } = useClientAssets(clientId);
  const { getTotalLiabilities } = useClientLiabilities(clientId);
  const { getMonthlyIncome } = useClientIncome(clientId);
  const { getMonthlyExpenses } = useClientExpenses(clientId);

  const totalAssets = getTotalAssets();
  const totalLiabilities = getTotalLiabilities();
  const netWorth = totalAssets - totalLiabilities;
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const monthlySurplus = monthlyIncome - monthlyExpenses;

  const handleLaunchFNA = () => {
    toast.info("Financial Needs Analysis calculator launching...");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(totalAssets)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Liabilities</p>
            <p className="text-xl font-bold text-destructive">{formatCurrency(totalLiabilities)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Net Worth</p>
            <p className={`text-xl font-bold ${netWorth >= 0 ? "text-primary" : "text-destructive"}`}>
              {formatCurrency(netWorth)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Monthly Surplus</p>
            <p className={`text-xl font-bold ${monthlySurplus >= 0 ? "text-primary" : "text-destructive"}`}>
              {formatCurrency(monthlySurplus)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Needs Analysis - Primary Focus */}
      <Card className="border-primary/20 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Financial Needs Analysis (FNA)</CardTitle>
            </div>
            <Button onClick={handleLaunchFNA} className="gap-2">
              <Play className="w-4 h-4" />
              Launch FNA Calculator
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The Financial Needs Analysis tool will automatically import the client's financial data 
              and calculate their insurance, investment, and retirement needs.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Risk Profile Assessment</h4>
                <p className="text-sm text-muted-foreground">
                  Determine the client's risk tolerance and investment personality.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Complete Assessment
                </Button>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Insurance Needs Calculation</h4>
                <p className="text-sm text-muted-foreground">
                  Calculate life, disability, and critical illness cover requirements.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Calculate Needs
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cashflow Projection */}
      <Collapsible open={cashflowOpen} onOpenChange={setCashflowOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Cashflow Projection</CardTitle>
                </div>
                {cashflowOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <CashflowProjection
                monthlyIncome={monthlyIncome}
                monthlyExpenses={monthlyExpenses}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Investment Bucket Allocation - Primary Focus */}
      <Card className="border-primary/20 border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Investment Bucket Allocation (Three-Bucket Strategy)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <BucketAllocationChart
            clientId={clientId}
            workflowId={workflowId}
            totalAssets={totalAssets}
            monthlySurplus={monthlySurplus}
            onDataChange={onDataChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};
