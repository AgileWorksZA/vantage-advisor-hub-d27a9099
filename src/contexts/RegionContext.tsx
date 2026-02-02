import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { getRegionalData, getRegionalOpportunities, RegionalData } from "@/data/regionalData";
import { ClientOpportunity } from "@/components/ai-assistant/OpportunityCard";

interface RegionContextType {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  regionalData: RegionalData;
  currencySymbol: string;
  currencyCode: string;
  formatCurrency: (value: number) => string;
  opportunities: ClientOpportunity[];
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

const STORAGE_KEY = "vantage-selected-region";

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

  const setSelectedRegion = (region: string) => {
    setSelectedRegionState(region);
    localStorage.setItem(STORAGE_KEY, region);
  };

  const regionalData = useMemo(() => getRegionalData(selectedRegion), [selectedRegion]);
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
