// ═══════════════════════════════════════════════════════════════
// Nova SDK — Window Server
// Centralized window lifecycle, focus, snapping, workspaces
// ═══════════════════════════════════════════════════════════════

import type { SystemService, ServiceStatus } from "./service-manager";
import { NovaEvents } from "../input/events";

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number; y: number;
  width: number; height: number;
  minWidth: number; minHeight: number;
  maxWidth: number; maxHeight: number;
  state: "normal" | "minimized" | "maximized" | "fullscreen";
  focused: boolean;
  zIndex: number;
  workspace: number;
  groupId?: string;
  createdAt: number;
}

export interface WindowRule {
  match: { appId?: string; title?: string };
  action: {
    snap?: "left" | "right" | "top" | "bottom";
    workspace?: number;
    size?: { width: number; height: number };
    position?: { x: number; y: number };
  };
}

export interface SnapZone {
  region: "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  bounds: { x: number; y: number; width: number; height: number };
}

const SNAP_THRESHOLD = 8;
const SCREEN_W = 1440;
const SCREEN_H = 900;

class WindowServerClass implements SystemService {
  id = "WindowServer";
  status: ServiceStatus = "stopped";

  private windows = new Map<string, WindowState>();
  private focusStack: string[] = []; // MRU order
  private nextZIndex = 100;
  private workspaceCount = 4;
  private activeWorkspace = 0;
  private rules: WindowRule[] = [];
  private windowCounter = 0;

  boot(): void {
    this.status = "running";
  }

  shutdown(): void {
    this.windows.clear();
    this.focusStack = [];
    this.nextZIndex = 100;
    this.status = "stopped";
  }

  // ── Window Lifecycle ──

  createWindow(appId: string, title: string, opts?: Partial<WindowState>): WindowState {
    const id = `win_${++this.windowCounter}_${Date.now()}`;
    const win: WindowState = {
      id, appId, title,
      x: opts?.x ?? 80 + (this.windowCounter % 10) * 24,
      y: opts?.y ?? 60 + (this.windowCounter % 10) * 24,
      width: opts?.width ?? 800,
      height: opts?.height ?? 600,
      minWidth: opts?.minWidth ?? 200,
      minHeight: opts?.minHeight ?? 150,
      maxWidth: opts?.maxWidth ?? SCREEN_W,
      maxHeight: opts?.maxHeight ?? SCREEN_H,
      state: "normal",
      focused: false,
      zIndex: this.nextZIndex++,
      workspace: this.activeWorkspace,
      groupId: opts?.groupId,
      createdAt: Date.now(),
    };

    // Apply matching rules
    for (const rule of this.rules) {
      if (rule.match.appId && rule.match.appId !== appId) continue;
      if (rule.match.title && !title.includes(rule.match.title)) continue;
      if (rule.action.size) { win.width = rule.action.size.width; win.height = rule.action.size.height; }
      if (rule.action.position) { win.x = rule.action.position.x; win.y = rule.action.position.y; }
      if (rule.action.workspace !== undefined) win.workspace = rule.action.workspace;
      if (rule.action.snap) this.applySnap(win, rule.action.snap);
    }

    this.windows.set(id, win);
    this.focus(id);
    NovaEvents.emit("app:state-change", { event: "window:created", windowId: id, appId });
    return win;
  }

  closeWindow(id: string): boolean {
    const win = this.windows.get(id);
    if (!win) return false;
    this.windows.delete(id);
    this.focusStack = this.focusStack.filter(w => w !== id);
    NovaEvents.emit("app:state-change", { event: "window:closed", windowId: id, appId: win.appId });
    // Focus next in stack
    if (this.focusStack.length > 0) this.focus(this.focusStack[0]);
    return true;
  }

  // ── Focus Management ──

  focus(id: string): void {
    const win = this.windows.get(id);
    if (!win) return;

    // Unfocus current
    for (const w of this.windows.values()) w.focused = false;

    win.focused = true;
    win.zIndex = this.nextZIndex++;
    this.focusStack = [id, ...this.focusStack.filter(w => w !== id)];

    NovaEvents.emit("focus:change", { windowId: id, appId: win.appId });
  }

  getFocusedWindow(): WindowState | undefined {
    return this.focusStack.length > 0 ? this.windows.get(this.focusStack[0]) : undefined;
  }

  // ── Window State ──

  minimize(id: string): void {
    const win = this.windows.get(id);
    if (!win) return;
    win.state = "minimized";
    win.focused = false;
    this.focusStack = this.focusStack.filter(w => w !== id);
    if (this.focusStack.length > 0) this.focus(this.focusStack[0]);
    NovaEvents.emit("app:state-change", { event: "window:minimized", windowId: id });
  }

  maximize(id: string): void {
    const win = this.windows.get(id);
    if (!win) return;
    win.state = "maximized";
    win.x = 0; win.y = 0;
    win.width = SCREEN_W; win.height = SCREEN_H;
    NovaEvents.emit("app:state-change", { event: "window:maximized", windowId: id });
  }

  restore(id: string): void {
    const win = this.windows.get(id);
    if (!win) return;
    win.state = "normal";
    NovaEvents.emit("app:state-change", { event: "window:restored", windowId: id });
  }

