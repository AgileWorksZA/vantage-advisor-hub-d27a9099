import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText } from "lucide-react";

const activityLogData = [
  { id: 1, date: "2026-01-19 15:17:33", type: "Add product", subtype: "", client: "Botha, Karel", entityName: "PSG Securities Ltd Local - Share portfolio (Local)", note: "", activePerson: "Jordaan, Danie", dbId: 47159690 },
  { id: 2, date: "2026-01-14 12:10:10", type: "iComply created", subtype: "Two step", client: "Botha, Karel", entityName: "FAIS Control for Karel Botha on 2026-01-14", note: "", activePerson: "Jordaan, Danie", dbId: 47105064 },
  { id: 3, date: "2026-01-14 12:09:58", type: "Consent created", subtype: "Consent", client: "Botha, Karel", entityName: "Consent for Karel Botha on 2026-01-14", note: "", activePerson: "Jordaan, Danie", dbId: 47105058 },
  { id: 4, date: "2026-01-14 12:09:11", type: "Last review date updated", subtype: "", client: "Botha, Karel", entityName: "Karel Botha", note: "Review completed", activePerson: "Jordaan, Danie", dbId: 47105012 },
  { id: 5, date: "2026-01-13 09:45:22", type: "Note added", subtype: "Client Meeting", client: "Van Wyk, Petrus", entityName: "Petrus Van Wyk", note: "Discussed retirement planning options", activePerson: "Jordaan, Danie", dbId: 47098234 },
  { id: 6, date: "2026-01-12 16:33:41", type: "Person updated", subtype: "", client: "Joubert, Anna", entityName: "Anna Joubert", note: "Address updated", activePerson: "Jordaan, Danie", dbId: 47091456 },
  { id: 7, date: "2026-01-12 14:22:18", type: "Banking details viewed", subtype: "", client: "Botha, Karel", entityName: "Karel Botha - Standard Bank", note: "", activePerson: "Jordaan, Danie", dbId: 47089012 },
  { id: 8, date: "2026-01-11 11:55:03", type: "Advice process: document download", subtype: "ROA", client: "Smit, Johannes", entityName: "ROA - Johannes Smit - 2026-01-11", note: "", activePerson: "Jordaan, Danie", dbId: 47082345 },
  { id: 9, date: "2026-01-11 10:30:45", type: "Add product", subtype: "", client: "Smit, Johannes", entityName: "PSG Wealth Building Fund", note: "", activePerson: "Jordaan, Danie", dbId: 47081234 },
  { id: 10, date: "2026-01-10 15:20:12", type: "Person updated", subtype: "", client: "Meyer, Christo", entityName: "Christo Meyer", note: "Contact details updated", activePerson: "Jordaan, Danie", dbId: 47074567 },
  { id: 11, date: "2026-01-10 09:15:33", type: "iComply created", subtype: "Two step", client: "Du Plessis, Marie", entityName: "FAIS Control for Marie Du Plessis on 2026-01-10", note: "", activePerson: "Jordaan, Danie", dbId: 47068901 },
  { id: 12, date: "2026-01-09 14:45:28", type: "Note added", subtype: "Phone Call", client: "Van der Merwe, Jan", entityName: "Jan Van der Merwe", note: "Client requested policy review", activePerson: "Jordaan, Danie", dbId: 47062345 },
  { id: 13, date: "2026-01-09 11:22:55", type: "Advice process: document download", subtype: "FNA", client: "Botha, Karel", entityName: "FNA - Karel Botha - 2026-01-09", note: "", activePerson: "Jordaan, Danie", dbId: 47058901 },
  { id: 14, date: "2026-01-08 16:40:19", type: "Last review date updated", subtype: "", client: "Pretorius, Hennie", entityName: "Hennie Pretorius", note: "", activePerson: "Jordaan, Danie", dbId: 47052345 },
  { id: 15, date: "2026-01-08 10:05:42", type: "Banking details viewed", subtype: "", client: "Venter, Susan", entityName: "Susan Venter - FNB", note: "", activePerson: "Jordaan, Danie", dbId: 47045678 },
  { id: 16, date: "2026-01-07 15:30:11", type: "Add product", subtype: "", client: "Nel, Pieter", entityName: "Discovery Life Plan", note: "New life policy", activePerson: "Jordaan, Danie", dbId: 47039012 },
  { id: 17, date: "2026-01-07 09:55:38", type: "Consent created", subtype: "Consent", client: "Coetzee, Lizette", entityName: "Consent for Lizette Coetzee on 2026-01-07", note: "", activePerson: "Jordaan, Danie", dbId: 47032345 },
  { id: 18, date: "2026-01-06 14:20:05", type: "Person updated", subtype: "", client: "Steyn, Willem", entityName: "Willem Steyn", note: "Employment details updated", activePerson: "Jordaan, Danie", dbId: 47025678 },
  { id: 19, date: "2026-01-06 11:45:29", type: "Note added", subtype: "Email", client: "Fourie, Gerrit", entityName: "Gerrit Fourie", note: "Sent policy documents", activePerson: "Jordaan, Danie", dbId: 47019012 },
  { id: 20, date: "2026-01-05 16:10:55", type: "Advice process: document download", subtype: "Quote", client: "Du Toit, Marlene", entityName: "Quote - Marlene Du Toit - 2026-01-05", note: "", activePerson: "Jordaan, Danie", dbId: 47012345 },
];

const ITEMS_PER_PAGE = 10;
const TOTAL_ITEMS = 1244; // Simulated total from screenshot

export const ActivityLogTabEnhanced = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const totalPages = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
  const displayedItems = activityLogData.slice(0, ITEMS_PER_PAGE);

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
          <span className="text-sm text-muted-foreground">{TOTAL_ITEMS} items</span>
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
              <TableHead>Client</TableHead>
              <TableHead className="min-w-[200px]">Entity name</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Active person</TableHead>
              <TableHead className="w-24">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedItems.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                <TableCell className="whitespace-nowrap">{item.date}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.subtype || "-"}</TableCell>
                <TableCell className="text-[hsl(180,70%,45%)] font-medium cursor-pointer hover:underline">
                  {item.client}
                </TableCell>
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
