import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Extracts date of birth from a South African ID number.
 * SA ID format: YYMMDD followed by other digits.
 * Example: 7905245013088 = 24 May 1979
 */
export function extractDateOfBirthFromId(idNumber: string): string | null {
  if (!idNumber || idNumber.length < 6) return null;
  
  const yearPart = idNumber.substring(0, 2);
  const monthPart = idNumber.substring(2, 4);
  const dayPart = idNumber.substring(4, 6);
  
  const year = parseInt(yearPart, 10);
  const month = parseInt(monthPart, 10);
  const day = parseInt(dayPart, 10);
  
  // Validate month and day
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  
  // Determine century: if year <= current year's last 2 digits, assume 2000s
  const currentYear = new Date().getFullYear();
  const currentYearLast2 = currentYear % 100;
  const fullYear = year <= currentYearLast2 ? 2000 + year : 1900 + year;
  
  // Return in YYYY-MM-DD format for input[type="date"]
  return `${fullYear}-${monthPart}-${dayPart}`;
}
