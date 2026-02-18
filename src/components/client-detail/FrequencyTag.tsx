import { Badge } from "@/components/ui/badge";

interface FrequencyTagProps {
  frequency?: string;
}

const FrequencyTag = ({ frequency }: FrequencyTagProps) => {
  if (!frequency) return null;
  return (
    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium text-muted-foreground border-muted-foreground/30">
      {frequency}
    </Badge>
  );
};

export default FrequencyTag;
