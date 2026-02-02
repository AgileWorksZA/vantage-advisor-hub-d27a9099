import { useParams } from "react-router-dom";
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
import { Plus, Search, Loader2 } from "lucide-react";
import { useClientContacts } from "@/hooks/useClientContacts";

const ClientContactsTab = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { contacts, loading } = useClientContacts(clientId || "");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No contacts found. Click "Add new" to add a professional contact.
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id} className="hover:bg-muted/50">
                  <TableCell className="text-sm font-medium">{contact.name}</TableCell>
                  <TableCell className="text-sm">{contact.jobTitle}</TableCell>
                  <TableCell className="text-sm text-[hsl(180,70%,45%)]">{contact.email}</TableCell>
                  <TableCell className="text-sm">{contact.phone}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClientContactsTab;
