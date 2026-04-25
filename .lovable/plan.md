# AppointmentsScheduling — Production Wiring Plan

## Audit findings (the truth before we change anything)

The canonical file is `src/modules/business/pages/AppointmentsScheduling.tsx` (the `src/pages/business/AppointmentsScheduling.tsx` is a re-export shim — correct, leave alone).

Concrete defects in the canonical file:

1. **Hardcoded `APPOINTMENTS` array** (lines 33–42) presented as live data — violates demo-mode standardization (`mem://design/demo-mode-standardization`).
2. **`([] as any[])` everywhere** (lines 59–62, 151–154, 227) — every KPI and tab filter is computed against an empty array, so they always render `0`. Every tab except `"all"` shows nothing. Today's Schedule is permanently empty. Violates `mem://constraints/type-safety-standards` (zero `as any` in `src/pages/**`; canonical equivalent applies to `src/modules/.../pages`).
3. **Dead buttons**: Send/Phone/Recover on each card, "View Prepared Messages", "Send All Reminders", "Call Unconfirmed", "Recover No-Shows" — none have handlers.
4. **Static advisor copy** referencing fake `APT-303` / `APT-307` IDs.
5. **No loading / error / empty / unauthenticated / setup states** — violates `mem://design/elite-components` empty-state honesty rule.
6. **No tenancy / auth scoping** — never reads `auth.uid()`.
7. **No receipt emission** for state-changing actions — violates `mem://infrastructure/receipt-emission`.
8. **No tests** for this page.

## Canonical systems to REUSE (no duplicates)

| Need | Canonical source — reuse, don't recreate |
|------|------------------------------------------|
| Appointment domain types | `src/packages/business-contracts/booking.ts` (`Booking`, `BookingStatus`), `no-show-risk.ts` (`NoShowRisk`, `NoShowRecoveryPlan`), `revenue-autopilot/no-show-recovery-packet.ts` |
| Bookings persistence | `public.bookings` table (already has `org_id`, `customer_id`, `starts_at`, `ends_at`, `status`, `metadata`, RLS via `is_org_member`) |
| Page-state pattern | `src/hooks/usePageData.ts` (returns `loading`/`error`/`empty`/`ready`) |
| Loading state | `src/platform/sita/components/sita/PageSkeleton.tsx` |
| Error state | `src/platform/sita/components/sita/PageErrorState.tsx` |
| Empty state | `src/platform/sita/components/sita/PremiumEmptyState.tsx` |
| Demo-mode flag | `useDataMode()` from `src/contexts/DataModeContext.tsx` (`isDemoMode`) |
| Toast feedback | `sonner` (already used across CRM/Leads pages) |
| Module title / subtitle | `getModuleAdaptation("appointments", primaryMode)` (already wired) |
| Business profile | `useBusinessProfile()` (already wired) |
| Calendar service shape | `src/data/repositories/unified-calendar-service.ts` — extend, don't fork |

## Why a NEW thin service is justified

There is **no existing scheduling-intelligence service** that:
- pulls bookings + treats them as confirmable appointments,
- computes no-show risk from `bookings.metadata`,
- exposes `sendReminder` / `markConfirmed` / `recoverNoShow` mutations.

`unified-calendar-service.ts` only reads the `appointments` table (concierge-shaped: `appointment_date`, `prep_items`) — it is calendar-rendering, not scheduling-ops. The canonical operational table for Business OS is `bookings` (has `org_id`, `customer_id`, `metadata` — purpose-built). So a new file `src/data/repositories/business-scheduling-service.ts` is correct and non-duplicative.

---

## Phase 1 — Domain & service layer (foundation)

**Done = TypeScript compiles, service is tenant-scoped, no UI changes yet.**

1. Add `src/modules/business/domain/scheduling/types.ts`:
   - Re-export `Booking`, `BookingStatus` from `@/packages/business-contracts/booking`.
   - Add view-model `ScheduledAppointmentVM` that maps `bookings` row → UI shape (id, customer, service, date, time, duration, location, status, staff, noShowRisk, lastContact, isFollowUp, notes). Strict types — no `any`.
   - Add `ConfirmationStatus` mapping helper (`bookings.status: "scheduled"|"confirmed"|"completed"|"cancelled"|"no-show"` → UI `confirmed|pending|unconfirmed|cancelled|no-show`).
   - Add deterministic `computeNoShowRisk(b: Booking): "low"|"medium"|"high"` derived from `metadata.priorReschedules`, `metadata.lastContactAt`, time-to-appointment, and prior no-show history (no AI call — pure function).

