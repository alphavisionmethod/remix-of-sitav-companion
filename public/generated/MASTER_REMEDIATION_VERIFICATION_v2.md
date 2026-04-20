# SITA OS — Master Remediation Verification v2

**Companion to:** `MASTER_REMEDIATION_BLUEPRINT_v2.md`
**Purpose:** Direct evidence map of all 19 BLOCK gates → validator → report → aggregator line
**Verified:** 2026-04-19

---

## Aggregator Source of Truth

- **File:** `scripts/architecture/checks/check-os-release-readiness.ts`
- **Array:** `REQUIRED_GATES` (lines ~278–298)
- **Run:** `npm run release:readiness`

---

## 19 Gate Evidence Map

| # | Gate (canonical) | Validator | Generated Report |
|---|---|---|---|
| 1 | `canonical-paths` | `scripts/architecture/checks/check-canonical-paths.ts` | `generated/canonical-paths-report.json` |
| 2 | `5-plane-boundaries` | `scripts/architecture/checks/check-5-plane-boundaries.ts` | `generated/5-plane-boundaries-report.json` |
| 3 | `evidence-graph-completeness` | `scripts/architecture/checks/check-evidence-graph-completeness.ts` | `generated/evidence-graph-completeness-report.json` |
| 4 | `cron-execution-evidence` | `scripts/architecture/checks/check-cron-execution-evidence.ts` | `generated/cron-execution-evidence-report.json` |
| 5 | `release-decision-persistence` | `scripts/architecture/checks/check-release-decision-persistence.ts` | `generated/release-decision-persistence-report.json` |
| 6 | `ai-receipt-completeness` | `scripts/architecture/checks/check-ai-receipt-completeness.ts` | `generated/ai-receipt-completeness-report.json` |
| 7 | `connector-reauth-telemetry` | `scripts/architecture/checks/check-connector-reauth-telemetry.ts` | `generated/connector-reauth-telemetry-report.json` |
| 8 | `security-fabric-probes` | `scripts/architecture/checks/check-security-fabric-probes.ts` | `generated/security-fabric-probes-report.json` |
| 9 | `app-sdk-extension-registry` | `scripts/architecture/checks/check-app-sdk-extension-registry.ts` | `generated/app-sdk-extension-registry-report.json` |
| 10 | `boardroom-cockpit-telemetry` | `scripts/architecture/checks/check-boardroom-cockpit-telemetry.ts` | `generated/boardroom-cockpit-telemetry-report.json` |
| 11 | `onboarding-branch-telemetry` | `scripts/architecture/checks/check-onboarding-branch-telemetry.ts` | `generated/onboarding-branch-telemetry-report.json` |
| 12 | `mobile-deferral-attestation` | `scripts/architecture/checks/check-mobile-deferral-attestation.ts` | `generated/mobile-deferral-attestation-report.json` |
| 13 | `app-sdk-extension-events` | `scripts/architecture/checks/check-app-sdk-extension-events.ts` | `generated/app-sdk-extension-events-report.json` |
| 14 | `release-evidence-graph-snapshot` | `scripts/architecture/checks/check-release-evidence-graph-snapshot.ts` | `generated/release-evidence-graph-snapshot-report.json` |
| 15 | `owner-copilot-readonly` | `scripts/architecture/checks/check-owner-copilot-readonly.ts` | `generated/owner-copilot-readonly-report.json` |
| 16 | `federation-optin-append-only` | `scripts/architecture/checks/check-federation-optin-append-only.ts` | `generated/federation-optin-append-only-report.json` |
| 17 | `dr-drill-evidence` | `scripts/architecture/checks/check-dr-drill-evidence.ts` | `generated/dr-drill-evidence-report.json` |
| 18 | `chaos-drill-classification` | `scripts/architecture/checks/check-chaos-drill-classification.ts` | `generated/chaos-drill-classification-report.json` |
| 19 | `production-launch-attestation` | `scripts/architecture/checks/check-production-launch-attestation.ts` | `generated/production-launch-attestation-report.json` |
| 20 | `electron-domain-layout` | `scripts/architecture/checks/check-electron-domain-layout.ts` | `generated/electron-domain-layout-report.json` |
| 21 | `os-ci-end-to-end` | `scripts/architecture/checks/check-os-ci-end-to-end.ts` | `generated/os-ci-end-to-end-report.json` |
| 22 | `cross-tier-capability-matrix` | `scripts/architecture/checks/check-cross-tier-capability-matrix.ts` | `generated/cross-tier-capability-matrix-report.json` |

---

## Phase 18 — Layout & CI Truth (NEW)

Closes the two residual ⚠️ findings from `PROJECT_TREE_AUDIT.md`:

- **Electron flat layout** → resolved via explicit domain registry at
  `electron/_layout.cjs` (no file moves; zero `require()` regression risk).
  See `electron/README.md` for rationale and the domain map.
- **OS CI not end-to-end** → workflow `.github/workflows/os-build-iso.yml`
  already runs the full pipeline; added nightly cron, release trigger,
  90-day release retention, and a `publish-iso` job that attaches signed
  ISO/IMG/SBOM/attestation to GitHub Releases.

Verification:
```bash
npx tsx scripts/architecture/checks/check-electron-domain-layout.ts
npx tsx scripts/architecture/checks/check-os-ci-end-to-end.ts
npm run release:readiness   # → 21/21 BLOCK gates green
```

---

## Phase 31 — Cross-Tier Capability Matrix (NEW)

Resolves the residual P2 finding from `MISSING_AUDIT.md` row 10:

- **Hard-coded tier lookups removed** → `useElectronBridge` now resolves
  via `useFeatureRuntimeTier("window-control")` instead of literal
  `tier === "DESKTOP_HOST"`.
- **Single source of truth** → `src/runtimes/feature-runtime-tier-registry.ts`
  exposes canonical `resolveFeatureTierAvailability` / `isFeatureSupportedOn`
  / `enumerateFeatureCoverage`. `runtime-context.tsx` delegates here.
- **Auto-derive in `<TierGate>`** → if `requireTier` prop is omitted, the
  gate uses the registry's `supportedTiers` automatically.
- **Generated truth artifact** → `src/runtimes/generated/cross-tier-capability-matrix.generated.ts`
  for use by admin boards and offline tools.
- **CI gate (BLOCK #22)** → `check-cross-tier-capability-matrix.ts`
  asserts (a) every referenced featureId is registered, (b) all 4
  canonical tiers are classified per feature, (c) zero hard-coded
  `tier === "X"` literals exist outside `src/runtimes/`.

Verification:
```bash
npx tsx scripts/architecture/checks/check-cross-tier-capability-matrix.ts
# → ✅ OK (registered features, 0 hard-coded literals, 0 errors)
```

---

## Result

🟢 **All 22 BLOCK gates verified, wired, and report-emitting.**
System is deployment-ready against the canonical aggregator gate set.
