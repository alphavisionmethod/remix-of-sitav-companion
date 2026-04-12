// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell State Machine
// Unified state for lock, desktop, command, and trust posture
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo, useEffect } from "react";

// ── Shell Surface States ─────────────────────────────────────

export type ShellSurface = "locked" | "unlocking" | "desktop" | "command_open";

export type TrustPosture =
  | "secure"
  | "approval_waiting"
  | "attention_needed"
  | "quiet_mode"
  | "offline"
  | "degraded";

export type PrivacyMode = "personal" | "shared" | "managed";

export type DesktopState =
  | "first_arrival"
  | "returning"
  | "quiet"
  | "offline"
  | "focus"
  | "approvals_waiting"
  | "empty";

export interface ShellNotificationDigest {
  total: number;
  approvals: number;
  urgent: number;
  business: number;
  finance: number;
  household: number;
  system: number;
}

export interface ContinuityContext {
  lastWorkspace: string | null;
  lastActivity: string | null;
  pendingDrafts: number;
  unfinishedWorkflows: number;
  whatChanged: string[];
}

export type SpatialZoom = "overview" | "workspace" | "app";

export interface ShellState {
  surface: ShellSurface;
  trustPosture: TrustPosture;
  privacyMode: PrivacyMode;
  desktopState: DesktopState;
  notifications: ShellNotificationDigest;
  continuity: ContinuityContext;
  isCommandOpen: boolean;
  isOnline: boolean;
  spatialZoom: SpatialZoom;
}

const DEFAULT_NOTIFICATIONS: ShellNotificationDigest = {
  total: 0,
  approvals: 0,
  urgent: 0,
  business: 0,
  finance: 0,
  household: 0,
  system: 0,
};

const DEFAULT_CONTINUITY: ContinuityContext = {
  lastWorkspace: null,
  lastActivity: null,
  pendingDrafts: 0,
  unfinishedWorkflows: 0,
  whatChanged: [],
};

export function useShellState() {
  const [surface, setSurface] = useState<ShellSurface>("desktop");
  const [trustPosture, setTrustPosture] = useState<TrustPosture>("secure");
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("personal");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [spatialZoom, setSpatialZoom] = useState<SpatialZoom>("overview");
  const [notifications, setNotifications] = useState<ShellNotificationDigest>(DEFAULT_NOTIFICATIONS);
  const [continuity, setContinuity] = useState<ContinuityContext>(DEFAULT_CONTINUITY);

  // Track online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setTrustPosture("offline");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Derive desktop state
  const desktopState = useMemo<DesktopState>(() => {
    if (!isOnline) return "offline";
    if (notifications.approvals > 0) return "approvals_waiting";
    const seen = localStorage.getItem("sita-post-arrival-seen");
    if (!seen) return "first_arrival";
    return "returning";
  }, [isOnline, notifications.approvals]);

  const lock = useCallback(() => setSurface("locked"), []);
  const unlock = useCallback(() => {
    setSurface("unlocking");
    setTimeout(() => setSurface("desktop"), 600);
  }, []);

  const openCommand = useCallback(() => setIsCommandOpen(true), []);
  const closeCommand = useCallback(() => setIsCommandOpen(false), []);
  const toggleCommand = useCallback(() => setIsCommandOpen(o => !o), []);

  const updateNotifications = useCallback((digest: Partial<ShellNotificationDigest>) => {
    setNotifications(prev => {
      const next = { ...prev, ...digest };
      next.total = next.approvals + next.urgent + next.business + next.finance + next.household + next.system;
      return next;
    });
  }, []);

  const updateContinuity = useCallback((ctx: Partial<ContinuityContext>) => {
    setContinuity(prev => ({ ...prev, ...ctx }));
  }, []);

  const state: ShellState = useMemo(() => ({
    surface,
    trustPosture,
    privacyMode,
    desktopState,
    notifications,
    continuity,
    isCommandOpen,
    isOnline,
    spatialZoom,
  }), [surface, trustPosture, privacyMode, desktopState, notifications, continuity, isCommandOpen, isOnline, spatialZoom]);

  return {
    state,
    lock,
    unlock,
    openCommand,
    closeCommand,
    toggleCommand,
    setTrustPosture,
    setPrivacyMode,
    updateNotifications,
    updateContinuity,
    setSurface,
    setSpatialZoom,
  };
}
