// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Memory Engine
// Multi-layer memory: short-term, mid-term, long-term, preference, procedural
// ═══════════════════════════════════════════════════════════════

export type MemoryLayer = "short-term" | "mid-term" | "long-term" | "preference" | "procedural";

export interface MemoryItem {
  id: string;
  layer: MemoryLayer;
  advisorId: string | null; // null = shared across all advisors
  category: string;
  content: string;
  confidence: number; // 0-1
  importance: number; // 0-1
  createdAt: string;
  expiresAt: string | null;
  lastAccessedAt: string;
  accessCount: number;
  source: "system" | "observation" | "owner-input" | "reflection" | "correction";
  tags: string[];
  archived: boolean;
}

export interface MemorySnapshot {
  shortTerm: MemoryItem[];
  midTerm: MemoryItem[];
  longTerm: MemoryItem[];
  preference: MemoryItem[];
  procedural: MemoryItem[];
  totalItems: number;
  oldestItem: string | null;
  newestItem: string | null;
}

export interface MemoryCorrection {
  itemId: string;
  field: "content" | "confidence" | "importance" | "tags";
  oldValue: unknown;
  newValue: unknown;
  correctedAt: string;
  reason: string;
}

// ── Layer configuration ────────────────────────────────────────
const LAYER_LIMITS: Record<MemoryLayer, { maxItems: number; defaultTTLMs: number | null }> = {
  "short-term": { maxItems: 50, defaultTTLMs: 24 * 60 * 60 * 1000 },        // 24h
  "mid-term": { maxItems: 200, defaultTTLMs: 30 * 24 * 60 * 60 * 1000 },    // 30d
  "long-term": { maxItems: 100, defaultTTLMs: null },                        // no expiry
  "preference": { maxItems: 80, defaultTTLMs: null },
  "procedural": { maxItems: 60, defaultTTLMs: null },
};

export class AdvisorMemoryEngine {
  private memories: Map<string, MemoryItem> = new Map();
  private corrections: MemoryCorrection[] = [];

  // ── Store ──────────────────────────────────────────────────
  store(params: {
    layer: MemoryLayer;
    advisorId: string | null;
    category: string;
    content: string;
    confidence?: number;
    importance?: number;
    source?: MemoryItem["source"];
    tags?: string[];
  }): MemoryItem {
    const now = new Date().toISOString();
    const config = LAYER_LIMITS[params.layer];
    const item: MemoryItem = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      layer: params.layer,
      advisorId: params.advisorId,
      category: params.category,
      content: params.content,
      confidence: params.confidence ?? 0.7,
      importance: params.importance ?? 0.5,
      createdAt: now,
      expiresAt: config.defaultTTLMs
        ? new Date(Date.now() + config.defaultTTLMs).toISOString()
        : null,
      lastAccessedAt: now,
      accessCount: 0,
      source: params.source ?? "system",
      tags: params.tags ?? [],
      archived: false,
    };
    this.memories.set(item.id, item);
    this.enforceLayerLimits(params.layer);
    return item;
  }

  // ── Query ──────────────────────────────────────────────────
  getByLayer(layer: MemoryLayer): MemoryItem[] {
    return this.activeItems().filter(m => m.layer === layer);
  }

  getByAdvisor(advisorId: string): MemoryItem[] {
    return this.activeItems().filter(m => m.advisorId === advisorId || m.advisorId === null);
  }

  getByCategory(category: string): MemoryItem[] {
    return this.activeItems().filter(m => m.category === category);
  }

  search(query: string): MemoryItem[] {
    const q = query.toLowerCase();
    return this.activeItems().filter(m =>
      m.content.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  getItem(id: string): MemoryItem | undefined {
    const item = this.memories.get(id);
    if (item && !item.archived) {
      item.lastAccessedAt = new Date().toISOString();
      item.accessCount++;
      return item;
    }
    return undefined;
  }

  // ── Correct ────────────────────────────────────────────────
  correctMemory(id: string, field: MemoryCorrection["field"], newValue: unknown, reason: string): boolean {
    const item = this.memories.get(id);
    if (!item) return false;
    const oldValue = (item as any)[field];
    (item as any)[field] = newValue;
    this.corrections.push({
      itemId: id,
      field,
      oldValue,
      newValue,
      correctedAt: new Date().toISOString(),
      reason,
    });
    return true;
  }

  // ── Archive ────────────────────────────────────────────────
  archiveMemory(id: string): boolean {
    const item = this.memories.get(id);
    if (!item) return false;
    item.archived = true;
    return true;
  }

  // ── Snapshot ───────────────────────────────────────────────
  getMemorySnapshot(): MemorySnapshot {
    const active = this.activeItems();
    const byLayer = (l: MemoryLayer) => active.filter(m => m.layer === l);
    const dates = active.map(m => m.createdAt).sort();
    return {
      shortTerm: byLayer("short-term"),
      midTerm: byLayer("mid-term"),
      longTerm: byLayer("long-term"),
      preference: byLayer("preference"),
      procedural: byLayer("procedural"),
      totalItems: active.length,
      oldestItem: dates[0] ?? null,
      newestItem: dates[dates.length - 1] ?? null,
    };
  }

  getCorrections(): MemoryCorrection[] {
    return [...this.corrections];
  }

  // ── Helpers ────────────────────────────────────────────────
  private activeItems(): MemoryItem[] {
    const now = Date.now();
    return Array.from(this.memories.values()).filter(m => {
      if (m.archived) return false;
      if (m.expiresAt && new Date(m.expiresAt).getTime() < now) return false;
      return true;
    });
  }

  private enforceLayerLimits(layer: MemoryLayer) {
    const items = this.getByLayer(layer).sort((a, b) =>
      (a.importance * a.confidence) - (b.importance * b.confidence)
    );
    const limit = LAYER_LIMITS[layer].maxItems;
    while (items.length > limit) {
      const evict = items.shift()!;
      evict.archived = true;
    }
  }

  // ── Seed with defaults ─────────────────────────────────────
  seedDefaults() {
    this.store({ layer: "long-term", advisorId: null, category: "business-goals", content: "Primary goal: grow revenue while maintaining operational stability", importance: 0.9, source: "system", tags: ["goal", "revenue"] });
    this.store({ layer: "preference", advisorId: null, category: "communication", content: "Owner prefers concise summaries with clear action items", importance: 0.8, source: "system", tags: ["style"] });
    this.store({ layer: "preference", advisorId: null, category: "approval", content: "Owner is cautious with client-facing automation — prefers preview before send", importance: 0.9, source: "system", tags: ["approval", "caution"] });
    this.store({ layer: "procedural", advisorId: null, category: "follow-up", content: "Standard follow-up sequence: email → wait 3 days → phone → wait 2 days → final email", importance: 0.7, source: "system", tags: ["workflow", "follow-up"] });
    this.store({ layer: "procedural", advisorId: null, category: "invoicing", content: "Invoices should be sent within 24 hours of project completion", importance: 0.8, source: "system", tags: ["workflow", "invoice"] });
    this.store({ layer: "short-term", advisorId: null, category: "active-focus", content: "Current focus: pipeline acceleration and overdue invoice collection", source: "system", tags: ["focus"] });
  }
}

// ── Singleton ────────────────────────────────────────────────
let _instance: AdvisorMemoryEngine | null = null;
export function getAdvisorMemoryEngine(): AdvisorMemoryEngine {
  if (!_instance) {
    _instance = new AdvisorMemoryEngine();
    _instance.seedDefaults();
  }
  return _instance;
}
