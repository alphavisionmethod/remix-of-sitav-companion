# Concierge OS — Module Manifest

**Pillar**: 2 of 4
**Route group**: `/concierge/*`
**Primary surface**: `src/pages/ConciergeCenter.tsx` (windowed App-in-OS shell)
**Sub-apps under this pillar**: Travel, Reservations, Household Command Center, Life Admin, Errands & Logistics, Family Calendar, Events & Gifts, Service Providers.

## Owned Sub-Domains

| Sub-domain         | Surface(s)                                              | Service(s)                              |
| ------------------ | ------------------------------------------------------- | --------------------------------------- |
| Travel             | `src/pages/concierge/TravelPlanning.tsx`                | `src/lib/services/booking-scheduling`   |
| Reservations       | (within Travel + Appointments)                          | `src/lib/services/booking-scheduling`   |
| Household coord.   | `src/pages/concierge/HouseholdCommandCenter.tsx`        | `src/lib/services/family-command-center`|
| Life admin         | `src/pages/concierge/LifeAdminCenter.tsx`               | `src/lib/services/household-org-graph`  |
| Errands/logistics  | `src/pages/concierge/ErrandsLogistics.tsx`              | (planned)                               |
| Family calendar    | `src/pages/concierge/FamilyCalendar.tsx` + `MonthGrid`  | `src/lib/services/continuity-engine`    |
| Events & gifts     | `src/pages/concierge/EventsGifts.tsx`                   | (planned)                               |
| Service providers  | `src/pages/concierge/ServiceProviders.tsx`              | (planned)                               |
| Recurring obligations | `src/pages/concierge/RecurringObligations.tsx`       | `src/lib/services/continuity-engine`    |

## Owned Components
- `src/components/concierge/**`

## Forbidden Imports
- ❌ `src/modules/business/**` · `src/modules/finance/**` · `src/modules/health/**`
- ✅ `src/modules/_shared/**` · `src/modules/_trust/**`

## Trust Integration
Bookings, travel reservations, and any third-party action on the user's behalf MUST go through `_trust/approvals.requireApproval` and emit receipts.