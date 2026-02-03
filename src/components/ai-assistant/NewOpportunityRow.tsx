import { useState } from "react";
import { ChevronDown, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NewOpportunityType } from "@/data/sampleNewOpportunities";
import ClientOpportunityList from "./ClientOpportunityList";

interface NewOpportunityRowProps {
  opportunity: NewOpportunityType;
  formatCurrency: (value: number) => string;
  isExpanded: boolean;
  onToggle: () => void;
}

const NewOpportunityRow = ({
  opportunity,
  formatCurrency,
  isExpanded,
  onToggle,
}: NewOpportunityRowProps) => {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div
        className={cn(
          "rounded-xl border transition-all duration-200",
          isExpanded
            ? "bg-white/10 border-amber-500/30"
            : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
        )}
      >
        {/* Header Row */}
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">
                  {opportunity.name}
                </h3>
                <p className="text-xs text-white/50 truncate mt-0.5">
                  {opportunity.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-shrink-0">
              {/* Quantum */}
              <div className="text-right">
                <p className="text-sm font-semibold text-amber-400">
                  {formatCurrency(opportunity.totalValue)}
                </p>
                <p className="text-xs text-white/40">Quantum</p>
              </div>

              {/* Client Count */}
              <div className="flex items-center gap-1.5 text-white/60">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{opportunity.clientCount}</span>
              </div>

              {/* Expand Chevron */}
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-white/40 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-white/10 pt-3">
            <ClientOpportunityList
              clients={opportunity.clients}
              formatCurrency={formatCurrency}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default NewOpportunityRow;
