import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useRegion } from "@/contexts/RegionContext";
import { useNavigationWarning } from "@/hooks/useNavigationWarning";
import { NavigationWarningDialog } from "@/components/layout/NavigationWarningDialog";

export interface Region {
  code: string;
  name: string;
  flagCode: string;
  currencyCode: string;
  currencySymbol: string;
}

export const regions: Region[] = [
  { code: "ZA", name: "South Africa", flagCode: "za", currencyCode: "ZAR", currencySymbol: "R" },
  { code: "AU", name: "Australia", flagCode: "au", currencyCode: "AUD", currencySymbol: "A$" },
  { code: "CA", name: "Canada", flagCode: "ca", currencyCode: "CAD", currencySymbol: "C$" },
  { code: "GB", name: "United Kingdom", flagCode: "gb", currencyCode: "GBP", currencySymbol: "£" },
  { code: "US", name: "United States", flagCode: "us", currencyCode: "USD", currencySymbol: "$" },
];

const FlagIcon = ({ code, height = 18 }: { code: string; height?: number }) => {
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      alt={`${code.toUpperCase()} flag`}
      className="object-contain"
      style={{ height, width: 'auto' }}
    />
  );
};

export function RegionSelector() {
  const { selectedRegion, setSelectedRegion, isJurisdictionRestricted } = useRegion();
  const { isLandingPage, parentLandingPage, parentLandingLabel } = useNavigationWarning();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingRegion, setPendingRegion] = useState<string | null>(null);

  const currentRegion = regions.find(r => r.code === selectedRegion) || regions[0];

  // Render static flag for restricted users
  if (isJurisdictionRestricted) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center cursor-default"
            title={currentRegion.name}
          >
            <FlagIcon code={currentRegion.flagCode} height={18} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Your account is restricted to {currentRegion.name}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const handleSelect = (regionCode: string) => {
    if (regionCode === selectedRegion) {
      setOpen(false);
      return;
    }

    setOpen(false);

    if (isLandingPage) {
      setSelectedRegion(regionCode);
    } else {
      setPendingRegion(regionCode);
      setShowWarning(true);
    }
  };

  const handleWarningConfirm = () => {
    if (pendingRegion) {
      setSelectedRegion(pendingRegion);
      navigate(parentLandingPage);
    }
    setPendingRegion(null);
    setShowWarning(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-muted/50 transition-colors flex items-center justify-center"
            title={currentRegion.name}
          >
            <FlagIcon code={currentRegion.flagCode} height={18} />
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
                <FlagIcon code={region.flagCode} height={18} />
                <span className="flex-1 text-left">{region.name}</span>
                {selectedRegion === region.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <NavigationWarningDialog
        open={showWarning}
        onOpenChange={setShowWarning}
        onConfirm={handleWarningConfirm}
        changeType="jurisdiction"
        landingPageLabel={parentLandingLabel}
      />
    </>
  );
}
