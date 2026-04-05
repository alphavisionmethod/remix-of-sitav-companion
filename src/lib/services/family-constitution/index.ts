// ═══════════════════════════════════════════════════════════════
// SITA OS — Family Constitution Engine
// Codified family values that govern AI decision-making
// ═══════════════════════════════════════════════════════════════

export interface FamilyValue {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1: importance in decisions
  category: 'financial' | 'relationship' | 'growth' | 'health' | 'adventure' | 'service' | 'security';
  examples: string[];
}

export interface ConstitutionArticle {
  id: string;
  section: 'values' | 'principles' | 'decision-rules' | 'boundaries' | 'aspirations';
  title: string;
  content: string;
  values: string[]; // linked value IDs
  ratifiedAt: string;
  ratifiedBy: string[];
}

export interface DecisionAlignment {
  decision: string;
  overallScore: number; // 0-100
  valueScores: { valueId: string; valueName: string; score: number; reason: string }[];
  supporting: string[];
  opposing: string[];
  recommendation: string;
}

export interface Amendment {
  id: string;
  articleId: string;
  proposedBy: string;
  proposedAt: string;
  description: string;
  votes: { memberId: string; vote: 'for' | 'against' | 'abstain' }[];
  status: 'proposed' | 'voting' | 'ratified' | 'rejected';
}

export type ConstitutionTemplate = 'growth' | 'conservation' | 'adventure' | 'service';

const TEMPLATES: Record<ConstitutionTemplate, FamilyValue[]> = {
  growth: [
    { id: 'v-learning', name: 'Continuous Learning', description: 'We invest in education and skill development', weight: 0.9, category: 'growth', examples: ['Education spending prioritized', 'Each member learns one new skill per quarter'] },
    { id: 'v-invest', name: 'Invest Before Spend', description: 'Long-term wealth building over short-term consumption', weight: 0.8, category: 'financial', examples: ['Save 20% before discretionary spending', 'Compound interest over luxury purchases'] },
    { id: 'v-risk', name: 'Calculated Risk-Taking', description: 'We embrace measured risks for growth', weight: 0.7, category: 'growth', examples: ['Side businesses encouraged', 'Investment diversification with growth allocation'] },
  ],
  conservation: [
    { id: 'v-security', name: 'Financial Security First', description: 'Safety nets before growth', weight: 0.9, category: 'security', examples: ['6-month emergency fund minimum', 'Insurance fully covered'] },
    { id: 'v-frugal', name: 'Mindful Spending', description: 'Every dollar has a purpose', weight: 0.85, category: 'financial', examples: ['Budget adherence tracked weekly', 'Major purchases require family discussion'] },
    { id: 'v-stability', name: 'Stability Over Speed', description: 'Steady progress over rapid change', weight: 0.8, category: 'security', examples: ['Job changes require 6-month runway', 'No speculative investments'] },
  ],
  adventure: [
    { id: 'v-experience', name: 'Experiences Over Things', description: 'Travel, culture, and memories over material goods', weight: 0.9, category: 'adventure', examples: ['Travel budget is protected', 'One major family adventure per year'] },
    { id: 'v-flexibility', name: 'Flexibility & Freedom', description: 'Life design that allows spontaneity', weight: 0.8, category: 'adventure', examples: ['Remote work preferred', 'Schedule allows for unplanned opportunities'] },
    { id: 'v-courage', name: 'Courage to Try', description: 'Failure is learning, not losing', weight: 0.75, category: 'growth', examples: ['New activities encouraged monthly', 'No shaming for unsuccessful attempts'] },
  ],
  service: [
    { id: 'v-giving', name: 'Generosity First', description: 'Give before we get', weight: 0.9, category: 'service', examples: ['10% of income to causes', 'Monthly family volunteer activity'] },
    { id: 'v-community', name: 'Community Investment', description: 'Strengthen the communities we belong to', weight: 0.85, category: 'service', examples: ['Support local businesses', 'Mentor younger families'] },
    { id: 'v-legacy', name: 'Legacy Building', description: 'Actions that outlast us', weight: 0.8, category: 'service', examples: ['Education fund for next generation', 'Document family wisdom'] },
  ],
};

