// ═══════════════════════════════════════════════════════════════
// SITA OS — useSetupOrchestration Hook
// Drives the OSSetupExperience via the SetupOrchestrationEngine
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { SetupOrchestrationEngine } from "@/domains/engines/setup-orchestration-engine";
import type {
  SetupPhaseId, SetupPhaseStatus, SetupBackgroundTask, SetupBranchPath,
  SetupSession,
} from "@/packages/contracts/specialized/setup-orchestration";
import { RESOLVED_STATUSES } from "@/packages/contracts/specialized/setup-orchestration";
import { useAuth } from "@/contexts/AuthContext";
import { onNetworkChange, onVisibilityChange } from "@/platform/sita/components/sita/boot/bootStatePersistence";
import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import { useRuntimeHost } from "@/runtimes/runtime-host-adapter";

function getDeviceId(): string {
  let id = localStorage.getItem("sita-device-id");
  if (!id) {
    id = crypto.randomUUID?.() ?? `dev-${Date.now()}`;
    localStorage.setItem("sita-device-id", id);
  }
  return id;
}

export interface SetupOrchestrationHook {
  currentPhase: SetupPhaseId;
  phaseStatus: SetupPhaseStatus;
  allPhaseStates: Record<string, { status: SetupPhaseStatus; retryCount: number }>;
  backgroundTasks: SetupBackgroundTask[];
  goNext: () => void;
  goPrev: () => void;
  skipPhase: () => void;
  rollbackTo: (phaseId: SetupPhaseId) => void;
  retryPhase: () => void;
  sessionProgress: number;
  branchPath: SetupBranchPath;
  isResumed: boolean;
  activePhaseIds: SetupPhaseId[];
  steppablePhases: SetupPhaseId[];
  currentStepIndex: number;
  totalSteps: number;
  setCurrentPhase: (phaseId: SetupPhaseId) => void;
  setSessionData: (key: string, value: any) => void;
  isPhaseRequired: (phaseId: SetupPhaseId) => boolean;
  engine: SetupOrchestrationEngine;
}

export function useSetupOrchestration(): SetupOrchestrationHook {
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const deviceId = useMemo(getDeviceId, []);

  const engineRef = useRef<SetupOrchestrationEngine | null>(null);
  const [isResumed, setIsResumed] = useState(false);

  // Initialize engine
  if (!engineRef.current) {
    engineRef.current = new SetupOrchestrationEngine(userId, deviceId);

    // Check for resumable session
    const snapshot = SetupOrchestrationEngine.loadFromLocalStorage();
    if (snapshot && snapshot.userId === userId) {
      engineRef.current.restoreFromSnapshot(snapshot);
      setIsResumed(true);
    }
  }

  const engine = engineRef.current;

  // Reactive state derived from engine
  const [session, setSession] = useState<SetupSession>(engine.getSession());

  useEffect(() => {
    const unsub = engine.onSessionChange((s) => {
      setSession({ ...s });
      engine.persistToLocalStorage();
    });

    // Persist to DB periodically (every 10 transitions or 30s)
    const dbInterval = setInterval(async () => {
      try {
        const snapshot = engine.toSnapshot();
        await fromDynamicTable("setup_sessions").upsert({
          id: snapshot.id,
          user_id: snapshot.userId,
          device_id: snapshot.deviceId,
          session_data: snapshot,
          current_phase: snapshot.currentPhaseId,
          branch_path: snapshot.branchPath,
          completion_pct: snapshot.completionPct,
          interrupted: snapshot.interrupted,
          interruption_reason: snapshot.interruptionReason ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });
      } catch { /* DB persistence is best-effort */ }
    }, 30_000);

    return () => { unsub(); clearInterval(dbInterval); };
  }, [engine]);

  const host = useRuntimeHost();

  // Listen for interruptions — beforeunload routed through canonical adapter
  useEffect(() => {
    const unsubBeforeUnload = host.addBeforeUnload(() => {
      engine.markInterrupted("reload");
    });

    const unsubNetwork = onNetworkChange((online) => {
      if (!online) engine.markInterrupted("network-loss");
    });

    let visibilityTimer: ReturnType<typeof setTimeout> | null = null;
    const unsubVisibility = onVisibilityChange((hidden) => {
      if (hidden) {
        visibilityTimer = setTimeout(() => {
          engine.markInterrupted("timeout");
        }, 5 * 60 * 1000); // 5 minutes hidden
      } else if (visibilityTimer) {
        clearTimeout(visibilityTimer);
        visibilityTimer = null;
      }
    });

    return () => {
      unsubBeforeUnload();
      unsubNetwork();
      unsubVisibility();
      if (visibilityTimer) clearTimeout(visibilityTimer);
    };
  }, [engine, host]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { engine.destroy(); };
  }, [engine]);

  // ── Actions ───────────────────────────────────────────────

  const goNext = useCallback(() => {
    engine.completeCurrentAndAdvance();
  }, [engine]);

  const goPrev = useCallback(() => {
    engine.goToPreviousPhase();
  }, [engine]);

  const skipPhase = useCallback(() => {
    engine.skipCurrentPhase();
  }, [engine]);

  const rollbackTo = useCallback((phaseId: SetupPhaseId) => {
    engine.rollbackTo(phaseId);
  }, [engine]);

  const retryPhase = useCallback(() => {
    engine.retryPhase(session.currentPhaseId);
  }, [engine, session.currentPhaseId]);

  const setCurrentPhase = useCallback((phaseId: SetupPhaseId) => {
    engine.setCurrentPhase(phaseId);
  }, [engine]);

  const setSessionData = useCallback((key: string, value: any) => {
    engine.setSessionData(key, value);
  }, [engine]);

  const isPhaseRequired = useCallback((phaseId: SetupPhaseId) => {
    return engine.isPhaseRequired(phaseId);
  }, [engine]);

  // ── Derived state ─────────────────────────────────────────

  const activePhaseIds = engine.getActivePhaseIds();
  const steppablePhases = engine.getSteppablePhases();
  const currentStepIndex = steppablePhases.indexOf(session.currentPhaseId);
  const totalSteps = steppablePhases.length;

  const allPhaseStates: Record<string, { status: SetupPhaseStatus; retryCount: number }> = {};
  for (const [key, val] of Object.entries(session.phaseStates)) {
    allPhaseStates[key] = { status: val.status, retryCount: val.retryCount };
  }

  return {
    currentPhase: session.currentPhaseId,
    phaseStatus: session.phaseStates[session.currentPhaseId]?.status ?? "idle",
    allPhaseStates,
    backgroundTasks: session.backgroundTasks,
    goNext,
    goPrev,
    skipPhase,
    rollbackTo,
    retryPhase,
    sessionProgress: session.completionPct,
    branchPath: session.branchPath,
    isResumed,
    activePhaseIds,
    steppablePhases,
    currentStepIndex,
    totalSteps,
    setCurrentPhase,
    setSessionData,
    isPhaseRequired,
    engine,
  };
}
