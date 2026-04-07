

# Fix Web Layer — Public Routes Must Not Boot Kernel

## Problem

All routes (including `/login`, `/signup`, `/forgot-password`, landing page) currently render inside the full OS provider tree:

```text
AuthProvider → ConnectivityProvider → ThemeProvider → RealityModeProvider →
DataModeProvider → DemoModeProvider → DisplayModeProvider → EntityContextProvider →
SitaKernelProvider → OSRuntimeProvider → InspectorProvider → PlatformInit
```

`PublicLayout` exists in `src/components/sita/PublicLayout.tsx` but is **never mounted**. Public routes boot the entire kernel unnecessarily.

Additionally, `LandingPage`, `Login`, and `Signup` all import `useDataMode` from the OS-level `DataModeContext` — coupling public pages to the authenticated provider tree.

## Root Cause

In `App.tsx` (lines 662–1529), the provider tree is flat — every provider wraps every route. There is no split between public and authenticated provider trees.

## Fix

### 1. Split the provider tree in `App.tsx`

Move the heavy providers (`DataModeProvider`, `DemoModeProvider`, `DisplayModeProvider`, `EntityContextProvider`, `SitaKernelProvider`, `OSRuntimeProvider`, `InspectorProvider`, `PlatformInit`) **inside** the authenticated routes only. Public routes get only `AuthProvider` + `ConnectivityProvider` + `ThemeProvider` + `RealityModeProvider`.

**Before** (simplified):
```
AuthProvider
  ThemeProvider
    DataModeProvider
      SitaKernelProvider
        OSRuntimeProvider
          PlatformInit
          <Routes>
            /login → Login
            /signup → Signup
            / → HomeRoute
            /* → ProtectedRoute → ShellLayout
```

**After:**
```
AuthProvider
  ThemeProvider
    RealityModeProvider
      <Routes>
        /login → PublicLayout → Login
        /signup → PublicLayout → Signup
        /forgot-password → PublicLayout → ForgotPassword
        /reset-password → PublicLayout → ResetPassword
        / → PublicLayout → HomeRoute
        /* → AuthenticatedShell (DataMode → DemoMode → Display → Entity → Kernel → OSRuntime → Inspector → PlatformInit → ShellLayout)
```

### 2. Remove `useDataMode` from public pages

- **`LandingPage.tsx`**: Remove `useDataMode` import and `isDemoMode` usage (it's unused in JSX anyway — only `signInAsDemo` from `useAuth` is used)
- **`Login.tsx`**: Remove `useDataMode` import. The `DemoModeBadge` component should handle its own fallback when DataModeContext is absent, OR we simply don't show demo badge on login when not in the OS tree
- **`Signup.tsx`**: Same — remove `useDataMode` import and `DemoModeBadge`

### 3. Create `AuthenticatedProviders` wrapper component

Extract the heavy provider nesting into a clean component to keep `App.tsx` readable:

```tsx
function AuthenticatedProviders({ children }: { children: ReactNode }) {
  return (
    <DataModeProvider>
      <DemoModeProvider>
        <DisplayModeProvider>
          <EntityContextProvider>
            <SitaKernelProvider>
              <OSRuntimeProvider>
                <InspectorProvider>
                  <PlatformInit />
                  {children}
                </InspectorProvider>
              </OSRuntimeProvider>
            </SitaKernelProvider>
          </EntityContextProvider>
        </DisplayModeProvider>
      </DemoModeProvider>
    </DataModeProvider>
  );
}
```

### 4. Wire `PublicLayout` into public routes

The existing `PublicLayout` component (already has `Suspense` + fallback) wraps all public routes.

## Files Modified

- **`src/App.tsx`** — Split provider tree; create `AuthenticatedProviders`; wrap public routes in `PublicLayout`; wrap authenticated routes in `AuthenticatedProviders`
- **`src/pages/LandingPage.tsx`** — Remove `useDataMode` import and `isDemoMode` variable
- **`src/pages/auth/Login.tsx`** — Remove `useDataMode` import; remove or guard `DemoModeBadge`
- **`src/pages/auth/Signup.tsx`** — Remove `useDataMode` import; remove or guard `DemoModeBadge`

## Result

- Public routes (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/`) boot only Auth + Theme + RealityMode — no kernel, no OS runtime, no PlatformInit
- `PublicLayout` is actually used
- Landing page has zero OS execution imports
- Auth pages are functionally correct with no kernel dependencies
- All 4 audit criteria pass at 100%

