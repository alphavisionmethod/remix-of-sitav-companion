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

import type { RiskTier, TrustPillarId } from "@/platform/trust";

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
  "shared.voice.intent.execute": {
    key: "shared.voice.intent.execute", pillar: "shared",
    label: "Execute voice-extracted intent",
    description: "Run an action proposed by the voice intent extractor through the Trust engine.",
    riskTier: "high", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "shared.embedding.batch": {
    key: "shared.embedding.batch", pillar: "shared",
    label: "Run embedding batch",
    description: "Embed a batch of pending knowledge chunks, memories, or transcripts via the AI gateway.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  // ── Phase 8: Federation + voice→agent bridge + multi-modal ───
  "shared.voice.intent.dispatch": {
    key: "shared.voice.intent.dispatch", pillar: "shared",
    label: "Dispatch voice intent to agent",
    description: "Hand a voice-extracted intent to the Sita agent planner for typed Action Plan execution.",
    riskTier: "high", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "shared.embedding.multimodal": {
    key: "shared.embedding.multimodal", pillar: "shared",
    label: "Embed multi-modal asset",
    description: "Generate embeddings for image/audio/video assets through the AI gateway.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "shared.federation.share": {
    key: "shared.federation.share", pillar: "shared",
    label: "Share workspace data via federation",
    description: "Grant a target workspace access to selected memories or chunks under an active federation.",
    riskTier: "high", requireApproval: true, reversible: true,
    defaultAuthorityLevel: "ask",
  },

  // ── Phase 2 (Business OS Production-Truth Closure):
  // Full CRM mutation coverage. Mirrors the trust_action_catalog seed
  // so use-crm-data.ts can wrap every mutation in emitRegisteredTrustAction. ──
  "crm.contact.update": {
    key: "crm.contact.update", pillar: "business",
    label: "Update CRM contact",
    description: "Mutates an existing contact record (PII write).",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.company.create": {
    key: "crm.company.create", pillar: "business",
    label: "Create CRM company",
    description: "Persists a new company account record.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.company.update": {
    key: "crm.company.update", pillar: "business",
    label: "Update CRM company",
    description: "Mutates an existing company account record.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.company.delete": {
    key: "crm.company.delete", pillar: "business",
    label: "Delete CRM company",
    description: "Permanently removes a company account and severs related links.",
    riskTier: "high", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "crm.opportunity.create": {
    key: "crm.opportunity.create", pillar: "business",
    label: "Create CRM opportunity",
    description: "Creates a new opportunity in the pipeline.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.opportunity.update": {
    key: "crm.opportunity.update", pillar: "business",
    label: "Update CRM opportunity",
    description: "Mutates an existing opportunity record.",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.opportunity.delete": {
    key: "crm.opportunity.delete", pillar: "business",
    label: "Delete CRM opportunity",
    description: "Permanently removes an opportunity from the pipeline.",
    riskTier: "medium", requireApproval: false, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "crm.task.create": {
    key: "crm.task.create", pillar: "business",
    label: "Create CRM task",
    description: "Creates a follow-up task tied to a contact, company, or deal.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.task.update": {
    key: "crm.task.update", pillar: "business",
    label: "Update CRM task",
    description: "Mutates an existing CRM task.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.task.delete": {
    key: "crm.task.delete", pillar: "business",
    label: "Delete CRM task",
    description: "Removes a CRM task from the queue.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.communication.log": {
    key: "crm.communication.log", pillar: "business",
    label: "Log CRM communication",
    description: "Records an outbound or inbound communication on a contact timeline.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.communication.delete": {
    key: "crm.communication.delete", pillar: "business",
    label: "Delete CRM communication",
    description: "Removes a logged communication entry.",
    riskTier: "medium", requireApproval: false, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "crm.note.create": {
    key: "crm.note.create", pillar: "business",
    label: "Create CRM note",
    description: "Adds a note to a contact, company, or deal record.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.note.update": {
    key: "crm.note.update", pillar: "business",
    label: "Update CRM note",
    description: "Edits an existing CRM note.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.note.delete": {
    key: "crm.note.delete", pillar: "business",
    label: "Delete CRM note",
    description: "Removes a CRM note.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.pipeline_stage.create": {
    key: "crm.pipeline_stage.create", pillar: "business",
    label: "Create pipeline stage",
    description: "Adds a new stage to the deal pipeline (config write).",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "ask",
  },
  "crm.pipeline_stage.update": {
    key: "crm.pipeline_stage.update", pillar: "business",
    label: "Update pipeline stage",
    description: "Mutates an existing pipeline stage definition.",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "ask",
  },
  "crm.pipeline_stage.delete": {
    key: "crm.pipeline_stage.delete", pillar: "business",
    label: "Delete pipeline stage",
    description: "Removes a pipeline stage; affects deal placement.",
    riskTier: "high", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "crm.segment.create": {
    key: "crm.segment.create", pillar: "business",
    label: "Create CRM segment",
    description: "Defines a new audience segment.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.segment.update": {
    key: "crm.segment.update", pillar: "business",
    label: "Update CRM segment",
    description: "Edits an existing audience segment definition.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.segment.delete": {
    key: "crm.segment.delete", pillar: "business",
    label: "Delete CRM segment",
    description: "Removes an audience segment.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.tag.create": {
    key: "crm.tag.create", pillar: "business",
    label: "Create CRM tag",
    description: "Creates a new label/tag in the CRM.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.tag.delete": {
    key: "crm.tag.delete", pillar: "business",
    label: "Delete CRM tag",
    description: "Removes a CRM tag from the catalog.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.import_job.create": {
    key: "crm.import_job.create", pillar: "business",
    label: "Start CRM import job",
    description: "Queues a CRM import job for processing.",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "ask",
  },
  "crm.import_job.update": {
    key: "crm.import_job.update", pillar: "business",
    label: "Update CRM import job",
    description: "Mutates the state of a queued or running CRM import job.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.merge.execute": {
    key: "crm.merge.execute", pillar: "business",
    label: "Execute CRM merge",
    description: "Merges duplicate CRM records and writes a merge log.",
    riskTier: "high", requireApproval: true, reversible: false,
    defaultAuthorityLevel: "ask",
  },
  "crm.contact_company_link.create": {
    key: "crm.contact_company_link.create", pillar: "business",
    label: "Link contact to company",
    description: "Associates a contact with a company.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.contact_company_link.delete": {
    key: "crm.contact_company_link.delete", pillar: "business",
    label: "Unlink contact from company",
    description: "Severs a contact↔company association.",
    riskTier: "low", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "pre_approved",
  },
  "crm.automation.create": {
    key: "crm.automation.create", pillar: "business",
    label: "Create CRM automation",
    description: "Defines a new CRM automation rule.",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "ask",
  },
  "crm.automation.update": {
    key: "crm.automation.update", pillar: "business",
    label: "Update CRM automation",
    description: "Mutates an existing CRM automation rule.",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "ask",
  },
  "crm.automation.delete": {
    key: "crm.automation.delete", pillar: "business",
    label: "Delete CRM automation",
    description: "Removes a CRM automation rule.",
    riskTier: "medium", requireApproval: false, reversible: true,
    defaultAuthorityLevel: "ask",
  },
} as const satisfies Record<string, TrustActionPreset>;

export type TrustActionKey = keyof typeof TRUST_ACTION_REGISTRY;

export function getTrustActionPreset(key: TrustActionKey): TrustActionPreset {
  return TRUST_ACTION_REGISTRY[key];
}

export const TRUST_ACTION_LIST: readonly TrustActionPreset[] =
  Object.values(TRUST_ACTION_REGISTRY);