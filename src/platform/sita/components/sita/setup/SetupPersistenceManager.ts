import type { SetupPhaseId } from "@/packages/contracts/specialized/setup-orchestration";

const STORAGE_KEY = "sita-setup-checkpoint";
const STALENESS_MS = 30 * 60 * 1000; // 30 minutes

interface SetupCheckpoint {
  state: any;
  phase: SetupPhaseId;
  timestamp: number;
}

export function persistSetupState(state: any, phase: SetupPhaseId): void {
  try {
    const checkpoint: SetupCheckpoint = { state, phase, timestamp: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(checkpoint));
  } catch { /* quota exceeded — best effort */ }
}

export function loadPersistedSetupState(): { state: any; phase: SetupPhaseId } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const checkpoint: SetupCheckpoint = JSON.parse(raw);
    if (Date.now() - checkpoint.timestamp > STALENESS_MS) {
      clearPersistedSetupState();
      return null;
    }
    if (!checkpoint.state || !checkpoint.phase) return null;
    return { state: checkpoint.state, phase: checkpoint.phase };
  } catch {
    return null;
  }
}

export function clearPersistedSetupState(): void {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
}
