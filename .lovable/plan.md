

# Enable Leaked Password Protection via HaveIBeenPwned k-Anonymity API

## Problem

The security scan flagged "Leaked Password Protection" as an error-level finding. Currently, passwords are validated for strength (length, complexity) but are not checked against known data breach databases. This means users could set passwords that have been compromised in previous breaches, including the demo account (`demo@vantage.co.za`).

## Solution

Implement **client-side leaked password checking** using the [HaveIBeenPwned Pwned Passwords API](https://haveibeenpwned.com/API/v3#PwnedPasswords) with **k-Anonymity**, which ensures the actual password never leaves the browser.

### How k-Anonymity Works

1. Hash the password with SHA-1 using the browser's built-in Web Crypto API
2. Send only the **first 5 characters** of the hash to the HIBP API
3. HIBP returns all hash suffixes that match that prefix
4. The client checks locally if the full hash appears in the response
5. If found, warn the user their password has appeared in a known data breach

This is privacy-preserving -- the full password hash (and certainly the password itself) is never transmitted.

### Where the Check Runs

The leaked password check will be applied in **all three places** where users set passwords:

1. **Sign Up page** (`Signup.tsx`) -- before creating an account
2. **Sign In page** (`Auth.tsx`) -- before signing in with email (optional warning, non-blocking for login)
3. **Account Settings** (`AccountSettings.tsx`) -- before changing password

For **sign up and password change**, a leaked password will **block submission** with a clear error message. For **sign in**, the check is skipped (users must be able to log in with existing passwords to then change them).

---

## Changes

### 1. New Utility: `src/lib/password-security.ts`

A shared utility module with two functions:

**`checkPasswordLeaked(password: string): Promise<boolean>`**
- Converts the password to a SHA-1 hash using `crypto.subtle.digest('SHA-1', ...)`
- Extracts the first 5 characters (prefix) and remaining characters (suffix)
- Calls `https://api.pwnedpasswords.com/range/{prefix}`
- Parses the response and checks if the suffix appears in the results
- Returns `true` if the password has been found in breaches, `false` otherwise
- Gracefully handles network errors (returns `false` if the API is unreachable, so users are not blocked by API downtime)

**`formatBreachCount(count: number): string`**
- Formats the breach count for display (e.g., "found in 1,234 data breaches")

### 2. Sign Up Page (`src/pages/Signup.tsx`)

- Import `checkPasswordLeaked` from the new utility
- After Zod validation passes, and before calling `supabase.auth.signUp`, run the leaked password check
- If the password is leaked, set a form error on the password field: "This password has appeared in a data breach and should not be used. Please choose a different password."
- The sign up is **blocked** until the user picks a non-leaked password
- Show a brief loading state ("Checking password security...") during the API call

### 3. Auth / Sign In Page (`src/pages/Auth.tsx`)

- For **sign in**: Do **not** check for leaked passwords (users must be able to log in with existing credentials to change them)
- For the **sign up flow** within Auth.tsx (the `isSignUp` branch): Apply the same leaked password check as the dedicated Sign Up page
- If leaked, set the password error and block submission

### 4. Account Settings -- Password Change (`src/pages/AccountSettings.tsx`)

- Import `checkPasswordLeaked`
- In `handlePasswordUpdate`, after Zod validation and password match check, run the leaked password check on the new password
- If leaked, set `passwordError` to the breach warning message and abort the update
- The password change is **blocked** until the user picks a non-leaked password
- Show loading state on the button ("Checking security...") during the check

### 5. Update Security Finding

- After implementing, delete the `clients_sensitive_data` finding (or update it to remove the leaked password protection mention, since it's now handled in code)

---

## Files Summary

| File | Action |
|------|--------|
| `src/lib/password-security.ts` | **New** -- shared HIBP k-Anonymity password checking utility |
| `src/pages/Signup.tsx` | Add leaked password check before sign up submission |
| `src/pages/Auth.tsx` | Add leaked password check for the sign-up flow only |
| `src/pages/AccountSettings.tsx` | Add leaked password check before password change |

No database changes needed. No new dependencies (uses built-in Web Crypto API and `fetch`).

---

## Technical Details

### HIBP API Call

```text
URL: https://api.pwnedpasswords.com/range/{first5HashChars}
Method: GET
Headers: { "Add-Padding": "true" }  // Adds padding to prevent response-length analysis
Response: Plain text, one hash suffix per line in format "SUFFIX:COUNT"
```

### SHA-1 Hashing (Web Crypto API)

```text
const encoder = new TextEncoder();
const data = encoder.encode(password);
const hashBuffer = await crypto.subtle.digest('SHA-1', data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
const prefix = hashHex.slice(0, 5);
const suffix = hashHex.slice(5);
```

### Error Message

When a password is found in breaches:
> "This password has been found in a known data breach. Please choose a different password to keep your account secure."

### Graceful Degradation

If the HIBP API is unreachable (network error, timeout, etc.), the check will **silently pass** -- we do not block users from setting passwords just because an external API is down. The check is a best-effort security enhancement.

