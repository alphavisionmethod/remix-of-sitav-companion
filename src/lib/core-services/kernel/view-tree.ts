// ═══════════════════════════════════════════════════════════════
// SITA OS — View Tree + Widget System (Section 5.6)
// Vector-first composable UI toolkit with draw(ctx) protocol,
// flex/constraint layout, and tree diffing for dirty propagation
// ═══════════════════════════════════════════════════════════════

import type { Rect } from "./damage-tracker";
import type { TileBuffer, Color } from "./software-rasterizer";
import type { UIBackground, UIBoxShadow, UIBorder, UIColor } from "./ui-renderer";

// ── Types ────────────────────────────────────────────────────

export type MainAxisAlign = "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
export type CrossAxisAlign = "start" | "center" | "end" | "stretch";
export type TextAlign = "left" | "center" | "right";

export interface ViewStyle {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  flex?: number;          // flex weight for distribution
  padding?: number | [number, number, number, number]; // uniform or [top, right, bottom, left]
  margin?: number | [number, number, number, number];
  background?: UIBackground;
  borderRadius?: number | [number, number, number, number];
  border?: UIBorder;
  shadow?: UIBoxShadow;
  opacity?: number;       // 0-1
  visible?: boolean;
  overflow?: "visible" | "hidden" | "scroll";
}

export interface ConstraintDef {
  centerX?: "parent" | string;  // sibling id
  centerY?: "parent" | string;
  left?: { anchor: "parent" | string; edge: "left" | "right"; offset?: number };
  right?: { anchor: "parent" | string; edge: "left" | "right"; offset?: number };
  top?: { anchor: "parent" | string; edge: "top" | "bottom"; offset?: number };
  bottom?: { anchor: "parent" | string; edge: "top" | "bottom"; offset?: number };
  aspectRatio?: number;
}

export interface MeasureResult {
  width: number;
  height: number;
}

/** Draw context passed to each widget's draw() method */
export interface DrawContext {
  fillRect(x: number, y: number, w: number, h: number, color: Color): void;
  fillRoundedRect(x: number, y: number, w: number, h: number, radii: [number, number, number, number], color: Color): void;
  drawText(x: number, y: number, text: string, fontSize: number, color: Color): void;
  drawImage(x: number, y: number, w: number, h: number, imageId: string): void;
  fillGradient(x: number, y: number, w: number, h: number, stops: Array<{ offset: number; color: Color }>): void;
  setClipRect(rect: Rect): void;
  clearClip(): void;
  setOpacity(alpha: number): void;
  resetOpacity(): void;
}

export interface ViewTreeStats {
  totalNodes: number;
  dirtyNodes: number;
  layoutPasses: number;
  drawCalls: number;
  treeDepth: number;
}

// ── Padding/Margin Helpers ───────────────────────────────────

function resolvePadding(p?: number | [number, number, number, number]): [number, number, number, number] {
  if (p === undefined) return [0, 0, 0, 0];
  if (typeof p === "number") return [p, p, p, p];
  return p;
}

function resolveRadii(r?: number | [number, number, number, number]): [number, number, number, number] {
  if (r === undefined) return [0, 0, 0, 0];
  if (typeof r === "number") return [r, r, r, r];
  return r;
}

// ── Base ViewNode ────────────────────────────────────────────

export type ViewNodeType = "container" | "column" | "row" | "stack" | "text" | "button" | "image" | "spacer";

let _nextNodeId = 1;

export abstract class ViewNode {
  readonly id: string;
  abstract readonly type: ViewNodeType;

  parent: ViewNode | null = null;
  children: ViewNode[] = [];
  style: ViewStyle = {};
  constraints?: ConstraintDef;

  // Resolved after layout
  resolvedBounds: Rect = { x: 0, y: 0, width: 0, height: 0 };
  private _previousBounds: Rect = { x: 0, y: 0, width: 0, height: 0 };
  dirty = true;

  // Compositor-level animation overrides (set by AnimationEngine)
  animTranslateX = 0;
  animTranslateY = 0;
  animScaleX = 1;
  animScaleY = 1;
  animRotation = 0;
  animOpacity = 1;

