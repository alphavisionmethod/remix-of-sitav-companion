// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Event Taxonomy
// Typed events emitted during the setup lifecycle
// ═══════════════════════════════════════════════════════════════

import type { SetupPhaseId, SetupPhaseStatus, SetupBranchPath } from "./setup-orchestration";
import type { GlobalSetupState, SetupErrorCategory } from "./setup-data-models";

// ── Event Types ─────────────────────────────────────────────

export type SetupEventType =
  | "setup_session_started"
  | "setup_session_resumed"
  | "capability_detection_completed"
  | "security_baseline_completed"
  | "stage_entered"
  | "stage_completed"
  | "stage_skipped"
  | "stage_failed"
  | "stage_retried"
  | "network_connected"
  | "network_failed"
  | "updates_completed"
  | "reboot_required"
  | "session_interrupted"
  | "session_checkpoint_saved"
  | "ownership_selected"
  | "auth_completed"
  | "restore_selected"
  | "restore_completed"
  | "access_protection_completed"
  | "privacy_baseline_completed"
  | "starter_profile_completed"
  | "world_model_updated"
  | "use_mode_selected"
  | "trust_profile_completed"
  | "advisors_selected"
  | "connection_completed"
  | "connection_failed"
  | "first_win_prepared"
  | "arrival_summary_generated"
  | "desktop_handoff_completed"
  | "deferred_item_created"
  | "branch_path_changed";

// ── Event Payload ───────────────────────────────────────────

export interface SetupEventBase {
  eventId: string;
  eventType: SetupEventType;
  sessionId: string;
  timestamp: string;
  globalState: GlobalSetupState;
  branchPath: SetupBranchPath;
}

export interface StageEvent extends SetupEventBase {
  eventType: "stage_entered" | "stage_completed" | "stage_skipped" | "stage_failed" | "stage_retried";
  stageId: SetupPhaseId;
  fromStatus?: SetupPhaseStatus;
  toStatus: SetupPhaseStatus;
  retryCount?: number;
  errorCode?: string;
  durationMs?: number;
}

export interface SessionLifecycleEvent extends SetupEventBase {
  eventType: "setup_session_started" | "setup_session_resumed" | "session_interrupted" | "session_checkpoint_saved";
  interruptionReason?: string;
  checkpointPhaseId?: SetupPhaseId;
  resumedFromPhaseId?: SetupPhaseId;
}

export interface CapabilityEvent extends SetupEventBase {
  eventType: "capability_detection_completed" | "security_baseline_completed";
  capabilitySummary: Record<string, boolean | string>;
}

export interface NetworkEvent extends SetupEventBase {
  eventType: "network_connected" | "network_failed";
  networkType?: "wifi" | "ethernet" | "cellular" | "offline";
  errorReason?: string;
}

export interface SelectionEvent extends SetupEventBase {
  eventType: "ownership_selected" | "use_mode_selected" | "auth_completed" | "restore_selected" | "advisors_selected";
  selectionValue: string;
  selectionMetadata?: Record<string, unknown>;
}

export interface CompletionEvent extends SetupEventBase {
  eventType: "privacy_baseline_completed" | "trust_profile_completed" | "access_protection_completed"
    | "starter_profile_completed" | "restore_completed" | "updates_completed" | "first_win_prepared"
    | "arrival_summary_generated" | "desktop_handoff_completed";
  completionSummary?: Record<string, unknown>;
}

export interface WorldModelEvent extends SetupEventBase {
  eventType: "world_model_updated";
  domainKey: string;
  completionPct: number;
}

export interface ConnectionEvent extends SetupEventBase {
  eventType: "connection_completed" | "connection_failed";
  serviceType: string;
  serviceId: string;
  errorReason?: string;
}

export interface DeferredEvent extends SetupEventBase {
  eventType: "deferred_item_created";
  itemId: string;
  itemType: string;
  reasonSkipped: string;
}

export interface BranchEvent extends SetupEventBase {
  eventType: "branch_path_changed";
  fromPath?: SetupBranchPath;
  toPath: SetupBranchPath;
}

// ── Union Type ──────────────────────────────────────────────

export type SetupEvent =
  | StageEvent
  | SessionLifecycleEvent
  | CapabilityEvent
  | NetworkEvent
  | SelectionEvent
  | CompletionEvent
  | WorldModelEvent
  | ConnectionEvent
  | DeferredEvent
  | BranchEvent;

// ── Event Emitter ───────────────────────────────────────────

export type SetupEventListener = (event: SetupEvent) => void;

export class SetupEventEmitter {
  private listeners = new Set<SetupEventListener>();

  on(listener: SetupEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: SetupEvent): void {
    for (const listener of this.listeners) {
      try { listener(event); } catch (e) { console.error("[SetupEvents] Listener error:", e); }
    }
  }

  /** Helper to create a base event payload */
  createBase(
    eventType: SetupEventType,
    sessionId: string,
    globalState: GlobalSetupState,
    branchPath: SetupBranchPath,
  ): SetupEventBase {
    return {
      eventId: crypto.randomUUID(),
      eventType,
      sessionId,
      timestamp: new Date().toISOString(),
      globalState,
      branchPath,
    };
  }

  destroy(): void {
    this.listeners.clear();
  }
}
