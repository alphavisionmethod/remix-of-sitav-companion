

# Fix: User Profile Page Discovery & Navigation

## Problem

`UserProfilePage.tsx` exists at `/profile` with full edit/save/avatar functionality, but **zero navigation links** point to it anywhere in the UI. Users cannot find or reach their profile page.

## Root Cause

The user avatar/name block in the sidebar footer only has a sign-out action. There's no clickable path to `/profile` from the sidebar, top bar, or any menu.

## Implementation

### 1. Make sidebar user block link to profile

**Modify:** `src/components/sita/AppSidebar.tsx`

Change the user block at the bottom of the sidebar (lines 246-268) from a sign-out-only button to a two-part layout:
- Clickable avatar/name area that navigates to `/profile` via `useNavigate`
- Separate sign-out button (LogOut icon only)

This gives users an obvious, always-visible path to their profile.

### 2. Add profile link to SitaTopBar

**Modify:** `src/components/sita/SitaTopBar.tsx`

Add a small avatar button in the top bar that links to `/profile`. Clicking it navigates to the profile page. Uses the user's initials or avatar.

### 3. Add profile to command palette

**Modify:** `src/components/sita/shell/UniversalCommandSurface.tsx`

Add a navigation command entry: `{ id: "nav-profile", label: "My Profile", sublabel: "View and edit your profile", icon: User, path: "/profile", category: "navigate", keywords: ["profile", "account", "avatar", "settings"] }`

## Files

| File | Change |
|---|---|
| `src/components/sita/AppSidebar.tsx` | User block becomes clickable link to `/profile` + separate sign-out |
| `src/components/sita/SitaTopBar.tsx` | Add avatar/profile button |
| `src/components/sita/shell/UniversalCommandSurface.tsx` | Add profile command entry |

## What Won't Change
- `UserProfilePage.tsx` — already complete with avatar upload, edit fields, save, stats
- `App.tsx` routing — `/profile` route already registered
- Database schema — profiles table already has all needed columns

