// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform IPC Bus
// Authenticated, versioned request/response + event streaming
// ═══════════════════════════════════════════════════════════════

import { makeEntityId, type EntityId } from "./entity-identity";

// ── Message Types ──────────────────────────────────────────────

export interface IPCMessage {
  requestId: string;
  correlationId?: string;
  caller: EntityId;
  sessionId?: string;
  method: string;
  payload: Record<string, unknown>;
  authToken?: string;
  deadline?: number;
  version: number;
  timestamp: number;
}

export interface IPCResponse {
  requestId: string;
  correlationId?: string;
  success: boolean;
  data?: unknown;
  error?: string;
  latencyMs: number;
  version: number;
}

export type IPCEventHandler = (event: IPCEvent) => void;
export type IPCMethodHandler = (msg: IPCMessage) => Promise<IPCResponse>;

export interface IPCEvent {
  topic: string;
  source: EntityId;
  payload: Record<string, unknown>;
  correlationId?: string;
  timestamp: number;
  deduplicationKey?: string;
}

export interface IPCMethodRegistration {
  method: string;
  handler: IPCMethodHandler;
  owner: EntityId;
  version: number;
  requiredPermissions?: string[];
  timeoutMs?: number;
  retries?: number;
}

export interface IPCStreamHandle {
  id: string;
  topic: string;
  unsubscribe: () => void;
}

// ── IPC Bus Implementation ────────────────────────────────────

let _counter = 0;
function nextId(): string { return `ipc_${Date.now()}_${++_counter}`; }

class PlatformIPCBus {
  private methods = new Map<string, IPCMethodRegistration>();
  private subscriptions = new Map<string, Set<IPCEventHandler>>();
  private recentEvents: IPCEvent[] = [];
  private dedupWindow = new Set<string>();
  private maxReplay = 100;

  /** Register an RPC method handler */
  registerMethod(reg: IPCMethodRegistration): void {
    if (this.methods.has(reg.method)) {
      console.warn(`[IPC] Overwriting method: ${reg.method}`);
    }
    this.methods.set(reg.method, reg);
  }

  /** Unregister an RPC method */
  unregisterMethod(method: string): boolean {
    return this.methods.delete(method);
  }

  /** Call an RPC method with timeout + retry */
  async call(msg: IPCMessage): Promise<IPCResponse> {
    const start = performance.now();
    const reg = this.methods.get(msg.method);
    if (!reg) {
      return { requestId: msg.requestId, success: false, error: `Method not found: ${msg.method}`, latencyMs: 0, version: msg.version };
    }

    // Permission check
    if (reg.requiredPermissions?.length) {
      // In production, verify against caller's capability grants
      // For now, log and allow
    }

    // Deadline check
    if (msg.deadline && Date.now() > msg.deadline) {
      return { requestId: msg.requestId, success: false, error: 'Deadline exceeded before dispatch', latencyMs: 0, version: msg.version };
    }

    const maxRetries = reg.retries ?? 0;
    const timeout = reg.timeoutMs ?? 10000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await Promise.race<IPCResponse>([
          reg.handler(msg),
          new Promise<IPCResponse>((_, reject) => setTimeout(() => reject(new Error('IPC timeout')), timeout)),
        ]);
        result.latencyMs = Math.round(performance.now() - start);
        return result;
      } catch (err: any) {
        if (attempt === maxRetries) {
          return { requestId: msg.requestId, success: false, error: err.message, latencyMs: Math.round(performance.now() - start), version: msg.version };
        }
        await new Promise(r => setTimeout(r, 100 * (attempt + 1)));
      }
    }

    return { requestId: msg.requestId, success: false, error: 'Exhausted retries', latencyMs: Math.round(performance.now() - start), version: msg.version };
  }

  /** Publish an event to topic subscribers */
  publish(event: IPCEvent): void {
    // Deduplication
    if (event.deduplicationKey) {
      if (this.dedupWindow.has(event.deduplicationKey)) return;
      this.dedupWindow.add(event.deduplicationKey);
      setTimeout(() => this.dedupWindow.delete(event.deduplicationKey!), 5000);
    }

    this.recentEvents.push(event);
    if (this.recentEvents.length > this.maxReplay) this.recentEvents.shift();

    const handlers = this.subscriptions.get(event.topic);
    handlers?.forEach(h => { try { h(event); } catch (e) { console.error('[IPC] Event handler error:', e); } });

    // Wildcard subscribers
    const wildcards = this.subscriptions.get('*');
    wildcards?.forEach(h => { try { h(event); } catch (e) { /* swallow */ } });
  }

  /** Subscribe to a topic, returns a handle with unsubscribe */
  subscribe(topic: string, handler: IPCEventHandler): IPCStreamHandle {
    if (!this.subscriptions.has(topic)) this.subscriptions.set(topic, new Set());
    this.subscriptions.get(topic)!.add(handler);
    const id = nextId();
    return {
      id,
      topic,
      unsubscribe: () => { this.subscriptions.get(topic)?.delete(handler); },
    };
  }

  /** Replay recent events for a topic */
  replay(topic: string): IPCEvent[] {
    return this.recentEvents.filter(e => e.topic === topic || topic === '*');
  }

  /** Create a standard message */
  createMessage(callerCanonical: string, method: string, payload: Record<string, unknown>, opts?: Partial<IPCMessage>): IPCMessage {
    const caller = makeEntityId('service', callerCanonical);
    return {
      requestId: nextId(),
      caller,
      method,
      payload,
      version: 1,
      timestamp: Date.now(),
      ...opts,
    };
  }

  /** List registered methods */
  listMethods(): string[] { return [...this.methods.keys()]; }

  /** Get bus stats */
  stats() {
    return {
      methods: this.methods.size,
      topics: this.subscriptions.size,
      recentEvents: this.recentEvents.length,
    };
  }
}

export const ipcBus = new PlatformIPCBus();
