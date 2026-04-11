// ═══════════════════════════════════════════════════════════════
// SITA OS — Display Server & Window Manager
// X11/Wayland-inspired compositing window manager with focus
// management, stacking order, window lifecycle, multi-monitor,
// and input routing to focused window.
// ═══════════════════════════════════════════════════════════════

import type { Rect } from "./damage-tracker";

// ── Types ────────────────────────────────────────────────────

export type WindowState = "normal" | "minimized" | "maximized" | "fullscreen" | "hidden" | "destroyed";
export type DecorationMode = "server" | "client" | "none";
export type FocusPolicy = "click" | "sloppy" | "strict";

export interface WindowDecoration {
  titleBarHeight: number;
  borderWidth: number;
  cornerRadius: number;
  showClose: boolean;
  showMinimize: boolean;
  showMaximize: boolean;
}

export interface Monitor {
  id: string;
  name: string;
  bounds: Rect;
  dpiScale: number;
  primary: boolean;
  refreshHz: number;
}

export interface WindowCreateOptions {
  title: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  decorationMode?: DecorationMode;
  alwaysOnTop?: boolean;
  modal?: boolean;
  parentId?: string;
  monitor?: string;
  opacity?: number;
}

export interface ManagedWindow {
  id: string;
  title: string;
  bounds: Rect;
  contentBounds: Rect;
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
  state: WindowState;
  zIndex: number;
  opacity: number;
  focused: boolean;
  resizable: boolean;
  decorationMode: DecorationMode;
  decoration: WindowDecoration;
  alwaysOnTop: boolean;
  modal: boolean;
  parentId: string | null;
  monitorId: string;
  createdAt: number;
  lastFocusedAt: number;
  /** Client-assigned surface damage rectangles pending composite */
  pendingDamage: Rect[];
}

export interface DisplayServerStats {
  windowCount: number;
  focusedWindowId: string | null;
  monitorCount: number;
  totalZLayers: number;
  modalStack: string[];
  focusPolicy: FocusPolicy;
}

export type WindowEvent =
  | { type: "created"; windowId: string }
  | { type: "destroyed"; windowId: string }
  | { type: "focused"; windowId: string }
  | { type: "blurred"; windowId: string }
  | { type: "moved"; windowId: string; bounds: Rect }
  | { type: "resized"; windowId: string; bounds: Rect }
  | { type: "stateChanged"; windowId: string; state: WindowState };

type WindowEventListener = (event: WindowEvent) => void;

// ── Default decoration ───────────────────────────────────────

const DEFAULT_DECORATION: WindowDecoration = {
  titleBarHeight: 30,
  borderWidth: 1,
  cornerRadius: 8,
  showClose: true,
  showMinimize: true,
  showMaximize: true,
};

const DEFAULT_MONITOR: Monitor = {
  id: "monitor-0",
  name: "Primary",
  bounds: { x: 0, y: 0, width: 1920, height: 1080 },
  dpiScale: 1,
  primary: true,
  refreshHz: 60,
};

// ═════════════════════════════════════════════════════════════

export class DisplayServer {
  private _windows = new Map<string, ManagedWindow>();
  private _monitors = new Map<string, Monitor>();
  private _zStack: string[] = []; // bottom to top
  private _focusedId: string | null = null;
  private _modalStack: string[] = [];
  private _focusPolicy: FocusPolicy = "click";
  private _nextId = 1;
  private _nextZ = 1;
  private _listeners: WindowEventListener[] = [];

  constructor(monitors?: Monitor[]) {
    const mons = monitors && monitors.length > 0 ? monitors : [DEFAULT_MONITOR];
    for (const m of mons) this._monitors.set(m.id, { ...m });
  }

  // ── Monitor management ─────────────────────────────────────

  addMonitor(monitor: Monitor): void {
    this._monitors.set(monitor.id, { ...monitor });
  }

  removeMonitor(id: string): void {
    // Migrate windows to primary
    const primary = this._getPrimaryMonitor();
    for (const w of this._windows.values()) {
      if (w.monitorId === id) w.monitorId = primary.id;
    }
    this._monitors.delete(id);
  }

  getMonitors(): Monitor[] {
    return Array.from(this._monitors.values());
  }

  private _getPrimaryMonitor(): Monitor {
    for (const m of this._monitors.values()) if (m.primary) return m;
    return this._monitors.values().next().value!;
  }

  // ── Window lifecycle ───────────────────────────────────────

