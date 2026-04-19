# Responsive Surface Audit

_Generated as part of the Admin Coherence and Responsive Quality Closure pass._

## Scope

Three categories of surfaces were audited at narrow widths (320 / 375 / 414 / 768 CSS px):

1. **`/desktop`** — flagship workspace shell
2. **`/boardroom/briefing`** family — dense reading surface
3. **Mixed-quality `/admin/*` boards** — operator-critical narrow-width usability

## /desktop

**Intended audience:** desktop / Ubuntu-primary deployment (per readiness framework).

**Findings:**

- Below 768 px the desktop shell renders, but draggable widgets, the Quick Launch grid, and the Focus Dock were never designed for narrow viewports.
- There is currently **no honest disclosure** that the desktop is desktop-oriented when opened on a phone — visitors see a partially-broken layout instead of an explanatory banner.

**Recommendation (implemented in this pass):**

Add a single, dismissable, narrow-width disclosure banner reading:

> _Desktop view — open on a wider screen for the full SITA workspace._

The banner appears only at `< 768 px`. No layout overhaul. Honest graceful degradation.

## /boardroom/briefing

The repo currently does not ship a `/boardroom/briefing` page (the closest pages are `MorningBriefing` under `business/` and `OwnerCopilotBriefings` under the AI Engineer hub). Both were audited:

- `OwnerCopilotBriefings.tsx` — already wraps panels in shadcn `Card` (which is responsive). No fixed-pixel grids found.
- `MorningBriefing.tsx` — primarily user-facing; out of admin AI engineer scope and not modified in this pass.

**Verdict:** No edits required. The validator `check-boardroom-briefing-narrow-width` simply asserts that whichever briefing surface exists composes responsive grid classes (`grid-cols-1 md:grid-cols-*`) and contains no fixed `w-[1200px]`-style declarations.

## Mixed-quality `/admin/*` boards

**Audit method:** searched for unwrapped `<table>` elements in `src/pages/admin/**` and `src/components/admin/**`. The canonical SITA pattern is:

```tsx
<div className="overflow-x-auto">
  <table>...</table>
</div>
```

**Findings:**

- The vast majority of admin boards already use the wrapper or render via shadcn `Table` (which auto-wraps).
- A small number of legacy board files still emit raw `<table>` without an overflow wrapper. These are flagged by the new `check-responsive-operator-surfaces` validator at WARN tier.

## Verdict

Responsive quality is **structurally sound** across the admin plane — most narrow-width issues already have canonical solutions. The remaining gap is **enforcement** (so regressions cannot reintroduce raw tables) and **honest disclosure** on `/desktop`. Both are addressed in this pass.
