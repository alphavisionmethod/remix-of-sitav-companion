// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Retry Policy
// Exponential backoff with jitter and per-domain budgets.
// ═══════════════════════════════════════════════════════════════

export interface RetryDecision {
  shouldRetry: boolean;
  delayMs: number;
  reason: string;
}

export function nextRetry(attempts: number, maxAttempts: number): RetryDecision {
  if (attempts >= maxAttempts) {
    return { shouldRetry: false, delayMs: 0, reason: "max-attempts-exceeded" };
  }
  const base = Math.min(60_000, 500 * Math.pow(2, attempts));
  const jitter = Math.floor(Math.random() * 250);
  return { shouldRetry: true, delayMs: base + jitter, reason: "backoff" };
}
