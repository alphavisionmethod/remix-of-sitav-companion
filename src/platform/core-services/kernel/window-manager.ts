// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: Window Manager
// Manages window lifecycle, stacking order, tiling layouts,
// focus policies, workspace switching, and virtual desktops.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export type WMWindowState = "normal" | "maximized" | "minimized" | "fullscreen" | "tiled" | "floating" | "hidden" | "destroyed";
export type WMFocusPolicy = "click-to-focus" | "focus-follows-mouse" | "sloppy-focus";
export type WMStackingMode = "floating" | "tiling" | "hybrid";
export type WMTilingStrategy = "bsp" | "columns" | "rows" | "spiral" | "monocle" | "grid";

// ── Window ───────────────────────────────────────────────────

export interface WMWindow {
  id: string;
  title: string;
  appId: string;
  pid: number;
  state: WMWindowState;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  zIndex: number;
  opacity: number;
  focused: boolean;
  modal: boolean;
  transientFor: string | null; // parent window ID
  workspace: number;
  monitor: string;
  urgentHint: boolean;
  decorations: boolean;
  resizable: boolean;
  movable: boolean;
  closable: boolean;
  // Saved geometry for restore from maximized/fullscreen
  savedGeometry: { x: number; y: number; width: number; height: number } | null;
  createdAt: number;
  lastFocusedAt: number;
}

// ── Workspace ────────────────────────────────────────────────

export interface WMWorkspace {
  id: number;
  name: string;
  active: boolean;
  monitor: string;
  tilingStrategy: WMTilingStrategy;
  stackingMode: WMStackingMode;
  windowIds: string[];
  gapSize: number;         // pixels between tiled windows
  outerGap: number;        // pixels from screen edge
}

// ── Tiling Layout ────────────────────────────────────────────

export interface TilingNode {
  type: "split" | "leaf";
  direction?: "horizontal" | "vertical";
  ratio?: number;          // split ratio (0-1)
  windowId?: string;       // for leaf nodes
  children?: [TilingNode, TilingNode]; // for split nodes
}

// ── Focus History ────────────────────────────────────────────

export interface FocusHistoryEntry {
  windowId: string;
  timestamp: number;
  workspace: number;
}

// ── Window Manager Stats ─────────────────────────────────────

export interface WindowManagerStats {
  totalWindows: number;
  visibleWindows: number;
  focusedWindowId: string | null;
  workspaceCount: number;
  activeWorkspace: number;
  stackingMode: WMStackingMode;
  focusPolicy: WMFocusPolicy;
  focusHistoryLength: number;
  windowsByState: Record<string, number>;
  windowsByWorkspace: Record<number, number>;
}

// ── Window Manager Implementation ────────────────────────────

export class WindowManager {
  private windows: Map<string, WMWindow> = new Map();
  private workspaces: Map<number, WMWorkspace> = new Map();
  private focusHistory: FocusHistoryEntry[] = [];
  private focusedWindowId: string | null = null;
  private focusPolicy: WMFocusPolicy = "click-to-focus";
  private tilingTrees: Map<number, TilingNode | null> = new Map(); // per workspace
  private nextId = 1;
  private nextZIndex = 1;

  constructor(workspaceCount = 4) {
    for (let i = 1; i <= workspaceCount; i++) {
      this.workspaces.set(i, {
        id: i, name: `Workspace ${i}`, active: i === 1,
        monitor: "primary", tilingStrategy: "bsp",
        stackingMode: "hybrid", windowIds: [],
        gapSize: 8, outerGap: 8,
      });
      this.tilingTrees.set(i, null);
    }
  }

  // ── Window Lifecycle ──────────────────────────────────────

  createWindow(config: {
    title: string; appId: string; pid: number;
    x?: number; y?: number; width?: number; height?: number;
    workspace?: number; modal?: boolean; transientFor?: string;
    decorations?: boolean; resizable?: boolean;
  }): WMWindow {
    const id = `win-${this.nextId++}`;
    const workspace = config.workspace ?? this.getActiveWorkspaceId();
    const win: WMWindow = {
      id, title: config.title, appId: config.appId, pid: config.pid,
      state: "normal",
      x: config.x ?? 100, y: config.y ?? 100,
      width: config.width ?? 800, height: config.height ?? 600,
      minWidth: 200, minHeight: 150, maxWidth: Infinity, maxHeight: Infinity,
      zIndex: this.nextZIndex++, opacity: 1,
      focused: false, modal: config.modal ?? false,
      transientFor: config.transientFor ?? null,
      workspace, monitor: "primary", urgentHint: false,
      decorations: config.decorations ?? true,
      resizable: config.resizable ?? true,
      movable: true, closable: true,
      savedGeometry: null,
      createdAt: Date.now(), lastFocusedAt: 0,
    };
    this.windows.set(id, win);
    const ws = this.workspaces.get(workspace);
    if (ws) ws.windowIds.push(id);
    this.focusWindow(id);
    return win;
  }

