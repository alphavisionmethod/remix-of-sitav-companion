// Personal Brain — Phase 7 workspace members hook
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PbWorkspaceRole = "viewer" | "editor" | "owner";
export interface PbWorkspaceMember {
  id: string;
  member_email: string | null;
  member_user_id: string | null;
  role: PbWorkspaceRole;
  status: "invited" | "active" | "revoked";
  invite_token: string | null;
  accepted_at: string | null;
  created_at: string;
}

export function usePbWorkspaceMembers(workspaceId: string | null | undefined) {
  const [members, setMembers] = useState<PbWorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!workspaceId) { setMembers([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.functions.invoke("personal-brain", {
      body: { action: "workspace.list_members", payload: { workspace_id: workspaceId } },
    });
    setMembers(((data as { members?: PbWorkspaceMember[] } | null)?.members ?? []));
    setLoading(false);
  }, [workspaceId]);

  const invite = useCallback(async (email: string, role: PbWorkspaceRole) => {
    if (!workspaceId) return null;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("personal-brain", {
        body: { action: "workspace.invite", payload: { workspace_id: workspaceId, email, role } },
      });
      if (error) throw error;
      await refresh();
      return data as { ok: boolean; member: PbWorkspaceMember };
    } finally { setBusy(false); }
  }, [workspaceId, refresh]);

  const remove = useCallback(async (member_id: string) => {
    setBusy(true);
    try {
      await supabase.functions.invoke("personal-brain", {
        body: { action: "workspace.remove_member", payload: { member_id } },
      });
      setMembers((p) => p.filter((m) => m.id !== member_id));
    } finally { setBusy(false); }
  }, []);

  const updateRole = useCallback(async (member_id: string, role: PbWorkspaceRole) => {
    setBusy(true);
    try {
      await supabase.functions.invoke("personal-brain", {
        body: { action: "workspace.update_role", payload: { member_id, role } },
      });
      setMembers((p) => p.map((m) => (m.id === member_id ? { ...m, role } : m)));
    } finally { setBusy(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  return { members, loading, busy, refresh, invite, remove, updateRole };
}
