import { Phone, Mail, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface ClientOpportunity {
  clientId: string;
  clientName: string;
  currentValue: number;
  opportunityType: "upsell" | "cross-sell" | "migration" | "platform";
  potentialRevenue: number;
  confidence: number;
  reasoning: string;
  suggestedAction: string;
}

interface OpportunityCardProps {
  opportunity: ClientOpportunity;
  index: number;
  formatCurrency: (value: number) => string;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (clientId: string) => void;
}

const typeConfig = {
  upsell: {
    label: "Upsell",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  "cross-sell": {
    label: "Cross-Sell",
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  migration: {
    label: "Migration",
    bg: "bg-violet-500/20",
    text: "text-violet-400",
    border: "border-violet-500/30",
  },
  platform: {
    label: "Platform",
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
  },
};

const OpportunityCard = ({
  opportunity,
  index,
  formatCurrency,
  selectable = false,
  isSelected = false,
  onToggleSelect,
}: OpportunityCardProps) => {
  const config = typeConfig[opportunity.opportunityType];
  const initials = opportunity.clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleCardClick = () => {
    if (selectable && onToggleSelect) {
      onToggleSelect(opportunity.clientId);
    }
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelect) {
      onToggleSelect(opportunity.clientId);
    }
  };

  return (
    <div
      className={cn(
        "glass-panel rounded-xl p-4 border transition-all duration-500",
        config.border,
        "hover:scale-[1.02] hover:shadow-lg",
        selectable && "cursor-pointer",
        isSelected && "ring-2 ring-emerald-400/60 bg-emerald-500/5"
      )}
      style={{
        animation: `slideUp 0.4s ease-out ${index * 0.1}s both`,
      }}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        {/* Selection checkbox */}
        {selectable && (
          <div className="flex-shrink-0 pt-1" onClick={handleCheckboxChange}>
            <Checkbox
              checked={isSelected}
              className={cn(
                "border-white/30",
                isSelected && "bg-emerald-500 border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              )}
            />
          </div>
        )}

        {/* Avatar */}
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-semibold flex-shrink-0", config.bg, config.text)}>
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-medium truncate">{opportunity.clientName}</h4>
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", config.bg, config.text)}>
              {config.label}
            </span>
          </div>

          <div className="text-white/60 text-sm mb-2">
            Current: {formatCurrency(opportunity.currentValue)}
          </div>

          <p className="text-white/70 text-sm mb-3 line-clamp-2">{opportunity.reasoning}</p>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/50">Potential Revenue</div>
              <div className={cn("text-lg font-bold", config.text)}>
                +{formatCurrency(opportunity.potentialRevenue)}
              </div>
            </div>

            {/* Confidence indicator */}
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", config.bg.replace("/20", ""))}
                  style={{ width: `${opportunity.confidence}%` }}
                />
              </div>
              <span className="text-xs text-white/50">{opportunity.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons - only show when not in selection mode */}
      {!selectable && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
          <Button size="sm" variant="ghost" className="flex-1 text-white/70 hover:text-white hover:bg-white/10">
            <Phone className="w-4 h-4 mr-1" />
            Call
          </Button>
          <Button size="sm" variant="ghost" className="flex-1 text-white/70 hover:text-white hover:bg-white/10">
            <Mail className="w-4 h-4 mr-1" />
            Email
          </Button>
          <Button size="sm" variant="ghost" className="flex-1 text-white/70 hover:text-white hover:bg-white/10">
            <Calendar className="w-4 h-4 mr-1" />
            Meet
          </Button>
        </div>
      )}
    </div>
  );
};

export default OpportunityCard;
