import { TLHFundMetrics } from "@/data/tlhDemoData";
import { ArrowRight, ArrowUp, ArrowDown, Minus, Star } from "lucide-react";

interface BeforeAfterComparisonProps {
  currentFund: TLHFundMetrics;
  replacementFund: TLHFundMetrics;
  correlation: number;
  trackingError: number;
  feeDifferential: number;
}

interface MetricRowProps {
  label: string;
  currentValue: string | number;
  replacementValue: string | number;
  format?: "percent" | "ratio" | "text";
  lowerIsBetter?: boolean;
}

const MetricRow = ({ label, currentValue, replacementValue, format = "text", lowerIsBetter = false }: MetricRowProps) => {
  const current = typeof currentValue === "number" ? currentValue : parseFloat(String(currentValue));
  const replacement = typeof replacementValue === "number" ? replacementValue : parseFloat(String(replacementValue));
  const diff = replacement - current;
  const isImprovement = lowerIsBetter ? diff < 0 : diff > 0;
  const isNeutral = Math.abs(diff) < 0.001;

  const formatValue = (val: number | string) => {
    if (typeof val === "string") return val;
    if (format === "percent") return `${val.toFixed(2)}%`;
    if (format === "ratio") return val.toFixed(2);
    return String(val);
  };

  return (
    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="text-right">
        <span className="text-sm font-medium">{formatValue(currentValue)}</span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        {isNeutral ? (
          <Minus className="w-3 h-3 text-muted-foreground" />
        ) : isImprovement ? (
          <ArrowUp className="w-3 h-3 text-emerald-600" />
        ) : (
          <ArrowDown className="w-3 h-3 text-destructive" />
        )}
      </div>
      <div>
        <span className={`text-sm font-medium ${isNeutral ? "" : isImprovement ? "text-emerald-600" : "text-destructive"}`}>
          {formatValue(replacementValue)}
        </span>
      </div>
    </div>
  );
};

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`w-3 h-3 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
    ))}
  </div>
);

export const BeforeAfterComparison = ({
  currentFund,
  replacementFund,
  correlation,
  trackingError,
  feeDifferential,
}: BeforeAfterComparisonProps) => {
  return (
    <div className="space-y-4">
      {/* Fund Headers */}
      <div className="grid grid-cols-[1fr,auto,1fr] items-start gap-3">
        <div className="text-right space-y-1">
          <p className="text-sm font-semibold text-destructive">SELL</p>
          <p className="text-sm font-medium">{currentFund.name}</p>
          <p className="text-xs text-muted-foreground">{currentFund.ticker} · {currentFund.isin}</p>
          <RatingStars rating={currentFund.morningstarRating} />
        </div>
        <div className="flex items-center justify-center pt-4">
          <div className="p-1.5 rounded-full bg-primary/10">
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-600">BUY</p>
          <p className="text-sm font-medium">{replacementFund.name}</p>
          <p className="text-xs text-muted-foreground">{replacementFund.ticker} · {replacementFund.isin}</p>
          <RatingStars rating={replacementFund.morningstarRating} />
        </div>
      </div>

      {/* Metrics Comparison */}
      <div className="rounded-lg border bg-muted/30 p-3">
        <MetricRow label="Expense Ratio" currentValue={currentFund.expenseRatio} replacementValue={replacementFund.expenseRatio} format="percent" lowerIsBetter />
        <MetricRow label="1Y Return" currentValue={currentFund.return1Y} replacementValue={replacementFund.return1Y} format="percent" />
        <MetricRow label="3Y Return" currentValue={currentFund.return3Y} replacementValue={replacementFund.return3Y} format="percent" />
        <MetricRow label="5Y Return" currentValue={currentFund.return5Y} replacementValue={replacementFund.return5Y} format="percent" />
        <MetricRow label="Sharpe Ratio" currentValue={currentFund.sharpeRatio} replacementValue={replacementFund.sharpeRatio} format="ratio" />
        <MetricRow label="Max Drawdown" currentValue={currentFund.maxDrawdown} replacementValue={replacementFund.maxDrawdown} format="percent" lowerIsBetter />
        <MetricRow label="Risk Rating" currentValue={currentFund.riskRating} replacementValue={replacementFund.riskRating} />
      </div>

      {/* Key Comparison Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border p-2 text-center">
          <p className="text-xs text-muted-foreground">Correlation</p>
          <p className="text-sm font-semibold">{(correlation * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-lg border p-2 text-center">
          <p className="text-xs text-muted-foreground">Tracking Error</p>
          <p className="text-sm font-semibold">{(trackingError * 100).toFixed(2)}%</p>
        </div>
        <div className="rounded-lg border p-2 text-center">
          <p className="text-xs text-muted-foreground">Fee Δ</p>
          <p className={`text-sm font-semibold ${feeDifferential <= 0 ? "text-emerald-600" : "text-destructive"}`}>
            {feeDifferential > 0 ? "+" : ""}{(feeDifferential * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};
