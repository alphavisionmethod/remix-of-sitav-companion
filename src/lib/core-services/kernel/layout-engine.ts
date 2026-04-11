// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Layout Engine (Section 5.6)
// Two-pass measure+layout with Flex solver and Constraint solver.
// Emits damage rects for nodes whose bounds changed.
// ═══════════════════════════════════════════════════════════════

import type { Rect } from "./damage-tracker";
import type { ViewNode, ConstraintDef } from "./view-tree";

// ── Types ────────────────────────────────────────────────────

export interface LayoutConstraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export interface LayoutEngineStats {
  totalPasses: number;
  constraintResolutions: number;
  nodesLaidOut: number;
  damageRectsEmitted: number;
}

// ── Constraint Solver ────────────────────────────────────────

interface ResolvedAnchors {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

function resolveConstraints(
  node: ViewNode,
  parentBounds: Rect,
  siblingMap: Map<string, Rect>
): ResolvedAnchors | null {
  const c = node.constraints;
  if (!c) return null;

  const result: ResolvedAnchors = {};
  const measured = node.measure(parentBounds.width, parentBounds.height);

  // Horizontal anchors
  let left: number | undefined;
  let right: number | undefined;

  if (c.left) {
    const anchor = getAnchorX(c.left.anchor, c.left.edge, parentBounds, siblingMap);
    if (anchor !== undefined) left = anchor + (c.left.offset ?? 0);
  }
  if (c.right) {
    const anchor = getAnchorX(c.right.anchor, c.right.edge, parentBounds, siblingMap);
    if (anchor !== undefined) right = anchor - (c.right.offset ?? 0);
  }

  if (left !== undefined && right !== undefined) {
    result.x = left;
    result.width = right - left;
  } else if (left !== undefined) {
    result.x = left;
    result.width = measured.width;
  } else if (right !== undefined) {
    result.width = measured.width;
    result.x = right - measured.width;
  }

  // Vertical anchors
  let top: number | undefined;
  let bottom: number | undefined;

  if (c.top) {
    const anchor = getAnchorY(c.top.anchor, c.top.edge, parentBounds, siblingMap);
    if (anchor !== undefined) top = anchor + (c.top.offset ?? 0);
  }
  if (c.bottom) {
    const anchor = getAnchorY(c.bottom.anchor, c.bottom.edge, parentBounds, siblingMap);
    if (anchor !== undefined) bottom = anchor - (c.bottom.offset ?? 0);
  }

  if (top !== undefined && bottom !== undefined) {
    result.y = top;
    result.height = bottom - top;
  } else if (top !== undefined) {
    result.y = top;
    result.height = measured.height;
  } else if (bottom !== undefined) {
    result.height = measured.height;
    result.y = bottom - measured.height;
  }

  // Center constraints
  if (c.centerX) {
    const w = result.width ?? measured.width;
    if (c.centerX === "parent") {
      result.x = parentBounds.x + (parentBounds.width - w) / 2;
    } else {
      const sibling = siblingMap.get(c.centerX);
      if (sibling) result.x = sibling.x + (sibling.width - w) / 2;
    }
    if (result.width === undefined) result.width = w;
  }

  if (c.centerY) {
    const h = result.height ?? measured.height;
    if (c.centerY === "parent") {
      result.y = parentBounds.y + (parentBounds.height - h) / 2;
    } else {
      const sibling = siblingMap.get(c.centerY);
      if (sibling) result.y = sibling.y + (sibling.height - h) / 2;
    }
    if (result.height === undefined) result.height = h;
  }

  // Aspect ratio
  if (c.aspectRatio) {
    if (result.width !== undefined && result.height === undefined) {
      result.height = result.width / c.aspectRatio;
    } else if (result.height !== undefined && result.width === undefined) {
      result.width = result.height * c.aspectRatio;
    }
  }

  return result;
}

function getAnchorX(
  anchor: "parent" | string,
  edge: "left" | "right",
  parentBounds: Rect,
  siblingMap: Map<string, Rect>
): number | undefined {
  if (anchor === "parent") {
    return edge === "left" ? parentBounds.x : parentBounds.x + parentBounds.width;
  }
  const sibling = siblingMap.get(anchor);
  if (!sibling) return undefined;
  return edge === "left" ? sibling.x : sibling.x + sibling.width;
}

function getAnchorY(
  anchor: "parent" | string,
  edge: "top" | "bottom",
  parentBounds: Rect,
  siblingMap: Map<string, Rect>
): number | undefined {
  if (anchor === "parent") {
    return edge === "top" ? parentBounds.y : parentBounds.y + parentBounds.height;
  }
  const sibling = siblingMap.get(anchor);
  if (!sibling) return undefined;
  return edge === "top" ? sibling.y : sibling.y + sibling.height;
}

// ── Layout Engine ────────────────────────────────────────────

export class LayoutEngine {
  private _stats: LayoutEngineStats = {
    totalPasses: 0,
    constraintResolutions: 0,
    nodesLaidOut: 0,
    damageRectsEmitted: 0,
  };

  /**
   * Run a full layout pass on a view tree root.
   * Two-phase: 
   *   1. Standard flex layout (measure + layout on ViewNode hierarchy)
   *   2. Constraint resolution post-pass for nodes with ConstraintDef
   * Returns damage rects for changed bounds.
   */
  layoutPass(root: ViewNode, availableWidth: number, availableHeight: number): Rect[] {
    this._stats.totalPasses++;
    this._stats.nodesLaidOut = 0;

    // Phase 1: Standard flex layout
    const measured = root.measure(availableWidth, availableHeight);
    root.layout(
      0, 0,
      Math.min(measured.width, availableWidth),
      Math.min(measured.height, availableHeight)
    );
    this._countNodes(root);

    // Phase 2: Constraint resolution
    this._resolveConstraintsRecursive(root);

    // Collect damage
    const damage: Rect[] = [];
    root.walk(n => {
      const rects = n.getDamageRects();
      damage.push(...rects);
      n.clearDirty();
    });

    this._stats.damageRectsEmitted += damage.length;
    return damage;
  }

  private _resolveConstraintsRecursive(node: ViewNode): void {
    // Build sibling map for constraint references
    const siblingMap = new Map<string, Rect>();
    for (const c of node.children) {
      siblingMap.set(c.id, c.resolvedBounds);
    }

    for (const child of node.children) {
      if (child.constraints) {
        const resolved = resolveConstraints(child, node.resolvedBounds, siblingMap);
        if (resolved) {
          this._stats.constraintResolutions++;
          child.layout(
            resolved.x ?? child.resolvedBounds.x,
            resolved.y ?? child.resolvedBounds.y,
            resolved.width ?? child.resolvedBounds.width,
            resolved.height ?? child.resolvedBounds.height
          );
          // Update sibling map with new bounds
          siblingMap.set(child.id, child.resolvedBounds);
        }
      }
      // Recurse
      this._resolveConstraintsRecursive(child);
    }
  }

  private _countNodes(node: ViewNode): void {
    this._stats.nodesLaidOut++;
    for (const c of node.children) this._countNodes(c);
  }

  getStats(): LayoutEngineStats {
    return { ...this._stats };
  }
}
