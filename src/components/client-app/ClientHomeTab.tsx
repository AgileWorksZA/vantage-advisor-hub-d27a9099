import { useMemo } from "react";
import { Calendar, Upload, MessageSquare, TrendingUp, TrendingDown } from "lucide-react";
import { generateClient360Data } from "@/data/regional360ViewData";

interface ClientHomeTabProps {
  clientId: string;
  clientName: string;
  nationality: string | null;
}

const ClientHomeTab = ({ clientId, clientName, nationality }: ClientHomeTabProps) => {
  const data = useMemo(() => generateClient360Data(clientId, nationality), [clientId, nationality]);

  const totalAUM = useMemo(() => {
    const onPlatform = data.onPlatformProducts.reduce((s, p) => s + p.amountValue, 0);
    const external = data.externalProducts.reduce((s, p) => s + p.amountValue, 0);
    const cash = data.platformCashAccounts.reduce((s, p) => s + p.amountValue, 0);
    return onPlatform + external + cash;
  }, [data]);

  const changePercent = useMemo(() => {
    const seed = clientId.charCodeAt(0) + clientId.charCodeAt(clientId.length - 1);
    return ((seed % 15) - 3) + (seed % 100) / 100;
  }, [clientId]);

  const isPositive = changePercent > 0;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Greeting */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Hello, {clientName.split(" ")[0]}</h2>
        <p className="text-xs text-muted-foreground">Here's your portfolio overview</p>
      </div>

      {/* Portfolio Summary Card */}
      <div className="bg-gradient-to-br from-[hsl(220,60%,50%)] to-[hsl(260,50%,40%)] rounded-2xl p-4 text-white">
        <p className="text-xs text-white/70 mb-1">Total Portfolio Value</p>
        <p className="text-2xl font-bold">
          {data.currencySymbol} {totalAUM.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
        <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? "text-emerald-300" : "text-red-300"}`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{isPositive ? "+" : ""}{changePercent.toFixed(2)}% this month</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: MessageSquare, label: "Message\nAdviser", color: "hsl(220,60%,50%)" },
          { icon: Upload, label: "Upload\nDocument", color: "hsl(160,60%,40%)" },
          { icon: Calendar, label: "Request\nMeeting", color: "hsl(280,50%,45%)" },
        ].map((action) => (
          <button
            key={action.label}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: action.color + "20" }}
            >
              <action.icon className="h-4 w-4" style={{ color: action.color }} />
            </div>
            <span className="text-[10px] font-medium text-foreground text-center whitespace-pre-line leading-tight">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Holdings Summary */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Your Holdings</h3>
        <div className="space-y-2">
          {data.onPlatformProducts.slice(0, 3).map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{p.product}</p>
                <p className="text-[10px] text-muted-foreground">{p.investmentHouse}</p>
              </div>
              <p className="text-xs font-semibold text-foreground shrink-0">{p.amount}</p>
            </div>
          ))}
          {data.externalProducts.slice(0, 2).map((p, i) => (
            <div key={`ext-${i}`} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{p.product}</p>
                <p className="text-[10px] text-muted-foreground">{p.provider}</p>
              </div>
              <p className="text-xs font-semibold text-foreground shrink-0">{p.amount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Meeting */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Upcoming Meeting</h3>
        <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[hsl(220,60%,50%)]/10 flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4 text-[hsl(220,60%,50%)]" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">Annual Portfolio Review</p>
            <p className="text-[10px] text-muted-foreground">Next Thursday at 10:00 AM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHomeTab;
