import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { useClientOpportunityCategories } from "@/hooks/useClientOpportunityCategories";
import { useRegion } from "@/contexts/RegionContext";
import type { Priority } from "@/lib/opportunity-priority";
import GlobalAIChat from "@/components/ai-assistant/GlobalAIChat";

const priorityConfig: Record<Priority, { label: string; icon: React.ReactNode; color: string }> = {
  urgent: { label: "Urgent", icon: <AlertTriangle className="h-5 w-5 text-red-500" />, color: "bg-red-500" },
  important: { label: "Important", icon: <Clock className="h-5 w-5 text-amber-500" />, color: "bg-amber-500" },
  routine: { label: "Routine", icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, color: "bg-emerald-500" },
};

const OpportunityAction = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { categories, loading } = useClientOpportunityCategories();
  const { filteredRegionalData } = useRegion();
  const currencySymbol = filteredRegionalData?.currencySymbol || "R";

  const priority = (category as Priority) || "urgent";
  const config = priorityConfig[priority] || priorityConfig.urgent;
  const clients = categories[priority] || [];

  const formatValue = (value: number) => {
    if (value === 0) return "—";
    return `${currencySymbol} ${Math.round(value).toLocaleString()}`;
  };

  const totalValue = clients.reduce((sum, c) => sum + c.totalValue, 0);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader userName="Advisor" onSignOut={() => navigate("/auth")} />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {config.icon}
          <h1 className="text-xl font-semibold">{config.label} Opportunities</h1>
          <Badge variant="outline" className="ml-2">{clients.length} clients</Badge>
          <span className="ml-auto text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatValue(totalValue)}</span>
          </span>
        </div>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Clients with {config.label.toLowerCase()} opportunities</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
            ) : clients.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No clients in this category</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Opportunities</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map(client => (
                    <TableRow
                      key={client.clientId}
                      className="cursor-pointer"
                      onClick={() => navigate(`/clients/${client.clientId}`)}
                    >
                      <TableCell>
                        <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
                      </TableCell>
                      <TableCell className="font-medium">{client.clientName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.opportunities.map(opp => (
                            <Badge key={opp.id} variant="secondary" className="text-[10px]">
                              {opp.type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatValue(client.totalValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <GlobalAIChat currentPage="opportunities" />
    </div>
  );
};

export default OpportunityAction;
