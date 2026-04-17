// ═══════════════════════════════════════════════════════════════
// SITA OS — Frontend Action → Backend API Map (Phase 16.1)
//
// Authoritative typed registry that proves every critical
// user/admin action has a real backend target (edge function,
// local capability, or realtime channel).
//
// Used by check-backend-api-deployability.ts (CI gate 27) to
// assert P0 frontend coverage.
// ═══════════════════════════════════════════════════════════════

export type FrontendActionKind =
  | "edge-function"
  | "local-capability"
  | "realtime-channel"
  | "supabase-rpc"
  | "supabase-table";

export type FrontendActionSurface = "user" | "admin" | "kernel" | "system";
export type FrontendActionCriticality = "P0" | "P1" | "P2";

export interface FrontendActionEntry {
  readonly id: string;
  readonly title: string;
  readonly surface: FrontendActionSurface;
  readonly criticality: FrontendActionCriticality;
  readonly kind: FrontendActionKind;
  /** Edge function name, capability id, channel name, RPC name, or table name. */
  readonly target: string;
  readonly notes?: string;
}

export const FRONTEND_ACTION_API_MAP: ReadonlyArray<FrontendActionEntry> = [
  // ── Auth & Identity ──────────────────────────────────────────
  { id: "auth.signup", title: "User signup", surface: "user", criticality: "P0", kind: "local-capability", target: "supabase.auth.signUp" },
  { id: "auth.login", title: "User login (email/password)", surface: "user", criticality: "P0", kind: "local-capability", target: "supabase.auth.signInWithPassword" },
  { id: "auth.oauth", title: "OAuth login (Google)", surface: "user", criticality: "P0", kind: "local-capability", target: "supabase.auth.signInWithOAuth" },
  { id: "auth.logout", title: "User logout", surface: "user", criticality: "P0", kind: "local-capability", target: "supabase.auth.signOut" },
  { id: "auth.reset-password", title: "Password reset", surface: "user", criticality: "P0", kind: "local-capability", target: "supabase.auth.resetPasswordForEmail" },
  { id: "auth.session", title: "Session refresh", surface: "user", criticality: "P0", kind: "local-capability", target: "supabase.auth.getSession" },

  // ── Profile / Preferences ────────────────────────────────────
  { id: "profile.read", title: "Read profile", surface: "user", criticality: "P1", kind: "supabase-table", target: "profiles" },
  { id: "profile.update", title: "Update profile", surface: "user", criticality: "P1", kind: "supabase-table", target: "profiles" },

  // ── Boardroom / AI ───────────────────────────────────────────
  { id: "ai.invoke", title: "Invoke AI capability", surface: "user", criticality: "P0", kind: "edge-function", target: "ai-gateway" },
  { id: "ai.advisor-conversation", title: "Advisor conversation", surface: "user", criticality: "P0", kind: "edge-function", target: "advisor-conversation" },
  { id: "ai.advisor-loop", title: "Advisor agent loop", surface: "user", criticality: "P1", kind: "edge-function", target: "advisor-agent-loop" },
  { id: "ai.deep-intelligence", title: "Deep intelligence analysis", surface: "user", criticality: "P1", kind: "edge-function", target: "advisor-deep-intelligence" },
  { id: "ai.advisor-avatar", title: "Generate advisor avatar", surface: "user", criticality: "P2", kind: "edge-function", target: "advisor-avatar-generate" },
  { id: "ai.weekly-report", title: "Weekly advisor report", surface: "user", criticality: "P1", kind: "edge-function", target: "advisor-weekly-report" },
  { id: "ai.knowledge-manage", title: "Manage advisor knowledge", surface: "user", criticality: "P1", kind: "edge-function", target: "advisor-knowledge-manage" },
  { id: "ai.brain-core", title: "Brain core orchestration", surface: "user", criticality: "P0", kind: "edge-function", target: "brain-core" },
  { id: "ai.agent-executor", title: "Execute agent action", surface: "user", criticality: "P0", kind: "edge-function", target: "agent-executor" },
  { id: "ai.agent-intelligence", title: "Agent reasoning", surface: "user", criticality: "P1", kind: "edge-function", target: "agent-intelligence" },
  { id: "ai.workforce-run", title: "Run AI workforce role", surface: "admin", criticality: "P0", kind: "edge-function", target: "admin-ai-workforce-run" },
  { id: "ai.intelligence-api", title: "Intelligence aggregation", surface: "user", criticality: "P0", kind: "edge-function", target: "intelligence-api" },

  // ── Files ────────────────────────────────────────────────────
  { id: "files.upload", title: "Upload file", surface: "user", criticality: "P0", kind: "local-capability", target: "supabase.storage.user-files.upload" },
  { id: "files.download", title: "Download file", surface: "user", criticality: "P0", kind: "local-capability", target: "supabase.storage.user-files.download" },
  { id: "files.list", title: "List files", surface: "user", criticality: "P1", kind: "supabase-table", target: "user_files" },

  // ── Communications ───────────────────────────────────────────
  { id: "comms.send-email", title: "Send transactional email", surface: "user", criticality: "P1", kind: "edge-function", target: "communications-send" },
  { id: "comms.send-sms", title: "Send SMS", surface: "user", criticality: "P1", kind: "edge-function", target: "communications-send" },

  // ── Push notifications ───────────────────────────────────────
  { id: "push.subscribe", title: "Subscribe to push", surface: "user", criticality: "P1", kind: "edge-function", target: "push-subscribe" },
  { id: "push.send", title: "Send push notification", surface: "system", criticality: "P1", kind: "edge-function", target: "push-send" },

  // ── Connectors ───────────────────────────────────────────────
  { id: "connectors.oauth-start", title: "Start connector OAuth", surface: "user", criticality: "P0", kind: "edge-function", target: "connector-oauth-start" },
  { id: "connectors.oauth-callback", title: "OAuth callback", surface: "system", criticality: "P0", kind: "edge-function", target: "connector-oauth-callback" },
  { id: "connectors.sync", title: "Trigger connector sync", surface: "user", criticality: "P1", kind: "edge-function", target: "connector-sync" },

  // ── Stripe / Billing ─────────────────────────────────────────
  { id: "billing.checkout", title: "Stripe checkout session", surface: "user", criticality: "P0", kind: "edge-function", target: "stripe-checkout" },
  { id: "billing.portal", title: "Stripe customer portal", surface: "user", criticality: "P0", kind: "edge-function", target: "stripe-portal" },
  { id: "billing.webhook", title: "Stripe webhook ingest", surface: "system", criticality: "P0", kind: "edge-function", target: "stripe-webhook" },

  // ── Realtime channels ────────────────────────────────────────
  { id: "realtime.notifications", title: "Realtime notifications", surface: "user", criticality: "P1", kind: "realtime-channel", target: "notifications" },
  { id: "realtime.advisor-stream", title: "Advisor live stream", surface: "user", criticality: "P1", kind: "realtime-channel", target: "advisor-stream" },

  // ── GDPR / Privacy ───────────────────────────────────────────
  { id: "gdpr.export", title: "Export user data (GDPR)", surface: "user", criticality: "P0", kind: "edge-function", target: "gdpr-export" },
  { id: "gdpr.delete", title: "Delete user data (GDPR)", surface: "user", criticality: "P0", kind: "edge-function", target: "gdpr-delete" },

  // ── Admin operations ─────────────────────────────────────────
  { id: "admin.bff-gateway", title: "Admin BFF aggregation", surface: "admin", criticality: "P0", kind: "edge-function", target: "admin-bff-gateway" },
  { id: "admin.users", title: "Admin user management", surface: "admin", criticality: "P0", kind: "edge-function", target: "admin-users" },
  { id: "admin.intelligence", title: "Admin intelligence", surface: "admin", criticality: "P1", kind: "edge-function", target: "admin-intelligence" },
  { id: "admin.cloud-control", title: "Cloud control plane", surface: "admin", criticality: "P0", kind: "edge-function", target: "cloud-admin-api" },
  { id: "admin.kill-switch", title: "Trigger kill switch", surface: "admin", criticality: "P0", kind: "edge-function", target: "admin-bff-gateway" },

  // ── Runtime / OS ─────────────────────────────────────────────
  { id: "runtime.os-command", title: "Issue OS command", surface: "kernel", criticality: "P0", kind: "edge-function", target: "os-command" },
  { id: "runtime.ambient-ops", title: "Ambient OS operation", surface: "user", criticality: "P1", kind: "edge-function", target: "ambient-os-operations" },
  { id: "runtime.user-bff", title: "User BFF aggregation", surface: "user", criticality: "P0", kind: "edge-function", target: "user-bff-gateway" },
];

export interface FrontendActionCoverageSummary {
  readonly total: number;
  readonly p0: number;
  readonly p1: number;
  readonly p2: number;
  readonly byKind: Record<FrontendActionKind, number>;
  readonly bySurface: Record<FrontendActionSurface, number>;
}

export function frontendActionCoverageSummary(): FrontendActionCoverageSummary {
  const byKind = { "edge-function": 0, "local-capability": 0, "realtime-channel": 0, "supabase-rpc": 0, "supabase-table": 0 } as Record<FrontendActionKind, number>;
  const bySurface = { user: 0, admin: 0, kernel: 0, system: 0 } as Record<FrontendActionSurface, number>;
  let p0 = 0, p1 = 0, p2 = 0;
  for (const a of FRONTEND_ACTION_API_MAP) {
    byKind[a.kind]++;
    bySurface[a.surface]++;
    if (a.criticality === "P0") p0++;
    else if (a.criticality === "P1") p1++;
    else p2++;
  }
  return { total: FRONTEND_ACTION_API_MAP.length, p0, p1, p2, byKind, bySurface };
}
