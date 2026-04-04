// ═══════════════════════════════════════════════════════════════
// SITA OS — Core Truth Contracts: Tenant Context
// ═══════════════════════════════════════════════════════════════

import type { UserRole } from "../_contract-scaffold";

export interface TenantContext {
  tenantId: string;
  userId: string;
  householdId?: string;
  orgId?: string;
  role: UserRole;
  permissions: string[];
}
