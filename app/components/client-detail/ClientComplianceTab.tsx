import { useState } from "react";
import { useParams } from "react-router";
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
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, FileText, Loader2 } from "lucide-react";
import { useClientWorkflows } from "@/hooks/useClientWorkflows";

const ClientComplianceTab = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [faisPage, setFaisPage] = useState(1);
  const [workflowPage, setWorkflowPage] = useState(1);
  const [faisFilter, setFaisFilter] = useState("all");

  const { workflows, faisControls, workflowCount, faisCount, loading } = useClientWorkflows(clientId || "");

  // Filter to only compliance-related workflows
  const complianceWorkflows = workflows.filter(w => w.service === "Compliance" || w.name.toLowerCase().includes("fais"));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const faisPages = Math.ceil(faisCount / 20) || 1;
  const workflowPages = Math.ceil(complianceWorkflows.length / 20) || 1;

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
                {faisControls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No FAIS controls found.
                    </TableCell>
                  </TableRow>
                ) : (
                  faisControls.map((item) => (
                    <TableRow 
                      key={item.id}
                      className={item.step === "Active" ? "bg-green-50 dark:bg-green-950/20" : ""}
                    >
                      <TableCell className="text-sm">{item.id}</TableCell>
                      <TableCell className="text-sm">{item.name}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          {item.products.map((_, i) => (
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
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-muted-foreground">{faisCount} items, page {faisPage} of {faisPages}</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={faisPage === 1}>
                  <ChevronFirst className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={faisPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setFaisPage(p => Math.min(faisPages, p + 1))}>
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
              <span className="text-sm text-muted-foreground">Complete, Inactive - {complianceWorkflows.length} items</span>
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
                {complianceWorkflows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No compliance workflows found.
                    </TableCell>
                  </TableRow>
                ) : (
                  complianceWorkflows.map((workflow) => (
                    <TableRow 
                      key={workflow.id}
                      className={workflow.status === "Complete" ? "bg-green-50 dark:bg-green-950/20" : ""}
                    >
                      <TableCell className="text-sm">{workflow.service}</TableCell>
                      <TableCell className="text-sm">{workflow.name}</TableCell>
                      <TableCell className="text-sm">{workflow.adviser}</TableCell>
                      <TableCell className="text-sm">{workflow.endDate}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-muted-foreground">{complianceWorkflows.length} items, page {workflowPage} of {workflowPages}</span>
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
