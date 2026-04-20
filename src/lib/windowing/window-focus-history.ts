// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Focus History
// Alt-Tab style focus tracking and restoration.
// ═══════════════════════════════════════════════════════════════

const MAX_HISTORY = 50;
let history: string[] = [];

export function recordFocus(windowId: string): void {
  history = history.filter(id => id !== windowId);
  history.unshift(windowId);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
}

export function getPreviousFocus(): string | null {
  return history[1] ?? null;
}

export function getFocusHistory(limit = 10): string[] {
  return history.slice(0, limit);
}

export function removeFocusEntry(windowId: string): void {
  history = history.filter(id => id !== windowId);
}

export function clearFocusHistory(): void {
  history = [];
}

export function getCurrentFocus(): string | null {
  return history[0] ?? null;
}