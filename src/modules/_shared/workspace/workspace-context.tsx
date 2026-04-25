// ═══════════════════════════════════════════════════════════════════
// SITA OS — Active Workspace Context (Phase 1)
// Single hook for "which workspace am I currently in" plus the
// workspace_contexts row that governs its pillar, authority defaults,
// memory scope, and visibility.
// ═══════════════════════════════════════════════════════════════════

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type WorkspacePillar = "business" | "concierge" | "finance" | "health" | "personal" | "shared";
export type MemoryScope = "isolated" | "shared" | "cross-pillar";
export type WorkspaceVisibility = "private" | "workspace" | "organization";
export type AuthorityLevel = "suggest" | "ask" | "pre_approved" | "blocked";

export interface WorkspaceContextRow {
  workspace_id: string;
  pillar: WorkspacePillar;
  protected: boolean;
  default_authority_level: AuthorityLevel;
  memory_scope: MemoryScope;
  assistant_advisor_id: string | null;
  visibility: WorkspaceVisibility;
  default_notification_level: "silent" | "minimal" | "standard" | "verbose";
  ephemeral_mode: boolean;
  retention_days: number | null;
  metadata: Record<string, unknown>;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  kind: string;
  color: string;
  context: WorkspaceContextRow | null;
}

const ACTIVE_WORKSPACE_KEY = "sita.activeWorkspaceId";

interface ActiveWorkspaceCtx {
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
}

const Ctx = createContext<ActiveWorkspaceCtx | null>(null);

export function ActiveWorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACTIVE_WORKSPACE_KEY);
  });

  const value = useMemo<ActiveWorkspaceCtx>(
    () => ({
      activeWorkspaceId,
      setActiveWorkspaceId: (id) => {
        setActiveWorkspaceIdState(id);
        if (typeof window !== "undefined") {
          if (id) window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
          else window.localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
        }
      },
    }),
    [activeWorkspaceId],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActiveWorkspaceId() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useActiveWorkspaceId must be used inside <ActiveWorkspaceProvider>");
  return ctx;
}

/** Fetch the user's workspaces joined with their contexts. */
export function useMyWorkspaces() {
  return useQuery({
    queryKey: ["sita", "workspaces", "mine"],
    queryFn: async (): Promise<WorkspaceSummary[]> => {
      const { data: ws, error: wsErr } = await supabase
        .from("pb_workspaces")
        .select("id, name, kind, color")
        .is("archived_at", null)
        .order("created_at", { ascending: true });
      if (wsErr) throw wsErr;
      const ids = (ws ?? []).map((w) => w.id);
      if (ids.length === 0) return [];
      const { data: ctxs, error: cErr } = await supabase
        .from("workspace_contexts")
        .select("*")
        .in("workspace_id", ids);
      if (cErr) throw cErr;
      const byId = new Map<string, WorkspaceContextRow>();
      for (const c of (ctxs ?? []) as WorkspaceContextRow[]) byId.set(c.workspace_id, c);
      return (ws ?? []).map((w) => ({
        id: w.id,
        name: w.name,
        kind: w.kind,
        color: w.color,
        context: byId.get(w.id) ?? null,
      }));
    },
  });
}

/** Fetch the active workspace (id + context) — returns null until selected. */
export function useActiveWorkspace() {
  const { activeWorkspaceId } = useActiveWorkspaceId();
  const { data: workspaces } = useMyWorkspaces();
  return useMemo<WorkspaceSummary | null>(() => {
    if (!workspaces) return null;
    if (activeWorkspaceId) {
      return workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0] ?? null;
    }
    return workspaces[0] ?? null;
  }, [workspaces, activeWorkspaceId]);
}

/**
 * <WorkspaceBoundary> — renders children only when an active workspace exists,
 * otherwise shows a fallback (used by pillar pages to avoid leaking data
 * before a workspace is chosen).
 */
export function WorkspaceBoundary({
  children,
  fallback,
}: {
  children: (ws: WorkspaceSummary) => ReactNode;
  fallback?: ReactNode;
}) {
  const ws = useActiveWorkspace();
  if (!ws) return <>{fallback ?? null}</>;
  return <>{children(ws)}</>;
}