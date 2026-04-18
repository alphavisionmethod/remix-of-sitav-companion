// ═══════════════════════════════════════════════════════════════
// SITA OS — Mode-Aware Provider System
// Generic provider resolution by domain + mode
// Pages consume interfaces; mode resolver picks implementation
// ═══════════════════════════════════════════════════════════════

import type { RealityModeKey } from "./reality-mode-registry";

export type ProviderDomain =
  | "boardroom"
  | "investment"
  | "money"
  | "business"
  | "workspace"
  | "owner"
  | "calendar"
  | "advisor";

export interface ProviderMetadata {
  providerType: "real" | "demo" | "sandbox";
  domain: ProviderDomain;
  dataFreshness: "live" | "cached" | "scenario_seeded" | "stale";
  scenarioSource?: string;
  contractVersion: number;
  sideEffectSafetyClass: "safe" | "restricted" | "unrestricted";
}

export interface ModeAwareProvider<T> {
  real: T;
  demo: T;
  sandbox?: T;
}

// ── Provider Registry ───────────────────────────────────────────

const providerRegistry = new Map<ProviderDomain, ModeAwareProvider<any>>();

export function registerProvider<T>(
  domain: ProviderDomain,
  providers: ModeAwareProvider<T>
): void {
  providerRegistry.set(domain, providers);
}

export function resolveProvider<T>(
  domain: ProviderDomain,
  mode: RealityModeKey
): T {
  const entry = providerRegistry.get(domain);
  if (!entry) {
    throw new Error(`[dual-reality] No provider registered for domain: ${domain}`);
  }

  switch (mode) {
    case "demo":
    case "dev_demo":
      return entry.demo;
    case "sandbox":
      return entry.sandbox ?? entry.demo;
    case "real":
    default:
      return entry.real;
  }
}

export function getProviderMetadata(domain: ProviderDomain, mode: RealityModeKey): ProviderMetadata {
  return {
    providerType: mode === "real" ? "real" : mode === "sandbox" ? "sandbox" : "demo",
    domain,
    dataFreshness: mode === "real" ? "live" : "scenario_seeded",
    contractVersion: 1,
    sideEffectSafetyClass: mode === "real" ? "unrestricted" : "safe",
  };
}

export function getRegisteredDomains(): ProviderDomain[] {
  return Array.from(providerRegistry.keys());
}

export function isProviderRegistered(domain: ProviderDomain): boolean {
  return providerRegistry.has(domain);
}
