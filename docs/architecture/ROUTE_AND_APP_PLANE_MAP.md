# SITA OS — Route & App Plane Map

> **Status:** Canonical
> **Source of truth:** `src/lib/architecture/route-plane-map.ts`
> **CI gate:** `scripts/architecture/checks/check-route-plane-coverage.ts`

Every URL prefix and every app in the launcher belongs to exactly **one canonical plane**
and declares which **deployment profiles** can see it.

---

## Routes by Plane

### Core OS (no user-facing routes — substrate only)

### Shell Runtime (shared by both profiles)
- `/launcher` — shared app launcher
- `/notifications` — shared notifications center
- `/settings` — shared settings (role-aware sections)
- `/search` — shared command/search palette
- `/auth` — auth flows

### User Product Plane (user profile only)
- `/desktop` — user OS desktop home
- `/business` — Business OS
- `/money` — Money / Finance OS
- `/concierge` — AI Concierge
- `/files` — Files app *(also visible in operator profile)*
- `/boardroom` — Boardroom advisor surface
- `/workspace` — user workspace
- `/apps` — app store / launcher
- `/cloud` — cloud surfaces

### Admin Control Plane (operator profile only)
- `/admin` — Admin Control Plane root *(`admin.view`)*
- `/admin/founder` — Founder strategic console *(`founder.view`)*
- `/admin/engineering` — Engineering ops *(`engineering.view`)*
- `/admin/release` — Release readiness & gates *(`release.view`)*
- `/admin/observability` — Observability *(`audit.view`)*
- `/admin/support` — Support diagnostics *(`support.view`)*
- `/admin/security` — Security & kill-switches *(`security.view`)*
- `/admin/verification` — Truth & reality audit *(`verification.view`)*

### Backend Services
- `/api` — backend-services HTTP/edge surfaces

---

## Apps by Plane

| App | Plane | Profiles |
|---|---|---|
| Business OS | user | user |
| Money OS | user | user |
| Concierge | user | user |
| Files | user | user, operator |
| Boardroom | user | user |
| App Store | user | user |
| Settings | shell-runtime | user, operator |
| Notifications | shell-runtime | user, operator |
| Observability | admin | operator |
| Release Center | admin | operator |
| Verification Center | admin | operator |
| Kill Switch Center | admin | operator |
| Support Diagnostics | admin | operator |
| AI Governance | admin | operator |

---

## Hard Rules

1. **Every `src/pages/*` route MUST have a matching prefix** in `route-plane-map.ts`.
2. **Every app in the launcher registry MUST declare `plane` + `profiles[]`.**
3. **Routes from the user plane MUST NOT be reachable in operator-only navigation.**
4. **Routes from the admin plane MUST NOT appear in user-only navigation.**

CI fails the build if any rule is violated.
