// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Validator: Boot Chain Check
// Verifies boot chain contracts have service implementations,
// services are wired to the shell, and native configs are present
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(process.cwd());
const errors: string[] = [];

function check(label: string, condition: boolean) {
  if (!condition) errors.push(label);
}

function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function fileContains(rel: string, needle: string): boolean {
  if (!fileExists(rel)) return false;
  return fs.readFileSync(path.join(ROOT, rel), "utf-8").includes(needle);
}

// ── Boot chain contracts ────────────────────────────────────────
check(
  "TrustedBootSequence contract exists",
  fileExists("src/packages/contracts/runtime/trusted-boot-runtime.ts")
);
check(
  "BootPhaseRecord defined",
  fileContains("src/packages/contracts/runtime/trusted-boot-runtime.ts", "BootPhaseRecord")
);

// ── Boot persistence service ────────────────────────────────────
check(
  "Boot persistence service exists",
  fileExists("src/lib/services/boot-persistence/index.ts")
);
check(
  "Boot persistence writes to boot_phase_logs",
  fileContains("src/lib/services/boot-persistence/index.ts", "boot_phase_logs")
);

// ── Surface detection ───────────────────────────────────────────
check(
  "Surface detection service exists",
  fileExists("src/lib/services/surface-detection/index.ts")
);
check(
  "detectSurfaceType exported",
  fileContains("src/lib/services/surface-detection/index.ts", "detectSurfaceType")
);
check(
  "useSurfaceType hook exported",
  fileContains("src/lib/services/surface-detection/index.ts", "useSurfaceType")
);
check(
  "getDeviceId exported",
  fileContains("src/lib/services/surface-detection/index.ts", "getDeviceId")
);

// ── Cross-surface services ──────────────────────────────────────
check(
  "Handoff service exists",
  fileExists("src/lib/services/handoff/index.ts")
);
check(
  "Session resume service exists",
  fileExists("src/lib/services/session-resume/index.ts")
);
check(
  "Offline queue service exists",
  fileExists("src/lib/services/offline-queue/index.ts")
);

// ── OS Unification ──────────────────────────────────────────────
check(
  "OSUnificationService exists",
  fileExists("src/lib/services/os-unification/index.ts")
);
check(
  "OSUnificationRuntime contract exists",
  fileExists("src/packages/contracts/runtime/os-unification-runtime.ts")
);

// ── Handoff/continuity contracts ────────────────────────────────
check(
  "HandoffPacket contract exists",
  fileExists("src/packages/contracts/graph/handoff-packet.ts")
);
check(
  "SessionResumeToken contract exists",
  fileExists("src/packages/contracts/graph/session-resume-token.ts")
);
check(
  "ContinuityFabric contract exists",
  fileExists("src/packages/contracts/graph/continuity-fabric.ts")
);

// ── Electron native bridge ──────────────────────────────────────
check(
  "Electron main.cjs exists",
  fileExists("electron/main.cjs")
);
check(
  "Electron preload.cjs exists",
  fileExists("electron/preload.cjs")
);
check(
  "Electron IPC contract exists",
  fileExists("src/packages/contracts/native/electron-ipc.ts")
);
check(
  "useElectronBridge hook exists",
  fileExists("src/hooks/useElectronBridge.ts")
);
check(
  "Electron preload uses contextBridge",
  fileContains("electron/preload.cjs", "contextBridge")
);
check(
  "Electron main has IPC handlers",
  fileContains("electron/main.cjs", "ipcMain.handle")
);
check(
  "Electron main has deep link support",
  fileContains("electron/main.cjs", "setAsDefaultProtocolClient")
);
check(
  "Electron main has system tray",
  fileContains("electron/main.cjs", "Tray")
);
check(
  "Electron main has native menu",
  fileContains("electron/main.cjs", "Menu.buildFromTemplate")
);

// ── Shell wiring ────────────────────────────────────────────────
check(
  "ShellLayout imports ContinuityBanner",
  fileContains("src/components/sita/ShellLayout.tsx", "ContinuityBanner")
);
check(
  "ShellLayout imports PWAInstallPrompt",
  fileContains("src/components/sita/ShellLayout.tsx", "PWAInstallPrompt")
);
check(
  "PWAInstallPrompt component exists",
  fileExists("src/components/sita/PWAInstallPrompt.tsx")
);
check(
  "ContinuityBanner component exists",
  fileExists("src/components/sita/ContinuityBanner.tsx")
);

// ── Boot → Device Trust bridge ──────────────────────────────────
check(
  "OSSetupExperience calls TrustDeviceEngine",
  fileContains("src/components/sita/OSSetupExperience.tsx", "TrustDeviceEngine")
);
check(
  "OSSetupExperience persists device to device_statuses",
  fileContains("src/components/sita/OSSetupExperience.tsx", "device_statuses")
);
check(
  "OSSetupExperience persists boot phase logs",
  fileContains("src/components/sita/OSSetupExperience.tsx", "getBootPersistenceService")
);

// ── Report ──────────────────────────────────────────────────────
if (errors.length > 0) {
  console.error(`\n❌ Boot chain check: ${errors.length} failures\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
} else {
  console.log("✅ Boot chain check passed — all contracts, services, and wiring verified");
}
