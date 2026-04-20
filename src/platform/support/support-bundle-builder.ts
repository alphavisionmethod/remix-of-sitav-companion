// ═══════════════════════════════════════════════════════════════
// SITA OS — Support Bundle Builder
// Collects runtime state, errors, config, and recent activity
// into a redacted diagnostic bundle for support.
// ═══════════════════════════════════════════════════════════════

export interface SupportBundleSection {
  sectionId: string;
  label: string;
  data: Record<string, unknown>;
  redacted: boolean;
}

export interface SupportBundle {
  generatedAt: string;
  bundleVersion: "1.0";
  sections: SupportBundleSection[];
  totalSections: number;
  redactedFields: string[];
}

const REDACT_KEYS = ["password", "secret", "token", "key", "authorization", "cookie", "session"];

function redactValue(key: string, value: unknown): unknown {
  if (typeof value === "string" && REDACT_KEYS.some((r) => key.toLowerCase().includes(r))) {
    return "[REDACTED]";
  }
  return value;
}

function redactObject(obj: Record<string, unknown>): { redacted: Record<string, unknown>; redactedFields: string[] } {
  const result: Record<string, unknown> = {};
  const fields: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const cleaned = redactValue(k, v);
    if (cleaned === "[REDACTED]") fields.push(k);
    result[k] = cleaned;
  }
  return { redacted: result, redactedFields: fields };
}

function collectBrowserInfo(): Record<string, unknown> {
  if (typeof window === "undefined") return { environment: "server" };
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screenWidth: screen.width,
    screenHeight: screen.height,
    devicePixelRatio: window.devicePixelRatio,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  };
}

function collectStorageInfo(): Record<string, unknown> {
  try {
    return {
      localStorageKeys: Object.keys(localStorage).length,
      sessionStorageKeys: Object.keys(sessionStorage).length,
    };
  } catch {
    return { storageAccess: "denied" };
  }
}

/**
 * Build a redacted support bundle with runtime diagnostics.
 * Safe to share with support — sensitive fields are redacted.
 */
export function buildSupportBundle(additionalContext?: Record<string, unknown>): SupportBundle {
  const allRedacted: string[] = [];

  const sections: SupportBundleSection[] = [
    { sectionId: "browser", label: "Browser Environment", data: collectBrowserInfo(), redacted: false },
    { sectionId: "storage", label: "Storage Status", data: collectStorageInfo(), redacted: false },
    { sectionId: "timestamp", label: "Collection Time", data: { collectedAt: new Date().toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }, redacted: false },
  ];

  if (additionalContext) {
    const { redacted, redactedFields } = redactObject(additionalContext);
    allRedacted.push(...redactedFields);
    sections.push({ sectionId: "context", label: "Additional Context", data: redacted, redacted: redactedFields.length > 0 });
  }

  return {
    generatedAt: new Date().toISOString(),
    bundleVersion: "1.0",
    sections,
    totalSections: sections.length,
    redactedFields: allRedacted,
  };
}