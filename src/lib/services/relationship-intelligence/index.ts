// ═══════════════════════════════════════════════════════════════
// SITA OS — Relationship Intelligence (Elevated)
// Network-as-wealth with conversation/commitment tracking
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter

export interface RelationshipNode {
  id: string;
  name: string;
  type: 'personal' | 'professional' | 'family' | 'community';
  trustScore: number;
  expertiseTags: string[];
  reciprocityBalance: number;
  lastInteraction: string;
  interactionFrequency: number;
  strategicValue: number;
  decayRate: number;
  // ── Elevated: Conversation & Commitment Tracking ──
  conversationHistory: ConversationEntry[];
  commitments: Commitment[];
  keyDates: KeyDate[];
  followUpObligations: FollowUp[];
  emotionalRelevance: number;       // 0–100
  strategicRelevance: number;       // 0–100
  notes: string[];
}

export interface ConversationEntry {
  id: string;
  date: string;
  topics: string[];
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  channel: string;              // email, call, meeting, message
  followUpNeeded: boolean;
}

export interface Commitment {
  id: string;
  description: string;
  madeBy: 'user' | 'contact';
  madeAt: string;
  dueDate?: string;
  status: 'pending' | 'fulfilled' | 'broken' | 'expired';
  importance: number;           // 0–10
}

export interface KeyDate {
  id: string;
  label: string;               // birthday, anniversary, contract renewal
  date: string;                // MM-DD or YYYY-MM-DD
  recurring: boolean;
  reminderDaysBefore: number;
}

export interface FollowUp {
  id: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'done' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface IntroductionSuggestion {
  personA: string;
  personB: string;
  reason: string;
  connectorScore: number;
}

export interface ReciprocityEntry {
  contactId: string;
  contactName: string;
  balance: number;
  suggestedGesture: string;
}

export interface MeetingPrepPacket {
  contact: RelationshipNode;
  recentTopics: string[];
  openCommitments: Commitment[];
  overdueFollowUps: FollowUp[];
  upcomingKeyDates: KeyDate[];
  suggestedTalkingPoints: string[];
  relationshipHealth: number;     // 0–100
}

export class RelationshipGraph {
  private nodes: Map<string, RelationshipNode> = new Map();
  private counter = 0;

  addRelationship(node: RelationshipNode): void { this.nodes.set(node.id, node); this._persist(); }
  removeRelationship(id: string): void { this.nodes.delete(id); this._persist(); }

  // ── Conversation Tracking ──────────────────────────────────

  addConversation(contactId: string, topics: string[], summary: string, sentiment: ConversationEntry['sentiment'], channel: string, followUpNeeded = false): ConversationEntry | null {
    const node = this.nodes.get(contactId);
    if (!node) return null;
    const entry: ConversationEntry = { id: `conv-${++this.counter}`, date: new Date().toISOString(), topics, summary, sentiment, channel, followUpNeeded };
    node.conversationHistory.push(entry);
    if (node.conversationHistory.length > 50) node.conversationHistory.shift();
    node.lastInteraction = entry.date;
    if (followUpNeeded) {
      node.followUpObligations.push({ id: `fu-${++this.counter}`, description: `Follow up on: ${topics[0] ?? summary}`, dueDate: new Date(Date.now() + 7 * 86400_000).toISOString(), status: 'pending', priority: 'medium', createdAt: new Date().toISOString() });
    }
    this._persist();
    return entry;
  }

  // ── Commitment Tracking ────────────────────────────────────

  addCommitment(contactId: string, description: string, madeBy: 'user' | 'contact', importance: number, dueDate?: string): Commitment | null {
    const node = this.nodes.get(contactId);
    if (!node) return null;
    const commitment: Commitment = { id: `commit-${++this.counter}`, description, madeBy, madeAt: new Date().toISOString(), dueDate, status: 'pending', importance };
    node.commitments.push(commitment);
    this._persist();
    return commitment;
  }

