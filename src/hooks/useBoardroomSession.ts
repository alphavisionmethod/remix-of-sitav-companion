// ============================================================
// SITA OS — Boardroom Session Lifecycle Hook
// Manages session state with demo-mode fallback
// ============================================================

import { useState, useCallback, useEffect, useRef } from "react";

export type SessionStatus = "assembling" | "in-progress" | "paused" | "awaiting-evidence" | "ready-for-approval" | "adjourned";

export interface BoardroomSession {
  id: string;
  sessionType: string;
  scope: string;
  status: SessionStatus;
  openedAt: string;
  closedAt: string | null;
  participatingAdvisors: string[];
  sessionMode: string;
  currentIssueId: string | null;
  decisionReceiptIds: string[];
}

const SESSION_STAGES: SessionStatus[] = [
  "assembling", "in-progress", "paused", "awaiting-evidence", "ready-for-approval", "adjourned",
];

function createDemoSession(scope: string, sessionType: string): BoardroomSession {
  return {
    id: `demo-${Date.now()}`,
    sessionType,
    scope,
    status: "in-progress",
    openedAt: new Date().toISOString(),
    closedAt: null,
    participatingAdvisors: ["biz-revenue", "fin-obligations", "con-travel", "biz-relationship", "fin-reserve", "con-prep"],
    sessionMode: "review",
    currentIssueId: null,
    decisionReceiptIds: [],
  };
}

export function useBoardroomSession(scope: string, sessionType: string = "executive") {
  const [session, setSession] = useState<BoardroomSession>(() => createDemoSession(scope, sessionType));
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (session.status === "in-progress" || session.status === "assembling") {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [session.status]);

  const stageIndex = SESSION_STAGES.indexOf(session.status);

  const openSession = useCallback(() => {
    setSession(s => ({ ...s, status: "in-progress", openedAt: new Date().toISOString() }));
    setElapsed(0);
  }, []);

  const advanceStage = useCallback(() => {
    setSession(s => {
      const idx = SESSION_STAGES.indexOf(s.status);
      const next = SESSION_STAGES[Math.min(idx + 1, SESSION_STAGES.length - 1)];
      return { ...s, status: next, closedAt: next === "adjourned" ? new Date().toISOString() : null };
    });
  }, []);

  const adjournSession = useCallback(() => {
    setSession(s => ({ ...s, status: "adjourned", closedAt: new Date().toISOString() }));
  }, []);

  const pauseSession = useCallback(() => {
    setSession(s => ({ ...s, status: "paused" }));
  }, []);

  const resumeSession = useCallback(() => {
    setSession(s => ({ ...s, status: "in-progress" }));
  }, []);

  const setStatus = useCallback((status: SessionStatus) => {
    setSession(s => ({ ...s, status }));
  }, []);

  return {
    session,
    elapsed,
    stageIndex,
    stages: SESSION_STAGES,
    openSession,
    advanceStage,
    adjournSession,
    pauseSession,
    resumeSession,
    setStatus,
  };
}
