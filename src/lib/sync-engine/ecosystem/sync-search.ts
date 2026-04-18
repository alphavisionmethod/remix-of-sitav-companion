// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Search & Index Engine
// Cross-device metadata/content search, E2EE-aware boundaries
// ═══════════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────

export type IndexScope = "metadata" | "content" | "settings" | "app-state" | "activity";

export interface SearchableEntry {
  objectId: string;
  namespace: string;
  title: string;
  content?: string;
  tags: string[];
  mimeType?: string;
  deviceId: string;
  updatedAt: string;
  sizeBytes: number;
  encryptionClass: string;
  scope: IndexScope;
  boost: number; // relevance multiplier
}

export interface SearchResult {
  entry: SearchableEntry;
  score: number;
  highlights: Array<{ field: string; snippet: string }>;
  matchedTerms: string[];
}

export interface SearchQuery {
  text: string;
  scopes?: IndexScope[];
  namespaces?: string[];
  mimeTypes?: string[];
  deviceId?: string;
  encryptedSearchable?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "relevance" | "date" | "size";
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchIndexStats {
  totalEntries: number;
  byScope: Record<IndexScope, number>;
  byNamespace: Record<string, number>;
  lastIndexedAt: string | null;
  indexSizeEstimate: number;
  encryptedEntries: number;
  searchableEntries: number;
}

export interface RecentActivity {
  objectId: string;
  title: string;
  namespace: string;
  deviceId: string;
  deviceName?: string;
  action: string;
  timestamp: string;
}

// ─── Sync Search Engine ───────────────────────────────────────

class SyncSearchEngine {
  private index = new Map<string, SearchableEntry>(); // objectId -> entry
  private recentActivities: RecentActivity[] = [];
  private lastIndexedAt: string | null = null;

  // ─── Indexing ───────────────────────────────────────

  indexObject(entry: SearchableEntry): void {
    // Don't index non-syncable or device-bound encrypted content
    if (entry.encryptionClass === "non-syncable") return;
    // E2EE objects: index metadata only, not content
    if (entry.encryptionClass === "e2ee") {
      entry.content = undefined;
    }
    this.index.set(entry.objectId, entry);
    this.lastIndexedAt = new Date().toISOString();
  }

  removeFromIndex(objectId: string): void {
    this.index.delete(objectId);
  }

  reindexAll(entries: SearchableEntry[]): void {
    this.index.clear();
    for (const e of entries) this.indexObject(e);
  }

  // ─── Search ─────────────────────────────────────────

  search(query: SearchQuery): SearchResult[] {
    const terms = query.text.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];

    let candidates = Array.from(this.index.values());

    // Filter by scope
    if (query.scopes?.length) {
      candidates = candidates.filter(e => query.scopes!.includes(e.scope));
    }
    // Filter by namespace
    if (query.namespaces?.length) {
      candidates = candidates.filter(e => query.namespaces!.some(ns => e.namespace.startsWith(ns)));
    }
    // Filter by MIME
    if (query.mimeTypes?.length) {
      candidates = candidates.filter(e => e.mimeType && query.mimeTypes!.includes(e.mimeType));
    }
    // Filter by device
    if (query.deviceId) {
      candidates = candidates.filter(e => e.deviceId === query.deviceId);
    }
    // Filter E2EE content from full-text search unless explicitly allowed
    if (!query.encryptedSearchable) {
      candidates = candidates.filter(e => e.encryptionClass !== "e2ee" || !e.content);
    }
    // Date range
    if (query.dateFrom) candidates = candidates.filter(e => e.updatedAt >= query.dateFrom!);
    if (query.dateTo) candidates = candidates.filter(e => e.updatedAt <= query.dateTo!);

    // Score and rank
    const results: SearchResult[] = [];
    for (const entry of candidates) {
      const { score, highlights, matchedTerms } = this.scoreEntry(entry, terms);
      if (score > 0) {
        results.push({ entry, score: score * entry.boost, highlights, matchedTerms });
      }
    }

