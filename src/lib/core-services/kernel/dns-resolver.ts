// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: DNS Resolver
// Recursive resolver with caching, DNSSEC, and DoH/DoT support
// ═══════════════════════════════════════════════════════════════

// ── DNS Record Types ───────────────────────────────────────────

export type DNSRecordType = "A" | "AAAA" | "CNAME" | "MX" | "NS" | "PTR" | "SOA" | "SRV" | "TXT" | "CAA" | "DNSKEY" | "DS" | "RRSIG";
export type DNSResponseCode = "NOERROR" | "FORMERR" | "SERVFAIL" | "NXDOMAIN" | "NOTIMP" | "REFUSED";
export type DNSTransport = "udp" | "tcp" | "doh" | "dot" | "doq";

// ── DNS Records ────────────────────────────────────────────────

export interface DNSRecord {
  name: string;
  type: DNSRecordType;
  ttl: number;
  data: string;
  class: "IN" | "CH" | "HS";
  // DNSSEC
  dnssecValidated: boolean;
  rrsig: string | null;
}

export interface DNSQuery {
  id: number;
  name: string;
  type: DNSRecordType;
  transport: DNSTransport;
  server: string;
  startedAt: number;
  resolvedAt: number | null;
  responseCode: DNSResponseCode | null;
  answers: DNSRecord[];
  authoritative: boolean;
  recursionDesired: boolean;
  recursionAvailable: boolean;
  dnssecOk: boolean;
  latencyMs: number | null;
}

// ── Cache Entry ────────────────────────────────────────────────

export interface DNSCacheEntry {
  key: string;                  // name:type
  records: DNSRecord[];
  cachedAt: number;
  expiresAt: number;
  hitCount: number;
  source: string;              // upstream server
  negative: boolean;           // NXDOMAIN cache
}

// ── Upstream Servers ───────────────────────────────────────────

export interface DNSUpstream {
  id: string;
  address: string;
  port: number;
  transport: DNSTransport;
  priority: number;
  weight: number;
  latencyMs: number;           // Running average
  queriesSent: number;
  queriesFailed: number;
  available: boolean;
  tls: {
    enabled: boolean;
    hostname: string | null;   // For certificate validation
    pinnedCert: string | null;
  };
  dnssecEnabled: boolean;
}

// ── Local Override ─────────────────────────────────────────────

export interface DNSOverride {
  id: string;
  name: string;
  type: DNSRecordType;
  data: string;
  comment: string;
  enabled: boolean;
}

// ── Resolver Stats ─────────────────────────────────────────────

export interface DNSResolverStats {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  cacheSize: number;
  cacheMaxSize: number;
  cacheHitRate: number;
  upstreamServers: number;
  availableUpstreams: number;
  averageLatencyMs: number;
  dnssecValidations: number;
  dnssecFailures: number;
  overrideCount: number;
  queriesByType: Record<string, number>;
  queriesByResponseCode: Record<string, number>;
}

// ── DNS Resolver Implementation ────────────────────────────────

export class DNSResolver {
  private cache: Map<string, DNSCacheEntry> = new Map();
  private upstreams: Map<string, DNSUpstream> = new Map();
  private overrides: Map<string, DNSOverride> = new Map();
  private queryLog: DNSQuery[] = [];
  private nextId = 1;
  private cacheMaxSize = 10000;

  // Counters
  private totalQueries = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private dnssecValidations = 0;
  private dnssecFailures = 0;
  private queriesByType: Record<string, number> = {};
  private queriesByResponseCode: Record<string, number> = {};

  constructor() {
    this.initDefaults();
  }

  private initDefaults(): void {
    // Cloudflare DNS
    this.addUpstream({
      address: "1.1.1.1", port: 853, transport: "dot", priority: 1, weight: 50,
      tls: { enabled: true, hostname: "cloudflare-dns.com", pinnedCert: null },
      dnssecEnabled: true,
    });
    this.addUpstream({
      address: "1.0.0.1", port: 853, transport: "dot", priority: 2, weight: 50,
      tls: { enabled: true, hostname: "cloudflare-dns.com", pinnedCert: null },
      dnssecEnabled: true,
    });
    // Google DNS (fallback)
    this.addUpstream({
      address: "8.8.8.8", port: 443, transport: "doh", priority: 3, weight: 30,
      tls: { enabled: true, hostname: "dns.google", pinnedCert: null },
      dnssecEnabled: true,
    });
  }

