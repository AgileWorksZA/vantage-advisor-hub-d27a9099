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
import { Plus, Search } from "lucide-react";

const contactsData = [
  {
    name: "Van der Merwe, Johan",
    jobTitle: "Accountant",
    email: "johan@accountants.co.za",
    phone: "+27 21 555 1234",
  },
  {
    name: "Pretorius, Marie",
    jobTitle: "Executor",
    email: "marie.pretorius@legal.co.za",
    phone: "+27 21 555 5678",
  },
  {
    name: "Smith, David",
    jobTitle: "Attorney",
    email: "david.smith@law.co.za",
    phone: "+27 21 555 9012",
  },
  {
    name: "Johnson, Sarah",
    jobTitle: "Tax Consultant",
    email: "sarah@taxconsult.co.za",
    phone: "+27 21 555 3456",
  },
];

const ClientContactsTab = () => {
  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white gap-2">
          <Plus className="w-4 h-4" />
          Add new
        </Button>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." className="pl-10 w-64" />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-background rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-normal text-muted-foreground">Name</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Job title</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Email</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Phone number(s)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contactsData.map((contact, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="text-sm font-medium">{contact.name}</TableCell>
                <TableCell className="text-sm">{contact.jobTitle}</TableCell>
                <TableCell className="text-sm text-[hsl(180,70%,45%)]">{contact.email}</TableCell>
                <TableCell className="text-sm">{contact.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClientContactsTab;