  createWindow(opts: WindowCreateOptions): ManagedWindow {
    const id = `win-${this._nextId++}`;
    const monitorId = opts.monitor ?? this._getPrimaryMonitor().id;
    const hasDecoration = (opts.decorationMode ?? "server") === "server";
    const decoration = hasDecoration ? { ...DEFAULT_DECORATION } : { ...DEFAULT_DECORATION, titleBarHeight: 0, borderWidth: 0 };

    const bounds: Rect = {
      x: opts.x ?? 100,
      y: opts.y ?? 100,
      width: opts.width,
      height: opts.height,
    };

    const contentBounds: Rect = {
      x: bounds.x + decoration.borderWidth,
      y: bounds.y + decoration.titleBarHeight,
      width: bounds.width - decoration.borderWidth * 2,
      height: bounds.height - decoration.titleBarHeight - decoration.borderWidth,
    };

    const win: ManagedWindow = {
      id,
      title: opts.title,
      bounds,
      contentBounds,
      minSize: { width: opts.minWidth ?? 100, height: opts.minHeight ?? 80 },
      maxSize: { width: opts.maxWidth ?? Infinity, height: opts.maxHeight ?? Infinity },
      state: "normal",
      zIndex: this._nextZ++,
      opacity: opts.opacity ?? 1,
      focused: false,
      resizable: opts.resizable ?? true,
      decorationMode: opts.decorationMode ?? "server",
      decoration,
      alwaysOnTop: opts.alwaysOnTop ?? false,
      modal: opts.modal ?? false,
      parentId: opts.parentId ?? null,
      monitorId,
      createdAt: Date.now(),
      lastFocusedAt: 0,
      pendingDamage: [],
    };

    this._windows.set(id, win);
    this._insertIntoZStack(id, win.alwaysOnTop);

    if (win.modal) this._modalStack.push(id);

    this._emit({ type: "created", windowId: id });
    this.focusWindow(id);
    return win;
  }

  destroyWindow(id: string): boolean {
    const win = this._windows.get(id);
    if (!win) return false;

    win.state = "destroyed";
    this._zStack = this._zStack.filter((w) => w !== id);
    this._modalStack = this._modalStack.filter((w) => w !== id);

    // Destroy children
    for (const [childId, child] of this._windows) {
      if (child.parentId === id) this.destroyWindow(childId);
    }

    this._windows.delete(id);
    this._emit({ type: "destroyed", windowId: id });

    // Refocus
    if (this._focusedId === id) {
      this._focusedId = null;
      const topId = this._zStack[this._zStack.length - 1];
      if (topId) this.focusWindow(topId);
    }

    return true;
  }

  getWindow(id: string): ManagedWindow | undefined {
    return this._windows.get(id);
  }

  getAllWindows(): ManagedWindow[] {
    return Array.from(this._windows.values());
  }

  // ── Focus management ───────────────────────────────────────

  focusWindow(id: string): boolean {
    const win = this._windows.get(id);
    if (!win || win.state === "minimized" || win.state === "destroyed") return false;

    // Modal blocking: only allow focus on top modal or its children
    if (this._modalStack.length > 0) {
      const topModal = this._modalStack[this._modalStack.length - 1];
      if (id !== topModal && win.parentId !== topModal) return false;
    }

    // Blur current
    if (this._focusedId && this._focusedId !== id) {
      const prev = this._windows.get(this._focusedId);
      if (prev) {
        prev.focused = false;
        this._emit({ type: "blurred", windowId: this._focusedId });
      }
    }

    win.focused = true;
    win.lastFocusedAt = Date.now();
    this._focusedId = id;
    this._raiseToTop(id);
    this._emit({ type: "focused", windowId: id });
    return true;
  }

  getFocusedWindow(): ManagedWindow | null {
    return this._focusedId ? this._windows.get(this._focusedId) ?? null : null;
  }

  setFocusPolicy(policy: FocusPolicy): void {
    this._focusPolicy = policy;
  }

  // ── Window operations ──────────────────────────────────────

  moveWindow(id: string, x: number, y: number): boolean {
    const win = this._windows.get(id);
    if (!win || win.state === "maximized" || win.state === "fullscreen") return false;

    win.bounds.x = x;
    win.bounds.y = y;
    this._updateContentBounds(win);
    this._emit({ type: "moved", windowId: id, bounds: { ...win.bounds } });
    return true;
  }

  resizeWindow(id: string, width: number, height: number): boolean {
    const win = this._windows.get(id);
    if (!win || !win.resizable || win.state === "fullscreen") return false;

    win.bounds.width = Math.max(win.minSize.width, Math.min(win.maxSize.width, width));
    win.bounds.height = Math.max(win.minSize.height, Math.min(win.maxSize.height, height));
    this._updateContentBounds(win);
    this._emit({ type: "resized", windowId: id, bounds: { ...win.bounds } });
    return true;
  }

  minimizeWindow(id: string): boolean {
    const win = this._windows.get(id);
    if (!win || win.state === "destroyed") return false;

    win.state = "minimized";
    win.focused = false;
    if (this._focusedId === id) {
      this._focusedId = null;
      // Focus next visible
      for (let i = this._zStack.length - 1; i >= 0; i--) {
        const candidate = this._windows.get(this._zStack[i]);
        if (candidate && candidate.state !== "minimized" && candidate.state !== "destroyed") {
          this.focusWindow(this._zStack[i]);
          break;
        }
      }
    }
    this._emit({ type: "stateChanged", windowId: id, state: "minimized" });
    return true;
  }

