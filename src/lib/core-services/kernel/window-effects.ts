// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Effects: Snap/Tile + Power Management
// Snap zones (half/quarter), edge magnetism, keyboard tiling,
// DPMS power states, screen lock, idle timeout, screensaver.
// ═══════════════════════════════════════════════════════════════

import type { Rect } from "./damage-tracker";

// ── Types ────────────────────────────────────────────────────

export type SnapZone =
  | "left-half" | "right-half"
  | "top-half" | "bottom-half"
  | "top-left-quarter" | "top-right-quarter"
  | "bottom-left-quarter" | "bottom-right-quarter"
  | "maximize" | "none";

export type DPMSState = "on" | "standby" | "suspend" | "off";

export type ScreenLockState = "unlocked" | "locked" | "lock-fading";

export interface SnapConfig {
  enabled: boolean;
  edgeMagnetismPx: number;    // default 16
  showPreview: boolean;
  animateSnap: boolean;
  quarterTilingEnabled: boolean;
}

export interface TileLayout {
  id: string;
  name: string;
  regions: TileRegion[];
}

export interface TileRegion {
  /** Fraction of screen (0–1) */
  x: number;
  y: number;
  width: number;
  height: number;
  windowId: string | null;
}

export interface PowerConfig {
  standbyTimeoutMs: number;   // default 5 min
  suspendTimeoutMs: number;   // default 15 min
  offTimeoutMs: number;       // default 30 min
  lockOnSuspend: boolean;
  lockTimeoutMs: number;      // default 5 min (lock independently of DPMS)
  screensaverEnabled: boolean;
  screensaverId: string | null;
}

export interface SnapPreview {
  zone: SnapZone;
  bounds: Rect;
  visible: boolean;
}

export interface WindowEffectsStats {
  snapEnabled: boolean;
  currentDPMS: DPMSState;
  screenLocked: boolean;
  idleMs: number;
  activeLayout: string | null;
  snappedWindows: number;
  edgeMagnetismPx: number;
}

// ── Constants ────────────────────────────────────────────────

const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: true,
  edgeMagnetismPx: 16,
  showPreview: true,
  animateSnap: true,
  quarterTilingEnabled: true,
};

const DEFAULT_POWER_CONFIG: PowerConfig = {
  standbyTimeoutMs: 5 * 60 * 1000,
  suspendTimeoutMs: 15 * 60 * 1000,
  offTimeoutMs: 30 * 60 * 1000,
  lockOnSuspend: true,
  lockTimeoutMs: 5 * 60 * 1000,
  screensaverEnabled: false,
  screensaverId: null,
};

// ── Built-in tile layouts ────────────────────────────────────

const BUILTIN_LAYOUTS: TileLayout[] = [
  {
    id: "two-column",
    name: "Two Column (50/50)",
    regions: [
      { x: 0, y: 0, width: 0.5, height: 1, windowId: null },
      { x: 0.5, y: 0, width: 0.5, height: 1, windowId: null },
    ],
  },
  {
    id: "three-column",
    name: "Three Column",
    regions: [
      { x: 0, y: 0, width: 0.333, height: 1, windowId: null },
      { x: 0.333, y: 0, width: 0.334, height: 1, windowId: null },
      { x: 0.667, y: 0, width: 0.333, height: 1, windowId: null },
    ],
  },
  {
    id: "main-side",
    name: "Main + Side Stack",
    regions: [
      { x: 0, y: 0, width: 0.6, height: 1, windowId: null },
      { x: 0.6, y: 0, width: 0.4, height: 0.5, windowId: null },
      { x: 0.6, y: 0.5, width: 0.4, height: 0.5, windowId: null },
    ],
  },
  {
    id: "grid-4",
    name: "Grid (2x2)",
    regions: [
      { x: 0, y: 0, width: 0.5, height: 0.5, windowId: null },
      { x: 0.5, y: 0, width: 0.5, height: 0.5, windowId: null },
      { x: 0, y: 0.5, width: 0.5, height: 0.5, windowId: null },
      { x: 0.5, y: 0.5, width: 0.5, height: 0.5, windowId: null },
    ],
  },
];

