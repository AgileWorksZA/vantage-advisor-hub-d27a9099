import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Region {
  code: string;
  name: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
}

export const regions: Region[] = [
  { code: "ZA", name: "South Africa", flag: "🇿🇦", currencyCode: "ZAR", currencySymbol: "R" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currencyCode: "AUD", currencySymbol: "A$" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currencyCode: "CAD", currencySymbol: "C$" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currencyCode: "GBP", currencySymbol: "£" },
  { code: "US", name: "United States", flag: "🇺🇸", currencyCode: "USD", currencySymbol: "$" },
];

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (regionCode: string) => void;
}

export function RegionSelector({ selectedRegion, onRegionChange }: RegionSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const currentRegion = regions.find(r => r.code === selectedRegion) || regions[0];

  const handleSelect = (regionCode: string) => {
    onRegionChange(regionCode);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-xl hover:bg-muted/50 transition-colors"
          title={currentRegion.name}
        >
          {currentRegion.flag}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 bg-popover border border-border shadow-lg" align="end">
        <div className="space-y-1">
          {regions.map((region) => (
            <button
              key={region.code}
              onClick={() => handleSelect(region.code)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                "hover:bg-muted/50",
                selectedRegion === region.code && "bg-muted"
              )}
            >
              <span className="text-lg">{region.flag}</span>
              <span className="flex-1 text-left">{region.name}</span>
              {selectedRegion === region.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
