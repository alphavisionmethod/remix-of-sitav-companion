// ═══════════════════════════════════════════════════════════════
// SITA OS — Retained Scene Graph
// Persistent node tree with transform inheritance, dirty flag
// propagation, hit testing, bounding box computation, opacity
// inheritance, visibility culling, and display list generation.
// ═══════════════════════════════════════════════════════════════

import type { Rect } from "./damage-tracker";
import type { Color } from "./software-rasterizer";
import type { VectorPath } from "./vector-renderer";

// ── Types ────────────────────────────────────────────────────

export interface Transform2D {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  rotation: number; // degrees
  originX: number;
  originY: number;
}

export type SceneNodeType = "group" | "rect" | "path" | "text" | "image" | "clip";

export interface SceneNodeProps {
  type: SceneNodeType;
  id: string;
  name?: string;
  transform?: Partial<Transform2D>;
  opacity?: number;
  visible?: boolean;
  interactive?: boolean;
  clipToBounds?: boolean;
  // Render properties
  fillColor?: Color;
  strokeColor?: Color;
  strokeWidth?: number;
  path?: VectorPath;
  text?: string;
  fontSize?: number;
  imageId?: string;
  width?: number;
  height?: number;
}

export interface DisplayListEntry {
  nodeId: string;
  worldTransform: Transform2D;
  worldOpacity: number;
  bounds: Rect;
  type: SceneNodeType;
  fillColor?: Color;
  strokeColor?: Color;
  strokeWidth?: number;
  path?: VectorPath;
  text?: string;
  fontSize?: number;
  imageId?: string;
  width?: number;
  height?: number;
}

export interface HitTestResult {
  nodeId: string;
  localX: number;
  localY: number;
  depth: number;
}

export interface SceneGraphStats {
  totalNodes: number;
  dirtyNodes: number;
  visibleNodes: number;
  displayListSize: number;
  lastTraversalMs: number;
}

// ── Identity transform ───────────────────────────────────────

const IDENTITY: Transform2D = { tx: 0, ty: 0, sx: 1, sy: 1, rotation: 0, originX: 0, originY: 0 };

// ── Scene Node ───────────────────────────────────────────────

export class SceneNode {
  readonly id: string;
  readonly type: SceneNodeType;
  name: string;

  // Tree
  parent: SceneNode | null = null;
  children: SceneNode[] = [];

  // Properties
  localTransform: Transform2D;
  opacity: number;
  visible: boolean;
  interactive: boolean;
  clipToBounds: boolean;

  // Render props
  fillColor?: Color;
  strokeColor?: Color;
  strokeWidth?: number;
  path?: VectorPath;
  text?: string;
  fontSize?: number;
  imageId?: string;
  width: number;
  height: number;

  // Cached
  private _worldTransform: Transform2D = { ...IDENTITY };
  private _worldOpacity = 1;
  private _worldBounds: Rect = { x: 0, y: 0, width: 0, height: 0 };
  private _dirty = true;
  private _transformDirty = true;
  private _boundsDirty = true;

  constructor(props: SceneNodeProps) {
    this.id = props.id;
    this.type = props.type;
    this.name = props.name ?? props.id;
    this.localTransform = { ...IDENTITY, ...props.transform };
    this.opacity = props.opacity ?? 1;
    this.visible = props.visible ?? true;
    this.interactive = props.interactive ?? true;
    this.clipToBounds = props.clipToBounds ?? false;
    this.fillColor = props.fillColor;
    this.strokeColor = props.strokeColor;
    this.strokeWidth = props.strokeWidth;
    this.path = props.path;
    this.text = props.text;
    this.fontSize = props.fontSize;
    this.imageId = props.imageId;
    this.width = props.width ?? 0;
    this.height = props.height ?? 0;
  }

  // ── Tree manipulation ────────────────────────────────────

  addChild(child: SceneNode): void {
    if (child.parent) child.parent.removeChild(child);
    child.parent = this;
    this.children.push(child);
    child._markDirtyDown();
    this._markBoundsDirtyUp();
  }

  removeChild(child: SceneNode): void {
    const idx = this.children.indexOf(child);
    if (idx >= 0) {
      this.children.splice(idx, 1);
      child.parent = null;
      this._markBoundsDirtyUp();
    }
  }