2. Add `src/data/repositories/business-scheduling-service.ts` that exports:
   - `fetchScheduledAppointments({ from, to, mode }): Promise<ScheduledAppointmentVM[]>`
     - In `demo` mode: returns the existing 8-row sample fixture (moved out of the page into `src/data/fixtures/mock-data/business-scheduling.ts`).
     - In `real` mode: queries `bookings` for `auth.uid()` between dates; maps via `bookingRowToVM`.
   - `sendConfirmationReminder(bookingId)`: updates `bookings.metadata.lastReminderAt`, returns success/error.
   - `markBookingConfirmed(bookingId)`: sets `status='confirmed'`.
   - `recoverNoShow(bookingId, channel)`: writes `metadata.recoveryAttemptedAt`, sets `metadata.recoveryChannel`, returns a `NoShowRecoveryPlan` shape so the UI can show the prepared message.
   - All mutations: tenant-checked via RLS (already enforced server-side), and emit a receipt via the existing receipt helper if the user is in `live` mode (no-op in demo).

3. Add `src/data/fixtures/mock-data/business-scheduling.ts` — the 8 sample appointments, typed as `ScheduledAppointmentVM[]`. This is the **only** place demo data lives.

**Phase 1 gate**: `npx tsc --noEmit` passes. No UI changes deployed yet. Do not start Phase 2 until clean.

---

## Phase 2 — React query hook + state coverage

**Done = the page consumes real state with all 5 UI states implemented; old `APPOINTMENTS` array deleted.**

1. Add `src/hooks/use-business-scheduling.ts`:
   - Uses `usePageData<ScheduledAppointmentVM[]>` keyed on `["business-scheduling", mode, dateRange]`.
   - `mode` from `useDataMode()`. Live mode `staleTime: 30s`; demo mode `Infinity`.
   - Returns `{ appointments, state, isDemo, refetch, error }`.
   - Memo'd selectors: `upcoming`, `needsConfirmation`, `highRisk`, `noShows`, `followUps`, `today` — derived from `appointments` (not from `[]`).
   - Mutations: `sendReminder(id)`, `confirm(id)`, `recover(id, channel)` — each calls the service, optimistically updates the cache, shows a `sonner` toast, rolls back on error.

2. Rewrite `src/modules/business/pages/AppointmentsScheduling.tsx`:
   - Delete the hardcoded `APPOINTMENTS` const.
   - Delete every `([] as any[])` instance.
   - Render branches by `state`:
     - `loading` → `<PageSkeleton rows={4} />`
     - `error` → `<PageErrorState onRetry={refetch} context="appointments" />`
     - `empty` → `<PremiumEmptyState variant="no-data" title="No appointments yet" description="..." actions=[{label:"Add appointment",onClick:...}] />`
     - `ready` → existing layout, but driven by hook selectors.
   - KPIStrip and tab filters consume the memoized selectors — strict types.
   - Today's Schedule consumes `today` selector.
   - Card buttons wired to `sendReminder` / `confirm` / `recover`.
   - "Send All Reminders" / "Call Unconfirmed" / "Recover No-Shows" wired to bulk operations on `needsConfirmation` and `noShows` selectors.
   - Demo banner: when `isDemo`, render a small "Demo data — connect to activate live scheduling" chip (reuses existing `cn` styling, no new component).

**Phase 2 gate**: page renders correctly in demo mode (sample data shows up, KPIs non-zero, tabs filter correctly), `npx tsc --noEmit` passes, `npx vite build` succeeds. Do not start Phase 3 until clean.

---

## Phase 3 — Scheduling Advisor (data-driven, not static copy)

**Done = the advisor panel reflects the actual appointment list; recovery messages are real.**

1. Add `src/modules/business/domain/scheduling/advisor.ts`:
   - `buildSchedulingInsights(appointments: ScheduledAppointmentVM[]): SchedulingInsight[]` — pure function returning ordered insights:
     - "N high no-show risk in next 24h" (with the actual top customer name).
     - "N recovery opportunities" (no-shows in last 7 days without recovery attempt).
     - "N unconfirmed past reminder window" (>24h since last reminder, still pending).
     - "Schedule conflict detected" if two appointments overlap for the same staff.
     - Each insight has `id`, `severity`, `message`, `detail`, `cta: { label, action: "send-reminder"|"recover"|"open-detail", targetId }`.
   - `buildPreparedMessages(appointments)`: returns drafts for each pending/no-show — `{ bookingId, channel, subject, body }`. Used by "View Prepared Messages" sheet.

2. Replace the static "Scheduling Advisor" card content with a `<SchedulingAdvisorPanel insights={...} onAction={...} />` rendered inline (keep it inside the same file to avoid premature extraction). Empty insight list → "All clear — no scheduling risks right now" honest empty.

3. "View Prepared Messages" → opens a `Sheet` (shadcn `sheet` already in the project) listing prepared messages with per-row "Send" buttons that call the same mutation as the card buttons.

**Phase 3 gate**: insight panel reflects test data correctly (e.g., flipping a booking to `pending` with old `lastReminderAt` produces the "unconfirmed past reminder window" insight). Build clean.

