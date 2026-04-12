

# Plan: Wire SettingsService to UI + Add Services Dashboard

## Summary
Three deliverables: (1) fix remaining TypeScript build errors, (2) wire the `SettingsService` into the Settings window so toggles/sliders read from and write to the service layer with persistence, (3) add a "Services" tab to the System Monitor showing real-time status of all 5 system services.

## 1. Fix TypeScript Build Errors

The build errors reference files that already have `const db = supabase as any` — the errors are likely from a stale build cache or the `as any` cast not fully propagating through chained methods. The fix is to ensure every `.from()`, `.insert()`, `.update()`, `.select()` chain is properly typed with intermediate `as any` casts where TypeScript still infers `never`.

**Files to touch (~8 files):** Add explicit type annotations or broader `any` casts on the return values (e.g., `const { data } = await db.from(...).select(...) as any`) in:
- `src/lib/ai/ai-launch-honesty-reclassifier.ts`
- `src/lib/ai/hooks/use-ai-runtime-verification.ts`
- `src/lib/ai/workforce-executor.ts`
- `src/lib/capabilities/money-capability.ts`
- `src/lib/core-services/mnemosyne/context-assembler.ts`
- `src/lib/customer-journey/ai-journey-classifier.ts`
- `src/lib/customer-journey/journey-hooks.ts`
- `src/lib/data-services/files-data-service.ts`

## 2. Wire SettingsService into Settings Window

Replace all local `useState` calls in the Settings window content components with reads/writes through the `SettingsService` singleton. This makes every toggle, slider, and color picker persist to IndexedDB automatically.

**Approach:** Create a `useSettingsValue(key)` React hook that:
- Reads initial value from `SettingsService.get(key)`
- Subscribes to changes via `SettingsService.subscribe(key, ...)`
- Returns `[value, setValue]` where `setValue` calls `SettingsService.set(key, value)`
- Cleans up subscription on unmount

**Settings window components to rewire:**

| Component | Settings Keys |
|-----------|--------------|
| `GeneralContent` | `appearance.theme`, `sound.uiSounds`, `appearance.reduceMotion` |
| `AppearanceContent` | `appearance.accentColor`, `appearance.reduceTransparency` |
| `DisplayContent` | `display.brightness`, `display.nightShift` |
| `SoundContent` | `sound.volume`, `sound.uiSounds` |
| `NotificationsContent` | DND flag, preview/sound/badge toggles |
| `PrivacyContent` | `privacy.locationServices`, `privacy.analytics`, `privacy.crashReports` |
| `KeyboardContent` | `input.keyRepeatRate` |

**New file:** `src/hooks/use-settings-value.ts` — the `useSettingsValue<K>` hook.

**Modified file:** `src/components/sita/shell/windows/SettingsWindow.tsx` — replace `useState` with `useSettingsValue` in each content component. Dark mode toggle also calls `document.documentElement.classList.toggle` as a side effect.

## 3. Add Services Dashboard to System Monitor

Add a 6th tab "Services" to the existing System Monitor window sidebar (currently: CPU, Memory, Processes, Network, GPU).

**New section renders:**
- Service list showing all 5 services with live status badges (running/stopped/failed) using `ServiceManager.getDiagnostics()`
- Per-service expandable cards showing `getStats()` output
- Boot log timeline from `ServiceManager.getBootLog()` with timing per service
- Health indicator dots (green/red/yellow)
- Combined stats summary card (total services, uptime, restart count)

**Modified file:** `src/components/sita/shell/windows/SystemMonitorWindow.tsx`
- Add `"services"` to the sidebar sections list
- Add `renderServices()` function
- Import `ServiceManager` from nova-sdk services

## Files

| Action | File |
|--------|------|
| Create | `src/hooks/use-settings-value.ts` |
| Modify | `src/components/sita/shell/windows/SettingsWindow.tsx` |
| Modify | `src/components/sita/shell/windows/SystemMonitorWindow.tsx` |
| Modify | 8 files with TypeScript build error fixes |

## Technical Details
- `useSettingsValue` uses `useState` + `useEffect` with `SettingsService.subscribe()` for reactivity
- Settings persist automatically through SettingsService's localStorage backend
- The dark mode toggle will additionally call `document.documentElement.classList.toggle("dark", value === "dark")` as a DOM side-effect
- Services dashboard polls `ServiceManager.getStats()` on a 2-second interval for live updates
- All UI uses existing Nova SDK components (NovaCard, NovaBadge, VStack/HStack, etc.)

