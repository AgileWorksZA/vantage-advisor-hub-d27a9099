import { useState } from "react";
import { Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Advisor {
  initials: string;
  name: string;
}

const advisors: Advisor[] = [
  { initials: "CZ", name: "Christo van Zyl" },
  { initials: "DH", name: "Dale Harding" },
  { initials: "EW", name: "Emile Wegner" },
  { initials: "IN", name: "Ihan Nel" },
  { initials: "RS", name: "Riaan Swart" },
];

export const AdvisorFilter = () => {
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>(
    advisors.map((a) => a.initials)
  );
  const [isOpen, setIsOpen] = useState(false);

  const toggleAdvisor = (initials: string) => {
    setSelectedAdvisors((prev) =>
      prev.includes(initials)
        ? prev.filter((i) => i !== initials)
        : [...prev, initials]
    );
  };

  const selectAll = () => {
    setSelectedAdvisors(advisors.map((a) => a.initials));
  };

  const isAllSelected = selectedAdvisors.length === advisors.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center focus:outline-none">
          <div className="flex -space-x-2">
            {advisors.map((advisor, index) => (
              <Tooltip key={advisor.initials}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full bg-[hsl(180,25%,25%)] text-white text-xs flex items-center justify-center font-medium border-2 border-background cursor-pointer hover:z-10 hover:scale-110 transition-transform",
                      !selectedAdvisors.includes(advisor.initials) && "opacity-50"
                    )}
                    style={{ zIndex: advisors.length - index }}
                  >
                    {advisor.initials}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {advisor.name}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        <div className="p-2 border-b border-border flex items-center justify-between">
          <button
            onClick={selectAll}
            className={cn(
              "flex items-center gap-2 text-sm hover:text-foreground",
              isAllSelected ? "text-primary" : "text-muted-foreground"
            )}
          >
            {isAllSelected && <Check className="w-4 h-4 text-primary" />}
            <span className={cn(!isAllSelected && "ml-6")}>All</span>
          </button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => setIsOpen(false)}
          >
            Confirm
          </Button>
        </div>
        <div className="py-1">
          {advisors.map((advisor) => {
            const isSelected = selectedAdvisors.includes(advisor.initials);
            return (
              <button
                key={advisor.initials}
                onClick={() => toggleAdvisor(advisor.initials)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                {isSelected && <Check className="w-4 h-4 text-primary" />}
                <span className={cn(!isSelected && "ml-6")}>{advisor.name}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
