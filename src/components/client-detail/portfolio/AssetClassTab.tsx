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

const ASSET_CLASSES = [
  "Domestic Equity", "International Equity", "Domestic Bonds", "International Bonds",
  "Property", "Cash & Money Market", "Alternative Investments", "Infrastructure",
];

interface Props { clientId: string; nationality?: string | null; countryOfIssue?: string | null; currencySymbol: string; }

export default function AssetClassTab({ clientId, nationality, countryOfIssue, currencySymbol }: Props) {
  const [period, setPeriod] = useState("1Y");

  const assetClasses = useMemo(() => {
    const rand = seededRandom(clientId + "assetclass");
    const items = ASSET_CLASSES.map((name) => {
      const value = 50000 + rand() * 2000000;
      const changePct = -5 + rand() * 14;
      const spark = Array.from({ length: 6 }, () => 40 + rand() * 60);
      return { name, value, changePct, spark };
    });
    const total = items.reduce((s, c) => s + c.value, 0);
    return items.map((c) => ({ ...c, weight: (c.value / total) * 100 }));
  }, [clientId]);

  const fmtVal = (v: number) => v >= 1e6 ? `${currencySymbol}${(v / 1e6).toFixed(2)}m` : `${currencySymbol}${(v / 1e3).toFixed(0)}k`;

  return (
    <div className="space-y-4">
      <PortfolioFilterBar clientId={clientId} nationality={nationality} countryOfIssue={countryOfIssue} />
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Asset Class Breakdown</CardTitle>
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
                  <TableHead className="text-xs">Asset Class</TableHead>
                  <TableHead className="text-xs text-right">Value</TableHead>
                  <TableHead className="text-xs text-right">Weight</TableHead>
                  <TableHead className="text-xs text-center">Trend</TableHead>
                  <TableHead className="text-xs text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assetClasses.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium py-2">{a.name}</TableCell>
                    <TableCell className="text-xs text-right py-2 font-medium">{fmtVal(a.value)}</TableCell>
                    <TableCell className="text-xs text-right py-2">{a.weight.toFixed(1)}%</TableCell>
                    <TableCell className="py-2 text-center"><SparklineSvg data={a.spark} positive={a.changePct >= 0} /></TableCell>
                    <TableCell className="text-xs text-right py-2">
                      <Badge variant="outline" className={`text-[10px] ${a.changePct >= 0 ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-red-600 border-red-200 bg-red-50"}`}>
                        {a.changePct >= 0 ? "+" : ""}{a.changePct.toFixed(1)}%
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
