

# Calendar — Independent App with Cross-Domain Integration

## Current State
- **CalendarWindow** (525 lines): Local-only, localStorage events, Nova SDK styled, month/week views, categories. No DB connection.
- **CalendarWorkspace** (462 lines): Full page route, references `calendar_events` table that **doesn't exist** in the DB, has domain filtering, CRUD mutations that fail silently.
- **TodoWindow**: Local-only hardcoded todos, no DB persistence.
- **DB tables that exist**: `appointments` (concierge), `crm_tasks` (business). No `calendar_events` table.

## What Will Be Built

A unified Calendar app that is:
1. An independent windowed OS app (replacing the current CalendarWindow)
2. Connected to real database tables
3. Aggregates events from all domains: appointments, CRM tasks, business deadlines, finance events, and user-created events

```text
┌──────────────────────────────────────────────────────────────┐
│ 📅 Calendar                              Day Week Month Agenda│
│ ← April 2026 →                          [+ New Event] [Today]│
├──────────┬───────────────────────────────────────────────────┤
│ Mini     │  ┌───┬───┬───┬───┬───┬───┬───┐                   │
│ Calendar │  │Mon│Tue│Wed│Thu│Fri│Sat│Sun│                   │
│          │  ├───┼───┼───┼───┼───┼───┼───┤                   │
│ ──────── │  │   │   │ 1 │ 2 │ 3 │ 4 │ 5 │                   │
│ Sources  │  │ 🔵│   │   │ 🟡│   │   │   │ ← color dots     │
│ ☑ My Cal │  │ 6 │ 7 │ 8 │...│   │   │   │                   │
│ ☑ Business│ └───┴───┴───┴───┴───┴───┴───┘                   │
│ ☑ Finance│                                                   │
│ ☑ Concierge│ Selected Day: Wed Apr 15                        │
│ ☑ Todos  │  ┌─────────────────────────────┐                  │
│          │  │ 🔵 09:00 Team Standup       │                  │
│ ──────── │  │ 🟡 14:30 Dentist (Concierge)│                  │
│ Upcoming │  │ 🟣 17:00 Invoice Due (Fin)  │                  │
│ • Standup│  │ ☐  Review financials (Todo) │                  │
│ • Dentist│  └─────────────────────────────┘                  │
└──────────┴───────────────────────────────────────────────────┘
```

## Implementation Plan

### Step 1: Create `calendar_events` Database Table
Migration to create the table with RLS policies:
- Columns: `id`, `user_id`, `title`, `event_date`, `start_time`, `end_time`, `domain` (personal/business/household/finance), `event_type` (meeting/task/reminder/appointment/deadline/travel), `location`, `priority`, `notes`, `source` (manual/crm/concierge/finance), `source_id`, `color`, `recurring`, `created_at`, `updated_at`
- RLS: users can only access their own events

### Step 2: Unified Calendar Data Service (`src/lib/data-services/unified-calendar-service.ts`)
Aggregates events from multiple sources into a single timeline:
- `calendar_events` table (user-created events)
- `appointments` table (concierge appointments → mapped as calendar items)
- `crm_tasks` with `due_date` (business tasks → mapped as deadline items)
- Demo data fallback when not authenticated
- Returns unified `UnifiedCalendarEvent[]` with source attribution

### Step 3: React Query Hook (`src/hooks/use-unified-calendar.ts`)
- `useUnifiedCalendar(year, month, sources[])` — fetches from all sources, merges, deduplicates
- `useCalendarSources()` — toggle-able source list (My Calendar, Business, Finance, Concierge, Todos)
- Reuses existing `useCreateCalendarEvent`, `useUpdateCalendarEvent`, `useDeleteCalendarEvent` (now pointing to real table)

### Step 4: Rewrite CalendarWindow as Full App (`src/components/sita/shell/windows/CalendarWindow.tsx`)
Complete rewrite with:
- **4 views**: Day, Week, Month, Agenda (current has only month/week)
- **Source sidebar**: Toggleable event sources with color-coded dots (Business=blue, Finance=green, Concierge=amber, Personal=violet, Todos=gray)
- **Mini calendar** navigation (keeping existing pattern)
- **Day view**: Hour-by-hour timeline (7am–9pm) with event blocks
- **Week view**: 7-column hour grid with events positioned by time
- **Month view**: Enhanced current grid with multi-source dot indicators
- **Agenda view**: Scrollable chronological list grouped by date
- **Event detail panel**: Click event to see details, edit, delete
- **Create event dialog**: Full form with domain, type, time, location, recurrence
- **Todo integration**: Shows todos with due dates as calendar items (checkbox to complete)
- **Conflict detection**: Visual warning when events overlap
- **DB persistence**: All CRUD operations go to `calendar_events` table
- Nova SDK styling with glassmorphic cards, animated transitions

### Step 5: Update CalendarWorkspace Page
Simplify to redirect shim that opens the Calendar window app (like ConciergeCenter pattern), keeping the route for backward compat.

### Step 6: Mobile Calendar (`src/pages/mobile/MobileCalendar.tsx`)
- Swipeable day/week view
- Source filter chips
- Tap to view event details
- FAB for new event
- Pulls from same unified data service

### Files Created/Modified

| File | Action |
|---|---|
| Migration SQL | Create `calendar_events` table with RLS |
| `src/lib/data-services/unified-calendar-service.ts` | Create — multi-source aggregation |
| `src/hooks/use-unified-calendar.ts` | Create — unified query hook |
| `src/components/sita/shell/windows/CalendarWindow.tsx` | Rewrite — full app with 4 views, DB-connected |
| `src/hooks/use-calendar-mutations.ts` | Update — ensure pointing to real table |
| `src/pages/CalendarWorkspace.tsx` | Simplify — redirect to window app |
| `src/pages/mobile/MobileCalendar.tsx` | Create — mobile calendar |

