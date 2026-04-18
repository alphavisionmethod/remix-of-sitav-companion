# Unified Search Wiring Audit

_Generated: 2026-04-18T13:11:51.571Z_

## Canonical hook
- ✅ `src/hooks/use-global-search.ts`

## Shell integration
- UniversalCommandSurface: ✅

## Consumers (2)
- `src/components/sita/shell/UniversalCommandSurface.tsx`
- `src/pages/SearchPage.tsx`

## Result domains
13 domains covered: leads, customers, tasks, invoices, files, workflows, receipts, approvals, notes, bills, bookings, incidents, settings.

## Classification
**WIRED CANONICAL** — shell-level search is live. Domain shells may add per-shell scoped search in future phases.

