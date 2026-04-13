

# Focus Dock + Intelligent Access Layer — Full Implementation

## Current State

The existing `DesktopDock.tsx` (338 lines) renders all `pinnedToDock` apps in a flat row with Gaussian magnification, bounce launch, badge counts, context menu, and auto-hide. It uses `AppPlatformContext` for the app list and `useAppBadges` for badge data. There's an `useAppSurfacing` hook that tracks launch frequency but is **not connected** to the dock. No app launcher panel exists. No smart suggestions, no app stacks, no recent flow strip, no context-aware adaptation.

## What We're Building

### 1. Intelligent Focus Dock (rewrite `DesktopDock.tsx`)

**Structure**: `[ Core Pinned ] | [ Active/Running ] | [ Smart Suggestions ] | [ + ]`

- **Core Pinned**: User-pinned apps (max 5), always visible
- **Active Apps**: Currently running windows from `windowManager`, auto-added/removed
- **Smart Suggestions**: 2-3 apps from `useAppSurfacing` based on launch frequency + time-of-day context, with a subtle purple accent to distinguish
- **+ Button**: Opens the App Launcher overlay
- **Glowing separators** between each section
- **Max 12 items** enforced — smart suggestions shrink to fit

**Magnetic interaction upgrade**: Icons respond to cursor proximity with velocity-reactive Gaussian magnification (already exists but will be refined with stronger parameters and smooth origin transforms)

### 2. App Launcher Panel (`src/components/sita/shell/AppLauncherPanel.tsx`)

A centered floating glass panel (Spotlight + Launchpad hybrid):

```text
┌─────────────────────────────────────────────┐
│  🔍 Search apps, files, actions...          │
├─────────────────────────────────────────────┤
│  🧠 SUGGESTIONS                            │
│  "Continue where you left off"              │
│  [Recent App 1] [Recent App 2] [Recent App 3]│
├─────────────────────────────────────────────┤
│  📂 APPS (categorized grid)                │
│  [Browser] [Notes] [Terminal] [Calendar]    │
│  [Files]   [Mail]  [Music]   [Calculator]  │
├─────────────────────────────────────────────┤
│  ⚙️ SYSTEM ACTIONS                          │
│  Settings · Lock · Dark Mode · Sleep        │
└─────────────────────────────────────────────┘
```

- **Open**: Click `+` on dock or `Cmd+Space` shortcut
- **Animation**: Background blur increases, panel scales from 0.96→1 with 150ms spring
- **Search**: Instant fuzzy filter across all apps + system actions
- **AI Suggestions**: Top 3 from `useAppSurfacing` + time-of-day context
- **Categories**: Auto-grouped from `AppCategory` type
- **Keyboard**: Arrow keys navigate, Enter launches, Escape closes

### 3. Recent Flow Strip (`src/components/sita/shell/RecentFlowStrip.tsx`)

Subtle strip above the dock showing last 4 app transitions as a workflow chain:

```text
         Chrome → Docs → Notes → Terminal
```

- Tracks last 8 app launches via `useAppSurfacing`
- Shows as small pill icons connected by thin arrows
- Fades in on hover near dock area, auto-hides after 3s idle
- Click any pill to jump back to that app

### 4. Context-Aware Dock Adaptation

New hook `src/hooks/useDockContext.ts`:

- Detects current "mode" from route + recent activity:
  - `/business/*` → Business mode (surfaces business-related apps)
  - `/money/*` → Finance mode
  - `/concierge/*` → Concierge mode
  - Default → General mode
- Feeds into Smart Suggestions section of dock
- Uses `useAppSurfacing` frequency data weighted by current context

### 5. App Stacks (in App Launcher)

In the launcher grid, apps with the same category get visual grouping with expandable stack interaction — click a stack header to expand/collapse that category with smooth height animation.

## Files

### Create (3 files)
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/sita/shell/AppLauncherPanel.tsx` | ~280 | Spotlight-hybrid launcher with search, suggestions, categories, keyboard nav |
| `src/components/sita/shell/RecentFlowStrip.tsx` | ~100 | Workflow chain strip above dock |
| `src/hooks/useDockContext.ts` | ~60 | Context-aware mode detection + suggestion weighting |

### Rewrite (1 file)
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/sita/DesktopDock.tsx` | ~450 | Focus Dock with sections (pinned/active/smart/+), launcher trigger, flow strip integration |

### Edit (2 files)
| File | Change |
|------|--------|
| `src/components/sita/ShellLayout.tsx` | Add `Cmd+Space` listener for launcher, pass launcher state to dock |
| `src/hooks/useAppSurfacing.ts` | Add `getRecentFlow()` method returning last N launches in order, add `getContextualSuggestions(context)` method |

## Key Design Decisions

- **12-item cap** is hard — core(5) + active(variable) + suggestions(fills remaining to 12) + launcher button
- **Smart suggestions** have a subtle pulsing dot indicator to distinguish from pinned apps
- **Launcher** uses the same glass material as the dock but larger (80% viewport width, max 640px)
- **All animations** use framer-motion springs matching existing dock physics (stiffness 200-300, damping 18-22)
- **Sound**: `SoundEngine.click()` on launch, subtle ambient sound on launcher open/close
- **Accessibility**: Full keyboard navigation, ARIA labels, focus trapping in launcher

