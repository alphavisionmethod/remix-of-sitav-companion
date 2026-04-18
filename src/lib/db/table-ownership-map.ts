// ═══════════════════════════════════════════════════════════════
// SITA OS — Table Ownership Map
// Maps each table to owning domain/team
// ═══════════════════════════════════════════════════════════════

import type { DbDomain } from "./schema-registry";

export type OwnershipTeam =
  | "platform-engineering"
  | "admin-governance"
  | "advisor-team"
  | "ai-engineering"
  | "cloud-team"
  | "connector-team"
  | "finance-team"
  | "notification-team"
  | "os-kernel-team"
  | "compliance-team"
  | "ux-team"
  | "crm-team";

export const DOMAIN_TO_OWNER: Record<DbDomain, OwnershipTeam> = {
  "auth-identity": "platform-engineering",
  "admin-governance": "admin-governance",
  "advisor-intelligence": "advisor-team",
  "ai-workforce": "ai-engineering",
  "boardroom": "advisor-team",
  "business-crm": "crm-team",
  "cloud-infrastructure": "cloud-team",
  "connector-fabric": "connector-team",
  "finance": "finance-team",
  "notification": "notification-team",
  "os-kernel": "os-kernel-team",
  "platform-core": "platform-engineering",
  "compliance": "compliance-team",
  "user-experience": "ux-team",
};

export function getOwnerForDomain(domain: DbDomain): OwnershipTeam {
  return DOMAIN_TO_OWNER[domain];
}

export function getDomainsByOwner(owner: OwnershipTeam): DbDomain[] {
  return (Object.entries(DOMAIN_TO_OWNER) as [DbDomain, OwnershipTeam][])
    .filter(([, o]) => o === owner)
    .map(([d]) => d);
}
