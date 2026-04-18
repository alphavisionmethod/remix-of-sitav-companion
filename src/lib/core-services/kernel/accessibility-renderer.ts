// ═══════════════════════════════════════════════════════════════
// SITA OS — Accessibility Renderer
// Focus ring overlay, high-contrast mode, reduced-motion flag,
// screen reader tree extraction from SceneGraph, ARIA-like
// role/label annotations on SceneNodes.
// ═══════════════════════════════════════════════════════════════

import type { Rect } from "./damage-tracker";
import type { SceneNode, SceneGraph } from "./scene-graph";

// ── Types ────────────────────────────────────────────────────

export type A11yRole =
  | "button" | "checkbox" | "radio" | "textfield" | "slider"
  | "link" | "menu" | "menuitem" | "tab" | "tabpanel"
  | "dialog" | "alert" | "tooltip" | "tree" | "treeitem"
  | "listbox" | "option" | "grid" | "gridcell" | "row"
  | "heading" | "img" | "separator" | "toolbar" | "status"
  | "progressbar" | "scrollbar" | "switch" | "group"
  | "window" | "application" | "document" | "region"
  | "none" | "presentation";

export interface A11yAnnotation {
  role: A11yRole;
  label?: string;
  description?: string;
  value?: string;
  valueMin?: number;
  valueMax?: number;
  valueNow?: number;
  checked?: boolean | "mixed";
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  live?: "off" | "polite" | "assertive";
  level?: number; // heading level
  keyShortcut?: string;
}

export interface A11yTreeNode {
  nodeId: string;
  name: string;
  role: A11yRole;
  label: string;
  description: string;
  value: string;
  bounds: Rect;
  focused: boolean;
  children: A11yTreeNode[];
  properties: Record<string, unknown>;
}

export interface FocusRingStyle {
  color: { r: number; g: number; b: number; a: number };
  width: number;
  offset: number; // outward offset from element bounds
  borderRadius: number;
  visible: boolean;
}

export type ContrastMode = "normal" | "high-contrast" | "high-contrast-inverted";

export interface AccessibilityConfig {
  focusRingEnabled: boolean;
  focusRingStyle: FocusRingStyle;
  contrastMode: ContrastMode;
  reducedMotion: boolean;
  largeText: boolean;
  textScaleFactor: number; // 1.0 = default, 1.5 = 150%
  cursorSize: "normal" | "large" | "extra-large";
  screenReaderEnabled: boolean;
  stickyKeys: boolean;
  slowKeys: boolean;
  slowKeysDelayMs: number;
  bounceKeys: boolean;
  bounceKeysDelayMs: number;
}

export interface FocusRingOverlay {
  visible: boolean;
  bounds: Rect;
  style: FocusRingStyle;
  nodeId: string | null;
}

export interface AccessibilityRendererStats {
  contrastMode: ContrastMode;
  reducedMotion: boolean;
  focusRingVisible: boolean;
  focusedNodeId: string | null;
  screenReaderEnabled: boolean;
  a11yTreeNodeCount: number;
  annotatedNodes: number;
  textScaleFactor: number;
  largeText: boolean;
}

// ── Constants ────────────────────────────────────────────────

const DEFAULT_FOCUS_RING: FocusRingStyle = {
  color: { r: 66, g: 133, b: 244, a: 255 }, // blue
  width: 3,
  offset: 2,
  borderRadius: 4,
  visible: true,
};

const DEFAULT_CONFIG: AccessibilityConfig = {
  focusRingEnabled: true,
  focusRingStyle: { ...DEFAULT_FOCUS_RING },
  contrastMode: "normal",
  reducedMotion: false,
  largeText: false,
  textScaleFactor: 1.0,
  cursorSize: "normal",
  screenReaderEnabled: false,
  stickyKeys: false,
  slowKeys: false,
  slowKeysDelayMs: 300,
  bounceKeys: false,
  bounceKeysDelayMs: 300,
};

// ── High-contrast color palettes ─────────────────────────────

export interface ContrastPalette {
  background: { r: number; g: number; b: number };
  foreground: { r: number; g: number; b: number };
  accent: { r: number; g: number; b: number };
  focusRing: { r: number; g: number; b: number };
  link: { r: number; g: number; b: number };
  error: { r: number; g: number; b: number };
  disabled: { r: number; g: number; b: number };
}

