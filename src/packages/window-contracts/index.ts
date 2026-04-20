// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Contracts Package
// Canonical typed contracts for the OS-grade windowing platform.
// ═══════════════════════════════════════════════════════════════

// ── Window Lifecycle States ─────────────────────────────────────
export type WindowLifecycleState =
  | "CREATED"
  | "INITIALIZING"
  | "OPEN"
  | "FOCUSED"
  | "BLURRED"
  | "BACKGROUNDED"
  | "MINIMIZED"
  | "HIDDEN"
  | "SUSPENDED"
  | "MODAL_OPEN"
  | "CRASHED"
  | "RECOVERING"
  | "CLOSING"
  | "CLOSED"
  | "RESTORING";

export const ALL_LIFECYCLE_STATES: readonly WindowLifecycleState[] = [
  "CREATED","INITIALIZING","OPEN","FOCUSED","BLURRED","BACKGROUNDED",
  "MINIMIZED","HIDDEN","SUSPENDED","MODAL_OPEN","CRASHED","RECOVERING",
  "CLOSING","CLOSED","RESTORING",
] as const;

// ── Enums ───────────────────────────────────────────────────────
export type WindowType = "primary" | "secondary" | "modal" | "panel" | "dialog";
export type WindowRole = "app" | "system" | "utility" | "overlay" | "inspector";
export type FocusState = "focused" | "blurred" | "inactive";
export type VisibilityState = "visible" | "hidden" | "offscreen" | "occluded";
export type PersistencePolicy = "always" | "on-close" | "never";
export type RecoveryPolicy = "auto" | "prompt" | "discard";
export type PermissionScope = "full" | "standard" | "restricted" | "sandboxed";
export type CommunicationPolicy = "open" | "domain-only" | "system-only" | "isolated";
export type LaunchCause = "user-click" | "app-request" | "system-restore" | "deep-link" | "modal-spawn";
export type RuntimeSurface = "web" | "pwa" | "desktop" | "appliance";
export type ShellTarget = "floating" | "compositor" | "embedded" | "fullscreen";
export type ChannelType = "broadcast" | "direct" | "system" | "domain";

// ── Placement ───────────────────────────────────────────────────
export interface WindowPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  monitorId?: string;
  workspaceId?: string;
  dpiScale?: number;
}

// ── Recovery Metadata ───────────────────────────────────────────
export interface WindowRecoveryMetadata {
  lastStableSnapshot: number | null;
  crashCount: number;
  lastCrashAt: number | null;
  quarantined: boolean;
}

// ── Window Contract ─────────────────────────────────────────────
export interface WindowContract {
  windowId: string;
  appId: string;
  windowType: WindowType;
  windowRole: WindowRole;
  title: string;
  runtimeSurface: RuntimeSurface;
  shellTarget: ShellTarget;
  workspaceId: string;
  monitorId: string;
  placement: WindowPlacement;
  zIndex: number;
  focusState: FocusState;
  visibilityState: VisibilityState;
  lifecycleState: WindowLifecycleState;
  persistencePolicy: PersistencePolicy;
  recoveryPolicy: RecoveryPolicy;
  permissionScope: PermissionScope;
  communicationPolicy: CommunicationPolicy;
  modalOwnerWindowId: string | null;
  parentWindowId: string | null;
  launchCause: LaunchCause;
  recovery: WindowRecoveryMetadata;
  evidence: {
    createdAt: number;
    lastTransitionAt: number;
    transitionCount: number;
  };
}

// ── Lifecycle Transition ────────────────────────────────────────
export interface WindowLifecycleTransition {
  from: readonly WindowLifecycleState[];
  to: WindowLifecycleState;
  requiresFocusUpdate: boolean;
  requiresPersistence: boolean;
  requiresZOrderUpdate: boolean;
  permissionCheck: boolean;
}

