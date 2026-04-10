

# SITA OS — Full Project Audit Report

## Project Scale

| Metric | Count |
|--------|-------|
| Route paths in App.tsx | 736 |
| Lazy imports | 554 |
| Page files | 503 |
| Services | 171 |
| Edge Functions | 50 |
| Database Migrations | 116 |
| Registered Capabilities | 152 |
| Generated Artifacts | 47 |
| TypeScript Errors | **0** |

---

## What's Fully Wired & Working

- **AdminShell** wraps all `/admin/*` routes via `AdminShellLayout` in App.tsx
- **OwnerWorkspaceShell** wraps all `/owner/*` routes via `OwnerShellLayout` in App.tsx
- **5 Summary Panels** (Revenue, Risk, Connector, Incident, Replay) rendered in MissionControlHome
- **AdminCommandPalette** (Cmd+K) and **AdminKeyboardShortcuts** (`?`, `G+key`) globally active
- **RevenueOfficeModeProvider** wraps all 40 `/revenue-office/*` routes with Beginner/Advanced toggle
- **SitaKernel** + **OSRuntime** wired into ~20 key pages (Boardroom, ProofCenter, SystemStatus, etc.)
- **Supabase** queries active in 28 pages
- **All admin routes** (intelligence, strategic, AIT, verification boards) routed via `getAdminRoutes()`
- **Investment Office** (38 pages), **Revenue Office** (40+ pages), **Digital Presence** (19 pages), **ATLAS**, **App Platform**, **Enterprise** — all routed
- **Business Formation Ceremony** — 20 screens, FormationShell, branching logic all complete
- **Interactive Advisor Q&A** — working in GrowthAdvisorBoard with 3 query types × 9 advisors
- **Lightweight Charts** — Candlestick/Line/Area rendering with all timeframes
- **Strategy Allocation Rebalancer** — Sliders, locking, presets all functional

---

## What's Missing / Not Wired

### Priority 1 — Orphaned Shells (built but never used)

| Component | Status |
|-----------|--------|
| `MissionOpsShell` (92 LOC) | Defined at `src/components/admin/shells/MissionOpsShell.tsx` — **never imported anywhere** |
| `OwnerModeShell` (48 LOC) | Defined at `src/components/admin/shells/OwnerModeShell.tsx` — **never imported anywhere** |

**Fix**: Wire `MissionOpsShell` around `/mission-control` route or delete if redundant with AdminShell. Wire `OwnerModeShell` around `/owner-mode` route or delete.

### Priority 2 — Sidebar Navigation Gaps

The sidebar (`AppSidebar.tsx`, 347 LOC) is missing links to major workspaces:

| Workspace | Sidebar Entry | Actual Routes |
|-----------|--------------|---------------|
| Digital Presence Office | ❌ Missing | `/digital-presence/*` (19 pages) |
| ATLAS | ❌ Missing | `/atlas/*` (10+ pages) |
| App Platform | ❌ Missing (only "App Store") | `/app-platform/*` (24 pages) |
| Investment Office | ⚠️ Nested under Money as `/money/investments` | `/investments/*` (38 pages) |
| Owner/Admin (for admins) | ✅ Present | `/owner/*`, `/admin/*` |

**Fix**: Add Digital Presence, ATLAS, and App Platform to sidebar. Consider promoting Investment Office to a top-level entry pointing to `/investments`.

### Priority 3 — Data Layer Gap (Demo Data vs Real Data)

~261 pages reference `DEMO_`, `MOCK_`, or `mockData` patterns. While this is expected for a demo-mode app, the vast majority of pages (~475 of 503) do **not** query Supabase directly. Only 28 pages have live Supabase queries.

**This is architectural by design** — the `DataModeContext` and `DemoModeProvider` handle the demo/real toggle. However, when real connectors are activated, most pages will still show hardcoded demo data unless each page's data layer is wired to Supabase.

**Fix**: Not urgent — demo mode is the current deployment target. But plan for a systematic data-wiring pass when moving to production.

### Priority 4 — Kernel/Runtime Adoption

Only ~20 pages use `useOSRuntime` or `useSitaKernel`. The remaining ~480 pages operate independently of the kernel singleton. This means most pages don't participate in the unified event bus, receipt tracking, or trust state.

**Fix**: Not urgent for MVP. The kernel is wired for the pages that need it (admin, observability, proof). Expanding to all pages would be a Phase 5+ effort.

### Priority 5 — 93 Services Without UI Consumers

171 services exist under `src/lib/services/`. 93 of them are never imported by any page or component. These include:
- `accuracy-classifier`, `anomaly-alert`, `autonomous-negotiation`, `client-sentiment`, `competitive-intelligence`, `digital-legacy-vault`, `duress-detection`, `epistemic-firewall`, `fraud-sentinel`, `immune-controller`, `injection-firewall`, and many more.

**Fix**: These are backend-ready services waiting for UI surfaces. Not broken — just not yet consumed. Prioritize wiring the ones that map to existing pages (e.g., `fraud-sentinel` → Risk pages, `anomaly-alert` → Incident pages).

---

## Implementation Plan (If Approved)

### Step 1 — Wire or Remove Orphaned Shells
- Wire `MissionOpsShell` around mission-control routes OR remove if AdminShell covers it
- Wire `OwnerModeShell` around `/owner-mode` route OR remove if OwnerWorkspaceShell covers it

### Step 2 — Add Missing Sidebar Navigation
- Add **Digital Presence Office** link to sidebar (`/digital-presence`)
- Add **ATLAS** link to sidebar (`/atlas`)
- Add **App Platform** link to sidebar (`/app-platform`)
- Promote **Investment Office** to top-level (`/investments`)

### Step 3 — Wire Key Services to Existing Pages
Connect the most impactful unused services to their natural UI consumers:
- `anomaly-alert` → IncidentCommandCenter
- `fraud-sentinel` → Risk summary panels
- `client-sentiment` → CRM/Relationship pages
- `competitive-intelligence` → Growth Boardroom

### Files Modified

| File | Change |
|---|---|
| `src/components/sita/AppSidebar.tsx` | Add 4 missing workspace links |
| `src/App.tsx` | Wire MissionOpsShell/OwnerModeShell or remove dead imports |
| `src/pages/admin/IncidentCommandCenter.tsx` | Connect anomaly-alert service |
| `src/pages/revenue-office/GrowthBoardroom.tsx` | Connect competitive-intelligence service |

### What NOT to Do
- Do NOT rewrite 475 pages to use Supabase — demo mode is intentional
- Do NOT wire all 93 services — most are future-ready infrastructure
- Do NOT add more routes — 736 is already comprehensive

