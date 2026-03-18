import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, ArrowRightLeft, X } from "lucide-react";
import { TLHOpportunityDemo } from "@/data/tlhDemoData";
import { useRegion } from "@/contexts/RegionContext";

interface TLHOpportunitiesTableProps {
  opportunities: TLHOpportunityDemo[];
  onSwitchFund: (opportunity: TLHOpportunityDemo) => void;
  onDismiss: (opportunityId: string) => void;
  onBulkExecute: (opportunities: TLHOpportunityDemo[]) => void;
}

export const TLHOpportunitiesTable = ({
  opportunities,
  onSwitchFund,
  onDismiss,
  onBulkExecute,
}: TLHOpportunitiesTableProps) => {
  const { formatCurrency } = useRegion();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === opportunities.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(opportunities.map((o) => o.id)));
    }
  };

  const selectedOpps = opportunities.filter((o) => selectedIds.has(o.id));

  return (
    <div className="space-y-3">
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border">
          <span className="text-sm font-medium">
            {selectedIds.size} opportunit{selectedIds.size === 1 ? "y" : "ies"} selected
          </span>
          <Button size="sm" onClick={() => onBulkExecute(selectedOpps)}>
            Execute Selected
          </Button>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.size === opportunities.length && opportunities.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Current Holding</TableHead>
              <TableHead className="text-right">Unrealized Loss</TableHead>
              <TableHead className="text-center">Period</TableHead>
              <TableHead className="text-center">Wash Sale</TableHead>
              <TableHead>Suggested Replacement</TableHead>
              <TableHead className="text-right">Est. Tax Savings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opp) => (
              <TableRow key={opp.id} className={selectedIds.has(opp.id) ? "bg-primary/5" : ""}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(opp.id)}
                    onCheckedChange={() => toggleSelect(opp.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {opp.clientInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{opp.clientName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{opp.currentFund.name}</p>
                    <p className="text-xs text-muted-foreground">{opp.currentFund.ticker} · {opp.currentFund.exchange}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right text-destructive font-semibold text-sm">
                  {formatCurrency(opp.unrealizedLoss)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={opp.holdingPeriod === "short_term" ? "destructive" : "secondary"} className="text-xs">
                    {opp.holdingPeriod === "short_term" ? "Short" : "Long"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {opp.washSaleOk ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {opp.replacementFund.name}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-emerald-600 font-semibold text-sm">
                  {formatCurrency(opp.estimatedTaxSavings)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onSwitchFund(opp)}>
                      <ArrowRightLeft className="w-3 h-3 mr-1" />
                      Switch
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => onDismiss(opp.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {opportunities.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No harvesting opportunities available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
