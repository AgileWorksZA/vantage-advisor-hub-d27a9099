import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  AlertCircle,
  FileText,
  TrendingUp,
  Shield,
  Calendar,
  DollarSign,
  Briefcase,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface IdentifiedOpportunity {
  type: string;
  description: string;
  suggestedTitle: string;
  suggestedPriority: string;
}

interface AIInsightsPanelProps {
  opportunities: IdentifiedOpportunity[];
  onCreateTask?: (opportunity: IdentifiedOpportunity) => void;
  isLoading?: boolean;
}

const typeIcons: Record<string, typeof Sparkles> = {
  "Follow-up": Calendar,
  Compliance: Shield,
  "Document Request": FileText,
  "Portfolio Review": TrendingUp,
  "Annual Review": ClipboardCheck,
  Investment: DollarSign,
  "Tax Planning": Briefcase,
  Claims: AlertCircle,
};

const priorityColors: Record<string, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  Urgent: "bg-destructive/10 text-destructive",
};

export const AIInsightsPanel = ({
  opportunities,
  onCreateTask,
  isLoading = false,
}: AIInsightsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (opportunities.length === 0 && !isLoading) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border rounded-lg bg-background">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              {isOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI-Identified Opportunities ({opportunities.length})
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="p-3 space-y-2">
            {opportunities.map((opp, idx) => {
              const Icon = typeIcons[opp.type] || Sparkles;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border border-border"
                >
                  <Icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {opp.suggestedTitle}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 ${priorityColors[opp.suggestedPriority] || ""}`}
                      >
                        {opp.suggestedPriority}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {opp.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {opp.description}
                    </p>
                  </div>
                  {onCreateTask && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1 text-xs h-7"
                      onClick={() => onCreateTask(opp)}
                    >
                      <Plus className="w-3 h-3" />
                      Create Task
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
