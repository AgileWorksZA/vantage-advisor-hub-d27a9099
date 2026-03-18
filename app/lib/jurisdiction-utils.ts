/**
 * Maps a country/jurisdiction to the appropriate national ID type label.
 */
export const getIdTypeForJurisdiction = (countryOrJurisdiction: string | null | undefined): string => {
  if (!countryOrJurisdiction) return "National ID";

  const normalized = countryOrJurisdiction.toLowerCase().trim();

  if (normalized === "south africa" || normalized === "za") return "SA ID";
  if (normalized === "australia" || normalized === "au") return "National ID";
  if (normalized === "canada" || normalized === "ca") return "SIN";
  if (normalized === "united kingdom" || normalized === "gb") return "NI Number";
  if (normalized === "united states" || normalized === "us") return "SSN";

  return "National ID";
};
