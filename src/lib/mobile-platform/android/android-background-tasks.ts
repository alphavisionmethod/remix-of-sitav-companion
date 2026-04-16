// ═══════════════════════════════════════════════════════════════
// SITA OS — Android Background Tasks Adapter (WorkManager)
// ═══════════════════════════════════════════════════════════════

import { BACKGROUND_TASK_REGISTRY, type BackgroundTaskKind } from "../contracts/background-task-contract";

export interface AndroidBackgroundTasksAdapter {
  register(kind: BackgroundTaskKind, runner: () => Promise<void>): void;
  isAvailable(): boolean;
  fireForTesting(kind: BackgroundTaskKind): Promise<void>;
}

const REGISTRY = new Map<BackgroundTaskKind, () => Promise<void>>();

export const androidBackgroundTasksAdapter: AndroidBackgroundTasksAdapter = {
  isAvailable() {
    if (typeof window === "undefined") return false;
    return Boolean((window as Window & { Capacitor?: unknown }).Capacitor);
  },
  register(kind, runner) {
    const spec = BACKGROUND_TASK_REGISTRY.find((s) => s.kind === kind);
    if (!spec) throw new Error(`Unknown background task: ${kind}`);
    REGISTRY.set(kind, runner);
  },
  async fireForTesting(kind) {
    const runner = REGISTRY.get(kind);
    if (runner) await runner();
  },
};
