// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Modal Policy
// Modal ownership, nesting limits, and closure semantics.
// ═══════════════════════════════════════════════════════════════

const MAX_NESTING_DEPTH = 3;
const modalOwnership = new Map<string, string>(); // modalId -> ownerId

export function registerModal(modalId: string, ownerId: string): boolean {
  const depth = getModalStack(ownerId).length;
  if (depth >= MAX_NESTING_DEPTH) return false;
  modalOwnership.set(modalId, ownerId);
  return true;
}

export function unregisterModal(modalId: string): void {
  modalOwnership.delete(modalId);
}

export function canOpenModal(parentId: string): { allowed: boolean; depth: number } {
  const depth = getModalStack(parentId).length;
  return { allowed: depth < MAX_NESTING_DEPTH, depth };
}

export function getModalStack(parentId: string): string[] {
  const stack: string[] = [];
  for (const [modal, owner] of modalOwnership) {
    if (owner === parentId) {
      stack.push(modal);
      stack.push(...getModalStack(modal));
    }
  }
  return stack;
}

export function getModalOwner(modalId: string): string | null {
  return modalOwnership.get(modalId) ?? null;
}

export function isBlocked(windowId: string): boolean {
  for (const [, owner] of modalOwnership) {
    if (owner === windowId) return true;
  }
  return false;
}

export function resolveModalClosure(modalId: string): { focusTarget: string | null; childModals: string[] } {
  const owner = getModalOwner(modalId);
  const children = getModalStack(modalId);
  // Unregister all children and self
  for (const child of children) modalOwnership.delete(child);
  modalOwnership.delete(modalId);
  return { focusTarget: owner, childModals: children };
}

export function clearModalState(): void {
  modalOwnership.clear();
}