// ═════════════════════════════════════════════════════════════

export class WindowEffects {
  // Snapping
  private _snapConfig: SnapConfig = { ...DEFAULT_SNAP_CONFIG };
  private _snapPreview: SnapPreview = { zone: "none", bounds: { x: 0, y: 0, width: 0, height: 0 }, visible: false };
  private _snappedWindows = new Map<string, SnapZone>(); // windowId → zone
  private _preSnapBounds = new Map<string, Rect>(); // restore bounds before snap

  // Tiling
  private _layouts: TileLayout[] = [...BUILTIN_LAYOUTS];
  private _activeLayout: TileLayout | null = null;

  // Power / DPMS
  private _powerConfig: PowerConfig = { ...DEFAULT_POWER_CONFIG };
  private _dpmsState: DPMSState = "on";
  private _lockState: ScreenLockState = "unlocked";
  private _lastInputTimestamp = Date.now();
  private _idleCheckTimer: ReturnType<typeof setInterval> | null = null;

  // Screen dimensions (set by display server)
  private _screenWidth = 1920;
  private _screenHeight = 1080;

  constructor() {
    this._startIdleMonitor();
  }

  // ── Screen dimensions ─────────────────────────────────────

  setScreenSize(width: number, height: number): void {
    this._screenWidth = width;
    this._screenHeight = height;
  }

  // ── Snap Configuration ────────────────────────────────────

  setSnapConfig(config: Partial<SnapConfig>): void {
    Object.assign(this._snapConfig, config);
  }

  getSnapConfig(): SnapConfig {
    return { ...this._snapConfig };
  }

  // ── Snap Zone Detection ───────────────────────────────────

  /**
   * Detect which snap zone a window position falls into based on
   * edge proximity. Used during drag to show snap preview.
   */
  detectSnapZone(x: number, y: number): SnapZone {
    if (!this._snapConfig.enabled) return "none";

    const mag = this._snapConfig.edgeMagnetismPx;
    const sw = this._screenWidth;
    const sh = this._screenHeight;
    const nearLeft = x <= mag;
    const nearRight = x >= sw - mag;
    const nearTop = y <= mag;
    const nearBottom = y >= sh - mag;

    // Corners → quarter snap
    if (this._snapConfig.quarterTilingEnabled) {
      if (nearLeft && nearTop) return "top-left-quarter";
      if (nearRight && nearTop) return "top-right-quarter";
      if (nearLeft && nearBottom) return "bottom-left-quarter";
      if (nearRight && nearBottom) return "bottom-right-quarter";
    }

    // Edges → half snap
    if (nearLeft) return "left-half";
    if (nearRight) return "right-half";
    if (nearTop) return "maximize";
    if (nearBottom) return "bottom-half";

    return "none";
  }

  /**
   * Get the target bounds for a snap zone.
   */
  getSnapBounds(zone: SnapZone): Rect {
    const sw = this._screenWidth;
    const sh = this._screenHeight;
    const hw = Math.floor(sw / 2);
    const hh = Math.floor(sh / 2);

    switch (zone) {
      case "left-half": return { x: 0, y: 0, width: hw, height: sh };
      case "right-half": return { x: hw, y: 0, width: sw - hw, height: sh };
      case "top-half": return { x: 0, y: 0, width: sw, height: hh };
      case "bottom-half": return { x: 0, y: hh, width: sw, height: sh - hh };
      case "top-left-quarter": return { x: 0, y: 0, width: hw, height: hh };
      case "top-right-quarter": return { x: hw, y: 0, width: sw - hw, height: hh };
      case "bottom-left-quarter": return { x: 0, y: hh, width: hw, height: sh - hh };
      case "bottom-right-quarter": return { x: hw, y: hh, width: sw - hw, height: sh - hh };
      case "maximize": return { x: 0, y: 0, width: sw, height: sh };
      case "none": return { x: 0, y: 0, width: 0, height: 0 };
    }
  }

