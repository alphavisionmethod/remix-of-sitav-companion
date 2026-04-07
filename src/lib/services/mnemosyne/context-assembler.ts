// ═══════════════════════════════════════════════════════════════
// SITA OS — Mnemosyne Context Assembler
// Scoped retrieval and context assembly for AI pipelines
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { getTaskContract } from "@/lib/contracts/global-contracts-registry";

// ── Context Types ──────────────────────────────────────────────

export interface ContextSource {
  type: "file" | "profile" | "conversation" | "evidence" | "memory";
  id: string;
  content: string;
  tokenEstimate: number;
  freshness: string;
  confidence: number;
}

export interface ScopingDecision {
  sourceId: string;
  included: boolean;
  reason: string;
  tokensBefore: number;
  tokensAfter: number;
}

export interface AssembledContext {
  sources: ContextSource[];
  totalTokenEstimate: number;
  scopingDecisions: ScopingDecision[];
  userId: string;
  taskType: string;
  assembledAt: string;
  durationMs: number;
}

// ── Context Assembler ──────────────────────────────────────────

export class ContextAssembler {
  private assemblyLog: Array<{ taskType: string; sourcesUsed: number; tokensUsed: number; timestamp: string }> = [];

  async assembleContext(
    userId: string,
    taskType: string,
    options?: {
      fileIds?: string[];
      conversationHistory?: Array<{ role: string; content: string }>;
      maxTokens?: number;
    }
  ): Promise<AssembledContext> {
    const start = Date.now();
    const contract = getTaskContract(taskType);
    const maxTokens = options?.maxTokens || contract?.inputSchema.maxTokens || 16000;
    const sources: ContextSource[] = [];
    const scopingDecisions: ScopingDecision[] = [];

    // 1. File context
    if (options?.fileIds && options.fileIds.length > 0) {
      const fileContexts = await this.getFileContext(userId, options.fileIds);
      sources.push(...fileContexts);
    }

    // 2. User profile context
    const profileContext = await this.getUserProfile(userId);
    if (profileContext) sources.push(profileContext);

    // 3. Conversation window
    if (options?.conversationHistory) {
      const convContext = this.getConversationWindow(options.conversationHistory, Math.floor(maxTokens * 0.3));
      if (convContext) sources.push(convContext);
    }

    // 4. Evidence context (for evidence-required tasks)
    if (contract?.evidenceRequirements.requiresEvidence) {
      const evidenceContexts = await this.getEvidenceContext(userId, taskType);
      sources.push(...evidenceContexts);
    }

    // 5. Scope to token limit
    const scoped = this.scopeContext(sources, maxTokens, scopingDecisions);

    const result: AssembledContext = {
      sources: scoped,
      totalTokenEstimate: scoped.reduce((sum, s) => sum + s.tokenEstimate, 0),
      scopingDecisions,
      userId,
      taskType,
      assembledAt: new Date().toISOString(),
      durationMs: Date.now() - start,
    };

    this.assemblyLog.push({
      taskType,
      sourcesUsed: scoped.length,
      tokensUsed: result.totalTokenEstimate,
      timestamp: result.assembledAt,
    });
    if (this.assemblyLog.length > 500) this.assemblyLog = this.assemblyLog.slice(-250);

    return result;
  }

  private async getFileContext(userId: string, fileIds: string[]): Promise<ContextSource[]> {
    const sources: ContextSource[] = [];

    try {
      const { data: files } = await supabase
        .from("documents" as any)
        .select("id, title, content, updated_at")
        .in("id", fileIds)
        .eq("user_id", userId);

      if (files && Array.isArray(files)) {
        for (const file of files) {
          const f = file as Record<string, unknown>;
          const content = String(f.content || f.title || "");
          sources.push({
            type: "file",
            id: String(f.id),
            content: content.slice(0, 8000),
            tokenEstimate: Math.ceil(content.length / 4),
            freshness: String(f.updated_at || new Date().toISOString()),
            confidence: 1.0,
          });
        }
      }
    } catch {
      // File retrieval is best-effort
    }

    return sources;
  }

  private async getUserProfile(userId: string): Promise<ContextSource | null> {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, onboarding_completed, preferences")
        .eq("user_id", userId)
        .maybeSingle();

      if (profile) {
        const content = JSON.stringify({
          name: profile.display_name,
          onboarded: profile.onboarding_completed,
          preferences: profile.preferences,
        });

        return {
          type: "profile",
          id: userId,
          content,
          tokenEstimate: Math.ceil(content.length / 4),
          freshness: new Date().toISOString(),
          confidence: 1.0,
        };
      }
    } catch {
      // Profile retrieval is best-effort
    }

