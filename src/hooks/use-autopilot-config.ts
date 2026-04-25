// ═══════════════════════════════════════════════════════════════
// SITA OS — useAutopilotConfig
// React Query wrapper around the canonical autopilot-config service.
// Provides full page-state coverage + governance receipt emission.
// ═══════════════════════════════════════════════════════════════

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { usePageData } from "@/hooks/usePageData";
import {
  fetchAutopilotConfig,
  saveAutopilotConfig,
  recordAutopilotEvent,
  type AutopilotConfigSnapshot,
} from "@/data/repositories/autopilot-config-service";
import {
  getDefaultConfig,
  type AutopilotConfig,
} from "@/lib/domain-engines/autopilot-engine";

export function autopilotConfigQueryKey(userId: string | null, mode: string) {
  return ["autopilot-config", mode, userId ?? "anon"] as const;
}

export function useAutopilotConfig() {
  const { user } = useAuth();
  const { mode } = useDataMode();
  const userId = user?.id ?? null;

  const result = usePageData<AutopilotConfigSnapshot>({
    queryKey: autopilotConfigQueryKey(userId, mode),
    queryFn: () => fetchAutopilotConfig({ mode, userId }),
    staleTime: 30_000,
    // A snapshot is always considered "ready" — even default = empty-but-valid.
    emptyCheck: () => false,
  });

  return { ...result, userId, mode };
}

interface SaveContext {
  userId: string;
  mode: "demo" | "live";
}

function useSaveContext(): SaveContext | null {
  const { user } = useAuth();
  const { mode } = useDataMode();
  if (mode === "demo") return { userId: "demo", mode: "demo" };
  if (!user?.id) return null;
  return { userId: user.id, mode: "live" };
}

export function useSaveAutopilotConfig() {
  const qc = useQueryClient();
  const ctx = useSaveContext();

  return useMutation({
    mutationFn: async (config: AutopilotConfig) => {
      if (!ctx) throw new Error("Sign in to save Autopilot configuration");
      if (ctx.mode === "demo") {
        // Demo mode: never persist; just echo back.
        return {
          config,
          isOnboarded: Boolean(config.isOnboarded),
          source: "demo" as const,
          updatedAt: null,
        };
      }
      const snap = await saveAutopilotConfig({ userId: ctx.userId, config });
      void recordAutopilotEvent({
        userId: ctx.userId,
        kind: "autopilot.config.update",
        summary: "Autopilot configuration updated",
        payload: { activePlaybooks: config.activePlaybooks, approvalMode: config.approvalMode },
      });
      return snap;
    },
    onSuccess: (snap) => {
      qc.setQueriesData(
        { queryKey: ["autopilot-config"] },
        (prev: AutopilotConfigSnapshot | undefined) => prev ? { ...prev, ...snap } : snap,
      );
      qc.invalidateQueries({ queryKey: ["autopilot-config"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save Autopilot configuration");
    },
  });
}

export function useCompleteAutopilotWizard() {
  const qc = useQueryClient();
  const ctx = useSaveContext();

  return useMutation({
    mutationFn: async (config: AutopilotConfig) => {
      if (!ctx) throw new Error("Sign in to complete Autopilot setup");
      if (ctx.mode === "demo") {
        return {
          config,
          isOnboarded: true,
          source: "demo" as const,
          updatedAt: null,
        };
      }
      const snap = await saveAutopilotConfig({ userId: ctx.userId, config });
      void recordAutopilotEvent({
        userId: ctx.userId,
        kind: "autopilot.wizard.complete",
        summary: "Autopilot wizard completed",
        payload: {
          activePlaybooks: config.activePlaybooks,
          approvalMode: config.approvalMode,
          notificationChannels: config.notificationChannels,
        },
      });
      return snap;
    },
    onSuccess: () => {
      toast.success("Autopilot is configured");
      qc.invalidateQueries({ queryKey: ["autopilot-config"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to complete Autopilot setup");
    },
  });
}

/**
 * SAFE skip — does NOT auto-activate any playbooks.
 * Marks onboarded with the most conservative governance posture.
 */
export function useSkipAutopilotWizard() {
  const qc = useQueryClient();
  const ctx = useSaveContext();

  return useMutation({
    mutationFn: async () => {
      const safe: AutopilotConfig = {
        ...getDefaultConfig(),
        isOnboarded: true,
        approvalMode: "all",
        activePlaybooks: [],
      };
      if (!ctx) throw new Error("Sign in to skip Autopilot setup");
      if (ctx.mode === "demo") {
        return { config: safe, isOnboarded: true, source: "demo" as const, updatedAt: null };
      }
      const snap = await saveAutopilotConfig({ userId: ctx.userId, config: safe });
      void recordAutopilotEvent({
        userId: ctx.userId,
        kind: "autopilot.wizard.skip",
        summary: "Autopilot wizard skipped — safe defaults applied",
        payload: { approvalMode: "all", activePlaybooks: [] },
      });
      return snap;
    },
    onSuccess: () => {
      toast.message("Autopilot ready — no playbooks active. Enable any time from the command center.");
      qc.invalidateQueries({ queryKey: ["autopilot-config"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to skip Autopilot setup");
    },
  });
}
