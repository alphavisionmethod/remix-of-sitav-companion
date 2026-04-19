

## Audit verdict — what's done vs what's actually missing

The previous "Flagship Surface Closure" pass was **correctly scoped** to admin AI engineering only. Here's the real state:

| Surface | Status | Action |
|---|---|---|
| **Admin AI Runtime** | ✅ DONE — `ADMIN_AI_RUNTIME_CLOSURE_SPEC.md`, drilldown panel, validator wired | Preserve |
| **Admin Integrations** | ✅ DONE — `ADMIN_INTEGRATIONS_CLOSURE_SPEC.md`, health visibility validator | Preserve |
| **Onboarding** | ⚠️ DEFERRED — no `src/pages/onboarding`, lives elsewhere (user-flagship) | **Out of admin AI scope** — emit honest deferral docs only |
| **Boardroom briefing** | ⚠️ DEFERRED — only `BoardroomHistory.tsx` + `BoardroomReplay.tsx` in `src/pages/boardroom` | **Out of admin AI scope** — emit honest deferral docs only |
| **Concierge chat** | ⚠️ DEFERRED — `src/pages/concierge/*` is user surface | **Out of admin AI scope** — emit honest deferral docs only |
| **Communications inbox** | ⚠️ DEFERRED — no `src/pages/communications` directory | **Out of admin AI scope** — emit honest deferral docs only |

**User constraint repeated this turn:** "integrate it correctly **only on the admin ai engineer team**". This rules out cross-domain edits to user-flagship surfaces.

**Real gaps to close (admin AI scope only):**

1. The 4 deferred-surface markdowns from spec are missing (`ONBOARDING_WIRING_AUDIT.md`, `BOARDROOM_BRIEFING_CLOSURE_SPEC.md`, `CONCIERGE_CHAT_CLOSURE_SPEC.md`, `COMMUNICATIONS_INBOX_CLOSURE_SPEC.md`) — these should be emitted as honest **deferral-and-cross-reference** docs, not faked completions
2. The 6 missing validators (`check-onboarding-simulated-persona-disclosure`, `check-boardroom-briefing-truth-alignment`, `check-concierge-ai-state-handling`, `check-communications-connector-state-alignment`, `check-flagship-surface-trust-copy`, `check-flagship-surface-responsive-quality`) — these should be **honest WARN-tier scaffolds** that refuse to fake-green when the underlying surface is deferred
3. A new **FlagshipSurfaceClosureTruthPanel** to surface this on the admin AI Engineer hub (canonical AI engineer integration point per the directive)
4. `flagship-surface-verification.json` needs updating to reflect the new docs + validators

---

## Phase 1 — Emit 4 honest deferral docs (admin AI scope, audit-only)

Create under `generated/flagship-surface-closure/`:
- `ONBOARDING_WIRING_AUDIT.md` — documents that `src/pages/onboarding` does not exist; cross-references `src/lib/services/onboarding-daemon.ts` + `useOnboardingDaemon.ts` as the canonical hooks; classifies user-onboarding-flow polish as **out-of-admin-AI-scope** with explicit gate to user-flagship pass
- `BOARDROOM_BRIEFING_CLOSURE_SPEC.md` — documents that `src/pages/boardroom/` only has History + Replay; the canonical briefing surface lives in `src/pages/admin/boardroom-decision-chamber/*` (admin) and `BoardroomDashboard` (user); classifies user-briefing as deferred-to-user-flagship
- `CONCIERGE_CHAT_CLOSURE_SPEC.md` — documents that `src/pages/concierge/*` is user surface; admin AI engineer hub already exposes ConnectorTruth + AIRuntimeNightly which cover the concierge-AI runtime backbone; classifies UX polish as deferred-to-user-flagship
- `COMMUNICATIONS_INBOX_CLOSURE_SPEC.md` — documents that `src/pages/communications` doesn't exist; canonical connector health is at `OAuthRefreshHealthBoard` + `IntegrationsHome`; classifies inbox UI as deferred-to-user-flagship

