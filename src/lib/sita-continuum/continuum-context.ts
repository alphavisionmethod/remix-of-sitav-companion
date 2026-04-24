// ═══════════════════════════════════════════════════════════════
// SITA OS — Continuum Context (Phase J)
// ═══════════════════════════════════════════════════════════════
// Single, low-overhead read API that gives every Sita surface a
// coherent picture of "where we are right now": current episode,
// recent affect mood, last consolidation, and a derived focus
// quality score. Cached in-memory + 30s refresh.
// ═══════════════════════════════════════════════════════════════

import { listRecentEpisodes, readOpenEpisode, type SitaEpisode } from "./episode-tracker";
import { summarizeAffect } from "./affect-loop";

export interface ContinuumSnapshot {
  open_episode: ReturnType<typeof readOpenEpisode>;
  recent_episodes: SitaEpisode[];
  affect_net_72h: number;
  affect_total_72h: number;
  focus_quality: number; // 0..1 derived
  last_refreshed_at: string;
}

const REFRESH_MS = 30_000;
let snapshot: ContinuumSnapshot | null = null;
let lastRefreshAt = 0;
let inflight: Promise<ContinuumSnapshot> | null = null;
const listeners = new Set<(snap: ContinuumSnapshot) => void>();

function emit() {
  if (!snapshot) return;
  for (const l of listeners) try { l(snapshot); } catch { /* noop */ }
}

export function subscribeContinuum(fn: (snap: ContinuumSnapshot) => void): () => void {
  listeners.add(fn);
  if (snapshot) try { fn(snapshot); } catch { /* noop */ }
  return () => listeners.delete(fn);
}

export async function refreshContinuum(uid: string, force = false): Promise<ContinuumSnapshot> {
  if (!force && snapshot && Date.now() - lastRefreshAt < REFRESH_MS) return snapshot;
  if (inflight) return inflight;
  inflight = (async () => {
    const [recent, affect] = await Promise.all([
      listRecentEpisodes(uid, 8).catch(() => [] as SitaEpisode[]),
      summarizeAffect(uid, 72).catch(() => ({ byKind: {}, total: 0 })),
    ]);
    const open = readOpenEpisode();
    const totalNet = Object.values(affect.byKind).reduce((s, b) => s + b.net, 0);
    // Focus quality: blend of open-episode density + recent positive affect
    const openDensity = open ? Math.min(1, open.signals / Math.max(1, open.ageMs / 60000)) : 0.4;
    const affectBoost = Math.max(-0.3, Math.min(0.3, totalNet / 20));
    const focusQuality = Math.max(0, Math.min(1, 0.5 + (openDensity - 0.5) * 0.6 + affectBoost));
    snapshot = {
      open_episode: open,
      recent_episodes: recent,
      affect_net_72h: totalNet,
      affect_total_72h: affect.total,
      focus_quality: focusQuality,
      last_refreshed_at: new Date().toISOString(),
    };
    lastRefreshAt = Date.now();
    emit();
    return snapshot;
  })();
  try { return await inflight; }
  finally { inflight = null; }
}

export function readContinuum(): ContinuumSnapshot | null { return snapshot; }