  // ── Layer Bitmap Cache (Section 5.7 optimization) ──────────
  // Caches the rasterized output of this node. When the node is not dirty
  // and only compositor-layer animations are active (transform/opacity),
  // the cached raster is reused — avoiding expensive re-rasterization.
  cachedRaster: {
    pixels: Uint8ClampedArray;
    width: number;
    height: number;
    boundsSnapshot: Rect;
  } | null = null;

  /** Whether this node's cached raster is valid (not dirty, bounds unchanged) */
  get isCacheValid(): boolean {
    if (!this.cachedRaster || this.dirty) return false;
    const b = this.resolvedBounds;
    const s = this.cachedRaster.boundsSnapshot;
    return b.width === s.width && b.height === s.height;
  }

  /** Invalidate cached raster (called on content/size changes, NOT on compositor animations) */
  invalidateCache(): void {
    this.cachedRaster = null;
  }

  /** Store a rasterized snapshot for this node */
  setCachedRaster(pixels: Uint8ClampedArray, width: number, height: number): void {
    this.cachedRaster = {
      pixels,
      width,
      height,
      boundsSnapshot: { ...this.resolvedBounds },
    };
  }

  constructor(id?: string) {
    this.id = id ?? `vnode-${_nextNodeId++}`;
  }

  // ── Tree Manipulation ──────────────────────────────────────

  addChild(child: ViewNode): void {
    if (child.parent) child.parent.removeChild(child);
    child.parent = this;
    this.children.push(child);
    this.markDirty();
  }

  removeChild(child: ViewNode): void {
    const idx = this.children.indexOf(child);
    if (idx >= 0) {
      this.children.splice(idx, 1);
      child.parent = null;
      this.markDirty();
    }
  }

  removeAllChildren(): void {
    for (const c of this.children) c.parent = null;
    this.children = [];
    this.markDirty();
  }

  // ── Dirty Propagation ──────────────────────────────────────

  markDirty(): void {
    this.dirty = true;
    // Invalidate layer cache when content changes
    this.invalidateCache();
    // Propagate up to root so parent containers know to re-layout
    if (this.parent && !this.parent.dirty) {
      this.parent.markDirty();
    }
  }

  clearDirty(): void {
    this.dirty = false;
    this._previousBounds = { ...this.resolvedBounds };
  }

  /** Check if bounds changed since last layout — triggers damage */
  boundsChanged(): boolean {
    const b = this.resolvedBounds;
    const p = this._previousBounds;
    return b.x !== p.x || b.y !== p.y || b.width !== p.width || b.height !== p.height;
  }

  getDamageRects(): Rect[] {
    if (!this.boundsChanged()) return [];
    // Return both old and new bounds for proper damage
    return [{ ...this._previousBounds }, { ...this.resolvedBounds }];
  }

  // ── Abstract Protocol ──────────────────────────────────────

  /** Measure intrinsic size given max available space */
  abstract measure(maxWidth: number, maxHeight: number): MeasureResult;

  /** Position this node at (x,y) with (w,h). Override for layout containers. */
  abstract layout(x: number, y: number, width: number, height: number): void;

  /** Draw this node using the draw context (vector-first) */
  abstract draw(ctx: DrawContext): void;

  // ── Tree Queries ───────────────────────────────────────────

  findById(id: string): ViewNode | null {
    if (this.id === id) return this;
    for (const c of this.children) {
      const found = c.findById(id);
      if (found) return found;
    }
    return null;
  }

  getDepth(): number {
    let d = 0;
    let n: ViewNode | null = this.parent;
    while (n) { d++; n = n.parent; }
    return d;
  }

  walk(cb: (node: ViewNode) => void): void {
    cb(this);
    for (const c of this.children) c.walk(cb);
  }

  countNodes(): number {
    let count = 1;
    for (const c of this.children) count += c.countNodes();
    return count;
  }
}

// ── Container (generic box) ──────────────────────────────────

