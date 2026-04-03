// ═══════════════════════════════════════════════════════════════
// SITA OS — Search Fabric Service
// Cross-domain search with faceting, ranking, and privacy scoping
// ═══════════════════════════════════════════════════════════════

export type SearchDomain = "business" | "finance" | "concierge" | "files" | "workflows" | "memory" | "proof" | "advisors" | "all";
export type SearchResultType = "customer" | "lead" | "invoice" | "bill" | "task" | "file" | "workflow" | "receipt" | "event" | "advisor" | "booking" | "opportunity" | "document" | "thesis";

export interface SearchQuery {
  query: string;
  domains?: SearchDomain[];
  resultTypes?: SearchResultType[];
  dateRange?: { from: number; to: number };
  limit?: number;
  offset?: number;
  sortBy?: "relevance" | "date" | "value";
  includeArchived?: boolean;
  sensitivityFilter?: ("public" | "internal" | "confidential" | "restricted")[];
}

export interface SearchResult {
  id: string;
  type: SearchResultType;
  domain: SearchDomain;
  title: string;
  snippet: string;
  relevanceScore: number;    // 0-1
  timestamp: number;
  metadata: Record<string, unknown>;
  linkedEntities: string[];
  sensitivity: "public" | "internal" | "confidential" | "restricted";
  actionUrl?: string;
}

export interface SearchFacets {
  byDomain: Record<string, number>;
  byType: Record<string, number>;
  bySensitivity: Record<string, number>;
  totalResults: number;
}

export interface SearchResponse {
  results: SearchResult[];
  facets: SearchFacets;
  query: string;
  took: number;              // ms
  hasMore: boolean;
}

// ── Indexable Item ──────────────────────────────────────────────

export interface IndexableItem {
  id: string;
  type: SearchResultType;
  domain: SearchDomain;
  title: string;
  body: string;
  tags: string[];
  timestamp: number;
  metadata: Record<string, unknown>;
  linkedEntities: string[];
  sensitivity: "public" | "internal" | "confidential" | "restricted";
  actionUrl?: string;
}

// ── Search Fabric Service ───────────────────────────────────────

export class SearchFabricService {
  private index: IndexableItem[] = [];

  addToIndex(item: IndexableItem): void {
    const existing = this.index.findIndex(i => i.id === item.id);
    if (existing >= 0) {
      this.index[existing] = item;
    } else {
      this.index.push(item);
    }
  }

  addBatch(items: IndexableItem[]): void {
    items.forEach(item => this.addToIndex(item));
  }

  removeFromIndex(id: string): boolean {
    const idx = this.index.findIndex(i => i.id === id);
    if (idx >= 0) { this.index.splice(idx, 1); return true; }
    return false;
  }

  search(query: SearchQuery): SearchResponse {
    const start = Date.now();
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const terms = query.query.toLowerCase().split(/\s+/).filter(Boolean);

    let candidates = this.index.filter(item => {
      // Domain filter
      if (query.domains?.length && !query.domains.includes("all") && !query.domains.includes(item.domain)) return false;

      // Type filter
      if (query.resultTypes?.length && !query.resultTypes.includes(item.type)) return false;

      // Date range filter
      if (query.dateRange) {
        if (item.timestamp < query.dateRange.from || item.timestamp > query.dateRange.to) return false;
      }

      // Sensitivity filter
      if (query.sensitivityFilter?.length && !query.sensitivityFilter.includes(item.sensitivity)) return false;

      return true;
    });

    // Score & rank
    const scored: (SearchResult & { _score: number })[] = candidates.map(item => {
      let score = 0;
      const searchText = `${item.title} ${item.body} ${item.tags.join(" ")}`.toLowerCase();

      for (const term of terms) {
        if (item.title.toLowerCase().includes(term)) score += 0.4;
        if (item.body.toLowerCase().includes(term)) score += 0.2;
        if (item.tags.some(t => t.toLowerCase().includes(term))) score += 0.3;
      }

      // Recency boost
      const ageHours = (Date.now() - item.timestamp) / 3600000;
      if (ageHours < 24) score += 0.1;
      else if (ageHours < 168) score += 0.05;

      // Build snippet
      const bodyLower = item.body.toLowerCase();
      let snippetStart = 0;
      for (const term of terms) {
        const idx = bodyLower.indexOf(term);
        if (idx >= 0) { snippetStart = Math.max(0, idx - 40); break; }
      }
      const snippet = item.body.slice(snippetStart, snippetStart + 120).trim() + (item.body.length > snippetStart + 120 ? "..." : "");

      return {
        id: item.id,
        type: item.type,
        domain: item.domain,
        title: item.title,
        snippet: snippet || item.body.slice(0, 120),
        relevanceScore: Math.min(1, score),
        timestamp: item.timestamp,
        metadata: item.metadata,
        linkedEntities: item.linkedEntities,
        sensitivity: item.sensitivity,
        actionUrl: item.actionUrl,
        _score: score,
      };
    }).filter(r => r._score > 0);

    // Sort
    if (query.sortBy === "date") {
      scored.sort((a, b) => b.timestamp - a.timestamp);
    } else if (query.sortBy === "value") {
      scored.sort((a, b) => ((b.metadata.value as number) ?? 0) - ((a.metadata.value as number) ?? 0));
    } else {
      scored.sort((a, b) => b._score - a._score);
    }

    const total = scored.length;
    const paged = scored.slice(offset, offset + limit);

    // Build facets
    const facets: SearchFacets = { byDomain: {}, byType: {}, bySensitivity: {}, totalResults: total };
    scored.forEach(r => {
      facets.byDomain[r.domain] = (facets.byDomain[r.domain] ?? 0) + 1;
      facets.byType[r.type] = (facets.byType[r.type] ?? 0) + 1;
      facets.bySensitivity[r.sensitivity] = (facets.bySensitivity[r.sensitivity] ?? 0) + 1;
    });

    return {
      results: paged.map(({ _score, ...r }) => r),
      facets,
      query: query.query,
      took: Date.now() - start,
      hasMore: offset + limit < total,
    };
  }

  getIndexSize(): number {
    return this.index.length;
  }

  reindex(): void {
    // In production, this would rebuild from source systems
    // For now, no-op — index is maintained incrementally
  }
}
