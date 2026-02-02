import { useState } from "react";
import { useParams } from "react-router-dom";
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
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Loader2 } from "lucide-react";
import { useClientWorkflows } from "@/hooks/useClientWorkflows";

const ClientWorkflowsTab = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [workflowPage, setWorkflowPage] = useState(1);
  const [advicePage, setAdvicePage] = useState(1);
  
  const { workflows, adviceWorkflows, workflowCount, adviceCount, loading } = useClientWorkflows(clientId || "");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const workflowPages = Math.ceil(workflowCount / 20) || 1;
  const advicePages = Math.ceil(adviceCount / 20) || 1;

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
              {workflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No workflows found.
                  </TableCell>
                </TableRow>
              ) : (
                workflows.map((workflow) => (
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
            <span className="text-sm text-muted-foreground">{workflowCount} items, page {workflowPage} of {workflowPages}</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={workflowPage === 1}>
                <ChevronFirst className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={workflowPage === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWorkflowPage(p => Math.min(workflowPages, p + 1))}>
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
              {adviceWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No advice workflows found.
                  </TableCell>
                </TableRow>
              ) : (
                adviceWorkflows.map((workflow) => (
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
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-muted-foreground">{adviceCount} items, page {advicePage} of {advicePages}</span>
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
