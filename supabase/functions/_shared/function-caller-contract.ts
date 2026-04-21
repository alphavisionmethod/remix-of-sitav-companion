// ═══════════════════════════════════════════════════════════════
// SITA OS — Function Caller Contract (Deno Runtime)
// Canonical caller-class validation for edge functions.
// Mirrors CallerClass from src/lib/backend-topology/edge-function-registry.ts
// ═══════════════════════════════════════════════════════════════

export type CallerClass =
  | "frontend-user"
  | "frontend-admin"
  | "public-bff"
  | "admin-bff"
  | "domain-function"
  | "orchestration-function"
  | "connector-webhook"
  | "runtime-system"
  | "scheduler"
  | "kernel"
  | "external-webhook"
  | "service-internal"
  | "any-authenticated";

export interface CallerValidationResult {
  readonly ok: boolean;
  readonly detectedCaller: CallerClass | "unknown";
  readonly rejectionReason?: string;
}

const ADMIN_ORIGINS = ["admin-ui", "admin-console", "admin-bff"];
const SYSTEM_HEADERS = ["x-sita-service-caller", "x-service-caller"];
const WEBHOOK_HEADERS = ["x-webhook-signature", "x-hub-signature-256", "stripe-signature"];

function detectCallerClass(req: Request): CallerClass | "unknown" {
  // Check explicit service-caller header first
  for (const h of SYSTEM_HEADERS) {
    const val = req.headers.get(h);
    if (val) {
      const known: CallerClass[] = [
        "domain-function", "orchestration-function", "runtime-system",
        "scheduler", "kernel", "service-internal",
      ];
      if (known.includes(val as CallerClass)) return val as CallerClass;
    }
  }

  // Check webhook signatures
  for (const h of WEBHOOK_HEADERS) {
    if (req.headers.get(h)) return "external-webhook";
  }

  // Check for connector webhook pattern
  const url = new URL(req.url);
  if (url.pathname.includes("webhook") || url.pathname.includes("callback")) {
    if (!req.headers.get("authorization")) return "connector-webhook";
  }

  // Check auth header for JWT-based callers
  const auth = req.headers.get("authorization");
  if (!auth) return "unknown";

  // Admin detection via origin/referer
  const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
  for (const marker of ADMIN_ORIGINS) {
    if (origin.includes(marker)) return "frontend-admin";
  }

  // Default authenticated browser caller
  if (auth.startsWith("Bearer ")) return "frontend-user";

  return "any-authenticated";
}

/**
 * Validates that the incoming request matches one of the allowed caller classes.
 * Returns structured result with detected caller and rejection reason if denied.
 */
export function validateCallerClass(
  req: Request,
  allowedCallers: readonly CallerClass[],
): CallerValidationResult {
  const detected = detectCallerClass(req);

  // "any-authenticated" in allowedCallers is a wildcard for all authenticated callers
  if (allowedCallers.includes("any-authenticated") && detected !== "unknown") {
    return { ok: true, detectedCaller: detected };
  }

  if (detected === "unknown") {
    return {
      ok: false,
      detectedCaller: "unknown",
      rejectionReason: `Caller class could not be determined. Allowed: [${allowedCallers.join(", ")}]`,
    };
  }

  if (allowedCallers.includes(detected)) {
    return { ok: true, detectedCaller: detected };
  }

  return {
    ok: false,
    detectedCaller: detected,
    rejectionReason: `Caller class "${detected}" is not in allowed set: [${allowedCallers.join(", ")}]`,
  };
}