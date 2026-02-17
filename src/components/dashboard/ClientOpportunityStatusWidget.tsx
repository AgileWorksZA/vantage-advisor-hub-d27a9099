import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, X, AlertTriangle, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { useClientOpportunityCategories, type ClientCategoryItem } from "@/hooks/useClientOpportunityCategories";
import { useRegion } from "@/contexts/RegionContext";
import { useNavigate } from "react-router-dom";
import type { Priority } from "@/lib/opportunity-priority";

const priorityConfig: Record<Priority, { label: string; icon: React.ReactNode; dotClass: string }> = {
  urgent: { label: "Urgent", icon: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />, dotClass: "bg-red-500" },
  important: { label: "Important", icon: <Clock className="h-3.5 w-3.5 text-amber-500" />, dotClass: "bg-amber-500" },
  routine: { label: "Routine", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />, dotClass: "bg-emerald-500" },
};

export function ClientOpportunityStatusWidget() {
  const { categories } = useClientOpportunityCategories();
  const { filteredRegionalData } = useRegion();
  const navigate = useNavigate();
  const currencySymbol = filteredRegionalData?.currencySymbol || "R";

  const formatValue = (value: number) => {
    if (value === 0) return "—";
    return `${currencySymbol} ${Math.round(value).toLocaleString()}`;
  };

  const renderSection = (priority: Priority, items: ClientCategoryItem[]) => {
    const config = priorityConfig[priority];
    const totalValue = items.reduce((sum, i) => sum + i.totalValue, 0);
    const displayItems = items.slice(0, 3);

    return (
      <div key={priority} className="mb-1">
        <button
          onClick={() => navigate(`/opportunities/${priority}`)}
          className="w-full flex items-center gap-1.5 py-1.5 px-1 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
        >
          {config.icon}
          <span className="text-xs font-semibold flex-1 text-left">{config.label}</span>
          <span className="text-xs text-muted-foreground mr-1">{formatValue(totalValue)}</span>
          <Badge variant="outline" className="text-[10px] px-1 py-0">{items.length}</Badge>
          <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <div className="ml-5 space-y-0.5">
          {displayItems.map(item => (
            <div
              key={item.clientId}
              className="flex items-center gap-2 py-0.5 px-1 rounded hover:bg-muted/30 cursor-pointer text-xs"
              onClick={() => navigate(`/clients/${item.clientId}`)}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
              <span className="truncate flex-1 text-muted-foreground">{item.clientName}</span>
              <span className="text-muted-foreground whitespace-nowrap">{formatValue(item.totalValue)}</span>
            </div>
          ))}
          {items.length > 3 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/opportunities/${priority}`); }}
              className="text-[10px] text-primary hover:underline ml-3"
            >
              +{items.length - 3} more
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Client Opportunity Status</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-0.5">
        {renderSection("urgent", categories.urgent)}
        {renderSection("important", categories.important)}
        {renderSection("routine", categories.routine)}
      </CardContent>
    </Card>
  );
}
