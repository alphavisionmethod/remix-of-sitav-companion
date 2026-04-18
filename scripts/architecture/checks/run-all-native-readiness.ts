/* eslint-disable no-console */
// SITA OS — Aggregator: runs all 8 Ubuntu-native readiness gates.
import { spawnSync } from "node:child_process";

const checks = [
  ["build-pipeline", "scripts/architecture/checks/check-os-build-pipeline.ts"],
  ["trust-chain", "scripts/architecture/checks/check-os-trust-chain-readiness.ts"],
  ["update", "scripts/architecture/checks/check-os-update-readiness.ts"],
  ["recovery", "scripts/architecture/checks/check-os-recovery-readiness.ts"],
  ["electron-shell", "scripts/architecture/checks/check-electron-shell-session-readiness.ts"],
  ["qemu-vm", "scripts/architecture/checks/check-qemu-vm-readiness.ts"],
  ["support-bundle", "scripts/architecture/checks/check-os-support-bundle-readiness.ts"],
  ["observability", "scripts/architecture/checks/check-native-observability-readiness.ts"],
];

let failures = 0;
for (const [name, script] of checks) {
  console.log(`\n── ${name} ──`);
  const r = spawnSync("npx", ["tsx", script], { stdio: "inherit" });
  if (r.status !== 0) failures++;
}

console.log(`\n${failures === 0 ? "✅ All 8 native readiness gates passed" : `❌ ${failures}/${checks.length} gates failed`}`);
process.exit(failures === 0 ? 0 : 1);
