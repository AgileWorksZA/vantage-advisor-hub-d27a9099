import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRegion } from "@/contexts/RegionContext";

export const AdvisorFilter = () => {
  const { regionalData } = useRegion();
  const advisors = regionalData.advisors;

  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>(
    advisors.map((a) => a.initials)
  );
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredAdvisor, setHoveredAdvisor] = useState<string | null>(null);

  // Reset selection when region changes
  useEffect(() => {
    setSelectedAdvisors(advisors.map((a) => a.initials));
  }, [advisors]);

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
  
  // Filter to only show selected advisors in the pill display
  const visibleAdvisors = advisors.filter((a) => 
    selectedAdvisors.includes(a.initials)
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center focus:outline-none">
          <div className="flex -space-x-2">
            {visibleAdvisors.map((advisor, index) => {
              const isHovered = hoveredAdvisor === advisor.initials;
              return (
                <div
                  key={advisor.initials}
                  className={cn(
                    "h-7 rounded-full bg-[hsl(180,25%,25%)] text-white text-xs flex items-center justify-center font-medium border-2 border-background cursor-pointer transition-all duration-300 ease-in-out",
                    isHovered ? "px-3 z-20" : "w-7"
                  )}
                  style={{ zIndex: isHovered ? 20 : visibleAdvisors.length - index }}
                  onMouseEnter={() => setHoveredAdvisor(advisor.initials)}
                  onMouseLeave={() => setHoveredAdvisor(null)}
                >
                  {isHovered ? (
                    <span className="whitespace-nowrap">{advisor.name}</span>
                  ) : (
                    advisor.initials
                  )}
                </div>
              );
            })}
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
