

# Elevate Business OS to a Launched Application Aesthetic

## Current State

The Business Center renders as a full-page route (`/business/*`) wrapped in `CenterPageShell` — a page-within-a-sidebar layout. It looks like a dashboard, not like software launched inside an OS. The OS already has a complete window manager (`FloatingWindow`, `DesktopSurface`, dock physics, traffic-light controls, snap zones, app accents) — but Business Center doesn't use any of it.

## Goal

Make Business OS feel like a **native application launched within SITA OS**: window chrome, app-level sidebar navigation, a title bar, and visual cohesion with the existing NovaOS window system — while keeping the existing route-based navigation functional.

## Plan

### Step 1: Create `BusinessAppShell` — app-level window chrome wrapper

Create `src/components/business/BusinessAppShell.tsx`:
- **Title bar** with traffic-light-style dots (close/minimize/maximize), app icon (briefcase), and title "Business OS"
- **App-level sidebar** (left, ~200px) with grouped navigation: Core, Sales, Growth, Intelligence, Office — replacing the current flat horizontal tab strip
- Sidebar items use active states matching the `APP_COMPONENTS.listItem` design system tokens
- **Content area** with subtle inner shadow and glassmorphic material background
- Uses `APP_MATERIALS`, `APP_SHADOWS`, `APP_CHROME`, `APP_TYPE` from the existing `app-window-system.ts`
- Accent strip at top: 2px purple gradient bar (`APP_CHROME.accentStripHeight`)
- Window border radius: 16px (`APP_CHROME.cornerRadius`)

### Step 2: Register Business OS accent in `app-window-system.ts`

Add `"business-os"` to `APP_ACCENTS`:
```
"business-os": "from-[hsl(265_55%_58%)] to-[hsl(285_50%_48%)]"
```

### Step 3: Refactor `BusinessCenter.tsx` to use `BusinessAppShell`

Replace the current `CenterPageShell` + `SitaTabs` structure:
- Wrap everything in `BusinessAppShell` instead of `CenterPageShell`
- Move tab navigation into the sidebar
- Keep `AnimatePresence` page transitions for content
- Remove the hero header (the title bar replaces it)
- Keep `InAppAdvisorStrip` but move it into the app's toolbar area

### Step 4: Polish the Overview page for in-app feel

Update `BusinessOverview.tsx`:
- Remove the duplicate `AmbientHeader` (the app shell provides identity)
- Tighten padding to use `SPACE.normal` (16px) instead of generous page margins
- Add a compact "status bar" at the bottom of the window showing CRM health, sync status, and advisor state

### Step 5: Add app-launch entry point from Desktop

Add "Business OS" to the `DesktopIconGrid` as a launchable app icon, so double-clicking it navigates to `/business` with a window-open animation.

## Files Changed

- **Create**: `src/components/business/BusinessAppShell.tsx` (~180 lines)
- **Edit**: `src/lib/design-system/app-window-system.ts` (add accent)
- **Edit**: `src/pages/BusinessCenter.tsx` (swap shell, move tabs to sidebar)
- **Edit**: `src/pages/business/BusinessOverview.tsx` (remove duplicate header, tighten spacing)
- **Edit**: `src/components/sita/shell/DesktopIconGrid.tsx` (add Business OS icon)

## Visual Result

```text
┌──────────────────────────────────────────────────────┐
│ ● ● ●   💼 Business OS                    ─ □ ✕    │
│══════════════════════════════════════════════════════│
│ ┌──────────┐ ┌──────────────────────────────────────┐│
│ │ CORE     │ │                                      ││
│ │ Overview │ │  Pipeline Value    $42,800            ││
│ │ Leads    │ │  ┌───────┐ ┌────────┐ ┌──────────┐  ││
│ │ Customers│ │  │ Won   │ │ Negot. │ │ At Risk  │  ││
│ │ Follow-up│ │  │$18.2K │ │$14.6K  │ │ $5.4K    │  ││
│ │ Support  │ │  └───────┘ └────────┘ └──────────┘  ││
│ │──────────│ │                                      ││
│ │ SALES    │ │  [Revenue Chart]  [Funnel]           ││
│ │ Quotes   │ │                                      ││
│ │ Invoices │ │  What Matters Now                    ││
│ │ Proposals│ │  ▸ Emily Watson — 3 days...          ││
│ │──────────│ │  ▸ Invoice #1035 overdue             ││
│ │ GROWTH   │ │                                      ││
│ │ Autopilot│ │  [Advisor Strip]                     ││
│ │ Recovery │ └──────────────────────────────────────┘│
│ └──────────┘                                        │
│ ────────────────────────────────────── CRM ● Synced │
└──────────────────────────────────────────────────────┘
```

## Technical Details

- The sidebar uses `APP_MATERIALS.sidebarBg` and `APP_MATERIALS.sidebarBorder`
- Active nav items use `APP_COMPONENTS.listItem.active` 
- Title bar height: `APP_CHROME.titleBarHeight` (40px)
- Window background: `APP_MATERIALS.windowBg.dark`
- Corner radius: `APP_CHROME.cornerRadius` (16px)
- Focused shadow: `APP_SHADOWS.focused`
- Inner glow: `APP_SHADOWS.innerGlow`
- All transitions use existing Framer Motion patterns from `CenterPageShell`

