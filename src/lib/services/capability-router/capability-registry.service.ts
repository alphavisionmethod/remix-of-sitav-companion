// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Registry Service
// Registry of CapabilityContract entries with lookup/filter
// ═══════════════════════════════════════════════════════════════

import type { CapabilityContract, DomainId, RiskTier } from "@/packages/contracts";

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

const registry = new Map<string, CapabilityContract>();

const DEFAULTS: CapabilityContract[] = [
  { capabilityId: "biz-crm-read", domain: "business", family: "crm", riskTier: "standard", requiresApproval: false, requiredConnectors: ["crm"], requiredPermissions: ["business:read"] },
  { capabilityId: "biz-crm-write", domain: "business", family: "crm", riskTier: "elevated", requiresApproval: true, requiredConnectors: ["crm"], requiredPermissions: ["business:write"] },
  { capabilityId: "biz-comms-send", domain: "business", family: "communications", riskTier: "elevated", requiresApproval: true, requiredConnectors: ["gmail"], requiredPermissions: ["business:write", "comms:send"] },
  { capabilityId: "fin-accounts-read", domain: "finance", family: "accounts", riskTier: "standard", requiresApproval: false, requiredConnectors: ["banking"], requiredPermissions: ["finance:read"] },
  { capabilityId: "fin-payment-execute", domain: "finance", family: "payments", riskTier: "critical", requiresApproval: true, requiredConnectors: ["banking"], requiredPermissions: ["finance:write", "payments:execute"] },
  { capabilityId: "fin-transfer", domain: "finance", family: "transfers", riskTier: "critical", requiresApproval: true, requiredConnectors: ["banking"], requiredPermissions: ["finance:write", "transfers:execute"] },
  { capabilityId: "con-calendar-read", domain: "concierge", family: "calendar", riskTier: "standard", requiresApproval: false, requiredConnectors: ["calendar"], requiredPermissions: ["concierge:read"] },
  { capabilityId: "con-booking-create", domain: "concierge", family: "bookings", riskTier: "elevated", requiresApproval: true, requiredConnectors: ["travel"], requiredPermissions: ["concierge:write", "bookings:create"] },
  { capabilityId: "plat-diagnostic", domain: "platform", family: "diagnostics", riskTier: "standard", requiresApproval: false, requiredConnectors: [], requiredPermissions: ["platform:read"] },
  { capabilityId: "plat-config-write", domain: "platform", family: "config", riskTier: "critical", requiresApproval: true, requiredConnectors: [], requiredPermissions: ["platform:admin"] },
];

// Initialize
DEFAULTS.forEach((c) => registry.set(c.capabilityId, c));

export function registerCapability(cap: CapabilityContract): void {
  registry.set(cap.capabilityId, cap);
}

export function getCapability(id: string): CapabilityContract | undefined {
  return registry.get(id);
}

export function listByDomain(domain: DomainId): CapabilityContract[] {
  return Array.from(registry.values()).filter((c) => c.domain === domain);
}

export function listByFamily(family: string): CapabilityContract[] {
  return Array.from(registry.values()).filter((c) => c.family === family);
}

export function listByRiskTier(tier: RiskTier): CapabilityContract[] {
  return Array.from(registry.values()).filter((c) => c.riskTier === tier);
}

export function findCapabilities(filters: {
  domain?: DomainId;
  family?: string;
  riskTier?: RiskTier;
  requiresApproval?: boolean;
}): CapabilityContract[] {
  return Array.from(registry.values()).filter((c) => {
    if (filters.domain && c.domain !== filters.domain) return false;
    if (filters.family && c.family !== filters.family) return false;
    if (filters.riskTier && c.riskTier !== filters.riskTier) return false;
    if (filters.requiresApproval !== undefined && c.requiresApproval !== filters.requiresApproval) return false;
    return true;
  });
}

export function getAllCapabilities(): CapabilityContract[] {
  return Array.from(registry.values());
}

export function getRegistryHealth(): { total: number; byDomain: Record<string, number> } {
  const byDomain: Record<string, number> = {};
  registry.forEach((c) => { byDomain[c.domain] = (byDomain[c.domain] || 0) + 1; });
  return { total: registry.size, byDomain };
}


// ── Persistence ──────────────────────────────────────────
const _serviceId = "capability-router/capability-registry";

function _serializeState(): Record<string, unknown> {
  return {
    registry: Array.from(registry.entries()),
  };
}

function _hydrateState(state: Record<string, unknown>): void {
  if (!state) return;
  if (state.registry) { registry.clear(); (state.registry as never[]).forEach(([k, v]: any) => registry.set(k, v)); }
}

export async function loadPersistedState(): Promise<void> {
  const state = await loadServiceState(_serviceId);
  if (state) _hydrateState(state as Record<string, unknown>);
}

export function persistState(): void {
  debouncedSaveServiceState(_serviceId, _serializeState());
}