const NORMAL_PALETTE: ContrastPalette = {
  background: { r: 255, g: 255, b: 255 },
  foreground: { r: 0, g: 0, b: 0 },
  accent: { r: 66, g: 133, b: 244 },
  focusRing: { r: 66, g: 133, b: 244 },
  link: { r: 26, g: 13, b: 171 },
  error: { r: 213, g: 0, b: 0 },
  disabled: { r: 158, g: 158, b: 158 },
};

const HIGH_CONTRAST_PALETTE: ContrastPalette = {
  background: { r: 0, g: 0, b: 0 },
  foreground: { r: 255, g: 255, b: 255 },
  accent: { r: 0, g: 255, b: 255 },
  focusRing: { r: 255, g: 255, b: 0 },
  link: { r: 255, g: 255, b: 0 },
  error: { r: 255, g: 85, b: 85 },
  disabled: { r: 128, g: 128, b: 128 },
};

const HIGH_CONTRAST_INVERTED_PALETTE: ContrastPalette = {
  background: { r: 255, g: 255, b: 255 },
  foreground: { r: 0, g: 0, b: 0 },
  accent: { r: 0, g: 0, b: 200 },
  focusRing: { r: 0, g: 0, b: 0 },
  link: { r: 0, g: 0, b: 180 },
  error: { r: 200, g: 0, b: 0 },
  disabled: { r: 100, g: 100, b: 100 },
};

// ═════════════════════════════════════════════════════════════

export class AccessibilityRenderer {
  private _config: AccessibilityConfig = { ...DEFAULT_CONFIG, focusRingStyle: { ...DEFAULT_FOCUS_RING } };

  // Annotations per scene node
  private _annotations = new Map<string, A11yAnnotation>();

  // Focus tracking
  private _focusedNodeId: string | null = null;
  private _focusRingOverlay: FocusRingOverlay = {
    visible: false,
    bounds: { x: 0, y: 0, width: 0, height: 0 },
    style: { ...DEFAULT_FOCUS_RING },
    nodeId: null,
  };

  // Cached accessibility tree
  private _cachedTree: A11yTreeNode | null = null;
  private _treeDirty = true;

  // Screen reader announcements queue
  private _announcements: { text: string; priority: "polite" | "assertive"; timestamp: number }[] = [];

  // ── Configuration ─────────────────────────────────────────

  setConfig(config: Partial<AccessibilityConfig>): void {
    Object.assign(this._config, config);
    if (config.focusRingStyle) {
      this._focusRingOverlay.style = { ...this._config.focusRingStyle };
    }
    if (config.contrastMode !== undefined) {
      this._updateContrastPalette();
    }
  }

  getConfig(): AccessibilityConfig {
    return { ...this._config, focusRingStyle: { ...this._config.focusRingStyle } };
  }

  // ── Contrast Mode ─────────────────────────────────────────

  setContrastMode(mode: ContrastMode): void {
    this._config.contrastMode = mode;
    this._updateContrastPalette();
  }

  getContrastMode(): ContrastMode {
    return this._config.contrastMode;
  }

  getContrastPalette(): ContrastPalette {
    switch (this._config.contrastMode) {
      case "high-contrast": return { ...HIGH_CONTRAST_PALETTE };
      case "high-contrast-inverted": return { ...HIGH_CONTRAST_INVERTED_PALETTE };
      default: return { ...NORMAL_PALETTE };
    }
  }

  /**
   * Apply contrast palette to gamma LUTs (called by color management integration).
   * Returns the 256-entry gamma ramp adjustment for each channel.
   */
  getGammaAdjustment(): { r: Uint8Array; g: Uint8Array; b: Uint8Array } | null {
    if (this._config.contrastMode === "normal") return null;

    const r = new Uint8Array(256);
    const g = new Uint8Array(256);
    const b = new Uint8Array(256);

    if (this._config.contrastMode === "high-contrast-inverted") {
      // Invert
      for (let i = 0; i < 256; i++) {
        r[i] = 255 - i;
        g[i] = 255 - i;
        b[i] = 255 - i;
      }
    } else {
      // High contrast: increase contrast curve (S-curve)
      for (let i = 0; i < 256; i++) {
        const normalized = i / 255;
        const contrasted = normalized < 0.5
          ? 2 * normalized * normalized
          : 1 - 2 * (1 - normalized) * (1 - normalized);
        const val = Math.round(contrasted * 255);
        r[i] = val;
        g[i] = val;
        b[i] = val;
      }
    }

    return { r, g, b };
  }

