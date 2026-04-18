# Unified Search Wiring Audit

_Generated: 2026-04-18T13:29:53.432Z_

## Canonical hook
- ✅ `src/hooks/use-global-search.ts`

## Shell integration
- UniversalCommandSurface: ✅

## Consumers (4)
- `src/components/sita/shell/UniversalCommandSurface.tsx`
- `src/pages/SearchPage.tsx`
- `src/pages/business/LeadsInbox.tsx`
- `src/pages/files/FilesSearch.tsx`

## Result domains
13 domains covered: leads, customers, tasks, invoices, files, workflows, receipts, approvals, notes, bills, bookings, incidents, settings.

## Classification
**WIRED CANONICAL** — shell-level search is live. Domain shells may add per-shell scoped search in future phases.

