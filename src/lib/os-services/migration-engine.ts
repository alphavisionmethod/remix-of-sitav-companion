// ═══════════════════════════════════════════════════════════════
// SITA OS — Migration Engine
// Atomic, resumable, rollback-safe migrations with hooks
// ═══════════════════════════════════════════════════════════════

export type MigrationTarget = 'config' | 'database' | 'app_manifest' | 'policy_bundle' | 'driver_mapping' | 'secrets' | 'user_settings' | 'audit_schema';
export type MigrationStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'rolled_back';

export interface Migration {
  id: string;
  target: MigrationTarget;
  fromVersion: string;
  toVersion: string;
  description: string;
  up: () => Promise<boolean>;
  down: () => Promise<boolean>;
  validate: () => Promise<boolean>;
  preHook?: () => Promise<void>;
  postHook?: () => Promise<void>;
}

export interface MigrationRecord {
  id: string;
  migrationId: string;
  target: MigrationTarget;
  status: MigrationStatus;
  fromVersion: string;
  toVersion: string;
  startedAt: number;
  completedAt?: number;
  error?: string;
  checkpointData?: Record<string, unknown>;
}

let _mid = 0;

class MigrationEngine {
  private migrations: Migration[] = [];
  private records: MigrationRecord[] = [];

  /** Register a migration */
  register(migration: Migration): void {
    this.migrations.push(migration);
  }

  /** Run a migration atomically */
  async run(migrationId: string): Promise<MigrationRecord> {
    const migration = this.migrations.find(m => m.id === migrationId);
    if (!migration) throw new Error(`Migration not found: ${migrationId}`);

    const record: MigrationRecord = {
      id: `mr_${++_mid}`, migrationId, target: migration.target,
      status: 'running', fromVersion: migration.fromVersion,
      toVersion: migration.toVersion, startedAt: Date.now(),
    };
    this.records.push(record);

    try {
      // Pre-hook
      if (migration.preHook) await migration.preHook();

      // Execute
      const success = await migration.up();
      if (!success) throw new Error('Migration up() returned false');

      // Validate
      const valid = await migration.validate();
      if (!valid) {
        // Rollback
        await migration.down();
        record.status = 'rolled_back';
        record.error = 'Validation failed after migration';
        record.completedAt = Date.now();
        return record;
      }

      // Post-hook
      if (migration.postHook) await migration.postHook();

      record.status = 'completed';
      record.completedAt = Date.now();
    } catch (err: any) {
      record.status = 'failed';
      record.error = err.message;
      record.completedAt = Date.now();

      // Attempt rollback
      try { await migration.down(); record.status = 'rolled_back'; } catch {}
    }

    return record;
  }

  /** Run all pending migrations for a target in order */
  async runAll(target: MigrationTarget): Promise<MigrationRecord[]> {
    const pending = this.migrations.filter(m => m.target === target);
    const results: MigrationRecord[] = [];
    for (const m of pending) {
      const existing = this.records.find(r => r.migrationId === m.id && r.status === 'completed');
      if (existing) continue;
      const result = await this.run(m.id);
      results.push(result);
      if (result.status !== 'completed') break; // Stop on failure
    }
    return results;
  }

  /** Rollback last migration for a target */
  async rollbackLast(target: MigrationTarget): Promise<boolean> {
    const completed = this.records.filter(r => r.target === target && r.status === 'completed').pop();
    if (!completed) return false;
    const migration = this.migrations.find(m => m.id === completed.migrationId);
    if (!migration) return false;
    try {
      await migration.down();
      completed.status = 'rolled_back';
      completed.completedAt = Date.now();
      return true;
    } catch { return false; }
  }

  getRecords(target?: MigrationTarget): MigrationRecord[] {
    return target ? this.records.filter(r => r.target === target) : [...this.records];
  }

  getPending(): Migration[] {
    const completedIds = new Set(this.records.filter(r => r.status === 'completed').map(r => r.migrationId));
    return this.migrations.filter(m => !completedIds.has(m.id));
  }

  stats() {
    return {
      registered: this.migrations.length,
      completed: this.records.filter(r => r.status === 'completed').length,
      failed: this.records.filter(r => r.status === 'failed').length,
      pending: this.getPending().length,
    };
  }
}

export const migrationEngine = new MigrationEngine();
