import { useState } from "react";
import { ChevronDown, ChevronRight, Users, Briefcase, FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { RebalancingGroup } from "@/data/practiceRebalancingData";
import PracticeComparisonPane from "./PracticeComparisonPane";

interface RebalancingGroupRowProps {
  group: RebalancingGroup;
  currencySymbol: string;
  formatCurrency: (value: number) => string;
}

const rationaleColors: Record<string, string> = {
  "Fee Reduction": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  "Performance Uplift": "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  "Risk Alignment": "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  "Tax Efficiency": "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
};

export default function RebalancingGroupRow({ group, currencySymbol, formatCurrency }: RebalancingGroupRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border rounded-lg bg-card mb-3 overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="shrink-0">
              {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-sm">{group.name}</span>
                <Badge className={`text-[10px] px-1.5 py-0 border-0 ${rationaleColors[group.rationaleType] || ""}`}>
                  <Sparkles className="h-3 w-3 mr-0.5" />
                  {group.rationaleType}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{group.rationale}</p>
            </div>
            <div className="hidden md:flex items-center gap-6 shrink-0">
              <div className="text-center">
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Briefcase className="h-3 w-3" /> Portfolios</div>
                <div className="text-sm font-semibold">{group.portfolios}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><FileText className="h-3 w-3" /> Contracts</div>
                <div className="text-sm font-semibold">{group.contracts}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3 w-3" /> Clients</div>
                <div className="text-sm font-semibold">{group.clients.length}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">AUM</div>
                <div className="text-sm font-semibold">{formatCurrency(group.totalAUM)}</div>
              </div>
              <div className="text-center min-w-[100px]">
                <div className="text-xs text-muted-foreground">Est. Impact</div>
                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{group.estimatedSaving}</div>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-4 py-3 bg-muted/10">
            {/* Clients list */}
            <div className="mb-3">
              <span className="text-xs font-medium text-muted-foreground">Impacted Clients: </span>
              <span className="text-xs">{group.clients.join(" · ")}</span>
            </div>
            {/* Mobile metrics */}
            <div className="flex md:hidden flex-wrap gap-4 mb-3">
              <div><span className="text-xs text-muted-foreground">Portfolios: </span><span className="text-xs font-semibold">{group.portfolios}</span></div>
              <div><span className="text-xs text-muted-foreground">Contracts: </span><span className="text-xs font-semibold">{group.contracts}</span></div>
              <div><span className="text-xs text-muted-foreground">Clients: </span><span className="text-xs font-semibold">{group.clients.length}</span></div>
              <div><span className="text-xs text-muted-foreground">AUM: </span><span className="text-xs font-semibold">{formatCurrency(group.totalAUM)}</span></div>
            </div>
            <PracticeComparisonPane
              groupId={group.id}
              currentFunds={group.currentFunds}
              currencySymbol={currencySymbol}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
