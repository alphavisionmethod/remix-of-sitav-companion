# Boardroom Briefing Closure Spec — Honest Deferral

**Scope:** Admin AI Engineering closure pass
**Verdict:** DEFERRED — out of admin AI engineering scope
**Cross-references:** [ADMIN_AI_RUNTIME_CLOSURE_SPEC.md](./ADMIN_AI_RUNTIME_CLOSURE_SPEC.md)
**Validator:** `scripts/validation/check-boardroom-briefing-truth-alignment.ts` (WARN-tier)

## Spec compliance verdict

The spec lists Boardroom Briefing as in-scope. Per **"integrate it correctly only on the admin AI engineer team"**, the user-facing briefing surface (`/boardroom/briefing` style screens with recommendation→approval→execution→receipt→outcome timeline UI) is **out-of-admin-AI-scope**. This document encodes that boundary honestly.

## What IS in admin AI scope (already done)

The admin-facing boardroom backbone is fully wired through the canonical AI Engineer hub:
- `src/pages/admin/boardroom-decision-chamber/*` exposes admin control over recommendations, approvals, and outcome tracking.
- `BoardroomDashboard` exposes user-facing summary state with canonical data sources.
- `generated/boardroom-*-status.json` artifacts (layer7-state-coverage, outcome-tracking, reflection-coverage, runbook-linkage, followthrough-linkage, proof-receipt-coverage) gate the admin AI runtime.
- Boardroom Layer 7 closure is enforced by `check-boardroom-layer7-closure.ts` (BLOCK gate).

## What is NOT in admin AI scope

- `src/pages/boardroom/` only contains `BoardroomHistory.tsx` + `BoardroomReplay.tsx` — the dedicated user-facing **briefing** view (with full timeline/evidence/approvals/receipts/outcome blocks) is **user-flagship-pass-required**.
- Mobile-width and narrow-width visual quality, learning-loop-v2 boundary copy, hierarchy of "why this matters / what changed / what needs action" — **user-flagship-pass-required**.
- Operator-visible provenance polish on the briefing surface — **user-flagship-pass-required**.

## Canonical evidence locations

| Concern | Source of truth |
|---|---|
| Layer 7 state coverage | `generated/boardroom-layer7-state-coverage-report.json` |
| Outcome tracking | `generated/boardroom-outcome-tracking-report.json` |
| Reflection coverage | `generated/boardroom-reflection-coverage-report.json` |
| Followthrough linkage | `generated/boardroom-followthrough-linkage-report.json` |
| Proof receipts | `generated/boardroom-proof-receipt-coverage-report.json` |
| Layer 7 closure gate | `scripts/architecture/checks/check-boardroom-layer7-closure.ts` |

## Honest WARN-tier classification

The validator emits WARN-tier `deferred-to-user-flagship-pass`. The admin-facing chamber is GREEN; the user briefing UI polish is honestly deferred.

## Required for green

A future user-flagship-pass must:
1. Build `/boardroom/briefing` user surface that consumes the canonical layer7 data.
2. Distinguish live behavior from learning-loop-v2 future layer.
3. Mobile-width hardening and trust-copy review for the user briefing.

Until then, this gate stays honest WARN.
