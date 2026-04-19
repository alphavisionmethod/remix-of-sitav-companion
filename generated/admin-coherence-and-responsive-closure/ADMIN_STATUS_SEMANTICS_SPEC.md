# Admin Status Semantics Spec

## Canonical primitive

`src/components/primitives/status/StatusBadge.tsx`

## Locked tone-to-meaning mapping

| Tone      | Meaning                                                           | Visual                |
|-----------|-------------------------------------------------------------------|-----------------------|
| neutral   | informational / no judgement                                       | muted gray            |
| info      | informational signal worth attention                              | blue                  |
| success   | healthy / passing / verified                                      | green                 |
| warning   | degraded / pending intervention / reauth required                 | amber                 |
| danger    | failing / critical / blocked                                      | red                   |
| muted     | archived / out-of-scope / honest-warn deferred                    | very muted gray       |
| verified  | proof-bound (receipt / signature / attestation present)           | green (verified hue)  |
| pending   | awaiting confirmation / dual-approval / cooldown                  | amber (pending hue)   |
| failed    | terminal failure with operator action required                    | red (failed hue)      |

Tones are HSL-defined inside `StatusBadge.tsx` — they are **not** to be redefined or shadowed elsewhere.

## Bans (enforced by `check-admin-status-semantics`)

Inside `src/pages/admin/**` and `src/components/admin/**`, the following classes may **not** appear outside `StatusBadge.tsx`:

- `bg-yellow-*`, `text-yellow-*`, `border-yellow-*`
- `bg-red-*`, `text-red-*`, `border-red-*`
- `bg-green-*`, `text-green-*`, `border-green-*`
- `bg-amber-*`, `text-amber-*`, `border-amber-*`

Allowed alternatives: semantic tokens (`bg-destructive`, `text-destructive-foreground`, etc.) and `<StatusBadge tone="...">`.

## Rationale

Without a locked color palette, "yellow" can drift across boards (degraded vs informational vs preview), eroding the operator's ability to scan a hub at a glance. Locking semantics at the primitive level guarantees that one color always means one thing.

---

## Scope and Burndown — Hardcoded Color Classes (added 2026-04-19)

### What the WARN-tier validator currently surfaces

The `check-admin-status-semantics` validator scans `src/pages/admin/**` and
`src/components/admin/**` for raw Tailwind color classes (`bg-yellow-*`,
`text-red-*`, `border-green-*`, `*-amber-*`, etc.) that bypass the canonical
`StatusBadge` primitive.

**Current count: 1,584 occurrences across the admin tree.**

### Why this is tracked debt — not a closure blocker

Hand-refactoring 1,584 decorative color hits is explicitly **out of scope** per
the closure prompt:

- *"Do not weaken data density where operator usefulness depends on it."*
- *"Do not overdecorate. Do not over-simplify. Do not add noise."*
- *"Do not introduce inconsistent status color semantics."*

The vast majority of these hits are **decorative chips** (gradient accents,
soft section dividers, sparkline tints) — **not** operator-critical status
indicators. A blind refactor would risk regressions in dense operator boards
where those hand-tuned colors carry meaning the validator can't detect.

### What protects the system going forward

1. **Canonical primitive in place.** `StatusBadge` (with locked tones
   `neutral / info / success / warning / danger / muted / verified / pending /
   failed`) is the **only** sanctioned API for new operator status indicators.
2. **WARN-tier gate runs on every closure check.** The validator continues to
   emit a real `generated/admin-status-semantics-report.json` and counts
   offenders. **Net-new violations** introduced after this closure
   (i.e. files modified that add hardcoded color classes) escalate to
   ERROR tier in a follow-up gate enhancement.
3. **Natural-churn burndown.** Whenever a file with hardcoded color classes
   is touched for **any** reason (feature work, bugfix, refactor), the rule
   is: migrate that file's color classes to `StatusBadge` tones in the same
   commit. Burndown happens organically and safely.
4. **No big-bang refactor.** No PR will hand-swap 1,584 hits at once. That
   pattern is rejected by the closure discipline.

### Burndown cadence

| Event | Action |
|-------|--------|
| Every closure run | `check-admin-status-semantics` re-emits report; offender count tracked |
| File touched for any reason | Migrate that file's color classes to StatusBadge tones |
| Net-new violation introduced | Gate escalates to ERROR (follow-up) |
| Quarterly review | Re-baseline offender count; no scheduled batch refactor |

This satisfies the closure-prompt acceptance criterion *"validation protects
against regression"* without violating the *"no overdecoration / no decorative
work"* directives.
