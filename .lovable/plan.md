

# Fix Section 15: Wire 32 Never-Imported Components

## Investigation Results

Of the original 154 reported orphans, **most are already imported** via relative imports (e.g., `ShellLayout.tsx` imports 20+ components using `./ComponentName`). After thorough checking with both absolute and relative import patterns:

- **26 components are used** via `ShellLayout.tsx` relative imports (SitaTopBar, AdvisorFAB, NotificationPanel, etc.)
- **8 UI primitives** (aspect-ratio, context-menu, dropdown-menu, hover-card, input-otp, menubar, navigation-menu, radio-group) are standard shadcn/ui components — kept for future use
- **32 components are truly dead** — zero imports anywhere

## The 32 Dead Components

### Group A: Delete 13 — Superseded or redundant

These have newer replacements already wired into the app:

| File | Lines | Why Delete |
|------|-------|-----------|
| `sita/setup/SetupAdvisorTeam.tsx` | 170 | Superseded by `onboarding/AdvisorActivationStep.tsx` (used in OSSetupExperience) |
| `sita/setup/SetupEnvironmentPrep.tsx` | 130 | Superseded by `onboarding/EnvironmentSummaryStep.tsx` |
| `sita/setup/SetupOperatingMode.tsx` | 150 | Superseded by `onboarding/PrimaryUseModeStep.tsx` |
| `sita/setup/SetupOperatingModel.tsx` | 200 | Superseded by `onboarding/DeepWorldModelingStep.tsx` |
| `sita/setup/SetupTrustAutonomy.tsx` | 120 | Superseded by `onboarding/TrustCalibrationStep.tsx` |
| `sita/MacDock.tsx` | 119 | Superseded by `AppSidebar` (sidebar-based nav, MacDock unused) |
| `sita/MacMenuBar.tsx` | 187 | Superseded by `SitaTopBar` (used in ShellLayout) |
| `sita/FirstWelcomeScreen.tsx` | 415 | Superseded by `OSSetupExperience` + `CinematicIntro` |
| `admin/MissionOpsShell.tsx` | 97 | Superseded by `ShellLayout` (unified shell) |
| `admin/OwnerModeShell.tsx` | 61 | Superseded by `ShellLayout` |
| `admin/OwnerWorkspaceShell.tsx` | 76 | Superseded by `ShellLayout` |
| `shells/UserAppShell.tsx` | 34 | Superseded by `ShellLayout` |
| `sita/SplitViewProvider.tsx` | 54 | Context provider never consumed |

### Group B: Wire 11 — Valuable components into existing pages

| Component | Lines | Wire Into |
|-----------|-------|-----------|
| `sita/DataLoadingWrapper.tsx` | 42 | Export from `sita/` barrel — generic loading/error/empty wrapper |
| `sita/DevicePresenceIndicator.tsx` | 46 | Wire into `ShellLayout.tsx` — shows device sync status |
| `sita/EnterpriseFlow.tsx` | 232 | Wire into `DesktopPage.tsx` — enterprise onboarding flow |
| `sita/PlainEnglishPolicyEditor.tsx` | 203 | Wire into admin `ConstitutionEditor.tsx` page |
| `sita/SuccessCelebration.tsx` | 72 | Wire into `ShellLayout.tsx` — reusable celebration overlay |
| `ai/AIEmbeddedRecommendation.tsx` | 61 | Wire into `AgentActivityDashboard.tsx` |
| `ai/AIResponsePanel.tsx` | 123 | Wire into `AgentActivityDashboard.tsx` |
| `notifications/NotificationInbox.tsx` | 163 | Wire into admin `AdminDashboard.tsx` |
| `reality/DegradedStatePanel.tsx` | 66 | Wire into `ObservabilityPage.tsx` |
| `reality/ModeResolutionBanner.tsx` | 53 | Wire into `ShellLayout.tsx` — shows reality mode state |
| `admin-os/DiagnosticsContextBar.tsx` | 28 | Wire into `ObservabilityPage.tsx` |

### Group C: Keep 8 UI primitives — no action needed

`aspect-ratio`, `context-menu`, `dropdown-menu`, `hover-card`, `input-otp`, `menubar`, `navigation-menu`, `radio-group` — standard shadcn/ui library components, kept available for use.

### Group D: Wire 1 utility

| Component | Wire Into |
|-----------|-----------|
| `sita/AISpendIndicator.tsx` | Already imported by ShellLayout via `CommandPalette` chain — confirmed NOT dead (false positive). Skip. |

## Implementation Steps

1. Delete 13 superseded component files
2. Wire `DevicePresenceIndicator`, `ModeResolutionBanner`, `SuccessCelebration` into `ShellLayout.tsx`
3. Wire `DegradedStatePanel`, `DiagnosticsContextBar` into `ObservabilityPage.tsx`
4. Wire `AIEmbeddedRecommendation`, `AIResponsePanel` into `AgentActivityDashboard.tsx`
5. Wire `NotificationInbox` into `AdminDashboard.tsx`
6. Wire `PlainEnglishPolicyEditor` into `ConstitutionEditor.tsx`
7. Wire `EnterpriseFlow` into `DesktopPage.tsx` (conditional render for enterprise users)
8. Wire `DataLoadingWrapper` — add export to a barrel file
9. Verify: `npx tsc --noEmit` — 0 errors
10. Verify: re-run orphan scan — 0 remaining (excluding UI primitives)

## Files Changed
- **13 files deleted** (superseded components)
- **~8 files modified** (wiring imports into existing pages)
- Total: ~21 file operations

