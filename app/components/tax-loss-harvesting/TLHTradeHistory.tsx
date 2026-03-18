import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TLHTradeRecord } from "@/hooks/useTLHData";
import { useRegion } from "@/contexts/RegionContext";
import { format } from "date-fns";

interface TLHTradeHistoryProps {
  trades: TLHTradeRecord[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  executed: "bg-blue-100 text-blue-800 border-blue-200",
  settled: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export const TLHTradeHistory = ({ trades }: TLHTradeHistoryProps) => {
  const { formatCurrency } = useRegion();

  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No trades executed yet. Switch funds from the opportunities table above.
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Sold</TableHead>
            <TableHead>Bought</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="text-right">Realized Loss</TableHead>
            <TableHead className="text-right">Tax Saving</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell className="text-sm">
                {format(new Date(trade.executedAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="text-sm font-medium">{trade.clientName}</TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-medium">{trade.sellTicker}</p>
                  <p className="text-xs text-muted-foreground">{trade.sellFundName}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-medium">{trade.buyTicker}</p>
                  <p className="text-xs text-muted-foreground">{trade.buyFundName}</p>
                </div>
              </TableCell>
              <TableCell className="text-right text-sm">{formatCurrency(trade.sellValue)}</TableCell>
              <TableCell className="text-right text-sm text-destructive font-semibold">
                {formatCurrency(trade.realizedLoss)}
              </TableCell>
              <TableCell className="text-right text-sm text-emerald-600 font-semibold">
                {formatCurrency(trade.estimatedTaxSaving)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className={`text-xs ${statusColors[trade.status] || ""}`}>
                  {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
