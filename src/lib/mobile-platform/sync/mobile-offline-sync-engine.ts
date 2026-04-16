// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Offline Sync Engine
// Drains the queue with backoff + conflict policy + retry budget.
// ═══════════════════════════════════════════════════════════════

import { mobileSyncQueue } from "./sync-queue-manager";
import { nextRetry } from "./retry-policy";
import { getOfflinePolicy } from "../contracts/offline-sync-contract";
import type { OfflineMutation } from "../contracts/offline-sync-contract";

export type MutationExecutor = (m: OfflineMutation) => Promise<{ ok: true } | { ok: false; conflict?: boolean; error?: string }>;

export class MobileOfflineSyncEngine {
  private executor: MutationExecutor | null = null;
  private draining = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  setExecutor(executor: MutationExecutor) {
    this.executor = executor;
  }

  async drain(): Promise<void> {
    if (this.draining || !this.executor) return;
    this.draining = true;
    try {
      const queued = mobileSyncQueue.list({ status: "queued" });
      for (const mutation of queued) {
        await mobileSyncQueue.updateStatus(mutation.id, "in-flight");
        try {
          const result = await this.executor(mutation);
          if (result.ok === true) {
            await mobileSyncQueue.updateStatus(mutation.id, "succeeded");
            await mobileSyncQueue.remove(mutation.id);
          } else if (result.conflict === true) {
            await mobileSyncQueue.updateStatus(mutation.id, "conflict", result.error);
          } else {
            const policy = getOfflinePolicy(mutation.domain);
            const decision = nextRetry(mutation.attempts, policy.maxAttempts);
            if (decision.shouldRetry) {
              await mobileSyncQueue.updateStatus(mutation.id, "queued", result.error);
              this.scheduleDrain(decision.delayMs);
              break;
            } else {
              await mobileSyncQueue.updateStatus(mutation.id, "abandoned", result.error);
            }
          }
        } catch (err) {
          await mobileSyncQueue.updateStatus(mutation.id, "failed", err instanceof Error ? err.message : String(err));
        }
      }
    } finally {
      this.draining = false;
    }
  }

  scheduleDrain(delayMs = 1000) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.drain(), delayMs);
  }
}

export const mobileOfflineSyncEngine = new MobileOfflineSyncEngine();
