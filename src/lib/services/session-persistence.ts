// ═══════════════════════════════════════════════════════════════
// SITA OS — Session Persistence Manager
// Full session state serialization/restore: windows, route, scroll, sidebar
// "Everything exactly where you left it"
// ═══════════════════════════════════════════════════════════════

const SESSION_KEY = "sita-session-state";
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface WindowSnapshot {
  id: string;
  title: string;
  position: { x: number; y: number };
  width?: number;
  minimized: boolean;
}

export interface SessionState {
  windows: WindowSnapshot[];
  route: string;
  scrollPositions: Record<string, number>;
  sidebarOpen: boolean;
  savedAt: number;
}

export function persistSession(state: Omit<SessionState, "savedAt">): void {
  try {
    const data: SessionState = { ...state, savedAt: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {}
}

export function restoreSession(): SessionState | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SessionState;
    if (Date.now() - data.savedAt > SESSION_TTL) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function hasSession(): boolean {
  return restoreSession() !== null;
}
