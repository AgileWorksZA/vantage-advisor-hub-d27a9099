import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useClientRelationships, FamilyMemberListItem, BusinessListItem } from "@/hooks/useClientRelationships";
import { useClientContacts } from "@/hooks/useClientContacts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AddFamilyMemberDialog from "./AddFamilyMemberDialog";
import AddBusinessDialog from "./AddBusinessDialog";
import AddContactDialog from "./AddContactDialog";
import EditFamilyMemberDialog from "./EditFamilyMemberDialog";

const ClientRelationshipsTab = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { 
    familyMembers, 
    businesses, 
    loading: relationshipsLoading, 
    refetch: refetchRelationships, 
    deleteRelationship 
  } = useClientRelationships(clientId || "");
  const { 
    contacts, 
    loading: contactsLoading, 
    refetch: refetchContacts, 
    deleteContact 
  } = useClientContacts(clientId || "");

  const [familyOpen, setFamilyOpen] = useState(true);
  const [businessOpen, setBusinessOpen] = useState(true);
  const [contactsOpen, setContactsOpen] = useState(true);

  const [showAddFamily, setShowAddFamily] = useState(false);
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMemberListItem | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<BusinessListItem | null>(null);

  const loading = relationshipsLoading || contactsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Family Members Section */}
      <Collapsible open={familyOpen} onOpenChange={setFamilyOpen}>
        <div className="bg-background rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <CollapsibleTrigger className="flex items-center gap-2 font-medium">
              {familyOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              HOUSEHOLD MEMBERS ({familyMembers.length})
            </CollapsibleTrigger>
            <Button 
              size="sm" 
              className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white gap-2"
              onClick={() => setShowAddFamily(true)}
            >
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </div>
          <CollapsibleContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-normal text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Relationship</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">ID Number</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">ID Type</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Product Viewing</TableHead>
                  <TableHead className="w-28"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {familyMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No household members found. Click "Add Member" to add a household member.
                    </TableCell>
                  </TableRow>
                ) : (
                  familyMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm font-medium">{member.name}</TableCell>
                      <TableCell className="text-sm">{member.familyType}</TableCell>
                      <TableCell className="text-sm">{member.identification}</TableCell>
                      <TableCell className="text-sm">{member.identificationType}</TableCell>
                      <TableCell className="text-sm">{member.productViewing}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setEditingFamilyMember(member)}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteRelationship(member.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Businesses Section */}
      <Collapsible open={businessOpen} onOpenChange={setBusinessOpen}>
        <div className="bg-background rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <CollapsibleTrigger className="flex items-center gap-2 font-medium">
              {businessOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              BUSINESSES ({businesses.length})
            </CollapsibleTrigger>
            <Button 
              size="sm" 
              className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white gap-2"
              onClick={() => setShowAddBusiness(true)}
            >
              <Plus className="w-4 h-4" />
              Add Business
            </Button>
          </div>
          <CollapsibleContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-normal text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Link Type</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Entity Type</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Reg Number</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Share %</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Product Viewing</TableHead>
                  <TableHead className="w-28"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No businesses found. Click "Add Business" to add a business relationship.
                    </TableCell>
                  </TableRow>
                ) : (
                  businesses.map((business) => (
                    <TableRow key={business.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm font-medium">{business.name}</TableCell>
                      <TableCell className="text-sm">{business.type}</TableCell>
                      <TableCell className="text-sm">{business.identificationType}</TableCell>
                      <TableCell className="text-sm">{business.identification}</TableCell>
                      <TableCell className="text-sm">{business.share}</TableCell>
                      <TableCell className="text-sm">{business.productViewing}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setEditingBusiness(business)}
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteRelationship(business.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Professional Contacts Section */}
      <Collapsible open={contactsOpen} onOpenChange={setContactsOpen}>
        <div className="bg-background rounded-lg border border-border">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <CollapsibleTrigger className="flex items-center gap-2 font-medium">
              {contactsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              PROFESSIONAL CONTACTS ({contacts.length})
            </CollapsibleTrigger>
            <Button 
              size="sm" 
              className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white gap-2"
              onClick={() => setShowAddContact(true)}
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </Button>
          </div>
          <CollapsibleContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-normal text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Contact Type</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Job Title</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Company</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Email</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Phone</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No professional contacts found. Click "Add Contact" to add a contact.
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact) => (
                    <TableRow key={contact.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm font-medium">{contact.name}</TableCell>
                      <TableCell className="text-sm">{contact.contactType}</TableCell>
                      <TableCell className="text-sm">{contact.jobTitle}</TableCell>
                      <TableCell className="text-sm">{contact.company}</TableCell>
                      <TableCell className="text-sm text-[hsl(180,70%,45%)]">{contact.email}</TableCell>
                      <TableCell className="text-sm">{contact.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteContact(contact.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Dialogs */}
      <AddFamilyMemberDialog
        open={showAddFamily}
        onOpenChange={setShowAddFamily}
        clientId={clientId || ""}
        onSuccess={refetchRelationships}
      />
      <AddBusinessDialog
        open={showAddBusiness}
        onOpenChange={setShowAddBusiness}
        clientId={clientId || ""}
        onSuccess={refetchRelationships}
      />
      <AddContactDialog
        open={showAddContact}
        onOpenChange={setShowAddContact}
        clientId={clientId || ""}
        onSuccess={refetchContacts}
      />
      <EditFamilyMemberDialog
        open={!!editingFamilyMember}
        onOpenChange={(open) => !open && setEditingFamilyMember(null)}
        clientId={clientId || ""}
        familyMember={editingFamilyMember}
        onSuccess={refetchRelationships}
      />
    </div>
  );
};

export default ClientRelationshipsTab;
