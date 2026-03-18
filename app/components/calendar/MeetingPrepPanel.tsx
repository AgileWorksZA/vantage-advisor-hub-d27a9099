import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  ClipboardList,
  Calendar,
  DollarSign,
  ShieldCheck,
  FileWarning,
} from "lucide-react";
import { useClientMeetingPrep, PrepTask, PrepOpportunity } from "@/hooks/useClientMeetingPrep";
import { format } from "date-fns";

interface MeetingPrepPanelProps {
  clientId: string;
  onNavigate?: (type: string, id?: string) => void;
}

const priorityColor = (p: string) => {
  switch (p) {
    case "High":
    case "Urgent":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    default:
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  }
};

const formatCurrency = (val: number | null) => {
  if (!val) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
};

const formatDate = (d: string | null) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd MMM yyyy");
  } catch {
    return d;
  }
};

const getActionLabel = (type: string) => {
  const map: Record<string, string> = {
    "AUM Growth": "Drive additional assets",
    "Cross-sell": "Deploy into preferred solutions",
    "TAMP": "Deploy into TAMP",
    "Banking": "Banking solution",
    "Custodian": "Custodian migration",
    "Insurance": "Cross-sell insurance",
    "Consolidation": "Consolidate to preferred platform",
  };
  return map[type] || type;
};