  private _updateContrastPalette(): void {
    // Update focus ring color based on contrast mode
    const palette = this.getContrastPalette();
    this._config.focusRingStyle.color = { ...palette.focusRing, a: 255 };
    this._focusRingOverlay.style.color = { ...palette.focusRing, a: 255 };
  }

  // ── Reduced Motion ────────────────────────────────────────

  setReducedMotion(enabled: boolean): void {
    this._config.reducedMotion = enabled;
  }

  isReducedMotion(): boolean {
    return this._config.reducedMotion;
  }

  // ── Text Scaling ──────────────────────────────────────────

  setTextScaleFactor(factor: number): void {
    this._config.textScaleFactor = Math.max(0.5, Math.min(4.0, factor));
  }

  getTextScaleFactor(): number {
    return this._config.textScaleFactor;
  }

  setLargeText(enabled: boolean): void {
    this._config.largeText = enabled;
    this._config.textScaleFactor = enabled ? 1.5 : 1.0;
  }

  // ── Node Annotations ──────────────────────────────────────

  /**
   * Annotate a scene node with accessibility properties.
   */
  annotateNode(nodeId: string, annotation: A11yAnnotation): void {
    this._annotations.set(nodeId, { ...annotation });
    this._treeDirty = true;
  }

  removeAnnotation(nodeId: string): void {
    this._annotations.delete(nodeId);
    this._treeDirty = true;
  }

  getAnnotation(nodeId: string): A11yAnnotation | undefined {
    return this._annotations.get(nodeId);
  }

  // ── Focus Ring ────────────────────────────────────────────

  /**
   * Set the focused node. Updates the focus ring overlay bounds.
   */
  setFocusedNode(nodeId: string | null, bounds?: Rect): void {
    this._focusedNodeId = nodeId;

    if (!nodeId || !this._config.focusRingEnabled) {
      this._focusRingOverlay.visible = false;
      this._focusRingOverlay.nodeId = null;
      return;
    }

    this._focusRingOverlay.nodeId = nodeId;
    this._focusRingOverlay.visible = true;

    if (bounds) {
      const offset = this._config.focusRingStyle.offset;
      this._focusRingOverlay.bounds = {
        x: bounds.x - offset,
        y: bounds.y - offset,
        width: bounds.width + offset * 2,
        height: bounds.height + offset * 2,
      };
    }
  }

  getFocusRingOverlay(): FocusRingOverlay {
    return {
      ...this._focusRingOverlay,
      bounds: { ...this._focusRingOverlay.bounds },
      style: { ...this._focusRingOverlay.style },
    };
  }

  /**
   * Get focus ring damage rect (for compositor overlay rendering).
   */
  getFocusRingDamage(): Rect | null {
    if (!this._focusRingOverlay.visible) return null;
    const b = this._focusRingOverlay.bounds;
    const w = this._config.focusRingStyle.width;
    return {
      x: b.x - w,
      y: b.y - w,
      width: b.width + w * 2,
      height: b.height + w * 2,
    };
  }

  // ── Screen Reader Tree ────────────────────────────────────

  /**
   * Build the accessibility tree from a SceneGraph.
   * Walks all nodes, extracts role/label/value, produces flat tree.
   */
  buildAccessibilityTree(sceneGraph: SceneGraph): A11yTreeNode {
    const root = sceneGraph.root;
    this._cachedTree = this._buildTreeNode(root);
    this._treeDirty = false;
    return this._cachedTree;
  }

  getCachedTree(): A11yTreeNode | null {
    return this._cachedTree;
  }

  isTreeDirty(): boolean {
    return this._treeDirty;
  }

  /**
   * Get a flat list of all accessible nodes (for screen reader sequential navigation).
   */
  getFlatAccessibleNodes(sceneGraph: SceneGraph): A11yTreeNode[] {
    const tree = this._treeDirty ? this.buildAccessibilityTree(sceneGraph) : this._cachedTree;
    if (!tree) return [];
    const flat: A11yTreeNode[] = [];
    this._flattenTree(tree, flat);
    return flat;
  }

  private _flattenTree(node: A11yTreeNode, out: A11yTreeNode[]): void {
    if (node.role !== "none" && node.role !== "presentation" && node.role !== "group") {
      out.push(node);
    }
    for (const child of node.children) {
      this._flattenTree(child, out);
    }
  }

