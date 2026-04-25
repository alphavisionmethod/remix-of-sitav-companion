# SITA OS — Shared Component Ownership Model

> **Status:** Canonical · **Owner:** Platform Architecture · **Wave:** 0.9
> **Enforced by:** `scripts/architecture/check-shared-component-concept-rule.ts`
> **Constitution rules:** 36, 37, 38
> **Cross-references:** `docs/architecture/COMPONENT_CONSTITUTION.md`, `docs/os/SHARED_VS_PROFILE_SPECIFIC_COMPONENTS.md`

---

## Why this model exists

The previous heuristic — *"a component lives under `src/components/**` if it is used by ≥2 pillars"* — is structurally simple but semantically wrong. It produces two failure modes:

1. A genuinely generic component (used today in only one pillar) is denied a shared home.
2. A pillar/platform/admin-semantic component (used today in two pillars by accident) is granted a shared home and silently becomes a hidden owner.

Wave 0.9 replaces usage-count classification with **concept-based ownership**: a file may live under `src/components/**` only if it is *conceptually shared, presentation-focused, and portable*.

---

## The 3-test concept rule

A file is allowed to live under `src/components/**` (excluding `ui/` shadcn library and `__tests__/`) **only if it passes all three tests**.

### Test 1 — Vocabulary

The component name, props, exported types, JSX text, and CSS class names MUST NOT contain any of the following vocabulary:

| Class | Forbidden tokens |
|---|---|
| Pillar-semantic | `business`, `concierge`, `finance`, `health`, `money`, `revenue`, `investment`, `digital-presence` |
| Platform-subsystem-semantic | `sita`, `advisor`, `boardroom`, `proof`, `receipt`, `governance`, `trust`, `observability`, `release`, `verification`, `cloud`, `oauth`, `connector`, `personal-brain`, `intelligence`, `mission`, `boardroom`, `atlas` |
| Admin/operator-semantic | `admin`, `operator`, `founder`, `engineering-ops`, `kill-switch`, `runbook` |
| Operator-only phrases | `"signals fired"`, `"release window"`, `"approval queue"`, `"runbook drill"`, `"kill switch"` |

The test is **case-insensitive** and matched on whole-word boundaries to avoid false positives (e.g. `BusinessHours` matches `business`; `BaseCard` does not).

**Why:** if the component name carries the vocabulary, it carries the meaning. Re-using a `BusinessPipelineCard` from `concierge/` does not make it shared — it makes concierge depend on a business concept.

### Test 2 — Dependency

The file MUST NOT contain `import` (or `export … from`) targeting any of:

- `@/modules/**`
- `@/platform/**`
- `@/admin/**`
- `@/pages/**`

It MAY import from:

- `@/components/ui/**` (shadcn primitives)
- `@/components/primitives/**` (own canonical primitives)
- `@/lib/utils`, `@/lib/design-system/**`
- `@/hooks/**` *iff* the hook itself is portable (does not transitively pull in pillar/platform state)
- `react`, `react-router-dom`, `lucide-react`, third-party UI libraries

**Why:** importing from `@/platform/**` or `@/modules/**` proves the component carries domain semantics, regardless of where it physically lives. The single forgivable case (a thin barrel that *only* re-exports from one platform subsystem) MUST instead live as a barrel under that subsystem itself (`@/platform/<system>/components/<sub>/index.ts`) and consumers import from there.

### Test 3 — Portability

The component MUST render correctly given **only** props + the import allowlist in Test 2. It MUST NOT depend on:

- Pillar-specific design tokens beyond the canonical `tailwind.config.ts` palette.
- Pillar-specific state shapes (e.g. `PillarManifest`, `BusinessOpportunity`, `ConciergeProvider`).
- Platform runtime services (`TRUST_LAYER`, `AI_GATEWAY`, `EVENT_BUS`).
- Hardcoded enumeration of pillar IDs, platform subsystem IDs, or admin domain IDs.

**Why:** if you can't drop the component into a brand-new shell with no pillars wired up and have it render, it isn't shared — it's coupled.

---

## Where non-shared components must live

