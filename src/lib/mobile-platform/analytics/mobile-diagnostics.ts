// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Diagnostics
// Buffered, redacted diagnostics surface for mobile-only signals.
// ═══════════════════════════════════════════════════════════════

import type { MobileAnalyticsEnvelope } from "./mobile-analytics-partition";

const BUFFER: MobileAnalyticsEnvelope[] = [];
const MAX_BUFFER = 200;

export function recordMobileDiagnostic(envelope: MobileAnalyticsEnvelope): void {
  BUFFER.push(envelope);
  if (BUFFER.length > MAX_BUFFER) BUFFER.shift();
}

export function drainMobileDiagnostics(): MobileAnalyticsEnvelope[] {
  const out = BUFFER.slice();
  BUFFER.length = 0;
  return out;
}

export function peekMobileDiagnostics(): ReadonlyArray<MobileAnalyticsEnvelope> {
  return BUFFER.slice();
}
