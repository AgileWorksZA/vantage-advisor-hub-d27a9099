import { useState } from "react";
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
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Plus, RotateCcw, Download, Search } from "lucide-react";

const notesData = [
  { dateAdded: "28 Jan 2026 14:30", interaction: "Email", interactions: 2, priority: "Normal", subject: "Insurance kick-off guide", uploads: 1, complete: true, completedOn: "28 Jan 2026 15:00", responsibleUser: "Psg Website, Johan", owner: "Botha, Karel", visibleMyPSG: true },
  { dateAdded: "27 Jan 2026 10:15", interaction: "Phone", interactions: 1, priority: "High", subject: "Scheduled test report", uploads: 0, complete: false, completedOn: "-", responsibleUser: "Communications, PSG", owner: "Botha, Karel", visibleMyPSG: false },
  { dateAdded: "25 Jan 2026 09:00", interaction: "Email", interactions: 3, priority: "Normal", subject: "Annual review reminder", uploads: 2, complete: true, completedOn: "25 Jan 2026 11:00", responsibleUser: "Psg Website, Johan", owner: "Botha, Karel", visibleMyPSG: true },
  { dateAdded: "20 Jan 2026 16:45", interaction: "Meeting", interactions: 1, priority: "Low", subject: "Investment strategy discussion", uploads: 0, complete: true, completedOn: "20 Jan 2026 18:00", responsibleUser: "Jordaan, Danile", owner: "Botha, Karel", visibleMyPSG: false },
  { dateAdded: "15 Jan 2026 11:30", interaction: "Email", interactions: 5, priority: "Normal", subject: "Document request follow-up", uploads: 3, complete: true, completedOn: "16 Jan 2026 09:00", responsibleUser: "Communications, PSG", owner: "Botha, Karel", visibleMyPSG: true },
];

const ClientNotesTab = () => {
  const [notesPage, setNotesPage] = useState(1);
  const [notesFilter, setNotesFilter] = useState("current");

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={notesFilter} onValueChange={setNotesFilter}>
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
          <Button variant="outline" className="gap-2">
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
            {notesData.map((note, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
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
            ))}
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
        <span className="text-sm text-muted-foreground">1080 items, page {notesPage} of 54</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNotesPage(p => Math.min(54, p + 1))}>
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