    // Sort
    if (query.sortBy === "date") {
      results.sort((a, b) => b.entry.updatedAt.localeCompare(a.entry.updatedAt));
    } else if (query.sortBy === "size") {
      results.sort((a, b) => b.entry.sizeBytes - a.entry.sizeBytes);
    } else {
      results.sort((a, b) => b.score - a.score);
    }

    const offset = query.offset ?? 0;
    return results.slice(offset, offset + (query.limit ?? 20));
  }

  // ─── Quick Search ──────────────────────────────────

  quickSearch(text: string, limit = 10): SearchResult[] {
    return this.search({ text, limit, sortBy: "relevance" });
  }

  searchSettings(text: string): SearchResult[] {
    return this.search({ text, scopes: ["settings", "app-state"], limit: 20 });
  }

  // ─── Recent Activity ──────────────────────────────

  recordActivity(activity: RecentActivity): void {
    this.recentActivities.push(activity);
    if (this.recentActivities.length > 500) {
      this.recentActivities = this.recentActivities.slice(-400);
    }
  }

  getRecentActivity(deviceId?: string, limit = 20): RecentActivity[] {
    let results = [...this.recentActivities];
    if (deviceId) results = results.filter(a => a.deviceId === deviceId);
    return results.slice(-limit).reverse();
  }

  getCrossDeviceActivity(limit = 30): RecentActivity[] {
    return this.recentActivities.slice(-limit).reverse();
  }

  // ─── Stats ──────────────────────────────────────────

  getStats(): SearchIndexStats {
    const byScope: Record<IndexScope, number> = { metadata: 0, content: 0, settings: 0, "app-state": 0, activity: 0 };
    const byNamespace: Record<string, number> = {};
    let encryptedEntries = 0;
    let searchableEntries = 0;

    for (const entry of this.index.values()) {
      byScope[entry.scope]++;
      const ns = entry.namespace.split(".").slice(0, 2).join(".");
      byNamespace[ns] = (byNamespace[ns] ?? 0) + 1;
      if (entry.encryptionClass === "e2ee" || entry.encryptionClass === "device-bound") encryptedEntries++;
      if (entry.content) searchableEntries++;
    }

    return {
      totalEntries: this.index.size,
      byScope,
      byNamespace,
      lastIndexedAt: this.lastIndexedAt,
      indexSizeEstimate: this.index.size * 512, // rough estimate
      encryptedEntries,
      searchableEntries,
    };
  }

  // ─── Internal ──────────────────────────────────────

  private scoreEntry(entry: SearchableEntry, terms: string[]): { score: number; highlights: Array<{ field: string; snippet: string }>; matchedTerms: string[] } {
    let score = 0;
    const highlights: Array<{ field: string; snippet: string }> = [];
    const matchedTerms: string[] = [];

    for (const term of terms) {
      // Title match (highest weight)
      if (entry.title.toLowerCase().includes(term)) {
        score += 10;
        highlights.push({ field: "title", snippet: this.highlightTerm(entry.title, term) });
        matchedTerms.push(term);
      }
      // Tag match
      if (entry.tags.some(t => t.toLowerCase().includes(term))) {
        score += 5;
        matchedTerms.push(term);
      }
      // Content match
      if (entry.content?.toLowerCase().includes(term)) {
        score += 3;
        const idx = entry.content.toLowerCase().indexOf(term);
        const start = Math.max(0, idx - 30);
        const end = Math.min(entry.content.length, idx + term.length + 30);
        highlights.push({ field: "content", snippet: `...${entry.content.slice(start, end)}...` });
        matchedTerms.push(term);
      }
      // Namespace match
      if (entry.namespace.toLowerCase().includes(term)) {
        score += 2;
        matchedTerms.push(term);
      }
    }

    return { score, highlights, matchedTerms: [...new Set(matchedTerms)] };
  }

  private highlightTerm(text: string, term: string): string {
    const idx = text.toLowerCase().indexOf(term);
    if (idx === -1) return text;
    return `${text.slice(0, idx)}**${text.slice(idx, idx + term.length)}**${text.slice(idx + term.length)}`;
  }
}

export const syncSearch = new SyncSearchEngine();
