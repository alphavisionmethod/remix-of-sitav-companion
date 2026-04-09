// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Persistence Service
// Wraps release record CRUD with universal-service-persistence
// ═══════════════════════════════════════════════════════════════

import {
  loadServiceState,
  saveServiceState,
  debouncedSaveServiceState,
} from "@/lib/persistence/universal-service-persistence";
import type {
  ReleaseRecord,
  ReleasePromotionEvent,
  ReleaseRollbackEvent,
  ReleaseEvidenceChain,
  ReleaseStatus,
  ReleaseRing,
  RollbackReason,
} from "@/packages/contracts/domain-types/release-record";

const SERVICE_ID = "release-persistence";

interface ReleaseStoreState {
  releases: ReleaseRecord[];
  rollbackEvents: ReleaseRollbackEvent[];
  evidenceChains: ReleaseEvidenceChain[];
}

function emptyState(): ReleaseStoreState {
  return { releases: [], rollbackEvents: [], evidenceChains: [] };
}

let _cache: ReleaseStoreState | null = null;

async function getState(): Promise<ReleaseStoreState> {
  if (_cache) return _cache;
  const raw = await loadServiceState<ReleaseStoreState>(SERVICE_ID);
  _cache = raw ?? emptyState();
  return _cache;
}

function persist(state: ReleaseStoreState): void {
  _cache = state;
  debouncedSaveServiceState(SERVICE_ID, state as unknown as Record<string, unknown>);
}

// ── Public API ──────────────────────────────────────────────

export async function recordRelease(release: ReleaseRecord): Promise<void> {
  const state = await getState();
  const idx = state.releases.findIndex((r) => r.id === release.id);
  if (idx >= 0) {
    state.releases[idx] = release;
  } else {
    state.releases.push(release);
  }
  persist(state);
}

export async function promoteRelease(
  releaseId: string,
  event: ReleasePromotionEvent,
): Promise<boolean> {
  const state = await getState();
  const release = state.releases.find((r) => r.id === releaseId);
  if (!release) return false;

  release.ring = event.toRing;
  release.status = event.toStatus;
  release.promotionHistory.push(event);
  release.updatedAt = new Date().toISOString();
  persist(state);
  return true;
}

export async function rollbackRelease(
  releaseId: string,
  event: ReleaseRollbackEvent,
): Promise<boolean> {
  const state = await getState();
  const release = state.releases.find((r) => r.id === releaseId);
  if (!release) return false;

  release.status = "rolled-back";
  release.rollback = {
    rolledBackAt: event.initiatedAt,
    rolledBackBy: event.initiatedBy,
    reason: event.reason,
    rollbackToVersion: event.toVersion,
    impactSummary: `Affected ${event.impactAssessment.affectedUsers} users, ${event.impactAssessment.affectedServices.length} services`,
  };
  release.updatedAt = new Date().toISOString();
  state.rollbackEvents.push(event);
  persist(state);
  return true;
}

export async function getReleaseHistory(): Promise<ReleaseRecord[]> {
  const state = await getState();
  return [...state.releases].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getReleaseById(id: string): Promise<ReleaseRecord | null> {
  const state = await getState();
  return state.releases.find((r) => r.id === id) ?? null;
}

export async function getEvidenceForRelease(releaseId: string): Promise<ReleaseEvidenceChain | null> {
  const state = await getState();
  return state.evidenceChains.find((c) => c.releaseId === releaseId) ?? null;
}

export async function saveEvidenceChain(chain: ReleaseEvidenceChain): Promise<void> {
  const state = await getState();
  const idx = state.evidenceChains.findIndex((c) => c.releaseId === chain.releaseId);
  if (idx >= 0) {
    state.evidenceChains[idx] = chain;
  } else {
    state.evidenceChains.push(chain);
  }
  persist(state);
}

export async function getRollbackEvents(releaseId?: string): Promise<ReleaseRollbackEvent[]> {
  const state = await getState();
  if (releaseId) return state.rollbackEvents.filter((e) => e.releaseId === releaseId);
  return [...state.rollbackEvents];
}

/** Clear cached state (e.g. on auth change) */
export function clearReleaseCache(): void {
  _cache = null;
}
