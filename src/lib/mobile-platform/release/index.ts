// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Release Barrel (Phase 12)
// ═══════════════════════════════════════════════════════════════

export { IOS_APP_STORE_READINESS } from "./ios-app-store-readiness";
export { ANDROID_PLAY_STORE_READINESS } from "./android-play-store-readiness";
export type { ReadinessItem, ReadinessStatus } from "./ios-app-store-readiness";
export {
  MIN_OS_VERSION,
  checkMinOSVersion,
  detectOSVersion,
} from "./min-os-version-contract";
export type { MinOSVersion, OSVersionCheckResult } from "./min-os-version-contract";

import { IOS_APP_STORE_READINESS } from "./ios-app-store-readiness";
import { ANDROID_PLAY_STORE_READINESS } from "./android-play-store-readiness";
import type { ReadinessItem, ReadinessStatus } from "./ios-app-store-readiness";

export interface StoreReadinessSummary {
  surface: "ios" | "android";
  total: number;
  ready: number;
  partial: number;
  deferred: number;
  missing: number;
  blockers: number;
  ok: boolean;
  items: ReadonlyArray<ReadinessItem>;
}

function summarize(surface: "ios" | "android", items: ReadonlyArray<ReadinessItem>): StoreReadinessSummary {
  const counts: Record<ReadinessStatus, number> = { ready: 0, partial: 0, deferred: 0, missing: 0 };
  let blockers = 0;
  for (const it of items) {
    counts[it.status]++;
    if (it.blocker && it.status !== "ready") blockers++;
  }
  return {
    surface,
    total: items.length,
    ready: counts.ready,
    partial: counts.partial,
    deferred: counts.deferred,
    missing: counts.missing,
    blockers,
    ok: counts.missing === 0 && blockers === 0,
    items,
  };
}

export function iosReadinessSummary(): StoreReadinessSummary {
  return summarize("ios", IOS_APP_STORE_READINESS);
}

export function androidReadinessSummary(): StoreReadinessSummary {
  return summarize("android", ANDROID_PLAY_STORE_READINESS);
}

export function aggregateMobileReadiness(): { ok: boolean; ios: StoreReadinessSummary; android: StoreReadinessSummary } {
  const ios = iosReadinessSummary();
  const android = androidReadinessSummary();
  return { ok: ios.ok && android.ok, ios, android };
}
