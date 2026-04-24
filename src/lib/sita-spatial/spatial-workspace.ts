// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase F: Spatial Workspace
// Per-user depth/Z layout for windows. Persisted to
// `sita_spatial_layout` (one row per user).
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface SpatialWindowEntry {
  windowId: string;
  z: number; // -1 (far) … +1 (near)
  parallax: number; // 0..1
  x?: number;
  y?: number;
}

export interface SpatialLayout {
  version: number;
  active: boolean;
  windows: Record<string, SpatialWindowEntry>;
}

export const EMPTY_LAYOUT: SpatialLayout = { version: 1, active: false, windows: {} };

const LOCAL_KEY = "sita_spatial_layout_v1";

export function readLocalLayout(): SpatialLayout {
  if (typeof localStorage === "undefined") return EMPTY_LAYOUT;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return EMPTY_LAYOUT;
    const parsed = JSON.parse(raw) as SpatialLayout;
    return { ...EMPTY_LAYOUT, ...parsed };
  } catch {
    return EMPTY_LAYOUT;
  }
}

export function writeLocalLayout(layout: SpatialLayout): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(layout));
  } catch {
    /* quota */
  }
}

export async function loadRemoteLayout(): Promise<SpatialLayout | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("sita_spatial_layout")
    .select("layout")
    .eq("user_id", user.id)
    .maybeSingle();
  return (data?.layout as unknown as SpatialLayout) ?? null;
}

export async function saveRemoteLayout(layout: SpatialLayout): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("sita_spatial_layout")
    .upsert({ user_id: user.id, layout: layout as never }, { onConflict: "user_id" });
}

export function setWindowDepth(layout: SpatialLayout, windowId: string, z: number): SpatialLayout {
  const clampedZ = Math.max(-1, Math.min(1, z));
  return {
    ...layout,
    windows: {
      ...layout.windows,
      [windowId]: {
        windowId,
        z: clampedZ,
        parallax: Math.abs(clampedZ) * 0.4,
        ...layout.windows[windowId],
      },
    },
  };
}
