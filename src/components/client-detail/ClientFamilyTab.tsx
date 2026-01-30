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

const familyData = [
  {
    name: "Bothma, Anna",
    type: "Individual",
    identification: "7708150081089",
    identificationType: "SA ID",
    productViewing: "Full access",
    familyType: "Spouse",
    familyName: "BothamaJOB79",
  },
  {
    name: "Jordaan, Chuck",
    type: "Individual",
    identification: "0104155081082",
    identificationType: "SA ID",
    productViewing: "Limited",
    familyType: "Child",
    familyName: "BothamaJOB79",
  },
  {
    name: "Jordaan, Sara",
    type: "Individual",
    identification: "0306125081086",
    identificationType: "SA ID",
    productViewing: "Limited",
    familyType: "Child",
    familyName: "BothamaJOB79",
  },
  {
    name: "Botha, Willem",
    type: "Individual",
    identification: "4502105081084",
    identificationType: "SA ID",
    productViewing: "None",
    familyType: "Parent",
    familyName: "BothamaJOB79",
  },
];

const ClientFamilyTab = () => {
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
        <Input placeholder="Search family members..." className="max-w-xs" />
      </div>

      {/* Family Table */}
      <div className="bg-background rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-normal text-muted-foreground">Name</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Identification</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">ID Type</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Product viewing</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Family Type</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Family name</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {familyData.map((member, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="text-sm font-medium">{member.name}</TableCell>
                <TableCell className="text-sm">{member.type}</TableCell>
                <TableCell className="text-sm">{member.identification}</TableCell>
                <TableCell className="text-sm">{member.identificationType}</TableCell>
                <TableCell className="text-sm">{member.productViewing}</TableCell>
                <TableCell className="text-sm">{member.familyType}</TableCell>
                <TableCell className="text-sm">{member.familyName}</TableCell>
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

export default ClientFamilyTab;