export const LIFECYCLE_TRANSITIONS: Record<string, WindowLifecycleTransition> = {
  initialize:   { from: ["CREATED"], to: "INITIALIZING", requiresFocusUpdate: false, requiresPersistence: false, requiresZOrderUpdate: false, permissionCheck: false },
  open:         { from: ["INITIALIZING", "RESTORING"], to: "OPEN", requiresFocusUpdate: true, requiresPersistence: true, requiresZOrderUpdate: true, permissionCheck: false },
  focus:        { from: ["OPEN", "BLURRED", "BACKGROUNDED", "MODAL_OPEN"], to: "FOCUSED", requiresFocusUpdate: true, requiresPersistence: false, requiresZOrderUpdate: true, permissionCheck: false },
  blur:         { from: ["FOCUSED"], to: "BLURRED", requiresFocusUpdate: true, requiresPersistence: false, requiresZOrderUpdate: false, permissionCheck: false },
  background:   { from: ["BLURRED", "OPEN"], to: "BACKGROUNDED", requiresFocusUpdate: false, requiresPersistence: true, requiresZOrderUpdate: false, permissionCheck: false },
  minimize:     { from: ["OPEN", "FOCUSED", "BLURRED", "BACKGROUNDED", "MODAL_OPEN"], to: "MINIMIZED", requiresFocusUpdate: true, requiresPersistence: true, requiresZOrderUpdate: true, permissionCheck: false },
  hide:         { from: ["OPEN", "FOCUSED", "BLURRED", "BACKGROUNDED", "MINIMIZED"], to: "HIDDEN", requiresFocusUpdate: true, requiresPersistence: true, requiresZOrderUpdate: false, permissionCheck: false },
  suspend:      { from: ["HIDDEN", "BACKGROUNDED", "MINIMIZED"], to: "SUSPENDED", requiresFocusUpdate: false, requiresPersistence: true, requiresZOrderUpdate: false, permissionCheck: false },
  openModal:    { from: ["OPEN", "FOCUSED", "BLURRED"], to: "MODAL_OPEN", requiresFocusUpdate: false, requiresPersistence: false, requiresZOrderUpdate: true, permissionCheck: true },
  crash:        { from: ["OPEN", "FOCUSED", "BLURRED", "BACKGROUNDED", "MINIMIZED", "HIDDEN", "SUSPENDED", "MODAL_OPEN", "INITIALIZING"], to: "CRASHED", requiresFocusUpdate: true, requiresPersistence: true, requiresZOrderUpdate: true, permissionCheck: false },
  recover:      { from: ["CRASHED"], to: "RECOVERING", requiresFocusUpdate: false, requiresPersistence: false, requiresZOrderUpdate: false, permissionCheck: false },
  close:        { from: ["OPEN", "FOCUSED", "BLURRED", "BACKGROUNDED", "MINIMIZED", "HIDDEN", "SUSPENDED", "MODAL_OPEN", "CRASHED", "RECOVERING"], to: "CLOSING", requiresFocusUpdate: true, requiresPersistence: true, requiresZOrderUpdate: true, permissionCheck: false },
  closed:       { from: ["CLOSING"], to: "CLOSED", requiresFocusUpdate: false, requiresPersistence: true, requiresZOrderUpdate: false, permissionCheck: false },
  restore:      { from: ["MINIMIZED", "HIDDEN", "SUSPENDED", "CLOSED"], to: "RESTORING", requiresFocusUpdate: false, requiresPersistence: false, requiresZOrderUpdate: false, permissionCheck: false },
};

// ── Factory ─────────────────────────────────────────────────────
export function createWindowContract(
  partial: Pick<WindowContract, "windowId" | "appId" | "title"> & Partial<WindowContract>
): WindowContract {
  const now = Date.now();
  return {
    windowType: "primary",
    windowRole: "app",
    runtimeSurface: "web",
    shellTarget: "floating",
    workspaceId: "default",
    monitorId: "primary",
    placement: { x: 100, y: 100, width: 800, height: 600 },
    zIndex: 1,
    focusState: "blurred",
    visibilityState: "visible",
    lifecycleState: "CREATED",
    persistencePolicy: "always",
    recoveryPolicy: "auto",
    permissionScope: "standard",
    communicationPolicy: "domain-only",
    modalOwnerWindowId: null,
    parentWindowId: null,
    launchCause: "user-click",
    recovery: { lastStableSnapshot: null, crashCount: 0, lastCrashAt: null, quarantined: false },
    evidence: { createdAt: now, lastTransitionAt: now, transitionCount: 0 },
    ...partial,
  };
}

// ── Transition Validator ────────────────────────────────────────
export function isValidTransition(
  currentState: WindowLifecycleState,
  transitionName: string
): boolean {
  const t = LIFECYCLE_TRANSITIONS[transitionName];
  if (!t) return false;
  return t.from.includes(currentState);
}