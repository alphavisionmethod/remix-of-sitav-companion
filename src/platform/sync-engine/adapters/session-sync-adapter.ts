// ═══════════════════════════════════════════════════════════════
// SITA OS — Session Sync Adapter
// Continuity: open apps, window layouts, handoff, resume tokens
// ═══════════════════════════════════════════════════════════════

import { syncd } from "../syncd";

/** Window layout descriptor for cross-device restore */
export interface WindowLayoutDescriptor {
  windowId: string;
  appId: string;
  title: string;
  bounds: { x: number; y: number; width: number; height: number };
  state: "normal" | "maximized" | "minimized" | "fullscreen";
  zIndex: number;
  workspaceId?: string;
}

/** Session snapshot representing full working context */
export interface SessionSnapshot {
  sessionId: string;
  deviceId: string;
  capturedAt: string;
  /** Open applications with their states */
  openApps: AppSessionState[];
  /** Window layout descriptors */
  windowLayouts: WindowLayoutDescriptor[];
  /** Tab groups (browser/editor) */
  tabGroups: TabGroup[];
  /** Active workspace ID */
  activeWorkspaceId: string;
  /** Recent documents */
  recentDocuments: RecentDocument[];
  /** Resume token for handoff */
  resumeToken: string;
  /** Handoff candidates — what can be continued on another device */
  handoffCandidates: HandoffCandidate[];
}

export interface AppSessionState {
  appId: string;
  displayName: string;
  isActive: boolean;
  isFocused: boolean;
  statePayload: Record<string, unknown>;
  lastInteractedAt: string;
}

export interface TabGroup {
  id: string;
  label: string;
  appId: string;
  tabs: { id: string; title: string; url?: string; active: boolean; pinned: boolean }[];
}

export interface RecentDocument {
  id: string;
  path: string;
  appId: string;
  title: string;
  lastOpenedAt: string;
  thumbnailRef?: string;
}

export interface HandoffCandidate {
  id: string;
  appId: string;
  displayName: string;
  description: string;
  resumePayload: Record<string, unknown>;
  createdAt: string;
  /** Which device types can receive this handoff */
  targetDeviceTypes: ("desktop" | "mobile" | "web" | "tablet")[];
}

class SessionSyncAdapter {
  private running = false;
  private currentSnapshot: SessionSnapshot | null = null;
  private snapshotObjectId: string | null = null;
  private handoffObjectIds = new Map<string, string>();
  private captureInterval: ReturnType<typeof setInterval> | null = null;
  private readonly CAPTURE_INTERVAL_MS = 30000; // Capture session every 30s

