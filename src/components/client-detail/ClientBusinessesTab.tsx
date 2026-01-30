import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, RotateCcw } from "lucide-react";

const businessesData = [
  {
    name: "Die Familia Trust",
    type: "Trust",
    identification: "IT12345/2010",
    identificationType: "Trust Number",
    productViewing: "Full access",
    share: "100%",
    familyName: "BothamaJOB79",
  },
  {
    name: "Jordaan, Danile",
    type: "Individual",
    identification: "7503155081084",
    identificationType: "SA ID",
    productViewing: "Full access",
    share: "50%",
    familyName: "BothamaJOB79",
  },
  {
    name: "Botha Holdings (Pty) Ltd",
    type: "Company",
    identification: "2015/123456/07",
    identificationType: "Registration",
    productViewing: "Limited",
    share: "25%",
    familyName: "BothamaJOB79",
  },
  {
    name: "KB Investments CC",
    type: "Close Corporation",
    identification: "CK2010/098765",
    identificationType: "CK Number",
    productViewing: "Full access",
    share: "33%",
    familyName: "-",
  },
];

const ClientBusinessesTab = () => {
  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white gap-2">
          <Plus className="w-4 h-4" />
          Add new
        </Button>
        <Button variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
        <div className="flex-1" />
        <Input placeholder="Search businesses..." className="max-w-xs" />
      </div>

      {/* Businesses Table */}
      <div className="bg-background rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-normal text-muted-foreground">Name</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Identification</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">ID Type</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Product viewing</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Share</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Family name</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {businessesData.map((business, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="text-sm font-medium">{business.name}</TableCell>
                <TableCell className="text-sm">{business.type}</TableCell>
                <TableCell className="text-sm">{business.identification}</TableCell>
                <TableCell className="text-sm">{business.identificationType}</TableCell>
                <TableCell className="text-sm">{business.productViewing}</TableCell>
                <TableCell className="text-sm">{business.share}</TableCell>
                <TableCell className="text-sm">{business.familyName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClientBusinessesTab;
