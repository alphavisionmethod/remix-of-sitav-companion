

# Playwright Visual Regression + PageShell Wrapping + Typography Component

## Summary

Three coordinated changes: (1) expand Playwright visual regression coverage to OS/window and standalone surfaces, (2) wrap the remaining unwrapped top-level pages in PageShell, and (3) create a `Typography` component enforcing the 12-role `SITA_TYPE` scale with migrations in key shells and pages.

---

## Part 1: Playwright Visual Regression Expansion

### File: `tests/e2e/visual-regression.spec.ts`

Add two new test groups to the existing file:

**OS/Window Surfaces** (auth-gated, screenshot on load):
- `/desktop` -- OS shell, dock, window manager
- `/boardroom` -- full-bleed AI surface
- `/approval-chamber` -- PageShell standalone
- `/governance` -- PageShell standalone
- `/sovereign-export` -- PageShell standalone
- `/digital-twins` -- PageShell standalone

**Standalone PageShell Pages** (auth-gated, verify PageShell framing):
- `/agent-activity` -- dashboard with PageShell
- `/outcome-engine` -- cards with PageShell
- `/scenario-lab` -- interactive with PageShell
- `/notification-center` -- list with PageShell
- `/connector-hub` -- grid with PageShell

Each test: navigate, wait for `domcontentloaded` + 1s settle, `toHaveScreenshot` with `maxDiffPixelRatio: 0.05`, `threshold: 0.3`, `animations: "disabled"`.

**Admin Surface Sampling** (2-3 representative admin pages):
- `/admin/ai-agent-debate`
- `/admin/ai-runtime-status`

These catch regressions in AdminPageHeader and admin layout patterns.

---

## Part 2: Wrap Remaining Top-Level Pages in PageShell

Only 2 genuine candidates remain at the top level (the other 8 are intentionally full-bleed: DesktopPage, LandingPage, Boardroom, FirstBootSetup, NotFound, OnboardingWrapper, MoneyOnboarding, DownloadPage):

### `src/pages/CustomerHealthPage.tsx`
- Currently: `<motion.div className="mx-auto max-w-7xl space-y-6">`
- Replace with: `<PageShell width="wide">` + keep `SitaPageHeader` inside

### `src/pages/LifeSimulator.tsx`
- Currently: raw `motion.div` with stagger
- Replace with: `<PageShell width="wide">` + keep content inside

### Digital-Presence pages (~20 files like `CROOffice.tsx`)
- Currently: `<div className="min-h-screen bg-background p-6 space-y-6">` + `DPOSubNav`
- Replace outer div with: `<PageShell width="wide">` to get consistent framing
- Keep `DPOSubNav` as first child

### Admin pages (574 files)
- These use `AdminPageHeader` which serves as their shell pattern
- NOT wrapping in PageShell -- they have their own consistent framing via AdminPageHeader
- Document this as an intentional exception in `page-framing-grammar.ts`

---

## Part 3: Unified Typography Component

### New file: `src/components/sita/Typography.tsx`

A semantic component mapping the 12 SITA_TYPE roles to proper HTML elements:

```
<Typography role="osTitle">...</Typography>      -> <h1>
<Typography role="appTitle">...</Typography>      -> <h2>
<Typography role="pageTitle">...</Typography>     -> <h2>
<Typography role="sectionTitle">...</Typography>  -> <h3>
<Typography role="paneTitle">...</Typography>     -> <h3>
<Typography role="cardTitle">...</Typography>     -> <h4>
<Typography role="metricEmphasis">...</Typography> -> <span>
<Typography role="microLabel">...</Typography>     -> <span>
<Typography role="trustAnnotation">...</Typography> -> <span>
<Typography role="timelineMeta">...</Typography>   -> <span>
<Typography role="commandText">...</Typography>    -> <span>
<Typography role="systemMono">...</Typography>     -> <code>
```

Props:
- `role`: keyof SITA_TYPE (required)
- `as`: override HTML element (optional)
- `className`: merge additional classes (optional)
- `children`: ReactNode

Implementation: imports `SITA_TYPE` from `sita-design-tokens.ts`, applies the class string via `cn()`, renders the mapped element.

### Migrations

Update these key files to use `<Typography>` for their headings:

1. **`src/components/sita/PageShell.tsx`** -- no headings to migrate (it's a wrapper), but export `Typography` from the same barrel for convenience
2. **`src/components/sita/SitaCard.tsx`** -- `SitaPageHeader` title uses raw `text-xl font-bold` -> use `<Typography role="appTitle">`
3. **`src/components/sita/admin/AdminPageHeader.tsx`** -- title uses `text-xl font-bold` -> use `<Typography role="appTitle">`
4. **5 representative pages**: `GovernanceDashboard`, `AgentActivityDashboard`, `OutcomeEnginePage`, `CustomerHealthPage`, `LifeSimulator` -- migrate primary headings to `<Typography>`

---

## Files Created
- `src/components/sita/Typography.tsx` -- canonical typography component

## Files Modified
- `tests/e2e/visual-regression.spec.ts` -- add ~20 new screenshot tests
- `src/pages/CustomerHealthPage.tsx` -- wrap in PageShell
- `src/pages/LifeSimulator.tsx` -- wrap in PageShell
- ~20 `src/pages/digital-presence/*.tsx` -- wrap in PageShell
- `src/components/sita/SitaCard.tsx` -- use Typography in SitaPageHeader
- `src/components/sita/admin/AdminPageHeader.tsx` -- use Typography
- `src/lib/ui/page-framing-grammar.ts` -- document admin exception
- 5 representative page files -- migrate headings to Typography

## Intentionally Unchanged
- 574 admin pages -- already use AdminPageHeader consistently; bulk migration to Typography deferred
- Full-bleed pages (Desktop, Landing, Boardroom, FirstBoot, NotFound, Onboarding, Download) -- intentionally frameless
- Mobile pages -- use MobileShell, separate rendering context

