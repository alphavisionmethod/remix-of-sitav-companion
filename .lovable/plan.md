

# Complete Business OS Window Integration — Final Gaps

## What's Already Done
- All 40+ pages are imported and mapped in the windowed `BusinessAppShell`
- All `/business/*` routes redirect through `BusinessCenter` → `sita-open-business` event → desktop
- Sidebar has 6 groups with full navigation
- `BusinessNavigationContext` exists for internal navigation

## Remaining Gaps (6 issues)

### 1. Deep-linking module is lost
**Problem**: `ShellLayout.tsx` catches the `sita-open-business` event but ignores `event.detail.module`. The Business window always opens to `crm-home` regardless of which `/business/*` URL was hit.

**Fix**: Pass the module from the event detail through to the `BusinessAppShell`. This requires:
- `ShellLayout.tsx`: Extract `detail.module` from the event and pass it when opening the window
- `ShellWindowLayer.tsx`: Support an `initialModule` parameter in `doLaunchApp` and thread it to `BusinessAppShell`
- The `apps` map in `ShellWindowLayer.tsx` needs to render `BusinessAppShell` dynamically with the module prop

### 2. Legacy `BusinessAppShell` duplicate
**Problem**: `src/components/business/BusinessAppShell.tsx` (265 lines) is the old shell used by the router-based `BusinessCenter`. It's no longer needed since the windowed version at `src/components/sita/apps/business/BusinessAppShell.tsx` replaced it.

**Fix**: Check if anything still imports the old one. If not, delete it. If the old `BusinessCenter` page component (which now just fires the redirect event) still references it, remove that reference.

### 3. CRMCommandSearch uses `navigate()` instead of context
**Problem**: `CRMCommandSearch.tsx` line 132 calls `navigate("/business/${result.path}")` which triggers a full route redirect → event → window reopen cycle instead of just switching the active module.

**Fix**: Replace `useNavigate` with `useBusinessNavigation().navigateTo(result.path)`.

### 4. CustomerDetailPane uses `navigate()` instead of context
**Problem**: `CustomerDetailPane.tsx` line 66 calls `navigate("/business/customers/${id}")` for the Detail button.

**Fix**: Replace with `useBusinessNavigation().navigateTo("customer-detail:" + customer.id)`.

### 5. External components using `navigate("/business/...")`
**Problem**: 5 files outside Business use `navigate("/business/...")`:
- `CommandPalette.tsx` — navigates to `/business/leads`, `/business/invoices`, etc.
- `HoldKeyOverlay.tsx` — navigates to `/business`, `/business/leads`, `/business/invoices`
- `DailyPulse.tsx` — navigates to `/business`
- `GlobalBoardroom.tsx` — navigates to `/business/boardroom`
- `CustomerAutopilotPanel.tsx` — navigates to `/business/autopilot-hub`

**Fix**: These are **outside** the Business app, so they can't use `useBusinessNavigation`. Instead, they should dispatch the `sita-open-business` custom event with the correct module, matching what `BusinessCenter.tsx` does. Create a small helper: `openBusinessModule(module: string)`.

### 6. Quick Actions in CRMCommandSearch use `navigate()`
**Problem**: The `QUICK_ACTIONS` in `CRMCommandSearch.tsx` also route via `navigate`.

**Fix**: Same as #3 — use `useBusinessNavigation`.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/sita/ShellLayout.tsx` | Pass `detail.module` from event to window launcher |
| `src/components/sita/shell/ShellWindowLayer.tsx` | Support `initialModule` param in `doLaunchApp`, thread to `BusinessAppShell` |
| `src/components/business/crm/CRMCommandSearch.tsx` | Replace `useNavigate` with `useBusinessNavigation` |
| `src/components/business/CustomerDetailPane.tsx` | Replace `useNavigate` with `useBusinessNavigation` |
| `src/components/sita/CommandPalette.tsx` | Use `sita-open-business` event dispatch instead of `navigate` |
| `src/components/sita/shell/HoldKeyOverlay.tsx` | Use `sita-open-business` event dispatch |
| `src/pages/DailyPulse.tsx` | Use `sita-open-business` event dispatch |
| `src/pages/GlobalBoardroom.tsx` | Use `sita-open-business` event dispatch |
| `src/components/autopilot/CustomerAutopilotPanel.tsx` | Use `sita-open-business` event dispatch |
| New: `src/lib/business-launcher.ts` | Tiny helper: `openBusinessModule(module)` that dispatches the event |
| Delete: `src/components/business/BusinessAppShell.tsx` | Remove legacy duplicate (if no remaining imports) |

## No database changes needed

