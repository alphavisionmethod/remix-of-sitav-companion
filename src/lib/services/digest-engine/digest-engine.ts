// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Digest / Summary Engine
// Canonical summary producer: daily pulse, weekly boardroom, briefs
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import type { DomainId } from "@/packages/contracts/_contract-scaffold";

// ── Types ────────────────────────────────────────────────────────

export type DigestType = "daily_pulse" | "weekly_boardroom" | "travel_brief" | "risk_digest" | "opportunity_digest" | "readiness_digest" | "assistant_catchup" | "custom";

export type DigestSectionType =
  | "priority_stack" | "financial_summary" | "business_metrics"
  | "relationship_updates" | "health_readiness" | "schedule_overview"
  | "pending_approvals" | "opportunities" | "risks" | "celebrations"
  | "commitments" | "follow_ups" | "mode_context" | "custom";

export interface DigestSection {
  type: DigestSectionType;
  title: string;
  priority: number;
  domain: DomainId | "cross-domain";
  items: DigestItem[];
  summary: string;
  metrics?: { label: string; value: string; trend: "up" | "down" | "stable" }[];
}

export interface DigestItem {
  id: string;
  title: string;
  description: string;
  urgency: number;          // 0–10
  actionable: boolean;
  action?: string;
  domain: DomainId;
  metadata: Record<string, unknown>;
}

export interface Digest {
  id: string;
  type: DigestType;
  userId: string;
  title: string;
  greeting: string;
  sections: DigestSection[];
  lifeScore?: number;
  generatedAt: string;
  validUntil: string;
  readAt?: string;
  metadata: Record<string, unknown>;
}

export interface DigestTemplate {
  type: DigestType;
  title: string;
  sectionOrder: DigestSectionType[];
  maxSections: number;
  maxItemsPerSection: number;
  greeting: (name: string) => string;
  validityHours: number;
}

// ── Templates ────────────────────────────────────────────────────

const DIGEST_TEMPLATES: DigestTemplate[] = [
  {
    type: "daily_pulse", title: "Daily Pulse",
    sectionOrder: ["priority_stack", "schedule_overview", "financial_summary", "pending_approvals", "follow_ups", "opportunities", "health_readiness"],
    maxSections: 7, maxItemsPerSection: 5, validityHours: 18,
    greeting: (name) => `Good morning, ${name}. Here's what matters today.`,
  },
  {
    type: "weekly_boardroom", title: "Weekly Boardroom",
    sectionOrder: ["business_metrics", "financial_summary", "risks", "opportunities", "relationship_updates", "commitments", "celebrations"],
    maxSections: 7, maxItemsPerSection: 8, validityHours: 168,
    greeting: (name) => `${name}, your weekly strategic review is ready.`,
  },
  {
    type: "travel_brief", title: "Travel Brief",
    sectionOrder: ["schedule_overview", "priority_stack", "pending_approvals", "follow_ups", "mode_context"],
    maxSections: 5, maxItemsPerSection: 5, validityHours: 24,
    greeting: (name) => `${name}, here's your travel brief.`,
  },
  {
    type: "risk_digest", title: "Risk Digest",
    sectionOrder: ["risks", "pending_approvals", "financial_summary"],
    maxSections: 3, maxItemsPerSection: 10, validityHours: 12,
    greeting: (name) => `${name}, risk items requiring attention.`,
  },
  {
    type: "opportunity_digest", title: "Opportunities",
    sectionOrder: ["opportunities", "business_metrics", "relationship_updates"],
    maxSections: 3, maxItemsPerSection: 8, validityHours: 48,
    greeting: (name) => `${name}, strategic opportunities detected.`,
  },
  {
    type: "readiness_digest", title: "Personal Readiness",
    sectionOrder: ["health_readiness", "priority_stack", "schedule_overview", "mode_context"],
    maxSections: 4, maxItemsPerSection: 5, validityHours: 12,
    greeting: (name) => `${name}, your readiness status.`,
  },
  {
    type: "assistant_catchup", title: "Catch-up Summary",
    sectionOrder: ["priority_stack", "pending_approvals", "follow_ups", "celebrations"],
    maxSections: 4, maxItemsPerSection: 10, validityHours: 6,
    greeting: (name) => `Welcome back, ${name}. Here's what you missed.`,
  },
];

// ── Data Providers ───────────────────────────────────────────────

export type DigestDataProvider = (userId: string) => Promise<DigestSection | null>;

// ── Service ──────────────────────────────────────────────────────

export class DigestEngineService {
  private history: Digest[] = [];
  private counter = 0;
  private providers: Map<DigestSectionType, DigestDataProvider> = new Map();

