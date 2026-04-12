// ═══════════════════════════════════════════════════════════════
// SITA OS — Mnemosyne Context Assembler
// Scoped retrieval and context assembly for AI pipelines
// Integrates memory graph + rich profile + conversation persistence
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import { getTaskContract } from "@/lib/contracts/global-contracts-registry";
import { aiMemoryGraphService, type MemoryNode } from "@/lib/services/ai-memory-graph";

// ── Context Types ──────────────────────────────────────────────

export interface ContextSource {
  type: "file" | "profile" | "conversation" | "evidence" | "memory" | "memory_graph";
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

    // 2. Rich user profile context (expanded beyond name + onboarded)
    const profileContext = await this.getUserProfile(userId);
    if (profileContext) sources.push(profileContext);

    // 3. Conversation window (with persistence via advisor_memories)
    if (options?.conversationHistory) {
      const convContext = this.getConversationWindow(options.conversationHistory, Math.floor(maxTokens * 0.3));
      if (convContext) sources.push(convContext);
    } else {
      // Fall back to persisted conversation history from advisor_memories
      const persistedConv = await this.getPersistedConversation(userId, Math.floor(maxTokens * 0.2));
      if (persistedConv) sources.push(persistedConv);
    }

    // 4. Evidence context (for evidence-required tasks)
    if (contract?.evidenceRequirements.requiresEvidence) {
      const evidenceContexts = await this.getEvidenceContext(userId, taskType);
      sources.push(...evidenceContexts);
    }

    // 5. Memory graph integration — pull relevant memory nodes
    const memoryGraphContext = await this.getMemoryGraphContext(userId, Math.floor(maxTokens * 0.15));
    if (memoryGraphContext) sources.push(memoryGraphContext);

    // 6. Scope to token limit
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
      const { data: files } = await fromDynamicTable("documents")
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
      const { data: profile } = await db.from("profiles")
        .select("display_name, onboarding_completed, preferences")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profile) return null;

      // Enrich with user memory for deeper personalization
      let memoryPreferences: Record<string, unknown> = {};
      try {
        const { data: memories } = await fromDynamicTable("user_memory")
          .select("key, value, category, confidence")
          .eq("user_id", userId)
          .eq("category", "preference")
          .order("confidence", { ascending: false })
          .limit(10);

        if (memories && Array.isArray(memories)) {
          for (const m of memories) {
            const mem = m as Record<string, unknown>;
            memoryPreferences[String(mem.key)] = mem.value;
          }
        }
      } catch {
        // Memory enrichment is best-effort
      }

      // Enrich with adaptive interface profile
      let interfaceProfile: Record<string, unknown> | null = null;
      try {
        const { data: aip } = await db.from("adaptive_interface_profiles")
          .select("cognitive_load_class, density_preference, summary_depth, current_mode")
          .eq("user_id", userId)
          .maybeSingle();
        if (aip) interfaceProfile = aip as Record<string, unknown>;
      } catch {
        // Interface profile enrichment is best-effort
      }

      const content = JSON.stringify({
        name: profile.display_name,
        onboarded: profile.onboarding_completed,
        preferences: profile.preferences,
        learnedPreferences: Object.keys(memoryPreferences).length > 0 ? memoryPreferences : undefined,
        interfaceProfile: interfaceProfile || undefined,
      });

      return {
        type: "profile",
        id: userId,
        content,
        tokenEstimate: Math.ceil(content.length / 4),
        freshness: new Date().toISOString(),
        confidence: 1.0,
      };
    } catch {
      // Profile retrieval is best-effort
    }

    return null;
  }

  private async getPersistedConversation(userId: string, maxTokens: number): Promise<ContextSource | null> {
    try {
      const { data: memories } = await db.from("advisor_memories")
        .select("content, memory_type, created_at")
        .eq("user_id", userId)
        .eq("memory_type", "conversation")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!memories || memories.length === 0) return null;

      const messages: string[] = [];
      let tokenCount = 0;

      for (const m of memories) {
        const msgTokens = Math.ceil(m.content.length / 4);
        if (tokenCount + msgTokens > maxTokens) break;
        messages.unshift(m.content);
        tokenCount += msgTokens;
      }

      if (messages.length === 0) return null;

      const content = messages.join("\n");
      return {
        type: "conversation",
        id: `persisted-conv-${Date.now()}`,
        content,
        tokenEstimate: tokenCount,
        freshness: memories[0].created_at,
        confidence: 0.85,
      };
    } catch {
      return null;
    }
  }

  private getConversationWindow(
    history: Array<{ role: string; content: string }>,
    maxTokens: number
  ): ContextSource | null {
    if (history.length === 0) return null;

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

  private async getEvidenceContext(userId: string, _taskType: string): Promise<ContextSource[]> {
    const sources: ContextSource[] = [];

    try {
      const { data: knowledge } = await db.from("advisor_knowledge")
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

  private async getMemoryGraphContext(userId: string, maxTokens: number): Promise<ContextSource | null> {
    try {
      const graph = await aiMemoryGraphService.buildGraph(userId);

      if (graph.nodes.length === 0) return null;

      // Sort by confidence × recency, pick top nodes within token budget
      const rankedNodes = [...graph.nodes]
        .sort((a, b) => {
          const scoreA = a.confidence * (a.accessCount + 1);
          const scoreB = b.confidence * (b.accessCount + 1);
          return scoreB - scoreA;
        });

      const entries: string[] = [];
      let tokenCount = 0;

      for (const node of rankedNodes) {
        const entry = `[${node.category}] ${node.label}: ${node.value} (confidence: ${node.confidence})`;
        const entryTokens = Math.ceil(entry.length / 4);
        if (tokenCount + entryTokens > maxTokens) break;
        entries.push(entry);
        tokenCount += entryTokens;
      }

      if (entries.length === 0) return null;

      return {
        type: "memory_graph",
        id: `memory-graph-${userId}`,
        content: `Known facts about user (${entries.length} memories):\n${entries.join("\n")}`,
        tokenEstimate: tokenCount,
        freshness: new Date().toISOString(),
        confidence: graph.stats.avgConfidence,
      };
    } catch {
      return null;
    }
  }

  private scopeContext(
    sources: ContextSource[],
    maxTokens: number,
    decisions: ScopingDecision[]
  ): ContextSource[] {
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
