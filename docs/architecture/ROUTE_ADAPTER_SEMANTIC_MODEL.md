# Route Adapter Semantic Model

**Status:** Adopted (Wave 0.7).
**Authority:** Constitution Rules 33–35.
**Companion docs:**
- [`REPOSITORY_CONSTITUTION.md`](./REPOSITORY_CONSTITUTION.md) — Rules 7, 33–35.
- [`ADMIN_PLANE_OWNERSHIP_MODEL.md`](./ADMIN_PLANE_OWNERSHIP_MODEL.md) — admin-side adapter pattern.
- [`PLATFORM_SUBCLASSIFICATION_MODEL.md`](./PLATFORM_SUBCLASSIFICATION_MODEL.md) — capability-side ownership.

## Why this exists

Before Wave 0.7, the rule for `src/pages/**` was **purely syntactic**: ≤40 logical lines or pure re-export, scoped to 8 pillar dirs. A 30-line page importing `useQuery` and calling `supabase.from(...)` passed the validator while still owning canonical data flow. **550 such files** existed across `src/pages/admin/` (534), `src/pages/mobile/` (12), `src/pages/owner-mode/` (1), `src/pages/business-advisors/` (2), and root (1) at Wave 0.7 seal.

Rule 33 closes the loophole by adding a **semantic contract**: the file's *behavior*, not its line count, determines compliance.

## The six adapter subtypes

| # | Subtype | Detector signal | Allowed | Forbidden |
|---|---|---|---|---|
| 1 | `pure-reexport` | Every non-comment line is `export … from "@/…"` | Re-exporting from `@/modules/**`, `@/platform/**`, `@/admin/**` | Anything else |
| 2 | `lazy` | Contains `lazy(() => import("@/…"))` | Route-level lazy + Suspense | Data fetching, state ownership |
| 3 | `redirect` | `useNavigate` / `<Navigate>` and no `useParams` | Compatibility/feature-flag redirects | Domain data |
| 4 | `param-translate` | `useParams` / `useSearchParams` and `useNavigate` | Param normalization → forward to canonical | Data fetching, business state |
| 5 | `shell-mount` | Wraps a canonical page in `<MobileShell>` / `<AppFrame>` / `<DomainAppShell>` / `<StandaloneAppFrame>` / `<AppShell>` | Pure shell composition with prop pass-through | Owning state or data |
| 6 | `event-dispatch` | `window.dispatchEvent(new CustomEvent("sita-open-…"))` + `navigate("/desktop")` | The windowed-app pattern (e.g. `MoneyCenter`) | Anything beyond dispatch + navigate |

Files matching no subtype with `>40` logical lines OR matching any forbidden API are classified `legacy-violation`.

## Universally forbidden in `src/pages/**`

- `supabase.*` calls — persistence belongs in `src/lib/services/**`.
- `useQuery`, `useMutation`, `useInfiniteQuery`, `useSuspenseQuery` — data fetching belongs in canonical pages or hooks under `@/admin/**` / `@/modules/**` / `@/platform/**`.
- `useState`, `useReducer` — canonical feature state lives in the canonical page body, not the adapter.
- Trust/approval/persistence logic.
- Business-rule branching that owns a concept.

## Forward declaration (Rule 35)

New files SHOULD declare their subtype with a top-of-file directive:

```ts
// @route-adapter: pure-reexport
export { default } from "@/modules/finance/pages/MoneyCenter";
```

The validator parses the directive and fails CI if the declared subtype does not match the detected subtype. This makes the adapter contract self-documenting and grep-friendly.

## Worked examples (real files in this repo)

| File | Subtype | Why |
|---|---|---|
| `src/pages/LandingPage.tsx` | `pure-reexport` | 4 lines, `export { default } from "@/platform/marketing/pages/LandingPage"` |
| `src/pages/MoneyCenter.tsx` | `pure-reexport` | Re-exports `@/modules/finance/pages/MoneyCenter` |
| `src/modules/finance/pages/MoneyCenter.tsx` | `shell-mount` + `event-dispatch` (canonical home — not in `src/pages/`) | Mobile shell + desktop event dispatch |
| `src/modules/business/pages/BusinessCenter.tsx` | `event-dispatch` (canonical home) | `window.dispatchEvent("sita-open-business")` + `navigate("/desktop")` |
| `src/pages/admin/AIG07LaunchTruth.tsx` | `legacy-violation` | Owns `useQuery` + table state |

The canonical pages live in `src/modules/**` / `src/admin/**` / `src/platform/**`. `src/pages/**` is the **route adapter layer only**.

## Migration policy

1. **New work** lands directly in `src/modules/<pillar>/pages/`, `src/admin/modules/<domain>/views/`, or `src/platform/<sub-class>/<system>/pages/`. The corresponding `src/pages/**` file is a thin adapter (preferably `pure-reexport`).
2. **Legacy violations** drain one file at a time:
   - Move the body to its canonical home.
   - Replace the original with one of the six subtypes.
   - Re-run `generate-route-adapter-semantic-map.ts`. The validator's report shows the new lower count.
3. **The ratchet only decreases.** Any PR that increases `legacy-violation` count fails CI.
4. **No bulk physical move** is performed in Wave 0.7 — Wave 10 attestation must remain stable; each migration is gated by the safe-change ledger (Rule 24).

## Manifests

| Manifest | Purpose | TTL |
|---|---|---|
| `generated/manifests/route-adapter-semantic-map.json` | Per-file classification + violations | 30 days |
| `generated/manifests/page-semantic-violation-baseline.json` | Sealed Wave-0.7 ratchet baseline | sealed |
| `generated/manifests/page-semantic-violation-report.json` | Latest validator run output | per-run |

## Validators (foundation-tier, BLOCKING)

- `scripts/architecture/check-page-semantic-adapter.ts` — Rules 33/34 monotone ratchet.
- `scripts/architecture/check-page-adapter-subtype-declaration.ts` — Rule 35 declaration consistency.
- Pre-existing complementary: `scripts/architecture/check-pages-thin-adapter.ts` (Rule 7 syntactic ≤40-line guard, now expanded to all 33 page subdirs).
