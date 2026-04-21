/**
 * Production runtime smoke test for advisor portrait assets.
 * Validates that every domain portrait URL is reachable (no 404s).
 * Can be called on app boot or from a diagnostics panel.
 */

import { DEFAULT_ADVISOR_AVATARS } from "./advisor-avatar-assets";

export interface PortraitCheckResult {
  domain: string;
  url: string;
  ok: boolean;
  status: number | null;
  /** True when the URL contains a Vite content-hash (e.g. `-B3kF9a2.png`) */
  hasContentHash: boolean;
  error?: string;
}

const VITE_HASH_RE = /-[a-zA-Z0-9_-]{6,12}\.\w+$/;

/**
 * Check a single portrait URL is reachable.
 * Works with both relative Vite asset paths and absolute CDN URLs.
 */
async function checkPortrait(domain: string, url: string): Promise<PortraitCheckResult> {
  const hasContentHash = VITE_HASH_RE.test(url);
  try {
    // Resolve relative paths against current origin (handles non-root base)
    const resolved = url.startsWith("http") ? url : new URL(url, window.location.origin).href;
    const res = await fetch(resolved, { method: "HEAD", cache: "no-cache" });
    return { domain, url: resolved, ok: res.ok, status: res.status, hasContentHash };
  } catch (err) {
    return {
      domain,
      url,
      ok: false,
      status: null,
      hasContentHash,
      error: err instanceof Error ? err.message : "Unknown fetch error",
    };
  }
}

/**
 * Run smoke test across all advisor domains.
 * Returns a report array — every entry with `ok: false` is a broken portrait.
 */
export async function runPortraitSmokeTest(): Promise<PortraitCheckResult[]> {
  const entries = Object.entries(DEFAULT_ADVISOR_AVATARS).filter(
    (e): e is [string, string] => typeof e[1] === "string"
  );

  const results = await Promise.all(
    entries.map(([domain, url]) => checkPortrait(domain, url))
  );

  // Log summary
  const broken = results.filter((r) => !r.ok);
  if (broken.length > 0) {
    console.warn(
      `[Portrait Smoke Test] ${broken.length}/${results.length} portrait(s) failed:`,
      broken.map((r) => `${r.domain}: ${r.status ?? r.error}`)
    );
  } else {
    console.info(`[Portrait Smoke Test] All ${results.length} portraits OK`);
  }

  return results;
}

/**
 * Quick boolean check — useful in health dashboards.
 */
export async function allPortraitsHealthy(): Promise<boolean> {
  const results = await runPortraitSmokeTest();
  return results.every((r) => r.ok);
}

/**
 * Verify that portrait URLs contain Vite content-hashes,
 * confirming cache-busting is working after a rebuild.
 */
export function verifyContentHashes(): { domain: string; url: string; hashed: boolean }[] {
  return Object.entries(DEFAULT_ADVISOR_AVATARS)
    .filter((e): e is [string, string] => typeof e[1] === "string")
    .map(([domain, url]) => ({
      domain,
      url,
      hashed: VITE_HASH_RE.test(url),
    }));
}