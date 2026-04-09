

# Fix Kernel/Execution Reality Audit — Section G to 100%

## Current State

The kernel infrastructure is complete and well-designed. The gap is **adoption** — 8 pages still bypass the kernel with direct `fromTable().insert/update/delete/upsert` calls instead of routing through `useAction()` / `useActionFn()`.

| Audit Item | Current | After Fix |
|-----------|---------|-----------|
| `useAction()` adoption | 43 pages | 51 pages (all mutation pages) |
| `useCanonicalAction()` | 1 page (admin) | N/A — `useAction` wraps it |
| ActionEnvelope contract | Not used by pages | Used implicitly via kernel chain |
| Receipt-first execution | Not enforced | Enforced (all writes → kernel → receipt) |
| Policy-before-execution | Not enforced | Enforced (all writes → kernel → policy) |
| Kill switch / safe mode | Exists in kernel, not wired to EmergencyHaltService | Wired together |
| Execution modes | Defined, not enforced | Enforced via kernel chain |

## What Needs Fixing

### Part 1: Wire 8 Non-Admin Pages to Kernel (remove direct DB writes)

These pages have `useAction` imported but ALSO do direct `fromTable()` writes alongside. Fix: replace direct writes with the existing `useAction`/`useActionFn` calls.

| Page | Direct Writes | Fix |
|------|--------------|-----|
| `Onboarding.tsx` | `.upsert()` + `.update()` on lines 112-114 | Already has `useActionFn` — use it instead of direct calls |
| `SettingsPage.tsx` | `.update()` on line 162 | Already has `useActionFn` — route through it |
| `UserProfilePage.tsx` | `.update()` on line 76 | Add `useAction("workspace", "profile.update")` |
| `NotificationSettingsPage.tsx` | `.update()` on line 163 | Add `useAction("workspace", "notification.preferences.update")` |
| `owner/ConstitutionEditor.tsx` | `.insert()`, `.update()`, `.delete()` | Add `useAction` for constitution CRUD |
| `business/CommunicationsCenter.tsx` | `.insert()` + `.update()` | Add `useAction("business", "communication.send")` |
| `PolicyEditor.tsx` | Direct writes | Add `useAction("system", "policy.update")` |
| `concierge/HouseholdTasks.tsx` | Direct writes | Add `useAction("concierge", "task.update")` |

**Note**: Admin pages (AIT04to08, TeamManagement, HQApprovalQueue, etc.) and pages that already use `useAction` for their mutations (SubscriptionsWaste, BillsWorkspace, etc.) are already compliant — the `fromTable` calls are read-only queries.

### Part 2: Wire Kill Switch to EmergencyHaltService

The kernel has a kill switch (`setKillSwitch()`) but it's disconnected from the `EmergencyHaltService`. Fix: wire the kernel's kill switch to check the `EmergencyHaltService` during `executeAction()`.

**Changes to `src/lib/sita-kernel.ts`**:
1. Import `EmergencyHaltService` from core-services
2. Add `readonly emergencyHalt: EmergencyHaltService` to kernel
3. In `checkKillSwitch()`, also check `emergencyHalt.check("global")`
4. Expose `emergencyHalt` for the admin kill switch page to call

**Changes to `src/contexts/SitaKernelContext.tsx`**:
1. Add `useEmergencyHalt()` hook exposing `kernel.emergencyHalt`

### Part 3: Register Missing Capabilities

The `CapabilityRouter` has only 4 capabilities registered. Add registrations for the most common mutation domains:
- `workspace.profile.update`, `workspace.memory.upsert`, `workspace.notification.preferences.update`
- `business.communication.send`, `business.communication.update`
- `owner.constitution.create`, `owner.constitution.update`, `owner.constitution.delete`
- `concierge.task.update`

**File**: `src/lib/core-services/capability-router.ts` — add to default registry

## Files Changed

- **8 page files**: Replace direct DB writes with `useAction`/`useActionFn` calls
- **`src/lib/sita-kernel.ts`**: Wire EmergencyHaltService, expose in kernel
- **`src/contexts/SitaKernelContext.tsx`**: Add `useEmergencyHalt()` hook
- **`src/lib/core-services/capability-router.ts`**: Register new capabilities

## Risk
Low — all pages already have `useAction` imported or can trivially add it. The kernel chain already handles all writes correctly. EmergencyHaltService already exists and just needs wiring.