  // ── Upstream Management ──────────────────────────────────

  addUpstream(config: {
    address: string; port: number; transport: DNSTransport; priority: number; weight: number;
    tls: { enabled: boolean; hostname: string | null; pinnedCert: string | null };
    dnssecEnabled: boolean;
  }): DNSUpstream {
    const id = `dns-${this.nextId++}`;
    const upstream: DNSUpstream = {
      id, ...config,
      latencyMs: 0, queriesSent: 0, queriesFailed: 0, available: true,
    };
    this.upstreams.set(id, upstream);
    return upstream;
  }

  removeUpstream(id: string): boolean {
    return this.upstreams.delete(id);
  }

  listUpstreams(): DNSUpstream[] {
    return Array.from(this.upstreams.values()).sort((a, b) => a.priority - b.priority);
  }

  // ── Resolution ───────────────────────────────────────────

  resolve(name: string, type: DNSRecordType = "A"): DNSQuery {
    this.totalQueries++;
    this.queriesByType[type] = (this.queriesByType[type] || 0) + 1;

    const queryId = this.nextId++;
    const startedAt = Date.now();

    // 1. Check overrides
    const overrideKey = `${name}:${type}`;
    for (const override of this.overrides.values()) {
      if (override.enabled && override.name === name && override.type === type) {
        const record: DNSRecord = {
          name, type, ttl: 3600, data: override.data, class: "IN",
          dnssecValidated: false, rrsig: null,
        };
        this.queriesByResponseCode["NOERROR"] = (this.queriesByResponseCode["NOERROR"] || 0) + 1;
        const query: DNSQuery = {
          id: queryId, name, type, transport: "udp", server: "local-override",
          startedAt, resolvedAt: Date.now(), responseCode: "NOERROR",
          answers: [record], authoritative: true,
          recursionDesired: false, recursionAvailable: false,
          dnssecOk: false, latencyMs: 0,
        };
        this.queryLog.push(query);
        return query;
      }
    }

    // 2. Check cache
    const cacheKey = `${name}:${type}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      this.cacheHits++;
      cached.hitCount++;
      this.queriesByResponseCode["NOERROR"] = (this.queriesByResponseCode["NOERROR"] || 0) + 1;
      const query: DNSQuery = {
        id: queryId, name, type, transport: "udp", server: "cache",
        startedAt, resolvedAt: Date.now(), responseCode: cached.negative ? "NXDOMAIN" : "NOERROR",
        answers: cached.records, authoritative: false,
        recursionDesired: true, recursionAvailable: true,
        dnssecOk: cached.records.some(r => r.dnssecValidated),
        latencyMs: 0,
      };
      this.queryLog.push(query);
      return query;
    }
    this.cacheMisses++;

    // 3. Query upstream
    const upstream = this.selectUpstream();
    if (!upstream) {
      this.queriesByResponseCode["SERVFAIL"] = (this.queriesByResponseCode["SERVFAIL"] || 0) + 1;
      const query: DNSQuery = {
        id: queryId, name, type, transport: "udp", server: "none",
        startedAt, resolvedAt: Date.now(), responseCode: "SERVFAIL",
        answers: [], authoritative: false,
        recursionDesired: true, recursionAvailable: false,
        dnssecOk: false, latencyMs: 0,
      };
      this.queryLog.push(query);
      return query;
    }

    upstream.queriesSent++;

    // Simulate resolution
    const simulatedLatency = 5 + Math.random() * 45;
    upstream.latencyMs = upstream.latencyMs * 0.8 + simulatedLatency * 0.2;

    const records = this.simulateResponse(name, type, upstream.dnssecEnabled);
    const responseCode = records.length > 0 ? "NOERROR" : "NXDOMAIN";
    this.queriesByResponseCode[responseCode] = (this.queriesByResponseCode[responseCode] || 0) + 1;

    if (upstream.dnssecEnabled && records.some(r => r.dnssecValidated)) {
      this.dnssecValidations++;
    }

    // Cache result
    if (records.length > 0) {
      const minTTL = Math.min(...records.map(r => r.ttl));
      this.cacheSet(cacheKey, records, minTTL, upstream.address, false);
    } else {
      this.cacheSet(cacheKey, [], 300, upstream.address, true); // Negative cache
    }

    const query: DNSQuery = {
      id: queryId, name, type, transport: upstream.transport,
      server: upstream.address,
      startedAt, resolvedAt: Date.now(), responseCode,
      answers: records, authoritative: false,
      recursionDesired: true, recursionAvailable: true,
      dnssecOk: records.some(r => r.dnssecValidated),
      latencyMs: Math.round(simulatedLatency),
    };
    this.queryLog.push(query);
    if (this.queryLog.length > 1000) this.queryLog = this.queryLog.slice(-500);
    return query;
  }

  private selectUpstream(): DNSUpstream | null {
    const available = Array.from(this.upstreams.values())
      .filter(u => u.available)
      .sort((a, b) => a.priority - b.priority);
    return available[0] ?? null;
  }

  private simulateResponse(name: string, type: DNSRecordType, dnssec: boolean): DNSRecord[] {
    // Generate plausible responses
    const records: DNSRecord[] = [];
    if (type === "A") {
      records.push({
        name, type: "A", ttl: 300, class: "IN",
        data: `${10 + (name.charCodeAt(0) % 240)}.${name.charCodeAt(1) % 256}.${name.charCodeAt(2) % 256}.${(name.length * 7) % 256}`,
        dnssecValidated: dnssec, rrsig: dnssec ? "RRSIG-simulated" : null,
      });
    } else if (type === "AAAA") {
      records.push({
        name, type: "AAAA", ttl: 300, class: "IN",
        data: `2001:db8::${name.length.toString(16)}`,
        dnssecValidated: dnssec, rrsig: dnssec ? "RRSIG-simulated" : null,
      });
    } else if (type === "MX") {
      records.push({
        name, type: "MX", ttl: 3600, class: "IN",
        data: `10 mail.${name}`,
        dnssecValidated: dnssec, rrsig: dnssec ? "RRSIG-simulated" : null,
      });
    } else if (type === "TXT") {
      records.push({
        name, type: "TXT", ttl: 300, class: "IN",
        data: `"v=spf1 include:${name} ~all"`,
        dnssecValidated: false, rrsig: null,
      });
    }
    return records;
  }

  // ── Cache Management ─────────────────────────────────────

  private cacheSet(key: string, records: DNSRecord[], ttl: number, source: string, negative: boolean): void {
    if (this.cache.size >= this.cacheMaxSize) {
      // Evict LRU
      let oldest: { key: string; hitCount: number } | null = null;
      for (const [k, v] of this.cache) {
        if (!oldest || v.hitCount < oldest.hitCount) oldest = { key: k, hitCount: v.hitCount };
      }
      if (oldest) this.cache.delete(oldest.key);
    }
    this.cache.set(key, {
      key, records, cachedAt: Date.now(), expiresAt: Date.now() + ttl * 1000,
      hitCount: 0, source, negative,
    });
  }

  flushCache(): void {
    this.cache.clear();
  }

  getCacheEntries(): DNSCacheEntry[] {
    return Array.from(this.cache.values());
  }

  // ── Overrides ────────────────────────────────────────────

  addOverride(name: string, type: DNSRecordType, data: string, comment: string = ""): DNSOverride {
    const id = `override-${this.nextId++}`;
    const override: DNSOverride = { id, name, type, data, comment, enabled: true };
    this.overrides.set(id, override);
    return override;
  }

  removeOverride(id: string): boolean {
    return this.overrides.delete(id);
  }

  listOverrides(): DNSOverride[] {
    return Array.from(this.overrides.values());
  }

  // ── Query Log ────────────────────────────────────────────

  getQueryLog(limit: number = 50): DNSQuery[] {
    return this.queryLog.slice(-limit);
  }

  // ── Stats ────────────────────────────────────────────────

  getStats(): DNSResolverStats {
    const upstreams = Array.from(this.upstreams.values());
    const avgLatency = upstreams.length > 0
      ? upstreams.reduce((s, u) => s + u.latencyMs, 0) / upstreams.length
      : 0;
    return {
      totalQueries: this.totalQueries,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      cacheSize: this.cache.size,
      cacheMaxSize: this.cacheMaxSize,
      cacheHitRate: this.totalQueries > 0 ? this.cacheHits / this.totalQueries : 0,
      upstreamServers: this.upstreams.size,
      availableUpstreams: upstreams.filter(u => u.available).length,
      averageLatencyMs: Math.round(avgLatency),
      dnssecValidations: this.dnssecValidations,
      dnssecFailures: this.dnssecFailures,
      overrideCount: this.overrides.size,
      queriesByType: { ...this.queriesByType },
      queriesByResponseCode: { ...this.queriesByResponseCode },
    };
  }
}
