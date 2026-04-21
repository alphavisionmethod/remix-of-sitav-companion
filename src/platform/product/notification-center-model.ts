// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Notification Center Model
// Unified notification semantics across all domains.
// Extends existing notification hooks — does NOT replace them.
// ═══════════════════════════════════════════════════════════════

import type { TaskDomain } from "./task-action-model";

// ── Notification Category ───────────────────────────────────────

export type NotificationCategory =
  | "alert"             // urgent system/domain alert
  | "reminder"          // scheduled / time-based
  | "approval"          // pending decision
  | "ai-recommendation" // advisor / AI suggestion
  | "integration"       // connector / sync status
  | "runtime"           // system health / release
  | "informational"     // FYI, no action needed
  | "completion";       // task/action completed

export type NotificationPriority = "critical" | "high" | "normal" | "low";

export type NotificationActionType = "navigate" | "approve" | "dismiss" | "retry" | "escalate";

// ── Notification Entry ──────────────────────────────────────────

export interface NotificationEntry {
  readonly id: string;
  readonly category: NotificationCategory;
  readonly priority: NotificationPriority;
  readonly domain: TaskDomain;
  readonly title: string;
  readonly body: string;
  readonly createdAt: number;
  readonly readAt?: number;
  readonly dismissedAt?: number;
  readonly expiresAt?: number;
  readonly actionable: boolean;
  readonly actions: readonly NotificationAction[];
  readonly deepLinkId?: string;
  readonly sourceRef?: string;       // originating task/action/advisor id
  readonly groupKey?: string;        // for collapsing similar notifications
}

// ── Notification Action ─────────────────────────────────────────

export interface NotificationAction {
  readonly type: NotificationActionType;
  readonly label: string;
  readonly route?: string;
  readonly payload?: Record<string, unknown>;
}

// ── Notification Preferences (per-user) ─────────────────────────

export interface NotificationPreferences {
  readonly userId: string;
  readonly enabledCategories: readonly NotificationCategory[];
  readonly quietHoursStart?: string; // HH:mm
  readonly quietHoursEnd?: string;
  readonly pushEnabled: boolean;
  readonly emailDigest: "none" | "daily" | "weekly";
  readonly groupSimilar: boolean;
}

// ── Notification Center State ───────────────────────────────────

export interface NotificationCenterState {
  readonly unreadCount: number;
  readonly criticalCount: number;
  readonly pendingApprovals: number;
  readonly lastFetchedAt: number;
}