export function MeetingPrepPanel({ clientId, onNavigate }: MeetingPrepPanelProps) {
  const { notes, communications, tasks, documents, opportunities, products, loading } = useClientMeetingPrep(clientId);

  if (loading) {
    return (
      <div className="space-y-3 pt-4 border-t">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Categorize tasks
  const complianceTasks = tasks.filter(t => t.taskType === "Compliance");
  const reviewTasks = tasks.filter(t => ["Annual Review", "Portfolio Review"].includes(t.taskType));
  const otherTasks = tasks.filter(t => !["Compliance", "Annual Review", "Portfolio Review"].includes(t.taskType));

  // Generate fallback opportunities from product data if none exist
  const displayOpportunities: PrepOpportunity[] = opportunities.length > 0
    ? opportunities
    : generateFallbackOpportunities(products);

  return (
    <div className="pt-4 border-t">
      <Accordion type="multiple" defaultValue={["summary", "actions", "opportunities"]} className="space-y-1">
        {/* Section 1: Client Summary */}
        <AccordionItem value="summary" className="border rounded-lg px-3">
          <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Client Summary
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            {/* Recent Notes */}
            {notes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <ClipboardList className="w-3 h-3" /> Recent Notes
                </p>
                <div className="space-y-1.5">
                  {notes.map(n => (
                    <div 
                      key={n.id} 
                      className={`flex items-center justify-between text-xs p-1.5 rounded bg-muted/50 ${onNavigate ? 'cursor-pointer hover:bg-muted transition-colors' : ''}`}
                      onClick={() => onNavigate?.('note', n.id)}
                    >
                      <span className="truncate flex-1 mr-2">{n.subject}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {onNavigate && <Badge className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0">Note</Badge>}
                        <Badge variant="outline" className={`text-[10px] ${priorityColor(n.priority)}`}>{n.priority}</Badge>
                        <span className="text-muted-foreground">{formatDate(n.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Communications */}
            {communications.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Recent Communications
                </p>
                <div className="space-y-1.5">
                  {communications.map(c => (
                    <div 
                      key={c.id} 
                      className={`flex items-center justify-between text-xs p-1.5 rounded bg-muted/50 ${onNavigate ? 'cursor-pointer hover:bg-muted transition-colors' : ''}`}
                      onClick={() => onNavigate?.('communication', c.id)}
                    >
                      <span className="truncate flex-1 mr-2">{c.subject}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {onNavigate && <Badge className="text-[10px] bg-[hsl(180,50%,90%)] text-[hsl(180,70%,30%)] dark:bg-[hsl(180,50%,15%)] dark:text-[hsl(180,70%,60%)] border-0">Comms</Badge>}
                        <Badge variant="outline" className="text-[10px]">{c.channel}</Badge>
                        <span className="text-muted-foreground">{formatDate(c.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {products.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Active Products
                </p>
                <div className="space-y-1.5">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/50">
                      <span className="truncate flex-1 mr-2">{p.productName}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {p.category && <Badge variant="outline" className="text-[10px]">{p.category}</Badge>}
                        <span className="font-medium">{formatCurrency(p.currentValue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {notes.length === 0 && communications.length === 0 && products.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No recent activity found for this client.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Section 2: Outstanding Actions */}
        <AccordionItem value="actions" className="border rounded-lg px-3">
          <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Outstanding Actions
              {(tasks.length + documents.length) > 0 && (
                <Badge variant="destructive" className="text-[10px] ml-1">{tasks.length + documents.length}</Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-3">
            {/* Compliance Tasks */}
            {complianceTasks.length > 0 && (
              <TaskGroup label="Compliance" icon={<ShieldCheck className="w-3 h-3" />} tasks={complianceTasks} />
            )}

            {/* Review Tasks */}
            {reviewTasks.length > 0 && (
              <TaskGroup label="Reviews" icon={<Calendar className="w-3 h-3" />} tasks={reviewTasks} />
            )}

            {/* Documents Outstanding */}
            {documents.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <FileWarning className="w-3 h-3" /> Documents Outstanding
                </p>
                <div className="space-y-1.5">
                  {documents.map(d => (
                    <div 
                      key={d.id} 
                      className={`flex items-center justify-between text-xs p-1.5 rounded bg-muted/50 ${onNavigate ? 'cursor-pointer hover:bg-muted transition-colors' : ''}`}
                      onClick={() => onNavigate?.('document', d.id)}
                    >
                      <span className="truncate flex-1 mr-2">{d.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {onNavigate && <Badge className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-0">Doc</Badge>}
                        <Badge variant="outline" className={`text-[10px] ${d.status === "Expired" ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"}`}>
                          {d.status}
                        </Badge>
                        {d.expiryDate && <span className="text-muted-foreground">{formatDate(d.expiryDate)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other open tasks */}
            {otherTasks.length > 0 && (
              <TaskGroup label="Other Open Tasks" icon={<ClipboardList className="w-3 h-3" />} tasks={otherTasks} />
            )}

            {tasks.length === 0 && documents.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No outstanding actions for this client.</p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Section 3: Revenue Opportunities */}
        <AccordionItem value="opportunities" className="border rounded-lg px-3">
          <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Revenue Opportunities
              {displayOpportunities.length > 0 && (
                <Badge className="text-[10px] ml-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0">{displayOpportunities.length}</Badge>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            {displayOpportunities.length > 0 ? (
              <div className="space-y-2">
                {displayOpportunities.map(o => (
                  <div key={o.id} className="p-2 rounded-lg border bg-background space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{o.opportunityType}</span>
                      <Badge variant="outline" className="text-[10px]">{o.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Opportunity Size</span>
                      <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(o.potentialRevenue)}</span>
                    </div>
                    {o.confidence != null && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Confidence</span>
                        <span>{o.confidence}%</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Action Required</span>
                      <span className="font-medium text-primary">{o.suggestedAction || getActionLabel(o.opportunityType)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No revenue opportunities identified.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function TaskGroup({ label, icon, tasks }: { label: string; icon: React.ReactNode; tasks: PrepTask[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
        {icon} {label}
      </p>
      <div className="space-y-1.5">
        {tasks.map(t => (
          <div key={t.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/50">
            <span className="truncate flex-1 mr-2">{t.title}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="outline" className={`text-[10px] ${priorityColor(t.priority)}`}>{t.priority}</Badge>
              {t.isOverdue && <Badge variant="destructive" className="text-[10px]">Overdue</Badge>}
              <span className="text-muted-foreground">{t.dueDate ? formatDate(t.dueDate) : "No date"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateFallbackOpportunities(products: { id: string; productName: string; category: string | null; currentValue: number | null }[]): PrepOpportunity[] {
  const fallbacks: PrepOpportunity[] = [];
  const categories = products.map(p => p.category).filter(Boolean);
  const totalValue = products.reduce((sum, p) => sum + (p.currentValue || 0), 0);

  const hasInvestments = categories.some(c => c?.toLowerCase().includes("investment") || c?.toLowerCase().includes("unit trust"));
  const hasInsurance = categories.some(c => c?.toLowerCase().includes("insurance") || c?.toLowerCase().includes("life") || c?.toLowerCase().includes("risk"));

  if (hasInvestments && !hasInsurance) {
    fallbacks.push({
      id: "fb-insurance",
      clientName: "",
      opportunityType: "Cross-sell",
      potentialRevenue: Math.round(totalValue * 0.01),
      confidence: 60,
      status: "New",
      suggestedAction: "Cross-sell risk/insurance products",
      reasoning: "Client has investments but no insurance cover",
    });
  }

  if (products.length > 0) {
    fallbacks.push({
      id: "fb-consolidation",
      clientName: "",
      opportunityType: "Consolidation",
      potentialRevenue: Math.round(totalValue * 0.005),
      confidence: 50,
      status: "New",
      suggestedAction: "Consolidate to preferred platform (TAMP/Custodian)",
      reasoning: "Opportunity to consolidate assets onto preferred platform",
    });
  }

  if (totalValue > 0) {
    fallbacks.push({
      id: "fb-aum",
      clientName: "",
      opportunityType: "AUM Growth",
      potentialRevenue: Math.round(totalValue * 0.1),
      confidence: 40,
      status: "New",
      suggestedAction: "Drive additional contributions/assets",
      reasoning: "Potential to grow assets under management",
    });
  }

  return fallbacks;
}
