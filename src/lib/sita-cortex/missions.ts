// ═══════════════════════════════════════════════════════════════
// SITA OS — Missions: long-horizon goals (Phase G)
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface SitaMission {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  domain: string;
  success_criteria: Record<string, unknown>;
  status: "active" | "paused" | "achieved" | "abandoned";
  priority: number;
  target_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SitaMilestone {
  id: string;
  mission_id: string;
  user_id: string;
  title: string;
  status: "pending" | "in_progress" | "done" | "skipped";
  due_at?: string | null;
  plan_id?: string | null;
  ordering: number;
  created_at: string;
  updated_at: string;
}

export async function listMissions(userId: string): Promise<SitaMission[]> {
  const { data, error } = await supabase
    .from("sita_missions" as never)
    .select("*")
    .eq("user_id", userId)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SitaMission[];
}

export async function listMilestones(missionId: string): Promise<SitaMilestone[]> {
  const { data, error } = await supabase
    .from("sita_mission_milestones" as never)
    .select("*")
    .eq("mission_id", missionId)
    .order("ordering", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as SitaMilestone[];
}

export async function createMission(input: {
  user_id: string;
  title: string;
  description?: string;
  domain?: string;
  success_criteria?: Record<string, unknown>;
  target_at?: string | null;
  priority?: number;
}): Promise<SitaMission> {
  const { data, error } = await supabase
    .from("sita_missions" as never)
    .insert({
      user_id: input.user_id,
      title: input.title,
      description: input.description ?? null,
      domain: input.domain ?? "general",
      success_criteria: input.success_criteria ?? {},
      target_at: input.target_at ?? null,
      priority: input.priority ?? 3,
    } as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as SitaMission;
}

/** Lightweight client-side decomposition — splits a mission into 3-5 starter milestones. */
export function decomposeMissionLocally(title: string): string[] {
  const lower = title.toLowerCase();
  if (lower.includes("close") || lower.includes("revenue")) {
    return [
      "Audit current pipeline & cash position",
      "Identify top 3 deals to accelerate",
      "Draft outreach for stalled leads",
      "Weekly cash forecast",
      "Final-week push checklist",
    ];
  }
  if (lower.includes("move") || lower.includes("relocate")) {
    return [
      "Set target date and budget",
      "Visa / paperwork checklist",
      "Housing shortlist",
      "Logistics & shipping plan",
      "Goodbye + onboarding week",
    ];
  }
  return [
    "Define success criteria",
    "Break into 3 phases",
    "First-week kickoff",
    "Weekly review checkpoint",
  ];
}

export async function seedMilestones(missionId: string, userId: string, titles: string[]): Promise<void> {
  if (titles.length === 0) return;
  const rows = titles.map((title, i) => ({
    mission_id: missionId,
    user_id: userId,
    title,
    ordering: i,
    status: "pending" as const,
  }));
  const { error } = await supabase.from("sita_mission_milestones" as never).insert(rows as never);
  if (error) throw error;
}