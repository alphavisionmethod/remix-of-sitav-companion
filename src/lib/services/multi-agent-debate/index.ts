import { fromTable } from "@/lib/supabase-helpers";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Multi-Agent Debate Engine
// Lets 2+ advisors argue opposing strategies; user picks winner
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

export type DebateStatus = 'setup' | 'deliberating' | 'voting' | 'concluded' | 'archived';

export interface DebateParticipant {
  advisorId: string;
  advisorName: string;
  domain: string;
  position: 'for' | 'against' | 'neutral';
  arguments: DebateArgument[];
  score: number;
}

export interface DebateArgument {
  id: string;
  content: string;
  evidence: string[];
  confidence: number;
  rebuttalTo?: string;
  timestamp: Date;
  upvotes: number;
}

export interface Debate {
  id: string;
  userId: string;
  question: string;
  domain: string;
  participants: DebateParticipant[];
  status: DebateStatus;
  rounds: number;
  currentRound: number;
  verdict?: string;
  verdictReasoning?: string;
  consensusScore: number;
  createdAt: Date;
  concludedAt?: Date;
}

class MultiAgentDebateEngine {
  async createDebate(
    userId: string,
    question: string,
    domain: string,
    participantConfigs: Array<{ advisorId: string; advisorName: string; position: 'for' | 'against' | 'neutral' }>
  ): Promise<Debate> {
    const debate: Debate = {
      id: crypto.randomUUID(),
      userId,
      question,
      domain,
      participants: participantConfigs.map((p) => ({
        ...p,
        domain,
        arguments: [],
        score: 0,
      })),
      status: 'setup',
      rounds: 3,
      currentRound: 0,
      consensusScore: 0,
      createdAt: new Date(),
    };

    await fromTable('council_decisions').insert({
      user_id: userId,
      question,
      domain,
      participants: participantConfigs as unknown,
      votes: [] as unknown,
      status: 'deliberating',
    });

    return debate;
  }

  async simulateRound(debate: Debate): Promise<Debate> {
    if (debate.currentRound >= debate.rounds) {
      debate.status = 'voting';
      return debate;
    }

    debate.currentRound++;
    debate.status = 'deliberating';

    for (const participant of debate.participants) {
      const argument = this.generateArgument(participant, debate);
      participant.arguments.push(argument);
    }

    // Cross-rebuttals
    for (let i = 0; i < debate.participants.length; i++) {
      const opponent = debate.participants[(i + 1) % debate.participants.length];
      const lastOpponentArg = opponent.arguments[opponent.arguments.length - 1];
      if (lastOpponentArg && debate.currentRound > 1) {
        const rebuttal = this.generateRebuttal(debate.participants[i], lastOpponentArg, debate);
        debate.participants[i].arguments.push(rebuttal);
      }
    }

    debate.consensusScore = this.calculateConsensus(debate);
    return debate;
  }

  async concludeDebate(debate: Debate, winnerAdvisorId: string, reasoning: string): Promise<Debate> {
    const winner = debate.participants.find((p) => p.advisorId === winnerAdvisorId);
    debate.status = 'concluded';
    debate.verdict = winner?.advisorName || 'No winner';
    debate.verdictReasoning = reasoning;
    debate.concludedAt = new Date();

    await supabase
      .from('council_decisions')
      .update({
        status: 'concluded',
        decision: debate.verdict,
        consensus_score: debate.consensusScore,
      })
      .eq('user_id', debate.userId)
      .eq('question', debate.question);

    return debate;
  }

  private generateArgument(participant: DebateParticipant, debate: Debate): DebateArgument {
    const templates: Record<string, string[]> = {
      for: [
        `Based on historical data, ${debate.question} shows strong positive indicators`,
        `Risk analysis supports this approach with a favorable risk-reward ratio`,
        `Market conditions and timing align well with this strategy`,
      ],
      against: [
        `Current market volatility suggests caution regarding ${debate.question}`,
        `Historical precedent shows similar approaches had mixed outcomes`,
        `Resource allocation concerns make this approach suboptimal`,
      ],
      neutral: [
        `Both sides present valid points; recommend phased implementation`,
        `Data suggests conditional approach depending on Q2 performance`,
        `A balanced strategy incorporating elements of both positions is optimal`,
      ],
    };

    const contents = templates[participant.position] || templates.neutral;
    const content = contents[Math.min(debate.currentRound - 1, contents.length - 1)];

    return {
      id: crypto.randomUUID(),
      content,
      evidence: [`Pattern analysis (${participant.domain})`, `Historical benchmark`],
      confidence: 0.6 + Math.random() * 0.35,
      timestamp: new Date(),
      upvotes: 0,
    };
  }

  private generateRebuttal(
    participant: DebateParticipant,
    targetArg: DebateArgument,
    _debate: Debate
  ): DebateArgument {
    return {
      id: crypto.randomUUID(),
      content: `Addressing the previous point: while valid in isolation, it doesn't account for the broader ${participant.domain} context and cross-domain implications.`,
      evidence: ['Cross-domain correlation analysis'],
      confidence: 0.5 + Math.random() * 0.4,
      rebuttalTo: targetArg.id,
      timestamp: new Date(),
      upvotes: 0,
    };
  }

  private calculateConsensus(debate: Debate): number {
    if (debate.participants.length < 2) return 1;
    const scores = debate.participants.map((p) => {
      const avgConfidence = p.arguments.length > 0
        ? p.arguments.reduce((s, a) => s + a.confidence, 0) / p.arguments.length
        : 0;
      return avgConfidence;
    });
    const variance = scores.reduce((s, v) => s + Math.pow(v - scores.reduce((a, b) => a + b, 0) / scores.length, 2), 0) / scores.length;
    return Math.max(0, 1 - variance * 4);
  }
}

export const multiAgentDebateEngine = new MultiAgentDebateEngine();
