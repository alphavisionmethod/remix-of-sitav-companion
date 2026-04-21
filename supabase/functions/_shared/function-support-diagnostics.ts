// ═══════════════════════════════════════════════════════════════
// SITA OS — Function Support Diagnostics
// Structured diagnostic emission for critical edge functions.
// ═══════════════════════════════════════════════════════════════

export interface SupportDiagnostic {
  readonly functionName: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly durationMs: number;
  readonly inputSnapshot: Record<string, unknown>;
  readonly outputSnapshot: Record<string, unknown>;
  readonly error?: { message: string; code?: string };
  readonly traceId?: string;
}

const PII_KEYS = new Set([
  "password", "token", "secret", "authorization", "cookie",
  "ssn", "credit_card", "card_number", "cvv", "api_key",
  "apikey", "access_token", "refresh_token", "private_key",
  "email", "phone", "address", "date_of_birth",
]);

function redact(obj: unknown, depth = 0): Record<string, unknown> {
  if (depth > 3 || !obj || typeof obj !== "object") return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lower = key.toLowerCase().replace(/[-_]/g, "");
    if (PII_KEYS.has(key.toLowerCase()) || PII_KEYS.has(lower)) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "string" && value.length > 500) {
      result[key] = value.slice(0, 100) + "...[truncated]";
    } else if (typeof value === "object" && value !== null) {
      result[key] = redact(value, depth + 1);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Emit a structured support diagnostic for incident-ready observability.
 * Automatically redacts PII, tokens, and secrets from input/output snapshots.
 */
export function emitSupportDiagnostic(
  functionName: string,
  correlationId: string,
  input: unknown,
  output: unknown,
  durationMs: number,
  error?: { message: string; code?: string },
): SupportDiagnostic {
  const diagnostic: SupportDiagnostic = {
    functionName,
    correlationId,
    timestamp: new Date().toISOString(),
    durationMs,
    inputSnapshot: redact(input),
    outputSnapshot: redact(output),
    ...(error ? { error: { message: error.message, code: error.code } } : {}),
    traceId: correlationId,
  };

  // Emit as structured log for observability pipeline
  console.log(JSON.stringify({
    level: error ? "error" : "info",
    type: "support-diagnostic",
    ...diagnostic,
  }));

  return diagnostic;
}

/** Critical functions that MUST always emit support diagnostics. */
export const SUPPORT_DIAGNOSTIC_FUNCTIONS: ReadonlySet<string> = new Set([
  "ai-gateway", "api-gateway", "admin-bff-gateway", "user-bff-gateway",
  "payment-process", "payment-webhook", "connector-oauth", "connector-sync",
  "brain-core", "advisor-agent-loop", "advisor-conversation",
  "agent-executor", "scheduler-dispatch", "event-processor",
  "gdpr-delete", "gdpr-export", "self-healing", "push-dispatch",
  "intelligence-api", "admin-ai-workforce-run", "verification-recorder",
  "cloud-sync-api", "cloud-lifecycle-api", "cloud-admin-api",
  "license-gateway", "support-gateway", "file-ai-pipeline",
  "cashflow-calculate", "invoice-generate", "tax-calculate",
  "onboarding-flow", "production-launch-attestor",
]);