Each doc explicitly cites: spec compliance verdict, what IS in admin AI scope (what's already done), what's NOT, where the canonical evidence/gating lives, and the cross-reference to `ADMIN_AI_RUNTIME_CLOSURE_SPEC.md` + `ADMIN_INTEGRATIONS_CLOSURE_SPEC.md`.

**Zero fake-green** — these are explicit "deferred-to-user-flagship-pass" markers, modeled on the mobile-archived stub pattern from the previous pass.

## Phase 2 — Add 6 honest WARN-tier validators

Create under `scripts/validation/`:
1. `check-onboarding-simulated-persona-disclosure.ts` — scans `src/lib/services/onboarding-daemon.ts` + any onboarding components for simulated-persona usage; emits WARN with cross-ref to deferral doc when no UI surface exists
2. `check-boardroom-briefing-truth-alignment.ts` — scans canonical briefing data sources (`generated/boardroom-*-status.json`); emits WARN if user-flagship briefing UI is deferred
3. `check-concierge-ai-state-handling.ts` — scans concierge surfaces for AI gateway usage; emits WARN with deferral cross-ref when admin AI scope only covers runtime backbone
4. `check-communications-connector-state-alignment.ts` — verifies `ConnectorStateBadge` is the canonical chip (already true); WARNs that inbox UI is deferred
5. `check-flagship-surface-trust-copy.ts` — scans the 2 admin AI surfaces (in scope) for overclaim phrases; passes for those, WARNs honest deferral on the other 4
6. `check-flagship-surface-responsive-quality.ts` — verifies admin AI surfaces use canonical responsive primitives; WARNs deferred surfaces

All 6 use `emitGateReport` from `_lib/emit-gate-report.ts` (existing pattern). All preserve **honest WARN-tier** for deferred-out-of-scope surfaces — none fake-green.

Wire all 6 into `check-os-release-readiness.ts` aggregator (199 → 205 gates, but 4 are honest WARN until user-flagship pass runs).

## Phase 3 — New `FlagshipSurfaceClosureTruthPanel` on AI Engineer hub

Create `src/components/admin/ai-runtime/FlagshipSurfaceClosureTruthPanel.tsx`:
- Reads all 7 status JSONs from `generated/flagship-surface-closure/`
- 2 tabs:
  - **In-Scope (Admin AI):** live status of admin-ai-runtime + admin-integrations closure (both green)
  - **Deferred (User-Flagship):** honest list of 4 deferred surfaces with their cross-reference docs and the explicit "out-of-admin-AI-scope" classification
- Includes `TruthPanelActions` (Refresh + link to `FLAGSHIP_SURFACE_FINAL_VERIFICATION.md`)
- Real `<Button onClick={...}>` for "View deferred surfaces register" (satisfies `no-museum-boards` validator regex directly)
- Direct integration with the existing `flagship-surface-verification.json` artifact

Mount as tab **11** in `AIRuntimeHome.tsx` after `architecture-hardening-truth` (single lazy import + single module entry). **Zero edits to other admin domains, zero edits to user surfaces.**

## Phase 4 — Update verification artifact + wire scripts

- Update `generated/flagship-surface-closure/flagship-surface-verification.json` to:
  - List all 8 deliverable docs (4 in-scope + 4 deferred-honest)
  - List all 6 new validators with their honest WARN-tier classification
  - Cross-reference the new truth panel mount path
  - Preserve `deferred: [...]` array with explicit "user-flagship-pass-required" markers
- Update `package.json`:
  - Add `closure:flagship-surface:run-all` script (runs all 6 validators)
  - Append to `final:closure:run-all`
- Run all 6 validators once to seed report JSONs in `generated/`

## Honest limits surfaced (preserved per no-fake-green policy)

- 4 of 6 surfaces remain **honestly deferred** to a future user-flagship pass — the validators encode this as WARN-tier with explicit cross-references, not as silent passes
- Admin AI engineer hub is the single integration point per user directive; no edits to `/onboarding/`, `/boardroom/`, `/concierge/`, `/communications/` user-facing routes
- Total release gate count increases from 199 → 205 (2 BLOCK additions for the 2 in-scope surfaces, 4 honest WARN additions for deferred surfaces)

## Files touched (final summary)

- **NEW (11):** 4 honest-deferral markdowns + 6 validators + 1 truth panel
- **EDITED (3):** `AIRuntimeHome.tsx` (+1 tab), `check-os-release-readiness.ts` (+6 gates), `package.json` (+1 script)
- **UPDATED (1):** `flagship-surface-verification.json`
- **ZERO edits to:** user-facing routes (onboarding/boardroom/concierge/communications), other admin domains, sealed migrations, archive/* directories, edge functions

After this pass: **205 release gates** (2 new BLOCK + 4 honest WARN), **11 truth panels** on AI Engineer hub (was 10), **8 flagship-surface-closure deliverables** (4 in-scope green, 4 deferred-honest with explicit cross-refs), zero stubs, zero fake-green, zero duplicates, full integration with the canonical `TruthPanelActions` + `emit-gate-report` patterns.

