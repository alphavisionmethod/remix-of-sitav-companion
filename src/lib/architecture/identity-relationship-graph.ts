// ═══════════════════════════════════════════════════════════════
// SITA OS — Identity, Role & Relationship Graph Schema
// Full authority model: principals, households, orgs, delegation,
// device trust, permissions, inheritance, revocation.
// ═══════════════════════════════════════════════════════════════

// ── Principal Types ─────────────────────────────────────────

export type PrincipalType =
  | "person"
  | "household"
  | "organization"
  | "team"
  | "assistant"
  | "service-account"
  | "device"
  | "advisor-actor"
  | "executor-actor";

export interface Principal {
  principalId: string;
  type: PrincipalType;
  tenantId: string;
  displayName: string;
  active: boolean;
  createdAt: string;
  deactivatedAt?: string;
  metadata: Record<string, unknown>;
}

// ── Roles ───────────────────────────────────────────────────

export interface RoleTemplate {
  roleId: string;
  name: string;
  description: string;
  permissions: Permission[];
  inheritsFrom: string[];        // parent role IDs
  tenantScoped: boolean;
  maxDelegationDepth: number;    // how many times this role can be re-delegated
}

export interface RoleAssignment {
  assignmentId: string;
  principalId: string;
  roleId: string;
  tenantId: string;
  scope: string[];               // narrowing scope, e.g., ["finance-os", "investment-office"]
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  revocable: boolean;
  revokedAt?: string;
  revokedBy?: string;
  revokedReason?: string;
}

// ── Permissions ─────────────────────────────────────────────

export type PermissionAction =
  | "view" | "create" | "update" | "delete"
  | "approve" | "execute" | "delegate"
  | "transfer" | "export" | "configure";

export interface Permission {
  permissionId: string;
  resource: string;              // e.g., "finance-os.investment-office.portfolio"
  action: PermissionAction;
  conditions: PermissionCondition[];
}

export interface PermissionCondition {
  type: "amount-limit" | "time-window" | "device-trust" | "identity-assurance" | "approval-required" | "scope-limit";
  value: string;
}

// ── Delegation ──────────────────────────────────────────────

export interface DelegatedAuthority {
  delegationId: string;
  delegatorId: string;           // who is granting
  delegateeId: string;           // who is receiving
  tenantId: string;
  scope: string[];               // what is delegated
  permissions: PermissionAction[];
  constraints: {
    maxAmountCents?: number;
    allowedDomains: string[];
    requiresApprovalAbove?: number;
    timeBounded: boolean;
    expiresAt?: string;
  };
  depth: number;                 // delegation chain depth
  maxRedelegations: number;
  canRedelegate: boolean;
  grantedAt: string;
  revokedAt?: string;
  revokedBy?: string;
  proofId?: string;              // proof of delegation grant
}

// ── Household & Organization ────────────────────────────────

export interface HouseholdGraph {
  householdId: string;
  tenantId: string;
  members: HouseholdMember[];
  sharedAssets: string[];
  privateAssetBoundaries: Record<string, string[]>; // memberId -> private asset IDs
  createdAt: string;
}

export interface HouseholdMember {
  principalId: string;
  role: "owner" | "spouse" | "partner" | "child" | "parent" | "extended" | "assistant";
  authorityLevel: "full" | "operational" | "view-only" | "request-only";
  financialAuthority: {
    canView: boolean;
    canTransact: boolean;
    maxTransactionCents?: number;
    canApprove: boolean;
    maxApprovalCents?: number;
  };
  joinedAt: string;
}

export interface OrganizationGraph {
  orgId: string;
  tenantId: string;
  name: string;
  members: OrgMember[];
  teams: OrgTeam[];
  legalAuthority: Record<string, string>;  // e.g., { "financial-signoff": "cfo-principal-id" }
  createdAt: string;
}

export interface OrgMember {
  principalId: string;
  role: string;
  department?: string;
  reportsTo?: string;
  authorityLevel: "executive" | "manager" | "member" | "contractor" | "viewer";
  joinedAt: string;
}

export interface OrgTeam {
  teamId: string;
  name: string;
  leadId: string;
  memberIds: string[];
}

// ── Device Trust ────────────────────────────────────────────

export interface DeviceTrustRecord {
  deviceId: string;
  principalId: string;
  tenantId: string;
  deviceName: string;
  trustLevel: "untrusted" | "recognized" | "trusted" | "hardware-attested";
  capabilities: ("biometric" | "secure-enclave" | "pin" | "nfc" | "bluetooth")[];
  lastVerifiedAt: string;
  registeredAt: string;
  revokedAt?: string;
  approvalCapability: boolean;   // can this device approve actions?
  localExecutionAllowed: boolean;
}

// ── Relationship Edges ──────────────────────────────────────

export type RelationshipType =
  | "member-of"
  | "reports-to"
  | "delegates-to"
  | "owns-device"
  | "shared-asset"
  | "private-boundary"
  | "legal-authority"
  | "financial-authority"
  | "advisor-for"
  | "guardian-of"
  | "trustee-of";

export interface RelationshipEdge {
  edgeId: string;
  fromPrincipalId: string;
  toPrincipalId: string;
  type: RelationshipType;
  tenantId: string;
  bidirectional: boolean;
  permissions: PermissionAction[];
  constraints: Record<string, unknown>;
  validFrom: string;
  validUntil?: string;
  revokedAt?: string;
  createdAt: string;
}

// ── Permission Resolution ───────────────────────────────────

export interface PermissionQuery {
  actorId: string;
  resource: string;
  action: PermissionAction;
  tenantId: string;
  context: {
    amountCents?: number;
    deviceId?: string;
    identityAssurance?: "basic" | "elevated" | "strong";
    timestamp: string;
  };
}

export interface PermissionResolution {
  queryId: string;
  allowed: boolean;
  reason: string;
  resolvedVia: "direct-role" | "inherited-role" | "delegation" | "household" | "org";
  roleChain: string[];           // role IDs in resolution path
  delegationChain: string[];     // delegation IDs if resolved via delegation
  conditionsMet: boolean;
  failedConditions: string[];
}

// ── Revocation ──────────────────────────────────────────────

export interface RevocationEvent {
  revocationId: string;
  targetType: "role-assignment" | "delegation" | "device" | "relationship";
  targetId: string;
  revokedBy: string;
  reason: string;
  cascading: boolean;            // propagate to downstream delegations
  affectedPrincipals: string[];
  revokedAt: string;
  proofId?: string;
}

export function cascadeRevocation(
  delegation: DelegatedAuthority,
  allDelegations: DelegatedAuthority[],
): string[] {
  // Find all downstream delegations that depend on this one
  const affected: string[] = [delegation.delegationId];
  const downstream = allDelegations.filter(
    d => d.delegatorId === delegation.delegateeId && d.scope.some(s => delegation.scope.includes(s)),
  );
  for (const d of downstream) {
    affected.push(...cascadeRevocation(d, allDelegations));
  }
  return affected;
}
