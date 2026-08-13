"use client";

import { useEffect, useState } from "react";

export interface DentistSessionInfo {
  loggedIn: boolean;
  name?: string;
  dentistId?: number | null;
}

// Header and Footer both need this on every public page, so the in-flight
// request and its result are shared at module level to avoid duplicate fetches.
let cached: DentistSessionInfo | null = null;
let inflight: Promise<DentistSessionInfo> | null = null;

function load(): Promise<DentistSessionInfo> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch("/api/dentist/me")
      .then(res => (res.ok ? res.json() : { loggedIn: false }))
      .catch(() => ({ loggedIn: false } as DentistSessionInfo))
      .then((data: DentistSessionInfo) => {
        cached = data;
        inflight = null;
        return data;
      });
  }
  return inflight;
}

/** `null` while the session is still unknown (first render / in flight). */
export function useDentistSession(): DentistSessionInfo | null {
  const [session, setSession] = useState<DentistSessionInfo | null>(cached);

  useEffect(() => {
    if (session) return;
    let alive = true;
    load().then(data => { if (alive) setSession(data); });
    return () => { alive = false; };
  }, [session]);

  return session;
}

/** Called after login/logout so the cached answer is not stale. */
export function clearDentistSessionCache() {
  cached = null;
  inflight = null;
}
