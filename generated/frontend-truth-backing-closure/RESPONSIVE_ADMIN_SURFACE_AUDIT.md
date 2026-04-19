# Responsive Admin Surface Audit

> Tables and wide layouts inside `src/pages/admin` must guard for narrow
> viewports (`/desktop` route renders into a constrained shell).

## Validator

`scripts/validation/check-responsive-admin-layout-integrity.ts` — WARN-tier
adoption tracker. For every admin page that contains a `<table>` element,
require at least one of: `overflow-x-auto`, `overflow-auto`, `min-w-0`,
`max-w-*`.

## Current run

| Metric | Value |
|---|---|
| Files scanned | 562 |
| Files with `<table>` | 53 |
| Offenders | 0 |
| Errors | 0 |
| Warnings | 0 |

Result: **clean**. Every admin page rendering a table either wraps it in
`overflow-x-auto` or constrains its parent.

## Operator-visible impact

- `/desktop` route: preserved (per closure prompt — minimal but kept).
- Admin tables remain horizontally scrollable on narrow widths.
- No layout-shift regressions from this pass — only additive primitives.