  private _buildTreeNode(sceneNode: SceneNode): A11yTreeNode {
    const annotation = this._annotations.get(sceneNode.id);
    const bounds = sceneNode.getWorldBounds();

    const treeNode: A11yTreeNode = {
      nodeId: sceneNode.id,
      name: sceneNode.name,
      role: annotation?.role ?? this._inferRole(sceneNode),
      label: annotation?.label ?? sceneNode.name,
      description: annotation?.description ?? "",
      value: annotation?.value ?? "",
      bounds,
      focused: sceneNode.id === this._focusedNodeId,
      children: [],
      properties: {},
    };

    // Copy annotation properties
    if (annotation) {
      if (annotation.checked !== undefined) treeNode.properties["checked"] = annotation.checked;
      if (annotation.expanded !== undefined) treeNode.properties["expanded"] = annotation.expanded;
      if (annotation.selected !== undefined) treeNode.properties["selected"] = annotation.selected;
      if (annotation.disabled !== undefined) treeNode.properties["disabled"] = annotation.disabled;
      if (annotation.required !== undefined) treeNode.properties["required"] = annotation.required;
      if (annotation.readonly !== undefined) treeNode.properties["readonly"] = annotation.readonly;
      if (annotation.valueMin !== undefined) treeNode.properties["valueMin"] = annotation.valueMin;
      if (annotation.valueMax !== undefined) treeNode.properties["valueMax"] = annotation.valueMax;
      if (annotation.valueNow !== undefined) treeNode.properties["valueNow"] = annotation.valueNow;
      if (annotation.level !== undefined) treeNode.properties["level"] = annotation.level;
      if (annotation.live !== undefined) treeNode.properties["live"] = annotation.live;
      if (annotation.keyShortcut !== undefined) treeNode.properties["keyShortcut"] = annotation.keyShortcut;
    }

    // Recurse children
    for (const child of sceneNode.children) {
      if (child.visible) {
        treeNode.children.push(this._buildTreeNode(child));
      }
    }

    return treeNode;
  }

  private _inferRole(node: SceneNode): A11yRole {
    switch (node.type) {
      case "text": return "none"; // text nodes are typically part of a labeled element
      case "image": return "img";
      case "rect": return "none";
      case "path": return "none";
      case "group": return "group";
      case "clip": return "none";
      default: return "none";
    }
  }

  // ── Screen Reader Announcements ───────────────────────────

  announce(text: string, priority: "polite" | "assertive" = "polite"): void {
    this._announcements.push({ text, priority, timestamp: Date.now() });
    // Keep only last 50 announcements
    if (this._announcements.length > 50) this._announcements.shift();
  }

  getAnnouncements(since?: number): { text: string; priority: "polite" | "assertive"; timestamp: number }[] {
    if (since !== undefined) {
      return this._announcements.filter((a) => a.timestamp >= since);
    }
    return [...this._announcements];
  }

  clearAnnouncements(): void {
    this._announcements = [];
  }

  // ── Keyboard Accessibility ────────────────────────────────

  isStickyKeys(): boolean { return this._config.stickyKeys; }
  setStickyKeys(enabled: boolean): void { this._config.stickyKeys = enabled; }

  isSlowKeys(): boolean { return this._config.slowKeys; }
  setSlowKeys(enabled: boolean, delayMs?: number): void {
    this._config.slowKeys = enabled;
    if (delayMs !== undefined) this._config.slowKeysDelayMs = delayMs;
  }

  isBounceKeys(): boolean { return this._config.bounceKeys; }
  setBounceKeys(enabled: boolean, delayMs?: number): void {
    this._config.bounceKeys = enabled;
    if (delayMs !== undefined) this._config.bounceKeysDelayMs = delayMs;
  }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): AccessibilityRendererStats {
    return {
      contrastMode: this._config.contrastMode,
      reducedMotion: this._config.reducedMotion,
      focusRingVisible: this._focusRingOverlay.visible,
      focusedNodeId: this._focusedNodeId,
      screenReaderEnabled: this._config.screenReaderEnabled,
      a11yTreeNodeCount: this._cachedTree ? this._countTreeNodes(this._cachedTree) : 0,
      annotatedNodes: this._annotations.size,
      textScaleFactor: this._config.textScaleFactor,
      largeText: this._config.largeText,
    };
  }

  private _countTreeNodes(node: A11yTreeNode): number {
    let count = 1;
    for (const child of node.children) count += this._countTreeNodes(child);
    return count;
  }
}
