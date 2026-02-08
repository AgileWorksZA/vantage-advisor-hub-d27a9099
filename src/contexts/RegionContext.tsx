import { createContext, useContext, useState, useMemo, ReactNode } from "react";
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
const ADVISORS_MAP_STORAGE_KEY = "vantage-advisor-selections";

const currencyMap: Record<string, { code: string; symbol: string; locale: string }> = {
  ZA: { code: "ZAR", symbol: "R", locale: "en-ZA" },
  AU: { code: "AUD", symbol: "A$", locale: "en-AU" },
  CA: { code: "CAD", symbol: "C$", locale: "en-CA" },
  GB: { code: "GBP", symbol: "£", locale: "en-GB" },
  US: { code: "USD", symbol: "$", locale: "en-US" },
};

function loadAdvisorMap(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(ADVISORS_MAP_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return {};
}

function saveAdvisorMap(map: Record<string, string[]>) {
  localStorage.setItem(ADVISORS_MAP_STORAGE_KEY, JSON.stringify(map));
}

function getAdvisorsForRegion(region: string, map: Record<string, string[]>): string[] {
  const regionData = getRegionalData(region);
  const allInitials = regionData.advisors.map((a) => a.initials);

  if (map[region]) {
    // Validate stored advisors exist in this region
    const valid = map[region].filter((i) => allInitials.includes(i));
    if (valid.length > 0) return valid;
  }

  // Default to all advisors
  return allInitials;
}

export function RegionProvider({ children }: { children: ReactNode }) {
  const [selectedRegion, setSelectedRegionState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) || "ZA";
    }
    return "ZA";
  });

  // Load the full advisor map once on init
  const [advisorMap, setAdvisorMapState] = useState<Record<string, string[]>>(() => loadAdvisorMap());

  // Derive selected advisors from the map for the current region
  const [selectedAdvisors, setSelectedAdvisorsState] = useState<string[]>(() =>
    getAdvisorsForRegion(selectedRegion, loadAdvisorMap())
  );

  // Get the base regional data (unfiltered) for the selected region
  const regionalData = useMemo(() => getRegionalData(selectedRegion), [selectedRegion]);

  const setSelectedRegion = (newRegion: string) => {
    // Save current advisor selection for the old region
    const updatedMap = { ...advisorMap, [selectedRegion]: selectedAdvisors };
    setAdvisorMapState(updatedMap);
    saveAdvisorMap(updatedMap);

    // Switch region
    setSelectedRegionState(newRegion);
    localStorage.setItem(STORAGE_KEY, newRegion);

    // Restore advisors for the new region
    const restoredAdvisors = getAdvisorsForRegion(newRegion, updatedMap);
    setSelectedAdvisorsState(restoredAdvisors);
  };

  const setSelectedAdvisors = (advisors: string[]) => {
    setSelectedAdvisorsState(advisors);
    // Persist immediately for the current region
    const updatedMap = { ...advisorMap, [selectedRegion]: advisors };
    setAdvisorMapState(updatedMap);
    saveAdvisorMap(updatedMap);
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
