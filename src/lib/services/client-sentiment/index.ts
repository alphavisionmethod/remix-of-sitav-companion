// ═══════════════════════════════════════════════════════════════
// SITA OS — Client Sentiment Radar
// Analyzes communication tone trends per client over time
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';


const db = supabase as any;
export type SentimentLevel = 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
export type SentimentTrend = 'improving' | 'stable' | 'declining' | 'volatile';

export interface SentimentDataPoint {
  date: Date;
  score: number; // -1 to 1
  level: SentimentLevel;
  source: string;
  snippet: string;
}

export interface ClientSentiment {
  clientId: string;
  clientName: string;
  currentScore: number;
  currentLevel: SentimentLevel;
  trend: SentimentTrend;
  trendDelta: number;
  history: SentimentDataPoint[];
  riskFlag: boolean;
  lastInteraction: Date | null;
  keyPhrases: { phrase: string; sentiment: number; count: number }[];
}

// Simple lexicon-based sentiment analysis (no external dependencies)
const POSITIVE_WORDS = new Set([
  'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect',
  'thank', 'thanks', 'appreciate', 'happy', 'pleased', 'delighted', 'awesome',
  'brilliant', 'outstanding', 'superb', 'impressed', 'satisfied', 'yes', 'agree',
  'beautiful', 'incredible', 'excited', 'glad', 'enjoy', 'valuable', 'helpful',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'terrible', 'awful', 'horrible', 'hate', 'disappointed', 'frustrated',
  'angry', 'upset', 'unhappy', 'poor', 'worst', 'fail', 'broken', 'issue',
  'problem', 'complaint', 'concern', 'delay', 'wrong', 'error', 'mistake',
  'unacceptable', 'ridiculous', 'annoyed', 'confused', 'worried', 'difficult',
]);

const INTENSIFIERS = new Set(['very', 'extremely', 'incredibly', 'absolutely', 'totally', 'really', 'so']);
const NEGATORS = new Set(['not', "don't", "doesn't", "didn't", "won't", "can't", 'never', 'no']);

class ClientSentimentService {
  analyzeSentiment(text: string): { score: number; level: SentimentLevel } {
    const words = text.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/);
    let score = 0;
    let wordCount = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const prevWord = i > 0 ? words[i - 1] : '';
      const isNegated = NEGATORS.has(prevWord);
      const isIntensified = INTENSIFIERS.has(prevWord);
      const multiplier = isIntensified ? 1.5 : 1;

      if (POSITIVE_WORDS.has(word)) {
        score += (isNegated ? -1 : 1) * multiplier;
        wordCount++;
      } else if (NEGATIVE_WORDS.has(word)) {
        score += (isNegated ? 1 : -1) * multiplier;
        wordCount++;
      }
    }

    const normalized = wordCount > 0 ? Math.max(-1, Math.min(1, score / Math.sqrt(wordCount))) : 0;
    return { score: normalized, level: this.scoreToLevel(normalized) };
  }

  async analyzeClient(userId: string, clientId: string): Promise<ClientSentiment> {
    const { data: customer } = await db
      .from('customers')
      .select('name')
      .eq('id', clientId)
      .eq('user_id', userId)
      .single();

    const { data: comms } = await db
      .from('communications')
      .select('body, subject, created_at, type')
      .eq('user_id', userId)
      .eq('customer_id', clientId)
      .order('created_at', { ascending: false })
      .limit(100);

    const history: SentimentDataPoint[] = (comms || [])
      .filter((c) => c.body || c.subject)
      .map((c) => {
        const text = `${c.subject || ''} ${c.body || ''}`;
        const { score, level } = this.analyzeSentiment(text);
        return {
          date: new Date(c.created_at),
          score,
          level,
          source: c.type,
          snippet: text.substring(0, 100),
        };
      });

    const currentScore = history.length > 0
      ? history.slice(0, 5).reduce((s, h) => s + h.score, 0) / Math.min(5, history.length)
      : 0;

    const olderScore = history.length > 5
      ? history.slice(5, 15).reduce((s, h) => s + h.score, 0) / Math.min(10, history.length - 5)
      : currentScore;

    const trendDelta = currentScore - olderScore;
    const trend: SentimentTrend = Math.abs(trendDelta) < 0.1 ? 'stable'
      : trendDelta > 0 ? 'improving' : 'declining';

    // Extract key phrases
    const phraseMap = new Map<string, { sentiment: number; count: number }>();
    (comms || []).forEach((c) => {
      const words = `${c.subject || ''} ${c.body || ''}`.toLowerCase().split(/\s+/);
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = `${words[i]} ${words[i + 1]}`.replace(/[^\w\s]/g, '');
        if (bigram.length > 5) {
          const existing = phraseMap.get(bigram) || { sentiment: 0, count: 0 };
          const { score } = this.analyzeSentiment(bigram);
          existing.sentiment += score;
          existing.count++;
          phraseMap.set(bigram, existing);
        }
      }
    });

    const keyPhrases = Array.from(phraseMap.entries())
      .filter(([, v]) => v.count >= 2)
      .map(([phrase, v]) => ({ phrase, sentiment: v.sentiment / v.count, count: v.count }))
      .sort((a, b) => Math.abs(b.sentiment) - Math.abs(a.sentiment))
      .slice(0, 10);

    return {
      clientId,
      clientName: customer?.name || 'Unknown',
      currentScore,
      currentLevel: this.scoreToLevel(currentScore),
      trend,
      trendDelta,
      history,
      riskFlag: currentScore < -0.3 || trend === 'declining',
      lastInteraction: history.length > 0 ? history[0].date : null,
      keyPhrases,
    };
  }

  async analyzeAllClients(userId: string): Promise<ClientSentiment[]> {
    const { data: customers } = await db
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active');

    const results = await Promise.all(
      (customers || []).map((c) => this.analyzeClient(userId, c.id))
    );

    return results.sort((a, b) => a.currentScore - b.currentScore);
  }

  private scoreToLevel(score: number): SentimentLevel {
    if (score > 0.5) return 'very_positive';
    if (score > 0.15) return 'positive';
    if (score > -0.15) return 'neutral';
    if (score > -0.5) return 'negative';
    return 'very_negative';
  }
}

export const clientSentimentService = new ClientSentimentService();

