// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Copy Helper Map (D6 canonical system)
//
// Pure data module. No React. No service imports. No side effects.
//
// Single source of truth for operator-facing trust language across
// AI, provider, proof, and data state categories. Surfaces import
// labels from here instead of inlining strings, so trust language
// stays consistent across the 5 in-scope surfaces (Boardroom,
// Concierge, Communications, Admin AI Runtime, Admin Integrations).
//
// IMPORTANT: this module ONLY provides labels + tones. It does NOT
// claim runtime state. Callers must supply the state — usually by
// reading canonical runtime tables (ai_runtime_nightly_runs,
// connector health, ai_inference_receipts, etc.).
// ═══════════════════════════════════════════════════════════════

import type { StatusTone } from "@/components/primitives/status/StatusBadge";

// ── Category × State taxonomy ────────────────────────────────────

export type TrustCategory = "ai" | "provider" | "proof" | "data";

export type AIState =
  | "live"
  | "degraded"
  | "structural"
  | "preview"
  | "archived";

export type ProviderState =
  | "connected"
  | "degraded"
  | "reauth_required"
  | "failing"
  | "manual"
  | "not_connected";

export type ProofState =
  | "verified"
  | "pending"
  | "needs_evidence"
  | "failed";

export type DataState =
  | "live"
  | "simulated"
  | "demo"
  | "future"
  | "archived";

export type TrustState<C extends TrustCategory> =
  C extends "ai" ? AIState
  : C extends "provider" ? ProviderState
  : C extends "proof" ? ProofState
  : C extends "data" ? DataState
  : never;

export interface TrustCopyEntry {
  /** Operator-facing label, e.g. "Live · gateway-governed". */
  label: string;
  /** Short label for tight chips, e.g. "Live". */
  short: string;
  /** Canonical tone from StatusBadge. */
  tone: StatusTone;
  /** One-line operator explanation. Plain English, no overclaim. */
  description: string;
}

// ── The map ──────────────────────────────────────────────────────

export const TRUST_COPY = Object.freeze({
  ai: {
    live: {
      label: "Live · gateway-governed",
      short: "Live",
      tone: "success" as StatusTone,
      description: "Calls flow through the Sovereign AI Gateway with receipts and budget governance.",
    },
    degraded: {
      label: "Degraded · fallback active",
      short: "Degraded",
      tone: "warning" as StatusTone,
      description: "Primary model unavailable — fallback chain in use. Receipts still recorded.",
    },
    structural: {
      label: "Structurally wired · not behaviorally proven",
      short: "Structural",
      tone: "neutral" as StatusTone,
      description: "UI is wired to the runtime but no nightly behavioral proof exists yet.",
    },
    preview: {
      label: "Preview · demo data",
      short: "Preview",
      tone: "info" as StatusTone,
      description: "Surface previews shape and behavior — values are illustrative, not live.",
    },
    archived: {
      label: "Archived · not in scope",
      short: "Archived",
      tone: "muted" as StatusTone,
      description: "Surface is preserved for reference but not part of the active runtime.",
    },
  },
  provider: {
    connected: {
      label: "Connected",
      short: "Connected",
      tone: "success" as StatusTone,
      description: "Provider is healthy and refresh is current.",
    },
    degraded: {
      label: "Degraded",
      short: "Degraded",
      tone: "warning" as StatusTone,
      description: "Recent failures detected — partial functionality.",
    },
    reauth_required: {
      label: "Reauth required",
      short: "Reauth",
      tone: "warning" as StatusTone,
      description: "Token expired or scope changed — operator must reconnect.",
    },
    failing: {
      label: "Failing",
      short: "Failing",
      tone: "danger" as StatusTone,
      description: "Provider is returning errors — calls are being blocked.",
    },
    manual: {
      label: "Manual",
      short: "Manual",
      tone: "info" as StatusTone,
      description: "Operator-driven only — no automated refresh configured.",
    },
    not_connected: {
      label: "Not connected",
      short: "Off",
      tone: "muted" as StatusTone,
      description: "Provider has never been connected for this account.",
    },
  },
  proof: {
    verified: {
      label: "Verified",
      short: "Verified",
      tone: "success" as StatusTone,
      description: "Backed by a recorded receipt or proof bundle.",
    },
    pending: {
      label: "Pending verification",
      short: "Pending",
      tone: "warning" as StatusTone,
      description: "Proof generation in flight — not yet recorded.",
    },
    needs_evidence: {
      label: "Needs evidence",
      short: "Needs evidence",
      tone: "info" as StatusTone,
      description: "No supporting receipt yet — operator action recommended.",
    },
    failed: {
      label: "Proof failed",
      short: "Failed",
      tone: "danger" as StatusTone,
      description: "Verification attempt failed — see linked failure record.",
    },
  },
  data: {
    live: {
      label: "Live data",
      short: "Live",
      tone: "success" as StatusTone,
      description: "Sourced from canonical runtime tables.",
    },
    simulated: {
      label: "Simulated · disclosure required",
      short: "Simulated",
      tone: "warning" as StatusTone,
      description: "Synthesized for shape — must carry simulation disclosure.",
    },
    demo: {
      label: "Demo data",
      short: "Demo",
      tone: "info" as StatusTone,
      description: "Illustrative only — not connected to a live source.",
    },
    future: {
      label: "Future · not yet shipped",
      short: "Future",
      tone: "muted" as StatusTone,
      description: "Reserved for a planned capability — operator should not act on it.",
    },
    archived: {
      label: "Archived",
      short: "Archived",
      tone: "muted" as StatusTone,
      description: "Preserved for reference — no longer part of the active flow.",
    },
  },
} as const);

// ── Typed accessors ──────────────────────────────────────────────

export function getTrustCopy<C extends TrustCategory>(
  category: C,
  state: TrustState<C>,
): TrustCopyEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bucket = (TRUST_COPY as any)[category];
  if (!bucket) {
    throw new Error(`[trust-copy] unknown category: ${category}`);
  }
  const entry = bucket[state as string];
  if (!entry) {
    throw new Error(`[trust-copy] unknown state for ${category}: ${String(state)}`);
  }
  return entry as TrustCopyEntry;
}

export interface FormatLabelOpts {
  /** Append a relative-time suffix when set, e.g. "· 4m ago". */
  verifiedAt?: string | null;
  /** Use short label (for tight chips). */
  short?: boolean;
}

function relTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const ms = Date.now() - t;
  if (ms < 0) return "just now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatTrustLabel<C extends TrustCategory>(
  category: C,
  state: TrustState<C>,
  opts: FormatLabelOpts = {},
): string {
  const entry = getTrustCopy(category, state);
  const base = opts.short ? entry.short : entry.label;
  const rel = relTime(opts.verifiedAt);
  return rel ? `${base} · ${rel}` : base;
}
