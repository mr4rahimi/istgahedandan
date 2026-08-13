/**
 * Single source of the signing key for both the admin and the dentist session
 * tokens.
 *
 * There is deliberately no fallback value: a hard-coded default that lives in
 * the repository would let a misconfigured production deploy sign tokens with a
 * publicly known key. Resolution is lazy so that `next build` — which imports
 * these modules while collecting pages — does not require the secret, but any
 * actual sign/verify at runtime does.
 */

let cached: Uint8Array | null = null;

export function jwtSecret(): Uint8Array {
  if (cached) return cached;

  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error(
      "JWT_SECRET is missing or too short (needs at least 32 characters). Set it in the environment before starting the server.",
    );
  }

  cached = new TextEncoder().encode(raw);
  return cached;
}

/**
 * Both token families are signed with the same key, so the payload must say
 * which one it is — otherwise a dentist token would satisfy an admin check.
 */
export type SessionRole = "admin" | "dentist";

// Kept here rather than in auth.ts / dentist-auth.ts so that proxy.ts can import
// them without pulling in `next/headers`, which is not available to it.
export const ADMIN_ROLE: SessionRole = "admin";
export const DENTIST_ROLE: SessionRole = "dentist";
