

# Advisor Registry CRUD + Approval Queue → 100% Advanced

## Current Gaps

### Advisor Registry
- **TeamManagement.tsx** reads from `advisor_registry` table but has **zero mutations** — no create, edit, delete, toggle active
- Detail panel shows Train/Reset/Permissions buttons that are **non-functional placeholders**
- **AdvisorRegistry.tsx** reads from hardcoded `FULL_ADVISOR_REGISTRY` config, not from DB at all

### Approval Queue
- **HQApprovalQueue.tsx** is already fully built for `ai_workforce_approval_queue` (overview, detail, filters, approve/reject/defer, history) — this is 100%
- The **`approval_queue`** table (used by OwnerCenter, ProofCenter, ActivityStream) has no dedicated management UI — just read-only consumers
- No way to create approval requests manually or manage the `approval_queue` lifecycle from a single view

## Plan

### Step 1: Advisor Registry Full CRUD (TeamManagement.tsx)
Add to TeamManagement:
- **Create Advisor dialog**: Form with display_name, domain, advisor_type, trust_threshold, active toggle → inserts into `advisor_registry`
- **Edit Advisor**: Click advisor card → edit dialog pre-filled with current values → updates `advisor_registry`
- **Toggle Active/Pause**: Quick action button on card that updates `active` column
- **Delete Advisor**: Confirmation dialog → deletes from `advisor_registry`
- Replace placeholder Train/Reset/Permissions buttons with real toggle-active and edit actions

### Step 2: Approval Queue Management Page
Create a unified approval management view at the OwnerCenter level for the `approval_queue` table:
- **Add a full approval management tab** to OwnerCenter or create a standalone route
- Actually — `approval_queue` is already consumed in OwnerCenter with real data. The gap is: no approve/reject mutations on that table.
- Add approve/reject/dismiss mutations to the existing OwnerCenter approvals view using `supabase.from("approval_queue").update()`

### Step 3: Wire AdvisorRegistry page to DB
- AdvisorRegistry.tsx currently uses `FULL_ADVISOR_REGISTRY` (hardcoded). Add a DB query layer that merges DB records with config defaults, so DB-persisted advisors appear alongside config-defined ones.

## Files Changed

| File | Change |
|---|---|
| `src/pages/admin/TeamManagement.tsx` | Add create/edit/delete/toggle mutations + dialogs |
| `src/pages/OwnerCenter.tsx` | Add approve/reject mutations for `approval_queue` items |
| `src/pages/advisors/AdvisorRegistry.tsx` | Merge DB advisors with config registry |

