// ═══════════════════════════════════════════════════════════════
// SITA OS — Relationship Intelligence
// Network-as-wealth with reciprocity accounting
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
export interface RelationshipNode {
  id: string;
  name: string;
  type: 'personal' | 'professional' | 'family' | 'community';
  trustScore: number; // 0-100
  expertiseTags: string[];
  reciprocityBalance: number; // positive = they owe you, negative = you owe them
  lastInteraction: string;
  interactionFrequency: number; // per month
  strategicValue: number; // 0-100
  decayRate: number; // score lost per month of no contact
}

export interface IntroductionSuggestion {
  personA: string;
  personB: string;
  reason: string;
  connectorScore: number; // 0-1: how valuable this introduction is
}

export interface ReciprocityEntry {
  contactId: string;
  contactName: string;
  balance: number;
  suggestedGesture: string;
}

export class RelationshipGraph {
  private nodes: Map<string, RelationshipNode> = new Map();

  addRelationship(node: RelationshipNode): void {
    this.nodes.set(node.id, node);
  }

  removeRelationship(id: string): void {
    this.nodes.delete(id);
  }

  findWhoCanHelp(need: string): RelationshipNode[] {
    const keywords = need.toLowerCase().split(/\s+/);
    return [...this.nodes.values()]
      .filter(n => n.expertiseTags.some(tag => keywords.some(k => tag.toLowerCase().includes(k))))
      .sort((a, b) => (b.trustScore * b.strategicValue) - (a.trustScore * a.strategicValue));
  }

  detectNeglectedRelationships(thresholdDays = 60): RelationshipNode[] {
    const now = Date.now();
    return [...this.nodes.values()]
      .filter(n => {
        const daysSince = (now - new Date(n.lastInteraction).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > thresholdDays;
      })
      .sort((a, b) => b.strategicValue - a.strategicValue);
  }

  calculateNetworkWealth(): { totalWealth: number; breakdown: { type: string; value: number }[] } {
    const byType: Record<string, number> = {};
    let total = 0;
    for (const node of this.nodes.values()) {
      const value = (node.trustScore / 100) * node.strategicValue;
      total += value;
      byType[node.type] = (byType[node.type] || 0) + value;
    }
    return {
      totalWealth: Math.round(total),
      breakdown: Object.entries(byType).map(([type, value]) => ({ type, value: Math.round(value) })),
    };
  }

  suggestIntroductions(): IntroductionSuggestion[] {
    const nodes = [...this.nodes.values()];
    const suggestions: IntroductionSuggestion[] = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        // Find complementary expertise
        const overlap = a.expertiseTags.filter(t => b.expertiseTags.includes(t));
        if (overlap.length === 0) {
          // Different expertise = potential synergy
          const connectorScore = ((a.trustScore + b.trustScore) / 200) * ((a.strategicValue + b.strategicValue) / 200);
          if (connectorScore > 0.3) {
            suggestions.push({
              personA: a.name,
              personB: b.name,
              reason: `${a.name} (${a.expertiseTags[0] || 'generalist'}) ↔ ${b.name} (${b.expertiseTags[0] || 'generalist'})`,
              connectorScore: Math.round(connectorScore * 100) / 100,
            });
          }
        }
      }
    }
    return suggestions.sort((a, b) => b.connectorScore - a.connectorScore).slice(0, 10);
  }

  reciprocityLedger(): ReciprocityEntry[] {
    return [...this.nodes.values()]
      .filter(n => Math.abs(n.reciprocityBalance) > 0)
      .map(n => ({
        contactId: n.id,
        contactName: n.name,
        balance: n.reciprocityBalance,
        suggestedGesture: n.reciprocityBalance < -2
          ? 'Send a thank-you note or small gift'
          : n.reciprocityBalance < 0
          ? 'Offer help on their current project'
          : n.reciprocityBalance > 2
          ? 'Ask for the favor you need — they\'re glad to help'
          : 'Maintain regular check-ins',
      }))
      .sort((a, b) => a.balance - b.balance);
  }

  applyDecay(): void {
    const now = new Date();
    for (const node of this.nodes.values()) {
      const monthsSince = (now.getTime() - new Date(node.lastInteraction).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsSince > 1) {
        node.trustScore = Math.max(0, node.trustScore - node.decayRate * Math.floor(monthsSince));
      }
    }
  }

  getNode(id: string): RelationshipNode | undefined { return this.nodes.get(id); }
  listAll(): RelationshipNode[] { return [...this.nodes.values()]; }
  getSize(): number { return this.nodes.size; }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("relationship-intelligence", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      nodes: Array.from(this.nodes.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.nodes) this.nodes = new Map(state.nodes as any);
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("relationship-intelligence");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

export const createRelationshipGraph = () => new RelationshipGraph();
