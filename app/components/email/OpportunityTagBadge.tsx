import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getOpportunityConfig } from "@/lib/opportunity-detection";
import { OpportunityEditDialog } from "./OpportunityEditDialog";

interface OpportunityTagBadgeProps {
  type: string;
  sourceText?: string;
  clientName?: string;
}

export const OpportunityTagBadge = ({ type, sourceText, clientName }: OpportunityTagBadgeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const config = getOpportunityConfig(type);

  return (
    <>
      <Badge
        variant="outline"
        className={`${config.color} text-[9px] px-1.5 py-0 cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={(e) => {
          e.stopPropagation();
          setDialogOpen(true);
        }}
      >
        {config.label}
      </Badge>
      <OpportunityEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        opportunityType={type}
        sourceText={sourceText}
        clientName={clientName}
      />
    </>
  );
};
