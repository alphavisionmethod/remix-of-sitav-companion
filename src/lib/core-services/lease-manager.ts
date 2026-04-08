// ═══════════════════════════════════════════════════════════════
// SITA OS — Intent-Bound Capability Lease Manager
// Short-lived, cryptographically scoped execution leases
// tied to user + advisor + intent + systems + time + spend cap
// ═══════════════════════════════════════════════════════════════

import { EventBus } from "./event-bus";
import { ReceiptService } from "./receipt-service";

// ── Types ───────────────────────────────────────────────────────

export type LeaseStatus = "active" | "expired" | "revoked" | "exhausted" | "violated";

export interface CapabilityLease {
  id: string;
  // Who
  userId: string;
  advisorId: string;
  entityId: string;
  // What
  intent: string;
  capabilityId: string;
  allowedActions: string[];
  // Where
  allowedSystems: string[];        // connector IDs, domains
  allowedEndpoints: string[];      // specific API endpoints
  // When
  issuedAt: number;
  expiresAt: number;
  // Limits
  spendCap: number;               // max monetary value
  spendUsed: number;              // running total
  riskCeiling: "low" | "medium" | "high" | "critical";
  maxInvocations: number;
  invocationCount: number;
  // Proof requirements
  requireReceipt: boolean;
  requireRollbackPosture: boolean;
  requireApprovalAbove: number | null;   // amount threshold for human approval
  requireSimulation: boolean;
  // Delegation chain
  delegatedBy: string | null;     // parent lease ID if sub-delegated
  delegationDepth: number;
  maxDelegationDepth: number;
  // State
  status: LeaseStatus;
  revokedAt?: number;
  revokedBy?: string;
  revocationReason?: string;
  violations: LeaseViolation[];
  // Metadata
  correlationId: string;
  metadata: Record<string, unknown>;
}

export interface LeaseViolation {
  id: string;
  leaseId: string;
  type: "spend-exceeded" | "time-expired" | "system-unauthorized" | "action-unauthorized"
    | "risk-exceeded" | "invocation-exceeded" | "delegation-depth-exceeded" | "proof-missing";
  details: string;
  timestamp: number;
  severity: "warning" | "block" | "revoke";
}

export interface LeaseRequest {
  userId: string;
  advisorId: string;
  entityId: string;
  intent: string;
  capabilityId: string;
  allowedActions: string[];
  allowedSystems: string[];
  allowedEndpoints?: string[];
  durationMs: number;             // how long the lease lasts
  spendCap: number;
  riskCeiling?: "low" | "medium" | "high" | "critical";
  maxInvocations?: number;
  requireReceipt?: boolean;
  requireRollbackPosture?: boolean;
  requireApprovalAbove?: number | null;
  requireSimulation?: boolean;
  delegatedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface LeaseValidation {
  valid: boolean;
  lease: CapabilityLease | null;
  violations: LeaseViolation[];
  remainingBudget: number;
  remainingTime: number;
  remainingInvocations: number;
}

// ── Lease Manager ───────────────────────────────────────────────

export class LeaseManager {
  private leases = new Map<string, CapabilityLease>();
  private leasesByAdvisor = new Map<string, Set<string>>();
  private leasesByEntity = new Map<string, Set<string>>();
  private eventBus?: EventBus;
  private receipts?: ReceiptService;

  constructor(options?: { eventBus?: EventBus; receipts?: ReceiptService }) {
    this.eventBus = options?.eventBus;
    this.receipts = options?.receipts;
  }

  /** Wire to shared kernel services */
  wire(eventBus: EventBus, receipts: ReceiptService): void {
    this.eventBus = eventBus;
    this.receipts = receipts;
  }

  // ── Issue ─────────────────────────────────────────────────────

