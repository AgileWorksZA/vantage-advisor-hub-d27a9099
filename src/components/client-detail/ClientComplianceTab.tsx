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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, FileText } from "lucide-react";

const faisControlData = [
  { id: 1, name: "FAIS Disclosure 2026", products: ["Investment", "Insurance"], step: "Active", date: "28 Jan 2026" },
  { id: 2, name: "Consent Form - Investment", products: ["Investment"], step: "Consent", date: "25 Jan 2026" },
  { id: 3, name: "FAIS Disclosure 2025", products: ["Investment", "Insurance"], step: "Complete", date: "20 Jan 2025" },
  { id: 4, name: "Disclosure - Risk Products", products: ["Insurance"], step: "Disclosure", date: "15 Dec 2025" },
  { id: 5, name: "Annual FAIS Update", products: ["Investment"], step: "Active", date: "10 Dec 2025" },
];

const workflowsData = [
  { service: "Compliance", name: "FAIS Review", adviser: "Jordaan, Danile", endDate: "28 Jan 2026", status: "Complete" },
  { service: "Compliance", name: "Consent Collection", adviser: "Jordaan, Danile", endDate: "25 Jan 2026", status: "Complete" },
  { service: "General", name: "Annual Review", adviser: "Van Zyl, Christo", endDate: "20 Jan 2026", status: "Inactive" },
];

const ClientComplianceTab = () => {
  const [faisPage, setFaisPage] = useState(1);
  const [workflowPage, setWorkflowPage] = useState(1);
  const [faisFilter, setFaisFilter] = useState("all");

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="outline">Blendit</Button>
        <Button variant="outline">PlanIT</Button>
        <Button variant="outline">InsureIT</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAIS Control Panel */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">FAIS Control</CardTitle>
              <Select value={faisFilter} onValueChange={setFaisFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Show all iComplies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Show all iComplies</SelectItem>
                  <SelectItem value="active">Active only</SelectItem>
                  <SelectItem value="complete">Complete only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">#</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Products</TableHead>
                  <TableHead className="text-xs">Step</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faisControlData.map((item) => (
                  <TableRow 
                    key={item.id}
                    className={item.step === "Active" ? "bg-green-50 dark:bg-green-950/20" : ""}
                  >
                    <TableCell className="text-sm">{item.id}</TableCell>
                    <TableCell className="text-sm">{item.name}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        {item.products.map((product, i) => (
                          <FileText key={i} className="w-4 h-4 text-muted-foreground" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.step === "Active" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                        item.step === "Consent" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                        item.step === "Disclosure" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
                        "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}>
                        {item.step}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{item.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-muted-foreground">190 items, page {faisPage} of 10</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={faisPage === 1}>
                  <ChevronFirst className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={faisPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setFaisPage(p => Math.min(10, p + 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ChevronLast className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflows Panel */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Workflows</CardTitle>
              <span className="text-sm text-muted-foreground">Complete, Inactive - 82 items</span>
            </div>
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
              <span className="text-sm text-muted-foreground">82 items, page {workflowPage} of 5</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                  <ChevronFirst className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ChevronLast className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientComplianceTab;
