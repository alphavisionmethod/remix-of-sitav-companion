// ═══════════════════════════════════════════════════════════════
// SITA OS — Projection Service
// Event-sourced materialized views with LRU cache
// Canonical contracts: DomainId from contracts
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "@/packages/contracts";

export type { DomainId };

export type ProjectionType =
  | "customer-360"
  | "finance-dashboard"
  | "daily-pulse"
  | "travel-dashboard"
  | "household-dashboard"
  | "boardroom";

export interface ProjectionEvent {
  id: string;
  topic: string;
  payload: Record<string, unknown>;
  timestamp: number;
  source: string;
}

export interface Projection {
  type: ProjectionType;
  id: string;
  state: Record<string, unknown>;
  eventCount: number;
  lastEventId: string | null;
  snapshotAt: number | null;
  updatedAt: number;
}

export type ProjectionReducer = (
  currentState: Record<string, unknown>,
  event: ProjectionEvent
) => Record<string, unknown>;

// ── LRU Cache ───────────────────────────────────────────────────────────────

class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private maxSize: number) {}

  get(key: K): V | undefined {
    const val = this.cache.get(key);
    if (val !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, val);
    }
    return val;
  }

  set(key: K, value: V): void {
    this.cache.delete(key);
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get size(): number { return this.cache.size; }
  clear(): void { this.cache.clear(); }
}

// ── Default Reducers ────────────────────────────────────────────────────────

const defaultReducers: Record<ProjectionType, ProjectionReducer> = {
  "customer-360": (state, event) => {
    const customers = (state.customers as Record<string, unknown>[]) || [];
    if (event.topic.includes("customer")) {
      return { ...state, customers: [...customers, event.payload], lastUpdate: event.timestamp };
    }
    if (event.topic.includes("deal") || event.topic.includes("invoice")) {
      return { ...state, financialEvents: [...((state.financialEvents as never[]) || []), event.payload] };
    }
    return state;
  },
  "finance-dashboard": (state, event) => {
    if (event.topic.includes("execution.completed") && event.payload.domain === "finance") {
      const transactions = (state.transactions as never[]) || [];
      return { ...state, transactions: [...transactions, event.payload], lastUpdate: event.timestamp };
    }
    if (event.topic.includes("approval")) {
      return { ...state, pendingApprovals: ((state.pendingApprovals as number) || 0) + 1 };
    }
    return state;
  },
  "daily-pulse": (state, event) => {
    const events = (state.events as never[]) || [];
    return {
      ...state,
      events: [...events, { topic: event.topic, timestamp: event.timestamp, source: event.source }],
      eventCount: events.length + 1,
      lastUpdate: event.timestamp,
    };
  },
  "travel-dashboard": (state, event) => {
    if (event.topic.includes("booking")) {
      const bookings = (state.bookings as never[]) || [];
      return { ...state, bookings: [...bookings, event.payload], lastUpdate: event.timestamp };
    }
    return state;
  },
  "household-dashboard": (state, event) => {
    if (event.topic.includes("task") || event.topic.includes("household")) {
      const tasks = (state.tasks as never[]) || [];
      return { ...state, tasks: [...tasks, event.payload], lastUpdate: event.timestamp };
    }
    return state;
  },
  "boardroom": (state, event) => {
    const summary = (state.summary as Record<string, unknown>) || {};
    return {
      ...state,
      summary: { ...summary, totalEvents: ((summary.totalEvents as number) || 0) + 1 },
      lastEvent: { topic: event.topic, timestamp: event.timestamp },
      lastUpdate: event.timestamp,
    };
  },
};

// ── Projection Service Class ────────────────────────────────────────────────

export class ProjectionService {
  private cache: LRUCache<string, Projection>;
  private reducers: Map<ProjectionType, ProjectionReducer> = new Map();
  private snapshots: Map<string, { state: Record<string, unknown>; eventCount: number }> = new Map();
  private readonly snapshotInterval = 100;

  constructor(cacheSize = 1000) {
    this.cache = new LRUCache(cacheSize);
    for (const [type, reducer] of Object.entries(defaultReducers)) {
      this.reducers.set(type as ProjectionType, reducer);
    }
  }

  registerReducer(type: ProjectionType, reducer: ProjectionReducer): void {
    this.reducers.set(type, reducer);
  }

  applyEvent(type: ProjectionType, projectionId: string, event: ProjectionEvent): Projection {
    const key = `${type}:${projectionId}`;
    let projection = this.cache.get(key) || this.createProjection(type, projectionId);

    const reducer = this.reducers.get(type);
    if (reducer) {
      projection.state = reducer(projection.state, event);
    }

    projection.eventCount++;
    projection.lastEventId = event.id;
    projection.updatedAt = Date.now();

    // Snapshot every N events
    if (projection.eventCount % this.snapshotInterval === 0) {
      this.snapshots.set(key, { state: { ...projection.state }, eventCount: projection.eventCount });
      projection.snapshotAt = projection.eventCount;
    }

    this.cache.set(key, projection);
    return projection;
  }

  getProjection(type: ProjectionType, projectionId: string): Projection | undefined {
    return this.cache.get(`${type}:${projectionId}`);
  }

  rebuildFromEvents(type: ProjectionType, projectionId: string, events: ProjectionEvent[]): Projection {
    const key = `${type}:${projectionId}`;

    // Try to start from snapshot
    const snapshot = this.snapshots.get(key);
    let projection: Projection;
    let startIdx = 0;

    if (snapshot) {
      projection = this.createProjection(type, projectionId);
      projection.state = { ...snapshot.state };
      projection.eventCount = snapshot.eventCount;
      startIdx = snapshot.eventCount;
    } else {
      projection = this.createProjection(type, projectionId);
    }

    const reducer = this.reducers.get(type);
    if (reducer) {
      for (let i = startIdx; i < events.length; i++) {
        projection.state = reducer(projection.state, events[i]);
        projection.eventCount++;
        projection.lastEventId = events[i].id;
      }
    }

    projection.updatedAt = Date.now();
    this.cache.set(key, projection);
    return projection;
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getProjectionTypes(): ProjectionType[] {
    return Array.from(this.reducers.keys());
  }

  private createProjection(type: ProjectionType, id: string): Projection {
    return {
      type,
      id,
      state: {},
      eventCount: 0,
      lastEventId: null,
      snapshotAt: null,
      updatedAt: Date.now(),
    };
  }
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function createProjectionService(cacheSize?: number): ProjectionService {
  return new ProjectionService(cacheSize);
}

// ── Re-export modular layer (lib/services/projection-service) ──
export * from "@/lib/services/projection-service";
