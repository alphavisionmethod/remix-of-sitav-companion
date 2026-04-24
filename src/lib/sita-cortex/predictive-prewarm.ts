// ═══════════════════════════════════════════════════════════════
// SITA OS — Predictive Pre-Warm (Phase G)
// ═══════════════════════════════════════════════════════════════
// Tiny on-device Markov over the last 200 launches → suggests the
// next likely app-id given the current one.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

type LaunchRow = { app_id: string; opened_at: string };

let recent: LaunchRow[] = [];
let model: Map<string, Map<string, number>> = new Map();
let loadedFor: string | null = null;

export async function loadPrewarmModel(userId: string) {
  if (loadedFor === userId) return;
  loadedFor = userId;
  try {
    const { data } = await supabase
      .from("sita_app_open_log" as never)
      .select("app_id, opened_at")
      .eq("user_id", userId)
      .order("opened_at", { ascending: false })
      .limit(200);
    recent = (data ?? []) as unknown as LaunchRow[];
    rebuild();
  } catch (err) {
    console.warn("[prewarm] load failed", err);
  }
}

function rebuild() {
  model = new Map();
  // Iterate oldest → newest so transitions are forward in time.
  const seq = [...recent].reverse();
  for (let i = 0; i < seq.length - 1; i++) {
    const from = seq[i].app_id;
    const to = seq[i + 1].app_id;
    if (from === to) continue;
    if (!model.has(from)) model.set(from, new Map());
    const row = model.get(from)!;
    row.set(to, (row.get(to) ?? 0) + 1);
  }
}

export function predictNext(currentAppId: string): { appId: string; confidence: number } | null {
  const row = model.get(currentAppId);
  if (!row || row.size === 0) return null;
  let best: [string, number] | null = null;
  let total = 0;
  for (const [k, v] of row) {
    total += v;
    if (!best || v > best[1]) best = [k, v];
  }
  if (!best || total === 0) return null;
  return { appId: best[0], confidence: best[1] / total };
}

export async function recordAppOpen(userId: string, appId: string) {
  try {
    await supabase.from("sita_app_open_log" as never).insert({ user_id: userId, app_id: appId } as never);
    recent.unshift({ app_id: appId, opened_at: new Date().toISOString() });
    if (recent.length > 200) recent.pop();
    rebuild();
  } catch { /* noop */ }
}