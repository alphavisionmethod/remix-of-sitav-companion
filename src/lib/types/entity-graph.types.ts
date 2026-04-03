// ═══════════════════════════════════════════════════════════════
// SITA OS — Entity, Identity, Role, Household, Org Graph
// Canonical identity and relationship model for a trust-bearing OS
// ═══════════════════════════════════════════════════════════════

// ── Entity Types ────────────────────────────────────────────────
export type EntityType = "person" | "household" | "organization" | "device" | "advisor" | "service";

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  trustScore: number;
  active: boolean;
}

// ── Person ──────────────────────────────────────────────────────
export interface PersonEntity extends Entity {
  type: "person";
  email: string;
  phone?: string;
  householdIds: string[];
  orgIds: string[];
  deviceIds: string[];
  roles: RoleAssignment[];
  delegations: DelegatedAuthority[];
  preferences: PersonPreferences;
}

export interface PersonPreferences {
  timezone: string;
  locale: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  notificationLevel: "all" | "important" | "critical" | "none";
  aggressivenessLevel: "conservative" | "balanced" | "aggressive";
  communicationTone: "formal" | "friendly" | "minimal";
}

// ── Household ───────────────────────────────────────────────────
export interface HouseholdEntity extends Entity {
  type: "household";
  members: HouseholdMember[];
  sharedPolicies: string[];
  sharedMemoryScope: string;
  financialVisibility: "full" | "summary" | "none";
}

export interface HouseholdMember {
  personId: string;
  role: HouseholdRole;
  joinedAt: string;
  permissions: HouseholdPermission[];
}

export type HouseholdRole = "owner" | "spouse" | "partner" | "parent" | "child" | "guardian" | "assistant" | "operator";

export type HouseholdPermission =
  | "view_finances"
  | "approve_spending"
  | "manage_calendar"
  | "manage_vendors"
  | "manage_school"
  | "manage_travel"
  | "view_business"
  | "full_access";

// ── Organization ────────────────────────────────────────────────
export interface OrgEntity extends Entity {
  type: "organization";
  members: OrgMember[];
  departments: string[];
  policies: string[];
  tier: "starter" | "professional" | "enterprise";
  complianceLevel: "standard" | "regulated" | "high_trust";
}

export interface OrgMember {
  personId: string;
  role: OrgRole;
  department?: string;
  joinedAt: string;
  permissions: OrgPermission[];
}

export type OrgRole = "owner" | "admin" | "operator" | "member" | "viewer" | "auditor";

export type OrgPermission =
  | "manage_users"
  | "manage_billing"
  | "manage_connectors"
  | "manage_policies"
  | "view_analytics"
  | "manage_releases"
  | "manage_advisors"
  | "approve_actions"
  | "view_audit"
  | "full_access";

// ── Role Assignment ─────────────────────────────────────────────
export interface RoleAssignment {
  id: string;
  entityId: string;
  contextType: "household" | "org" | "global";
  contextId: string;
  role: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  revoked: boolean;
  revokedAt?: string;
  revokedBy?: string;
}

// ── Delegated Authority ─────────────────────────────────────────
export interface DelegatedAuthority {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  scope: DelegationScope;
  domains: string[];
  maxAmount?: number;
  currency?: string;
  validFrom: string;
  validUntil?: string;
  requiresProof: boolean;
  revocable: boolean;
  revoked: boolean;
  usageCount: number;
  maxUsages?: number;
}

export interface DelegationScope {
  actions: ("view" | "draft" | "approve" | "execute" | "manage")[];
  visibility: "full" | "summary" | "redacted";
  escalationAllowed: boolean;
  subDelegationAllowed: boolean;
}

// ── Visibility Boundary ─────────────────────────────────────────
export interface VisibilityBoundary {
  entityId: string;
  resourceType: string;
  resourceId: string;
  visibility: "private" | "household" | "org" | "delegated";
  allowedEntities: string[];
  deniedEntities: string[];
  inheritFromParent: boolean;
}

// ── Device Entity ───────────────────────────────────────────────
export interface DeviceEntity extends Entity {
  type: "device";
  ownerId: string;
  deviceType: "phone" | "tablet" | "desktop" | "watch" | "hub" | "kiosk";
  trustLevel: "trusted" | "verified" | "unknown" | "revoked";
  lastSeen: string;
  canSign: boolean;
  canApprove: boolean;
  capabilities: string[];
}

// ── Relationship Edge ───────────────────────────────────────────
export interface RelationshipEdge {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: RelationshipType;
  strength: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  active: boolean;
}

export type RelationshipType =
  | "member_of"
  | "owns"
  | "manages"
  | "delegates_to"
  | "reports_to"
  | "advises"
  | "depends_on"
  | "shares_with"
  | "trusts"
  | "vendor_of"
  | "customer_of";

// ── Permission Query ────────────────────────────────────────────
export interface PermissionQuery {
  actorId: string;
  action: "view" | "draft" | "approve" | "execute" | "manage" | "delete";
  resourceType: string;
  resourceId: string;
  domain: string;
  amount?: number;
  deviceId?: string;
}

export interface PermissionResult {
  allowed: boolean;
  reason: string;
  requiredApprovals?: string[];
  policyChain: string[];
  delegationChain?: string[];
  trustRequirement: "none" | "low" | "medium" | "high";
}
