#!/usr/bin/env node
// Flagship Surface Closure — Onboarding Simulated Persona Disclosure (WARN-tier)
//
// HONEST DEFERRAL VALIDATOR
// Onboarding UI polish is out-of-admin-AI-engineering scope per user directive.
// This validator emits WARN-tier issues that explicitly cross-reference the
// deferral doc rather than fake-greening the surface.
//
// Future user-flagship-pass must convert these WARNs to PASS by building
// src/pages/onboarding/** with a centralized SimulatedPersonaBanner component.
//
// Source-of-truth deferral doc:
//   generated/flagship-surface-closure/ONBOARDING_WIRING_AUDIT.md
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "onboarding-simulated-persona-disclosure";
const issues: GateIssue[] = [];

// Canonical onboarding daemon module (index.ts inside the directory) is the
// source of truth — accept either a single-file or directory module layout.
const DAEMON_FILE = "src/lib/services/onboarding-daemon.ts";
const DAEMON_DIR = "src/lib/services/onboarding-daemon/index.ts";
const DAEMON = existsSync(DAEMON_FILE) ? DAEMON_FILE : DAEMON_DIR;
const HOOK = "src/hooks/useOnboardingDaemon.ts";
const DEFERRAL_DOC = "generated/flagship-surface-closure/ONBOARDING_WIRING_AUDIT.md";

// In-scope (admin AI): canonical hooks must exist and be wired.
if (!existsSync(DAEMON)) {
  issues.push({ severity: "error", area: "canonical-runtime", message: `Missing canonical onboarding daemon: ${DAEMON}` });
}
if (!existsSync(HOOK)) {
  issues.push({ severity: "error", area: "canonical-runtime", message: `Missing canonical onboarding hook: ${HOOK}` });
}

// Deferral marker: confirm deferral doc exists with explicit cross-reference.
if (!existsSync(DEFERRAL_DOC)) {
  issues.push({
    severity: "error",
    area: "deferral-marker",
    message: `Deferral doc missing — required for honest WARN classification: ${DEFERRAL_DOC}`,
  });
} else {
  const doc = readFileSync(DEFERRAL_DOC, "utf8");
  if (!doc.includes("DEFERRED") || !doc.includes("user-flagship-pass-required")) {
    issues.push({
      severity: "error",
      area: "deferral-marker",
      message: `Deferral doc lacks explicit DEFERRED + user-flagship-pass-required markers`,
    });
  }
}

// Honest WARN: out-of-scope user surface
const userOnboardingExists = existsSync("src/pages/onboarding");
if (!userOnboardingExists) {
  issues.push({
    severity: "warning",
    area: "user-flagship-deferred",
    message: `User onboarding screens (src/pages/onboarding/**) not present — DEFERRED to user-flagship-pass. See ${DEFERRAL_DOC}.`,
  });
  issues.push({
    severity: "warning",
    area: "simulated-persona-banner",
    message: `Centralized SimulatedPersonaBanner component not enforced — DEFERRED. Will be required when user surface is built.`,
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    classification: "honest-warn-deferred",
    deferralDoc: DEFERRAL_DOC,
    canonicalRuntime: { daemon: DAEMON, hook: HOOK },
    requiredForGreen: "user-flagship-pass: build src/pages/onboarding/** with SimulatedPersonaBanner",
  },
});
process.exit(ok ? 0 : 1);
