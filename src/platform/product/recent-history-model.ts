// ═══════════════════════════════════════════════════════════════
// SITA OS — Recent History / Recovery Model
// Resume recent work, cross-app context recovery.
// ═══════════════════════════════════════════════════════════════

import type { TaskDomain } from "./task-action-model";

export interface RecentHistoryEntry {
  readonly id: string;
  readonly domain: TaskDomain;
  readonly title: string;
  readonly subtitle?: string;
  readonly route: string;
  readonly deepLinkId?: string;
  readonly timestamp: number;
  readonly entityType: string;
  readonly entityId: string;
  readonly action: "viewed" | "edited" | "created" | "approved" | "searched";
  readonly scrollPosition?: number;
  readonly formState?: Record<string, unknown>;
}

export interface RecentHistoryConfig {
  readonly maxEntries: number;
  readonly retentionDays: number;
  readonly storageKey: string;
  readonly crossAppRecovery: boolean;
  readonly trackScrollPosition: boolean;
  readonly trackFormState: boolean;
}

export const RECENT_HISTORY_CONFIG: RecentHistoryConfig = {
  maxEntries: 50,
  retentionDays: 30,
  storageKey: "sita-os-recent-history",
  crossAppRecovery: true,
  trackScrollPosition: true,
  trackFormState: false,
} as const;