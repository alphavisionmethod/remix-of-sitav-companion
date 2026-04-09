

# SITA OS — Screen & Route Inventory: OS vs App Separation Audit

## Total Route Count: 704 routes across 1,549-line App.tsx

The system is fully wired with a clear 4-tier separation. Here's the complete map:

---

## Tier 1: Public (No OS Providers — PublicLayout only)
5 routes. Clean. No kernel, no runtime.

| Route | Component |
|-------|-----------|
| `/` | HomeRoute (landing or redirect) |
| `/login` | Login |
| `/signup` | Signup |
| `/forgot-password` | ForgotPassword |
| `/reset-password` | ResetPassword |

**Wrap**: `PublicLayout` → `PublicRoute` (redirects authenticated users to `/`)

---

## Tier 2: Authenticated, No Shell (OS Providers, no ShellLayout)
~12 routes. Setup/onboarding/mobile — they get OS providers but no sidebar/frame.

| Group | Routes |
|-------|--------|
| Onboarding | `/onboarding`, `/first-win`, `/learn-later`, `/auth/callback` |
| Mobile shell | `/mobile`, `/mobile/approvals`, `/mobile/proof`, `/mobile/alerts`, `/mobile/boardroom`, `/mobile/workflow/:id`, `/mobile/receipt/:id`, `/mobile/approval/:id`, `/mobile/settings` |

**Wrap**: `AuthenticatedProviders` (DataMode, DemoMode, DisplayMode, Entity, Kernel, OSRuntime, Inspector) → `ProtectedRoute` or `OnboardingGuard`

---

## Tier 3: Full OS Shell (Authenticated + ShellLayout = sidebar, header, command palette)
~380 routes. This is the "OS experience" — the user's daily operating environment.

### 3A. OS Core Spaces (the 5 primary sidebar items)
| Space | Route prefix | Routes | Component pattern |
|-------|-------------|--------|-------------------|
| Home / Desktop | `/home`, `/desktop` | ~3 | `DailyPulse`, `DesktopPage` |
| Business | `/business/*` | ~17 | `BusinessCenter` (tab-based sub-routing) |
| Money | `/money/*` | ~17 | `MoneyCenter` (tab-based sub-routing) |
| Concierge | `/concierge/*` | ~14 | `ConciergeCenter` (tab-based sub-routing) |
| Boardroom | `/boardroom/*` | ~10 | `Boardroom` (tab-based sub-routing) |

### 3B. OS Intelligence & Workspace Surfaces
| Group | Route prefix | Routes |
|-------|-------------|--------|
| Investments | `/investments/*` | ~38 |
| Revenue Office | `/revenue-office/*` | ~40 |
| Digital Presence | `/digital-presence/*` | ~19 |
| Workflows | `/workflows/*` | ~4 |
| Proof Center | `/proof/*` | ~5 |
| Files | `/files/*` | ~9 |
| Memory | `/memory/*` | ~6 |
| Automation | `/automation/*` | ~4 |
| System Status | `/system/*` | ~8 |
| Personalization | `/personalization/*` | ~5 |
| Settings | `/settings/*` | ~10 |
| Owner Center | `/owner/*` | ~28 |
| Governance | `/governance/*` | ~5 |
| Enterprise | `/enterprise/*` | ~6 |
| Mission Control | `/mission-control/*` | ~11 |
| Mission Drill-Down | `/mission/*` | ~10 |
| ATLAS | `/atlas/*` | ~11 |
| Integrations | `/integrations/*` | ~5 |
| Advisors | `/advisors/*` | ~3 |
| Connectors | `/connectors` | 1 |
| Policies | `/policies` | 1 |
| Search | `/search` | 1 |

### 3C. OS Built-in Apps
| Route | App |
|-------|-----|
| `/apps/email` | EmailApp |
| `/apps/messenger` | MessengerApp |
| `/apps/vault` | VaultApp |
| `/apps/health` | HealthApp |
| `/apps/gallery` | GalleryApp |
| `/apps/weather-news` | WeatherNewsApp |

### 3D. OS Workspaces (productivity surfaces)
| Route | Workspace |
|-------|-----------|
| `/calendar` | CalendarWorkspace |
| `/notes` | NotesWorkspace |
| `/people` | PeopleWorkspace |
| `/team` | TeamWorkspace |
| `/editor` | DocumentEditor |
| `/reporting` | ReportingWorkspace |
| `/trust` | TrustCenter |
| `/media` | MediaWorkspace |
| `/templates` | TemplateCenter |
| `/import-export` | ImportExportCenter |
| `/workspace/principal` | PrincipalWorkspace |
| `/workspace/operator` | OperatorWorkspace |
| `/workspace/docs` | DocsWorkspace |
| `/workspace/sheets` | SheetsWorkspace |
| `/workspace/slides` | SlidesWorkspace |

### 3E. App Platform (Install/manage third-party apps)
| Route | Page |
|-------|------|
| `/app-store` | AppStorePage |
| `/app-store/app/:appId` | AppDetailPage |
| `/app-store/library` | AppLibraryPage |
| `/app-store/bundle/:bundleId` | BundleDetailPage |
| `/app-store/updates` | AppUpdatesPage |
| `/app-store/permissions` | AppPermissionsCenterPage |
| + 10 more app-store routes | |
| `/store` | PackStorePage |
| `/store/:packId` | PackDetailPage |
| `/store/installed` | PackInstalledPage |
| + 3 more store routes | |