export class ContainerNode extends ViewNode {
  readonly type: ViewNodeType = "container";

  measure(maxWidth: number, maxHeight: number): MeasureResult {
    const pad = resolvePadding(this.style.padding);
    let w = this.style.width ?? 0;
    let h = this.style.height ?? 0;
    // If no explicit size, size to children
    if (!this.style.width || !this.style.height) {
      for (const c of this.children) {
        const cm = c.measure(maxWidth - pad[1] - pad[3], maxHeight - pad[0] - pad[2]);
        w = Math.max(w, cm.width + pad[1] + pad[3]);
        h = Math.max(h, cm.height + pad[0] + pad[2]);
      }
    }
    return { width: clampSize(w, this.style), height: clampSize(h, this.style, true) };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
    const pad = resolvePadding(this.style.padding);
    // Layout children at origin (stacked at top-left)
    for (const c of this.children) {
      const cm = c.measure(width - pad[1] - pad[3], height - pad[0] - pad[2]);
      c.layout(x + pad[3], y + pad[0], cm.width, cm.height);
    }
  }

  draw(ctx: DrawContext): void {
    drawBackground(ctx, this);
    for (const c of this.children) {
      if (c.style.visible === false) continue;
      c.draw(ctx);
    }
  }
}

// ── Column (vertical flex) ───────────────────────────────────

export interface FlexOptions {
  spacing?: number;
  mainAxisAlign?: MainAxisAlign;
  crossAxisAlign?: CrossAxisAlign;
}

export class ColumnNode extends ViewNode {
  readonly type: ViewNodeType = "column";
  flexOptions: FlexOptions = {};

  constructor(id?: string, opts?: FlexOptions) {
    super(id);
    if (opts) this.flexOptions = opts;
  }

  measure(maxWidth: number, maxHeight: number): MeasureResult {
    const pad = resolvePadding(this.style.padding);
    const spacing = this.flexOptions.spacing ?? 0;
    const innerW = (this.style.width ?? maxWidth) - pad[1] - pad[3];
    const innerH = (this.style.height ?? maxHeight) - pad[0] - pad[2];

    let totalFixed = 0;
    let totalFlex = 0;
    let maxChildW = 0;
    const visibleChildren = this.children.filter(c => c.style.visible !== false);

    for (const c of visibleChildren) {
      if (c.style.flex && c.style.flex > 0) {
        totalFlex += c.style.flex;
      } else {
        const cm = c.measure(innerW, innerH);
        totalFixed += cm.height;
        maxChildW = Math.max(maxChildW, cm.width);
      }
    }
    totalFixed += Math.max(0, visibleChildren.length - 1) * spacing;

    const h = this.style.height ?? (totalFixed + pad[0] + pad[2]);
    const w = this.style.width ?? (maxChildW + pad[1] + pad[3]);
    return { width: clampSize(w, this.style), height: clampSize(h, this.style, true) };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
    const pad = resolvePadding(this.style.padding);
    const spacing = this.flexOptions.spacing ?? 0;
    const crossAlign = this.flexOptions.crossAxisAlign ?? "start";

    const innerX = x + pad[3];
    const innerY = y + pad[0];
    const innerW = width - pad[1] - pad[3];
    const innerH = height - pad[0] - pad[2];

    const visibleChildren = this.children.filter(c => c.style.visible !== false);

    // First pass: measure fixed children, sum flex weights
    let totalFixed = 0;
    let totalFlex = 0;
    const measurements: MeasureResult[] = [];
    for (const c of visibleChildren) {
      const m = c.measure(innerW, innerH);
      measurements.push(m);
      if (c.style.flex && c.style.flex > 0) {
        totalFlex += c.style.flex;
      } else {
        totalFixed += m.height;
      }
    }
    totalFixed += Math.max(0, visibleChildren.length - 1) * spacing;
    const flexSpace = Math.max(0, innerH - totalFixed);

    // Second pass: assign positions
    let cy = innerY;
    // Main axis alignment
    cy += mainAxisOffset(this.flexOptions.mainAxisAlign, innerH, totalFixed + (totalFlex > 0 ? flexSpace : 0), visibleChildren.length, spacing);

    for (let i = 0; i < visibleChildren.length; i++) {
      const c = visibleChildren[i];
      const m = measurements[i];
      const ch = (c.style.flex && c.style.flex > 0 && totalFlex > 0)
        ? (c.style.flex / totalFlex) * flexSpace
        : m.height;
      const cw = crossAlign === "stretch" ? innerW : m.width;
      const cx = crossAlignOffset(crossAlign, innerX, innerW, cw);
      c.layout(cx, cy, cw, ch);
      cy += ch + spacing;
    }
  }

