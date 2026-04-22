import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDataMode } from "@/contexts/DataModeContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Notes ─────────────────────────────────────────────────────

export function useNotes() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notes", user?.id, isDemoMode],
    enabled: !isDemoMode && !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("notes")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (note: { title: string; content?: string; folder?: string; tags?: string[] }) => {
      const { data, error } = await (supabase as any)
        .from("notes")
        .insert({ ...note, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

// ── Outcome Tracking ──────────────────────────────────────────

export function useOutcomes() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["outcomes", user?.id, isDemoMode],
    enabled: !isDemoMode && !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("outcome_tracking")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

// ── Import/Export Jobs ────────────────────────────────────────

export function useImportExportJobs() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["import-export-jobs", user?.id, isDemoMode],
    enabled: !isDemoMode && !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("import_export_jobs")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

// ── Calling Contacts ──────────────────────────────────────────

export function useCallingContacts() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["calling-contacts", user?.id, isDemoMode],
    enabled: !isDemoMode && !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("calling_contacts")
        .select("*")
        .eq("user_id", user!.id)
        .order("priority", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

// ── Call Logs ─────────────────────────────────────────────────

export function useCallLogs() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["call-logs", user?.id, isDemoMode],
    enabled: !isDemoMode && !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("call_logs")
        .select("*")
        .eq("user_id", user!.id)
        .order("recorded_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

// ── Pack Installs ─────────────────────────────────────────────

export function usePackInstalls() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pack-installs", user?.id, isDemoMode],
    enabled: !isDemoMode && !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("pack_installs")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useInstallPack() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (pack: { pack_id: string; pack_name: string }) => {
      const { data, error } = await (supabase as any)
        .from("pack_installs")
        .upsert({ ...pack, user_id: user!.id, status: "installed" }, { onConflict: "user_id,pack_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pack-installs"] }),
  });
}
