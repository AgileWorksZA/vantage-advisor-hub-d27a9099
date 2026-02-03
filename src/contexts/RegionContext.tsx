import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { getRegionalData, getFilteredRegionalData, getRegionalOpportunities, RegionalData } from "@/data/regionalData";
import { ClientOpportunity } from "@/components/ai-assistant/OpportunityCard";

interface RegionContextType {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  regionalData: RegionalData;
  filteredRegionalData: RegionalData;
  selectedAdvisors: string[];
  setSelectedAdvisors: (advisors: string[]) => void;
  currencySymbol: string;
  currencyCode: string;
  formatCurrency: (value: number) => string;
  opportunities: ClientOpportunity[];
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

const STORAGE_KEY = "vantage-selected-region";
const ADVISORS_STORAGE_KEY = "vantage-selected-advisors";

const currencyMap: Record<string, { code: string; symbol: string; locale: string }> = {
  ZA: { code: "ZAR", symbol: "R", locale: "en-ZA" },
  AU: { code: "AUD", symbol: "A$", locale: "en-AU" },
  CA: { code: "CAD", symbol: "C$", locale: "en-CA" },
  GB: { code: "GBP", symbol: "£", locale: "en-GB" },
  US: { code: "USD", symbol: "$", locale: "en-US" },
};

export function RegionProvider({ children }: { children: ReactNode }) {
  const [selectedRegion, setSelectedRegionState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) || "ZA";
    }
    return "ZA";
  });

  // Get the base regional data (unfiltered) for the selected region
  const regionalData = useMemo(() => getRegionalData(selectedRegion), [selectedRegion]);

  // Initialize selected advisors from localStorage or default to all advisors
  const [selectedAdvisors, setSelectedAdvisorsState] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(ADVISORS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Validate that stored advisors exist in current region
          const currentAdvisors = getRegionalData(selectedRegion).advisors.map(a => a.initials);
          const validAdvisors = parsed.filter((a: string) => currentAdvisors.includes(a));
          if (validAdvisors.length > 0) {
            return validAdvisors;
          }
        } catch {
          // Invalid stored data, use default
        }
      }
    }
    // Default to all advisors
    return getRegionalData(selectedRegion).advisors.map(a => a.initials);
  });

  const setSelectedRegion = (region: string) => {
    setSelectedRegionState(region);
    localStorage.setItem(STORAGE_KEY, region);
    // Reset advisors to all when region changes
    const newAdvisors = getRegionalData(region).advisors.map(a => a.initials);
    setSelectedAdvisorsState(newAdvisors);
    localStorage.setItem(ADVISORS_STORAGE_KEY, JSON.stringify(newAdvisors));
  };

  const setSelectedAdvisors = (advisors: string[]) => {
    setSelectedAdvisorsState(advisors);
    localStorage.setItem(ADVISORS_STORAGE_KEY, JSON.stringify(advisors));
  };

  // Get filtered regional data based on selected advisors
  const filteredRegionalData = useMemo(
    () => getFilteredRegionalData(selectedRegion, selectedAdvisors),
    [selectedRegion, selectedAdvisors]
  );

  const opportunities = useMemo(() => getRegionalOpportunities(selectedRegion), [selectedRegion]);

  const currency = currencyMap[selectedRegion] || currencyMap.ZA;

  const formatCurrency = useMemo(() => {
    return (value: number) => {
      return new Intl.NumberFormat(currency.locale, {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };
  }, [currency.locale, currency.code]);

  const value: RegionContextType = {
    selectedRegion,
    setSelectedRegion,
    regionalData,
    filteredRegionalData,
    selectedAdvisors,
    setSelectedAdvisors,
    currencySymbol: currency.symbol,
    currencyCode: currency.code,
    formatCurrency,
    opportunities,
  };

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
}
