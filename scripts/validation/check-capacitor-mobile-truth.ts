// SITA OS — Capacitor mobile truth validator
// Asserts Capacitor 6 is the active mobile wrapper across capacitor.config.ts,
// package.json deps, infra/deploy/mobile.yaml, and that no forbidden alternative
// stacks (RN, Expo, NativeScript, Xamarin, Cordova-standalone) are present.
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];
const FORBIDDEN_DEPS = [
  /^react-native/,
  /^expo$/,
  /^expo-/,
  /^@expo\//,
  /^nativescript/,
  /^@nativescript\//,
  /^@xamarin\//,
  // standalone cordova (not the @capacitor/* compat shim)
  /^cordova$/,
  /^cordova-/,
];

// 1. capacitor.config.ts present
if (!existsSync("capacitor.config.ts")) {
  issues.push({ severity: "error", area: "stack", message: "capacitor.config.ts missing — Capacitor must be active wrapper" });
}

// 2. package.json must declare @capacitor/core, /cli, /ios, /android at major 6
if (!existsSync("package.json")) {
  issues.push({ severity: "error", area: "stack", message: "package.json missing" });
} else {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const required = ["@capacitor/core", "@capacitor/cli", "@capacitor/ios", "@capacitor/android"];
  for (const r of required) {
    if (!allDeps[r]) {
      issues.push({ severity: "error", area: "deps", message: `Required Capacitor dep missing: ${r}` });
    } else {
      const ver = String(allDeps[r]);
      const major = ver.match(/(\d+)/)?.[1];
      if (major && parseInt(major, 10) < 6) {
        issues.push({ severity: "error", area: "version", message: `${r} declared as ${ver} — canonical is major 6+` });
      }
    }
  }
  // Forbidden alternative stacks
  for (const dep of Object.keys(allDeps)) {
    for (const pattern of FORBIDDEN_DEPS) {
      if (pattern.test(dep)) {
        issues.push({ severity: "error", area: "alt-stack", message: `Forbidden alternative mobile stack dep: ${dep}` });
      }
    }
  }
}

// 3. infra/deploy/mobile.yaml must declare stack: capacitor
if (existsSync("infra/deploy/mobile.yaml")) {
  const y = readFileSync("infra/deploy/mobile.yaml", "utf8");
  if (!/stack:\s*capacitor/i.test(y)) {
    issues.push({ severity: "error", area: "manifest", message: "infra/deploy/mobile.yaml must declare 'stack: capacitor'" });
  }
  if (!/capacitor:\s*\n\s*version:\s*"?6/i.test(y)) {
    issues.push({ severity: "error", area: "manifest", message: "infra/deploy/mobile.yaml must declare capacitor.version: 6" });
  }
}

// 4. MOBILE_MANIFEST.md must declare Capacitor canonical
if (existsSync("src/planes/MOBILE_MANIFEST.md")) {
  const m = readFileSync("src/planes/MOBILE_MANIFEST.md", "utf8");
  if (!/Canonical stack:\s*Capacitor/i.test(m)) {
    issues.push({ severity: "error", area: "manifest", message: "src/planes/MOBILE_MANIFEST.md must declare 'Canonical stack: Capacitor'" });
  }
}

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "capacitor-mobile-truth",
  ok,
  issues,
  extra: { canonicalWrapper: "Capacitor 6", forbiddenStackPatterns: FORBIDDEN_DEPS.length },
});
console.log(`capacitor-mobile-truth: ${ok ? "GREEN" : "RED"} (${errors} errors)`);
process.exit(ok ? 0 : 1);
