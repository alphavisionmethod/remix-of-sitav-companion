// ════════════════════════════════════════════════════════════
// SITA OS — Trust Action Registry (Phase 5 → expanded in Phase 2)
// Declarative catalog of high-value mutations that MUST flow
// through the Trust layer. Pillars import preset configs from
// here instead of re-declaring riskTier / approval rules per
// call site. The Trust Center can render this registry as a
// "What requires approval?" reference.
//
// Phase 2 Authority engine: each entry now also declares a
// `defaultAuthorityLevel` matching the DB-side trust_action_catalog
// seed so the in-code registry stays a faithful local mirror.
// ════════════════════════════════════════════════════════════

import type { RiskTier, TrustPillarId } from "@/modules/_trust";

export type AuthorityLevel = "suggest" | "ask" | "pre_approved" | "blocked";

export interface TrustActionPreset {
  readonly key: string;
  readonly pillar: TrustPillarId;
  readonly label: string;
  readonly description: string;
  readonly riskTier: RiskTier;
  readonly requireApproval: boolean;
  readonly reversible: boolean;
  readonly defaultAuthorityLevel: AuthorityLevel;
}

export const TRUST_ACTION_REGISTRY = {
  /** Business OS — create a new CRM contact (PII write). */
  "crm.contact.create": {
    key: "crm.contact.create",
    pillar: "business",
    label: "Create CRM contact",
    description: "Persists a new contact record with PII to the CRM store.",
    riskTier: "low",
    requireApproval: false,
    reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  /** Business OS — move a deal across pipeline stages (revenue impact). */
  "crm.deal.stage_change": {
    key: "crm.deal.stage_change",
    pillar: "business",
    label: "Change deal stage",
    description: "Mutates pipeline stage and forecast surface.",
    riskTier: "medium",
    requireApproval: false,
    reversible: true,
    defaultAuthorityLevel: "ask",
  },
  /** Finance OS — schedule an outbound payment (financial irreversible). */
  "finance.payment.schedule": {
    key: "finance.payment.schedule",
    pillar: "finance",
    label: "Schedule payment",
    description: "Queues a future-dated outbound payment from an owner-controlled account.",
    riskTier: "high",
    requireApproval: true,
    reversible: false,
    defaultAuthorityLevel: "ask",
  },
  /** Concierge OS — assign a household task (cross-member coordination). */
  "concierge.household_task.assign": {
    key: "concierge.household_task.assign",
    pillar: "concierge",
    label: "Assign household task",
    description: "Assigns or reassigns a household task to a member.",
    riskTier: "low",
    requireApproval: false,
    reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  /** Concierge OS — confirm a travel booking (financial + logistical). */
  "concierge.travel.booking_confirm": {
    key: "concierge.travel.booking_confirm",
    pillar: "concierge",
    label: "Confirm travel booking",
    description: "Confirms a flight, lodging, or transport reservation against a vendor.",
    riskTier: "high",
    requireApproval: true,
    reversible: false,
    defaultAuthorityLevel: "ask",
  },
  /** Shared — engage the global autonomy kill-switch (system-wide halt). */
  "shared.autonomy.kill_switch_engage": {
    key: "shared.autonomy.kill_switch_engage",
    pillar: "shared",
    label: "Engage autonomy kill-switch",
    description:
      "Halts every advisor controller, standing mission, and queue execution at the next state check.",
    riskTier: "critical",
    requireApproval: false,
    reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  /** Shared — release the kill-switch and resume autonomous execution. */
  "shared.autonomy.kill_switch_release": {
    key: "shared.autonomy.kill_switch_release",
    pillar: "shared",
    label: "Release autonomy kill-switch",
    description: "Resumes advisor controllers and standing missions after a halt.",
    riskTier: "high",
    requireApproval: false,
    reversible: true,
    defaultAuthorityLevel: "ask",
  },
  /** Shared — escalate a support case to a higher tier. */
  "shared.support.case_escalate": {
    key: "shared.support.case_escalate",
    pillar: "shared",
    label: "Escalate support case",
    description: "Routes a support case to a higher tier or specialist role.",
    riskTier: "medium",
    requireApproval: false,
    reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  /** Business — bulk import contacts from CSV (PII write at scale). */
  "business.crm.contact_bulk_import": {
    key: "business.crm.contact_bulk_import",
    pillar: "business",
    label: "Bulk import contacts",
    description: "Persists many contact records at once from an external CSV source.",
    riskTier: "medium",
    requireApproval: false,
    reversible: true,
    defaultAuthorityLevel: "ask",
  },
  /** Finance — change a household money envelope allocation (budget impact). */
  "finance.envelope.allocation_change": {
    key: "finance.envelope.allocation_change",
    pillar: "finance",
    label: "Change envelope allocation",
    description: "Reallocates funds between household money envelopes.",
    riskTier: "medium",
    requireApproval: false,
    reversible: true,
    defaultAuthorityLevel: "ask",
  },

  // ── Phase 2 expansion: 24 additional actions ─────────────
  "business.invoice.send": {
    key: "business.invoice.send", pillar: "business",
    label: "Send invoice",
    description: "Dispatches an invoice to a customer email.",
    riskTier: "medium", requireApproval: false, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "business.crm.contact_delete": {
    key: "business.crm.contact_delete", pillar: "business",
    label: "Delete CRM contact",
    description: "Permanently removes a contact and associated PII.",
    riskTier: "high", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "business.email.campaign_send": {
    key: "business.email.campaign_send", pillar: "business",
    label: "Send email campaign",
    description: "Sends a bulk email campaign to a contact segment.",
    riskTier: "high", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "business.calendar.external_invite": {
    key: "business.calendar.external_invite", pillar: "business",
    label: "Send external calendar invite",
    description: "Creates an external-facing calendar invitation.",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "ask",
  },
  "finance.transfer.execute": {
    key: "finance.transfer.execute", pillar: "finance",
    label: "Execute transfer",
    description: "Moves funds between accounts.",
    riskTier: "critical", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "blocked",
  },
  "finance.budget.adjust": {
    key: "finance.budget.adjust", pillar: "finance",
    label: "Adjust budget",
    description: "Modifies a budget category limit.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "finance.investment.buy": {
    key: "finance.investment.buy", pillar: "finance",
    label: "Place buy order",
    description: "Submits a buy order to a brokerage.",
    riskTier: "critical", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "blocked",
  },
  "finance.investment.sell": {
    key: "finance.investment.sell", pillar: "finance",
    label: "Place sell order",
    description: "Submits a sell order to a brokerage.",
    riskTier: "critical", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "blocked",
  },
  "finance.recurring.cancel": {
    key: "finance.recurring.cancel", pillar: "finance",
    label: "Cancel recurring payment",
    description: "Stops a recurring outbound payment.",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "ask",
  },
  "concierge.gift.purchase": {
    key: "concierge.gift.purchase", pillar: "concierge",
    label: "Purchase gift",
    description: "Buys a gift on behalf of the user.",
    riskTier: "high", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "concierge.reservation.cancel": {
    key: "concierge.reservation.cancel", pillar: "concierge",
    label: "Cancel reservation",
    description: "Cancels a confirmed reservation.",
    riskTier: "medium", requireApproval: false, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "concierge.contact.message": {
    key: "concierge.contact.message", pillar: "concierge",
    label: "Send message to contact",
    description: "Sends a message to an external contact.",
    riskTier: "medium", requireApproval: false, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "health.profile.update": {
    key: "health.profile.update", pillar: "health",
    label: "Update health profile",
    description: "Modifies the user's sensitive health profile.",
    riskTier: "high", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "ask",
  },
  "health.metric.log": {
    key: "health.metric.log", pillar: "health",
    label: "Log health metric",
    description: "Records a health metric (weight, BP, etc.).",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "health.record.share": {
    key: "health.record.share", pillar: "health",
    label: "Share health record",
    description: "Shares a health record with a third party.",
    riskTier: "critical", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "blocked",
  },
  "health.appointment.book": {
    key: "health.appointment.book", pillar: "health",
    label: "Book health appointment",
    description: "Books a medical appointment with a provider.",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "ask",
  },
  "health.medication.log": {
    key: "health.medication.log", pillar: "health",
    label: "Log medication",
    description: "Records a medication intake event.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "health.wearable.connect": {
    key: "health.wearable.connect", pillar: "health",
    label: "Connect wearable device",
    description: "Authorize a wearable provider and store credentials.",
    riskTier: "high", requireApproval: true, reversible: true,
    defaultAuthorityLevel: "ask",
  },
  "health.wearable.sync": {
    key: "health.wearable.sync", pillar: "health",
    label: "Sync wearable data",
    description: "Pull metrics from a connected wearable provider.",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "health.wearable.revoke": {
    key: "health.wearable.revoke", pillar: "health",
    label: "Revoke wearable",
    description: "Disconnect a wearable provider and purge tokens.",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "health.appointment.cancel": {
    key: "health.appointment.cancel", pillar: "health",
    label: "Cancel appointment",
    description: "Cancel a scheduled clinician appointment.",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "ask",
  },
  "health.reminder.create": {
    key: "health.reminder.create", pillar: "health",
    label: "Create health reminder",
    description: "Schedule a medication or check-in reminder.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "shared.memory.delete": {
    key: "shared.memory.delete", pillar: "shared",
    label: "Delete memory",
    description: "Permanently removes a memory entry.",
    riskTier: "medium", requireApproval: false, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "shared.memory.add": {
    key: "shared.memory.add", pillar: "shared",
    label: "Add memory",
    description: "Saves a new memory entry.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "shared.workspace.delete": {
    key: "shared.workspace.delete", pillar: "shared",
    label: "Delete workspace",
    description: "Removes a workspace and its scoped data.",
    riskTier: "critical", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "shared.workspace.create": {
    key: "shared.workspace.create", pillar: "shared",
    label: "Create workspace",
    description: "Creates a new workspace.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "shared.file.delete": {
    key: "shared.file.delete", pillar: "shared",
    label: "Delete file",
    description: "Permanently deletes a file from storage.",
    riskTier: "medium", requireApproval: false, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "shared.notification.send": {
    key: "shared.notification.send", pillar: "shared",
    label: "Send notification",
    description: "Sends a notification to the user.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "shared.session.revoke": {
    key: "shared.session.revoke", pillar: "shared",
    label: "Revoke session",
    description: "Terminates an active device session.",
    riskTier: "high", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "ask",
  },
  // ── Phase 5: Knowledge spine ─────────────────────────────────
  "shared.memory.create": {
    key: "shared.memory.create", pillar: "shared",
    label: "Create memory",
    description: "Persist a new memory entry for the user.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "shared.memory.update": {
    key: "shared.memory.update", pillar: "shared",
    label: "Update memory",
    description: "Edit an existing memory entry.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "shared.file.upload": {
    key: "shared.file.upload", pillar: "shared",
    label: "Upload file",
    description: "Upload a new file to user storage.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "shared.knowledge.reindex": {
    key: "shared.knowledge.reindex", pillar: "shared",
    label: "Re-index knowledge file",
    description: "Re-extract and re-chunk a file in the knowledge spine.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "shared.voice.session.start": {
    key: "shared.voice.session.start", pillar: "shared",
    label: "Start voice session",
    description: "Begin a voice dictation/conversation session and stream transcripts to the spine.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
} as const satisfies Record<string, TrustActionPreset>;

export type TrustActionKey = keyof typeof TRUST_ACTION_REGISTRY;

export function getTrustActionPreset(key: TrustActionKey): TrustActionPreset {
  return TRUST_ACTION_REGISTRY[key];
}

export const TRUST_ACTION_LIST: readonly TrustActionPreset[] =
  Object.values(TRUST_ACTION_REGISTRY);