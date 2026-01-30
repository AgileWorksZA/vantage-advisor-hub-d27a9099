import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from "lucide-react";

const workflowsData = [
  { service: "General", name: "FICA - Individual", adviser: "Jordaan, Danile", endDate: "15 Jan 2026", status: "Complete" },
  { service: "General", name: "FICA - Address change", adviser: "Jordaan, Danile", endDate: "20 Feb 2026", status: "Complete" },
  { service: "Fiduciary Services", name: "Service Level Agreement documentation", adviser: "Van Zyl, Christo", endDate: "01 Mar 2026", status: "Active" },
  { service: "General", name: "Documents", adviser: "Jordaan, Danile", endDate: "10 Mar 2026", status: "Complete" },
  { service: "General", name: "Advice Cycle", adviser: "Jordaan, Danile", endDate: "15 Mar 2026", status: "Active" },
  { service: "General", name: "Archived Documents", adviser: "Jordaan, Danile", endDate: "20 Mar 2026", status: "Complete" },
];

const adviceWorkflowsData = [
  { id: 1, name: "Annual Review 2026", currentStep: "Implementation", status: "Open", adviser: "Jordaan, Danile", date: "28 Jan 2026" },
  { id: 2, name: "Risk Assessment", currentStep: "Design a plan", status: "Open", adviser: "Jordaan, Danile", date: "25 Jan 2026" },
  { id: 3, name: "Investment Strategy", currentStep: "Complete", status: "Open", adviser: "Jordaan, Danile", date: "20 Jan 2026" },
  { id: 4, name: "Estate Planning", currentStep: "Proposal/Report", status: "Open", adviser: "Jordaan, Danile", date: "15 Jan 2026" },
  { id: 5, name: "Insurance Review", currentStep: "Basic information", status: "Open", adviser: "Jordaan, Danile", date: "10 Jan 2026" },
];

const ClientWorkflowsTab = () => {
  const [workflowPage, setWorkflowPage] = useState(1);
  const [advicePage, setAdvicePage] = useState(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Workflows Panel */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Workflows</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Service</TableHead>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Adviser</TableHead>
                <TableHead className="text-xs">End date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflowsData.map((workflow, index) => (
                <TableRow 
                  key={index} 
                  className={workflow.status === "Complete" ? "bg-green-50 dark:bg-green-950/20" : ""}
                >
                  <TableCell className="text-sm">{workflow.service}</TableCell>
                  <TableCell className="text-sm">{workflow.name}</TableCell>
                  <TableCell className="text-sm">{workflow.adviser}</TableCell>
                  <TableCell className="text-sm">{workflow.endDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">89 items, page {workflowPage} of 5</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={workflowPage === 1}>
                <ChevronFirst className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={workflowPage === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWorkflowPage(p => Math.min(5, p + 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLast className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advice Workflows Panel */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Advice workflows</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">#</TableHead>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Current step</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Adviser</TableHead>
                <TableHead className="text-xs">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adviceWorkflowsData.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="text-sm">{workflow.id}</TableCell>
                  <TableCell className="text-sm">{workflow.name}</TableCell>
                  <TableCell className="text-sm">{workflow.currentStep}</TableCell>
                  <TableCell className="text-sm">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                      {workflow.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{workflow.adviser}</TableCell>
                  <TableCell className="text-sm">{workflow.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">15 items, page {advicePage} of 1</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                <ChevronFirst className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                <ChevronLast className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientWorkflowsTab;
