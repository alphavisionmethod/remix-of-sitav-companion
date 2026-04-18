// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: Stateful Packet Firewall
// netfilter-style chains with connection tracking
// ═══════════════════════════════════════════════════════════════

// ── Rule Definitions ───────────────────────────────────────────

export type FirewallChain = "INPUT" | "OUTPUT" | "FORWARD" | "PREROUTING" | "POSTROUTING";
export type FirewallAction = "ACCEPT" | "DROP" | "REJECT" | "LOG" | "MARK" | "REDIRECT" | "MASQUERADE";
export type FirewallProtocol = "tcp" | "udp" | "icmp" | "any";
export type FirewallDirection = "inbound" | "outbound" | "forward";

export interface PortRange {
  start: number;
  end: number;
}

export interface FirewallRule {
  id: string;
  chain: FirewallChain;
  priority: number;
  action: FirewallAction;
  protocol: FirewallProtocol;
  sourceAddress: string | null;       // CIDR or null = any
  destinationAddress: string | null;
  sourcePort: PortRange | null;
  destinationPort: PortRange | null;
  interface: string | null;           // network interface
  state: ("NEW" | "ESTABLISHED" | "RELATED" | "INVALID")[];
  log: boolean;
  comment: string;
  hitCount: number;
  enabled: boolean;
  createdAt: number;
}

// ── Connection Tracking ────────────────────────────────────────

export type ConnTrackState = "NEW" | "ESTABLISHED" | "RELATED" | "INVALID" | "UNTRACKED";

export interface ConnTrackEntry {
  id: string;
  protocol: FirewallProtocol;
  sourceAddress: string;
  sourcePort: number;
  destinationAddress: string;
  destinationPort: number;
  state: ConnTrackState;
  timeout: number;           // seconds remaining
  bytesOriginal: number;
  bytesReply: number;
  packetsOriginal: number;
  packetsReply: number;
  mark: number;
  assured: boolean;
  createdAt: number;
}

// ── Rate Limiting ──────────────────────────────────────────────

export interface RateLimitConfig {
  ruleId: string;
  maxRate: number;           // packets per second
  burstSize: number;
  currentTokens: number;
  lastRefill: number;
}

// ── Firewall Stats ─────────────────────────────────────────────

export interface FirewallStats {
  totalRules: number;
  enabledRules: number;
  connTrackEntries: number;
  connTrackMax: number;
  packetsAccepted: number;
  packetsDropped: number;
  packetsRejected: number;
  packetsLogged: number;
  chainsActive: FirewallChain[];
}

// ── Firewall Implementation ────────────────────────────────────

export class Firewall {
  private rules: Map<string, FirewallRule> = new Map();
  private connTrack: Map<string, ConnTrackEntry> = new Map();
  private rateLimits: Map<string, RateLimitConfig> = new Map();
  private nextRuleId = 1;
  private nextConnId = 1;
  private connTrackMax = 65536;

  // Counters
  private accepted = 0;
  private dropped = 0;
  private rejected = 0;
  private logged = 0;

  // Default policies
  private defaultPolicies: Record<FirewallChain, FirewallAction> = {
    INPUT: "DROP",
    OUTPUT: "ACCEPT",
    FORWARD: "DROP",
    PREROUTING: "ACCEPT",
    POSTROUTING: "ACCEPT",
  };

  constructor() {
    this.initDefaultRules();
  }

  private initDefaultRules(): void {
    // Allow loopback
    this.addRule({
      chain: "INPUT", priority: 0, action: "ACCEPT", protocol: "any",
      sourceAddress: "127.0.0.0/8", destinationAddress: "127.0.0.0/8",
      sourcePort: null, destinationPort: null, interface: "lo",
      state: [], log: false, comment: "Allow loopback", enabled: true,
    });
    // Allow established connections
    this.addRule({
      chain: "INPUT", priority: 1, action: "ACCEPT", protocol: "any",
      sourceAddress: null, destinationAddress: null,
      sourcePort: null, destinationPort: null, interface: null,
      state: ["ESTABLISHED", "RELATED"], log: false, comment: "Allow established", enabled: true,
    });
    // Allow ICMP
    this.addRule({
      chain: "INPUT", priority: 5, action: "ACCEPT", protocol: "icmp",
      sourceAddress: null, destinationAddress: null,
      sourcePort: null, destinationPort: null, interface: null,
      state: [], log: false, comment: "Allow ICMP", enabled: true,
    });
  }

  // ── Rule Management ──────────────────────────────────────

  addRule(rule: Omit<FirewallRule, "id" | "hitCount" | "createdAt">): FirewallRule {
    const id = `fw-rule-${this.nextRuleId++}`;
    const fullRule: FirewallRule = { ...rule, id, hitCount: 0, createdAt: Date.now() };
    this.rules.set(id, fullRule);
    return fullRule;
  }

  removeRule(id: string): boolean {
    return this.rules.delete(id);
  }

  enableRule(id: string, enabled: boolean): void {
    const rule = this.rules.get(id);
    if (rule) rule.enabled = enabled;
  }

