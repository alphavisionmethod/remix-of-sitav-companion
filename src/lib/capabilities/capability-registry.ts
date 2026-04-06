// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Registry
// Surface-neutral capability invocation layer
// ═══════════════════════════════════════════════════════════════

import type { CapabilityInvocation, CapabilityResult } from "@/packages/contracts/msa/capability-contract";
import { validateCapabilityInvocation, validateCapabilityResult } from "@/packages/contracts/msa/capability-validator";

type CapabilityHandler = (params: Record<string, unknown>, context: CapabilityContext) => Promise<CapabilityResult>;

interface CapabilityContext {
  userId: string;
  surface: string;
  mode: "live" | "demo" | "simulation";
  correlationId?: string;
}

const registry = new Map<string, CapabilityHandler>();

/** Register a capability handler */
export function registerCapability(key: string, handler: CapabilityHandler): void {
  if (registry.has(key)) {
    console.warn(`[CapabilityRegistry] Overwriting handler for: ${key}`);
  }
  registry.set(key, handler);
}

/** Invoke a capability by key — surface-neutral */
export async function invokeCapability(invocation: CapabilityInvocation): Promise<CapabilityResult> {
  const handler = registry.get(invocation.capabilityKey);
  if (!handler) {
    return {
      success: false,
      error: `Capability not registered: ${invocation.capabilityKey}`,
    };
  }

  const context: CapabilityContext = {
    userId: invocation.userId,
    surface: invocation.surface,
    mode: invocation.mode,
    correlationId: invocation.correlationId,
  };

  const start = performance.now();
  try {
    const result = await handler(invocation.params, context);
    return { ...result, latencyMs: Math.round(performance.now() - start) };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Unknown capability error",
      latencyMs: Math.round(performance.now() - start),
    };
  }
}

/** List registered capability keys */
export function listCapabilities(): string[] {
  return Array.from(registry.keys());
}

/** Check if a capability is registered */
export function hasCapability(key: string): boolean {
  return registry.has(key);
}