---

## Phase 4 — Tests

**Done = the page is regression-safe.**

Add `src/modules/business/pages/__tests__/AppointmentsScheduling.test.tsx`:
- Renders `loading` / `error` / `empty` / `ready` states (mock `usePageData` return).
- KPI strip: given a fixture of 5 appointments (2 upcoming, 1 pending, 1 high-risk, 1 no-show), expect counts `2 / 1 / 1 / 1`.
- Tab filtering: switching to `"needs-confirm"` shows only pending+unconfirmed cards.
- Today's Schedule shows only today's appointments.
- Action buttons call the right mutation (spy on `sendReminder` / `confirm` / `recover`).
- Advisor panel: given a no-show appointment, the "recovery opportunity" insight appears.
- No `as any` in the file (regex assertion in the test).

Add `src/modules/business/domain/scheduling/__tests__/advisor.test.ts`:
- `buildSchedulingInsights` deterministic across the 5 main scenarios.
- `computeNoShowRisk` returns `high` for ≥2 prior reschedules, `medium` for 1, `low` for 0 (assuming `metadata` present).

Add `src/data/repositories/__tests__/business-scheduling-service.test.ts`:
- Demo mode returns fixture.
- Live mode without auth returns `[]`.
- `bookingRowToVM` maps fields correctly.

**Phase 4 gate**: `bunx vitest run src/modules/business/pages/__tests__/AppointmentsScheduling.test.tsx src/modules/business/domain/scheduling/__tests__/advisor.test.ts src/data/repositories/__tests__/business-scheduling-service.test.ts` all green.

---

## Phase 5 — Integration report + deployment readiness

**Done = report committed, build clean, no new unused exports.**

1. Add `src/modules/business/pages/APPOINTMENTS_SCHEDULING_INTEGRATION_REPORT.md` covering parts 1–7 from the brief.
2. `npx tsc --noEmit` clean.
3. `npx vite build` clean.
4. Final smoke list: route `/business/appointments` mounts the page (no route changes needed — already wired in `src/routes/families/business-routes.tsx`).

---

## Files I will create

- `src/modules/business/domain/scheduling/types.ts`
- `src/modules/business/domain/scheduling/advisor.ts`
- `src/modules/business/domain/scheduling/__tests__/advisor.test.ts`
- `src/data/repositories/business-scheduling-service.ts`
- `src/data/repositories/__tests__/business-scheduling-service.test.ts`
- `src/data/fixtures/mock-data/business-scheduling.ts`
- `src/hooks/use-business-scheduling.ts`
- `src/modules/business/pages/__tests__/AppointmentsScheduling.test.tsx`
- `src/modules/business/pages/APPOINTMENTS_SCHEDULING_INTEGRATION_REPORT.md`

## Files I will modify

- `src/modules/business/pages/AppointmentsScheduling.tsx` (full rewrite — delete fake data, wire to hook, add states, wire actions, real advisor)

## Files I will NOT touch

- `src/pages/business/AppointmentsScheduling.tsx` (re-export shim — correct as-is)
- `src/routes/families/business-routes.tsx` (route already exists)
- `src/integrations/supabase/client.ts`, `types.ts` (forbidden)
- `src/data/repositories/unified-calendar-service.ts` (different concern — calendar rendering, not scheduling ops)
- Any contract in `src/packages/business-contracts/` (reused as-is)

## Anti-duplication declaration

- **Booking type**: reuse `Booking` from `@/packages/business-contracts/booking` — no new appointment type.
- **No-show risk type**: reuse `NoShowRisk` from `@/packages/business-contracts/no-show-risk` — `computeNoShowRisk` returns the canonical `riskLevel` shape.
- **Recovery packet**: reuse `NoShowRecoveryPacket` from `@/packages/business-contracts/revenue-autopilot/no-show-recovery-packet`.
- **State components**: reuse `PageSkeleton`, `PageErrorState`, `PremiumEmptyState`.
- **Demo flag**: reuse `useDataMode()` — never read the localStorage key directly.
- **Toast**: reuse `sonner` — same pattern as CRMNotes/LeadsInbox.
- **Receipt emission**: reuse the centralized helper noted in `mem://infrastructure/receipt-emission` rather than calling `ai_action_receipts` directly.

## Hard rules I will enforce on myself

1. Each phase must compile and (where applicable) test green before the next starts.
2. Zero `as any` in any new or rewritten file.
3. Zero hardcoded data outside `src/data/fixtures/mock-data/`.
4. Every action button has either a real handler OR a `disabled` attribute with a tooltip explaining why — no dead buttons.
5. No new component in `src/components/ui/` (only shadcn primitives belong there).
6. No edits to `supabase/config.toml` (no new edge function this phase — service runs against existing `bookings` RLS).