  fulfillCommitment(contactId: string, commitmentId: string): boolean {
    const node = this.nodes.get(contactId);
    if (!node) return false;
    const c = node.commitments.find(x => x.id === commitmentId);
    if (!c) return false;
    c.status = 'fulfilled';
    if (c.madeBy === 'contact') node.reciprocityBalance = Math.max(-10, node.reciprocityBalance - 1);
    else node.reciprocityBalance = Math.min(10, node.reciprocityBalance + 1);
    this._persist();
    return true;
  }

  // ── Key Dates ──────────────────────────────────────────────

  addKeyDate(contactId: string, label: string, date: string, recurring = true, reminderDays = 7): KeyDate | null {
    const node = this.nodes.get(contactId);
    if (!node) return null;
    const kd: KeyDate = { id: `kd-${++this.counter}`, label, date, recurring, reminderDaysBefore: reminderDays };
    node.keyDates.push(kd);
    this._persist();
    return kd;
  }

  getUpcomingKeyDates(daysAhead = 30): { contact: RelationshipNode; keyDate: KeyDate; daysUntil: number }[] {
    const results: { contact: RelationshipNode; keyDate: KeyDate; daysUntil: number }[] = [];
    const now = new Date();
    for (const node of this.nodes.values()) {
      for (const kd of node.keyDates) {
        const dateStr = kd.date.length === 5 ? `${now.getFullYear()}-${kd.date}` : kd.date;
        const target = new Date(dateStr);
        const diff = Math.ceil((target.getTime() - now.getTime()) / 86400_000);
        if (diff >= 0 && diff <= daysAhead) results.push({ contact: node, keyDate: kd, daysUntil: diff });
      }
    }
    return results.sort((a, b) => a.daysUntil - b.daysUntil);
  }

  // ── Follow-ups ─────────────────────────────────────────────

  completeFollowUp(contactId: string, followUpId: string): boolean {
    const node = this.nodes.get(contactId);
    if (!node) return false;
    const fu = node.followUpObligations.find(x => x.id === followUpId);
    if (!fu) return false;
    fu.status = 'done';
    this._persist();
    return true;
  }

  getOverdueFollowUps(): { contact: RelationshipNode; followUp: FollowUp }[] {
    const now = new Date().toISOString();
    const results: { contact: RelationshipNode; followUp: FollowUp }[] = [];
    for (const node of this.nodes.values()) {
      for (const fu of node.followUpObligations) {
        if (fu.status === 'pending' && fu.dueDate < now) {
          fu.status = 'overdue';
          results.push({ contact: node, followUp: fu });
        }
      }
    }
    return results;
  }

  // ── Meeting Prep ───────────────────────────────────────────

  getMeetingPrep(contactId: string): MeetingPrepPacket | null {
    const node = this.nodes.get(contactId);
    if (!node) return null;

    const recentConvos = node.conversationHistory.slice(-5);
    const recentTopics = [...new Set(recentConvos.flatMap(c => c.topics))];
    const openCommitments = node.commitments.filter(c => c.status === 'pending');
    const overdueFollowUps = node.followUpObligations.filter(f => f.status === 'overdue' || (f.status === 'pending' && f.dueDate < new Date().toISOString()));
    const upcomingDates = node.keyDates.filter(kd => {
      const now = new Date();
      const dateStr = kd.date.length === 5 ? `${now.getFullYear()}-${kd.date}` : kd.date;
      const diff = (new Date(dateStr).getTime() - now.getTime()) / 86400_000;
      return diff >= 0 && diff <= 30;
    });

    const talkingPoints: string[] = [];
    if (overdueFollowUps.length > 0) talkingPoints.push(`Address ${overdueFollowUps.length} overdue follow-up(s)`);
    if (openCommitments.length > 0) talkingPoints.push(`${openCommitments.length} open commitment(s) to review`);
    if (recentTopics.length > 0) talkingPoints.push(`Continue discussion on: ${recentTopics.slice(0, 3).join(', ')}`);
    if (upcomingDates.length > 0) talkingPoints.push(`Upcoming: ${upcomingDates.map(d => d.label).join(', ')}`);
    if (node.reciprocityBalance < -2) talkingPoints.push('Consider expressing appreciation');

    const health = Math.round((node.trustScore * 0.3 + (100 - Math.abs(node.reciprocityBalance) * 10) * 0.2 + node.emotionalRelevance * 0.2 + Math.min(100, node.interactionFrequency * 10) * 0.3));

    return { contact: node, recentTopics, openCommitments, overdueFollowUps, upcomingKeyDates: upcomingDates, suggestedTalkingPoints: talkingPoints, relationshipHealth: Math.min(100, Math.max(0, health)) };
  }

