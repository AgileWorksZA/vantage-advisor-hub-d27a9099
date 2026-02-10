import { ReactNode, useState, useMemo } from "react";
import { RegionContext, RegionContextType } from "./RegionContext";
import { getRegionalData, getFilteredRegionalData, getRegionalOpportunities } from "@/data/regionalData";
import { useUserJurisdictions } from "@/hooks/useUserJurisdictions";

const MOBILE_REGION_KEY = "vantage-mobile-region";
const MOBILE_ADVISORS_KEY = "vantage-mobile-advisor-selections";

const currencyMap: Record<string, { code: string; symbol: string; locale: string }> = {
  ZA: { code: "ZAR", symbol: "R", locale: "en-ZA" },
  AU: { code: "AUD", symbol: "A$", locale: "en-AU" },
  CA: { code: "CAD", symbol: "C$", locale: "en-CA" },
  GB: { code: "GBP", symbol: "£", locale: "en-GB" },
  US: { code: "USD", symbol: "$", locale: "en-US" },
};

function loadMobileAdvisorMap(): Record<string, string[]> {
  try {
    const stored = localStorage.getItem(MOBILE_ADVISORS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function saveMobileAdvisorMap(map: Record<string, string[]>) {
  localStorage.setItem(MOBILE_ADVISORS_KEY, JSON.stringify(map));
}

function getAdvisorsForRegion(region: string, map: Record<string, string[]>): string[] {
  const regionData = getRegionalData(region);
  const allInitials = regionData.advisors.map((a) => a.initials);
  if (map[region]) {
    const valid = map[region].filter((i) => allInitials.includes(i));
    if (valid.length > 0) return [valid[0]];
  }
  return [allInitials[0]];
}

export function MobileRegionProvider({ children }: { children: ReactNode }) {
  const { allowedJurisdictions, isRestricted } = useUserJurisdictions();

  const [selectedRegion, setSelectedRegionState] = useState<string>(() => {
    return localStorage.getItem(MOBILE_REGION_KEY) 
      || localStorage.getItem("vantage-selected-region") 
      || "ZA";
  });

  const [advisorMap, setAdvisorMapState] = useState<Record<string, string[]>>(() => loadMobileAdvisorMap());

  const [selectedAdvisors, setSelectedAdvisorsState] = useState<string[]>(() =>
    getAdvisorsForRegion(selectedRegion, loadMobileAdvisorMap())
  );

  const regionalData = useMemo(() => getRegionalData(selectedRegion), [selectedRegion]);

  const setSelectedRegion = (newRegion: string) => {
    if (isRestricted) return;
    const updatedMap = { ...advisorMap, [selectedRegion]: selectedAdvisors };
    setAdvisorMapState(updatedMap);
    saveMobileAdvisorMap(updatedMap);
    setSelectedRegionState(newRegion);
    localStorage.setItem(MOBILE_REGION_KEY, newRegion);
    const restoredAdvisors = getAdvisorsForRegion(newRegion, updatedMap);
    setSelectedAdvisorsState(restoredAdvisors);
  };

  const setSelectedAdvisors = (advisors: string[]) => {
    setSelectedAdvisorsState(advisors);
    const updatedMap = { ...advisorMap, [selectedRegion]: advisors };
    setAdvisorMapState(updatedMap);
    saveMobileAdvisorMap(updatedMap);
  };

  const filteredRegionalData = useMemo(
    () => getFilteredRegionalData(selectedRegion, selectedAdvisors),
    [selectedRegion, selectedAdvisors]
  );

  const opportunities = useMemo(() => getRegionalOpportunities(selectedRegion), [selectedRegion]);

  const currency = currencyMap[selectedRegion] || currencyMap.ZA;

  const formatCurrency = useMemo(() => {
    return (value: number) =>
      new Intl.NumberFormat(currency.locale, {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
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
    isJurisdictionRestricted: isRestricted,
    allowedJurisdictions,
  };

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}