  /**
   * Apply edge magnetism: if window edge is within threshold of screen edge,
   * snap it to the edge. Returns adjusted position.
   */
  applyEdgeMagnetism(x: number, y: number, width: number, height: number): { x: number; y: number } {
    if (!this._snapConfig.enabled) return { x, y };

    const mag = this._snapConfig.edgeMagnetismPx;
    let nx = x, ny = y;

    // Left edge
    if (Math.abs(x) < mag) nx = 0;
    // Top edge
    if (Math.abs(y) < mag) ny = 0;
    // Right edge
    if (Math.abs(x + width - this._screenWidth) < mag) nx = this._screenWidth - width;
    // Bottom edge
    if (Math.abs(y + height - this._screenHeight) < mag) ny = this._screenHeight - height;

    return { x: nx, y: ny };
  }

  // ── Snap Preview ──────────────────────────────────────────

  updateSnapPreview(cursorX: number, cursorY: number): SnapPreview {
    const zone = this.detectSnapZone(cursorX, cursorY);
    if (zone === "none") {
      this._snapPreview = { zone: "none", bounds: { x: 0, y: 0, width: 0, height: 0 }, visible: false };
    } else {
      this._snapPreview = { zone, bounds: this.getSnapBounds(zone), visible: this._snapConfig.showPreview };
    }
    return { ...this._snapPreview };
  }

  hideSnapPreview(): void {
    this._snapPreview.visible = false;
    this._snapPreview.zone = "none";
  }

  getSnapPreview(): SnapPreview {
    return { ...this._snapPreview };
  }

  // ── Snap / Unsnap Window ──────────────────────────────────

  /**
   * Snap a window to a zone. Saves pre-snap bounds for restore.
   */
  snapWindow(windowId: string, zone: SnapZone, currentBounds: Rect): Rect {
    if (zone === "none") return currentBounds;

    // Save pre-snap bounds if not already snapped
    if (!this._preSnapBounds.has(windowId)) {
      this._preSnapBounds.set(windowId, { ...currentBounds });
    }

    this._snappedWindows.set(windowId, zone);
    return this.getSnapBounds(zone);
  }

  /**
   * Unsnap a window, restoring its pre-snap bounds.
   */
  unsnapWindow(windowId: string): Rect | null {
    const bounds = this._preSnapBounds.get(windowId);
    this._snappedWindows.delete(windowId);
    this._preSnapBounds.delete(windowId);
    return bounds ?? null;
  }

  isSnapped(windowId: string): boolean {
    return this._snappedWindows.has(windowId);
  }

  getSnappedZone(windowId: string): SnapZone {
    return this._snappedWindows.get(windowId) ?? "none";
  }

  // ── Keyboard Tiling Shortcuts ─────────────────────────────

  /**
   * Process a tiling shortcut. Returns target zone or null if not a tiling key.
   * Meta+Arrow = half snap
   * Meta+Shift+Arrow = quarter snap
   */
  processTilingShortcut(key: string, meta: boolean, shift: boolean): SnapZone | null {
    if (!meta || !this._snapConfig.enabled) return null;

    if (!shift) {
      switch (key) {
        case "ArrowLeft": return "left-half";
        case "ArrowRight": return "right-half";
        case "ArrowUp": return "maximize";
        case "ArrowDown": return "none"; // restore
      }
    } else if (this._snapConfig.quarterTilingEnabled) {
      switch (key) {
        case "ArrowLeft": return "top-left-quarter"; // or cycle
        case "ArrowRight": return "bottom-right-quarter";
        case "ArrowUp": return "top-right-quarter";
        case "ArrowDown": return "bottom-left-quarter";
      }
    }
    return null;
  }

  // ── Tile Layouts ──────────────────────────────────────────

  getLayouts(): TileLayout[] {
    return this._layouts.map((l) => ({ ...l, regions: l.regions.map((r) => ({ ...r })) }));
  }

  addLayout(layout: TileLayout): void {
    this._layouts.push(layout);
  }