---

## Tier 4: Admin / Builder (Authenticated + Shell, `/admin/*` prefix)
~280 routes. Internal platform governance — not user-facing OS.

| Subsystem | Prefix | Routes |
|-----------|--------|--------|
| Core Admin | `/admin/dashboard`, `/admin/team`, etc. | ~20 |
| AI Engineering | `/admin/ai-*` | ~17 |
| DRS (Dual Reality) | `/admin/drs/*` | ~10 |
| SAG (AI Gateway) | `/admin/sag/*` | ~12 |
| Automation Reality | `/admin/automation/*` | ~9 |
| Launch Truth | `/admin/truth/*` | ~7 |
| Verification | `/admin/verification/*` | ~7 |
| Customer Journey | `/admin/customer-journey/*` | ~9 |
| Connector Reality | `/admin/connectors/*` | ~7 |
| MSA (Multi-Surface) | `/admin/msa/*` | ~5 |
| PFA (Provider Families) | `/admin/pfa/*` | ~11 |
| ISA (Identity/Security) | `/admin/isa/*` | ~7 |
| AIG (AI Gateway v2) | `/admin/aig/*` | ~9 |
| UAO (Ambient OS) | `/admin/uao/*` | ~8 |
| DWE (Devices/Wearables) | `/admin/dwe/*` | ~7 |
| APL (Apple Ecosystem) | `/admin/apl/*` | ~6 |
| AND (Android Ecosystem) | `/admin/and/*` | ~5 |
| HRS (Health/Signals) | `/admin/hrs/*` | ~6 |
| NRC (Notifications) | `/admin/nrc/*` | ~11 |
| NSS (Native Shell) | `/admin/nss/*` | ~4 |
| CPS (Core Persistence) | `/admin/core-persistence`, etc. | ~10 |
| Delivery OS | `/admin/feature-*`, `/admin/delivery-*` | ~10 |
| FIP (Feature Protocol) | `/admin/fip/*` | ~14 |
| REX (Recommendation) | `/admin/rex/*` | ~5 |
| FL (Flagship Loops) | `/admin/flagship/*` | ~2 |
| SERV (Service Ownership) | `/admin/services/*` | ~6 |
| LAUNCH (Launch Center) | `/admin/launch/*` | ~6 |
| Security Command | `/admin/security/*` | ~6 |
| Frontend Quality | `/admin/frontend/*` | ~2 |
| Architecture | `/admin/architecture/*` | ~3 |
| Reality boards | `/admin/reality-*`, `/admin/mock-*` | ~10 |
| AIT (AI Team) | `/admin/ait/*` (referenced) | ~5 |

---

## The OS vs App Distinction — Is It Clear?

**YES — the architecture is correctly separated:**

```text
Public (5)
  └─ PublicLayout only (no kernel, no OS)

Authenticated No-Shell (12)
  └─ OS providers active, but no shell chrome
  └─ Onboarding ceremony, mobile shell

Full OS Shell (~380)
  ├─ OS Core: business/money/concierge/boardroom/home
  ├─ OS Offices: investments/revenue/digital-presence
  ├─ OS Workspaces: calendar/notes/docs/sheets/slides
  ├─ OS Built-in Apps: email/messenger/vault/health/gallery/weather
  ├─ OS Utilities: search/policies/connectors/settings
  └─ App Platform: store/library/manage (third-party apps)

Admin/Builder (~280)
  └─ /admin/* — platform governance, not user OS
```

**What mixes together correctly:**
- `AuthenticatedProviders` wraps ALL authenticated routes (OS + Admin)
- `ShellLayout` wraps both OS and Admin (sidebar navigation adapts)
- `ProtectedRoute` enforces auth + onboarding completion for all
- Admin routes are just deeper shell routes — same providers, same shell

**What stays separate correctly:**
- Public routes have NO kernel/runtime/entity context
- Mobile routes bypass ShellLayout (own navigation)
- Onboarding bypasses ShellLayout (ceremony experience)
- Setup/boot experience is its own world (OSSetupExperience)

## Potential Concerns

1. **App.tsx is 1,549 lines** — functional but could benefit from route-group extraction (e.g., `AdminRoutes.tsx`, `InvestmentRoutes.tsx`). Not broken, just large.
2. **No route-level code splitting by tier** — all 704 routes are lazy-loaded individually which is correct, but the route definitions themselves are monolithic.
3. **Some routes overlap conceptually** — e.g., `/admin/connectors` (admin governance) vs `/connectors` (user hub) vs `/integrations/connections` (user connections). This is intentional (different audiences) but could confuse developers.

## Recommendation

Everything is wired correctly. The OS/App/Admin/Public separation is clean. No implementation work needed — this is a documentation/organization question. If you want, I can:

1. **Extract route groups** — split App.tsx into `PublicRoutes`, `MobileRoutes`, `OSCoreRoutes`, `AdminRoutes`, etc. for maintainability
2. **Generate a route manifest document** — formal OS vs App vs Admin classification doc
3. **Add route-group comments** — better in-file organization of the 704 routes

