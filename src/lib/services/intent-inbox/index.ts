// SITA OS — Intent Inbox (merge: brain-core)
export interface IntentMessage { id: string; intent: string; source: string; payload: Record<string, unknown>; priority: string; status: 'pending' | 'routed' | 'processed'; receivedAt: string; }
export class IntentInboxService {
  private messages: IntentMessage[] = [];
  private counter = 0;
  receive(intent: string, source: string, payload: Record<string, unknown>, priority: string = 'normal'): IntentMessage { const m: IntentMessage = { id: `intent-${++this.counter}`, intent, source, payload, priority, status: 'pending', receivedAt: new Date().toISOString() }; this.messages.push(m); return m; }
  route(id: string): boolean { const m = this.messages.find(x => x.id === id); if (m) { m.status = 'routed'; return true; } return false; }
  markProcessed(id: string): boolean { const m = this.messages.find(x => x.id === id); if (m) { m.status = 'processed'; return true; } return false; }
  getPending(): IntentMessage[] { return this.messages.filter(m => m.status === 'pending'); }
  getAll(): IntentMessage[] { return [...this.messages]; }
}
export const createIntentInbox = () => new IntentInboxService();
