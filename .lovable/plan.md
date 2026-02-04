

# Auto-populate Date of Birth from ID Number

## Overview

This implementation adds automatic date of birth extraction from South African ID numbers for Individual clients. When a user enters an ID number, the date of birth field will be automatically populated based on the first 6 digits of the ID.

## SA ID Number Format

South African ID numbers encode the date of birth in the first 6 digits:
- Positions 1-2: Year (YY)
- Positions 3-4: Month (MM)
- Positions 5-6: Day (DD)

**Example**: `7905245013088` = 24 May 1979

## Century Detection Logic

Since the year is only 2 digits, we need to determine the century:
- If YY >= 00 and YY <= current_year's last 2 digits → 2000s (e.g., 05 = 2005)
- If YY > current_year's last 2 digits → 1900s (e.g., 79 = 1979)

This handles the common case where clients born after 2000 have IDs like `0501...` (January 2005).

## Files to Modify

### 1. `src/components/clients/AddClientDialog.tsx`

**Changes:**
- Add a helper function `extractDateOfBirthFromId(idNumber: string): string | null`
- Add a `useEffect` hook that watches the `id_number` field
- When `client_type` is "individual" and `id_number` has at least 6 digits, auto-populate `date_of_birth`

**Helper Function:**
```typescript
const extractDateOfBirthFromId = (idNumber: string): string | null => {
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
};
```

**useEffect Hook (watches form values):**
```typescript
const watchIdNumber = form.watch("id_number");
const watchClientType = form.watch("client_type");

useEffect(() => {
  if (watchClientType === "individual" && watchIdNumber && watchIdNumber.length >= 6) {
    const extractedDob = extractDateOfBirthFromId(watchIdNumber);
    if (extractedDob) {
      form.setValue("date_of_birth", extractedDob);
    }
  }
}, [watchIdNumber, watchClientType, form]);
```

### 2. `src/components/client-detail/AddFamilyMemberDialog.tsx`

**Changes:**
- Add the same `extractDateOfBirthFromId` helper function
- Add `useEffect` to watch `id_number` and auto-populate `date_of_birth`
- Family members are always individuals, so no client_type check needed

**useEffect Hook:**
```typescript
const watchIdNumber = form.watch("id_number");

useEffect(() => {
  if (watchIdNumber && watchIdNumber.length >= 6) {
    const extractedDob = extractDateOfBirthFromId(watchIdNumber);
    if (extractedDob) {
      form.setValue("date_of_birth", extractedDob);
    }
  }
}, [watchIdNumber, form]);
```

### 3. `src/components/client-detail/ClientDetailsTab.tsx`

**Changes:**
- Add the same `extractDateOfBirthFromId` helper function
- Modify the `handleChange` function to auto-populate `date_of_birth` when `id_number` changes
- Only apply when `person_type` is "Individual"

**Updated handleChange:**
```typescript
const handleChange = (field: string, value: string) => {
  setFormData(prev => {
    const updated = { ...prev, [field]: value };
    
    // Auto-populate date of birth from ID number for individuals
    if (field === "id_number" && prev.person_type === "Individual" && value.length >= 6) {
      const extractedDob = extractDateOfBirthFromId(value);
      if (extractedDob) {
        updated.date_of_birth = extractedDob;
      }
    }
    
    return updated;
  });
};
```

## Shared Utility Consideration

Since the same function is used in 3 places, we could create a shared utility file. However, to minimize changes and keep the implementation focused, the helper function will be duplicated in each file. A future refactor could move this to `src/lib/utils.ts`.

## Expected Behavior

| Scenario | Result |
|----------|--------|
| Enter ID `7905245013088` for Individual | Date of Birth auto-fills to `1979-05-24` |
| Enter ID `0501015013088` for Individual | Date of Birth auto-fills to `2005-01-01` |
| Enter ID for Business/Family client | Date of Birth NOT auto-filled |
| Enter partial ID (less than 6 digits) | No auto-fill until 6+ digits entered |
| Enter invalid month (e.g., `7913...`) | No auto-fill (validation fails) |
| User manually changes date after auto-fill | Manual value is preserved |

## Edge Cases Handled

1. **Invalid month/day**: If extracted month > 12 or day > 31, no auto-population occurs
2. **Partial ID**: Only triggers when at least 6 digits are entered
3. **Non-individual clients**: Auto-population only for individual/person type clients
4. **Manual override**: Users can still manually change the date after auto-population
5. **Century boundary**: Properly handles both 1900s and 2000s birth years

## Technical Notes

1. **Form value watching**: Uses `form.watch()` from react-hook-form to reactively observe field changes
2. **Date format**: Returns `YYYY-MM-DD` format which is required by HTML date inputs
3. **No validation of actual date**: Does not validate if the day is valid for the month (e.g., Feb 30)
4. **Performance**: The useEffect runs on every ID number keystroke, but the operation is lightweight

