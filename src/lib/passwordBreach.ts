/**
 * Password Breach Checking via Have I Been Pwned (HIBP) API
 * 
 * Uses the k-Anonymity model: only the first 5 chars of the SHA-1 hash
 * are sent to the API, so the full password is never exposed.
 */

async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export interface BreachCheckResult {
  breached: boolean;
  count: number;
  error?: string;
}

/**
 * Check if a password has been found in known data breaches.
 * Returns the number of times the password has appeared.
 */
export async function checkPasswordBreach(password: string): Promise<BreachCheckResult> {
  try {
    const hash = await sha1(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' }, // Padding to prevent timing attacks
    });

    if (!response.ok) {
      return { breached: false, count: 0, error: 'HIBP API unavailable' };
    }

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix?.trim() === suffix) {
        const count = parseInt(countStr?.trim() ?? '0', 10);
        if (count > 0) {
          return { breached: true, count };
        }
      }
    }

    return { breached: false, count: 0 };
  } catch {
    // Don't block signup if HIBP is unreachable
    return { breached: false, count: 0, error: 'Unable to check breach database' };
  }
}
