// ═══════════════════════════════════════════════════════════════
// SITA OS — Deprecation Log (Migration)
// Runtime deprecation tracking for legacy orchestrators
// ═══════════════════════════════════════════════════════════════

export interface DeprecationEntry {
  legacyName: string;
  calledFrom: string;
  calledAt: string;
  suggestion: string;
}

const deprecationLog: DeprecationEntry[] = [];
const WARN_LIMIT = 100;

export function logDeprecation(
  legacyName: string,
  calledFrom: string,
  suggestion: string
): void {
  if (deprecationLog.length >= WARN_LIMIT) return; // prevent memory leak

  const entry: DeprecationEntry = {
    legacyName,
    calledFrom,
    calledAt: new Date().toISOString(),
    suggestion,
  };

  deprecationLog.push(entry);

  if (typeof console !== "undefined") {
    console.warn(
      `[SITA Deprecation] ${legacyName} called from ${calledFrom}. Use ${suggestion} instead.`
    );
  }
}

export function getDeprecationLog(): DeprecationEntry[] {
  return [...deprecationLog];
}

export function clearDeprecationLog(): void {
  deprecationLog.length = 0;
}

export function getDeprecationCount(): number {
  return deprecationLog.length;
}