  async issueLease(request: LeaseRequest): Promise<CapabilityLease> {
    const now = Date.now();
    const correlationId = crypto.randomUUID();

    // Check delegation depth
    let delegationDepth = 0;
    let maxDelegationDepth = 3;
    if (request.delegatedBy) {
      const parent = this.leases.get(request.delegatedBy);
      if (!parent) throw new Error(`Parent lease ${request.delegatedBy} not found`);
      if (parent.status !== "active") throw new Error(`Parent lease ${request.delegatedBy} is ${parent.status}`);
      delegationDepth = parent.delegationDepth + 1;
      maxDelegationDepth = parent.maxDelegationDepth;
      if (delegationDepth > maxDelegationDepth) {
        throw new Error(`Delegation depth ${delegationDepth} exceeds max ${maxDelegationDepth}`);
      }
      // Sub-lease cannot exceed parent's remaining budget or time
      const parentRemaining = parent.spendCap - parent.spendUsed;
      if (request.spendCap > parentRemaining) {
        request.spendCap = parentRemaining;
      }
      const parentTimeRemaining = parent.expiresAt - now;
      if (request.durationMs > parentTimeRemaining) {
        request.durationMs = parentTimeRemaining;
      }
    }

    const lease: CapabilityLease = {
      id: crypto.randomUUID(),
      userId: request.userId,
      advisorId: request.advisorId,
      entityId: request.entityId,
      intent: request.intent,
      capabilityId: request.capabilityId,
      allowedActions: [...request.allowedActions],
      allowedSystems: [...request.allowedSystems],
      allowedEndpoints: [...(request.allowedEndpoints ?? [])],
      issuedAt: now,
      expiresAt: now + request.durationMs,
      spendCap: request.spendCap,
      spendUsed: 0,
      riskCeiling: request.riskCeiling ?? "medium",
      maxInvocations: request.maxInvocations ?? 100,
      invocationCount: 0,
      requireReceipt: request.requireReceipt ?? true,
      requireRollbackPosture: request.requireRollbackPosture ?? false,
      requireApprovalAbove: request.requireApprovalAbove ?? null,
      requireSimulation: request.requireSimulation ?? false,
      delegatedBy: request.delegatedBy ?? null,
      delegationDepth,
      maxDelegationDepth,
      status: "active",
      violations: [],
      correlationId,
      metadata: request.metadata ?? {},
    };

    this.leases.set(lease.id, lease);

    // Index by advisor
    if (!this.leasesByAdvisor.has(request.advisorId)) {
      this.leasesByAdvisor.set(request.advisorId, new Set());
    }
    this.leasesByAdvisor.get(request.advisorId)!.add(lease.id);

    // Index by entity
    if (!this.leasesByEntity.has(request.entityId)) {
      this.leasesByEntity.set(request.entityId, new Set());
    }
    this.leasesByEntity.get(request.entityId)!.add(lease.id);

    // Emit event + create receipt
    await this.emitEvent("lease.issued.v1", {
      leaseId: lease.id,
      advisorId: lease.advisorId,
      intent: lease.intent,
      spendCap: lease.spendCap,
      expiresAt: lease.expiresAt,
      allowedSystems: lease.allowedSystems,
    }, correlationId);

    await this.createReceipt(correlationId, "execution-summary", {
      action: "lease.issued",
      leaseId: lease.id,
      advisorId: lease.advisorId,
      intent: lease.intent,
      spendCap: lease.spendCap,
      durationMs: request.durationMs,
      riskCeiling: lease.riskCeiling,
    });

    return lease;
  }

  // ── Validate ──────────────────────────────────────────────────

  validate(leaseId: string, action: string, system: string, amount: number = 0): LeaseValidation {
    const lease = this.leases.get(leaseId);
    if (!lease) {
      return { valid: false, lease: null, violations: [], remainingBudget: 0, remainingTime: 0, remainingInvocations: 0 };
    }

    const now = Date.now();
    const violations: LeaseViolation[] = [];

    // Time check
    if (now > lease.expiresAt) {
      lease.status = "expired";
      violations.push(this.createViolation(lease.id, "time-expired", "Lease has expired", "block"));
    }

    // Status check
    if (lease.status !== "active") {
      return {
        valid: false,
        lease,
        violations,
        remainingBudget: Math.max(0, lease.spendCap - lease.spendUsed),
        remainingTime: Math.max(0, lease.expiresAt - now),
        remainingInvocations: Math.max(0, lease.maxInvocations - lease.invocationCount),
      };
    }

    // Action authorization
    if (lease.allowedActions.length > 0 && !lease.allowedActions.includes(action) && !lease.allowedActions.includes("*")) {
      violations.push(this.createViolation(lease.id, "action-unauthorized", `Action '${action}' not permitted by lease`, "block"));
    }

    // System authorization
    if (lease.allowedSystems.length > 0 && !lease.allowedSystems.includes(system) && !lease.allowedSystems.includes("*")) {
      violations.push(this.createViolation(lease.id, "system-unauthorized", `System '${system}' not permitted by lease`, "block"));
    }

    // Spend check
    if (lease.spendUsed + amount > lease.spendCap) {
      violations.push(this.createViolation(lease.id, "spend-exceeded", `Spend ${lease.spendUsed + amount} would exceed cap ${lease.spendCap}`, "block"));
    }

    // Invocation check
    if (lease.invocationCount >= lease.maxInvocations) {
      violations.push(this.createViolation(lease.id, "invocation-exceeded", `Max invocations ${lease.maxInvocations} reached`, "block"));
      lease.status = "exhausted";
    }

    // Record violations
    lease.violations.push(...violations);
    const blockViolations = violations.filter(v => v.severity === "block" || v.severity === "revoke");

    // Auto-revoke on severe violations
    const revokeViolations = violations.filter(v => v.severity === "revoke");
    if (revokeViolations.length > 0) {
      this.revokeLease(lease.id, "system", `Auto-revoked: ${revokeViolations.map(v => v.type).join(", ")}`);
    }

    const valid = blockViolations.length === 0;

    // If valid, consume the invocation
    if (valid) {
      lease.invocationCount++;
      lease.spendUsed += amount;
    }

    return {
      valid,
      lease,
      violations,
      remainingBudget: Math.max(0, lease.spendCap - lease.spendUsed),
      remainingTime: Math.max(0, lease.expiresAt - now),
      remainingInvocations: Math.max(0, lease.maxInvocations - lease.invocationCount),
    };
  }