  destroyWindow(id: string): boolean {
    const win = this.windows.get(id);
    if (!win) return false;
    win.state = "destroyed";
    // Remove from workspace
    const ws = this.workspaces.get(win.workspace);
    if (ws) ws.windowIds = ws.windowIds.filter(w => w !== id);
    // Handle focus
    if (this.focusedWindowId === id) {
      this.focusedWindowId = null;
      this.focusPreviousWindow();
    }
    // Remove children (transient windows)
    for (const [childId, child] of this.windows) {
      if (child.transientFor === id) this.destroyWindow(childId);
    }
    this.windows.delete(id);
    return true;
  }

  // ── Focus Management ──────────────────────────────────────

  focusWindow(id: string): boolean {
    const win = this.windows.get(id);
    if (!win || win.state === "destroyed" || win.state === "hidden") return false;

    // Unfocus previous
    if (this.focusedWindowId) {
      const prev = this.windows.get(this.focusedWindowId);
      if (prev) prev.focused = false;
    }

    win.focused = true;
    win.lastFocusedAt = Date.now();
    win.urgentHint = false;
    this.focusedWindowId = id;

    // Raise to top
    win.zIndex = this.nextZIndex++;

    // Record in focus history
    this.focusHistory.push({ windowId: id, timestamp: Date.now(), workspace: win.workspace });
    if (this.focusHistory.length > 100) this.focusHistory = this.focusHistory.slice(-50);

    // Switch workspace if needed
    if (!this.workspaces.get(win.workspace)?.active) {
      this.switchWorkspace(win.workspace);
    }

    return true;
  }

  private focusPreviousWindow(): void {
    const activeWs = this.getActiveWorkspaceId();
    const candidates = Array.from(this.windows.values())
      .filter(w => w.workspace === activeWs && w.state !== "minimized" && w.state !== "hidden" && w.state !== "destroyed")
      .sort((a, b) => b.lastFocusedAt - a.lastFocusedAt);
    if (candidates.length > 0) {
      this.focusWindow(candidates[0].id);
    }
  }

  getFocusedWindow(): WMWindow | null {
    return this.focusedWindowId ? this.windows.get(this.focusedWindowId) ?? null : null;
  }

  setFocusPolicy(policy: WMFocusPolicy): void {
    this.focusPolicy = policy;
  }

  cycleFocus(direction: "forward" | "backward"): string | null {
    const activeWs = this.getActiveWorkspaceId();
    const visible = Array.from(this.windows.values())
      .filter(w => w.workspace === activeWs && w.state !== "minimized" && w.state !== "hidden" && w.state !== "destroyed")
      .sort((a, b) => a.zIndex - b.zIndex);
    if (visible.length === 0) return null;
    const currentIdx = visible.findIndex(w => w.id === this.focusedWindowId);
    const delta = direction === "forward" ? 1 : -1;
    const nextIdx = (currentIdx + delta + visible.length) % visible.length;
    this.focusWindow(visible[nextIdx].id);
    return visible[nextIdx].id;
  }

  // ── Window State Changes ──────────────────────────────────

  maximize(id: string): boolean {
    const win = this.windows.get(id);
    if (!win || win.state === "maximized") return false;
    win.savedGeometry = { x: win.x, y: win.y, width: win.width, height: win.height };
    win.state = "maximized";
    // Would use monitor dimensions in real impl
    win.x = 0; win.y = 0; win.width = 1920; win.height = 1080;
    return true;
  }

  minimize(id: string): boolean {
    const win = this.windows.get(id);
    if (!win || win.state === "minimized") return false;
    if (win.state === "normal" || win.state === "floating") {
      win.savedGeometry = { x: win.x, y: win.y, width: win.width, height: win.height };
    }
    win.state = "minimized";
    if (this.focusedWindowId === id) {
      this.focusedWindowId = null;
      this.focusPreviousWindow();
    }
    return true;
  }

