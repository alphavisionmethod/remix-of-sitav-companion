// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Contracts: Registry Entry
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export interface AdvisorRegistryEntry {
  advisorId: string;
  name: string;
  domain: DomainId;
  specialization: string;
  capabilities: string[];
  trustScore: number;
  isActive: boolean;
  modelId?: string;
  version: string;
  maxConcurrentSessions: number;
  costPerInvocationCents: number;
  tags: string[];
}