  draw(ctx: DrawContext): void {
    drawBackground(ctx, this);
    for (const c of this.children) {
      if (c.style.visible === false) continue;
      c.draw(ctx);
    }
  }
}

// ── Row (horizontal flex) ────────────────────────────────────

export class RowNode extends ViewNode {
  readonly type: ViewNodeType = "row";
  flexOptions: FlexOptions = {};

  constructor(id?: string, opts?: FlexOptions) {
    super(id);
    if (opts) this.flexOptions = opts;
  }

  measure(maxWidth: number, maxHeight: number): MeasureResult {
    const pad = resolvePadding(this.style.padding);
    const spacing = this.flexOptions.spacing ?? 0;
    const innerW = (this.style.width ?? maxWidth) - pad[1] - pad[3];
    const innerH = (this.style.height ?? maxHeight) - pad[0] - pad[2];

    let totalFixed = 0;
    let totalFlex = 0;
    let maxChildH = 0;
    const visibleChildren = this.children.filter(c => c.style.visible !== false);

    for (const c of visibleChildren) {
      if (c.style.flex && c.style.flex > 0) {
        totalFlex += c.style.flex;
      } else {
        const cm = c.measure(innerW, innerH);
        totalFixed += cm.width;
        maxChildH = Math.max(maxChildH, cm.height);
      }
    }
    totalFixed += Math.max(0, visibleChildren.length - 1) * spacing;

    const w = this.style.width ?? (totalFixed + pad[1] + pad[3]);
    const h = this.style.height ?? (maxChildH + pad[0] + pad[2]);
    return { width: clampSize(w, this.style), height: clampSize(h, this.style, true) };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
    const pad = resolvePadding(this.style.padding);
    const spacing = this.flexOptions.spacing ?? 0;
    const crossAlign = this.flexOptions.crossAxisAlign ?? "start";

    const innerX = x + pad[3];
    const innerY = y + pad[0];
    const innerW = width - pad[1] - pad[3];
    const innerH = height - pad[0] - pad[2];

    const visibleChildren = this.children.filter(c => c.style.visible !== false);

    let totalFixed = 0;
    let totalFlex = 0;
    const measurements: MeasureResult[] = [];
    for (const c of visibleChildren) {
      const m = c.measure(innerW, innerH);
      measurements.push(m);
      if (c.style.flex && c.style.flex > 0) {
        totalFlex += c.style.flex;
      } else {
        totalFixed += m.width;
      }
    }
    totalFixed += Math.max(0, visibleChildren.length - 1) * spacing;
    const flexSpace = Math.max(0, innerW - totalFixed);

    let cx = innerX;
    cx += mainAxisOffset(this.flexOptions.mainAxisAlign, innerW, totalFixed + (totalFlex > 0 ? flexSpace : 0), visibleChildren.length, spacing);

    for (let i = 0; i < visibleChildren.length; i++) {
      const c = visibleChildren[i];
      const m = measurements[i];
      const cw = (c.style.flex && c.style.flex > 0 && totalFlex > 0)
        ? (c.style.flex / totalFlex) * flexSpace
        : m.width;
      const ch = crossAlign === "stretch" ? innerH : m.height;
      const cy = crossAlignOffset(crossAlign, innerY, innerH, ch);
      c.layout(cx, cy, cw, ch);
      cx += cw + spacing;
    }
  }