  // ── Revoke ────────────────────────────────────────────────────

  async revokeLease(leaseId: string, revokedBy: string, reason: string): Promise<boolean> {
    const lease = this.leases.get(leaseId);
    if (!lease || lease.status === "revoked") return false;

    lease.status = "revoked";
    lease.revokedAt = Date.now();
    lease.revokedBy = revokedBy;
    lease.revocationReason = reason;

    // Also revoke any sub-leases
    for (const [id, l] of this.leases) {
      if (l.delegatedBy === leaseId && l.status === "active") {
        await this.revokeLease(id, "system", `Parent lease ${leaseId} revoked`);
      }
    }

    await this.emitEvent("lease.revoked.v1", {
      leaseId, revokedBy, reason,
      spendUsed: lease.spendUsed,
      invocationCount: lease.invocationCount,
    }, lease.correlationId);

    await this.createReceipt(lease.correlationId, "execution-summary", {
      action: "lease.revoked",
      leaseId,
      revokedBy,
      reason,
      spendUsed: lease.spendUsed,
    });

    return true;
  }

  // ── Query ─────────────────────────────────────────────────────

  getLease(id: string): CapabilityLease | null {
    return this.leases.get(id) ?? null;
  }

  getActiveLeases(): CapabilityLease[] {
    this.expireStaleLeases();
    return Array.from(this.leases.values()).filter(l => l.status === "active");
  }

  getLeasesByAdvisor(advisorId: string): CapabilityLease[] {
    const ids = this.leasesByAdvisor.get(advisorId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.leases.get(id)!).filter(Boolean);
  }

  getLeasesByEntity(entityId: string): CapabilityLease[] {
    const ids = this.leasesByEntity.get(entityId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.leases.get(id)!).filter(Boolean);
  }

  getAllLeases(): CapabilityLease[] {
    return Array.from(this.leases.values());
  }

  /** Force-expire a lease by ID (for demo/testing) */
  expireLease(leaseId: string): boolean {
    const lease = this.leases.get(leaseId);
    if (!lease) return false;
    lease.expiresAt = Date.now() - 1000;
    lease.status = "expired";
    return true;
  }

  getLeaseStats() {
    const all = Array.from(this.leases.values());
    return {
      total: all.length,
      active: all.filter(l => l.status === "active").length,
      expired: all.filter(l => l.status === "expired").length,
      revoked: all.filter(l => l.status === "revoked").length,
      exhausted: all.filter(l => l.status === "exhausted").length,
      violated: all.filter(l => l.status === "violated").length,
      totalSpendUsed: all.reduce((s, l) => s + l.spendUsed, 0),
      totalSpendCap: all.reduce((s, l) => s + l.spendCap, 0),
      totalInvocations: all.reduce((s, l) => s + l.invocationCount, 0),
      totalViolations: all.reduce((s, l) => s + l.violations.length, 0),
    };
  }

  // ── Lifecycle ─────────────────────────────────────────────────

  /** Expire all leases past their time window */
  expireStaleLeases(): number {
    const now = Date.now();
    let expired = 0;
    for (const lease of this.leases.values()) {
      if (lease.status === "active" && now > lease.expiresAt) {
        lease.status = "expired";
        expired++;
      }
    }
    return expired;
  }

  // ── Private ───────────────────────────────────────────────────

  private createViolation(
    leaseId: string,
    type: LeaseViolation["type"],
    details: string,
    severity: LeaseViolation["severity"]
  ): LeaseViolation {
    return {
      id: crypto.randomUUID(),
      leaseId,
      type,
      details,
      timestamp: Date.now(),
      severity,
    };
  }

  private async emitEvent(topic: string, payload: Record<string, unknown>, correlationId: string): Promise<void> {
    if (this.eventBus) {
      await this.eventBus.publish(topic, payload, { source: "lease-manager", correlationId });
    }
  }

  private async createReceipt(correlationId: string, type: "execution-summary" | "approval-record" | "refusal", data: Record<string, unknown>): Promise<void> {
    if (this.receipts) {
      await this.receipts.createReceipt(correlationId, type, data);
    }
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createLeaseManager(options?: { eventBus?: EventBus; receipts?: ReceiptService }): LeaseManager {
  return new LeaseManager(options);
}