  /** Start session sync */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.captureInterval = setInterval(() => this.captureAndSync(), this.CAPTURE_INTERVAL_MS);
    console.log("[SessionSyncAdapter] Started");
  }

  /** Stop session sync */
  stop(): void {
    this.running = false;
    if (this.captureInterval) clearInterval(this.captureInterval);
    this.captureInterval = null;
  }

  /** Capture current session state and push to sync */
  captureAndSync(): void {
    if (!this.running) return;

    const snapshot = this.captureCurrentSession();
    this.currentSnapshot = snapshot;

    const obj = syncd.upsertObject({
      id: this.snapshotObjectId ?? undefined,
      type: "session",
      namespace: "session.desktop.workspace",
      payload: snapshot,
      metadata: {
        capturedAt: snapshot.capturedAt,
        appCount: snapshot.openApps.length,
        windowCount: snapshot.windowLayouts.length,
      },
    });

    if (!this.snapshotObjectId) {
      this.snapshotObjectId = obj.id;
    }

    // Sync handoff candidates separately for real-time availability
    for (const candidate of snapshot.handoffCandidates) {
      const existingId = this.handoffObjectIds.get(candidate.id);
      const handoffObj = syncd.upsertObject({
        id: existingId ?? undefined,
        type: "session",
        namespace: "device.presence",
        payload: candidate,
        metadata: { handoffId: candidate.id, appId: candidate.appId },
      });
      if (!existingId) {
        this.handoffObjectIds.set(candidate.id, handoffObj.id);
      }
    }
  }

  /** Restore a session from a remote snapshot */
  restoreSession(snapshot: SessionSnapshot): SessionRestoreResult {
    const result: SessionRestoreResult = {
      restoredApps: [],
      restoredWindows: 0,
      skippedApps: [],
      errors: [],
    };

    for (const app of snapshot.openApps) {
      try {
        result.restoredApps.push(app.appId);
      } catch (err) {
        result.errors.push(`Failed to restore ${app.appId}: ${String(err)}`);
        result.skippedApps.push(app.appId);
      }
    }

    result.restoredWindows = snapshot.windowLayouts.length;
    return result;
  }

  /** Accept a handoff from another device */
  acceptHandoff(candidate: HandoffCandidate): boolean {
    console.log(`[SessionSyncAdapter] Accepting handoff: ${candidate.displayName} from ${candidate.appId}`);
    // In production, this would launch the app with the resume payload
    return true;
  }

  /** Create a handoff candidate for the current activity */
  createHandoff(params: {
    appId: string;
    displayName: string;
    description: string;
    resumePayload: Record<string, unknown>;
    targetDeviceTypes?: HandoffCandidate["targetDeviceTypes"];
  }): HandoffCandidate {
    const candidate: HandoffCandidate = {
      id: `handoff_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      appId: params.appId,
      displayName: params.displayName,
      description: params.description,
      resumePayload: params.resumePayload,
      createdAt: new Date().toISOString(),
      targetDeviceTypes: params.targetDeviceTypes ?? ["desktop", "mobile", "web", "tablet"],
    };

    const obj = syncd.upsertObject({
      type: "session",
      namespace: "device.presence",
      payload: candidate,
      metadata: { handoffId: candidate.id },
    });
    this.handoffObjectIds.set(candidate.id, obj.id);
    return candidate;
  }

  /** Get available handoff candidates from other devices */
  getAvailableHandoffs(): HandoffCandidate[] {
    const presenceObjects = syncd.queryObjects({
      namespace: "device.presence",
      type: "session",
      deleted: false,
    });

    return presenceObjects
      .filter(obj => obj.metadata?.handoffId)
      .map(obj => obj.payload as unknown as HandoffCandidate)
      .filter(Boolean);
  }

  /** Get the current session snapshot */
  getCurrentSnapshot(): SessionSnapshot | null {
    return this.currentSnapshot;
  }

  /** Get recent documents from session */
  getRecentDocuments(): RecentDocument[] {
    return this.currentSnapshot?.recentDocuments ?? [];
  }

  // ─── Internal ───────────────────────────────

  private captureCurrentSession(): SessionSnapshot {
    return {
      sessionId: `session_${Date.now()}`,
      deviceId: "current-device",
      capturedAt: new Date().toISOString(),
      openApps: this.captureOpenApps(),
      windowLayouts: this.captureWindowLayouts(),
      tabGroups: [],
      activeWorkspaceId: "default",
      recentDocuments: this.captureRecentDocuments(),
      resumeToken: `resume_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      handoffCandidates: [],
    };
  }

  private captureOpenApps(): AppSessionState[] {
    // In production, this would query the window manager
    return [
      { appId: "com.sita.files", displayName: "Files", isActive: true, isFocused: false,
        statePayload: { currentPath: "/home/user/Documents" }, lastInteractedAt: new Date().toISOString() },
      { appId: "com.sita.settings", displayName: "Settings", isActive: true, isFocused: true,
        statePayload: { currentPanel: "sync" }, lastInteractedAt: new Date().toISOString() },
    ];
  }

  private captureWindowLayouts(): WindowLayoutDescriptor[] {
    return [
      { windowId: "w1", appId: "com.sita.files", title: "Files - Documents",
        bounds: { x: 100, y: 100, width: 800, height: 600 }, state: "normal", zIndex: 1 },
      { windowId: "w2", appId: "com.sita.settings", title: "Settings",
        bounds: { x: 200, y: 150, width: 700, height: 500 }, state: "normal", zIndex: 2 },
    ];
  }

  private captureRecentDocuments(): RecentDocument[] {
    return [
      { id: "rd1", path: "/Documents/report.pdf", appId: "com.sita.viewer", title: "Q4 Report",
        lastOpenedAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "rd2", path: "/Documents/notes.md", appId: "com.nova.notes", title: "Meeting Notes",
        lastOpenedAt: new Date(Date.now() - 7200000).toISOString() },
    ];
  }
}

export interface SessionRestoreResult {
  restoredApps: string[];
  restoredWindows: number;
  skippedApps: string[];
  errors: string[];
}

/** Singleton session sync adapter */
export const sessionSyncAdapter = new SessionSyncAdapter();
