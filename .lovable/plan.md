

# SITA OS — App vs OS vs Web Structural Separation Implementation

## Current State Assessment

### What Already Works (Keep)
The routing tiers in `App.tsx` already establish a 4-tier model:
- **TIER 1 (Web)**: `PublicLayout` — 5 public routes (landing, login, signup, forgot/reset password). Clean and minimal.
- **TIER 2 (Shell-less Auth)**: Onboarding, mobile surface, auth callback. Clean separation.
- **TIER 3 (App + OS Shell)**: `ShellLayout` — ~380 routes covering user app, OS workspaces, built-in apps, offices.
- **TIER 4 (Admin)**: `AdminShell` wrapping operator surfaces.

### Critical Problems Found

**1. Admin routes outside AdminShell** (~20 routes)
Lines 1049–1067 of App.tsx: DRS, mock-elimination, domain-reality, route-diagnostics, and all `/admin/automation/*` routes are rendered **outside** AdminShell — they appear inside the main ShellLayout with no admin wrapper. Same for `/admin/ai-runtime`, `/admin/persistence-status`, `/admin/system-health`, `/admin/brain-core`, `/admin/conscience-gate`.

**2. Route grouping breaks mid-file**
Line 1567: The AdminShell `</Route>` closes, then lines 1568-1569 place `/settings/connected-accounts` and `/settings/google` outside both admin and settings shells. Line 1570 opens a second AdminShell block. This is fragile and creates implicit boundary violations.

**3. Massive service directory duplication**
`src/lib/services/` has **~160 directories**. `src/lib/core-services/` has **~43 directories**. Many are duplicated between the two (brain-core, conscience-gate, model-router, policy-engine, receipt-service, executor-service, etc.). The rule says ~45 canonical services max — current count is ~200+.

**4. No explicit layer boundary declaration**
Layers exist only by folder convention and layout wrapping — no typed manifest, no enforcement, no CI check. A new file can land anywhere without triggering a boundary violation.

**5. Owner vs Admin boundary is implicit**
`/owner/*` routes use `OwnerWorkspaceShell` but conceptually overlap with admin (both are operator/governance surfaces). No clear policy on what goes where.

**6. OS-level services consumed directly by pages**
Pages import from `src/lib/services/*` and `src/lib/core-services/*` directly. No boundary layer enforces that app surfaces only consume OS services through hooks or capability invocations.

## Implementation Plan

### Phase 1 — Layer Boundary Manifest (source of truth)

Create `src/lib/architecture/layer-manifest.ts`:
- Define 6 canonical layers as typed constants: `WEB`, `APP`, `OS_KERNEL`, `OS_SERVICES`, `ADMIN_OPERATOR`, `DOMAIN_CAPABILITY`
- Map every route prefix to its canonical layer
- Map every service directory to its canonical layer
- Export layer ownership rules as typed data

Create `src/lib/architecture/boundary-rules.ts`:
- Define allowed import directions (App → OS_SERVICES ✓, App → OS_KERNEL ✗, ADMIN → OS_SERVICES ✓)
- Define which layers can render which components
- Export as consumable rules for CI and runtime checks

### Phase 2 — Fix Route Boundary Violations in App.tsx

Move the ~20 admin routes that are currently outside AdminShell into the AdminShell wrapper:
- `/admin/ai-runtime`, `/admin/persistence-status`, `/admin/system-health`
- `/admin/brain-core`, `/admin/conscience-gate`
- All `/admin/drs/*` routes (lines 1055-1067)
- All `/admin/automation/*` routes (lines 1070-1078)
- Fix the broken AdminShell close/reopen at lines 1567-1570 by keeping settings routes outside admin and consolidating the admin block

Consolidate all admin routes into a single `<Route element={<AdminShellLayout />}>` block to prevent future fragmentation.

### Phase 3 — Create Route Registry with Layer Tags

Create `src/lib/architecture/route-registry.ts`:
- Auto-generated registry mapping every route path to: layer, owner domain, flagship loop (if any), risk tier
- Used by admin boards (ITC09 Route Inventory, Route Reality Heatmap) for live truth
- Used by CI boundary check script

### Phase 4 — Service Layer Ownership Manifest

Create `src/lib/architecture/service-ownership-manifest.ts`:
- Declare canonical ownership for each service directory
- Flag which services in `src/lib/core-services/` are anti-sprawl shims vs real implementations
- Flag duplicates between `services/` and `core-services/` with canonical pointer
- Score: which services belong to kernel, OS, domain capability, or app layer

### Phase 5 — Add Boundary Check Script

Create `scripts/architecture/check-layer-boundaries.ts`:
- Scan imports in `src/pages/` — verify app-layer pages don't import kernel internals directly
- Scan imports in `src/pages/admin/` — verify admin pages don't import user-app components
- Scan that public routes (auth pages) import nothing from OS/kernel/admin
- Verify no service in `src/lib/services/` imports from `src/pages/`
- Report violations with file, current layer, violated layer, severity

### Phase 6 — OS Context Boundary Enhancement

Update `src/contexts/SitaOSContext.tsx` and `src/contexts/SitaKernelContext.tsx`:
- Add layer awareness — expose `currentLayer` based on route path
- Allow components to query which layer they're in
- Used by admin boards for runtime boundary verification

### Phase 7 — Admin/Owner Separation Documentation & Route Audit

Create `docs/architecture/LAYER_SEPARATION.md`:
- Document the 6-layer model with exact boundaries
- Route prefix → layer mapping table
- Service directory → layer mapping table
- Import rules
- Verification checklist (the practical checklist from Section R of the spec)

## What Does NOT Change
- No service directories are moved or renamed (anti-sprawl)
- No routes are deleted
- No new service directories created
- No edge functions added
- Existing ShellLayout, PublicLayout, AdminShell, OwnerWorkspaceShell stay as-is
- The nova-sdk kernel stays where it is — it's correctly placed in its own SDK namespace

## Files Created/Modified

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/lib/architecture/layer-manifest.ts` | Canonical layer definitions + route/service ownership map |
| Create | `src/lib/architecture/boundary-rules.ts` | Import direction rules between layers |
| Create | `src/lib/architecture/route-registry.ts` | Route → layer/domain/risk tagged registry |
| Create | `src/lib/architecture/service-ownership-manifest.ts` | Service → layer ownership + duplicate tracking |
| Create | `scripts/architecture/check-layer-boundaries.ts` | CI-ready boundary violation scanner |
| Create | `docs/architecture/LAYER_SEPARATION.md` | Human-readable separation doc + checklist |
| Modify | `src/App.tsx` | Fix ~20 admin routes outside AdminShell, consolidate admin blocks |
| Modify | `src/contexts/SitaOSContext.tsx` | Add layer awareness |
| Modify | `src/contexts/SitaKernelContext.tsx` | Add layer awareness |

## Summary

This is structural boundary enforcement work — no new features, no new services, no sprawl. It makes the implicit Web/App/OS/Admin separation explicit, fixes the route violations where admin routes bypass AdminShell, and creates enforceable manifests + CI checks so boundaries stay clean as the project grows.

