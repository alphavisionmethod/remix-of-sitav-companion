<final-text>
Root cause I found:

- The launcher surfaces are speaking different app IDs.
- `APP_CATALOG` exposes catalog IDs like `sita-business-center`, `sita-money-center`, `sita-concierge`, and `sita-boardroom`.
- `ShellWindowLayer` only knows window IDs like `business`, `finance/money`, `concierge`, and `boardroom`.
- When a launcher passes a `sita-*` ID into `ShellWindowLayer`, it misses `APP_REGISTRY` and falls into the fallback UI that literally renders `{appId} Environment Loading...` — this matches your Boardroom symptom exactly.
- There is also split launch logic: Dock, App Launcher, FlowSpace, and desktop widgets do not all use the same resolver.
- Minor extra mismatch: `DesktopLeftRail` uses `/finance` while the real route is `/money`.

Plan to fix it fully:

1. Create one canonical launch mapping
- Add a single launch target field or resolver so catalog apps can map to real window apps:
  - `sita-business-center -> business`
  - `sita-money-center -> money` (or finance canonical alias)
  - `sita-concierge -> concierge`
  - `sita-boardroom -> boardroom`
- Put this in the shared app launch path so every launcher uses the same translation.

2. Fix the shared launcher
- Update `src/components/sita/shell/ShellWindowLayer.tsx` so launch flow becomes:
  - resolve alias / catalog ID
  - if mapped to a window app, open/focus that real app shell
  - else if the app has a `routePath`, navigate there
  - else if it has an external URL, open that
  - only use the placeholder fallback for truly unknown apps
- This removes the fake “Environment Loading...” state for mapped SITA apps.

3. Rewire every launch surface to use that same path
- `src/components/sita/DesktopDock.tsx`
  - stop using its separate `OS_WINDOW_APPS` branching as the source of truth
  - delegate app clicks through the shared launcher
  - normalize running-state checks so dock indicators still work even when catalog IDs and window IDs differ
- `src/components/sita/shell/ShellLiveLayer.tsx`
  - change FlowSpace / app-grid launches to use the shared launcher, not raw `doLaunchApp`
- `src/pages/DesktopPage.tsx`
  - keep using the shared hook after the resolver is fixed so Quick Actions and desktop widgets launch correctly too

4. Clean up route mismatches
- `src/components/sita/shell/desktop/DesktopLeftRail.tsx`
  - change Finance from `/finance` to `/money` or route it through the same launcher
- Check any other desktop/menu surfaces that still hardcode route aliases instead of using canonical launch targets.

5. Verify end-to-end
- Confirm these all open the real app shells, not placeholders:
  - Business
  - Finance / Money
  - Concierge
  - Boardroom
- Test from:
  - desktop quick actions
  - app launcher / main menu
  - mission control / FlowSpace
  - dock
- Confirm repeat clicks focus the existing window instead of creating alias duplicates
- Confirm Boardroom opens `BoardroomAppShell` and the intro settles normally
- Confirm mobile still routes correctly for `/money`

Files I would update:
- `src/lib/app-platform/types.ts`
- `src/lib/app-platform/catalog.ts`
- `src/components/sita/shell/ShellWindowLayer.tsx`
- `src/components/sita/DesktopDock.tsx`
- `src/components/sita/shell/ShellLiveLayer.tsx`
- `src/pages/DesktopPage.tsx`
- `src/components/sita/shell/desktop/DesktopLeftRail.tsx`

No database changes. No new dependencies.
</final-text>