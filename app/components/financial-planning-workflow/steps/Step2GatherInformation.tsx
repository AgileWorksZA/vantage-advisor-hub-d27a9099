import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Database, Package, Wallet, TrendingUp, Target, Plus } from "lucide-react";
import { AssetsLiabilitiesManager } from "../components/AssetsLiabilitiesManager";
import { IncomeExpensesManager } from "../components/IncomeExpensesManager";
import { GoalsManager } from "../components/GoalsManager";
import { useClientProducts } from "@/hooks/useClientProducts";
import { toast } from "sonner";

interface Step2Props {
  clientId: string;
  workflowId: string;
  onDataChange: () => void;
}

export const Step2GatherInformation = ({ clientId, workflowId, onDataChange }: Step2Props) => {
  const [externalDataOpen, setExternalDataOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(true);
  const [incomeOpen, setIncomeOpen] = useState(true);

  const { products, loading: productsLoading } = useClientProducts(clientId);

  const handleImportCreditBureau = () => {
    toast.info("Credit bureau integration coming soon");
  };

  const handleImportPolicies = () => {
    toast.info("Policy import integration coming soon");
  };

  return (
    <div className="space-y-4">
      {/* External Data Integration */}
      <Collapsible open={externalDataOpen} onOpenChange={setExternalDataOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">External Data Integration</CardTitle>
                </div>
                {externalDataOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleImportCreditBureau}>
                  Import from Credit Bureau
                </Button>
                <Button variant="outline" onClick={handleImportPolicies}>
                  Import Policy Information
                </Button>
                <Button variant="outline" disabled>
                  Import Investment Statements
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                External integrations will be available in a future update.
              </p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Client Products */}
      <Collapsible open={productsOpen} onOpenChange={setProductsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Client Products</CardTitle>
                  <span className="text-sm text-muted-foreground">({products.length})</span>
                </div>
                {productsOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {productsLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : products.length > 0 ? (
                <div className="space-y-2">
                  {products.slice(0, 5).map(product => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                      <span>{product.product}</span>
                      <span className="text-muted-foreground">{product.value}</span>
                    </div>
                  ))}
                  {products.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      And {products.length - 5} more products...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No products found</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Assets & Liabilities */}
      <Collapsible open={assetsOpen} onOpenChange={setAssetsOpen}>
        <Card className="border-primary/20">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Assets & Liabilities (Balance Sheet)</CardTitle>
                </div>
                {assetsOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <AssetsLiabilitiesManager clientId={clientId} onDataChange={onDataChange} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Income & Expenses */}
      <Collapsible open={incomeOpen} onOpenChange={setIncomeOpen}>
        <Card className="border-primary/20">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Income & Expenses (Cash Flow)</CardTitle>
                </div>
                {incomeOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <IncomeExpensesManager clientId={clientId} onDataChange={onDataChange} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Goals Management - Primary Focus */}
      <Card className="border-primary/20 border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Financial Goals</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <GoalsManager clientId={clientId} workflowId={workflowId} onDataChange={onDataChange} />
        </CardContent>
      </Card>
    </div>
  );
};
