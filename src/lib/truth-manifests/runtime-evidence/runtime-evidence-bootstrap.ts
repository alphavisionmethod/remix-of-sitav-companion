// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Evidence Bootstrap
//
// Wires runtime evidence collection into the application boot
// sequence. After all kernel/userspace services have started, we
// run every collector and stash the resulting bundle on
// `window.__SITA_RUNTIME_EVIDENCE__` so that:
//
//   1. The Manifest Truth Dashboard (Phase 5) can render it live.
//   2. E2E test harnesses can scrape it post-boot to write
//      `generated/runtime-evidence-bundle.json` for CI gates.
//
// This module has zero side-effects until `bootstrapRuntimeEvidence`
// is called explicitly.
// ═══════════════════════════════════════════════════════════════

import { runAllCollectors } from "./runtime-evidence-registry";
import type { RuntimeEvidenceBundle } from "./runtime-evidence-types";

const WINDOW_KEY = "__SITA_RUNTIME_EVIDENCE__";

declare global {
  interface Window {
    __SITA_RUNTIME_EVIDENCE__?: RuntimeEvidenceBundle;
  }
}

let bootstrapped = false;
let lastBundle: RuntimeEvidenceBundle | null = null;

/**
 * Run all collectors once and publish the bundle on `window`.
 * Safe to call multiple times — subsequent calls refresh the bundle.
 */
export async function bootstrapRuntimeEvidence(): Promise<RuntimeEvidenceBundle> {
  const bundle = await runAllCollectors();
  lastBundle = bundle;
  if (typeof window !== "undefined") {
    window[WINDOW_KEY] = bundle;
  }
  bootstrapped = true;
  return bundle;
}

/** Read the most recently captured bundle (in-memory). */
export function getLastEvidenceBundle(): RuntimeEvidenceBundle | null {
  if (lastBundle) return lastBundle;
  if (typeof window !== "undefined" && window[WINDOW_KEY]) {
    return window[WINDOW_KEY] ?? null;
  }
  return null;
}

/** Whether `bootstrapRuntimeEvidence` has been invoked at least once. */
export function isRuntimeEvidenceBootstrapped(): boolean {
  return bootstrapped;
}
