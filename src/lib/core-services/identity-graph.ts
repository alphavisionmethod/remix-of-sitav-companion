// ═══════════════════════════════════════════════════════════════
// SITA OS — Identity Service + Household-Org Graph
// Entity nodes, relationships, permission inheritance, delegations
// ═══════════════════════════════════════════════════════════════

export type EntityType = "individual" | "household" | "org" | "team";
export type VerificationState = "unverified" | "email_verified" | "identity_verified" | "fully_verified";
export type RelationshipType =
  | "spouse" | "sibling" | "friend" | "parent" | "child" | "guardian"
  | "employee" | "manager" | "team_member" | "delegate"
  | "advisor" | "beneficiary";

export type VisibilityScope = "private" | "household-shared" | "org-shared" | "public";

export type IdentityRole =
  | "user" | "household_member" | "household_admin"
  | "business_admin" | "finance_officer" | "advisor" | "delegate";

export interface IdentityRecord {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  roles: IdentityRole[];
  verificationState: VerificationState;
  delegations: Delegation[];
  active: boolean;
  createdAt: number;
  lastLoginAt?: number;
}

export interface Delegation {
  id: string;
  fromUserId: string;
  toUserId: string;
  permissions: string[];
  maxDepth: number;
  expiresAt?: number;
  active: boolean;
}

export interface EntityNode {
  id: string;
  type: EntityType;
  name: string;
  metadata: Record<string, unknown>;
  active: boolean;
  createdAt: number;
}

export interface Relationship {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: RelationshipType;
  permissions: string[];
  visibility: VisibilityScope;
  maxDelegationDepth: number;
  inheritable: boolean;
  active: boolean;
}

// ── Permission Inheritance Table ────────────────────────────────────────────

const PERMISSION_INHERITANCE: Record<RelationshipType, string[]> = {
  spouse: ["view_finances", "delegate_financial_decisions", "manage_household"],
  sibling: ["view_shared_calendar"],
  friend: [],
  parent: ["manage_child_schedule", "view_child_activities"],
  child: [],
  guardian: ["manage_ward_finances", "manage_ward_schedule", "view_ward_medical"],
  employee: ["view_org_resources"],
  manager: ["view_team_analytics", "approve_team_requests", "manage_team_members"],
  team_member: ["view_team_resources", "submit_requests"],
  delegate: ["act_on_behalf"],
  advisor: ["view_advisory_data", "submit_recommendations"],
  beneficiary: ["view_trust_status"],
};

const RELATIONSHIP_INVERSES: Partial<Record<RelationshipType, RelationshipType>> = {
  parent: "child",
  child: "parent",
  manager: "employee",
  employee: "manager",
  guardian: "child",
  spouse: "spouse",
  sibling: "sibling",
  friend: "friend",
};

// ── Identity Service ────────────────────────────────────────────────────────

export class IdentityService {
  private identities = new Map<string, IdentityRecord>();

  createIdentity(userId: string, email: string, displayName: string): IdentityRecord {
    const identity: IdentityRecord = {
      id: crypto.randomUUID(),
      userId,
      email,
      displayName,
      roles: ["user"],
      verificationState: "unverified",
      delegations: [],
      active: true,
      createdAt: Date.now(),
    };
    this.identities.set(userId, identity);
    return identity;
  }

  verify(userId: string, level: VerificationState): IdentityRecord | undefined {
    const identity = this.identities.get(userId);
    if (!identity) return undefined;
    identity.verificationState = level;
    return identity;
  }

  assignRole(userId: string, role: IdentityRole): boolean {
    const identity = this.identities.get(userId);
    if (!identity) return false;
    if (!identity.roles.includes(role)) identity.roles.push(role);
    return true;
  }

  removeRole(userId: string, role: IdentityRole): boolean {
    const identity = this.identities.get(userId);
    if (!identity) return false;
    identity.roles = identity.roles.filter((r) => r !== role);
    return true;
  }

  addDelegation(fromUserId: string, toUserId: string, permissions: string[], maxDepth = 1, expiresAt?: number): Delegation | undefined {
    const identity = this.identities.get(fromUserId);
    if (!identity) return undefined;
    const delegation: Delegation = {
      id: crypto.randomUUID(),
      fromUserId,
      toUserId,
      permissions,
      maxDepth,
      expiresAt,
      active: true,
    };
    identity.delegations.push(delegation);
    return delegation;
  }

