import { useMemo, useState } from "react";
import { generateClient360Data } from "@/data/regional360ViewData";
import WorldMapSVG from "@/components/client-detail/WorldMapSVG";

interface ClientPortfolioTabProps {
  clientId: string;
  nationality: string | null;
}

const periods = ["6M", "1Y", "3Y", "5Y"] as const;

const ClientPortfolioTab = ({ clientId, nationality }: ClientPortfolioTabProps) => {
  const [period, setPeriod] = useState<typeof periods[number]>("1Y");
  const data = useMemo(() => generateClient360Data(clientId, nationality), [clientId, nationality]);

  const allHoldings = useMemo(() => {
    const holdings = [
      ...data.onPlatformProducts.map((p) => ({ name: p.product, provider: p.investmentHouse, value: p.amountValue })),
      ...data.externalProducts.map((p) => ({ name: p.product, provider: p.provider, value: p.amountValue })),
    ];
    return holdings.sort((a, b) => b.value - a.value);
  }, [data]);

  const totalValue = allHoldings.reduce((s, h) => s + h.value, 0);

  const assetClasses = useMemo(() => {
    const classes = [
      { name: "Equity", pct: 45 + (clientId.charCodeAt(0) % 10), color: "hsl(220, 60%, 50%)" },
      { name: "Fixed Income", pct: 20 + (clientId.charCodeAt(1) % 8), color: "hsl(160, 50%, 45%)" },
      { name: "Property", pct: 10 + (clientId.charCodeAt(2) % 5), color: "hsl(280, 45%, 50%)" },
      { name: "Cash", pct: 0, color: "hsl(40, 60%, 50%)" },
    ];
    classes[3].pct = Math.max(0, 100 - classes[0].pct - classes[1].pct - classes[2].pct);
    return classes;
  }, [clientId]);

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-bold text-foreground">Portfolio</h2>

      {/* Period Toggle */}
      <div className="flex bg-muted rounded-full p-0.5 w-fit">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              period === p
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Asset Allocation */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Asset Allocation</h3>
        <div className="space-y-2">
          {assetClasses.map((ac) => (
            <div key={ac.name} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: ac.color }} />
              <span className="text-xs text-foreground flex-1">{ac.name}</span>
              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${ac.pct}%`, backgroundColor: ac.color }} />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{ac.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Diversification */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Geographic Diversification</h3>
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <WorldMapSVG className="h-28" />
        </div>
      </div>

      {/* Holdings */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">All Holdings</h3>
        <div className="space-y-1.5">
          {allHoldings.map((h, i) => {
            const pct = totalValue > 0 ? ((h.value / totalValue) * 100).toFixed(1) : "0";
            return (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{h.name}</p>
                  <p className="text-[10px] text-muted-foreground">{h.provider}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-xs font-semibold text-foreground">
                    {data.currencySymbol} {h.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{pct}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClientPortfolioTab;
