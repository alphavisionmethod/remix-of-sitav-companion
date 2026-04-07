// SITA OS — Audit Ledger (merge: support-diagnostics)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface AuditEntry { id: string; action: string; actor: string; target: string; domain: string; severity: 'info' | 'warning' | 'critical'; details: Record<string, unknown>; timestamp: string; correlationId?: string; ip?: string; }
export class AuditLedgerService {
  private entries: AuditEntry[] = [];
  private counter = 0;
  record(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry { const e = { ...entry, id: `audit-${++this.counter}`, timestamp: new Date().toISOString() }; this.entries.push(e); return e; }
  query(filter: { actor?: string; domain?: string; severity?: string; from?: string; to?: string }): AuditEntry[] {
    return this.entries.filter(e => (!filter.actor || e.actor === filter.actor) && (!filter.domain || e.domain === filter.domain) && (!filter.severity || e.severity === filter.severity) && (!filter.from || e.timestamp >= filter.from) && (!filter.to || e.timestamp <= filter.to));
  }
  getByCorrelation(correlationId: string): AuditEntry[] { return this.entries.filter(e => e.correlationId === correlationId); }
  getRecent(limit: number = 100): AuditEntry[] { return this.entries.slice(-limit); }
  getStats() { return { total: this.entries.length, bySeverity: this.entries.reduce((a, e) => { a[e.severity] = (a[e.severity] || 0) + 1; return a; }, {} as Record<string, number>) }; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("audit-ledger", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      entries: this.entries,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.entries) this.entries = state.entries as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("audit-ledger");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createAuditLedger = () => new AuditLedgerService();
