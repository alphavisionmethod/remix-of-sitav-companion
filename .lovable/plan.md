

# SITA OS — Advanced App Experience & Full OS Intelligence Upgrade

## Vision
Transform every app from a "page you navigate to" into a living OS citizen with notification badges, real-time status, personalized content, and advisor intelligence baked in. Apps feel like they belong to YOU — not generic tools.

## Current State
- Apps launch correctly (internal navigate, external open tab)
- No notification badges on app icons
- No app-level status indicators (unread, pending, alerts)
- No windowed/floating app mode — everything is full-page navigation
- No Dock bar on the main desktop (only exists in onboarding transition mockup)
- Advisors exist in a separate chat panel — not embedded inside each app
- No app-specific personalization (greeting, recommendations, recent context)
- No cross-app continuity ("continue where you left off")

## Plan (8 Deliverables)

### 1. Desktop Dock Bar — Always-Visible App Launcher
A macOS-style floating dock at the bottom of the desktop showing pinned apps with live notification badges.

- New component: `src/components/sita/DesktopDock.tsx`
- Shows all apps where `pinnedToDock === true` as icons
- Live badge counts pulled from notification system (unread per domain)
- Magnification hover effect (icons grow on mouse proximity)
- Click launches app (internal navigate or external open)
- Right-click context menu: Unpin, App Info, Notifications
- Renders in `ShellLayout.tsx` above `MobileBottomNav` for desktop viewports

### 2. App Notification Badges — Live Cross-Domain Counts
Every app icon (Dock, App Library, Sidebar) shows real-time unread/pending counts.

- New hook: `src/hooks/useAppBadges.ts`
- Maps domain notifications to app IDs (e.g., business notifications → CRM app, Business Center)
- Approval counts surface on relevant apps
- Badge component: red dot for 1-9, number for 10+
- Updates via existing `useRealtimeNotifications` subscription

### 3. App Welcome Headers — Personalized Greetings
When you open any internal SITA app, it greets you by name with contextual intelligence.

- New component: `src/components/sita/AppWelcomeHeader.tsx`
- "Good morning, Sarah — 3 leads need follow-up" (Business Center)
- "You have $8,240 safe to spend today" (Money Center)
- "2 errands completed, 4 remaining" (Concierge)
- Time-aware greetings (morning/afternoon/evening)
- Uses user profile + domain-specific metrics
- Integrated into each domain page header

### 4. In-App Advisor Strip — Contextual AI Inside Every App
Instead of only the floating chat, each app shows a slim advisor strip at the top with contextual suggestions.

- New component: `src/components/sita/InAppAdvisorStrip.tsx`
- Domain-aware: Money app shows Money Advisor suggestions, Business app shows Business Advisor
- Shows 2-3 quick action chips: "Review overdue invoices", "Optimize subscriptions"
- One-tap to execute or expand into full advisor chat
- Confidence indicator on each suggestion
- Dismissible per session; learns which suggestions you act on

### 5. App Recents & Continue — Cross-App Continuity
"Continue where you left off" section on the home/desktop page.

- New component: `src/components/sita/AppRecentsStrip.tsx`
- Tracks last 5 app interactions with timestamps
- Shows mini-preview cards: "Invoice #1042 — last edited 2h ago"
- Click resumes exact context (route + scroll position where possible)
- Persisted to localStorage, synced to user profile

### 6. Advisor Autonomy Settings — Per-App Trust Controls
Users configure per-advisor autonomy levels: observe, suggest, auto-execute.

- New component: `src/components/sita/AdvisorAutonomyPanel.tsx`
- Accessible from Settings and from each app's advisor strip
- Three levels per advisor per domain:
  - **Watch** — advisor observes, never interrupts
  - **Suggest** — advisor proactively recommends (default)
  - **Auto-pilot** — advisor executes within policy limits, receipts generated
- Visual trust meter showing current delegation level
- Approval thresholds configurable (e.g., auto-execute below $500)

### 7. Unified Activity Feed Widget — Cross-Domain Timeline on Desktop
A premium widget on the home page showing real-time cross-domain activity.

- Enhance existing `WidgetGrid.tsx` with a new `ActivityFeedWidget`
- Shows last 10 actions across all domains with domain color coding
- Filterable by domain (business/money/concierge)
- Each item shows: action, domain badge, time, advisor involvement, proof status
- Tap any item to open the relevant app at that context

### 8. App Store Polish — Ratings, Reviews, Screenshots Carousel
Make the App Store feel like a world-class marketplace.

- Add screenshot carousel to `AppDetailPage.tsx` (swipeable, with zoom)
- Add user review section with star ratings (demo data for now)
- "Apps for You" personalized recommendations based on user profile
- "Recently Updated" section showing changelog highlights
- Bundle discount badges and "Complete Your Suite" prompts

## Files Changed

| File | Change |
|------|--------|
| `src/components/sita/DesktopDock.tsx` | **New** — floating dock with magnification + badges |
| `src/hooks/useAppBadges.ts` | **New** — live notification counts per app |
| `src/components/sita/AppWelcomeHeader.tsx` | **New** — personalized app greetings |
| `src/components/sita/InAppAdvisorStrip.tsx` | **New** — contextual advisor suggestions per app |
| `src/components/sita/AppRecentsStrip.tsx` | **New** — continue where you left off |
| `src/components/sita/AdvisorAutonomyPanel.tsx` | **New** — per-advisor trust level controls |
| `src/components/sita/WidgetGrid.tsx` | Add ActivityFeedWidget |
| `src/components/sita/ShellLayout.tsx` | Mount DesktopDock + AppRecentsStrip |
| `src/pages/DailyPulsePage.tsx` | Add AppWelcomeHeader + recents |
| `src/pages/business/*.tsx` | Add AppWelcomeHeader + InAppAdvisorStrip |
| `src/pages/money/*.tsx` | Add AppWelcomeHeader + InAppAdvisorStrip |
| `src/pages/concierge/*.tsx` | Add AppWelcomeHeader + InAppAdvisorStrip |
| `src/pages/app-platform/AppDetailPage.tsx` | Screenshot carousel + reviews |
| `src/pages/app-platform/AppStorePage.tsx` | "Apps for You" + "Recently Updated" |
| `src/lib/app-platform/types.ts` | Add `badgeCount?`, `lastUsedAt?` fields |

## Summary
After this, SITA OS will have a floating Dock with live badges, personalized app greetings, in-app AI advisor strips, continuity across apps, per-advisor autonomy controls, a rich activity feed, and a polished App Store — making it feel like a premium, fully personalized operating system where every surface knows who you are.

