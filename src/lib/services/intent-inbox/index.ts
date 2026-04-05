// SITA OS — Intent Inbox (merge: brain-core)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface IntentMessage { id: string; intent: string; source: string; payload: Record<string, unknown>; priority: string; status: 'pending' | 'routed' | 'processed'; receivedAt: string; }
export class IntentInboxService {
  private messages: IntentMessage[] = [];
  private counter = 0;
  receive(intent: string, source: string, payload: Record<string, unknown>, priority: string = 'normal'): IntentMessage { const m: IntentMessage = { id: `intent-${++this.counter}`, intent, source, payload, priority, status: 'pending', receivedAt: new Date().toISOString() }; this.messages.push(m); return m; }
  route(id: string): boolean { const m = this.messages.find(x => x.id === id); if (m) { m.status = 'routed'; return true; } return false; }
  markProcessed(id: string): boolean { const m = this.messages.find(x => x.id === id); if (m) { m.status = 'processed'; return true; } return false; }
  getPending(): IntentMessage[] { return this.messages.filter(m => m.status === 'pending'); }
  getAll(): IntentMessage[] { return [...this.messages]; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("intent-inbox", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      messages: this.messages,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.messages) this.messages = state.messages as any;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("intent-inbox");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createIntentInbox = () => new IntentInboxService();