  restore(id: string): boolean {
    const win = this.windows.get(id);
    if (!win) return false;
    if (win.savedGeometry) {
      win.x = win.savedGeometry.x; win.y = win.savedGeometry.y;
      win.width = win.savedGeometry.width; win.height = win.savedGeometry.height;
      win.savedGeometry = null;
    }
    win.state = "normal";
    this.focusWindow(id);
    return true;
  }

  setFullscreen(id: string, fullscreen: boolean): boolean {
    const win = this.windows.get(id);
    if (!win) return false;
    if (fullscreen) {
      win.savedGeometry = { x: win.x, y: win.y, width: win.width, height: win.height };
      win.state = "fullscreen";
      win.x = 0; win.y = 0; win.width = 1920; win.height = 1080;
      win.decorations = false;
    } else {
      if (win.savedGeometry) {
        win.x = win.savedGeometry.x; win.y = win.savedGeometry.y;
        win.width = win.savedGeometry.width; win.height = win.savedGeometry.height;
        win.savedGeometry = null;
      }
      win.state = "normal";
      win.decorations = true;
    }
    return true;
  }

  moveWindow(id: string, x: number, y: number): boolean {
    const win = this.windows.get(id);
    if (!win || !win.movable) return false;
    win.x = x; win.y = y;
    return true;
  }

  resizeWindow(id: string, width: number, height: number): boolean {
    const win = this.windows.get(id);
    if (!win || !win.resizable) return false;
    win.width = Math.max(win.minWidth, Math.min(win.maxWidth, width));
    win.height = Math.max(win.minHeight, Math.min(win.maxHeight, height));
    return true;
  }

  // ── Workspace Management ──────────────────────────────────

  getActiveWorkspaceId(): number {
    for (const [id, ws] of this.workspaces) {
      if (ws.active) return id;
    }
    return 1;
  }

  switchWorkspace(id: number): boolean {
    const ws = this.workspaces.get(id);
    if (!ws) return false;
    for (const w of this.workspaces.values()) w.active = false;
    ws.active = true;
    // Focus most recent window on new workspace
    this.focusPreviousWindow();
    return true;
  }

  createWorkspace(name: string): WMWorkspace {
    const id = Math.max(...Array.from(this.workspaces.keys())) + 1;
    const ws: WMWorkspace = {
      id, name, active: false, monitor: "primary",
      tilingStrategy: "bsp", stackingMode: "hybrid",
      windowIds: [], gapSize: 8, outerGap: 8,
    };
    this.workspaces.set(id, ws);
    this.tilingTrees.set(id, null);
    return ws;
  }

  removeWorkspace(id: number): boolean {
    const ws = this.workspaces.get(id);
    if (!ws || this.workspaces.size <= 1) return false;
    // Move windows to previous workspace
    const targetId = Array.from(this.workspaces.keys()).filter(k => k !== id)[0];
    const target = this.workspaces.get(targetId)!;
    for (const winId of ws.windowIds) {
      const win = this.windows.get(winId);
      if (win) {
        win.workspace = targetId;
        target.windowIds.push(winId);
      }
    }
    if (ws.active) {
      ws.active = false;
      target.active = true;
    }
    this.workspaces.delete(id);
    this.tilingTrees.delete(id);
    return true;
  }

  moveWindowToWorkspace(windowId: string, workspaceId: number): boolean {
    const win = this.windows.get(windowId);
    const ws = this.workspaces.get(workspaceId);
    if (!win || !ws) return false;
    // Remove from current workspace
    const currentWs = this.workspaces.get(win.workspace);
    if (currentWs) currentWs.windowIds = currentWs.windowIds.filter(id => id !== windowId);
    // Add to target
    win.workspace = workspaceId;
    ws.windowIds.push(windowId);
    if (this.focusedWindowId === windowId) {
      this.focusedWindowId = null;
      this.focusPreviousWindow();
    }
    return true;
  }

  // ── Tiling ────────────────────────────────────────────────

  setTilingStrategy(workspaceId: number, strategy: WMTilingStrategy): void {
    const ws = this.workspaces.get(workspaceId);
    if (ws) ws.tilingStrategy = strategy;
  }

