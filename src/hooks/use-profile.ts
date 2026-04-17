// ═══════════════════════════════════════════════════════════════
// useProfile — Canonical profile signal for the React tree
// ═══════════════════════════════════════════════════════════════
// Fixes C-002 by centralizing profile reads/writes through a single
// TanStack-Query-cached hook. Self-heals if a row is missing for a
// real authenticated user (defensive against any future trigger
// failures).
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const db = supabase as any;

export interface ProfileRecord {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferences: Record<string, any>;
}

const EMPTY_PREFS: Record<string, any> = {};

function buildDemoProfile(userId: string, email: string | null | undefined): ProfileRecord {
  return {
    user_id: userId,
    display_name: "SITA Admin",
    avatar_url: null,
    bio: null,
    preferences: EMPTY_PREFS,
  };
}

async function fetchProfile(userId: string): Promise<ProfileRecord | null> {
  const { data, error } = await db
    .from("profiles")
    .select("user_id, display_name, avatar_url, bio, preferences")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    user_id: data.user_id,
    display_name: data.display_name ?? null,
    avatar_url: data.avatar_url ?? null,
    bio: (data as any).bio ?? null,
    preferences: (data.preferences as Record<string, any>) ?? EMPTY_PREFS,
  };
}

async function selfHealProfile(userId: string, email: string | null | undefined): Promise<ProfileRecord | null> {
  const fallbackName = email ? email.split("@")[0] : "User";
  const { error } = await db
    .from("profiles")
    .insert({
      user_id: userId,
      display_name: fallbackName,
      avatar_url: null,
    });

  // Ignore unique-violation; another session may have inserted it concurrently
  if (error && !String(error.message ?? "").toLowerCase().includes("duplicate")) {
    console.warn("useProfile self-heal insert failed:", error.message);
  }

  return fetchProfile(userId);
}

export function useProfile() {
  const { user, isDemo } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;

  const query = useQuery({
    queryKey: ["profile", userId, isDemo],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async (): Promise<ProfileRecord | null> => {
      if (!userId) return null;
      if (isDemo) return buildDemoProfile(userId, user?.email);

      const existing = await fetchProfile(userId);
      if (existing) return existing;

      // Self-heal: trigger should have created this row; insert it if missing.
      return selfHealProfile(userId, user?.email);
    },
  });

  const refresh = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ["profile", userId, isDemo] });
  }, [queryClient, userId, isDemo]);

  const updateProfile = useCallback(
    async (patch: Partial<Pick<ProfileRecord, "display_name" | "avatar_url" | "bio" | "preferences">>) => {
      if (!userId || isDemo) {
        return { error: new Error("Cannot update profile in demo mode") };
      }

      // Optimistic cache update
      const prev = queryClient.getQueryData<ProfileRecord | null>(["profile", userId, isDemo]);
      if (prev) {
        queryClient.setQueryData(["profile", userId, isDemo], { ...prev, ...patch });
      }

      const { error } = await db
        .from("profiles")
        .update(patch)
        .eq("user_id", userId);

      if (error) {
        // Roll back on failure
        if (prev) queryClient.setQueryData(["profile", userId, isDemo], prev);
        return { error };
      }

      await refresh();
      return { error: null };
    },
    [userId, isDemo, queryClient, refresh],
  );

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refresh,
    updateProfile,
  };
}
