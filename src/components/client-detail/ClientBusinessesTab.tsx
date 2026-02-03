import { useParams, useNavigate } from "react-router-dom";
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
import { Pencil, Trash2, Plus, RotateCcw, Loader2, ArrowLeft } from "lucide-react";
import { useClientRelationships } from "@/hooks/useClientRelationships";

const ClientBusinessesTab = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { businesses, loading, refetch, deleteRelationship } = useClientRelationships(clientId || "");

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
        <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => refetch()}>
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
            {businesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No businesses found. Click "Add new" to add a business relationship.
                </TableCell>
              </TableRow>
            ) : (
              businesses.map((business) => (
                <TableRow key={business.id} className="hover:bg-muted/50">
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteRelationship(business.id)}
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
      </div>
    </div>
  );
};

export default ClientBusinessesTab;
