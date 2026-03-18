import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOpportunityClients, EnrichedOpportunityType } from "@/hooks/useOpportunityClients";
import NewOpportunityRow from "./NewOpportunityRow";

interface NewOpportunitiesTableProps {
  formatCurrency: (value: number) => string;
  typeFilter: string | null;
}

const NewOpportunitiesTable = ({ formatCurrency, typeFilter }: NewOpportunitiesTableProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { enrichedOpportunities } = useOpportunityClients();

  // Filter opportunities by type if filter is active
  const filteredOpportunities = typeFilter
    ? enrichedOpportunities.filter((opp) => {
        const typeMap: Record<string, string[]> = {
          growth: ["contribution-opportunities"],
          derisking: ["tax-loss-harvesting", "fee-optimization"],
          migration: ["legacy-migration"],
          consolidation: ["fee-optimization"],
        };
        return typeMap[typeFilter]?.includes(opp.type) || false;
      })
    : enrichedOpportunities;

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Calculate totals
  const totalValue = filteredOpportunities.reduce((acc, opp) => acc + opp.totalValue, 0);
  const totalClients = filteredOpportunities.reduce((acc, opp) => acc + opp.clientCount, 0);

  if (filteredOpportunities.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center border border-white/10">
        <Sparkles className="w-12 h-12 text-amber-400/30 mx-auto mb-3" />
        <h3 className="text-white/70 font-medium mb-1">No new opportunities found</h3>
        <p className="text-white/40 text-sm">
          {typeFilter
            ? `No ${typeFilter} opportunities detected in the latest scan.`
            : "No opportunities detected. Run a portfolio scan to discover new opportunities."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-white/60">AI-Discovered Opportunities</p>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(totalValue)}{" "}
              <span className="text-sm font-normal text-white/50">
                across {totalClients} clients
              </span>
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-400 border-amber-500/30"
        >
          {filteredOpportunities.length} opportunity types
        </Badge>
      </div>

      {/* Opportunity Rows */}
      <div className="space-y-2">
        {filteredOpportunities.map((opportunity) => (
          <NewOpportunityRow
            key={opportunity.id}
            opportunity={opportunity}
            formatCurrency={formatCurrency}
            isExpanded={expandedIds.has(opportunity.id)}
            onToggle={() => handleToggle(opportunity.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NewOpportunitiesTable;