  getRules(chain?: FirewallChain): FirewallRule[] {
    const all = Array.from(this.rules.values());
    const filtered = chain ? all.filter(r => r.chain === chain) : all;
    return filtered.sort((a, b) => a.priority - b.priority);
  }

  setDefaultPolicy(chain: FirewallChain, action: FirewallAction): void {
    this.defaultPolicies[chain] = action;
  }

  getDefaultPolicy(chain: FirewallChain): FirewallAction {
    return this.defaultPolicies[chain];
  }

  // ── Packet Evaluation ────────────────────────────────────

  evaluate(packet: {
    chain: FirewallChain;
    protocol: FirewallProtocol;
    sourceAddress: string;
    sourcePort: number;
    destinationAddress: string;
    destinationPort: number;
    interface: string;
    connState: ConnTrackState;
  }): { action: FirewallAction; ruleId: string | null; logged: boolean } {
    const chainRules = this.getRules(packet.chain).filter(r => r.enabled);

    for (const rule of chainRules) {
      if (this.matchesRule(rule, packet)) {
        rule.hitCount++;
        if (rule.log) this.logged++;

        if (rule.action === "ACCEPT") this.accepted++;
        else if (rule.action === "DROP") this.dropped++;
        else if (rule.action === "REJECT") this.rejected++;

        return { action: rule.action, ruleId: rule.id, logged: rule.log };
      }
    }

    // Default policy
    const defaultAction = this.defaultPolicies[packet.chain];
    if (defaultAction === "ACCEPT") this.accepted++;
    else this.dropped++;
    return { action: defaultAction, ruleId: null, logged: false };
  }

  private matchesRule(rule: FirewallRule, packet: {
    protocol: FirewallProtocol;
    sourceAddress: string;
    destinationAddress: string;
    sourcePort: number;
    destinationPort: number;
    interface: string;
    connState: ConnTrackState;
  }): boolean {
    if (rule.protocol !== "any" && rule.protocol !== packet.protocol) return false;
    if (rule.interface && rule.interface !== packet.interface) return false;
    if (rule.sourceAddress && !this.matchesCIDR(packet.sourceAddress, rule.sourceAddress)) return false;
    if (rule.destinationAddress && !this.matchesCIDR(packet.destinationAddress, rule.destinationAddress)) return false;
    if (rule.sourcePort && (packet.sourcePort < rule.sourcePort.start || packet.sourcePort > rule.sourcePort.end)) return false;
    if (rule.destinationPort && (packet.destinationPort < rule.destinationPort.start || packet.destinationPort > rule.destinationPort.end)) return false;
    if (rule.state.length > 0 && !rule.state.includes(packet.connState as "NEW" | "ESTABLISHED" | "RELATED" | "INVALID")) return false;
    return true;
  }

  private matchesCIDR(address: string, cidr: string): boolean {
    // Simplified CIDR matching
    const [net, bits] = cidr.split("/");
    if (!bits) return address === net;
    const prefix = net.split(".").slice(0, Math.ceil(parseInt(bits) / 8)).join(".");
    return address.startsWith(prefix);
  }

  // ── Connection Tracking ──────────────────────────────────

  trackConnection(entry: Omit<ConnTrackEntry, "id" | "createdAt">): ConnTrackEntry {
    if (this.connTrack.size >= this.connTrackMax) {
      // Evict oldest
      const oldest = Array.from(this.connTrack.values()).sort((a, b) => a.createdAt - b.createdAt)[0];
      if (oldest) this.connTrack.delete(oldest.id);
    }
    const id = `ct-${this.nextConnId++}`;
    const full: ConnTrackEntry = { ...entry, id, createdAt: Date.now() };
    this.connTrack.set(id, full);
    return full;
  }

  getConnTrackEntries(): ConnTrackEntry[] {
    return Array.from(this.connTrack.values());
  }

  flushConnTrack(): void {
    this.connTrack.clear();
  }

  // ── Rate Limiting ────────────────────────────────────────

  setRateLimit(config: RateLimitConfig): void {
    this.rateLimits.set(config.ruleId, config);
  }

  checkRateLimit(ruleId: string): boolean {
    const limit = this.rateLimits.get(ruleId);
    if (!limit) return true; // no limit = allow
    const now = Date.now();
    const elapsed = (now - limit.lastRefill) / 1000;
    limit.currentTokens = Math.min(limit.burstSize, limit.currentTokens + elapsed * limit.maxRate);
    limit.lastRefill = now;
    if (limit.currentTokens >= 1) {
      limit.currentTokens--;
      return true;
    }
    return false;
  }

  // ── Stats ────────────────────────────────────────────────

  getStats(): FirewallStats {
    const enabledRules = Array.from(this.rules.values()).filter(r => r.enabled);
    const chains = new Set(enabledRules.map(r => r.chain));
    return {
      totalRules: this.rules.size,
      enabledRules: enabledRules.length,
      connTrackEntries: this.connTrack.size,
      connTrackMax: this.connTrackMax,
      packetsAccepted: this.accepted,
      packetsDropped: this.dropped,
      packetsRejected: this.rejected,
      packetsLogged: this.logged,
      chainsActive: Array.from(chains),
    };
  }
}
