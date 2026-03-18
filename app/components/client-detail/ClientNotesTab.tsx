import { useState } from "react";
import { useParams } from "react-router";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Plus, RotateCcw, Download, Search, Loader2 } from "lucide-react";
import { useClientNotes } from "@/hooks/useClientNotes";

const ClientNotesTab = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [notesPage, setNotesPage] = useState(1);
  const [notesFilter, setNotesFilter] = useState<"current" | "all" | "completed" | "pending">("current");
  
  const { notes, loading, totalCount, refetch } = useClientNotes(clientId || "");

  const handleFilterChange = (value: string) => {
    const filter = value as "current" | "all" | "completed" | "pending";
    setNotesFilter(filter);
    refetch(filter);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / 20) || 1;

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={notesFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Show current notes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Show current notes</SelectItem>
              <SelectItem value="all">Show all notes</SelectItem>
              <SelectItem value="completed">Completed only</SelectItem>
              <SelectItem value="pending">Pending only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white gap-2">
            <Plus className="w-4 h-4" />
            Add new
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => refetch()}>
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search notes..." className="pl-10 w-64" />
        </div>
      </div>

      {/* Notes Table */}
      <div className="bg-background rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-normal text-muted-foreground">Date added</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Interaction</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Interactions</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Priority</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Subject</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Uploads</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Complete</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Completed on</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Responsible user</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Owner</TableHead>
              <TableHead className="text-xs font-normal text-muted-foreground">Visible on myPSG</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No notes found. Click "Add new" to create a note.
                </TableCell>
              </TableRow>
            ) : (
              notes.map((note) => (
                <TableRow key={note.id} className="hover:bg-muted/50">
                  <TableCell className="text-sm whitespace-nowrap">{note.dateAdded}</TableCell>
                  <TableCell className="text-sm">{note.interaction}</TableCell>
                  <TableCell className="text-sm">{note.interactions}</TableCell>
                  <TableCell className="text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      note.priority === "High" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" :
                      note.priority === "Low" ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" :
                      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    }`}>
                      {note.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{note.subject}</TableCell>
                  <TableCell className="text-sm">{note.uploads}</TableCell>
                  <TableCell className="text-sm">{note.complete ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{note.completedOn}</TableCell>
                  <TableCell className="text-sm">{note.responsibleUser}</TableCell>
                  <TableCell className="text-sm">{note.owner}</TableCell>
                  <TableCell className="text-sm">{note.visibleMyPSG ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={notesPage === 1}>
          <ChevronFirst className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={notesPage === 1}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground">{totalCount} items, page {notesPage} of {totalPages}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNotesPage(p => Math.min(totalPages, p + 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <ChevronLast className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ClientNotesTab;