  // ── Original Methods ───────────────────────────────────────

  findWhoCanHelp(need: string): RelationshipNode[] {
    const keywords = need.toLowerCase().split(/\s+/);
    return [...this.nodes.values()].filter(n => n.expertiseTags.some(tag => keywords.some(k => tag.toLowerCase().includes(k)))).sort((a, b) => (b.trustScore * b.strategicValue) - (a.trustScore * a.strategicValue));
  }

  detectNeglectedRelationships(thresholdDays = 60): RelationshipNode[] {
    const now = Date.now();
    return [...this.nodes.values()].filter(n => (now - new Date(n.lastInteraction).getTime()) / 86400_000 > thresholdDays).sort((a, b) => b.strategicValue - a.strategicValue);
  }

  calculateNetworkWealth(): { totalWealth: number; breakdown: { type: string; value: number }[] } {
    const byType: Record<string, number> = {};
    let total = 0;
    for (const node of this.nodes.values()) { const value = (node.trustScore / 100) * node.strategicValue; total += value; byType[node.type] = (byType[node.type] || 0) + value; }
    return { totalWealth: Math.round(total), breakdown: Object.entries(byType).map(([type, value]) => ({ type, value: Math.round(value) })) };
  }

  suggestIntroductions(): IntroductionSuggestion[] {
    const nodes = [...this.nodes.values()];
    const suggestions: IntroductionSuggestion[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const overlap = a.expertiseTags.filter(t => b.expertiseTags.includes(t));
        if (overlap.length === 0) {
          const connectorScore = ((a.trustScore + b.trustScore) / 200) * ((a.strategicValue + b.strategicValue) / 200);
          if (connectorScore > 0.3) suggestions.push({ personA: a.name, personB: b.name, reason: `${a.name} (${a.expertiseTags[0] || 'generalist'}) ↔ ${b.name} (${b.expertiseTags[0] || 'generalist'})`, connectorScore: Math.round(connectorScore * 100) / 100 });
        }
      }
    }
    return suggestions.sort((a, b) => b.connectorScore - a.connectorScore).slice(0, 10);
  }

  reciprocityLedger(): ReciprocityEntry[] {
    return [...this.nodes.values()].filter(n => Math.abs(n.reciprocityBalance) > 0).map(n => ({ contactId: n.id, contactName: n.name, balance: n.reciprocityBalance, suggestedGesture: n.reciprocityBalance < -2 ? 'Send a thank-you note or small gift' : n.reciprocityBalance < 0 ? 'Offer help on their current project' : n.reciprocityBalance > 2 ? "Ask for the favor you need — they're glad to help" : 'Maintain regular check-ins' })).sort((a, b) => a.balance - b.balance);
  }

  applyDecay(): void {
    const now = new Date();
    for (const node of this.nodes.values()) {
      const monthsSince = (now.getTime() - new Date(node.lastInteraction).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsSince > 1) node.trustScore = Math.max(0, node.trustScore - node.decayRate * Math.floor(monthsSince));
    }
  }

  getNode(id: string): RelationshipNode | undefined { return this.nodes.get(id); }
  listAll(): RelationshipNode[] { return [...this.nodes.values()]; }
  getSize(): number { return this.nodes.size; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("relationship-intelligence", this.serialize());
  serialize(): Record<string, unknown> { return { nodes: Array.from(this.nodes.entries()), counter: this.counter }; }
  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.nodes) this.nodes = new Map(state.nodes as Iterable<[string, RelationshipNode]>);
    if (state.counter) this.counter = state.counter as number;
  }
  async loadPersistedState(): Promise<void> { const state = await loadServiceState("relationship-intelligence"); if (state) this.hydrate(state as Record<string, unknown>); }
}

export const createRelationshipGraph = () => new RelationshipGraph();
