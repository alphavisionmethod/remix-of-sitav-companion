// ═══════════════════════════════════════════════════════════════
// SITA OS — Entity, Identity, Role, Household, Org Graph
// Canonical identity and relationship model for a trust-bearing OS
// ═══════════════════════════════════════════════════════════════

// ── Entity Types ────────────────────────────────────────────────
export type EntityType = "person" | "household" | "organization" | "legal_entity" | "team" | "device" | "advisor" | "service" | "connector_account" | "shared_space" | "boardroom_context";

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
  roles: GraphRoleAssignment[];
  delegations: GraphDelegatedAuthority[];
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
  members: GraphHouseholdMember[];
  sharedPolicies: string[];
  sharedMemoryScope: string;
  financialVisibility: "full" | "summary" | "none";
}

export interface GraphHouseholdMember {
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
export interface GraphRoleAssignment {
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
export interface GraphDelegatedAuthority {
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
  | "belongs_to"
  | "owns"
  | "can_view"
  | "can_approve"
  | "can_execute"
  | "delegated_by"
  | "delegated_to"
  | "shared_with"
  | "private_to"
  | "guardian_of"
  | "manager_of"
  | "operator_for"
  | "member_of"
  | "signer_for"
  | "trusted_device_for"
  | "manages"
  | "reports_to"
  | "advises"
  | "depends_on"
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
