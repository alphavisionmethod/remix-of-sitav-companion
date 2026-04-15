

# Mobile App / OS Gap Analysis + Implementation Plan

## Audit Summary

The mobile app has **18 pages** and **6 components**. After reading every mobile file, the following critical screens from the audit prompt are **missing entirely**:

### What Exists (Solid)
- Home/Pulse, Business, Money, Concierge, Investment, Files, Boardroom — domain views
- Approvals + Approval Detail — working approve/reject flow
- Alerts — filter-based alert list
- Device Trust — enrollment, revoke, re-verify with trust levels
- Emergency Actions — 5 emergency controls with 2-step confirm
- Quick Capture — 4 capture modes with desktop handoff
- Proof Log + Receipt Detail — immutable receipt list
- Settings — biometric, push, dark mode toggles
- Communication Inbox (desktop only, 285 lines) — full 3-pane with search/filter/star/archive

### What's Missing (8 Critical Gaps)

| # | Missing Screen | Audit Section | Priority |
|---|---|---|---|
| 1 | **Mobile Command Center** | §4 — Command system (NL commands, history, undo, simulation, receipts) | Critical |
| 2 | **Mobile AI Chat** | §7 — AI conversation (system-aware, explain, suggest, trigger commands) | Critical |
| 3 | **Mobile System Monitor** | §8 — Full visibility (CPU, memory, sync, trust, network, anomalies) | Critical |
| 4 | **Mobile Sync Control** | §9 — Sync control (queue, conflicts, pause/resume/force, repair) | High |
| 5 | **Mobile Notification Center** | §10 — Event + notification (actionable, prioritized, history) | High |
| 6 | **Mobile Timeline/History** | §16 — Full event timeline (commands, approvals, updates, receipts) | High |
| 7 | **Enhanced Policy Settings** | §17 — Policy engine (approval rules, trust, sync, update, AI prefs) | Medium |
| 8 | **Mobile Inbox** | Memory spec — Premium mobile inbox with threads, swipe, AI queue | High |

### Existing Pages Needing Enhancement
- **MobileMore.tsx**: Missing links to new screens
- **MobileRoutes.tsx**: Missing route registrations
- **MobileSettings.tsx**: No policy controls (§17)

---

## Implementation Plan — 5 Batches

### Batch 1: Command Center + AI Chat (Critical authority surfaces)
- **MobileCommand.tsx** — Natural language command bar, saved command templates, command history list, simulation preview before risky actions, approval integration, command receipt display, undo support
- **MobileAIChat.tsx** — Chat interface with message bubbles, system-aware responses, "why did this happen?" queries, action suggestions with confidence/risk badges, command triggers from chat, markdown rendering

### Batch 2: System Monitor + Sync Control (Operational visibility)
- **MobileSystemMonitor.tsx** — Visual gauge cards (CPU, memory, network, storage), security posture ring, trust score, device fleet status, update state, trend sparklines with up/down indicators, anomaly alert badges
- **MobileSyncControl.tsx** — Sync queue list with progress bars, per-device sync state cards, conflict items with resolution actions, pause/resume/force-sync controls, latency metrics, last successful sync timestamps, repair suggestion cards

### Batch 3: Notification Center + Timeline (Event awareness)
- **MobileNotificationCenter.tsx** — Priority-grouped notifications (critical/normal/info), inline approval prompts, command completion alerts, security alerts with action buttons, sync issue warnings, notification history with date grouping and filter pills
- **MobileTimeline.tsx** — Unified chronological event log (commands, approvals, updates, sync events, trust changes, security events, repairs), domain color-coding, receipt links, search and filter by type/domain/date

### Batch 4: Mobile Inbox + Enhanced Settings (Communication + policy)
- **MobileInbox.tsx** — Three-tab layout (Primary/Social/Updates), threaded message cards with avatar colors, swipe-to-archive/star gestures, AI-suggested action queue panel, priority sorting, compose button, search bar, channel badges (email/SMS/system)
- **Enhanced MobileSettings.tsx** — New "Policies" section with toggleable policy rules: require approval for file deletion, approval for trust changes, update install confirmation, sync behavior, AI assistant autonomy level, privacy preferences — each with descriptive sublabels

### Batch 5: Wiring + Audit Document
- Add all 6 new routes to **MobileRoutes.tsx**
- Add all new screen links to **MobileMore.tsx** grid
- Add notification badge indicator to **MobileTabBar.tsx** (bell icon overlay)
- Generate **/mnt/documents/MISSING_APP_OS.md** — Full 28-section audit document with status, gaps, and deployment readiness per subsystem

### Design Consistency (matching existing mobile style exactly)
- `MobileShell` wrapper on every page
- Dark-first: `bg-card`, `border-border/40`, `bg-card/50`
- Typography: `text-sm font-semibold` headings, `text-[10px]-[11px]` labels
- Cards: `rounded-xl border border-border/40 bg-card p-4`
- Filters: pill buttons with `rounded-full` active state
- Accents: `text-primary`, `text-[hsl(var(--trust-safe))]`, `text-[hsl(var(--sita-gold))]`
- Icons: lucide-react, 4-5w sizing
- Motion: framer-motion for list animations
- Safe area padding via `env(safe-area-inset-bottom)`

### Technical Notes
- All new pages use demo data arrays (matching existing pattern) — no backend stubs
- All components are self-contained with local state management
- All follow the existing `export default function` or `const X = () =>` patterns
- Zero new dependencies required

