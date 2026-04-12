

# Plan: Wire Remaining Settings Controls Through SettingsService

## Current State

The SettingsWindow already uses `useSettingsValue` for most controls:
- **General**: theme, uiSounds, reducedMotion ✅
- **Appearance**: accentColor, reduceTransparency ✅
- **Display**: brightness, nightShift ✅
- **Sound**: volume, uiSounds ✅
- **Network**: wifi.autoJoin ✅
- **Privacy**: locationServices, analytics, crashReports ✅
- **Keyboard**: keyRepeatRate ✅

## What Still Uses Local State (Needs Wiring)

1. **Notifications section** — `doNotDisturb`, `showPreviews`, `badges` use `useState`
2. **Bluetooth section** — `btOn` uses `useState`
3. **Keyboard section** — `autocorrect` uses `useState`
4. **AccessibilitySettings page** — all controls use uncontrolled `Switch`/`Slider` with no persistence

## Changes

### 1. Extend SettingsSchema (settings-service.ts)
Add missing keys to the schema and defaults:
- `notifications.doNotDisturb`, `notifications.showPreviews`, `notifications.badges`
- `bluetooth.enabled`
- `input.autocorrect`
- `accessibility.boldText`, `accessibility.reduceAutoPlayEffects`, `accessibility.fullKeyboardNav`, `accessibility.focusIndicators`, `accessibility.screenReaderOptimized`, `accessibility.announcementVerbosity`, `accessibility.textSize`

### 2. Wire SettingsWindow remaining sections (SettingsWindow.tsx)
Replace `useState` calls in `NotificationsContent`, `BluetoothContent`, and `KeyboardContent` with `useSettingsValue`.

### 3. Wire AccessibilitySettings page (AccessibilitySettings.tsx)
Import `useSettingsValue` and connect every toggle/slider/select to the corresponding schema key.

### Technical Notes
- All new keys get sensible defaults in `initDefaults()`
- Constraints added for numeric values (e.g., `accessibility.textSize` min 75 max 200)
- Existing `useSettingsValue` hook and localStorage persistence handle everything automatically — no new infrastructure needed
- Estimated ~80 lines of schema additions, ~30 lines of wiring fixes across 3 files

