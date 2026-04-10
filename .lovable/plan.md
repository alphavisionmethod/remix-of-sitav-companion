
# SITA OS — Operational Activation: Focus Areas 4-10 Implementation Plan

## Current State Assessment

### Already Built and Working
| System | Status |
|--------|--------|
| **Google Provider Family** | Full type system, demo provider, admin dashboard (PFA09), user-facing GoogleConnectedAccounts page, hook |
| **Device Presence Service** | Service + UI indicator in ShellLayout, admin pages UAO01/UAO02 |
| **Attention OS** | Full service (265 lines), cognitive load, priority stack, fatigue, bundling, suppression — all wired into SitaOSContext |
| **Chief-of-Staff** | Full service (282 lines), 7 personas, proactive checks, interventions — wired into SitaOSContext with proactive trigger loop |
| **Continuity Engine** | Full service, threads, surfaces, handoff log — persisted |
| **Trust-Weighted Actions** | Full service, wired into ApprovalChamber |
| **Observability Hub** | Basic metric push/query service — persisted |
| **RuntimeTruthProbe** | Component exists but NOT mounted in ShellLayout or Settings |
| **Demo Governance** | Service + seeder + admin pages exist |
| **Timing Intelligence** | Service exists, wired into SitaOSContext |
| **15 OS Services** | All instantiated, cross-wired, persisted |

### Gaps Identified (8 actionable items)

**Gap 1 — RuntimeTruthProbe not mounted anywhere**
Component exists but is never rendered. No user ever sees it.

**Gap 2 — SettingsPage has no "Connected Accounts" tab**
GoogleConnectedAccounts page exists at `/settings/google-connected-accounts` but SettingsPage tabs don't include a unified "Connected Accounts" section. Users have no obvious way to find it.

**Gap 3 — DevicePresenceIndicator hidden on mobile**
`hidden lg:block` — invisible on the primary device surface (phones).

**Gap 4 — Chief-of-Staff interventions not surfaced in user pages**
CAI06 admin page shows interventions, but no user-facing page (DailyPulse, Boardroom, NotificationCenter) renders chief-of-staff nudges/briefings.

**Gap 5 — ObservabilityHub has no structured logging or correlation IDs**
Only stores raw numeric metrics. No trace IDs, no correlation, no structured log entries.

**Gap 6 — No unified Connected Accounts Center in user settings**
Google page exists, but no unified view showing all providers, sign-in methods, connected services, scopes, health, and reauth in one place.

**Gap 7 — Attention OS urgency/fatigue not visible in NotificationCenter**
NotificationCenter has quiet mode based on cogLoad but doesn't show urgency classes, fatigue state, or suppression counts to the user.

**Gap 8 — Demo mode labels inconsistent on flagship pages**
Some pages show DemoModeBadge, others don't. No consistent "you're seeing demo data" governance banner.

## Implementation Plan

### Fix 1 — Mount RuntimeTruthProbe in sidebar footer
**File:** `src/components/sita/AppSidebar.tsx`
Add `RuntimeTruthProbe` compact indicator next to the cognitive load bar in the sidebar footer.

### Fix 2 — Add "Connected Accounts" tab to SettingsPage
**File:** `src/pages/SettingsPage.tsx`
- Add "Connected Accounts" to the sidebar tab list
- Add `case "connected-accounts"` that renders the GoogleConnectedAccounts component inline, plus a section showing sign-in providers from Supabase auth identities

### Fix 3 — Show DevicePresenceIndicator on mobile
**File:** `src/components/sita/ShellLayout.tsx`
Change `hidden lg:block` to responsive positioning that works on mobile (bottom bar or header badge).

### Fix 4 — Surface chief-of-staff interventions in DailyPulse
**File:** `src/pages/DailyPulse.tsx`
- `activeInterventions` is already fetched (line 159) but not rendered
- Add a section below the pulse digest that displays active interventions as actionable cards with role persona, urgency, and dismiss/act buttons

### Fix 5 — Add correlation context to ObservabilityHub
**File:** `src/lib/services/observability-hub/index.ts`
- Extend `HubMetric` with optional `correlationId`, `traceId`, `level` (info/warn/error)
- Add `log(entry)` method for structured entries
- Add `getTraceLog(correlationId)` query method

### Fix 6 — Show attention state in NotificationCenter
**File:** `src/pages/NotificationCenter.tsx`
- Display cognitive load level, fatigue state, suppression count from AttentionOS
- Show urgency class badges on notification items

### Fix 7 — Add demo governance banner to flagship pages
**File:** `src/components/sita/DemoGovernanceBanner.tsx` (new)
- Single component that reads `useDataMode()` and shows a clear, dismissible "Demo Mode — data shown is simulated" banner
- Mount in ShellLayout so all pages inherit it consistently

### Files Modified (7)
| File | Change |
|------|--------|
| `src/components/sita/AppSidebar.tsx` | Mount RuntimeTruthProbe |
| `src/pages/SettingsPage.tsx` | Add Connected Accounts tab |
| `src/components/sita/ShellLayout.tsx` | Mobile-visible device presence |
| `src/pages/DailyPulse.tsx` | Render chief-of-staff interventions |
| `src/lib/services/observability-hub/index.ts` | Add structured logging + correlation IDs |
| `src/pages/NotificationCenter.tsx` | Show attention state + urgency classes |

### Files Created (1)
| File | Purpose |
|------|---------|
| `src/components/sita/DemoGovernanceBanner.tsx` | Consistent demo mode banner for all pages |

### What This Does NOT Do (by design)
- Does not add new services, domains, or edge functions
- Does not expand wearable/ring/band architecture
- Does not add new admin pages
- Does not duplicate existing components
- Focuses purely on wiring existing systems into user-facing surfaces

### What This Achieves
- RuntimeTruthProbe becomes visible — launch readiness is observable
- Connected Accounts becomes discoverable in Settings
- Device presence works on mobile (the primary surface)
- Chief-of-Staff interventions surface in the daily experience
- Observability gains structured logging with trace correlation
- Attention OS state visible to users in NotificationCenter
- Demo governance is consistent and honest across all surfaces
