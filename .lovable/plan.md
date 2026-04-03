

# SITA OS — Comprehensive Audit & Fix Plan

## Audit Results

The codebase is **95%+ complete** with zero TypeScript errors. Here are the specific gaps found:

### 1. SystemStatus.tsx — "Coming soon" Stub (Lines 603-608)
The `trust`, `health`, and `history` tabs show a placeholder message: *"Detailed {tab} view coming soon — this surface is being built."*
All other 5 tabs (overview, self-healing, incidents, fleet, connectors, slos) are fully implemented with real data from self-healing services.

**Fix**: Implement the 3 stub tabs with real data using existing services (TrustState from kernel, fleet health from self-healing, execution receipts from receipt service).

### 2. Edge Functions Missing from `supabase/config.toml`
Three edge functions exist on disk but are **not registered** in config.toml:
- `agent-intelligence` (152 lines — fully implemented)
- `agent-scheduler` (122 lines — fully implemented)
- `agent-signal` (122 lines — fully implemented)

**Fix**: Add `[functions.agent-intelligence]`, `[functions.agent-scheduler]`, `[functions.agent-signal]` entries to `supabase/config.toml`.

### 3. No Other Issues Found
- **Zero empty directories** in src/
- **Zero TypeScript errors**
- **All routes in App.tsx** resolve to existing page components
- **All 13 edge functions** are fully implemented (73-786 lines each, no stubs)
- **All 4 demo scenarios** have rich, interconnected data (not mocks)
- **All 10 engines** are fully implemented with real logic
- **All 8 type contracts** are complete
- **All services** (brain-core, business-os, finance-os, concierge-os, approval-engine, policy-engine, event-bus, receipt-service, verification-engine, executor-service, memory-service, etc.) have real implementations
- **All packages** (contracts, proof-model, event-types, policy-contracts, etc.) have real exports
- **All admin components** (StatusBadge, TrustRibbon, SafeModeBanner, QuickActionsDock, AdminPageHeader) are implemented
- **All Layer 1/2/3 pages** are implemented (OwnerModePage 635 lines, OwnerCenter 2255 lines, MissionControlPage 1118 lines)
- **All standalone owner pages** (leases, constitution, pulse, approvals, ai-team-updates, pricing, packs, advisors) exist and are routed
- **All global tools** (observability, policy-simulator, workflow-replay, users) are implemented
- **All mission drill-downs** (registry, releases, incidents, connectors, workflows, policies, overview, error) are implemented
- **EnterpriseControlPlane** is implemented (298 lines)

## Implementation Steps

### Step 1: Register 3 missing edge functions in config.toml
Add the 3 missing function entries with `verify_jwt = false` to match the existing pattern.

### Step 2: Implement SystemStatus trust/health/history tabs
Replace the "coming soon" placeholder with real content:

**Trust tab**: Show trust score breakdown using TrustState dimensions (policy compliance, proof completeness, verification health, rollback readiness, memory integrity, connector health, advisor governance) with progress bars and scores from the kernel's trust-state service.

**Health tab**: Show a service health overview grid using fleet health data already loaded on line 176 (`fleetHealth.getAllServices()`), with service name, uptime, latency, error rate, and health badge for each — essentially the fleet tab data in a health-focused view.

**History tab**: Show recent execution receipts/proof records in a timeline format, using approval data already available (line 140-145 `recentApprovals`) plus enriching with data from the receipt service and event bus.

### Files to Modify
1. `supabase/config.toml` — add 3 function entries
2. `src/pages/SystemStatus.tsx` — replace lines 603-608 stub with 3 real tab implementations

### No Other Changes Needed
Everything else in the project is fully implemented, connected, and building cleanly.

