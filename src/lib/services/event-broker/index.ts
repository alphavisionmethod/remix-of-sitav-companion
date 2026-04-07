// SITA OS — Event Broker (merge: event-bus)
import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface BrokerSubscription { id: string; topic: string; handler: string; filter?: Record<string, unknown>; }
export class EventBrokerService {
  private subscriptions: BrokerSubscription[] = [];
  private counter = 0;
  subscribe(topic: string, handler: string, filter?: Record<string, unknown>): BrokerSubscription { const s: BrokerSubscription = { id: `sub-${++this.counter}`, topic, handler, filter }; this.subscriptions.push(s); return s; }
  unsubscribe(id: string): boolean { const i = this.subscriptions.findIndex(s => s.id === id); if (i >= 0) { this.subscriptions.splice(i, 1); return true; } return false; }
  getSubscribers(topic: string): BrokerSubscription[] { return this.subscriptions.filter(s => s.topic === topic); }
  listTopics(): string[] { return [...new Set(this.subscriptions.map(s => s.topic))]; }
  getStats(): { topics: number; subscriptions: number } { return { topics: this.listTopics().length, subscriptions: this.subscriptions.length }; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("event-broker", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      subscriptions: this.subscriptions,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.subscriptions) this.subscriptions = state.subscriptions as never;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("event-broker");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}
export const createEventBroker = () => new EventBrokerService();

