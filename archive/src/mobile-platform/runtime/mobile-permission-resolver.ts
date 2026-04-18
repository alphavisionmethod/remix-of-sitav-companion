// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Permission Resolver
// Computes effective permission posture per OS + feature.
// ═══════════════════════════════════════════════════════════════

import type { MobileOS, MobilePermissionState } from "../contracts/mobile-platform-contract";
import { MOBILE_PERMISSION_MATRIX, type PermissionMatrixRow } from "../contracts/permission-matrix";

export interface PermissionResolution {
  permission: PermissionMatrixRow["permission"];
  os: MobileOS;
  state: MobilePermissionState;
  rationale: string;
  fallback: string;
  rerequestable: boolean;
}

/**
 * Stub state lookup — adapters override this in production by writing
 * to a shared state map. In web fallback, we return "prompt".
 */
const PERMISSION_STATE_CACHE = new Map<string, MobilePermissionState>();

export function setPermissionState(
  os: MobileOS,
  permission: PermissionMatrixRow["permission"],
  state: MobilePermissionState,
): void {
  PERMISSION_STATE_CACHE.set(`${os}:${permission}`, state);
}

export function resolveMobilePermission(
  permission: PermissionMatrixRow["permission"],
  os: MobileOS,
): PermissionResolution {
  const row = MOBILE_PERMISSION_MATRIX.find((r) => r.permission === permission)!;
  const state = PERMISSION_STATE_CACHE.get(`${os}:${permission}`) ?? "prompt";
  return {
    permission,
    os,
    state,
    rationale: row.rationale[os],
    fallback: row.denialFallback,
    rerequestable: row.rerequestable,
  };
}
