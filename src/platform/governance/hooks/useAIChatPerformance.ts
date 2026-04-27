// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Chat Workflow Performance Hook
// Tracks E2E latency for AI chat requests (send → first token → done)
// with retry tracking, environment tagging, and filterable log.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useRef } from "react";

export type PerfEnvironment = "dev" | "staging" | "prod";

export interface AIChatPerfEntry {
  requestId: string;
  startedAt: number;
  firstTokenAt: number | null;
  completedAt: number | null;
  totalMs: number | null;
  ttftMs: number | null; // time-to-first-token
  generationMs: number | null; // firstToken → complete
  retryCount: number;
  model: string | null;
  environment: PerfEnvironment;
  timestamp: string;
}

export interface ChatPerfFilter {
  from?: string; // ISO date
  to?: string;   // ISO date
  environment?: PerfEnvironment;
  model?: string;
}

const MAX_ENTRIES = 200;
let chatPerfLog: AIChatPerfEntry[] = [];

export function getChatPerfLog(filter?: ChatPerfFilter): readonly AIChatPerfEntry[] {
  if (!filter) return chatPerfLog;
  return chatPerfLog.filter((e) => {
    if (filter.environment && e.environment !== filter.environment) return false;
    if (filter.model && e.model !== filter.model) return false;
    if (filter.from && e.timestamp < filter.from) return false;
    if (filter.to && e.timestamp > filter.to) return false;
    return true;
  });
}

/** Unique model values currently in the log */
export function getChatPerfModels(): string[] {
  const set = new Set<string>();
  for (const e of chatPerfLog) if (e.model) set.add(e.model);
  return [...set].sort();
}

export function computeChatPercentiles(filter?: ChatPerfFilter): {
  p50: number; p95: number; p99: number; p50Ttft: number;
  p50Gen: number; avgRetries: number; count: number;
} {
  const entries = filter ? getChatPerfLog(filter) : chatPerfLog;
  const completed = entries.filter((e) => e.totalMs != null);
  if (completed.length === 0)
    return { p50: 0, p95: 0, p99: 0, p50Ttft: 0, p50Gen: 0, avgRetries: 0, count: 0 };

  const totals = completed.map((e) => e.totalMs!).sort((a, b) => a - b);
  const ttfts = completed.filter((e) => e.ttftMs != null).map((e) => e.ttftMs!).sort((a, b) => a - b);
  const gens = completed.filter((e) => e.generationMs != null).map((e) => e.generationMs!).sort((a, b) => a - b);
  const p = (arr: number[], pct: number) => arr[Math.min(Math.floor(arr.length * pct), arr.length - 1)];
  const totalRetries = completed.reduce((s, e) => s + e.retryCount, 0);

  return {
    p50: Math.round(p(totals, 0.5)),
    p95: Math.round(p(totals, 0.95)),
    p99: Math.round(p(totals, 0.99)),
    p50Ttft: ttfts.length > 0 ? Math.round(p(ttfts, 0.5)) : 0,
    p50Gen: gens.length > 0 ? Math.round(p(gens, 0.5)) : 0,
    avgRetries: +(totalRetries / completed.length).toFixed(2),
    count: completed.length,
  };
}

function detectEnvironment(): PerfEnvironment {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  if (host.includes("localhost") || host.includes("127.0.0.1")) return "dev";
  if (host.includes("staging") || host.includes("preview")) return "staging";
  return "prod";
}

/**
 * Hook: returns start/firstToken/complete/retry callbacks to wrap AI chat calls.
 */
export function useAIChatPerformance() {
  const activeRef = useRef<Map<string, AIChatPerfEntry>>(new Map());

  const startRequest = useCallback((requestId: string, model?: string) => {
    const entry: AIChatPerfEntry = {
      requestId,
      startedAt: performance.now(),
      firstTokenAt: null,
      completedAt: null,
      totalMs: null,
      ttftMs: null,
      generationMs: null,
      retryCount: 0,
      model: model ?? null,
      environment: detectEnvironment(),
      timestamp: new Date().toISOString(),
    };
    activeRef.current.set(requestId, entry);
  }, []);

  const markFirstToken = useCallback((requestId: string) => {
    const entry = activeRef.current.get(requestId);
    if (entry && !entry.firstTokenAt) {
      entry.firstTokenAt = performance.now();
      entry.ttftMs = entry.firstTokenAt - entry.startedAt;
    }
  }, []);

  const markRetry = useCallback((requestId: string) => {
    const entry = activeRef.current.get(requestId);
    if (entry) entry.retryCount += 1;
  }, []);

  const completeRequest = useCallback((requestId: string) => {
    const entry = activeRef.current.get(requestId);
    if (entry && !entry.completedAt) {
      entry.completedAt = performance.now();
      entry.totalMs = entry.completedAt - entry.startedAt;
      if (entry.firstTokenAt) {
        entry.generationMs = entry.completedAt - entry.firstTokenAt;
      }
      chatPerfLog.push(entry);
      if (chatPerfLog.length > MAX_ENTRIES) chatPerfLog = chatPerfLog.slice(-MAX_ENTRIES);
      activeRef.current.delete(requestId);
    }
  }, []);

  return { startRequest, markFirstToken, markRetry, completeRequest };
}