// ═══════════════════════════════════════════════════════════════
// SITA OS — Boot Persistence Service
// Persists BootPhaseRecord entries to boot_phase_logs table
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { BootPhaseRecord } from "@/packages/contracts/runtime/trusted-boot-runtime";

export interface BootPersistenceConfig {
  userId: string;
  deviceId: string;
  sessionId: string;
}

export class BootPersistenceService {
  private config: BootPersistenceConfig | null = null;
  private flushed = new Set<string>();

  configure(config: BootPersistenceConfig): void {
    this.config = config;
    this.flushed.clear();
  }

  async persistPhase(record: BootPhaseRecord): Promise<void> {
    if (!this.config) {
      console.warn("[BootPersistence] Not configured — skipping persist");
      return;
    }

    const key = `${this.config.sessionId}:${record.phase}:${record.status}`;
    if (this.flushed.has(key)) return;
    this.flushed.add(key);

    try {
      await supabase.from("boot_phase_logs").insert({
        user_id: this.config.userId,
        device_id: this.config.deviceId,
        session_id: this.config.sessionId,
        phase: record.phase,
        status: record.status,
        started_at: record.startedAt ?? null,
        completed_at: record.completedAt ?? null,
        duration_ms: record.durationMs ?? null,
        error: record.error ?? null,
        metadata: record.metadata ?? {},
      });
    } catch (err) {
      console.error("[BootPersistence] Failed to persist phase:", err);
    }
  }

  async persistSequence(phases: BootPhaseRecord[]): Promise<void> {
    for (const phase of phases) {
      await this.persistPhase(phase);
    }
  }

  reset(): void {
    this.flushed.clear();
    this.config = null;
  }
}

// ── Factory ─────────────────────────────────────────────────────

let _instance: BootPersistenceService | null = null;

export function getBootPersistenceService(): BootPersistenceService {
  if (!_instance) _instance = new BootPersistenceService();
  return _instance;
}