  getIdentity(userId: string): IdentityRecord | undefined {
    return this.identities.get(userId);
  }

  hasRole(userId: string, role: IdentityRole): boolean {
    return this.identities.get(userId)?.roles.includes(role) || false;
  }

  deactivate(userId: string): boolean {
    const identity = this.identities.get(userId);
    if (!identity) return false;
    identity.active = false;
    return true;
  }

  recordLogin(userId: string): void {
    const identity = this.identities.get(userId);
    if (identity) identity.lastLoginAt = Date.now();
  }

  getAllIdentities(): IdentityRecord[] {
    return Array.from(this.identities.values());
  }
}

// ── Household-Org Graph ─────────────────────────────────────────────────────

export class HouseholdOrgGraph {
  private entities = new Map<string, EntityNode>();
  private relationships: Relationship[] = [];

  addEntity(type: EntityType, name: string, metadata?: Record<string, unknown>): EntityNode {
    const entity: EntityNode = {
      id: crypto.randomUUID(),
      type,
      name,
      metadata: metadata || {},
      active: true,
      createdAt: Date.now(),
    };
    this.entities.set(entity.id, entity);
    return entity;
  }

  addRelationship(
    fromEntityId: string,
    toEntityId: string,
    type: RelationshipType,
    options?: { visibility?: VisibilityScope; maxDelegationDepth?: number; inheritable?: boolean }
  ): Relationship | undefined {
    if (!this.entities.has(fromEntityId) || !this.entities.has(toEntityId)) return undefined;

    const inheritedPermissions = PERMISSION_INHERITANCE[type] || [];
    const relationship: Relationship = {
      id: crypto.randomUUID(),
      fromEntityId,
      toEntityId,
      type,
      permissions: inheritedPermissions,
      visibility: options?.visibility || "private",
      maxDelegationDepth: options?.maxDelegationDepth || 0,
      inheritable: options?.inheritable ?? false,
      active: true,
    };
    this.relationships.push(relationship);
    return relationship;
  }

  getEntity(entityId: string): EntityNode | undefined {
    return this.entities.get(entityId);
  }

  getRelationships(entityId: string): Relationship[] {
    return this.relationships.filter(
      (r) => r.active && (r.fromEntityId === entityId || r.toEntityId === entityId)
    );
  }

  getPermissions(entityId: string, targetEntityId: string): string[] {
    const directRels = this.relationships.filter(
      (r) => r.active && r.fromEntityId === entityId && r.toEntityId === targetEntityId
    );
    const permissions = new Set<string>();
    for (const rel of directRels) {
      for (const p of rel.permissions) permissions.add(p);
    }
    return Array.from(permissions);
  }

  getHouseholdMembers(householdEntityId: string): EntityNode[] {
    const entity = this.entities.get(householdEntityId);
    if (!entity || entity.type !== "household") return [];

    const memberIds = this.relationships
      .filter((r) => r.active && (r.fromEntityId === householdEntityId || r.toEntityId === householdEntityId))
      .map((r) => (r.fromEntityId === householdEntityId ? r.toEntityId : r.fromEntityId));

    return memberIds
      .map((id) => this.entities.get(id))
      .filter((e): e is EntityNode => e !== undefined && e.type === "individual");
  }

  getInverseRelationship(type: RelationshipType): RelationshipType | undefined {
    return RELATIONSHIP_INVERSES[type];
  }

  deactivateEntity(entityId: string): void {
    const entity = this.entities.get(entityId);
    if (entity) entity.active = false;
    // Deactivate related relationships
    for (const rel of this.relationships) {
      if (rel.fromEntityId === entityId || rel.toEntityId === entityId) {
        rel.active = false;
      }
    }
  }

  getAllEntities(): EntityNode[] {
    return Array.from(this.entities.values());
  }

  getActiveRelationships(): Relationship[] {
    return this.relationships.filter((r) => r.active);
  }
}

// ── Factories ───────────────────────────────────────────────────────────────

export function createIdentityService(): IdentityService {
  return new IdentityService();
}

export function createHouseholdOrgGraph(): HouseholdOrgGraph {
  return new HouseholdOrgGraph();
}

export function getPermissionInheritance(): Record<RelationshipType, string[]> {
  return { ...PERMISSION_INHERITANCE };
}
