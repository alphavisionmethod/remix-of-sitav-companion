// ═══════════════════════════════════════════════════════════════
// SITA OS — Entity & Role Graph Engine
// Identity, household, org, delegation, visibility resolution
// ═══════════════════════════════════════════════════════════════

import type {
  Entity, PersonEntity, HouseholdEntity, OrgEntity, DeviceEntity,
  GraphRoleAssignment, GraphDelegatedAuthority, VisibilityBoundary,
  RelationshipEdge, PermissionQuery, PermissionResult,
  HouseholdRole, OrgRole,
} from "../types/entity-graph.types";

export class EntityRoleGraph {
  private entities: Map<string, Entity> = new Map();
  private relationships: RelationshipEdge[] = [];
  private roles: GraphRoleAssignment[] = [];
  private delegations: GraphDelegatedAuthority[] = [];
  private visibilityRules: VisibilityBoundary[] = [];

  // ── Entity Management ───────────────────────────────────────
  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  getPersonEntities(): PersonEntity[] {
    return Array.from(this.entities.values()).filter((e): e is PersonEntity => e.type === "person");
  }

  getHouseholds(): HouseholdEntity[] {
    return Array.from(this.entities.values()).filter((e): e is HouseholdEntity => e.type === "household");
  }

  getOrgs(): OrgEntity[] {
    return Array.from(this.entities.values()).filter((e): e is OrgEntity => e.type === "organization");
  }

  // ── Relationship Management ─────────────────────────────────
  addRelationship(edge: RelationshipEdge): void {
    this.relationships.push(edge);
  }

  getRelationships(entityId: string): RelationshipEdge[] {
    return this.relationships.filter(r => r.fromEntityId === entityId || r.toEntityId === entityId);
  }

  // ── Role Management ─────────────────────────────────────────
  assignRole(assignment: GraphRoleAssignment): void {
    this.roles.push(assignment);
  }

  revokeRole(assignmentId: string, revokedBy: string): void {
    const role = this.roles.find(r => r.id === assignmentId);
    if (role) {
      role.revoked = true;
      role.revokedAt = new Date().toISOString();
      role.revokedBy = revokedBy;
    }
  }

  getActiveRoles(entityId: string): GraphRoleAssignment[] {
    return this.roles.filter(r =>
      r.entityId === entityId && !r.revoked &&
      (!r.expiresAt || new Date(r.expiresAt) > new Date())
    );
  }

  // ── Delegation Management ───────────────────────────────────
  createDelegation(delegation: GraphDelegatedAuthority): void {
    this.delegations.push(delegation);
  }

  revokeDelegation(delegationId: string): void {
    const d = this.delegations.find(d => d.id === delegationId);
    if (d) d.revoked = true;
  }

  getActiveDelegations(entityId: string): GraphDelegatedAuthority[] {
    return this.delegations.filter(d =>
      (d.fromEntityId === entityId || d.toEntityId === entityId) &&
      !d.revoked &&
      (!d.validUntil || new Date(d.validUntil) > new Date())
    );
  }

  // ── Permission Resolution ───────────────────────────────────
  checkPermission(query: PermissionQuery): PermissionResult {
    const policyChain: string[] = [];
    const delegationChain: string[] = [];

    // 1. Check direct roles
    const roles = this.getActiveRoles(query.actorId);
    for (const role of roles) {
      policyChain.push(`role:${role.role}@${role.contextType}:${role.contextId}`);
    }

    // 2. Check delegations
    const delegations = this.getActiveDelegations(query.actorId);
    for (const d of delegations) {
      if (d.toEntityId === query.actorId && d.scope.actions.includes(query.action as never)) {
        if (d.maxAmount && query.amount && query.amount > d.maxAmount) continue;
        if (d.maxUsages && d.usageCount >= d.maxUsages) continue;
        delegationChain.push(`delegation:${d.id} from ${d.fromEntityId}`);
      }
    }

    // 3. Check visibility boundaries
    const visRule = this.visibilityRules.find(v =>
      v.resourceType === query.resourceType && v.resourceId === query.resourceId
    );
    if (visRule && visRule.deniedEntities.includes(query.actorId)) {
      return { allowed: false, reason: "Explicitly denied by visibility boundary", policyChain, trustRequirement: "high" };
    }

    // 4. Determine permission
    const hasRole = roles.length > 0;
    const hasDelegation = delegationChain.length > 0;
    const allowed = hasRole || hasDelegation;

    // 5. Check if approval is needed for high-value actions
    const needsApproval = query.amount && query.amount > 1000;
    const requiredApprovals = needsApproval ? this.findApprovers(query) : undefined;

    return {
      allowed,
      reason: allowed ? "Permission granted via " + (hasRole ? "role" : "delegation") : "No matching role or delegation found",
      requiredApprovals,
      policyChain,
      delegationChain: delegationChain.length > 0 ? delegationChain : undefined,
      trustRequirement: query.amount && query.amount > 5000 ? "high" : query.amount && query.amount > 1000 ? "medium" : "low",
    };
  }