    return null;
  }

  private getConversationWindow(
    history: Array<{ role: string; content: string }>,
    maxTokens: number
  ): ContextSource | null {
    if (history.length === 0) return null;

    // Take recent messages that fit within token budget
    const messages: Array<{ role: string; content: string }> = [];
    let tokenCount = 0;

    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      const msgTokens = Math.ceil(msg.content.length / 4);
      if (tokenCount + msgTokens > maxTokens) break;
      messages.unshift(msg);
      tokenCount += msgTokens;
    }

    if (messages.length === 0) return null;

    const content = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

    return {
      type: "conversation",
      id: `conv-${Date.now()}`,
      content,
      tokenEstimate: tokenCount,
      freshness: new Date().toISOString(),
      confidence: 0.9,
    };
  }

  private async getEvidenceContext(userId: string, taskType: string): Promise<ContextSource[]> {
    const sources: ContextSource[] = [];

    try {
      // Pull from advisor knowledge base as evidence
      const { data: knowledge } = await supabase
        .from("advisor_knowledge")
        .select("id, title, content, confidence, updated_at")
        .eq("user_id", userId)
        .eq("status", "verified")
        .order("confidence", { ascending: false })
        .limit(5);

      if (knowledge && Array.isArray(knowledge)) {
        for (const k of knowledge) {
          sources.push({
            type: "evidence",
            id: k.id,
            content: `${k.title}: ${k.content}`.slice(0, 4000),
            tokenEstimate: Math.ceil((`${k.title}: ${k.content}`).length / 4),
            freshness: k.updated_at,
            confidence: k.confidence,
          });
        }
      }
    } catch {
      // Evidence retrieval is best-effort
    }

    return sources;
  }

  private scopeContext(
    sources: ContextSource[],
    maxTokens: number,
    decisions: ScopingDecision[]
  ): ContextSource[] {
    // Sort by confidence desc, then by freshness desc
    const sorted = [...sources].sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return new Date(b.freshness).getTime() - new Date(a.freshness).getTime();
    });

    const included: ContextSource[] = [];
    let tokenBudget = maxTokens;

    for (const source of sorted) {
      if (source.tokenEstimate <= tokenBudget) {
        included.push(source);
        decisions.push({
          sourceId: source.id,
          included: true,
          reason: "Within token budget",
          tokensBefore: tokenBudget,
          tokensAfter: tokenBudget - source.tokenEstimate,
        });
        tokenBudget -= source.tokenEstimate;
      } else if (tokenBudget > 100) {
        // Truncate to fit
        const truncatedTokens = tokenBudget - 50;
        const truncatedChars = truncatedTokens * 4;
        included.push({
          ...source,
          content: source.content.slice(0, truncatedChars) + "\n[...truncated]",
          tokenEstimate: truncatedTokens,
        });
        decisions.push({
          sourceId: source.id,
          included: true,
          reason: `Truncated from ${source.tokenEstimate} to ${truncatedTokens} tokens`,
          tokensBefore: tokenBudget,
          tokensAfter: tokenBudget - truncatedTokens,
        });
        tokenBudget -= truncatedTokens;
      } else {
        decisions.push({
          sourceId: source.id,
          included: false,
          reason: `Excluded: ${source.tokenEstimate} tokens exceeds remaining budget of ${tokenBudget}`,
          tokensBefore: tokenBudget,
          tokensAfter: tokenBudget,
        });
      }
    }

    return included;
  }

  getAssemblyLog(limit?: number): Array<{ taskType: string; sourcesUsed: number; tokensUsed: number; timestamp: string }> {
    const log = [...this.assemblyLog].reverse();
    return limit ? log.slice(0, limit) : log;
  }

  getAssemblyStats(): { totalAssemblies: number; avgSourcesUsed: number; avgTokensUsed: number } {
    const stats = { totalAssemblies: this.assemblyLog.length, avgSourcesUsed: 0, avgTokensUsed: 0 };
    if (stats.totalAssemblies === 0) return stats;
    let sSum = 0;
    let tSum = 0;
    for (const entry of this.assemblyLog) {
      sSum += entry.sourcesUsed;
      tSum += entry.tokensUsed;
    }
    stats.avgSourcesUsed = sSum / stats.totalAssemblies;
    stats.avgTokensUsed = tSum / stats.totalAssemblies;
    return stats;
  }
}

export const contextAssembler = new ContextAssembler();
