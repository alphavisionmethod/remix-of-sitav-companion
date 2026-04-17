

## Plan: Wire the macOS-style top menu bar (SystemMenuBar) end-to-end

The top bar is `src/components/sita/shell/SystemMenuBar.tsx`. Right-side icons (Search, Control Center, Notifications, Trust, Avatar, Wifi, Clock) are already wired. The **brand** ("SITA Desktop"), the **5 menu buttons** (File, Edit, View, Window, Help), and the apostrophe-style left logo do **nothing** when clicked — just toggle a local `activeMenu` flag with no dropdown rendered.

### What each entry will do (final menu spec)

**🍎 SITA brand menu** (click logo or "SITA")
- About SITA OS — opens About dialog (version, build, runtime, copyright)
- System Settings… — `openWindow("settings")` (⌘,)
- App Store — dispatch `sita-open-app-store`
- Mission Control — dispatch `sita-open-mission-control`
- ─
- Lock Screen — dispatch `sita-lock-screen` (⌃⌘Q)
- Sign Out… — confirm → `signOut()` from AuthContext
- Restart Shell — `window.location.reload()`

**Desktop (active app) menu** (click "Desktop" / activeApp label)
- About this app — info dialog about current app
- Preferences… — opens settings scoped to active app (⌘,)
- Hide window — minimizes focused window (⌘H)
- Quit — closes focused window (⌘Q)

**File**
- New Window — `openWindow("files")` (⌘N)
- Open Search… — calls `onSearchOpen()` (⌘K)
- Open File… — opens FilePickerService (⌘O)
- ─
- Save — dispatch `sita-save-active` (⌘S) — handled by active app if listening
- Export… — dispatch `sita-export-active`
- ─
- Close Window — closes focused window (⌘W)

**Edit**
- Undo / Redo — `document.execCommand` fallback + dispatch `sita-undo`/`sita-redo` (⌘Z / ⇧⌘Z)
- Cut / Copy / Paste — `document.execCommand` (⌘X / ⌘C / ⌘V)
- Select All — (⌘A)
- ─
- Find in App — dispatch `sita-find-in-app` (⌘F)

**View**
- Toggle Sidebar — dispatch `sita-toggle-sidebar` (⌃⌘S)
- Toggle Dock Auto-Hide — dispatch `sita-toggle-dock`
- Show Widgets Gallery — dispatch `sita-open-widget-picker` (already wired upstream)
- Enter Full Screen — `document.documentElement.requestFullscreen()` / exit (⌃⌘F)
- ─
- Theme: Light / Dark / System — sets theme
- Zoom In / Out / Actual Size (⌘+ / ⌘− / ⌘0) — adjusts root font-size

**Window**
- Minimize — minimize focused window (⌘M)
- Zoom (Maximize toggle) — maximize focused window
- ─
- Bring All to Front — focus all windows in order
- Cascade Windows — repositions open windows in cascade
- Close All — closes every open window
- ─
- Dynamic list of currently open windows (click → focus) with checkmark on focused one

**Help**
- SITA Help… — `openWindow("help")` or opens help center route
- Keyboard Shortcuts — opens shortcuts modal (⌘/)
- Documentation — `window.open("https://docs.lovable.dev")`
- Report an Issue — `openWindow("support")` or mailto
- ─
- What's New — opens release notes / changelog
- About SITA OS — same as brand About

### Implementation approach

1. **Refactor `SystemMenuBar.tsx`** to render a real dropdown menu under each clicked label (Radix `DropdownMenu` already in repo). Click toggles open; hover-to-switch when one is already open (true macOS behavior — current code half-supports this).
2. **Make brand + activeApp label clickable** as menu triggers (Apple menu + App menu).
3. **Create `src/lib/system-menu/menu-actions.ts`** — pure action functions (`openSettings()`, `lockScreen()`, `cascadeWindows()`, `closeAllWindows()`, `toggleFullscreen()`, `setTheme()`, etc.) so menus stay declarative.
4. **Create `src/components/sita/shell/AboutDialog.tsx`** — small modal for "About SITA OS".
5. **Add `useGlobalShortcuts` hook** mounted in `ShellLayout` for the keyboard shortcuts (⌘N, ⌘W, ⌘M, ⌘K, ⌘,, ⌘/, ⌃⌘F, ⌃⌘Q, ⌘+, ⌘−, ⌘0). Skip when typing in inputs.
6. **Wire WindowManager actions**: pass `useWindowManagerContext()` into the menu so Window menu can list/focus/close/cascade real windows.
7. **Wire AuthContext** (`signOut`) and `useTheme` (already in repo) for the Sign Out and Theme items.
8. **Dispatch app-level events** (`sita-save-active`, `sita-find-in-app`, `sita-toggle-sidebar`, `sita-toggle-dock`, `sita-lock-screen`) so any current/future app can opt in by listening — no dead buttons (each comes with at least a fallback toast "Not available for this view" so we never silently no-op).

### Files

**New (3)**
- `src/lib/system-menu/menu-actions.ts` — action layer
- `src/lib/system-menu/menu-spec.tsx` — declarative menu tree (icons, shortcuts, handlers)
- `src/components/sita/shell/AboutDialog.tsx` — About modal
- `src/hooks/useGlobalShortcuts.ts` — keyboard wiring

**Edited (2)**
- `src/components/sita/shell/SystemMenuBar.tsx` — render real dropdowns + brand/app menus
- `src/components/sita/ShellLayout.tsx` — mount `useGlobalShortcuts` + `AboutDialog` portal + lock-screen overlay listener

### Acceptance

- Every button in the top bar opens a dropdown or fires its action (no dead clicks)
- All 5 menus + Apple menu + App menu fully populated and functional
- Window menu lists every currently-open window and can focus/close them
- Keyboard shortcuts work globally and don't conflict with input typing
- Dark/Light/System theme toggle persists across reloads
- Sign Out actually signs the user out; Lock Screen overlays a lock UI
- Cascade / Close All visibly reposition / close real windows
- Fullscreen, About dialog, and Documentation link all work
- 0 TS errors

