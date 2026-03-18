import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface FrequencyTagProps {
  frequency?: string;
  value?: string;
}

const frequencyLabels: Record<string, string> = {
  "1M": "Monthly",
  "3M": "Quarterly",
  "6M": "Semi-annually",
  "1Y": "Annually",
};

const isZeroValue = (value?: string): boolean => {
  if (!value) return false;
  const numeric = value.replace(/[^0-9.]/g, "");
  if (!numeric) return true;
  return parseFloat(numeric) === 0;
};

const FrequencyTag = ({ frequency, value }: FrequencyTagProps) => {
  if (!frequency) return null;
  if (isZeroValue(value)) return null;

  const label = frequencyLabels[frequency] || frequency;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium text-muted-foreground border-muted-foreground/30 cursor-help">
            {frequency}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FrequencyTag;
