// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Persistence Hooks
// React hooks for intelligence assets, quality floors,
// compute governance, and operator taste persistence
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import {
  fetchIntelligenceAssets,
  createIntelligenceAsset,
  getAssetStats,
  type IntelligenceAssetRow,
} from "@/data/persistence/intelligence-asset-persistence";
import {
  fetchQualityFloors,
  upsertQualityFloor,
  type QualityFloorConfigRow,
} from "@/data/persistence/quality-floor-persistence";
import {
  fetchComputeSnapshots,
  getLatestSnapshot,
  createComputeSnapshot,
  type ComputeBudgetSnapshotRow,
} from "@/data/persistence/compute-governance-persistence";
import {
  fetchTasteProfiles,
  upsertTasteProfile,
  type OperatorTasteRow,
} from "@/data/persistence/operator-taste-persistence";

// ── Intelligence Assets ─────────────────────────────────────────
export function useIntelligenceAssets(filters?: { domain?: string; asset_type?: string }) {
  const [assets, setAssets] = useState<IntelligenceAssetRow[]>([]);
  const [stats, setStats] = useState({ total: 0, totalReuses: 0, totalCostAvoided: 0, invalidatedCount: 0, avgFreshness: 0 });
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [fetched, s] = await Promise.all([
      fetchIntelligenceAssets({ ...filters, invalidated: false, limit: 200 }),
      getAssetStats(),
    ]);
    setAssets(fetched);
    setStats(s);
    setLoading(false);
  }, [filters?.domain, filters?.asset_type]);

  useEffect(() => { reload(); }, [reload]);

  const create = useCallback(
    async (asset: Parameters<typeof createIntelligenceAsset>[0]) => {
      const created = await createIntelligenceAsset(asset);
      if (created) await reload();
      return created;
    },
    [reload],
  );

  return { assets, stats, loading, reload, create };
}

// ── Quality Floors ──────────────────────────────────────────────
export function useQualityFloors() {
  const [floors, setFloors] = useState<QualityFloorConfigRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setFloors(await fetchQualityFloors());
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const upsert = useCallback(
    async (config: Parameters<typeof upsertQualityFloor>[0]) => {
      const result = await upsertQualityFloor(config);
      if (result) await reload();
      return result;
    },
    [reload],
  );

  return { floors, loading, reload, upsert };
}

// ── Compute Governance Snapshots ────────────────────────────────
export function useComputeSnapshots(opts?: { period?: string; domain?: string; limit?: number }) {
  const [snapshots, setSnapshots] = useState<ComputeBudgetSnapshotRow[]>([]);
  const [latest, setLatest] = useState<ComputeBudgetSnapshotRow | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [fetched, lat] = await Promise.all([
      fetchComputeSnapshots(opts),
      getLatestSnapshot(opts?.domain),
    ]);
    setSnapshots(fetched);
    setLatest(lat);
    setLoading(false);
  }, [opts?.period, opts?.domain, opts?.limit]);

  useEffect(() => { reload(); }, [reload]);

  const create = useCallback(
    async (snapshot: Parameters<typeof createComputeSnapshot>[0]) => {
      const created = await createComputeSnapshot(snapshot);
      if (created) await reload();
      return created;
    },
    [reload],
  );

  return { snapshots, latest, loading, reload, create };
}

// ── Operator Taste Profiles ─────────────────────────────────────
export function useOperatorTaste() {
  const [profiles, setProfiles] = useState<OperatorTasteRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setProfiles(await fetchTasteProfiles());
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const upsert = useCallback(
    async (key: string, value: Record<string, unknown>, learnedFrom?: string, confidence?: number) => {
      const result = await upsertTasteProfile(key, value, learnedFrom, confidence);
      if (result) await reload();
      return result;
    },
    [reload],
  );

  return { profiles, loading, reload, upsert };
}
