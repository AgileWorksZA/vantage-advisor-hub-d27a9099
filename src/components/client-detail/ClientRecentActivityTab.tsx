import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText } from "lucide-react";

interface ClientRecentActivityTabProps {
  clientName?: string;
}

// Demo activity log data for client context
const generateClientActivityLog = (clientName: string = "Client") => [
  { id: 1, date: "2026-02-03 10:15:33", type: "Product added", subtype: "", entityName: "Discovery Life Plan - Individual Life", note: "New policy created", activePerson: "Jordaan, Danie", dbId: 47159690 },
  { id: 2, date: "2026-02-02 14:22:10", type: "Document uploaded", subtype: "ID Document", entityName: "ID Document.pdf", note: "", activePerson: "Jordaan, Danie", dbId: 47159012 },
  { id: 3, date: "2026-02-01 09:45:22", type: "Note added", subtype: "Client Meeting", entityName: clientName, note: "Discussed retirement planning options", activePerson: "Jordaan, Danie", dbId: 47098234 },
  { id: 4, date: "2026-01-30 16:33:41", type: "Person updated", subtype: "", entityName: clientName, note: "Address updated", activePerson: "Jordaan, Danie", dbId: 47091456 },
  { id: 5, date: "2026-01-29 12:10:10", type: "iComply created", subtype: "Two step", entityName: `FAIS Control for ${clientName} on 2026-01-29`, note: "", activePerson: "Jordaan, Danie", dbId: 47105064 },
  { id: 6, date: "2026-01-28 11:09:58", type: "Consent created", subtype: "Consent", entityName: `Consent for ${clientName} on 2026-01-28`, note: "", activePerson: "Jordaan, Danie", dbId: 47105058 },
  { id: 7, date: "2026-01-27 15:09:11", type: "Last review date updated", subtype: "", entityName: clientName, note: "Review completed", activePerson: "Jordaan, Danie", dbId: 47105012 },
  { id: 8, date: "2026-01-26 14:22:18", type: "Banking details viewed", subtype: "", entityName: `${clientName} - Standard Bank`, note: "", activePerson: "Jordaan, Danie", dbId: 47089012 },
  { id: 9, date: "2026-01-25 11:55:03", type: "Advice process: document download", subtype: "ROA", entityName: `ROA - ${clientName} - 2026-01-25`, note: "", activePerson: "Jordaan, Danie", dbId: 47082345 },
  { id: 10, date: "2026-01-24 10:30:45", type: "Product added", subtype: "", entityName: "PSG Wealth Building Fund", note: "", activePerson: "Jordaan, Danie", dbId: 47081234 },
  { id: 11, date: "2026-01-23 15:20:12", type: "Person updated", subtype: "", entityName: clientName, note: "Contact details updated", activePerson: "Jordaan, Danie", dbId: 47074567 },
  { id: 12, date: "2026-01-22 09:15:33", type: "Email sent", subtype: "Policy Documents", entityName: "Policy confirmation email", note: "Sent via Outlook integration", activePerson: "Jordaan, Danie", dbId: 47068901 },
  { id: 13, date: "2026-01-21 14:45:28", type: "Note added", subtype: "Phone Call", entityName: clientName, note: "Client requested policy review", activePerson: "Jordaan, Danie", dbId: 47062345 },
  { id: 14, date: "2026-01-20 11:22:55", type: "Advice process: document download", subtype: "FNA", entityName: `FNA - ${clientName} - 2026-01-20`, note: "", activePerson: "Jordaan, Danie", dbId: 47058901 },
  { id: 15, date: "2026-01-19 16:40:19", type: "Risk profile updated", subtype: "", entityName: clientName, note: "Moderate to Aggressive", activePerson: "Jordaan, Danie", dbId: 47052345 },
];

const ITEMS_PER_PAGE = 10;

export const ClientRecentActivityTab = ({ clientName = "Client" }: ClientRecentActivityTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const activityLogData = generateClientActivityLog(clientName);
  const totalItems = activityLogData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedItems = activityLogData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[hsl(180,70%,45%)]">Event log</h2>

      <div className="flex items-center gap-4">
        <Button variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Label className="text-muted-foreground">Search By Date:</Label>
        <Input
          type="date"
          className="w-40"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <span>To</span>
        <Input
          type="date"
          className="w-40"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{totalItems} items</span>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToFirstPage}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Page</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={handlePageInput}
              className="w-16 h-8 text-center"
            />
            <span className="text-sm text-muted-foreground">of {totalPages}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToLastPage}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">#</TableHead>
              <TableHead className="min-w-[150px]">Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subtype</TableHead>
              <TableHead className="min-w-[200px]">Entity name</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Active person</TableHead>
              <TableHead className="w-24">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{startIndex + index + 1}</TableCell>
                <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.subtype || "-"}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={item.entityName}>
                  {item.entityName}
                </TableCell>
                <TableCell className="max-w-[150px] truncate" title={item.note}>
                  {item.note || "-"}
                </TableCell>
                <TableCell>{item.activePerson}</TableCell>
                <TableCell>{item.dbId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClientRecentActivityTab;
