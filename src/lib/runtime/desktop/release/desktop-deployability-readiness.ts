// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Deployability Readiness Registry
// Phase 14 — the 11-item Desktop Host / Electron checklist as data.
// Mirrors the iOS/Android/Web pattern.
// ═══════════════════════════════════════════════════════════════

export type DesktopReadinessStatus = "ready" | "partial" | "deferred" | "missing";

export interface DesktopReadinessItem {
  readonly id: string;
  readonly title: string;
  readonly status: DesktopReadinessStatus;
  readonly evidence: string;
  readonly blocker: boolean;
  readonly remediation?: string;
}

export const DESKTOP_DEPLOYABILITY_READINESS: ReadonlyArray<DesktopReadinessItem> = [
  {
    id: "desktop-runtime-contract",
    title: "Electron runtime contract exists",
    status: "ready",
    evidence:
      "src/lib/runtime/desktop/desktop-host-contract.ts — 12 privileges, deployment assumptions (electron>=28, sandbox=true, contextIsolation=true), exclusive vs shared feature lists.",
    blocker: true,
  },
  {
    id: "desktop-preload-bridge-typed",
    title: "Preload bridge is typed and minimal",
    status: "ready",
    evidence:
      "electron/preload.cjs (22 methods) ↔ src/lib/runtime/desktop/electron-bridge-contract.ts BRIDGE_METHOD_REGISTRY (22 entries) — exact 1:1 cross-validation.",
    blocker: true,
  },
  {
    id: "desktop-bridge-isolation",
    title: "Native privileges only flow through approved bridge",
    status: "ready",
    evidence:
      "contextIsolation=true + sandbox=true + nodeIntegration=false in electron/main.cjs webPreferences. Renderer pages forbidden from importing electron/* directly.",
    blocker: true,
  },
  {
    id: "desktop-fs-bridge-permissioned",
    title: "File-system bridge is explicit and permissioned",
    status: "ready",
    evidence:
      "electron/fs-bridge.cjs — dialog-gated user consent, allowlist of file extensions, 50MB read cap, sandboxed userData/backups directory.",
    blocker: true,
  },
  {
    id: "desktop-auto-updater",
    title: "Auto-updater works or is clearly disabled",
    status: "ready",
    evidence:
      "electron/auto-updater.cjs — graceful fallback when electron-updater missing, manual feed via SITA_UPDATE_URL, full lifecycle in desktop-update-contract.ts.",
    blocker: false,
  },
  {
    id: "desktop-crash-reporting",
    title: "Crash reporting works",
    status: "ready",
    evidence:
      "electron/crash-reporter.cjs — crashReporter.start, captures unhandledRejection / uncaughtException / render-process-gone, persists JSON dumps to userData/crash-reports/.",
    blocker: true,
  },
  {
    id: "desktop-native-notifications",
    title: "Native notifications work",
    status: "ready",
    evidence:
      "electron/main.cjs — Notification.isSupported() gate + send-notification IPC channel; preload exposes sendNotification(title, body).",
    blocker: false,
  },
  {
    id: "desktop-os-shell-truthful",
    title: "OS shell features are truthfully scoped",
    status: "ready",
    evidence:
      "DESKTOP_HOST_CONTRACT enumerates 12 privileges, DESKTOP_EXCLUSIVE_FEATURES (10) vs DESKTOP_WEB_SHARED_FEATURES (2) cleanly separated; no over-claim of OS authority (Tier 2, not honest OS).",
    blocker: true,
  },
  {
    id: "desktop-release-pipeline",
    title: "Desktop-specific release/build pipeline exists",
    status: "ready",
    evidence:
      "scripts/release/desktop/build-electron.sh + electron/forge.config.cjs — cross-platform packaging via @electron/packager (linux/darwin/win32, x64/arm64).",
    blocker: true,
  },
  {
    id: "desktop-fallbacks-handled",
    title: "Unsupported web-only/native-only mismatches are handled",
    status: "ready",
    evidence:
      "src/lib/runtime/desktop/desktop-fallbacks.ts — every desktop-exclusive capability declares a web fallback strategy (web-api / no-op / cloud-alternative / download-blob).",
    blocker: true,
  },
  {
    id: "desktop-signing-notarization",
    title: "App signing/notarization plan exists",
    status: "partial",
    evidence:
      "electron/forge.config.cjs declares osxSign, osxNotarize, windowsSign blocks driven by env (APPLE_IDENTITY, APPLE_ID, APPLE_PASSWORD, APPLE_TEAM_ID, CSC_LINK, CSC_KEY_PASSWORD). Signing is wired but requires real certificates at release time.",
    blocker: false,
    remediation:
      "Provision Apple Developer ID Application certificate + Windows EV/OV code signing certificate; populate APPLE_* and CSC_* env vars in release CI.",
  },
];

export interface DesktopReadinessSummary {
  surface: "desktop";
  total: number;
  ready: number;
  partial: number;
  deferred: number;
  missing: number;
  blockers: number;
  ok: boolean;
  items: ReadonlyArray<DesktopReadinessItem>;
}

export function desktopReadinessSummary(): DesktopReadinessSummary {
  const counts: Record<DesktopReadinessStatus, number> = { ready: 0, partial: 0, deferred: 0, missing: 0 };
  let blockers = 0;
  for (const it of DESKTOP_DEPLOYABILITY_READINESS) {
    counts[it.status]++;
    if (it.blocker && it.status !== "ready") blockers++;
  }
  return {
    surface: "desktop",
    total: DESKTOP_DEPLOYABILITY_READINESS.length,
    ready: counts.ready,
    partial: counts.partial,
    deferred: counts.deferred,
    missing: counts.missing,
    blockers,
    ok: counts.missing === 0 && blockers === 0,
    items: DESKTOP_DEPLOYABILITY_READINESS,
  };
}