  // ── Provider Registration ──────────────────────────────────

  registerProvider(sectionType: DigestSectionType, provider: DigestDataProvider): void {
    this.providers.set(sectionType, provider);
  }

  // ── Digest Generation ─────────────────────────────────────

  async generateDigest(type: DigestType, userId: string, userName = "User", overrides: Partial<DigestTemplate> = {}): Promise<Digest> {
    const template = DIGEST_TEMPLATES.find(t => t.type === type) ?? DIGEST_TEMPLATES[0];
    const merged = { ...template, ...overrides };

    const sections: DigestSection[] = [];
    for (const sectionType of merged.sectionOrder.slice(0, merged.maxSections)) {
      const provider = this.providers.get(sectionType);
      if (provider) {
        const section = await provider(userId);
        if (section) {
          section.items = section.items.slice(0, merged.maxItemsPerSection);
          sections.push(section);
        }
      } else {
        // Generate placeholder section
        sections.push(this.buildPlaceholderSection(sectionType));
      }
    }

    // Sort sections by priority
    sections.sort((a, b) => b.priority - a.priority);

    const digest: Digest = {
      id: `digest-${++this.counter}-${Date.now()}`,
      type, userId,
      title: merged.title,
      greeting: merged.greeting(userName),
      sections,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + merged.validityHours * 3600_000).toISOString(),
      metadata: {},
    };

    this.history.push(digest);
    if (this.history.length > 50) this.history.shift();
    this._persist();
    return digest;
  }

  // ── Quick Digests ──────────────────────────────────────────

  async dailyPulse(userId: string, userName?: string): Promise<Digest> { return this.generateDigest("daily_pulse", userId, userName); }
  async weeklyBoardroom(userId: string, userName?: string): Promise<Digest> { return this.generateDigest("weekly_boardroom", userId, userName); }
  async travelBrief(userId: string, userName?: string): Promise<Digest> { return this.generateDigest("travel_brief", userId, userName); }
  async riskDigest(userId: string, userName?: string): Promise<Digest> { return this.generateDigest("risk_digest", userId, userName); }
  async catchUp(userId: string, userName?: string): Promise<Digest> { return this.generateDigest("assistant_catchup", userId, userName); }

  // ── Queries ────────────────────────────────────────────────

  markRead(digestId: string): void {
    const d = this.history.find(x => x.id === digestId);
    if (d) { d.readAt = new Date().toISOString(); this._persist(); }
  }

  getUnread(userId: string): Digest[] { return this.history.filter(d => d.userId === userId && !d.readAt); }
  getHistory(userId: string, limit = 10): Digest[] { return this.history.filter(d => d.userId === userId).slice(-limit); }
  getLatest(userId: string, type: DigestType): Digest | undefined { return [...this.history].reverse().find(d => d.userId === userId && d.type === type); }

  getStats(): { totalGenerated: number; byType: Record<string, number>; readRate: number } {
    const byType: Record<string, number> = {};
    for (const d of this.history) byType[d.type] = (byType[d.type] ?? 0) + 1;
    const read = this.history.filter(d => d.readAt).length;
    return { totalGenerated: this.history.length, byType, readRate: this.history.length > 0 ? Math.round((read / this.history.length) * 100) : 0 };
  }

  // ── Placeholder Builder ────────────────────────────────────

  private buildPlaceholderSection(type: DigestSectionType): DigestSection {
    const titles: Record<string, string> = {
      priority_stack: "Priorities", financial_summary: "Financial Overview",
      business_metrics: "Business Metrics", relationship_updates: "Relationships",
      health_readiness: "Readiness", schedule_overview: "Schedule",
      pending_approvals: "Pending Approvals", opportunities: "Opportunities",
      risks: "Risks", celebrations: "Wins", commitments: "Commitments",
      follow_ups: "Follow-ups", mode_context: "Current Mode", custom: "Updates",
    };
    return {
      type, title: titles[type] ?? type, priority: 50,
      domain: "cross-domain", items: [], summary: "No data available yet",
    };
  }

  // ── Persistence ────────────────────────────────────────────

  private _persist = () => debouncedSaveServiceState("digest-engine", this.serialize());
  serialize(): Record<string, unknown> { return { history: this.history.slice(-30), counter: this.counter }; }
  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.history) this.history = state.history as Digest[];
    if (state.counter) this.counter = state.counter as number;
  }
  async loadPersistedState(): Promise<void> { const s = await loadServiceState("digest-engine"); if (s) this.hydrate(s as Record<string, unknown>); }
}

export const createDigestEngine = () => new DigestEngineService();