  // ── Visibility Queries ──────────────────────────────────────
  canSee(actorId: string, resourceType: string, resourceId: string): boolean {
    return this.checkPermission({ actorId, action: "view", resourceType, resourceId, domain: "" }).allowed;
  }

  canApprove(actorId: string, resourceType: string, resourceId: string): boolean {
    return this.checkPermission({ actorId, action: "approve", resourceType, resourceId, domain: "" }).allowed;
  }

  canExecute(actorId: string, resourceType: string, resourceId: string): boolean {
    return this.checkPermission({ actorId, action: "execute", resourceType, resourceId, domain: "" }).allowed;
  }

  // ── Household/Org Resolution ────────────────────────────────
  getHouseholdMembers(householdId: string): PersonEntity[] {
    const household = this.entities.get(householdId) as HouseholdEntity | undefined;
    if (!household) return [];
    return household.members
      .map(m => this.entities.get(m.personId) as PersonEntity)
      .filter(Boolean);
  }

  getOrgMembers(orgId: string): PersonEntity[] {
    const org = this.entities.get(orgId) as OrgEntity | undefined;
    if (!org) return [];
    return org.members
      .map(m => this.entities.get(m.personId) as PersonEntity)
      .filter(Boolean);
  }

  isHouseholdShared(resourceType: string, resourceId: string): boolean {
    const rule = this.visibilityRules.find(v =>
      v.resourceType === resourceType && v.resourceId === resourceId
    );
    return rule?.visibility === "household";
  }

  // ── Device Trust ────────────────────────────────────────────
  getDeviceTrust(deviceId: string): "trusted" | "verified" | "unknown" | "revoked" {
    const device = this.entities.get(deviceId) as DeviceEntity | undefined;
    return device?.trustLevel ?? "unknown";
  }

  canDeviceSign(deviceId: string): boolean {
    const device = this.entities.get(deviceId) as DeviceEntity | undefined;
    return device?.canSign ?? false;
  }

  // ── Helpers ─────────────────────────────────────────────────
  private findApprovers(query: PermissionQuery): string[] {
    // Find entities with approve permission in the relevant context
    const approvers: string[] = [];
    for (const role of this.roles) {
      if (!role.revoked && role.role === "owner" || role.role === "admin") {
        approvers.push(role.entityId);
      }
    }
    return [...new Set(approvers)];
  }

  addVisibilityRule(rule: VisibilityBoundary): void {
    this.visibilityRules.push(rule);
  }

  // ── Persistence ─────────────────────────────────────────────
  serialize(): Record<string, unknown> {
    return {
      entities: Array.from(this.entities.entries()),
      relationships: this.relationships,
      roles: this.roles,
      delegations: this.delegations,
      visibilityRules: this.visibilityRules,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (state.entities) this.entities = new Map(state.entities as Iterable<[string, never]>) as typeof this.entities;
    if (state.relationships) this.relationships = state.relationships as typeof this.relationships;
    if (state.roles) this.roles = state.roles as typeof this.roles;
    if (state.delegations) this.delegations = state.delegations as typeof this.delegations;
    if (state.visibilityRules) this.visibilityRules = state.visibilityRules as typeof this.visibilityRules;
  }
}
