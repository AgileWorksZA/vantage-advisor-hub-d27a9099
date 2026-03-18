export const REGION_DEFAULT_TIMEZONES: Record<string, string> = {
  ZA: "Africa/Johannesburg",
  AU: "Australia/Sydney",
  CA: "America/Toronto",
  GB: "Europe/London",
  US: "America/New_York",
};

export interface TimezoneOption {
  value: string;
  label: string;
  region: string;
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
  // Americas
  { value: "America/New_York", label: "New York (EST)", region: "Americas" },
  { value: "America/Chicago", label: "Chicago (CST)", region: "Americas" },
  { value: "America/Denver", label: "Denver (MST)", region: "Americas" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)", region: "Americas" },
  { value: "America/Anchorage", label: "Anchorage (AKST)", region: "Americas" },
  { value: "Pacific/Honolulu", label: "Honolulu (HST)", region: "Americas" },
  { value: "America/Toronto", label: "Toronto (EST)", region: "Americas" },
  { value: "America/Vancouver", label: "Vancouver (PST)", region: "Americas" },
  { value: "America/Mexico_City", label: "Mexico City (CST)", region: "Americas" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)", region: "Americas" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (ART)", region: "Americas" },

  // Europe
  { value: "Europe/London", label: "London (GMT)", region: "Europe" },
  { value: "Europe/Paris", label: "Paris (CET)", region: "Europe" },
  { value: "Europe/Berlin", label: "Berlin (CET)", region: "Europe" },
  { value: "Europe/Madrid", label: "Madrid (CET)", region: "Europe" },
  { value: "Europe/Rome", label: "Rome (CET)", region: "Europe" },
  { value: "Europe/Amsterdam", label: "Amsterdam (CET)", region: "Europe" },
  { value: "Europe/Stockholm", label: "Stockholm (CET)", region: "Europe" },
  { value: "Europe/Helsinki", label: "Helsinki (EET)", region: "Europe" },
  { value: "Europe/Athens", label: "Athens (EET)", region: "Europe" },
  { value: "Europe/Moscow", label: "Moscow (MSK)", region: "Europe" },

  // Africa
  { value: "Africa/Johannesburg", label: "Johannesburg (SAST)", region: "Africa" },
  { value: "Africa/Cairo", label: "Cairo (EET)", region: "Africa" },
  { value: "Africa/Lagos", label: "Lagos (WAT)", region: "Africa" },
  { value: "Africa/Nairobi", label: "Nairobi (EAT)", region: "Africa" },

  // Asia & Pacific
  { value: "Asia/Dubai", label: "Dubai (GST)", region: "Asia/Pacific" },
  { value: "Asia/Kolkata", label: "Mumbai / Kolkata (IST)", region: "Asia/Pacific" },
  { value: "Asia/Singapore", label: "Singapore (SGT)", region: "Asia/Pacific" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)", region: "Asia/Pacific" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", region: "Asia/Pacific" },
  { value: "Asia/Seoul", label: "Seoul (KST)", region: "Asia/Pacific" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", region: "Asia/Pacific" },
  { value: "Australia/Sydney", label: "Sydney (AEST)", region: "Asia/Pacific" },
  { value: "Australia/Melbourne", label: "Melbourne (AEST)", region: "Asia/Pacific" },
  { value: "Pacific/Auckland", label: "Auckland (NZST)", region: "Asia/Pacific" },
  { value: "Pacific/Fiji", label: "Fiji (FJT)", region: "Asia/Pacific" },
];

export const TIMEZONE_REGIONS = ["Americas", "Europe", "Africa", "Asia/Pacific"] as const;

export function getTimezoneAbbreviation(ianaTimezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaTimezone,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart?.value || ianaTimezone;
  } catch {
    return ianaTimezone;
  }
}

export function getActiveTimezone(
  userTimezone: string | null | undefined,
  regionCode: string
): string {
  return userTimezone || REGION_DEFAULT_TIMEZONES[regionCode] || "UTC";
}

/**
 * Convert a Date to display in a target timezone.
 * Returns a new Date shifted so that local-time methods (getHours, etc.) 
 * return values as they would appear in the target timezone.
 */
export function convertToTimezone(date: Date, targetTimezone: string): Date {
  // Get the target timezone's offset by formatting the date there
  const targetStr = date.toLocaleString("en-US", { timeZone: targetTimezone });
  const targetDate = new Date(targetStr);
  
  // Get the local timezone representation
  const localStr = date.toLocaleString("en-US", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
  const localDate = new Date(localStr);
  
  // Calculate the difference and shift
  const diff = targetDate.getTime() - localDate.getTime();
  return new Date(date.getTime() + diff);
}
