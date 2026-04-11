

# SITA OS — App Launch + Google Workspace Bundle

## What This Does

1. **Make internal SITA apps launchable** — clicking "Open" from App Library, App Detail, or Install Sheet navigates to the app's `routePath`. Currently the "Open" button is a dead element with no click handler.

2. **Make external web apps openable** — clicking "Open" on external apps (Chrome, YouTube, etc.) opens them in a new browser tab via `window.open()`.

3. **Add Google Workspace bundle** — Google Docs, Sheets, Drive, Calendar, Meet, Gmail grouped as a one-click bundle in the App Store.

## Changes

### 1. `src/pages/app-platform/AppDetailPage.tsx`
- Wire the "Open" button (line 99) to navigate to `app.routePath` for internal apps, or `window.open()` for web apps
- Add an `externalUrl` check for web-app class apps

### 2. `src/pages/app-platform/AppLibraryPage.tsx`
- Add double-click or primary click behavior: internal apps with `routePath` navigate directly instead of going to the detail page
- Add an "Open" quick-action button on each app card for installed apps

### 3. `src/components/sita/app-platform/AppStoreComponents.tsx`
- Wire `InstallSheet`'s "Open" callback to actually launch the app (pass `routePath` or external URL to the `onOpen` callback)

### 4. `src/pages/app-platform/AppStorePage.tsx`
- Update `onOpen` callback in InstallSheet to navigate to app route

### 5. `src/lib/app-platform/catalog.ts`
- Add `externalUrl` field to external web apps (Google Docs → `https://docs.google.com`, etc.)
- Add Google Workspace bundle: Gmail, Google Docs, Sheets, Drive, Calendar, Meet
- Ensure all internal SITA apps have correct `routePath` values

### 6. `src/lib/app-platform/types.ts`
- Add optional `externalUrl?: string` field to `AppDefinition` for web apps that open in browser

## Technical Detail

App launch logic (shared helper):
```typescript
function launchApp(app: AppDefinition, navigate: NavigateFunction) {
  if (app.routePath) {
    navigate(app.routePath);
  } else if (app.externalUrl) {
    window.open(app.externalUrl, '_blank', 'noopener');
  }
}
```

Internal apps use `routePath`, external web apps use `externalUrl`, and the App Library grid gets a visible "Open" button for installed apps alongside the existing detail-page navigation.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/app-platform/types.ts` | Add `externalUrl?: string` to AppDefinition |
| `src/lib/app-platform/catalog.ts` | Add `externalUrl` to web apps, add Google Workspace bundle |
| `src/pages/app-platform/AppDetailPage.tsx` | Wire Open button with launch logic |
| `src/pages/app-platform/AppLibraryPage.tsx` | Add Open button on installed app cards |
| `src/pages/app-platform/AppStorePage.tsx` | Wire InstallSheet onOpen to launch app |
| `src/components/sita/app-platform/AppStoreComponents.tsx` | Pass app data through onOpen callback |

