import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, ChevronRight } from "lucide-react";

interface NudgeCardProps {
  title: string;
  icon: ReactNode;
  reasoning: string;
  actionLabel: string;
  onAction: () => void;
  children: ReactNode;
  urgencyColor?: string;
  badge?: string;
}

export const NudgeCard = ({
  title,
  icon,
  reasoning,
  actionLabel,
  onAction,
  children,
  urgencyColor = "hsl(210,70%,40%)",
  badge,
}: NudgeCardProps) => {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: urgencyColor }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${urgencyColor}20` }}
            >
              {icon}
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              {badge && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{
                    backgroundColor: `${urgencyColor}20`,
                    color: urgencyColor,
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-sm">
                <strong>Why this action?</strong>
                <br />
                {reasoning}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {children}
        <Button
          className="w-full mt-4 group"
          size="sm"
          onClick={onAction}
          style={{
            backgroundColor: urgencyColor,
            color: "white",
          }}
        >
          {actionLabel}
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};