| Classification | Canonical home |
|---|---|
| `pillar-semantic` | `src/modules/<pillar>/components/<sub>/` |
| `platform-semantic` | `src/platform/<system>/components/<sub>/` |
| `admin-semantic` | `src/admin/modules/<domain>/components/` |
| `shell-runtime-semantic` | `src/shell-runtime/` or `src/platform/sita/components/sita/shell/` |
| `shared-clean` | `src/components/<allowed-subtree>/` |

The allowed shared subtrees remain those defined by Constitution Rule 18: `ui/`, `primitives/`, `shared/`, `cards/`, `navigation/`, `launcher/`, `__tests__/`.

---

## Examples

### ✅ Conceptually shared (passes all three tests)

- `BaseCard`, `Hero`, `Summary`, `Panel`, `StatTile` — pure visual scaffolds.
- `StatusBadge`, `FreshnessBadge`, `ModeBadge`, `UrgencyBadge`, `ProvenanceChip` — generic state chips with no domain vocabulary.
- `Skeleton`, `Drawer`, `TimelineRow` — generic interaction/feedback primitives.
- `NavLink` — router-agnostic anchor wrapper.
- `FileUploadZone` — file-agnostic upload affordance using only shadcn + a portable hook.

### ❌ NOT shared (must move to canonical owner)

- `AdvisorCard`, `BoardroomRecommendationCard`, `ProofCard`, `QueueCard` — `platform-semantic` (sita/advisors/boardroom). Home: `@/platform/sita/components/sita/cards/`.
- `AIReceiptLink`, `AIStateBadge`, `AIResponsePanel` — `platform-semantic` (ai). Home: `@/platform/ai/components/ai/`.
- `PlatformDegradedBanner` — `platform-semantic` (cloud). Home: `@/platform/cloud/components/cloud/`.
- `NeedsDataExplainer`, `NeedsTimeWindowExplainer`, `NeedsHistoricalReleasesExplainer` — `admin-semantic` (operator-board "no signals" affordance). Home: `@/admin/modules/<domain>/components/` *or* `@/platform/sita/components/sita/empty-states/` if used by both.
- `PillarRail` — `shell-runtime-semantic` (hardcodes the four pillar IDs and imports `TRUST_LAYER`). Home: `@/platform/sita/components/sita/shell/`.
- `TrustBadge` (the re-export shim) — `deprecated-shim`; tracked separately in the deprecated-shim baseline.

---

## Auxiliary classifications used by the validator

| Bucket | Meaning |
|---|---|
| `shared-clean` | Passes all three tests. ✅ |
| `pillar-semantic` | Fails vocabulary or dependency test on a pillar word. |
| `platform-semantic` | Fails on a platform-subsystem word. |
| `admin-semantic` | Fails on an admin/operator word or phrase. |
| `shell-runtime-semantic` | Imports shell/runtime singletons or hardcodes pillar IDs. |
| `barrel-only-reexport` | File body is purely `export … from "@/platform/...";` lines. Tracked for relocation to platform-owned barrels. |
| `wrapper-with-platform-import` | Composes a single platform component to add operator copy. Move to platform's empty-state subtree. |
| `deprecated-shim` | Self-marked re-export shim. Counted against the deprecated-shim baseline, not this baseline. |

---

## Relationship to existing rules

- **Component Constitution (PRIMITIVE / DOMAIN / SURFACE)** — orthogonal. The 3-class model answers *"what kind of component is this?"*. The concept rule answers *"may this file live under `src/components/**`?"*. A `DOMAIN` component is fine — it just doesn't live in `src/components/**`.
- **Wave 7 / Wave 8 allowlist** — structural complement. The allowlist enforces *which subtrees* may exist; the concept rule enforces *which files inside those subtrees* may exist.
- **Wave 10 attestation** — the seal stays intact. Wave 0.9 installs enforcement only; physical relocation of grandfathered violators is a future, ADR-gated wave.

---

## Process for amending this model

1. Open an ADR under `docs/adr/ADR-<NNN>-<slug>.md` describing the proposed vocabulary or test change and its blast radius.
2. Update this file in the same PR.
3. Update `scripts/architecture/check-shared-component-concept-rule.ts` and the classifier.
4. Re-run `npm run foundation:emit` to refresh the baseline if the new rule changes the violator set.
5. CI must remain green.