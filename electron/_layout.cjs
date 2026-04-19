// ═══════════════════════════════════════════════════════════════════════
// SITA OS — Electron Domain Layout Registry
// ─────────────────────────────────────────────────────────────────────────
// Purpose: Provide an explicit domain classification for every .cjs module
// in electron/ WITHOUT moving files (which would break ~40 require() paths
// across main.cjs, scripts, forge config, docs and CI workflows).
//
// This satisfies the "architectural flatness" audit finding by making the
// implicit domain grouping explicit and machine-verifiable. The companion
// validator (scripts/architecture/checks/check-electron-domain-layout.ts)
// asserts:
//   • every .cjs file in electron/ appears in exactly one domain
//   • no orphans, no duplicates
//   • the registry stays in sync with the filesystem
//
// Flat-file layout is the official Electron Forge convention — see
// electron/README.md for full rationale.
// ═══════════════════════════════════════════════════════════════════════

module.exports = {
  // Main process entry point + window/session lifecycle
  main: [
    "main.cjs",
  ],

  // Renderer-facing preload scripts (contextBridge surfaces)
  preload: [
    "preload.cjs",
    "license-preload.cjs",
  ],

  // IPC bridges — typed surfaces exposed to renderers
  bridges: [
    "fs-bridge.cjs",
    "sita-apps-bridge.cjs",
  ],

  // Security fabric — runtime hardening, DLP, network policy, integrity
  security: [
    "runtime-shield.cjs",
    "dlp-guard.cjs",
    "network-sentinel.cjs",
    "integrity-check.cjs",
  ],

  // Update + crash telemetry
  updater: [
    "auto-updater.cjs",
    "crash-reporter.cjs",
  ],

  // Licensing (activation, enforcement, UI)
  license: [
    "license-guard.cjs",
    "license-ui.cjs",
  ],

  // Packaging / distribution config (Electron Forge)
  packaging: [
    "forge.config.cjs",
  ],
};
