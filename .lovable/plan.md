

# Part 2 — OS vs App Separation for Admin Dashboard

## Build Error Fix (Immediate)
- **MCLogsAudit.tsx line 44-45**: Duplicate `isDemoMode` binding. Remove line 44 (`const { isDemo: isDemoMode } = useAuth()`) since line 45 already provides `isDemoMode` from `useDataMode()`.

## What Already Exists (Admin-Only, No Duplication Risk)
All 14 core features from Part 1 are already implemented and wired inside `src/components/admin/shells/` and `src/pages/admin/`. The admin shell (`FounderControlShell`) is fully separate from the user OS shell. No changes needed to user-facing routes.

## What Part 2 Requires (New Admin-Only Features)

Part 2 defines the **governance and authority model** that makes the admin dashboard aware of the OS/App/Cloud separation. These are **admin-only visibility and control surfaces** — they do not touch the user OS.

### Batch 1 — Authority & Origin Framework
1. **Surface Authority Matrix Panel** (`SurfaceAuthorityMatrix.tsx`) — Interactive table showing every critical action with columns: Can initiate from OS? App? Cloud decides? App approves? OS executes? Offline? Rollback? Filterable by domain. Placed in MissionControlHome as a collapsible section.

2. **Command Origin Classifier** — Enhance existing `ExecutionTimeline` entries and `UndoToastSystem` items with an `origin` badge (`os_local` | `app_remote` | `admin_control_plane`). Visual distinction between local actions, remote commands, and admin plane operations.

3. **Control Receipts Panel** (`ControlReceiptsPanel.tsx`) — Shows structured receipts for every critical admin action: action, target device/service, reason, result, rollback availability, timestamp, audit link. Accessible from sidebar under Operations.

### Batch 2 — Emergency & Remote Authority
4. **Emergency Authority Mode** (`EmergencyAuthorityPanel.tsx`) — Dedicated emergency control surface in the admin dashboard with: device lock, sync pause, trust revoke, account freeze, force sign-out, approval freeze. Each action goes through SafetyConfirmDialog. Accessible from sidebar with a red shield icon.

5. **Remote Authority Sessions** (`RemoteAuthoritySession.tsx`) — When controlling a specific device/service, create a tracked session showing: target, commands issued, trust level, time window, required approvals, audit trail. Displayed as a slide-panel overlay.

6. **Platform Adaptation Rules Panel** (`PlatformAdaptationRules.tsx`) — Admin-visible panel showing how behavior adapts per platform (OS vs App): what's prioritized, what's hidden, what's confirmation-heavy. Editable rules with simulation preview.

### Batch 3 — State Authority & Intelligence Separation
7. **State Authority Map** (`StateAuthorityMap.tsx`) — Visual diagram showing three authority classes: Execution State (OS-owned), Canonical State (Cloud-owned), Control State (App-owned). Each class lists its state items with live status indicators. Placed in LiveSystemMap as an overlay mode.

8. **Global vs User Style Memory Panel** — Enhance existing `LearningYouPanel` to split into two tabs: "Platform Memory" (routing patterns, failure patterns, command efficiency) and "Your Style" (existing preferences). This is a modification, not a new file.

9. **Trust UX Authority Split** — Add a "Trust Authority" section to the StatusStrip showing which surface currently holds trust authority for active sessions. Badge showing `OS: contextual` vs `App: authoritative` trust posture.

### Batch 4 — Wiring & Polish
10. **Sidebar updates** — Add new nav items for Emergency Authority, Control Receipts, and Authority Matrix under a new "Authority & Control" group in FounderSidebar.

11. **Route registration** — Add routes for the 4 new pages under `/admin/mc/` prefix, wrapped in AdminRoute with appropriate permissions.

12. **MissionControlHome integration** — Add collapsible SurfaceAuthorityMatrix and StateAuthorityMap widgets to the dashboard, with the existing stagger animation pattern.

## Technical Details

- All new components live in `src/components/admin/shells/` (panels) or `src/pages/admin/modules/` (full pages)
- Follow existing patterns: glassmorphic cards (`bg-white/[0.03]`), `WhyTooltip`, `motion` animations, `ExplainSimply` context awareness
- Demo data follows existing `DEMO_*` constant pattern — fully populated, no stubs
- Command origin tags use a shared type: `type CommandOrigin = "os_local" | "app_remote" | "admin_control_plane"`
- Emergency actions all route through `SafetyConfirmDialog` with `risk: "critical"` and dual approval
- No user OS files are touched — everything is admin-only under `/admin/` routes and `AdminRoute` guard
- Total: ~6 new component files, ~6 modified files across 4 batches

