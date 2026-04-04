// ═══════════════════════════════════════════════════════════════
// SITA OS — Read Models: Projections
// Query/projection builder types — NEVER sources of truth
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

/** @layer read-model */

export interface ProjectionQuery {
  domain: DomainId;
  entityType: string;
  filters: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface ProjectionResult<T = unknown> {
  data: T[];
  total: number;
  hasMore: boolean;
  generatedAt: string;
  staleness: "fresh" | "aging" | "stale";
}

export interface ProjectionSubscription {
  id: string;
  query: ProjectionQuery;
  refreshIntervalMs: number;
  lastRefreshedAt: string;
  isActive: boolean;
}
