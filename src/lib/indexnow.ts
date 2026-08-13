import { canonicalUrl } from "@/lib/seo";

/**
 * IndexNow ping — tells Bing, Yandex and Naver that a URL changed, instead of
 * waiting for their next crawl. Google does not participate, but the Bing index
 * is what feeds ChatGPT and Copilot, so this is the fastest route to AI search
 * visibility for newly published or edited content.
 *
 * Disabled unless INDEXNOW_KEY is set; the key is proved by
 * src/app/indexnow-key.txt/route.ts.
 */
const ENDPOINT = "https://api.indexnow.org/indexnow";
const KEY_PATH = "indexnow-key.txt";

export function indexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && key.length >= 8 ? key : null;
}

/**
 * Fire-and-forget: never let a failed ping break the admin action that caused
 * it. Errors are logged and swallowed.
 */
export async function pingIndexNow(slugs: string[]): Promise<void> {
  const key = indexNowKey();
  if (!key || slugs.length === 0) return;

  const host = new URL(canonicalUrl()).host;
  const urlList = slugs.slice(0, 10_000).map(s => canonicalUrl(s));

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation: `https://${host}/${KEY_PATH}`, urlList }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn(`[indexnow] ${res.status} for ${urlList.length} url(s)`);
    }
  } catch (err) {
    console.warn("[indexnow] ping failed:", err instanceof Error ? err.message : err);
  }
}
