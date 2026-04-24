// ═══════════════════════════════════════════════════════════════
// SITA OS — External skill packs (Phase G)
// ═══════════════════════════════════════════════════════════════
// Calendar / Email / Slack / Banking — typed skill bindings that
// route to the kernel under "external.*" capability ids. Risk +
// approval defaults are conservative; real execution is gated by
// the user's connector permissions and autonomy tier.
// ═══════════════════════════════════════════════════════════════

import type { SitaSkillDef } from "../skill-registry";

export const EXTERNAL_SKILLS: SitaSkillDef[] = [
  // ── Calendar ──────────────────────────────────────────────────
  {
    id: "external.calendar.create_event",
    domain: "concierge",
    capabilityId: "external.calendar.create_event",
    label: "Create calendar event",
    description: "Add an event to the connected calendar.",
    risk: "low",
    reversible: true,
    requiresApproval: false,
    paramHints: { title: "string", starts_at: "iso", ends_at: "iso", attendees: "string[]?" },
  },
  {
    id: "external.calendar.move_event",
    domain: "concierge",
    capabilityId: "external.calendar.move_event",
    label: "Move calendar event",
    description: "Reschedule an existing event.",
    risk: "medium",
    reversible: true,
    requiresApproval: true,
    paramHints: { event_id: "string", new_starts_at: "iso" },
  },

  // ── Email ─────────────────────────────────────────────────────
  {
    id: "external.email.draft",
    domain: "concierge",
    capabilityId: "external.email.draft",
    label: "Draft email",
    description: "Create a draft (does not send).",
    risk: "low",
    reversible: true,
    requiresApproval: false,
    paramHints: { to: "string", subject: "string", body: "markdown" },
  },
  {
    id: "external.email.send",
    domain: "concierge",
    capabilityId: "external.email.send",
    label: "Send email",
    description: "Send an email through the connected mailbox.",
    risk: "high",
    reversible: false,
    requiresApproval: true,
    paramHints: { to: "string", subject: "string", body: "markdown" },
  },

  // ── Slack / Teams ─────────────────────────────────────────────
  {
    id: "external.slack.post_message",
    domain: "business",
    capabilityId: "external.slack.post_message",
    label: "Post Slack message",
    description: "Post a message to a Slack channel or DM.",
    risk: "medium",
    reversible: false,
    requiresApproval: true,
    paramHints: { channel: "string", text: "markdown" },
  },

  // ── Banking (read + safe writes) ──────────────────────────────
  {
    id: "external.banking.read_balance",
    domain: "finance",
    capabilityId: "external.banking.read_balance",
    label: "Read account balance",
    description: "Fetch current balance for a connected account.",
    risk: "low",
    reversible: true,
    requiresApproval: false,
    paramHints: { account_id: "string" },
  },
  {
    id: "external.banking.schedule_payment",
    domain: "finance",
    capabilityId: "external.banking.schedule_payment",
    label: "Schedule payment",
    description: "Schedule (not execute) a payment for review.",
    risk: "high",
    reversible: true,
    requiresApproval: true,
    paramHints: { from_account: "string", to_payee: "string", amount: "number", currency: "string", scheduled_at: "iso" },
  },
];