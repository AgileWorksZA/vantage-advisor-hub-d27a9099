import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SparklineSvg from "./SparklineSvg";
import PortfolioFilterBar from "./PortfolioFilterBar";

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return () => { h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 13), 0x45d9f3b); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}

const EQUITIES = [
  { name: "Amazon", ticker: "AMZN", sector: "Technology" },
  { name: "Apple", ticker: "AAPL", sector: "Technology" },
  { name: "Microsoft", ticker: "MSFT", sector: "Technology" },
  { name: "Alphabet", ticker: "GOOGL", sector: "Technology" },
  { name: "NVIDIA", ticker: "NVDA", sector: "Technology" },
  { name: "Meta", ticker: "META", sector: "Technology" },
  { name: "Tesla", ticker: "TSLA", sector: "Consumer Discretionary" },
  { name: "TSMC", ticker: "TSM", sector: "Semiconductors" },
  { name: "Samsung", ticker: "SSNLF", sector: "Technology" },
  { name: "Nestle", ticker: "NSRGY", sector: "Consumer Staples" },
  { name: "ASML", ticker: "ASML", sector: "Semiconductors" },
  { name: "Novo Nordisk", ticker: "NVO", sector: "Healthcare" },
  { name: "Johnson & Johnson", ticker: "JNJ", sector: "Healthcare" },
  { name: "JPMorgan Chase", ticker: "JPM", sector: "Financials" },
  { name: "Visa", ticker: "V", sector: "Financials" },
  { name: "Mastercard", ticker: "MA", sector: "Financials" },
  { name: "Broadcom", ticker: "AVGO", sector: "Semiconductors" },
  { name: "Berkshire Hathaway", ticker: "BRK.B", sector: "Financials" },
  { name: "UnitedHealth", ticker: "UNH", sector: "Healthcare" },
  { name: "Procter & Gamble", ticker: "PG", sector: "Consumer Staples" },
];

interface Props { clientId: string; nationality?: string | null; countryOfIssue?: string | null; currencySymbol: string; }

export default function CompaniesTab({ clientId, nationality, countryOfIssue, currencySymbol }: Props) {
  const [period, setPeriod] = useState("1Y");

  const companies = useMemo(() => {
    const rand = seededRandom(clientId + "companies");
    const count = 6 + Math.floor(rand() * 8);
    const shuffled = [...EQUITIES].sort(() => rand() - 0.5).slice(0, count);
    const items = shuffled.map((eq) => {
      const value = 50000 + rand() * 2000000;
      const changePct = -8 + rand() * 20;
      const spark = Array.from({ length: 6 }, () => 40 + rand() * 60);
      return { ...eq, value, changePct, spark };
    });
    const totalValue = items.reduce((s, c) => s + c.value, 0);
    return items.map((c) => ({ ...c, weight: (c.value / totalValue) * 100 }));
  }, [clientId]);

  const fmtVal = (v: number) => v >= 1e6 ? `${currencySymbol}${(v / 1e6).toFixed(2)}m` : `${currencySymbol}${(v / 1e3).toFixed(0)}k`;

  return (
    <div className="space-y-4">
      <PortfolioFilterBar clientId={clientId} nationality={nationality} countryOfIssue={countryOfIssue} />
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Underlying Companies</CardTitle>
          <div className="flex gap-1">
            {["6M", "1Y", "3Y", "5Y"].map((p) => (
              <Button key={p} variant={period === p ? "default" : "ghost"} size="sm" className="h-6 text-xs px-2" onClick={() => setPeriod(p)}>{p}</Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Company</TableHead>
                  <TableHead className="text-xs">Ticker</TableHead>
                  <TableHead className="text-xs">Sector</TableHead>
                  <TableHead className="text-xs text-right">Value</TableHead>
                  <TableHead className="text-xs text-right">Weight</TableHead>
                  <TableHead className="text-xs text-center">Trend</TableHead>
                  <TableHead className="text-xs text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium py-2">{c.name}</TableCell>
                    <TableCell className="text-xs py-2 font-mono text-muted-foreground">{c.ticker}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="secondary" className="text-[10px] font-normal">{c.sector}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right py-2 font-medium">{fmtVal(c.value)}</TableCell>
                    <TableCell className="text-xs text-right py-2">{c.weight.toFixed(1)}%</TableCell>
                    <TableCell className="py-2 text-center"><SparklineSvg data={c.spark} positive={c.changePct >= 0} /></TableCell>
                    <TableCell className="text-xs text-right py-2">
                      <Badge variant="outline" className={`text-[10px] ${c.changePct >= 0 ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-red-600 border-red-200 bg-red-50"}`}>
                        {c.changePct >= 0 ? "+" : ""}{c.changePct.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
