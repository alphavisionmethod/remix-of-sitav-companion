// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph: Organization & Relationship Contracts
// Migrated from root organization-contracts.ts into graph family
// Canonical owner: graph/
// ═══════════════════════════════════════════════════════════════

export type EntityRelationType =
  | "member-of"
  | "reports-to"
  | "guardian-of"
  | "spouse-of"
  | "parent-of"
  | "caregiver-for"
  | "operator-of"
  | "shares-finance-with"
  | "shares-schedule-with"
  | "delegates-to";

export interface OrganizationNode {
  id: string;
  type: "user" | "household" | "business" | "team" | "department";
  name: string;
  ownerId: string;
  parentId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface EntityRelationship {
  id: string;
  fromEntityId: string;
  fromEntityType: string;
  toEntityId: string;
  toEntityType: string;
  relationType: EntityRelationType;
  permissions: EntityPermission[];
  active: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface EntityPermission {
  scope: string;
  level: "view" | "edit" | "admin" | "none";
  inherited: boolean;
  source: string;
}

export interface DelegatedAuthority {
  id: string;
  delegatorId: string;
  delegateeId: string;
  scope: string[];
  constraints: DelegationConstraint[];
  active: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface DelegationConstraint {
  type: "amount-limit" | "time-window" | "domain-restriction" | "approval-required";
  value: string | number;
  description: string;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  entityId: string;
  entityType: string;
  role: string;
  permissions: EntityPermission[];
  assignedBy: string;
  assignedAt: string;
  revokedAt?: string;
}

export interface VisibilityRule {
  entityId: string;
  dataCategory: string;
  visibleTo: string[];
  hiddenFrom: string[];
  privacyLevel: "public" | "household" | "private" | "restricted";
}