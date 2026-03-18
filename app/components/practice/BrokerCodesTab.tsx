import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Info, RotateCcw, Search, Settings, X } from "lucide-react";

const brokerCodesData = [
  { id: 1, provider: "PSG Asset Management Administration Services Ltd", code: "DDDD", houseCode: "PSG Asset Management", umbrellaProvider: "", isPrimary: true, forFinanceOnly: false, incomeSplit: 100, assetSplit: 100, dbId: 194696, isActive: true },
  { id: 2, provider: "PSG Konsult Ltd", code: "0100039590", houseCode: "PSG Konsult", umbrellaProvider: "", isPrimary: true, forFinanceOnly: false, incomeSplit: 100, assetSplit: 100, dbId: 1941, isActive: true },
  { id: 3, provider: "PSG Securities Ltd (Shares)", code: "JD8", houseCode: "PSG Securities", umbrellaProvider: "", isPrimary: true, forFinanceOnly: false, incomeSplit: 100, assetSplit: 100, dbId: 195201, isActive: true },
  { id: 4, provider: "PSG Securities Ltd (Unit Trusts)", code: "JD8-UT", houseCode: "PSG Securities", umbrellaProvider: "", isPrimary: false, forFinanceOnly: true, incomeSplit: 75, assetSplit: 75, dbId: 195202, isActive: true },
  { id: 5, provider: "Sanlam Life Insurance Ltd", code: "SL-1234", houseCode: "Sanlam", umbrellaProvider: "Sanlam Group", isPrimary: false, forFinanceOnly: false, incomeSplit: 50, assetSplit: 50, dbId: 195203, isActive: true },
  { id: 6, provider: "Discovery Life Ltd", code: "DIS-8822", houseCode: "Discovery", umbrellaProvider: "Discovery Holdings", isPrimary: false, forFinanceOnly: true, incomeSplit: 60, assetSplit: 60, dbId: 195204, isActive: false },
  { id: 7, provider: "Liberty Group Ltd", code: "LIB-4455", houseCode: "Liberty", umbrellaProvider: "", isPrimary: false, forFinanceOnly: false, incomeSplit: 80, assetSplit: 80, dbId: 195205, isActive: true },
];

export const BrokerCodesTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const filteredCodes = brokerCodesData.filter(code => {
    const matchesSearch =
      code.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.houseCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!showInactive && !code.isActive) return false;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">Broker Codes</h2>
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Broker codes may only be added from iBase. If you would like to add one, please contact the iBase support staff.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setSearchQuery("")}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search broker codes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label htmlFor="show-inactive" className="text-sm">Inactive</Label>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">{filteredCodes.length} items</div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>House code</TableHead>
              <TableHead>Umbrella provider</TableHead>
              <TableHead className="text-center">Is primary</TableHead>
              <TableHead className="text-center">For finance use only</TableHead>
              <TableHead className="text-right">Income split %</TableHead>
              <TableHead className="text-right">Asset split %</TableHead>
              <TableHead className="w-16">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No broker codes found
                </TableCell>
              </TableRow>
            ) : (
              filteredCodes.map((code, index) => (
                <TableRow key={code.id} className={!code.isActive ? "opacity-50" : ""}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="text-[hsl(180,70%,45%)] font-medium cursor-pointer hover:underline max-w-[200px] truncate">
                    {code.provider}
                  </TableCell>
                  <TableCell>{code.code}</TableCell>
                  <TableCell>{code.houseCode}</TableCell>
                  <TableCell>{code.umbrellaProvider || "-"}</TableCell>
                  <TableCell className="text-center">
                    {code.isPrimary ? (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {code.forFinanceOnly ? (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">{code.incomeSplit}%</TableCell>
                  <TableCell className="text-right">{code.assetSplit}%</TableCell>
                  <TableCell>{code.dbId}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
