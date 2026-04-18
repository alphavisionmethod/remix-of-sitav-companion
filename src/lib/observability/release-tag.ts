// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Tag (single source of truth)
// Used by Sentry init, APM exporter, observability headers,
// and the desktop/electron updater.
// ═══════════════════════════════════════════════════════════════

declare const __APP_VERSION__: string | undefined;
declare const __GIT_SHA__: string | undefined;
declare const __BUILD_CHANNEL__: string | undefined;

const FALLBACK_VERSION = "0.0.0-dev";
const FALLBACK_SHA = "unknown";

function readEnv(name: string): string | undefined {
  if (typeof import.meta !== "undefined" && (import.meta as any).env) {
    const v = (import.meta as any).env[name];
    if (typeof v === "string" && v.length > 0) return v;
  }
  if (typeof process !== "undefined" && process.env && process.env[name]) {
    return process.env[name];
  }
  return undefined;
}

export function getAppVersion(): string {
  try {
    return (typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : undefined)
      ?? readEnv("VITE_APP_VERSION")
      ?? FALLBACK_VERSION;
  } catch {
    return FALLBACK_VERSION;
  }
}

export function getGitSha(): string {
  try {
    return (typeof __GIT_SHA__ !== "undefined" ? __GIT_SHA__ : undefined)
      ?? readEnv("VITE_GIT_SHA")
      ?? FALLBACK_SHA;
  } catch {
    return FALLBACK_SHA;
  }
}

export function getBuildChannel(): "dev" | "internal" | "beta" | "production" {
  const c = (typeof __BUILD_CHANNEL__ !== "undefined" ? __BUILD_CHANNEL__ : undefined)
    ?? readEnv("VITE_BUILD_CHANNEL")
    ?? "dev";
  if (c === "internal" || c === "beta" || c === "production") return c;
  return "dev";
}

/**
 * Canonical Sentry-style release tag: `sita-os@<version>+<sha7>`.
 * Sentry, Datadog, and the desktop updater all consume this format.
 */
export function getReleaseTag(): string {
  const sha = getGitSha().slice(0, 7);
  return `sita-os@${getAppVersion()}+${sha}`;
}

/**
 * Headers attached to every outbound observability call (APM, Sentry, custom).
 * Lets the operator correlate signals across surfaces by release.
 */
export function getReleaseHeaders(): Record<string, string> {
  return {
    "x-sita-release": getReleaseTag(),
    "x-sita-channel": getBuildChannel(),
  };
}

/**
 * Minimal release descriptor for serialization (incident reports, crash uploads).
 */
export interface ReleaseDescriptor {
  release: string;
  version: string;
  sha: string;
  channel: ReturnType<typeof getBuildChannel>;
  capturedAt: string;
}

export function describeRelease(): ReleaseDescriptor {
  return {
    release: getReleaseTag(),
    version: getAppVersion(),
    sha: getGitSha(),
    channel: getBuildChannel(),
    capturedAt: new Date().toISOString(),
  };
}
