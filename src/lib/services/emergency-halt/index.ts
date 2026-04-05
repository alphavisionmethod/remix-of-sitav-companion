// ═══════════════════════════════════════════════════════════════
// SITA OS — Emergency Halt Service
// System-wide kill switch for all autonomous actions
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export type HaltScope = "global" | "domain" | "agent" | "connector" | "workflow" | "payment";

export type HaltReason = "security-breach" | "policy-violation" | "manual-override" | "budget-exceeded" | "duress-detected" | "system-error" | "regulatory-hold";

export type HaltStatus = "active" | "resolved" | "expired";

export interface HaltOrder {
  id: string;
  scope: HaltScope;
  scopeTarget?: string; // specific domain/agent/connector ID
  reason: HaltReason;
  description: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt?: string;
  status: HaltStatus;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  affectedServices: string[];
  blockedActionCount: number;
}

export interface HaltCheck {
  halted: boolean;
  orders: HaltOrder[];
  reason?: string;
}

export class EmergencyHaltService {
  private orders: Map<string, HaltOrder> = new Map();

  issueHalt(scope: HaltScope, reason: HaltReason, description: string, issuedBy: string, options?: { scopeTarget?: string; expiresAt?: string }): HaltOrder {
    const order: HaltOrder = {
      id: crypto.randomUUID(),
      scope,
      scopeTarget: options?.scopeTarget,
      reason,
      description,
      issuedBy,
      issuedAt: new Date().toISOString(),
      expiresAt: options?.expiresAt,
      status: "active",
      affectedServices: this.getAffectedServices(scope, options?.scopeTarget),
      blockedActionCount: 0,
    };

    this.orders.set(order.id, order);
    return order;
  }

  resolveHalt(orderId: string, resolvedBy: string, note: string): HaltOrder | null {
    const order = this.orders.get(orderId);
    if (!order || order.status !== "active") return null;

    order.status = "resolved";
    order.resolvedAt = new Date().toISOString();
    order.resolvedBy = resolvedBy;
    order.resolutionNote = note;
    return order;
  }

  checkHalt(scope: HaltScope, target?: string): HaltCheck {
    this.expireOrders();

    const activeOrders = Array.from(this.orders.values()).filter(o => {
      if (o.status !== "active") return false;
      if (o.scope === "global") return true;
      if (o.scope === scope && (!target || !o.scopeTarget || o.scopeTarget === target)) return true;
      return false;
    });

    if (activeOrders.length > 0) {
      activeOrders.forEach(o => o.blockedActionCount++);
    }

    return {
      halted: activeOrders.length > 0,
      orders: activeOrders,
      reason: activeOrders.length > 0 ? activeOrders.map(o => o.description).join("; ") : undefined,
    };
  }

  isSystemHalted(): boolean {
    return this.checkHalt("global").halted;
  }

  getActiveOrders(): HaltOrder[] {
    this.expireOrders();
    return Array.from(this.orders.values()).filter(o => o.status === "active");
  }

  getAllOrders(limit: number = 100): HaltOrder[] {
    return Array.from(this.orders.values()).slice(-limit).reverse();
  }

  getStats(): { activeOrders: number; totalBlocked: number; byScope: Record<string, number> } {
    const active = this.getActiveOrders();
    const byScope: Record<string, number> = {};
    active.forEach(o => { byScope[o.scope] = (byScope[o.scope] ?? 0) + 1; });
    return {
      activeOrders: active.length,
      totalBlocked: active.reduce((s, o) => s + o.blockedActionCount, 0),
      byScope,
    };
  }

  private expireOrders() {
    const now = new Date();
    this.orders.forEach(o => {
      if (o.status === "active" && o.expiresAt && new Date(o.expiresAt) < now) {
        o.status = "expired";
      }
    });
  }

  private getAffectedServices(scope: HaltScope, target?: string): string[] {
    switch (scope) {
      case "global": return ["brain-core", "executor-service", "payment-execution", "connector-runners", "workflow-engine", "ai-workforce"];
      case "domain": return [`${target}-os`, "brain-core"];
      case "agent": return ["ai-workforce", "executor-service"];
      case "connector": return ["connector-control-plane", "connector-runners"];
      case "workflow": return ["workflow-engine", "executor-service"];
      case "payment": return ["payment-execution", "finance-os"];
      default: return [];
    }
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("emergency-halt", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      orders: Array.from(this.orders.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.orders) this.orders = new Map(state.orders as any);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("emergency-halt");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export function createEmergencyHalt(): EmergencyHaltService {
  return new EmergencyHaltService();
}
