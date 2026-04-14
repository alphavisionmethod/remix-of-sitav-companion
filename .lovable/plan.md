

# Fix: Business Onboarding Inside Window System

## Problem
The Business Onboarding (`FormationShell`) uses full-screen CSS (`min-h-screen`, `fixed inset-0`, `sticky top-0`). When accessed via the `/revenue-office/onboarding` route, it renders as a full-page experience **outside** the window system, so users cannot drag, close, or minimize the window. The desktop disappears entirely.

There are actually **two** onboarding paths that need to be reconciled:
1. **Route-based**: `/revenue-office/onboarding` → `BusinessOnboarding.tsx` → `FormationShell` (full 20-screen wizard, renders full-page)
2. **In-window**: `BusinessAppShell` shows `AdaptiveOnboardingWizard` (a lighter wizard) when `!isAdapted`

## Solution
Embed the full `FormationShell` onboarding **inside** the Business OS window instead of rendering it as a separate full-page route. This way the window chrome (title bar, drag handle, close/minimize/maximize) stays functional.

### Changes

**1. Make FormationShell window-friendly** (`FormationShell.tsx`)
- Replace `min-h-screen` with `h-full min-h-0`
- Replace `fixed inset-0` background effects with `absolute inset-0` inside the container
- Replace `sticky top-0` progress bar with a normal flow element
- Remove `useNavigate` redirect — completion is handled by the parent
- Accept an `onComplete` prop instead of navigating away
- Remove the `max-w-6xl mx-auto` constraint that wastes space in a window

**2. Wire FormationShell into BusinessAppShell** (`BusinessAppShell.tsx`)
- Replace `AdaptiveOnboardingWizard` with the full `FormationShell` when onboarding is incomplete
- When `!isCompleted` from `useBusinessOnboarding`, render `FormationShell` as the entire window content (replacing the sidebar + main layout)
- On completion, call `markComplete()` and switch to the normal shell view
- The window remains fully draggable/closeable throughout

**3. Update the route entry point** (`BusinessOnboarding.tsx`)
- Instead of rendering `FormationShell` directly, dispatch `sita-open-business` event with module `"onboarding"` and redirect to `/desktop` — same pattern as `BusinessCenter.tsx`
- This ensures even direct URL access opens Business OS as a window

**4. Add "onboarding" module to BusinessAppShell pages map**
- Register `"onboarding"` as a valid module that renders `FormationShell`
- This enables deep-linking: `sita-open-business` with `module: "onboarding"` works

### What stays the same
- All 20 onboarding screens, their logic, and auto-save behavior
- The `LiveOfficeSidebar` preview panel
- Database persistence via `useBusinessOnboarding` hook
- The Settings page for post-onboarding modifications

### Technical Details
- `FormationShell` background blobs: change from `fixed inset-0` to `absolute inset-0` within a `relative overflow-hidden` container
- Progress bar: change from `sticky top-0` to regular flow with `overflow-y-auto` on the parent
- The chapter transition overlay: change from `fixed inset-0 z-50` to `absolute inset-0 z-50` within the container
- `FormationShell` signature changes: `onComplete?: () => void` prop added, `useNavigate` removed
- `BusinessOnboarding.tsx` becomes a thin redirect shim (like `BusinessCenter.tsx`)

