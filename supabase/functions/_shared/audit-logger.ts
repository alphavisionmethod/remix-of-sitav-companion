// ═══════════════════════════════════════════════════════════════
// SITA OS — Security Audit Logger
// Logs security-relevant events to audit_logs table
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

export type SecurityEventType =
  | "auth_success" | "auth_failure" | "rate_limit_hit"
  | "brute_force_lockout" | "admin_action" | "sensitive_data_access"
  | "config_change" | "secret_access" | "permission_escalation_attempt"
  | "suspicious_input" | "cors_violation" | "token_expired";

export interface SecurityEvent {
  eventType: SecurityEventType;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  functionName: string;
  details?: Record<string, unknown>;
  severity: "info" | "warning" | "high" | "critical";
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) return;

    const supabase = createClient(supabaseUrl, serviceKey);

    await supabase.from("audit_logs").insert({
      user_id: event.userId || "00000000-0000-0000-0000-000000000000",
      action: event.eventType,
      category: "security",
      actor: event.functionName,
      target_type: "edge_function",
      target_id: event.functionName,
      severity: event.severity,
      details: {
        ip: event.ipAddress,
        user_agent: event.userAgent,
        ...event.details,
      },
    });
  } catch {
    // Silent fail — audit logging must never break the request
  }
}

/** Extract client IP from request headers */
export function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/** Extract user agent */
export function getUserAgent(req: Request): string {
  return req.headers.get("user-agent")?.slice(0, 256) || "unknown";
}
