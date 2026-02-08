export const REGION_DEFAULT_TIMEZONES: Record<string, string> = {
  ZA: "Africa/Johannesburg",
  AU: "Australia/Sydney",
  CA: "America/Toronto",
  GB: "Europe/London",
  US: "America/New_York",
};

export const COMMON_TIMEZONES = [
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (SAST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
  { value: "America/Toronto", label: "America/Toronto (EST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "America/New_York", label: "America/New York (EST)" },
  { value: "America/Los_Angeles", label: "America/Los Angeles (PST)" },
  { value: "America/Chicago", label: "America/Chicago (CST)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET)" },
];

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