  fullscreen(id: string): void {
    const win = this.windows.get(id);
    if (!win) return;
    win.state = "fullscreen";
    win.x = 0; win.y = 0; win.width = SCREEN_W; win.height = SCREEN_H;
  }

  // ── Snapping ──

  snap(id: string, region: "left" | "right" | "top" | "bottom"): void {
    const win = this.windows.get(id);
    if (!win) return;
    this.applySnap(win, region);
    NovaEvents.emit("app:state-change", { event: "window:snapped", windowId: id, region });
  }

  /** Check if a position triggers edge snapping */
  detectSnap(x: number, y: number): SnapZone | null {
    if (x <= SNAP_THRESHOLD) return { region: "left", bounds: { x: 0, y: 0, width: SCREEN_W / 2, height: SCREEN_H } };
    if (x >= SCREEN_W - SNAP_THRESHOLD) return { region: "right", bounds: { x: SCREEN_W / 2, y: 0, width: SCREEN_W / 2, height: SCREEN_H } };
    if (y <= SNAP_THRESHOLD) return { region: "top", bounds: { x: 0, y: 0, width: SCREEN_W, height: SCREEN_H / 2 } };
    if (y >= SCREEN_H - SNAP_THRESHOLD) return { region: "bottom", bounds: { x: 0, y: SCREEN_H / 2, width: SCREEN_W, height: SCREEN_H / 2 } };
    return null;
  }

  // ── Window Groups ──

  closeGroup(groupId: string): void {
    for (const [id, win] of this.windows) {
      if (win.groupId === groupId) this.closeWindow(id);
    }
  }

  minimizeGroup(groupId: string): void {
    for (const [id, win] of this.windows) {
      if (win.groupId === groupId) this.minimize(id);
    }
  }

  // ── Workspace ──

  switchWorkspace(index: number): void {
    if (index < 0 || index >= this.workspaceCount) return;
    this.activeWorkspace = index;
    NovaEvents.emit("app:state-change", { event: "workspace:switch", workspace: index });
  }

  getActiveWorkspace(): number { return this.activeWorkspace; }

  getWindowsForWorkspace(workspace?: number): WindowState[] {
    const ws = workspace ?? this.activeWorkspace;
    return [...this.windows.values()].filter(w => w.workspace === ws).sort((a, b) => a.zIndex - b.zIndex);
  }

  // ── Rules ──

  addRule(rule: WindowRule): void {
    this.rules.push(rule);
  }

  // ── Tiling ──

  tileAll(): void {
    const wins = this.getWindowsForWorkspace();
    if (wins.length === 0) return;
    const cols = Math.ceil(Math.sqrt(wins.length));
    const rows = Math.ceil(wins.length / cols);
    const w = SCREEN_W / cols;
    const h = SCREEN_H / rows;
    wins.forEach((win, i) => {
      win.x = (i % cols) * w;
      win.y = Math.floor(i / cols) * h;
      win.width = w;
      win.height = h;
      win.state = "normal";
    });
  }

  cascade(): void {
    const wins = this.getWindowsForWorkspace();
    wins.forEach((win, i) => {
      win.x = 40 + i * 28;
      win.y = 40 + i * 28;
      win.width = 700;
      win.height = 500;
      win.state = "normal";
    });
  }

  // ── Queries ──

  getWindow(id: string): WindowState | undefined { return this.windows.get(id); }
  getAllWindows(): WindowState[] { return [...this.windows.values()]; }

  getWindowsByApp(appId: string): WindowState[] {
    return [...this.windows.values()].filter(w => w.appId === appId);
  }

  // ── Stats ──

  getStats() {
    return {
      windowCount: this.windows.size,
      focusStackDepth: this.focusStack.length,
      activeWorkspace: this.activeWorkspace,
      workspaceCount: this.workspaceCount,
      zIndexCounter: this.nextZIndex,
      ruleCount: this.rules.length,
    };
  }

  getDiagnostics() {
    return {
      ...this.getStats(),
      windows: [...this.windows.values()].map(w => ({
        id: w.id, app: w.appId, title: w.title,
        state: w.state, focused: w.focused, workspace: w.workspace,
        bounds: `${w.x},${w.y} ${w.width}×${w.height}`,
      })),
      focusOrder: this.focusStack.slice(0, 5),
    };
  }

  reset(): void {
    this.shutdown();
    this.windowCounter = 0;
    this.rules = [];
    this.activeWorkspace = 0;
  }

  // ── Private ──

  private applySnap(win: WindowState, region: "left" | "right" | "top" | "bottom"): void {
    switch (region) {
      case "left":   win.x = 0; win.y = 0; win.width = SCREEN_W / 2; win.height = SCREEN_H; break;
      case "right":  win.x = SCREEN_W / 2; win.y = 0; win.width = SCREEN_W / 2; win.height = SCREEN_H; break;
      case "top":    win.x = 0; win.y = 0; win.width = SCREEN_W; win.height = SCREEN_H / 2; break;
      case "bottom": win.x = 0; win.y = SCREEN_H / 2; win.width = SCREEN_W; win.height = SCREEN_H / 2; break;
    }
    win.state = "normal";
  }
}

export const WindowServer = new WindowServerClass();
