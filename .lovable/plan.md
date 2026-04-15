

# Unified Settings App — Consolidation Plan

## Problem
Settings is fragmented across three places:
1. **SettingsWindow** (windowed OS app) — has WiFi, Bluetooth, Sound, Display, Keyboard, Device Mode, but missing integrations, AI controls, operating modes, etc.
2. **SettingsPage** (route `/settings`) — has Integrations, Advisors/AI, Operating Modes, Connected Accounts, etc., but missing WiFi, Bluetooth, Sound, Display
3. **7 separate sub-page files** in `src/pages/settings/` — Accessibility, Device, Google Accounts, Plan/Usage, Notifications, Trusted Devices, Cloud Settings

The user wants ONE unified Settings app (the windowed Nova SDK app), containing everything.

## Design

Merge all settings into the **SettingsWindow** as the single source of truth. Add the missing sections from SettingsPage and sub-pages. The `/settings` route will open the windowed Settings app instead of rendering its own page.

### SettingsWindow — Final Section List (26 sections, 8 groups)

```text
Group: Account
  - Profile (exists)
  - Security (exists)
  - Connected Accounts (from SettingsPage — Google, OAuth, providers)

Group: System
  - General (exists)
  - Appearance (exists)
  - Display (exists)
  - Accessibility (from AccessibilitySettings.tsx)
  - Operating Modes (from SettingsPage — Focus, Travel, etc.)
  - Device Mode (exists)

Group: Connectivity
  - Network / Wi-Fi (exists)
  - Bluetooth (exists)
  - Cloud & Sync (exists)
  - Integrations & APIs (from SettingsPage — connector status, sync)

Group: Sound & Input
  - Sound (exists)
  - Keyboard (exists)

Group: AI & Intelligence
  - Advisors & AI (from SettingsPage — autonomy, budget, confidence)
  - Plan & Usage (from MyPlanUsage.tsx)

Group: Notifications
  - Notifications (exists, enhanced with NotificationPreferences.tsx push controls)

Group: Privacy & Trust
  - Privacy (exists, enhanced with SettingsPage GDPR export/delete)
  - Trust & Security (from SettingsPage — trust mode, compliance audit)
  - Devices & Sessions (from SettingsPage + TrustedDeviceManager)

Group: Advanced
  - Household (from SettingsPage)
  - Business Rules (from SettingsPage)
  - Workflows (from SettingsPage)
  - Backup & Recovery (from SettingsPage)
  - System Updates (from SettingsPage — update daemon)
  - Support & Diagnostics (from SettingsPage)
  - About (exists)
```

## Implementation Steps

### 1. Expand SettingsWindow with all missing sections
Add 15 new content components to `SettingsWindow.tsx`, porting the logic from SettingsPage and sub-pages:
- **ConnectedAccountsContent** — Google provider family, OAuth identity, all provider status
- **AccessibilityContent** — high contrast, text size, reduce motion, screen reader
- **OperatingModesContent** — 12 operating modes with mode switching
- **IntegrationsContent** — connector registry status, sync status
- **AdvisorsAIContent** — autonomy level, confidence threshold, budget, per-advisor controls
- **PlanUsageContent** — compute budget, AI spend, fair use
- **TrustSecurityContent** — trust mode, simulation preference, compliance audit
- **DevicesSessionsContent** — trusted devices list, session management
- **HouseholdContent** — family members, shared access
- **BusinessRulesContent** — follow-up policy, lead scoring, pipeline
- **WorkflowsContent** — active automations, trust gate
- **BackupRecoveryContent** — backup status, restore points, export
- **SystemUpdatesContent** — update daemon, channel selector, policy
- **SupportDiagnosticsContent** — system health, diagnostics, quick help
- **NotificationPrefsContent** — enhance existing with push permission controls

### 2. Update SECTIONS and GROUPS arrays
Add entries for all 26 sections organized into 8 groups.

### 3. Redirect `/settings` route to the windowed app
Modify the SettingsPage to simply launch the Settings window app (or render a minimal redirect/launcher that opens the window). The route still exists for deep-linking but opens the app.

### 4. Wire sidebar navigation entry
Ensure clicking "Settings" in the sidebar opens the Settings window app, not the route page.

### Technical Details
- All new sections use the Nova SDK UI components (`NovaCard`, `NovaToggle`, `NovaSlider`, `NovaSectionLabel`, etc.) matching the existing SettingsWindow style
- Hooks like `useSettingsValue`, `useAuth`, `useGovernanceSimulator`, `useOSOrchestration`, `useUpdateDaemon` are imported as needed
- Connector/integration data uses existing `useQuery` patterns from SettingsPage
- The file will be split into multiple sub-files under `src/components/sita/shell/windows/settings/` for maintainability
- No stubs or placeholders — all logic ported from existing working code

### Files Modified/Created
| File | Action |
|---|---|
| `src/components/sita/shell/windows/settings/AccountSections.tsx` | Create — Profile, Security, Connected Accounts |
| `src/components/sita/shell/windows/settings/SystemSections.tsx` | Create — General, Appearance, Display, Accessibility, Operating Modes, Device Mode |
| `src/components/sita/shell/windows/settings/ConnectivitySections.tsx` | Create — Network, Bluetooth, Cloud & Sync, Integrations |
| `src/components/sita/shell/windows/settings/SoundInputSections.tsx` | Create — Sound, Keyboard |
| `src/components/sita/shell/windows/settings/AISections.tsx` | Create — Advisors & AI, Plan & Usage |
| `src/components/sita/shell/windows/settings/NotificationSections.tsx` | Create — Notifications with push controls |
| `src/components/sita/shell/windows/settings/PrivacyTrustSections.tsx` | Create — Privacy, Trust & Security, Devices & Sessions |
| `src/components/sita/shell/windows/settings/AdvancedSections.tsx` | Create — Household, Business Rules, Workflows, Backup, Updates, Support, About |
| `src/components/sita/shell/windows/SettingsWindow.tsx` | Rewrite — import from sub-files, expand SECTIONS/GROUPS/CONTENT maps |
| `src/pages/SettingsPage.tsx` | Simplify — redirect/launcher that opens Settings window |
| `src/routes/os-routes.tsx` | Update — simplify settings sub-routes |

