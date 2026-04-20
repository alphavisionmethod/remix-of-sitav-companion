// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Z-Order Manager
// Canonical z-order stack with pinning support.
// ═══════════════════════════════════════════════════════════════

interface ZEntry { windowId: string; zIndex: number; pinned: boolean; }

let stack: ZEntry[] = [];
let nextZ = 1;

export function resetZOrderState(): void { stack = []; nextZ = 1; }

export function addToStack(windowId: string, pinned = false): number {
  const z = nextZ++;
  stack.push({ windowId, zIndex: z, pinned });
  reorder();
  return z;
}

export function removeFromStack(windowId: string): void {
  stack = stack.filter(e => e.windowId !== windowId);
}

export function bringToFront(windowId: string): number {
  const entry = stack.find(e => e.windowId === windowId);
  if (!entry) return addToStack(windowId);
  entry.zIndex = nextZ++;
  reorder();
  return entry.zIndex;
}

export function sendToBack(windowId: string): void {
  const entry = stack.find(e => e.windowId === windowId);
  if (!entry) return;
  const minZ = Math.min(...stack.map(e => e.zIndex));
  entry.zIndex = minZ - 1;
  reorder();
}

export function insertAbove(windowId: string, referenceId: string): void {
  const ref = stack.find(e => e.windowId === referenceId);
  const entry = stack.find(e => e.windowId === windowId);
  if (!ref || !entry) return;
  entry.zIndex = ref.zIndex + 0.5;
  reorder();
}

export function insertBelow(windowId: string, referenceId: string): void {
  const ref = stack.find(e => e.windowId === referenceId);
  const entry = stack.find(e => e.windowId === windowId);
  if (!ref || !entry) return;
  entry.zIndex = ref.zIndex - 0.5;
  reorder();
}

export function setPinned(windowId: string, pinned: boolean): void {
  const entry = stack.find(e => e.windowId === windowId);
  if (entry) entry.pinned = pinned;
  reorder();
}

export function getPinnedWindows(): string[] {
  return stack.filter(e => e.pinned).map(e => e.windowId);
}

export function getStack(): { windowId: string; zIndex: number }[] {
  return stack.map(({ windowId, zIndex }) => ({ windowId, zIndex }));
}

function reorder(): void {
  stack.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? 1 : -1;
    return a.zIndex - b.zIndex;
  });
  stack.forEach((e, i) => { e.zIndex = i + 1; });
  nextZ = stack.length + 1;
}