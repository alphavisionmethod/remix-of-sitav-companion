// ═══════════════════════════════════════════════════════════════
// SITA OS — Core Truth Contracts: Event Subject Definition
// Defines canonical event subjects for the event bus
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export type EventCategory =
  | "command"
  | "domain-event"
  | "integration-event"
  | "system-event"
  | "audit-event"
  | "lifecycle-event"
  | "proof-event";

export interface EventSubjectDefinition {
  subject: string;
  domain: DomainId;
  category: EventCategory;
  version: string;
  description: string;
  payloadSchema: string;
  emitters: string[];
  consumers: string[];
  retentionDays: number;
  proofRequired: boolean;
  approvalRequired: boolean;
  idempotent: boolean;
  orderedDelivery: boolean;
  maxRetries: number;
  deadLetterSubject?: string;
  tags: string[];
  deprecated: boolean;
  deprecatedBy?: string;
  registeredAt: string;
}

export interface EventSubjectRegistry {
  subjects: EventSubjectDefinition[];
  version: string;
  lastUpdatedAt: string;
  totalSubjects: number;
  domainCoverage: Record<string, number>;
}
