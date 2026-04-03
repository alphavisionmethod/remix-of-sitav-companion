// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge OS: Provider Memory Service
// ═══════════════════════════════════════════════════════════════

import type { ServiceProviderRecord } from "@/packages/concierge-contracts";

export function findProvider(providers: ServiceProviderRecord[], category: string): ServiceProviderRecord[] {
  return providers.filter(p => p.category === category).sort((a, b) => b.rating - a.rating);
}

export function getFavorites(providers: ServiceProviderRecord[]): ServiceProviderRecord[] {
  return providers.filter(p => p.isFavorite).sort((a, b) => b.rating - a.rating);
}

export function suggestProvider(providers: ServiceProviderRecord[], category: string): ServiceProviderRecord | null {
  const matches = findProvider(providers, category);
  return matches.find(p => p.isFavorite) || matches[0] || null;
}