  draw(ctx: DrawContext): void {
    drawBackground(ctx, this);
    for (const c of this.children) {
      if (c.style.visible === false) continue;
      c.draw(ctx);
    }
  }
}

// ── Stack (Z-ordered overlay) ────────────────────────────────

export class StackNode extends ViewNode {
  readonly type: ViewNodeType = "stack";

  measure(maxWidth: number, maxHeight: number): MeasureResult {
    const pad = resolvePadding(this.style.padding);
    let w = 0, h = 0;
    for (const c of this.children) {
      if (c.style.visible === false) continue;
      const cm = c.measure(maxWidth - pad[1] - pad[3], maxHeight - pad[0] - pad[2]);
      w = Math.max(w, cm.width);
      h = Math.max(h, cm.height);
    }
    return {
      width: clampSize(this.style.width ?? (w + pad[1] + pad[3]), this.style),
      height: clampSize(this.style.height ?? (h + pad[0] + pad[2]), this.style, true),
    };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
    const pad = resolvePadding(this.style.padding);
    for (const c of this.children) {
      if (c.style.visible === false) continue;
      const cm = c.measure(width - pad[1] - pad[3], height - pad[0] - pad[2]);
      c.layout(x + pad[3], y + pad[0], cm.width, cm.height);
    }
  }

  draw(ctx: DrawContext): void {
    drawBackground(ctx, this);
    for (const c of this.children) {
      if (c.style.visible === false) continue;
      c.draw(ctx);
    }
  }
}

// ── TextWidget ───────────────────────────────────────────────

export class TextWidget extends ViewNode {
  readonly type: ViewNodeType = "text";
  text = "";
  fontSize = 14;
  color: Color = { r: 0, g: 0, b: 0, a: 255 };
  textAlign: TextAlign = "left";

  constructor(id?: string, text?: string, fontSize?: number) {
    super(id);
    if (text) this.text = text;
    if (fontSize) this.fontSize = fontSize;
  }

  measure(_maxWidth: number, _maxHeight: number): MeasureResult {
    // Approximate text measurement: char width ≈ 0.6 * fontSize
    const charW = this.fontSize * 0.6;
    const w = this.text.length * charW;
    const h = this.fontSize * 1.4; // line height
    return {
      width: clampSize(this.style.width ?? w, this.style),
      height: clampSize(this.style.height ?? h, this.style, true),
    };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
  }

  draw(ctx: DrawContext): void {
    drawBackground(ctx, this);
    const b = this.resolvedBounds;
    const pad = resolvePadding(this.style.padding);
    ctx.drawText(b.x + pad[3], b.y + pad[0] + this.fontSize, this.text, this.fontSize, this.color);
  }
}

// ── ButtonWidget ─────────────────────────────────────────────

export class ButtonWidget extends ViewNode {
  readonly type: ViewNodeType = "button";
  label = "Button";
  fontSize = 14;
  textColor: Color = { r: 255, g: 255, b: 255, a: 255 };
  onPress?: () => void;

  constructor(id?: string, label?: string) {
    super(id);
    if (label) this.label = label;
    // Default button style
    this.style = {
      padding: [8, 16, 8, 16],
      background: { type: "solid", r: 59, g: 130, b: 246, a: 255 },
      borderRadius: 6,
    };
  }

  measure(_maxWidth: number, _maxHeight: number): MeasureResult {
    const pad = resolvePadding(this.style.padding);
    const charW = this.fontSize * 0.6;
    const w = this.label.length * charW + pad[1] + pad[3];
    const h = this.fontSize * 1.4 + pad[0] + pad[2];
    return {
      width: clampSize(this.style.width ?? w, this.style),
      height: clampSize(this.style.height ?? h, this.style, true),
    };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
  }

  draw(ctx: DrawContext): void {
    drawBackground(ctx, this);
    const b = this.resolvedBounds;
    const pad = resolvePadding(this.style.padding);
    // Center text in button
    const textW = this.label.length * this.fontSize * 0.6;
    const tx = b.x + (b.width - textW) / 2;
    const ty = b.y + pad[0] + this.fontSize;
    ctx.drawText(tx, ty, this.label, this.fontSize, this.textColor);
  }
}

