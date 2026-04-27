// ═══════════════════════════════════════════════════════════════
// SITA OS — useUpdateDaemon Hook
// Reactive bridge between UpdateDaemon engine and React UI
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { updateDaemon, type UpdateDaemonState } from "@/lib/services/update-daemon";

export function useUpdateDaemon() {
  const state = useSyncExternalStore(
    (cb) => updateDaemon.subscribe(cb),
    () => updateDaemon.getState()
  );

  const [loading, setLoading] = useState(false);

  const checkForUpdates = useCallback(async () => {
    setLoading(true);
    try { await updateDaemon.checkForUpdates(); }
    finally { setLoading(false); }
  }, []);

  const runPreflight = useCallback(async (updateId: string) => {
    setLoading(true);
    try { return await updateDaemon.runPreflight(updateId); }
    finally { setLoading(false); }
  }, []);

  const downloadUpdate = useCallback(async (updateId: string) => {
    await updateDaemon.downloadUpdate(updateId);
  }, []);

  const cancelDownload = useCallback(() => {
    updateDaemon.cancelDownload();
  }, []);

  const stageUpdate = useCallback(async () => {
    await updateDaemon.stageUpdate();
  }, []);

  const rebootAndValidate = useCallback(async () => {
    return await updateDaemon.rebootAndValidate();
  }, []);

  const manualRollback = useCallback(async () => {
    await updateDaemon.manualRollback();
  }, []);

  const setChannel = useCallback((ch: "stable" | "beta" | "canary") => {
    updateDaemon.setChannel(ch);
  }, []);

  const resetState = useCallback(() => {
    updateDaemon.resetState();
  }, []);

  const isActive = !["idle", "succeeded", "failed", "rolled_back", "metadata_verified", "preflight_failed"].includes(state.state);

  return {
    ...state,
    loading,
    isActive,
    checkForUpdates,
    runPreflight,
    downloadUpdate,
    cancelDownload,
    stageUpdate,
    rebootAndValidate,
    manualRollback,
    setChannel,
    resetState,
  };
}