  setStackingMode(workspaceId: number, mode: WMStackingMode): void {
    const ws = this.workspaces.get(workspaceId);
    if (ws) ws.stackingMode = mode;
  }

  retile(workspaceId: number): void {
    const ws = this.workspaces.get(workspaceId);
    if (!ws) return;
    const tiledWindows = ws.windowIds
      .map(id => this.windows.get(id))
      .filter((w): w is WMWindow => !!w && w.state !== "minimized" && w.state !== "hidden" && w.state !== "destroyed" && w.state !== "floating");

    if (tiledWindows.length === 0) return;

    // Simplified BSP tiling
    const gap = ws.gapSize;
    const outerGap = ws.outerGap;
    const screenW = 1920 - outerGap * 2;
    const screenH = 1080 - outerGap * 2;

    switch (ws.tilingStrategy) {
      case "monocle":
        for (const w of tiledWindows) {
          w.x = outerGap; w.y = outerGap;
          w.width = screenW; w.height = screenH;
          w.state = "tiled";
        }
        break;
      case "columns":
        const colW = (screenW - gap * (tiledWindows.length - 1)) / tiledWindows.length;
        tiledWindows.forEach((w, i) => {
          w.x = outerGap + i * (colW + gap);
          w.y = outerGap;
          w.width = colW; w.height = screenH;
          w.state = "tiled";
        });
        break;
      case "bsp":
      default:
        // Master-stack: first window gets left half, rest stack on right
        if (tiledWindows.length === 1) {
          tiledWindows[0].x = outerGap; tiledWindows[0].y = outerGap;
          tiledWindows[0].width = screenW; tiledWindows[0].height = screenH;
          tiledWindows[0].state = "tiled";
        } else {
          const masterW = Math.floor(screenW * 0.55);
          tiledWindows[0].x = outerGap; tiledWindows[0].y = outerGap;
          tiledWindows[0].width = masterW; tiledWindows[0].height = screenH;
          tiledWindows[0].state = "tiled";
          const stackCount = tiledWindows.length - 1;
          const stackH = (screenH - gap * (stackCount - 1)) / stackCount;
          for (let i = 1; i < tiledWindows.length; i++) {
            tiledWindows[i].x = outerGap + masterW + gap;
            tiledWindows[i].y = outerGap + (i - 1) * (stackH + gap);
            tiledWindows[i].width = screenW - masterW - gap;
            tiledWindows[i].height = stackH;
            tiledWindows[i].state = "tiled";
          }
        }
        break;
    }
  }

  // ── Stacking Queries ──────────────────────────────────────

  getStackingOrder(): WMWindow[] {
    return Array.from(this.windows.values())
      .filter(w => w.state !== "destroyed")
      .sort((a, b) => a.zIndex - b.zIndex);
  }

  getVisibleWindows(): WMWindow[] {
    const activeWs = this.getActiveWorkspaceId();
    return Array.from(this.windows.values())
      .filter(w => w.workspace === activeWs && w.state !== "minimized" && w.state !== "hidden" && w.state !== "destroyed")
      .sort((a, b) => a.zIndex - b.zIndex);
  }

  getWindow(id: string): WMWindow | undefined { return this.windows.get(id); }
  getWorkspace(id: number): WMWorkspace | undefined { return this.workspaces.get(id); }
  listWorkspaces(): WMWorkspace[] { return Array.from(this.workspaces.values()); }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): WindowManagerStats {
    const byState: Record<string, number> = {};
    const byWorkspace: Record<number, number> = {};
    for (const w of this.windows.values()) {
      byState[w.state] = (byState[w.state] || 0) + 1;
      byWorkspace[w.workspace] = (byWorkspace[w.workspace] || 0) + 1;
    }
    return {
      totalWindows: this.windows.size,
      visibleWindows: this.getVisibleWindows().length,
      focusedWindowId: this.focusedWindowId,
      workspaceCount: this.workspaces.size,
      activeWorkspace: this.getActiveWorkspaceId(),
      stackingMode: this.workspaces.get(this.getActiveWorkspaceId())?.stackingMode ?? "hybrid",
      focusPolicy: this.focusPolicy,
      focusHistoryLength: this.focusHistory.length,
      windowsByState: byState,
      windowsByWorkspace: byWorkspace,
    };
  }
}
