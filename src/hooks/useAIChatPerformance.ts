// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Chat Workflow Performance Hook
// Tracks E2E latency for AI chat requests (send → first token → done)
// ═══════════════════════════════════════════════════════════════

import { useCallback, useRef } from "react";

export interface AIChatPerfEntry {
  requestId: string;
  startedAt: number;
  firstTokenAt: number | null;
  completedAt: number | null;
  totalMs: number | null;
  ttftMs: number | null; // time-to-first-token
  model: string | null;
  timestamp: string;
}

const MAX_ENTRIES = 200;
let chatPerfLog: AIChatPerfEntry[] = [];

export function getChatPerfLog(): readonly AIChatPerfEntry[] {
  return chatPerfLog;
}

export function computeChatPercentiles(): { p50: number; p95: number; p99: number; p50Ttft: number; count: number } {
  const completed = chatPerfLog.filter((e) => e.totalMs != null);
  if (completed.length === 0) return { p50: 0, p95: 0, p99: 0, p50Ttft: 0, count: 0 };

  const totals = completed.map((e) => e.totalMs!).sort((a, b) => a - b);
  const ttfts = completed.filter((e) => e.ttftMs != null).map((e) => e.ttftMs!).sort((a, b) => a - b);
  const p = (arr: number[], pct: number) => arr[Math.min(Math.floor(arr.length * pct), arr.length - 1)];

  return {
    p50: Math.round(p(totals, 0.5)),
    p95: Math.round(p(totals, 0.95)),
    p99: Math.round(p(totals, 0.99)),
    p50Ttft: ttfts.length > 0 ? Math.round(p(ttfts, 0.5)) : 0,
    count: completed.length,
  };
}

/**
 * Hook: returns start/firstToken/complete callbacks to wrap AI chat calls.
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
      model: model ?? null,
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

  const completeRequest = useCallback((requestId: string) => {
    const entry = activeRef.current.get(requestId);
    if (entry && !entry.completedAt) {
      entry.completedAt = performance.now();
      entry.totalMs = entry.completedAt - entry.startedAt;
      chatPerfLog.push(entry);
      if (chatPerfLog.length > MAX_ENTRIES) chatPerfLog = chatPerfLog.slice(-MAX_ENTRIES);
      activeRef.current.delete(requestId);
    }
  }, []);

  return { startRequest, markFirstToken, completeRequest };
}