// ── ImageWidget ──────────────────────────────────────────────

export class ImageWidget extends ViewNode {
  readonly type: ViewNodeType = "image";
  imageId = "";
  intrinsicWidth = 100;
  intrinsicHeight = 100;

  constructor(id?: string, imageId?: string, w?: number, h?: number) {
    super(id);
    if (imageId) this.imageId = imageId;
    if (w) this.intrinsicWidth = w;
    if (h) this.intrinsicHeight = h;
  }

  measure(_maxWidth: number, _maxHeight: number): MeasureResult {
    return {
      width: clampSize(this.style.width ?? this.intrinsicWidth, this.style),
      height: clampSize(this.style.height ?? this.intrinsicHeight, this.style, true),
    };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
  }

  draw(ctx: DrawContext): void {
    drawBackground(ctx, this);
    const b = this.resolvedBounds;
    ctx.drawImage(b.x, b.y, b.width, b.height, this.imageId);
  }
}

// ── Spacer ───────────────────────────────────────────────────

export class SpacerNode extends ViewNode {
  readonly type: ViewNodeType = "spacer";

  constructor(id?: string) {
    super(id);
    this.style.flex = 1; // default: take remaining space
  }

  measure(_maxWidth: number, _maxHeight: number): MeasureResult {
    return {
      width: this.style.width ?? 0,
      height: this.style.height ?? 0,
    };
  }

  layout(x: number, y: number, width: number, height: number): void {
    this.resolvedBounds = { x, y, width, height };
  }

  draw(_ctx: DrawContext): void {
    // Spacers are invisible
  }
}

// ── View Tree Manager ────────────────────────────────────────

export class ViewTree {
  private _root: ViewNode | null = null;
  private _nodeMap = new Map<string, ViewNode>();
  private _stats: ViewTreeStats = {
    totalNodes: 0,
    dirtyNodes: 0,
    layoutPasses: 0,
    drawCalls: 0,
    treeDepth: 0,
  };

  get root(): ViewNode | null { return this._root; }

  setRoot(node: ViewNode): void {
    this._root = node;
    this._rebuildMap();
  }

  private _rebuildMap(): void {
    this._nodeMap.clear();
    if (this._root) {
      this._root.walk(n => this._nodeMap.set(n.id, n));
    }
  }

  findById(id: string): ViewNode | null {
    return this._nodeMap.get(id) ?? null;
  }

  /** Run measure + layout pass from root */
  layoutPass(availableWidth: number, availableHeight: number): Rect[] {
    if (!this._root) return [];
    this._stats.layoutPasses++;

    const m = this._root.measure(availableWidth, availableHeight);
    this._root.layout(0, 0, Math.min(m.width, availableWidth), Math.min(m.height, availableHeight));

    // Collect damage
    const damage: Rect[] = [];
    this._root.walk(n => {
      damage.push(...n.getDamageRects());
      n.clearDirty();
    });

    // Update stats
    this._rebuildMap();
    this._stats.totalNodes = this._nodeMap.size;
    this._stats.dirtyNodes = 0;
    this._stats.treeDepth = this._computeDepth();

    return damage;
  }

  /** Draw the entire tree */
  drawAll(ctx: DrawContext): void {
    if (!this._root) return;
    this._stats.drawCalls = 0;
    this._drawNode(this._root, ctx);
  }

