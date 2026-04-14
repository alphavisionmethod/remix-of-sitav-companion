// ═══════════════════════════════════════════════════════════════
// SITA OS — useOSSecurity Hook
// Clean interface for components to interact with OS security
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  isOSSecurityBooted,
  getAuthDaemon,
  getSessionDaemon,
  getAuditDaemon,
  getControlCenterDaemon,
  getPolicyDaemon,
  getSecretsDaemon,
} from "@/lib/os-security";
import type { OSSession, OSAuthMethod, ControlCenterCommand, IPCResult } from "@/lib/os-security/types";
import type { CommandResult } from "@/lib/os-security/controlcenterd";
import type { PolicyDecision, EnvironmentalContext } from "@/lib/os-security/policyd";

interface OSSecurityState {
  booted: boolean;
  currentSession: OSSession | null;
  isLocked: boolean;
  isAuthFresh: boolean;
  securityScore: number;
  enrolledMethods: OSAuthMethod[];
  environment: EnvironmentalContext | null;
}

export function useOSSecurity() {
  const [state, setState] = useState<OSSecurityState>({
    booted: false,
    currentSession: null,
    isLocked: false,
    isAuthFresh: false,
    securityScore: 0,
    enrolledMethods: [],
    environment: null,
  });

  // Refresh state from daemons
  const refresh = useCallback(() => {
    if (!isOSSecurityBooted()) {
      setState(prev => ({ ...prev, booted: false }));
      return;
    }

    try {
      const sessiond = getSessionDaemon();
      const authd = getAuthDaemon();
      const ccd = getControlCenterDaemon();

      const sessions = sessiond.getAllSessions();
      const current = sessions[0] || null;
      const isLocked = current?.locked ?? false;
      const isAuthFresh = current ? authd.isAuthFresh(current.sessionId) : false;

      let score = 50;
      const methods = current?.enrolledMethods || ["password"];
      if (methods.includes("password")) score += 15;
      if (methods.includes("pin")) score += 10;
      if (methods.includes("biometric")) score += 15;
      if (methods.includes("security-key")) score += 10;

      setState({
        booted: true,
        currentSession: current,
        isLocked,
        isAuthFresh,
        securityScore: Math.min(100, score),
        enrolledMethods: methods,
        environment: ccd.getEnvironment(),
      });
    } catch {
      setState(prev => ({ ...prev, booted: false }));
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Execute a system command through controlcenterd
  const executeCommand = useCallback(async (
    action: string,
    payload: Record<string, unknown> = {},
    callerService = "app"
  ): Promise<CommandResult | null> => {
    if (!state.booted || !state.currentSession) return null;

    const ccd = getControlCenterDaemon();
    return ccd.executeCommand({
      commandId: crypto.randomUUID(),
      callerUserId: state.currentSession.userId,
      callerSessionId: state.currentSession.sessionId,
      callerService,
      action,
      payload,
      timestamp: Date.now(),
    });
  }, [state.booted, state.currentSession]);

  // Check if an action would be allowed (without executing)
  const checkPermission = useCallback((action: string): PolicyDecision | null => {
    if (!state.booted || !state.currentSession) return null;
    const policyd = getPolicyDaemon();
    const ccd = getControlCenterDaemon();
    return policyd.evaluate(
      action,
      state.currentSession,
      ccd.getEnvironment(),
      "permission-check"
    );
  }, [state.booted, state.currentSession]);

  // Lock the current session
  const lockSession = useCallback(() => {
    if (!state.booted || !state.currentSession) return;
    const sessiond = getSessionDaemon();
    sessiond.lock(state.currentSession.sessionId);
    refresh();
  }, [state.booted, state.currentSession, refresh]);

  // Get recent audit events
  const getRecentAuditEvents = useCallback((limit = 20) => {
    if (!state.booted) return [];
    const auditd = getAuditDaemon();
    return auditd.getEvents({ limit });
  }, [state.booted]);

  return useMemo(() => ({
    ...state,
    refresh,
    executeCommand,
    checkPermission,
    lockSession,
    getRecentAuditEvents,
  }), [state, refresh, executeCommand, checkPermission, lockSession, getRecentAuditEvents]);
}