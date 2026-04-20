// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Session Store
// Crash-safe window state persistence using sessionStorage.
// On clean shutdown, state is cleared. On crash, state persists
// so window-recovery.ts can offer "Restore previous session?"
// ═══════════════════════════════════════════════════════════════

const SESSION_KEY = "nova-window-session";
const CLEAN_SHUTDOWN_KEY = "nova-clean-shutdown";

export interface WindowSessionSnapshot {
  windowId: string;
  appId: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  savedAt: number;
  // ── Extended fields (Wave 12.7) ────────────────────────────
  workspaceId?: string;
  monitorId?: string;
  focusOrder?: number;
  lifecycleState?: string;
  dpiScale?: number;
  snapZone?: string | null;
}

export interface SessionBundle {
  windows: WindowSessionSnapshot[];
  capturedAt: number;
}

/** Save current window state to sessionStorage. Call periodically. */
export function persistWindowSession(windows: WindowSessionSnapshot[]): void {
  try {
    const bundle: SessionBundle = { windows, capturedAt: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(bundle));
  } catch { /* quota exceeded — silently skip */ }
}

/** Load the last saved session bundle (if any). */
export function loadWindowSession(): SessionBundle | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionBundle;
  } catch {
    return null;
  }
}

/** Clear the session store (call on clean shutdown). */
export function clearWindowSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Mark a clean shutdown so recovery knows not to offer restore. */
export function markCleanShutdown(): void {
  try {
    localStorage.setItem(CLEAN_SHUTDOWN_KEY, String(Date.now()));
    clearWindowSession();
  } catch { /* ignore */ }
}

/** Check if last shutdown was clean. */
export function wasCleanShutdown(): boolean {
  try {
    const ts = localStorage.getItem(CLEAN_SHUTDOWN_KEY);
    if (!ts) return false;
    // If clean shutdown was within last 30s, consider it clean
    return Date.now() - Number(ts) < 30_000;
  } catch {
    return false;
  }
}

/** Clear the clean shutdown flag (call at boot to detect crashes). */
export function clearCleanShutdownFlag(): void {
  localStorage.removeItem(CLEAN_SHUTDOWN_KEY);
}