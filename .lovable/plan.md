

# SITA OS — Launcher v2.1.1: Production-Ready Dynamic Launcher

## Current State (Already Implemented)

The launcher has strong foundations that must NOT be duplicated:

- **AppLauncherPanel.tsx** (300 LOC): Two-panel Deepin-style layout with category sidebar, app list, frequently used grid, search
- **AppPlatformContext.tsx** (483 LOC): Full lifecycle (install/uninstall/update/permissions/dock/receipts) with Supabase + localStorage persistence
- **APP_CATALOG** (1432 LOC): 45+ apps with rich metadata (trust, permissions, categories, file associations)
- **useAppSurfacing.ts**: Recency/frequency tracking, contextual suggestions, domain affinity scoring
- **AppPermissionGate.tsx**: Permission gate before app launch
- **Types**: `AppDefinition` already has `badgeCount`, `tags`, `routePath`, `installStatus`, `trustLevel`, `permissions`, etc.

## Gap Analysis — What's Missing

| Gap | Severity | Current | Needed |
|-----|----------|---------|--------|
| Keyboard navigation | High | Only Escape | Full arrow/tab/enter flow |
| Installed vs available vs locked display | High | Only shows installed | Show all 3 states with CTAs |
| Quick actions per app | High | Not implemented | Permission-filtered quick actions |
| Badges/state indicators | Medium | `badgeCount` on type but unused | Render badges in launcher |
| Pinned apps section | High | Pinning exists in context, not shown in launcher | Dedicated pinned row |
| Search ranking | Medium | Simple fuzzy match | Weighted: exact > prefix > pinned > recent > installed |
| First-launch indicators | Medium | `isNew` on type but unused | New badge, setup-incomplete state |
| Accessibility (ARIA) | High | None | Roles, labels, focus management, announcements |
| Telemetry events | Medium | None | launcher_opened/closed, app_opened, search, pin/unpin |
| Loading/skeleton states | Low | None | Skeleton grid during hydration |
| Touch optimization | Medium | Partially | Proper hit targets, swipe-to-dismiss |
| Install CTA in launcher | High | Not in launcher | Open/Install/Locked buttons |

## Implementation Plan

### 1. Extend `AppDefinition` type with quick actions (types.ts)

Add to existing type — no new file:
```typescript
export interface AppQuickAction {
  id: string;
  label: string;
  icon: string;
  route?: string;
  permissionRequired?: string;
}
```
Add `quickActions?: AppQuickAction[]` to `AppDefinition`.

### 2. Add quick actions to catalog entries (catalog.ts)

Add `quickActions` arrays to existing APP_CATALOG entries. Examples:
- Business Center: "Create Lead", "View Pipeline"
- Money Center: "Add Transaction", "View Budget"
- Notes: "New Note"
- Calendar: "New Event"
- Email: "Compose"

### 3. Create `useLauncherViewModel` hook (NEW: `src/hooks/useLauncherViewModel.ts`)

Single hook that composes the launcher's data model from existing sources:
- Reads `useAppPlatform()` for apps, install states, permissions
- Reads `useAppSurfacing()` for recency/frequency
- Computes sections: **Pinned**, **Recent**, **All Apps** (grouped by category)
- Applies weighted search ranking (exact > prefix > pinned > recent > fuzzy)
- Filters by permission visibility
- Provides `LauncherViewModel` with typed sections
- Tracks telemetry events (launcher_opened, search, app_opened, etc.)

### 4. Rewrite `AppLauncherPanel.tsx` — Enhanced In-Place

Replace the current 300-line component with a production-grade version. Key additions:

**Layout changes:**
- Add **Pinned Apps** row at top of right panel (before Frequently Used)
- Show **all apps** in left panel (installed + available + locked) with status indicators
- Badge rendering on app icons (count, new, update-available dots)
- Install CTA states: "Open" (installed), "Install" (available), lock icon (locked/requires-approval)

**Keyboard navigation:**
- Arrow keys navigate grid/list items
- Enter launches/installs
- Tab moves between sections (sidebar → list → grid → search)
- `Cmd+K` or `/` focuses search
- Escape closes

**Accessibility:**
- `role="dialog"` + `aria-label="App Launcher"` on container
- `role="listbox"` / `role="option"` for app items
- `aria-activedescendant` for keyboard focus tracking
- Focus trap within launcher
- Screen reader announcements for search results count
- `aria-live="polite"` region for dynamic content

**Quick actions:**
- Hover/long-press on app shows quick action popover
- Permission-filtered actions
- Click launches action directly

**Visual indicators:**
- Badge count pill on app icon
- "NEW" badge for `isNew` apps
- Update-available dot
- Locked/unavailable opacity + lock icon
- First-launch shimmer for never-opened installed apps

**Touch:**
- 44px minimum hit targets
- Swipe-right on left panel item to pin/unpin
- Long press for quick actions (replaces hover)

**Loading/empty states:**
- Skeleton grid during `isLoading`
- "No apps match" with suggested categories
- "No pinned apps — pin your favorites" prompt

### 5. Telemetry integration (inline in launcher)

Fire events through existing patterns:
```typescript
// Using console.info for now, wirable to analytics later
const trackLauncher = (event: string, data?: Record<string, unknown>) => {
  console.info(`[launcher:telemetry] ${event}`, data);
};
```

Events: `launcher_opened`, `launcher_closed`, `app_opened`, `app_installed_from_launcher`, `search_performed`, `quick_action_triggered`, `app_pinned`, `app_unpinned`.

### 6. Wire pinned apps persistence

Already exists in `AppPlatformContext` (`pinToDock`/`unpinFromDock` + `dockPinned`). The launcher will read `pinnedToDock` from merged app state — no new persistence needed.

### 7. Update admin barrel

Add the new hook to appropriate barrel in `src/features/` or keep in `src/hooks/`.

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/lib/app-platform/types.ts` | Edit | Add `AppQuickAction` interface + field |
| `src/lib/app-platform/catalog.ts` | Edit | Add `quickActions` to ~15 key apps |
| `src/hooks/useLauncherViewModel.ts` | **Create** | Composited launcher data + search ranking + telemetry |
| `src/components/sita/shell/AppLauncherPanel.tsx` | **Rewrite** | Full production launcher with all gaps closed |

**Total: 1 new file, 3 modified files**

## What This Does NOT Do
- Does not create a new launcher component (enhances existing)
- Does not duplicate AppPlatformContext logic
- Does not add new database tables (uses existing persistence)
- Does not break existing dock/shell integration (same props interface)