  maximizeWindow(id: string): boolean {
    const win = this._windows.get(id);
    if (!win || win.state === "destroyed") return false;

    const monitor = this._monitors.get(win.monitorId) ?? this._getPrimaryMonitor();
    win.state = "maximized";
    win.bounds = { ...monitor.bounds };
    this._updateContentBounds(win);
    this._emit({ type: "stateChanged", windowId: id, state: "maximized" });
    return true;
  }

  restoreWindow(id: string): boolean {
    const win = this._windows.get(id);
    if (!win) return false;
    win.state = "normal";
    this._emit({ type: "stateChanged", windowId: id, state: "normal" });
    return true;
  }

  setFullscreen(id: string, fullscreen: boolean): boolean {
    const win = this._windows.get(id);
    if (!win) return false;

    if (fullscreen) {
      const monitor = this._monitors.get(win.monitorId) ?? this._getPrimaryMonitor();
      win.state = "fullscreen";
      win.bounds = { ...monitor.bounds };
      win.contentBounds = { ...monitor.bounds };
    } else {
      win.state = "normal";
      this._updateContentBounds(win);
    }
    this._emit({ type: "stateChanged", windowId: id, state: win.state });
    return true;
  }

  setWindowOpacity(id: string, opacity: number): boolean {
    const win = this._windows.get(id);
    if (!win) return false;
    win.opacity = Math.max(0, Math.min(1, opacity));
    return true;
  }

  setAlwaysOnTop(id: string, alwaysOnTop: boolean): boolean {
    const win = this._windows.get(id);
    if (!win) return false;
    win.alwaysOnTop = alwaysOnTop;
    this._rebuildZStack();
    return true;
  }

  // ── Stacking / Z-order ─────────────────────────────────────

  getZOrderedWindows(): ManagedWindow[] {
    return this._zStack
      .map((id) => this._windows.get(id))
      .filter((w): w is ManagedWindow => w !== undefined && w.state !== "destroyed");
  }

  /** Returns window at screen point (top-most first) */
  windowAtPoint(x: number, y: number): ManagedWindow | null {
    for (let i = this._zStack.length - 1; i >= 0; i--) {
      const win = this._windows.get(this._zStack[i]);
      if (!win || win.state === "minimized" || win.state === "destroyed") continue;
      if (
        x >= win.bounds.x && x < win.bounds.x + win.bounds.width &&
        y >= win.bounds.y && y < win.bounds.y + win.bounds.height
      ) {
        return win;
      }
    }
    return null;
  }

  // ── Surface damage ─────────────────────────────────────────

  submitDamage(windowId: string, localRect: Rect): void {
    const win = this._windows.get(windowId);
    if (!win) return;
    // Convert to screen coordinates
    win.pendingDamage.push({
      x: win.contentBounds.x + localRect.x,
      y: win.contentBounds.y + localRect.y,
      width: localRect.width,
      height: localRect.height,
    });
  }

  collectDamage(): Rect[] {
    const rects: Rect[] = [];
    for (const win of this._windows.values()) {
      rects.push(...win.pendingDamage);
      win.pendingDamage = [];
    }
    return rects;
  }

  // ── Events ─────────────────────────────────────────────────

  addEventListener(listener: WindowEventListener): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== listener);
    };
  }

  // ── Stats ──────────────────────────────────────────────────

  getStats(): DisplayServerStats {
    return {
      windowCount: this._windows.size,
      focusedWindowId: this._focusedId,
      monitorCount: this._monitors.size,
      totalZLayers: this._zStack.length,
      modalStack: [...this._modalStack],
      focusPolicy: this._focusPolicy,
    };
  }

  // ── Internal ───────────────────────────────────────────────

  private _emit(event: WindowEvent): void {
    for (const l of this._listeners) l(event);
  }

  private _insertIntoZStack(id: string, alwaysOnTop: boolean): void {
    if (alwaysOnTop) {
      this._zStack.push(id);
    } else {
      // Insert below always-on-top windows
      let insertIdx = this._zStack.length;
      for (let i = this._zStack.length - 1; i >= 0; i--) {
        const w = this._windows.get(this._zStack[i]);
        if (w && w.alwaysOnTop) insertIdx = i;
        else break;
      }
      this._zStack.splice(insertIdx, 0, id);
    }
  }

  private _raiseToTop(id: string): void {
    this._zStack = this._zStack.filter((w) => w !== id);
    const win = this._windows.get(id);
    this._insertIntoZStack(id, win?.alwaysOnTop ?? false);
  }

  private _rebuildZStack(): void {
    const normal = this._zStack.filter((id) => {
      const w = this._windows.get(id);
      return w && !w.alwaysOnTop;
    });
    const onTop = this._zStack.filter((id) => {
      const w = this._windows.get(id);
      return w && w.alwaysOnTop;
    });
    this._zStack = [...normal, ...onTop];
  }

  private _updateContentBounds(win: ManagedWindow): void {
    const d = win.decoration;
    win.contentBounds = {
      x: win.bounds.x + d.borderWidth,
      y: win.bounds.y + d.titleBarHeight,
      width: win.bounds.width - d.borderWidth * 2,
      height: win.bounds.height - d.titleBarHeight - d.borderWidth,
    };
  }
}
