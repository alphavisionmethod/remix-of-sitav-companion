

# Fix: Landing Page, User Profile Page, and Onboarding Routing

## Problems Identified

1. **No landing page** — Unauthenticated users hitting `/` are redirected straight to `/login`. There's no public-facing landing/marketing page that introduces SITA OS.
2. **No user profile page** — `/settings/profile` just renders the generic `SettingsPage`. No dedicated `/profile` route exists for users to view/edit their profile.
3. **Onboarding not routed correctly** — `/onboarding` sits outside `ProtectedRoute`, meaning unauthenticated users can reach it but the component calls `useAuth().user` and breaks. It should be wrapped in `ProtectedRoute` with an exception to skip the onboarding-redirect loop.

## Implementation

### Step 1 — Create Public Landing Page

**Create:** `src/pages/LandingPage.tsx`

A premium dark-themed public page with:
- Hero section: SITA OS tagline, "Your sovereign AI operating system", animated ambient background
- 3 value proposition cards (Business OS, Finance OS, Concierge OS)
- Trust indicators (receipt-first, policy-governed, privacy-safe)
- CTA buttons: "Get Started" → `/signup`, "Try Demo" → calls `signInAsDemo`, "Sign In" → `/login`
- SITA brand colors (purple/gold), Space Grotesk headings, Inter body
- Fully responsive, no auth required

### Step 2 — Create User Profile Page

**Create:** `src/pages/UserProfilePage.tsx`

A dedicated profile page at `/profile` with:
- Profile header: avatar (with upload), display name, email, member since
- Editable fields: full name, timezone, locale, bio
- Account stats: days active, actions executed, receipts generated (from live queries)
- Connected services summary (count from `connected_services`)
- Trust score display
- Quick links to `/settings/trust`, `/settings/privacy`
- Wired to `profiles` table via Supabase

### Step 3 — Fix Onboarding Routing

**Modify:** `src/App.tsx`

1. Change `/onboarding` route from bare `<Onboarding />` to wrapped in a lightweight auth gate that redirects to `/login` if no user, but does NOT redirect back to `/onboarding` (avoiding infinite loop)
2. Update `ProtectedRoute` to also allow `/profile` route normally
3. Add `/` as a public route rendering `LandingPage` when not authenticated, `DailyPulse` when authenticated
4. Add `/profile` route inside `ProtectedRoute`
5. Add lazy import for `LandingPage` and `UserProfilePage`

**Routing logic change:**
```text
/ → Unauthenticated: LandingPage | Authenticated: DailyPulse (inside ShellLayout)
/onboarding → Requires auth (redirect to /login if not), skips onboarding-completion check
/profile → ProtectedRoute → UserProfilePage
```

### Files

| Action | File |
|---|---|
| Create | `src/pages/LandingPage.tsx` |
| Create | `src/pages/UserProfilePage.tsx` |
| Modify | `src/App.tsx` — new routes, fix onboarding guard, landing page logic |

