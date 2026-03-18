/**
 * Leaked password checking via HaveIBeenPwned k-Anonymity API.
 *
 * How it works:
 * 1. Hash the password with SHA-1 (Web Crypto API)
 * 2. Send only the first 5 hex chars to the HIBP range endpoint
 * 3. Check locally whether the full hash suffix appears in the response
 *
 * The actual password (and its full hash) never leaves the browser.
 */

async function sha1(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

/**
 * Returns `true` if the password has appeared in a known data breach.
 * Fails open (returns `false`) on network errors so users are never
 * blocked by API downtime.
 */
export async function checkPasswordLeaked(password: string): Promise<boolean> {
  try {
    const hash = await sha1(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
    });

    if (!response.ok) return false;

    const text = await response.text();
    const lines = text.split("\n");

    for (const line of lines) {
      const [hashSuffix] = line.split(":");
      if (hashSuffix.trim() === suffix) {
        return true;
      }
    }

    return false;
  } catch {
    // Network error / API unreachable — fail open
    return false;
  }
}
