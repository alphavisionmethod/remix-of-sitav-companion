// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Connector State Grammar
//
// Single source of truth for the 6-state connector lifecycle used
// by every admin Integrations surface and the Communications inbox.
// Eliminates the 4 ad-hoc color maps that previously drifted.
//
// State machine (worst-of-3 — see connector_effective_state view):
//   demo_simulated → manual → reauth_required → failing → degraded → connected
// ═══════════════════════════════════════════════════════════════

import type { StatusTone } from "@/components/primitives/status/StatusBadge";

export type ConnectorState =
  | "connected"
  | "degraded"
  | "reauth_required"
  | "failing"
  | "manual"
  | "demo_simulated";

export interface ConnectorStateMeta {
  state: ConnectorState;
  label: string;
  tone: StatusTone;
  description: string;
  /** Recommended next action surfaced as a CTA. */
  nextAction:
    | { kind: "none" }
    | { kind: "retry"; label: string }
    | { kind: "reauth"; label: string; deeplink: string }
    | { kind: "diagnose"; label: string; deeplink: string }
    | { kind: "ack"; label: string };
}

export const CONNECTOR_STATE_GRAMMAR: Record<ConnectorState, ConnectorStateMeta> = {
  connected: {
    state: "connected",
    label: "Connected",
    tone: "success",
    description: "Provider responding; tokens valid; recent refresh succeeded.",
    nextAction: { kind: "none" },
  },
  degraded: {
    state: "degraded",
    label: "Degraded",
    tone: "warning",
    description: "Elevated latency or partial failures observed in the last health window.",
    nextAction: { kind: "retry", label: "Retry probe" },
  },
  reauth_required: {
    state: "reauth_required",
    label: "Reauth required",
    tone: "warning",
    description: "Token expired, revoked, or refresh failed — operator must reconnect.",
    nextAction: {
      kind: "reauth",
      label: "Reconnect",
      deeplink: "/admin/integrations/oauth-refresh-health",
    },
  },
  failing: {
    state: "failing",
    label: "Failing",
    tone: "danger",
    description: "Provider unreachable or repeated probe failures — runbook action required.",
    nextAction: {
      kind: "diagnose",
      label: "Open diagnostics",
      deeplink: "/admin/ai-gateway/diagnostics",
    },
  },
  manual: {
    state: "manual",
    label: "Manual",
    tone: "muted",
    description: "Long-tail or disconnected provider — handled out-of-band by operator.",
    nextAction: { kind: "ack", label: "Acknowledge" },
  },
  demo_simulated: {
    state: "demo_simulated",
    label: "Demo (simulated)",
    tone: "info",
    description: "Demo-mode account — no real provider traffic.",
    nextAction: { kind: "none" },
  },
};

/** Map a freeform DB status string → canonical ConnectorState (defensive). */
export function normalizeConnectorState(raw: string | null | undefined): ConnectorState {
  if (!raw) return "manual";
  const v = raw.toLowerCase().trim();
  if (v === "connected" || v === "active" || v === "healthy") return "connected";
  if (v === "degraded") return "degraded";
  if (v === "reauth_required" || v === "expired" || v === "expired_token") return "reauth_required";
  if (v === "failing" || v === "blocked" || v === "error") return "failing";
  if (v === "demo_simulated" || v === "demo") return "demo_simulated";
  if (v === "manual" || v === "disconnected" || v === "revoked" || v === "unknown") return "manual";
  return "manual";
}

export function getConnectorStateMeta(raw: string | null | undefined): ConnectorStateMeta {
  return CONNECTOR_STATE_GRAMMAR[normalizeConnectorState(raw)];
}