  removeFromParent(): void {
    this.parent?.removeChild(this);
  }

  // ── Property setters that mark dirty ─────────────────────

  setTransform(t: Partial<Transform2D>): void {
    Object.assign(this.localTransform, t);
    this._markDirtyDown();
  }

  setOpacity(o: number): void {
    this.opacity = Math.max(0, Math.min(1, o));
    this._markDirtyDown();
  }

  setVisible(v: boolean): void {
    this.visible = v;
    this._dirty = true;
    this._markBoundsDirtyUp();
  }

  setFill(color: Color): void {
    this.fillColor = color;
    this._dirty = true;
  }

  setSize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this._markBoundsDirtyUp();
  }

  get isDirty(): boolean { return this._dirty; }

  // ── World transform computation ──────────────────────────

  getWorldTransform(): Transform2D {
    if (this._transformDirty) this._recomputeWorld();
    return this._worldTransform;
  }

  getWorldOpacity(): number {
    if (this._transformDirty) this._recomputeWorld();
    return this._worldOpacity;
  }

  getWorldBounds(): Rect {
    if (this._boundsDirty) this._recomputeBounds();
    return this._worldBounds;
  }

  // ── Hit testing ────────────────────────────────────────────

  hitTest(worldX: number, worldY: number, depth = 0): HitTestResult | null {
    if (!this.visible || !this.interactive) return null;

    const wt = this.getWorldTransform();
    const bounds = this.getWorldBounds();

    // Quick AABB reject
    if (worldX < bounds.x || worldX > bounds.x + bounds.width ||
        worldY < bounds.y || worldY > bounds.y + bounds.height) {
      return null;
    }

    // Children first (front to back)
    for (let i = this.children.length - 1; i >= 0; i--) {
      const result = this.children[i].hitTest(worldX, worldY, depth + 1);
      if (result) return result;
    }

    // Self
    if (this.type !== "group") {
      const localX = worldX - wt.tx;
      const localY = worldY - wt.ty;
      return { nodeId: this.id, localX, localY, depth };
    }

    return null;
  }

  // ── Display list generation ────────────────────────────────

  generateDisplayList(list: DisplayListEntry[] = []): DisplayListEntry[] {
    if (!this.visible) return list;

    const wt = this.getWorldTransform();
    const wo = this.getWorldOpacity();

    if (wo <= 0.001) return list;

    if (this.type !== "group") {
      list.push({
        nodeId: this.id,
        worldTransform: { ...wt },
        worldOpacity: wo,
        bounds: this.getWorldBounds(),
        type: this.type,
        fillColor: this.fillColor,
        strokeColor: this.strokeColor,
        strokeWidth: this.strokeWidth,
        path: this.path,
        text: this.text,
        fontSize: this.fontSize,
        imageId: this.imageId,
        width: this.width,
        height: this.height,
      });
    }

    for (const child of this.children) {
      child.generateDisplayList(list);
    }

    return list;
  }

  // ── Traversal ──────────────────────────────────────────────

  traverse(fn: (node: SceneNode, depth: number) => void, depth = 0): void {
    fn(this, depth);
    for (const child of this.children) child.traverse(fn, depth + 1);
  }

  findById(id: string): SceneNode | null {
    if (this.id === id) return this;
    for (const child of this.children) {
      const found = child.findById(id);
      if (found) return found;
    }
    return null;
  }

  // ── Dirty flag management ──────────────────────────────────

  clearDirtyFlags(): void {
    this._dirty = false;
    for (const child of this.children) child.clearDirtyFlags();
  }

  private _markDirtyDown(): void {
    this._dirty = true;
    this._transformDirty = true;
    this._boundsDirty = true;
    for (const child of this.children) child._markDirtyDown();
  }

  private _markBoundsDirtyUp(): void {
    this._boundsDirty = true;
    this._dirty = true;
    this.parent?._markBoundsDirtyUp();
  }

  private _recomputeWorld(): void {
    if (this.parent) {
      const pt = this.parent.getWorldTransform();
      this._worldTransform = {
        tx: pt.tx + this.localTransform.tx * pt.sx,
        ty: pt.ty + this.localTransform.ty * pt.sy,
        sx: pt.sx * this.localTransform.sx,
        sy: pt.sy * this.localTransform.sy,
        rotation: pt.rotation + this.localTransform.rotation,
        originX: this.localTransform.originX,
        originY: this.localTransform.originY,
      };
      this._worldOpacity = this.parent.getWorldOpacity() * this.opacity;
    } else {
      this._worldTransform = { ...this.localTransform };
      this._worldOpacity = this.opacity;
    }
    this._transformDirty = false;
  }

  private _recomputeBounds(): void {
    const wt = this.getWorldTransform();
    let minX = wt.tx;
    let minY = wt.ty;
    let maxX = wt.tx + this.width * wt.sx;
    let maxY = wt.ty + this.height * wt.sy;

    for (const child of this.children) {
      if (!child.visible) continue;
      const cb = child.getWorldBounds();
      minX = Math.min(minX, cb.x);
      minY = Math.min(minY, cb.y);
      maxX = Math.max(maxX, cb.x + cb.width);
      maxY = Math.max(maxY, cb.y + cb.height);
    }

    this._worldBounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    this._boundsDirty = false;
  }
}

