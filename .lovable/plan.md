
## Claim-Safety, Demo-Containment & Deployment-Wording Hardening

**Current state**
- `generated/claim-safety-hardening/` does NOT exist — full track to build.
- 7 device/wearable/ambient pages exist (`DWE01–DWE07`, `UAO03/08AmbientLaunchReadiness`) — no shared demo-only badge wired to them.
- `LaunchHonestyBadge` exists with `demo_governed`, `qualified`, `internal_only` — reusable.
- 15+ docs say `deployable=true` / `production-ready` without P1 caveats — claim risk.
- Existing validators: `check-nova-runtime-sdk-naming`, `check-track-b-claim-safety`, `check-no-user-visible-nova-kernel-claims` — extend pattern.
- No prohibited "custom kernel / native OS kernel" strings found in `src/` — Track A clean. Audit confirms it.

### Phase 1 — OS Language Audit + Canonical Guide (Section A1–A2)
Deployment-ready, docs-only foundation. No code risk.
- Create `generated/claim-safety-hardening/` with:
  - `OS_LANGUAGE_REFERENCE_AUDIT.md` — scan results across `src/`, `docs/`, `generated/`, classifying every "OS / kernel / native / substrate" reference as safe / qualifier-required / Track-B / must-rewrite.
  - `CANONICAL_OS_LANGUAGE_GUIDE.md` — approved phrases ("sovereign AI operating system platform", "Ubuntu-native deployable platform", "userland AI operating environment on a signed Linux substrate") + prohibited list.
  - `os-language-status.json` — machine-readable manifest.

### Phase 2 — Demo-Only Surface Audit + Containment Model (Section B1–B2)
Docs + manifest. No UI changes yet.
- `DEMO_ONLY_SURFACE_AUDIT.md` — classifies all 7 DWE pages + Ambient Team Control + Ambient Launch Readiness + ecosystem-wearable surfaces.
- `DEMO_CONTAINMENT_MODEL.md` — defines required treatment: page-top `DemoOnlyBanner`, badge in headers, profile-gating policy, admin-truth labeling.
- New canonical registry: `src/lib/claim-safety/demo-only-surface-registry.ts` — single source of truth listing every surface ID + containment level (`demo_only` | `internal_preview` | `future_vision`). Wired by Phase 3 components.
- `demo-containment-status.json`.

### Phase 3 — Demo-Only Containment UI + Wiring (Section B3–B4)
Production-grade UI changes.
- New shared component `src/components/claim-safety/DemoOnlyBanner.tsx` — full-width banner ("Demo preview — not launch-live"). Reads from `demo-only-surface-registry`.
- New `src/components/claim-safety/FutureVisionBadge.tsx` — wraps existing `LaunchHonestyBadge` with `demo_governed` / `internal_only` / new `future_vision` variant (extend the union).
- Wire banner into all 7 DWE pages + UAO03 + UAO08 by importing at top of each page's render. Use lazy/conditional render based on registry — no layout breakage.
- Update `DWE07DeviceLaunchHonestyBoard` to display the registry as a live truth board.
- `DEMO_AND_FUTURE_CLAIM_SAFETY_UPDATE.md`.

### Phase 4 — Deployment Wording Audit + Policy + Doc Updates (Section C1–C3)
Docs + targeted rewrites of claim-bearing markdown.
- `DEPLOYABILITY_LANGUAGE_AUDIT.md` — list every `deployable=true` / `production-ready` / `nothing left to prove` claim with location + verdict.
- `DEPLOYMENT_WORDING_POLICY.md` — approved phrases ("deployable with qualifiers", "production-capable on Track A", "pilot-ready"), prohibited phrases, and the live P1 caveat list (TPM hardware proof, Boardroom L7 partial, etc.).
- Append a standardized `## Active Caveats` block to the top-level claim-bearing docs (`generated/FULL_MASTER_AUDIT.md`, `SITA_MASTER_AUDIT.md`, `DEPLOYMENT_AUDIT.md`, `RELEASE_NOTES.md`, profile/architecture deployment certificates) — non-destructive append, preserves existing GREEN content.
- `deployability-language-status.json`.

### Phase 5 — Validation Gates + Final Verification (Sections A4, B5, C4 + Part 5)
CI-enforceable, mirrors existing nova/track-b validator pattern.
- `scripts/validation/check-os-claim-safety.ts` — fails if prohibited OS phrases ("custom kernel", "own bootloader", "native OS kernel", "full OS from scratch") appear outside Track-B exemption list.
- `scripts/validation/check-track-b-language-boundaries.ts` — ensures Track-B language stays in Track-B docs.
- `scripts/validation/check-no-prohibited-native-claims.ts`.
- `scripts/validation/check-demo-only-surface-badging.ts` — every surface in `demo-only-surface-registry` must import `DemoOnlyBanner`.
- `scripts/validation/check-future-vision-route-containment.ts`.
- `scripts/validation/check-device-surface-claim-safety.ts`.
- `scripts/validation/check-deployment-wording-safety.ts` — fails on prohibited phrases ("nothing left to prove", "fully production-certified") in claim-bearing docs.
- `scripts/validation/check-launch-honesty-alignment.ts`.
- `scripts/validation/check-qualifier-required-claims.ts`.
- Final deliverables: `CLAIM_SAFETY_HARDENING_FINAL_VERIFICATION.md` + `claim-safety-verification.json` summarizing all 9 gates GREEN.

### Technical notes
- All 12 deliverable files land in `generated/claim-safety-hardening/` (exact tree from Part 5).
- New code lives in `src/lib/claim-safety/` and `src/components/claim-safety/` — net-new namespace, zero overlap with existing `src/lib/dual-reality/` or `src/components/reality/`.
- `LaunchHonestyBadge` is extended (add `future_vision` to union) rather than duplicated.
- Banners are additive-only — no existing route, page, or feature is removed or hidden.
- Validators follow the existing `scripts/validation/check-*.ts` exit-code/grep pattern, are added to the master release aggregator as 9 new BLOCK-level gates.
- No DB, edge function, or migration changes required — pure governance layer.
