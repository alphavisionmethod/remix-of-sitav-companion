

# SITA OS — 7 Frontend Optimizations

## 1. Resource Hints in `index.html`
Add `preconnect` and `dns-prefetch` for Supabase and AI gateway in `<head>` before other tags:
```html
<link rel="preconnect" href="https://icrkipwlnuopqbsabngy.supabase.co" />
<link rel="dns-prefetch" href="https://icrkipwlnuopqbsabngy.supabase.co" />
<link rel="preconnect" href="https://ai.gateway.lovable.dev" />
```

## 2. Delete Dead `App.css`
`src/App.css` contains Vite boilerplate (logo-spin, `.read-the-docs`, `#root max-width: 1280px`). No file imports it. Delete the file entirely.

## 3. React.memo on Shell Components
Wrap `MobileBottomNav`, `SitaTopBar`, and `AppSidebar` exports with `React.memo` to prevent re-renders from unrelated context changes. Memoize callback props (`onNotifOpen`, etc.) with `useCallback` in `ShellLayout`.

## 4. Route Prefetch on Hover
Create `src/hooks/useRoutePrefetch.ts` — a small hook that calls the lazy `import()` for a route's chunk on `mouseenter`/`touchstart` of nav links. Integrate into `NavLink` component and `MobileBottomNav` so pages load before the user clicks.

## 5. Skeleton Fallbacks for Lazy Shell Features
Replace `<Suspense fallback={null}>` in `ShellLayout.tsx` with lightweight skeleton placeholders for visible lazy elements (ContextualRail, CompanionBar, CopilotBar) to eliminate layout shift. Non-visible elements (modals, overlays) keep `fallback={null}`.

## 6. Context Consolidation
- Merge `ThemeContext` + `DisplayModeContext` → `AppearanceContext` (single provider, combined hook `useAppearance`)
- Merge `DataModeContext` + `DemoModeProvider` → unified `DataModeContext` (demo surface registry moves into existing DataMode provider)
- Update all imports across the codebase (search-and-replace)

## 7. Font Preloading
Add `<link rel="preload">` for the primary Space Grotesk weight used on first paint. The Google Fonts import in `index.css` already uses `display=swap`, which is correct — the preload hint will warm the connection earlier.
```html
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600&display=swap" as="style" />
```

---

## Files Changed

| File | Change |
|------|--------|
| `index.html` | Add preconnect, dns-prefetch, font preload hints |
| `src/App.css` | **Delete** |
| `src/components/sita/MobileBottomNav.tsx` | Wrap with `React.memo` |
| `src/components/sita/SitaTopBar.tsx` | Wrap with `React.memo` |
| `src/components/sita/AppSidebar.tsx` | Wrap with `React.memo` |
| `src/components/sita/ShellLayout.tsx` | `useCallback` for handlers, skeleton fallbacks for visible lazy components |
| `src/hooks/useRoutePrefetch.ts` | **New** — prefetch route chunk on hover |
| `src/components/NavLink.tsx` | Integrate prefetch on hover |
| `src/contexts/AppearanceContext.tsx` | **New** — merged Theme + DisplayMode |
| `src/contexts/ThemeContext.tsx` | **Delete** (merged) |
| `src/contexts/DisplayModeContext.tsx` | **Delete** (merged) |
| `src/contexts/DataModeContext.tsx` | Absorb DemoModeProvider surface registry |
| `src/contexts/DemoModeProvider.tsx` | **Delete** (merged) |
| `src/App.tsx` | Update provider tree (fewer nested providers), update imports |
| ~20 consumer files | Update `useTheme`/`useDisplayMode` → `useAppearance`, `useDemoMode` → `useDataMode` |

