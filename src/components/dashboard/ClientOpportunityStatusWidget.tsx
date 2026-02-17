import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X } from "lucide-react";
import { useClients, type ClientListItem } from "@/hooks/useClients";
import { generateClient360Data } from "@/data/regional360ViewData";
import { getOpportunityPriority } from "@/lib/opportunity-priority";
import { buildGapOpportunities } from "@/components/client-detail/next-best-action/OpportunitiesTab";
import { useRegion } from "@/contexts/RegionContext";

interface CategoryData {
  label: string;
  dotClass: string;
  count: number;
  totalValue: number;
}

function getClientCategory(client: ClientListItem) {
  const clientData = generateClient360Data(client.id, client.nationality, client.countryOfIssue);
  const products = [
    ...clientData.onPlatformProducts.map(p => ({ category: "Investment", currentValue: p.amountValue, productName: p.product } as any)),
    ...clientData.externalProducts.map(p => ({ category: "External Investment", currentValue: p.amountValue, productName: p.product } as any)),
    ...clientData.platformCashAccounts.map(p => ({ category: "Cash", currentValue: p.amountValue, productName: p.name } as any)),
    ...clientData.riskProducts.map(p => ({ category: "Risk/Insurance", currentValue: 0, productName: p.holdingName } as any)),
  ];
  const gaps = buildGapOpportunities(products);
  const totalOppValue = gaps.reduce((sum, g) => sum + (g.opportunitySize || 0), 0);
  const types = gaps.map(g => g.type);

  if (types.some(t => getOpportunityPriority(t) === "urgent")) return { status: "urgent" as const, value: totalOppValue };
  if (types.some(t => getOpportunityPriority(t) === "important")) return { status: "important" as const, value: totalOppValue };
  return { status: "routine" as const, value: totalOppValue };
}

export function ClientOpportunityStatusWidget() {
  const { clients } = useClients();
  const { filteredRegionalData } = useRegion();

  const categories = useMemo<CategoryData[]>(() => {
    const counts = { urgent: 0, important: 0, routine: 0 };
    const values = { urgent: 0, important: 0, routine: 0 };

    (clients || []).forEach(client => {
      const { status, value } = getClientCategory(client);
      counts[status]++;
      values[status] += value;
    });

    return [
      { label: "Urgent", dotClass: "bg-red-500", count: counts.urgent, totalValue: values.urgent },
      { label: "Important", dotClass: "bg-orange-500", count: counts.important, totalValue: values.important },
      { label: "Routine", dotClass: "bg-emerald-500", count: counts.routine, totalValue: values.routine },
    ];
  }, [clients]);

  const currencySymbol = filteredRegionalData?.currencySymbol || "R";

  const formatValue = (value: number) => {
    if (value === 0) return "—";
    return `${currencySymbol} ${Math.round(value).toLocaleString()}`;
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
      <CardContent className="px-4 pb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs">
              <th className="text-left pb-2 font-normal">Status</th>
              <th className="text-right pb-2 font-normal">Clients</th>
              <th className="text-right pb-2 font-normal">Opportunity</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.label} className="border-t border-border">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${cat.dotClass}`} />
                    <span>{cat.label}</span>
                  </div>
                </td>
                <td className="py-2 text-right text-muted-foreground">{cat.count}</td>
                <td className="py-2 text-right">{formatValue(cat.totalValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
