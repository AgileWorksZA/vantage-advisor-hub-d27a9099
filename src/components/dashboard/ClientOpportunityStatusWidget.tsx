import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X, TrendingUp } from "lucide-react";
import { useClientOpportunityCategories, parseSegmentBoundaries } from "@/hooks/useClientOpportunityCategories";
import { useRegion } from "@/contexts/RegionContext";
import { useNavigate } from "react-router-dom";
import type { Priority } from "@/lib/opportunity-priority";

const PRIORITY_COLUMNS: { key: Priority; label: string; dotClass: string }[] = [
  { key: "urgent", label: "Urgent", dotClass: "bg-red-500" },
  { key: "important", label: "Important", dotClass: "bg-amber-500" },
  { key: "routine", label: "Routine", dotClass: "bg-emerald-500" },
];

interface ClientOpportunityStatusWidgetProps {
  onClose?: () => void;
}

export function ClientOpportunityStatusWidget({ onClose }: ClientOpportunityStatusWidgetProps) {
  const { filteredRegionalData } = useRegion();
  const navigate = useNavigate();
  const currencySymbol = filteredRegionalData?.currencySymbol || "R";

  const segmentBoundaries = useMemo(
    () => parseSegmentBoundaries(filteredRegionalData?.clientsByValue || []),
    [filteredRegionalData?.clientsByValue]
  );

  const { matrix, loading } = useClientOpportunityCategories(segmentBoundaries);

  const segmentLabels = useMemo(
    () => segmentBoundaries.map(s => s.label),
    [segmentBoundaries]
  );

  const formatValue = (value: number) => {
    if (value === 0) return "—";
    if (value >= 1_000_000) return `${currencySymbol} ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${currencySymbol} ${Math.round(value / 1_000)}k`;
    return `${currencySymbol} ${Math.round(value).toLocaleString()}`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Client Opportunities</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs">
                  <th className="text-left pb-2 font-normal">Segment</th>
                  {PRIORITY_COLUMNS.map((col) => (
                    <th key={col.key} className="text-center pb-2 font-normal">
                      <div className="flex items-center justify-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${col.dotClass}`} />
                        {col.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {segmentLabels.map((label) => (
                  <tr key={label} className="border-t border-border">
                    <td className="py-1.5 text-muted-foreground text-xs">{label}</td>
                    {PRIORITY_COLUMNS.map((col) => {
                      const cell = matrix[label]?.[col.key] || { count: 0, value: 0 };
                      return (
                        <td key={col.key} className="py-1.5 text-center">
                          {cell.count > 0 ? (
                            <div>
                              <button
                                onClick={() => navigate(`/opportunities/${col.key}`)}
                                className="text-primary hover:text-primary/80 font-medium cursor-pointer"
                              >
                                {cell.count}
                              </button>
                              <div className="text-[10px] text-muted-foreground">{formatValue(cell.value)}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => navigate("/ai-assistant")}
                className="animated-border-button animate rounded-full flex items-center gap-2 px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                View All Opportunities
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
