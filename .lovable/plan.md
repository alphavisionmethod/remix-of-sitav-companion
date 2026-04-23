

## Make Control Room the only "all-apps" view; every other app opens standalone

### What you'll see after this change

- **Click "Control Room"** in the dock/desktop → you land on `/owner` and see the current full multi-app sidebar (Concierge, Files, Favorites: Revenue, Boardroom, Intelligence, Calendar, Tasks, etc.) — exactly the layout in your screenshot. This is the central command surface.
- **Click any other app** (Tasks, Business, Money, Files, Concierge, Boardroom, Calendar, etc.) → opens in a **focused single-app window**:
  - No global cross-app sidebar.
  - Only that app's own internal navigation/tabs are shown (e.g. Tasks shows Overview / Board / Queue / Dependencies / Assigned / Workflows / Review only).
  - Top bar keeps system controls (search, notifications, clock, profile) and a "Back to Control Room" affordance.
- **Desktop (`/home`, `/`, `/desktop`)** stays unchanged — the OS desktop with icons and dock.

### How it works (technical)

1. **Introduce a "Control Room route" allow-list** in `src/components/sita/ShellLayout.tsx`. The global `AppSidebar` currently renders on every non-desktop route (`{!isDesktopRoute && <AppSidebar />}`). Change the gate to:
   ```ts
   const isControlRoomRoute = location.pathname.startsWith("/owner");
   const isDesktopRoute = /* unchanged */;
   const showGlobalSidebar = isControlRoomRoute; // ONLY here
   ```
   Then render `<AppSidebar />` only when `showGlobalSidebar` is true.

2. **Standalone app chrome for non-Control-Room apps.** When neither desktop nor Control Room, wrap `children` in a new lightweight `StandaloneAppFrame` that provides:
   - The app's own header (title + icon, sourced from a small `APP_REGISTRY` keyed by route prefix: `/tasks`, `/business`, `/money`, `/concierge`, `/files`, `/boardroom`, `/calendar`, `/intelligence`, `/revenue-office`, `/settings`, `/app-store`).
   - A "← Control Room" back button (navigates to `/owner`) and a "Desktop" button (navigates to `/home`).
   - No cross-app navigation. Only the app's internal tabs (already rendered by each page itself, e.g. `DomainAppShell`'s `AppSidebarNav`) remain visible.

3. **Update Control Room's sidebar contents.** In `src/components/sita/AppSidebar.tsx`:
   - Keep the current Primary / Favorites / Recents / Bottom groups — this is the Control Room's purpose.
   - Remove the "Control Room" entry from `bottomNav` (since you're already in it). Replace with a "Leave Control Room → Desktop" item.

4. **Dock & desktop launchers stay the same.** Clicking any app icon from the Desktop or Dock still navigates to that app's route; the new shell logic ensures it renders standalone, not embedded in the multi-app sidebar.

5. **Mobile is untouched.** `MobileBottomNav` and `/mobile/*` routes keep their existing behavior.

### Files to change

- `src/components/sita/ShellLayout.tsx` — gate `AppSidebar` to Control Room only; wrap other routes in `StandaloneAppFrame`.
- `src/components/sita/shell/StandaloneAppFrame.tsx` *(new)* — header + back-to-Control-Room chrome, app registry lookup.
- `src/components/sita/AppSidebar.tsx` — drop the in-sidebar "Control Room" link; add "Leave → Desktop".
- No route changes, no data changes, no DB changes.

### Out of scope

- The desktop OS (`/home`) layout, dock, and window manager behavior.
- Each app's internal nav (Tasks tabs, Business sub-modules, etc.) — those already exist and stay as-is.
- Mobile shell.