// ═════════════════════════════════════════════════════════════

export class SceneGraph {
  private _root: SceneNode;
  private _nodeMap = new Map<string, SceneNode>();
  private _displayList: DisplayListEntry[] = [];
  private _displayListDirty = true;
  private _lastTraversalMs = 0;

  constructor() {
    this._root = new SceneNode({ type: "group", id: "root", width: 0, height: 0 });
    this._nodeMap.set("root", this._root);
  }

  get root(): SceneNode { return this._root; }

  // ── Node management ────────────────────────────────────────

  createNode(props: SceneNodeProps): SceneNode {
    const node = new SceneNode(props);
    this._nodeMap.set(node.id, node);
    this._displayListDirty = true;
    return node;
  }

  addNode(node: SceneNode, parentId = "root"): void {
    const parent = this._nodeMap.get(parentId);
    if (!parent) return;
    parent.addChild(node);
    this._registerSubtree(node);
    this._displayListDirty = true;
  }

  removeNode(id: string): void {
    const node = this._nodeMap.get(id);
    if (!node || id === "root") return;
    node.removeFromParent();
    this._unregisterSubtree(node);
    this._displayListDirty = true;
  }

  getNode(id: string): SceneNode | undefined {
    return this._nodeMap.get(id);
  }

  // ── Display list ───────────────────────────────────────────

  getDisplayList(): DisplayListEntry[] {
    if (this._displayListDirty) this._rebuildDisplayList();
    return this._displayList;
  }

  /** Returns damage rects from dirty nodes, then clears dirty flags */
  collectDamage(): Rect[] {
    const rects: Rect[] = [];
    this._root.traverse((node) => {
      if (node.isDirty && node.visible && node.type !== "group") {
        rects.push(node.getWorldBounds());
      }
    });
    this._root.clearDirtyFlags();
    this._displayListDirty = true;
    return rects;
  }

  // ── Hit testing ────────────────────────────────────────────

  hitTest(x: number, y: number): HitTestResult | null {
    return this._root.hitTest(x, y);
  }

  // ── Stats ──────────────────────────────────────────────────

  getStats(): SceneGraphStats {
    let dirty = 0;
    let visible = 0;
    this._root.traverse((node) => {
      if (node.isDirty) dirty++;
      if (node.visible) visible++;
    });
    return {
      totalNodes: this._nodeMap.size,
      dirtyNodes: dirty,
      visibleNodes: visible,
      displayListSize: this._displayList.length,
      lastTraversalMs: this._lastTraversalMs,
    };
  }

  // ── Internal ───────────────────────────────────────────────

  private _rebuildDisplayList(): void {
    const start = performance.now();
    this._displayList = this._root.generateDisplayList();
    this._lastTraversalMs = performance.now() - start;
    this._displayListDirty = false;
  }

  private _registerSubtree(node: SceneNode): void {
    this._nodeMap.set(node.id, node);
    for (const child of node.children) this._registerSubtree(child);
  }

  private _unregisterSubtree(node: SceneNode): void {
    this._nodeMap.delete(node.id);
    for (const child of node.children) this._unregisterSubtree(child);
  }
}
