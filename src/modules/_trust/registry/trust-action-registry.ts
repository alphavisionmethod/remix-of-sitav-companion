// ════════════════════════════════════════════════════════════
// SITA OS — Trust Action Registry (Phase 5)
// Declarative catalog of high-value mutations that MUST flow
// through the Trust layer. Pillars import preset configs from
// here instead of re-declaring riskTier / approval rules per
// call site. The Trust Center can render this registry as a
// "What requires approval?" reference.
// ════════════════════════════════════════════════════════════

import type { RiskTier, TrustPillarId } from "@/modules/_trust";

export interface TrustActionPreset {
  readonly key: string;
  readonly pillar: TrustPillarId;
  readonly label: string;
  readonly description: string;
  readonly riskTier: RiskTier;
  readonly requireApproval: boolean;
  readonly reversible: boolean;
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
  },
} as const satisfies Record<string, TrustActionPreset>;

export type TrustActionKey = keyof typeof TRUST_ACTION_REGISTRY;

export function getTrustActionPreset(key: TrustActionKey): TrustActionPreset {
  return TRUST_ACTION_REGISTRY[key];
}

export const TRUST_ACTION_LIST: readonly TrustActionPreset[] =
  Object.values(TRUST_ACTION_REGISTRY);