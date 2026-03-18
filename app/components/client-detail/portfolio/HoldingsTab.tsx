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

const FUND_NAMES = [
  "Global Equity Growth Fund", "Domestic Bond Index", "Balanced Moderate Fund",
  "Money Market Fund", "Property Income Fund", "High Yield Credit Fund",
  "Emerging Markets Equity", "Multi-Asset Low Equity", "Technology Sector Fund",
  "Dividend Growth Fund", "Infrastructure Fund", "Government Bond Fund",
];

interface Props { clientId: string; nationality?: string | null; countryOfIssue?: string | null; currencySymbol: string; }

export default function HoldingsTab({ clientId, nationality, countryOfIssue, currencySymbol }: Props) {
  const [period, setPeriod] = useState("1Y");

  const holdings = useMemo(() => {
    const rand = seededRandom(clientId + "holdings");
    const count = 6 + Math.floor(rand() * 5);
    return Array.from({ length: count }, (_, i) => {
      const price = 10 + rand() * 490;
      const units = 50 + rand() * 2000;
      const value = price * units;
      const changePct = -8 + rand() * 20;
      const spark = Array.from({ length: 6 }, () => 40 + rand() * 60);
      return {
        name: FUND_NAMES[i % FUND_NAMES.length],
        isin: `XX${String(Math.floor(rand() * 1e10)).padStart(10, "0")}`,
        units: units.toFixed(2),
        price: `${currencySymbol}${price.toFixed(2)}`,
        value,
        changePct,
        spark,
      };
    });
  }, [clientId, currencySymbol]);

  const fmtVal = (v: number) => v >= 1e6 ? `${currencySymbol}${(v / 1e6).toFixed(2)}m` : `${currencySymbol}${(v / 1e3).toFixed(0)}k`;

  return (
    <div className="space-y-4">
      <PortfolioFilterBar clientId={clientId} nationality={nationality} countryOfIssue={countryOfIssue} />
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Holdings</CardTitle>
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
                  <TableHead className="text-xs">Holding</TableHead>
                  <TableHead className="text-xs">ISIN</TableHead>
                  <TableHead className="text-xs text-right">Units</TableHead>
                  <TableHead className="text-xs text-right">Price</TableHead>
                  <TableHead className="text-xs text-right">Value</TableHead>
                  <TableHead className="text-xs text-center">Trend</TableHead>
                  <TableHead className="text-xs text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((h, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium py-2">{h.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2 font-mono">{h.isin}</TableCell>
                    <TableCell className="text-xs text-right py-2">{h.units}</TableCell>
                    <TableCell className="text-xs text-right py-2">{h.price}</TableCell>
                    <TableCell className="text-xs text-right py-2 font-medium">{fmtVal(h.value)}</TableCell>
                    <TableCell className="py-2 text-center"><SparklineSvg data={h.spark} positive={h.changePct >= 0} /></TableCell>
                    <TableCell className="text-xs text-right py-2">
                      <Badge variant="outline" className={`text-[10px] ${h.changePct >= 0 ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-red-600 border-red-200 bg-red-50"}`}>
                        {h.changePct >= 0 ? "+" : ""}{h.changePct.toFixed(1)}%
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