  /**
   * Apply a tile layout, assigning windows to regions.
   */
  applyLayout(layoutId: string, windowIds: string[]): TileLayout | null {
    const layout = this._layouts.find((l) => l.id === layoutId);
    if (!layout) return null;

    const active: TileLayout = {
      ...layout,
      regions: layout.regions.map((r, i) => ({
        ...r,
        windowId: windowIds[i] ?? null,
      })),
    };
    this._activeLayout = active;
    return active;
  }

  /**
   * Get pixel bounds for a region in the active layout.
   */
  getRegionBounds(regionIndex: number): Rect | null {
    if (!this._activeLayout) return null;
    const region = this._activeLayout.regions[regionIndex];
    if (!region) return null;
    return {
      x: Math.round(region.x * this._screenWidth),
      y: Math.round(region.y * this._screenHeight),
      width: Math.round(region.width * this._screenWidth),
      height: Math.round(region.height * this._screenHeight),
    };
  }

  getActiveLayout(): TileLayout | null {
    return this._activeLayout;
  }

  clearLayout(): void {
    this._activeLayout = null;
  }

  // ── Power / DPMS Management ───────────────────────────────

  setPowerConfig(config: Partial<PowerConfig>): void {
    Object.assign(this._powerConfig, config);
  }

  getPowerConfig(): PowerConfig {
    return { ...this._powerConfig };
  }

  getDPMSState(): DPMSState {
    return this._dpmsState;
  }

  /**
   * Force a DPMS state transition.
   */
  setDPMSState(state: DPMSState): void {
    if (this._dpmsState === state) return;
    const prev = this._dpmsState;
    this._dpmsState = state;

    // Auto-lock on suspend if configured
    if (state === "suspend" && this._powerConfig.lockOnSuspend && this._lockState === "unlocked") {
      this.lockScreen();
    }

    // Wake from off/suspend → on
    if (prev !== "on" && state === "on") {
      // Screen is now on, but may still be locked
    }
  }

  /**
   * Signal that user input occurred (resets idle timer).
   */
  resetIdleTimer(): void {
    this._lastInputTimestamp = Date.now();

    // Wake from DPMS
    if (this._dpmsState !== "on") {
      this.setDPMSState("on");
    }
  }

  getIdleMs(): number {
    return Date.now() - this._lastInputTimestamp;
  }

  // ── Screen Lock ───────────────────────────────────────────

  lockScreen(): void {
    this._lockState = "locked";
  }

  unlockScreen(): boolean {
    // In a real system this would require authentication
    if (this._lockState === "locked" || this._lockState === "lock-fading") {
      this._lockState = "unlocked";
      return true;
    }
    return false;
  }

  isLocked(): boolean {
    return this._lockState !== "unlocked";
  }

  getLockState(): ScreenLockState {
    return this._lockState;
  }

  // ── Idle Monitor ──────────────────────────────────────────

  private _startIdleMonitor(): void {
    this._idleCheckTimer = setInterval(() => {
      const idle = this.getIdleMs();
      const pc = this._powerConfig;

      if (this._dpmsState === "on" && idle >= pc.standbyTimeoutMs) {
        this.setDPMSState("standby");
      }
      if (this._dpmsState === "standby" && idle >= pc.suspendTimeoutMs) {
        this.setDPMSState("suspend");
      }
      if (this._dpmsState === "suspend" && idle >= pc.offTimeoutMs) {
        this.setDPMSState("off");
      }

      // Lock screen independently
      if (this._lockState === "unlocked" && idle >= pc.lockTimeoutMs) {
        this.lockScreen();
      }
    }, 10_000); // check every 10s
  }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): WindowEffectsStats {
    return {
      snapEnabled: this._snapConfig.enabled,
      currentDPMS: this._dpmsState,
      screenLocked: this.isLocked(),
      idleMs: this.getIdleMs(),
      activeLayout: this._activeLayout?.id ?? null,
      snappedWindows: this._snappedWindows.size,
      edgeMagnetismPx: this._snapConfig.edgeMagnetismPx,
    };
  }

  destroy(): void {
    if (this._idleCheckTimer) {
      clearInterval(this._idleCheckTimer);
      this._idleCheckTimer = null;
    }
  }
}
