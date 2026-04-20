// ═══════════════════════════════════════════════════════════════
// SITA OS — Dead Page Registry
// Tracks dead/orphaned pages discovered by validators.
// Consumed by check-route-dead-duplicate-cleanup validator.
// ═══════════════════════════════════════════════════════════════

export interface DeadPageEntry {
  readonly pagePath: string;
  readonly discoveredAt: string;
  readonly reason: "unreachable" | "orphaned" | "duplicate" | "stub";
  readonly notes: string;
}

export const DEAD_PAGES: readonly DeadPageEntry[] = [
  // No confirmed dead pages at this time.
  // Validators will populate this registry when dead pages are discovered.
];

export function isPageDead(pagePath: string): boolean {
  return DEAD_PAGES.some((p) => p.pagePath === pagePath);
}