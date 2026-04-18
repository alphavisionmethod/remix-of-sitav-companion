// ═══════════════════════════════════════════════════════════════
// SITA OS — Deployability Registry
// Per-surface evidence of build/sign/distribute/update/recover.
// CI gate: scripts/architecture/checks/check-deployability-coverage.ts
// ═══════════════════════════════════════════════════════════════

import type {
  DeployabilityEntry,
  DeployabilityScore,
  DeployStage,
  DeployStageState,
} from "./deployability-types";
import type { SurfaceId } from "@/lib/reality/feature-reality-types";

export const DEPLOYABILITY_REGISTRY: readonly DeployabilityEntry[] = [
  {
    surface: "web",
    stages: [
      { stage: "build",       state: "ready", artifact: "vite.config.ts" },
      { stage: "sign",        state: "ready", artifact: "infra/deploy/product-shell.yaml", notes: "TLS via hosting" },
      { stage: "distribute",  state: "ready", artifact: "infra/deploy/product-shell.yaml" },
      { stage: "update",      state: "ready", artifact: "vite.config.ts", notes: "SPA atomic deploy" },
      { stage: "recover",     state: "ready", artifact: "scripts/release/iso/sita-backup.sh" },
    ],
  },
  {
    surface: "electron",
    stages: [
      { stage: "build",       state: "ready", artifact: "src/lib/runtime/desktop" },
      { stage: "sign",        state: "partial", artifact: "src/lib/runtime/desktop", notes: "Code-signing certificates required at packaging time" },
      { stage: "distribute",  state: "ready", artifact: "src/lib/runtime/desktop" },
      { stage: "update",      state: "ready", artifact: "src/lib/runtime/desktop", notes: "DesktopUpdateContract" },
      { stage: "recover",     state: "ready", artifact: "scripts/release/iso/sita-backup.sh" },
    ],
  },
  {
    surface: "appliance",
    stages: [
      { stage: "build",       state: "ready", artifact: "scripts/release/vmware/generate-vmware-iso-image.ts" },
      { stage: "sign",        state: "ready", artifact: "scripts/release/vmware/emit-vmware-supply-chain-tier.ts" },
      { stage: "distribute",  state: "ready", artifact: "scripts/release/vmware/build-ova.sh" },
      { stage: "update",      state: "ready", artifact: "scripts/release/iso/sita-ota-agent.sh" },
      { stage: "recover",     state: "ready", artifact: "scripts/release/iso/sita-backup.sh" },
    ],
  },
  {
    surface: "ios",
    stages: [
      { stage: "build",       state: "ready", artifact: "infra/deploy/mobile.yaml" },
      { stage: "sign",        state: "deferred", artifact: "infra/deploy/mobile.yaml", notes: "Awaiting Apple Developer membership" },
      { stage: "distribute",  state: "deferred", artifact: "infra/deploy/mobile.yaml", notes: "App Store deferred" },
      { stage: "update",      state: "ready", artifact: "infra/deploy/mobile.yaml", notes: "Capacitor live-reload + OTA-bundle" },
      { stage: "recover",     state: "ready", artifact: "src/runtimes/mobile/index.ts", notes: "Offline sync queue + reset" },
    ],
  },
  {
    surface: "android",
    stages: [
      { stage: "build",       state: "ready", artifact: "infra/deploy/mobile.yaml" },
      { stage: "sign",        state: "ready", artifact: "infra/deploy/mobile.yaml", notes: "Keystore wired via env" },
      { stage: "distribute",  state: "ready", artifact: "infra/deploy/mobile.yaml" },
      { stage: "update",      state: "ready", artifact: "infra/deploy/mobile.yaml" },
      { stage: "recover",     state: "ready", artifact: "src/runtimes/mobile/index.ts" },
    ],
  },
  {
    surface: "mobile-pwa",
    stages: [
      { stage: "build",       state: "ready", artifact: "vite.config.ts" },
      { stage: "sign",        state: "ready", artifact: "infra/deploy/product-shell.yaml", notes: "TLS only" },
      { stage: "distribute",  state: "ready", artifact: "infra/deploy/product-shell.yaml" },
      { stage: "update",      state: "ready", artifact: "vite.config.ts", notes: "Service worker fast updates" },
      { stage: "recover",     state: "ready", artifact: "src/runtimes/mobile/index.ts" },
    ],
  },
  {
    surface: "admin",
    stages: [
      { stage: "build",       state: "ready", artifact: "infra/deploy/admin-console.yaml" },
      { stage: "sign",        state: "ready", artifact: "infra/deploy/admin-console.yaml" },
      { stage: "distribute",  state: "ready", artifact: "infra/deploy/admin-console.yaml" },
      { stage: "update",      state: "ready", artifact: "infra/deploy/admin-console.yaml" },
      { stage: "recover",     state: "ready", artifact: "scripts/release/iso/sita-backup.sh" },
    ],
  },
];

const STAGE_WEIGHT: Record<DeployStageState, number> = {
  ready: 1,
  partial: 0.5,
  deferred: 0.5, // honest defer counts half — implementation gap, not architecture gap
  missing: 0,
};

export function scoreDeployability(surface: SurfaceId): DeployabilityScore {
  const entry = DEPLOYABILITY_REGISTRY.find((d) => d.surface === surface);
  if (!entry) {
    return {
      surface,
      score: 0,
      readyStages: 0,
      totalStages: 5,
      blockers: ["surface-not-registered"],
    };
  }
  let weighted = 0;
  let ready = 0;
  const blockers: string[] = [];
  for (const s of entry.stages) {
    weighted += STAGE_WEIGHT[s.state];
    if (s.state === "ready") ready++;
    if (s.state === "missing" || s.state === "partial") {
      blockers.push(`${s.stage}:${s.state}`);
    }
  }
  const score = Math.round((weighted / entry.stages.length) * 100);
  return {
    surface,
    score,
    readyStages: ready,
    totalStages: entry.stages.length,
    blockers,
  };
}

export function allDeployabilityScores(): readonly DeployabilityScore[] {
  return DEPLOYABILITY_REGISTRY.map((e) => scoreDeployability(e.surface));
}

export function deployabilityHealth(): {
  surfaces: number;
  averageScore: number;
  blockedSurfaces: number;
} {
  const scores = allDeployabilityScores();
  const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const blocked = scores.filter((s) => s.score < 80).length;
  return {
    surfaces: scores.length,
    averageScore: Math.round(avg),
    blockedSurfaces: blocked,
  };
}
