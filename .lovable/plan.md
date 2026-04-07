

# Fix: Add Desktop Shell Route & Verify Edge Functions

## Edge Functions Status: All 100% Substantive

After auditing all 50 edge functions by line count and code review, **every single one is fully implemented** with:
- Zod input validation
- CORS handling
- Auth (JWT or admin role checks)
- Rate limiting
- Real database operations (no stubs, no TODOs)

No edge function changes needed.

## Desktop Shell Gap

`DesktopSurface` (411 lines, fully built) is **never routed**. It lives at `src/components/sita/shell/DesktopSurface.tsx` with live data wiring (cashflow, CRM), boardroom preview, today's focus, quick actions, continuity tracking, and trust posture display — but no user can reach it.

Currently, authenticated `/` and `/home` both render `DailyPulse`. The DesktopSurface is the richer, OS-native "home screen" that should be the primary landing experience.

## Implementation

### 1. Create `src/pages/DesktopPage.tsx`

A thin wrapper page that:
- Imports `DesktopSurface` from `@/components/sita/shell`
- Imports `useShellState` to feed live trust posture, notifications, and continuity data
- Passes the universal command surface opener via callback
- Renders DesktopSurface with all props wired

### 2. Add `/desktop` route to `App.tsx`

- Add lazy import for `DesktopPage`
- Add route `<Route path="/desktop" element={<DesktopPage />} />` inside the ShellLayout block
- Change `<Route path="/" element={<DailyPulse />} />` to `<Route path="/" element={<DesktopPage />} />` so the desktop is the default authenticated home
- Keep `/home` pointing to `DailyPulse` as an alternative view

### 3. Add Desktop to sidebar navigation (`AppSidebar.tsx`)

- Add a "Desktop" entry at the top of the primary nav items (icon: `Layout` or `Monitor`, path: `/desktop`)
- Ensures discoverability

### 4. Add Desktop to command palette (`UniversalCommandSurface.tsx`)

- Add navigation command: `{ id: "nav-desktop", label: "Desktop", sublabel: "OS home screen", path: "/desktop", category: "navigate" }`

## Files

| Action | File |
|---|---|
| Create | `src/pages/DesktopPage.tsx` |
| Modify | `src/App.tsx` — add lazy import + `/desktop` route, change `/` default |
| Modify | `src/components/sita/AppSidebar.tsx` — add Desktop nav item |
| Modify | `src/components/sita/shell/UniversalCommandSurface.tsx` — add Desktop command |