export class FamilyConstitutionEngine {
  private values: Map<string, FamilyValue> = new Map();
  private articles: Map<string, ConstitutionArticle> = new Map();
  private amendments: Map<string, Amendment> = new Map();
  private counter = 0;

  loadTemplate(template: ConstitutionTemplate): void {
    for (const v of TEMPLATES[template]) {
      this.values.set(v.id, v);
    }
  }

  addValue(value: FamilyValue): void { this.values.set(value.id, value); }
  removeValue(id: string): void { this.values.delete(id); }

  addArticle(article: Omit<ConstitutionArticle, 'id'>): ConstitutionArticle {
    const id = `art-${++this.counter}`;
    const full = { ...article, id };
    this.articles.set(id, full);
    return full;
  }

  evaluateDecision(decision: string, options: { name: string; impacts: Record<string, number> }[]): DecisionAlignment[] {
    const allValues = [...this.values.values()];

    return options.map(option => {
      const valueScores = allValues.map(v => {
        const impact = option.impacts[v.category] ?? 0;
        const score = Math.round(impact * v.weight * 100);
        return {
          valueId: v.id, valueName: v.name, score,
          reason: score > 50 ? `Strongly supports "${v.name}"` : score > 0 ? `Partially aligns with "${v.name}"` : `May conflict with "${v.name}"`,
        };
      });

      const overallScore = allValues.length > 0
        ? Math.round(valueScores.reduce((s, vs) => s + vs.score, 0) / allValues.length)
        : 50;

      return {
        decision: `${decision}: ${option.name}`,
        overallScore: Math.max(0, Math.min(100, overallScore)),
        valueScores,
        supporting: valueScores.filter(vs => vs.score > 50).map(vs => vs.valueName),
        opposing: valueScores.filter(vs => vs.score < 0).map(vs => vs.valueName),
        recommendation: overallScore > 70 ? 'Strongly aligned with family values'
          : overallScore > 40 ? 'Partially aligned — review trade-offs'
          : 'Conflicts with core family values — reconsider',
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }

  resolveConflict(optionA: string, optionB: string, impactsA: Record<string, number>, impactsB: Record<string, number>): { winner: string; scoreA: number; scoreB: number; reasoning: string } {
    const [resultA, resultB] = this.evaluateDecision('Conflict resolution', [
      { name: optionA, impacts: impactsA },
      { name: optionB, impacts: impactsB },
    ]);
    return {
      winner: resultA.overallScore >= resultB.overallScore ? optionA : optionB,
      scoreA: resultA.overallScore, scoreB: resultB.overallScore,
      reasoning: `"${resultA.overallScore >= resultB.overallScore ? optionA : optionB}" scores ${Math.abs(resultA.overallScore - resultB.overallScore)} points higher on family value alignment.`,
    };
  }

  proposeAmendment(articleId: string, proposedBy: string, description: string): Amendment {
    const id = `amend-${++this.counter}`;
    const amendment: Amendment = { id, articleId, proposedBy, proposedAt: new Date().toISOString(), description, votes: [], status: 'proposed' };
    this.amendments.set(id, amendment);
    return amendment;
  }

  vote(amendmentId: string, memberId: string, vote: 'for' | 'against' | 'abstain'): void {
    const a = this.amendments.get(amendmentId);
    if (!a) return;
    a.votes = a.votes.filter(v => v.memberId !== memberId);
    a.votes.push({ memberId, vote });
    a.status = 'voting';
  }

  ratifyAmendment(amendmentId: string, requiredMajority = 0.5): boolean {
    const a = this.amendments.get(amendmentId);
    if (!a) return false;
    const forVotes = a.votes.filter(v => v.vote === 'for').length;
    const totalVotes = a.votes.filter(v => v.vote !== 'abstain').length;
    if (totalVotes > 0 && forVotes / totalVotes >= requiredMajority) {
      a.status = 'ratified';
      return true;
    }
    a.status = 'rejected';
    return false;
  }

  getValues(): FamilyValue[] { return [...this.values.values()]; }
  getArticles(): ConstitutionArticle[] { return [...this.articles.values()]; }
  getAmendments(): Amendment[] { return [...this.amendments.values()]; }
}

export const createFamilyConstitution = () => new FamilyConstitutionEngine();
