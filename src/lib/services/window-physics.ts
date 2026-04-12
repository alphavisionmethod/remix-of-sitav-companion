// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Physics Engine
// Edge bounce, inter-window magnetic docking, shake-to-minimize
// ═══════════════════════════════════════════════════════════════

export interface PhysicsWindow {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MagneticEdge {
  axis: "x" | "y";
  position: number;
  sourceId: string;
  targetId: string;
}

/** Visual alignment guide line (absolute screen coordinates) */
export interface AlignmentGuide {
  axis: "x" | "y";
  /** For x-axis: the x coordinate of the vertical line; for y-axis: the y coordinate */
  position: number;
  /** Start of the guide line (min coordinate on the perpendicular axis) */
  start: number;
  /** End of the guide line (max coordinate on the perpendicular axis) */
  end: number;
}

/**
 * Compute visual alignment guide lines from magnetic edges.
 * Returns lines that span between the two windows sharing an edge.
 */
export function computeAlignmentGuides(
  dragging: PhysicsWindow,
  others: PhysicsWindow[],
  edges: MagneticEdge[]
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  const seen = new Set<string>();

  for (const edge of edges) {
    const other = others.find(o => o.id === edge.targetId);
    if (!other) continue;

    const key = `${edge.axis}-${Math.round(edge.position)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (edge.axis === "x") {
      // Vertical guide line at edge.position
      const minY = Math.min(dragging.y, other.y);
      const maxY = Math.max(dragging.y + dragging.height, other.y + other.height);
      guides.push({ axis: "x", position: edge.position, start: minY - 8, end: maxY + 8 });
    } else {
      // Horizontal guide line at edge.position
      const minX = Math.min(dragging.x, other.x);
      const maxX = Math.max(dragging.x + dragging.width, other.x + other.width);
      guides.push({ axis: "y", position: edge.position, start: minX - 8, end: maxX + 8 });
    }
  }

  return guides;
}

const MAGNETIC_RANGE = 12; // px snap distance
const MAGNETIC_STRENGTH = 0.6;
const EDGE_BOUNCE_DAMPING = 0.4;
const SHAKE_THRESHOLD = 400; // px total movement
const SHAKE_TIME_WINDOW = 600; // ms
const SHAKE_DIRECTION_CHANGES = 4;

// ── Magnetic Docking ──────────────────────────────────────

export function findMagneticEdges(
  dragging: PhysicsWindow,
  others: PhysicsWindow[]
): MagneticEdge[] {
  const edges: MagneticEdge[] = [];

  for (const other of others) {
    if (other.id === dragging.id) continue;

    // Left edge of dragging → right edge of other
    const leftToRight = Math.abs(dragging.x - (other.x + other.width));
    if (leftToRight < MAGNETIC_RANGE) {
      edges.push({ axis: "x", position: other.x + other.width, sourceId: dragging.id, targetId: other.id });
    }

    // Right edge of dragging → left edge of other
    const rightToLeft = Math.abs((dragging.x + dragging.width) - other.x);
    if (rightToLeft < MAGNETIC_RANGE) {
      edges.push({ axis: "x", position: other.x - dragging.width, sourceId: dragging.id, targetId: other.id });
    }

    // Top edge of dragging → bottom edge of other
    const topToBottom = Math.abs(dragging.y - (other.y + other.height));
    if (topToBottom < MAGNETIC_RANGE) {
      edges.push({ axis: "y", position: other.y + other.height, sourceId: dragging.id, targetId: other.id });
    }

    // Bottom edge of dragging → top edge of other
    const bottomToTop = Math.abs((dragging.y + dragging.height) - other.y);
    if (bottomToTop < MAGNETIC_RANGE) {
      edges.push({ axis: "y", position: other.y - dragging.height, sourceId: dragging.id, targetId: other.id });
    }

    // Align tops
    const topAlign = Math.abs(dragging.y - other.y);
    if (topAlign < MAGNETIC_RANGE) {
      edges.push({ axis: "y", position: other.y, sourceId: dragging.id, targetId: other.id });
    }

    // Align lefts
    const leftAlign = Math.abs(dragging.x - other.x);
    if (leftAlign < MAGNETIC_RANGE) {
      edges.push({ axis: "x", position: other.x, sourceId: dragging.id, targetId: other.id });
    }
  }

  return edges;
}

export function applyMagneticSnap(
  pos: { x: number; y: number },
  edges: MagneticEdge[]
): { x: number; y: number; snapped: boolean } {
  let { x, y } = pos;
  let snapped = false;

  for (const edge of edges) {
    if (edge.axis === "x") {
      const diff = edge.position - x;
      if (Math.abs(diff) < MAGNETIC_RANGE) {
        x += diff * MAGNETIC_STRENGTH;
        snapped = true;
      }
    } else {
      const diff = edge.position - y;
      if (Math.abs(diff) < MAGNETIC_RANGE) {
        y += diff * MAGNETIC_STRENGTH;
        snapped = true;
      }
    }
  }

  return { x, y, snapped };
}

// ── Edge Bounce ──────────────────────────────────────

export function applyEdgeBounce(
  pos: { x: number; y: number },
  velocity: { vx: number; vy: number },
  windowSize: { width: number; height: number },
  screenSize: { width: number; height: number }
): { x: number; y: number; vx: number; vy: number; bounced: boolean } {
  let { x, y } = pos;
  let { vx, vy } = velocity;
  let bounced = false;

  // Left edge
  if (x < 0) {
    x = 0;
    vx = Math.abs(vx) * EDGE_BOUNCE_DAMPING;
    bounced = true;
  }

  // Right edge
  if (x + windowSize.width > screenSize.width) {
    x = screenSize.width - windowSize.width;
    vx = -Math.abs(vx) * EDGE_BOUNCE_DAMPING;
    bounced = true;
  }

  // Top edge
  if (y < 0) {
    y = 0;
    vy = Math.abs(vy) * EDGE_BOUNCE_DAMPING;
    bounced = true;
  }

  // Bottom edge (leave room for dock)
  const bottomLimit = screenSize.height - 80;
  if (y + windowSize.height > bottomLimit) {
    y = bottomLimit - windowSize.height;
    vy = -Math.abs(vy) * EDGE_BOUNCE_DAMPING;
    bounced = true;
  }

  return { x, y, vx, vy, bounced };
}

// ── Shake-to-Minimize Detection ──────────────────────────────────────

interface ShakeState {
  movements: { x: number; time: number; direction: number }[];
}

const shakeStates = new Map<string, ShakeState>();

export function trackShake(windowId: string, x: number): boolean {
  if (!shakeStates.has(windowId)) {
    shakeStates.set(windowId, { movements: [] });
  }

  const state = shakeStates.get(windowId)!;
  const now = Date.now();

  // Determine direction
  const lastMove = state.movements[state.movements.length - 1];
  const direction = lastMove ? Math.sign(x - lastMove.x) : 0;

  state.movements.push({ x, time: now, direction });

  // Prune old entries
  state.movements = state.movements.filter(m => now - m.time < SHAKE_TIME_WINDOW);

  // Count direction changes
  let directionChanges = 0;
  let totalDistance = 0;
  for (let i = 1; i < state.movements.length; i++) {
    if (state.movements[i].direction !== 0 && state.movements[i].direction !== state.movements[i - 1].direction) {
      directionChanges++;
    }
    totalDistance += Math.abs(state.movements[i].x - state.movements[i - 1].x);
  }

  // Shake detected if enough direction changes and movement
  if (directionChanges >= SHAKE_DIRECTION_CHANGES && totalDistance >= SHAKE_THRESHOLD) {
    shakeStates.delete(windowId);
    return true;
  }

  return false;
}

export function clearShakeState(windowId: string) {
  shakeStates.delete(windowId);
}