  private _drawNode(node: ViewNode, ctx: DrawContext): void {
    if (node.style.visible === false) return;

    const opacity = (node.style.opacity ?? 1) * node.animOpacity;
    if (opacity < 1) ctx.setOpacity(opacity);

    // Apply clip if overflow hidden
    if (node.style.overflow === "hidden") {
      ctx.setClipRect(node.resolvedBounds);
    }

    // Layer bitmap cache optimization:
    // If node has a valid cached raster and is not dirty,
    // blit the cached version instead of re-drawing.
    // Compositor-layer animations (transform/opacity) are applied
    // as overlays without invalidating the cache.
    if (node.isCacheValid && node.cachedRaster) {
      // Blit cached raster at resolved position (compositor reuses this)
      const b = node.resolvedBounds;
      const cached = node.cachedRaster;
      ctx.drawImage(
        b.x + node.animTranslateX,
        b.y + node.animTranslateY,
        cached.width,
        cached.height,
        `__cached_${node.id}`
      );
      this._stats.drawCalls++;
    } else {
      node.draw(ctx);
      this._stats.drawCalls++;
    }

    if (node.style.overflow === "hidden") ctx.clearClip();
    if (opacity < 1) ctx.resetOpacity();
  }

  private _computeDepth(): number {
    if (!this._root) return 0;
    let maxDepth = 0;
    this._root.walk(n => {
      maxDepth = Math.max(maxDepth, n.getDepth());
    });
    return maxDepth + 1;
  }

  getStats(): ViewTreeStats {
    return { ...this._stats };
  }

  destroy(): void {
    this._root = null;
    this._nodeMap.clear();
  }
}

// ── Shared Helpers ───────────────────────────────────────────

function clampSize(value: number, style: ViewStyle, isHeight = false): number {
  const min = isHeight ? (style.minHeight ?? 0) : (style.minWidth ?? 0);
  const max = isHeight ? (style.maxHeight ?? Infinity) : (style.maxWidth ?? Infinity);
  return Math.max(min, Math.min(max, value));
}

function drawBackground(ctx: DrawContext, node: ViewNode): void {
  const bg = node.style.background;
  if (!bg) return;
  const b = node.resolvedBounds;
  const radii = resolveRadii(node.style.borderRadius);
  const hasRadius = radii[0] > 0 || radii[1] > 0 || radii[2] > 0 || radii[3] > 0;

  if (bg.type === "solid") {
    const color: Color = { r: bg.r, g: bg.g, b: bg.b, a: bg.a };
    if (hasRadius) {
      ctx.fillRoundedRect(b.x, b.y, b.width, b.height, radii, color);
    } else {
      ctx.fillRect(b.x, b.y, b.width, b.height, color);
    }
  } else if (bg.type === "linearGradient" || bg.type === "radialGradient") {
    const stops = bg.stops.map(s => ({
      offset: s.offset,
      color: { r: s.color.r, g: s.color.g, b: s.color.b, a: s.color.a },
    }));
    ctx.fillGradient(b.x, b.y, b.width, b.height, stops);
  }

  // Border
  const border = node.style.border;
  if (border && border.width > 0) {
    const bc: Color = { r: border.color.r, g: border.color.g, b: border.color.b, a: border.color.a };
    // Draw border as 4 thin rects
    const bw = border.width;
    ctx.fillRect(b.x, b.y, b.width, bw, bc);               // top
    ctx.fillRect(b.x, b.y + b.height - bw, b.width, bw, bc); // bottom
    ctx.fillRect(b.x, b.y + bw, bw, b.height - 2 * bw, bc);  // left
    ctx.fillRect(b.x + b.width - bw, b.y + bw, bw, b.height - 2 * bw, bc); // right
  }
}

function mainAxisOffset(align: MainAxisAlign | undefined, available: number, totalContent: number, childCount: number, spacing: number): number {
  if (!align || align === "start") return 0;
  const gap = available - totalContent;
  switch (align) {
    case "center": return gap / 2;
    case "end": return gap;
    case "space-between": return 0; // handled via spacing override
    case "space-around": return childCount > 0 ? gap / (childCount * 2) : 0;
    case "space-evenly": return childCount > 0 ? gap / (childCount + 1) : 0;
    default: return 0;
  }
}

function crossAlignOffset(align: CrossAxisAlign, start: number, available: number, childSize: number): number {
  switch (align) {
    case "start":
    case "stretch":
      return start;
    case "center":
      return start + (available - childSize) / 2;
    case "end":
      return start + available - childSize;
    default:
      return start;
  }
}
