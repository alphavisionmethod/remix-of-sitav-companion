

# SITA OS — Complete Test Plan

This is an exhaustive inventory of every feature, service, flow, and component that needs testing. Organized by category with specific test cases.

---

## 1. AUTHENTICATION & IDENTITY

### 1.1 Auth Flows
- Sign up with email + password — form validation, email sent, redirect
- Login with email + password — success, wrong password, unverified email
- Google OAuth login — redirect, callback, profile creation
- Forgot password — email sent, link works
- Reset password — token validation, new password set
- Logout — session cleared, redirect to login
- Protected route redirect — unauthenticated user → /login with return URL
- Session persistence — refresh page keeps user logged in
- Token refresh — expired token auto-refreshes

### 1.2 AuthContext
- `useAuth()` returns user, loading, signIn, signOut, signUp
- Auth state syncs across tabs
- Demo mode bypass

---

## 2. BOOT & FIRST-USE EXPERIENCE

### 2.1 Boot Sequence
- `BootSplash` renders and animates
- `FirstBootScreen` renders on first visit
- `SecureInitCeremony` — hardware detection, secure foundation
- Boot state persistence across refresh (`bootStatePersistence.ts`)
- Boot recovery card — shows when boot interrupted
- Boot handoff transition — boot → setup flow

### 2.2 Onboarding (29 Screens)
- `CinematicIntro` — renders, animations play
- `QuickIdentityStep` — name capture, validation
- `DeviceOwnershipStep` — device type selection
- `DeviceReadinessStep` — locale, network
- `NetworkSetupStep` — connection detection
- `SecureFoundationStep` — security setup
- `AccessProtectionStep` — PIN/biometric choice
- `AccountEnvironmentStep` — account creation/restore
- `PersonalizationPivotStep` — depth choice (quick/balanced/deep)
- `OperatingContextStep` — life snapshot
- `LifeRhythmStep` — rhythm discovery
- `StressSlippageStep` — stress mapping
- `HomeCompositionStep` — household context
- `HouseholdGraphStep` — people mapping
- `CommunicationsContextStep` — comms preferences
- `PlanningStyleStep` — calendar style
- `ExplanationStyleStep` — advisor tone
- `PresenceStyleStep` — notification style
- `InterruptionStyleStep` — interruption preferences
- `TrustCalibrationStep` — autonomy slider
- `AdvisorActivationStep` — advisor selection
- `FirstConnectionsStep` — connector wiring
- `FirstWinSetupStep` — first win choice
- `FirstSimulationStep` — simulation preview
- `EnvironmentSummaryStep` — summary review
- `DesktopPreviewStep` — desktop preview
- `DesktopTransitionStep` — transition animation
- `TrustCertificateStep` — trust cert generation
- Branching logic — quick skips to ~6 screens, deep shows all
- State persistence — interrupted onboarding resumes
- `ContextualWelcomeTour` — post-arrival guided tour
- `LearnLaterHub` — skipped items accessible later

---

## 3. DESKTOP SHELL (OS Layer)

### 3.1 Shell Layout
- `ShellLayout` renders with dock, menu bar, desktop surface
- Window manager context provides open/close/focus/minimize
- Desktop icons grid renders and launches apps
- Desktop context menu — right-click shows actions
- System menu bar — clock, status indicators, menus

### 3.2 Floating Windows
- Window open — spring animation from dock icon
- Window close — reverse animation
- Window drag — follows cursor, updates position
- Window resize — drag handles work
- Window minimize — animates to dock
- Window maximize — fills screen
- Window focus — z-index management, active window on top
- Multiple windows — z-ordering, focus switching
- Alignment guides — appear when dragging near other windows
- Distance labels (px) — show on alignment guides
- Haptic pulse animation — triggers on snap
- Picture-in-Picture — PiP mode for video/media

### 3.3 Desktop Dock
- Dock renders all registered apps
- Dock click → launches correct window
- Active app indicators (dot badges)
- Window preview on hover (`DockWindowPreview`)
- App badges (`useAppBadges`)
- OS_WINDOW_APPS set includes: finder, settings, notes, terminal, calendar, weather, system-monitor, music-player, calculator, photo-viewer, code-editor, mail-client, maps-app, security-center, app-library, update-center, cloud-sync, dev-tools

### 3.4 Lock Screen
- `EnhancedLockScreen` renders
- Clock display, date
- Unlock interaction (PIN/biometric sim)
- Lock on idle (`useIdleDetector`)

### 3.5 Menu Bar & Control Center
- `SystemMenuBar` — renders, time updates
- `ControlCenter` — toggles for WiFi, Bluetooth, DND, brightness, volume
- `ShellStatusBar` — battery, network, trust posture
- `TrustPostureChip` — shows current trust level

### 3.6 Notifications
- `NotificationDropdown` — opens, shows notifications
- `DesktopNotifications` — toast notifications appear
- Notification center — history, mark read, clear

### 3.7 Command Palette / Universal Command
- `CommandPalette` opens on Cmd+K / Ctrl+K
- Search filters (apps, pages, actions)
- Fuzzy matching
- Recent commands
- `UniversalCommandSurface` — universal search

### 3.8 Ambient & Background
- `ShellAmbientBackground` — gradient orbs or wallpaper
- Wallpaper selection persists via SettingsService
- Live preview on wallpaper change
- Crossfade animation between wallpapers
- `ShellLayout` wallpaper event listener

### 3.9 Edge Panels & Spatial
- `EdgePanels` — swipe from edges
- `SpatialDesktop` — spatial layout
- `AppSwitcher` — app switching UI
- `ClickRipple` — click feedback animation
- `ContextualCursor` — cursor changes by context

---

## 4. SYSTEM APPS (OS Windows)

### 4.1 Finder / File Manager
- `FinderWindow` — renders file tree
- Navigate folders, open files
- File operations: create, rename, delete
- File search within Finder
- File versioning (filesystem-service)
- File tagging system

### 4.2 Settings
- `SettingsWindow` — all sections render
- Profile — name, email, avatar
- Security — password, 2FA
- General — language, region
- Appearance — theme toggle (dark/light), accent color
- Wallpaper picker — grid, live preview, persistence
- Display — resolution, scaling
- Sound — volume controls
- Network — WiFi status
- Bluetooth — toggle
- Notifications — per-app toggles
- Privacy — permissions review
- Keyboard — shortcuts
- Cloud & Sync — sync toggle, targets, sync now
- About — version, build info

### 4.3 Terminal
- `TerminalWindow` / `NovaTerminal` — renders
- Command input, output display
- Command history (up/down arrows)
- Clear command
- Help command

### 4.4 Notes
- `NotesWindow` — create, edit, delete notes
- Rich text support
- Notes list sidebar

### 4.5 Calendar
- `CalendarWindow` — month view, day view
- Create/edit events
- Event display

### 4.6 Calculator
- `CalculatorWindow` — basic arithmetic
- Display updates on input
- Clear, equals, operators

### 4.7 Weather
- `WeatherWindow` — shows forecast
- Location-based data

### 4.8 Music Player
- `MusicPlayerWindow` — play/pause/next/prev
- Progress bar, volume
- Track list

### 4.9 Photo Viewer
- `PhotoViewerWindow` — displays images
- Zoom, pan

### 4.10 Code Editor
- `CodeEditorWindow` — syntax highlighting
- File tabs

### 4.11 Mail Client
- `MailClientWindow` — inbox, compose, send
- Thread view

### 4.12 Maps
- `MapsWindow` — renders map
- Search location

### 4.13 System Monitor
- `SystemMonitorWindow` — CPU, memory, network, GPU, services tabs
- Process list, kill process
- Real-time updates

### 4.14 Security Center
- `SecurityCenterWindow` — sandbox status, code signing, permission monitor
- App isolation levels display
- Permission transparency cards

### 4.15 App Library
- `AppLibraryWindow` — shows all registered apps
- Category filter, search
- Launch button → opens app window
- App state badges (running/registered/terminated)

### 4.16 Update Center
- `UpdateCenterWindow` — System/Apps/Rollback tabs
- Channel selector (stable/beta/canary)
- Check for updates button
- Download + install with progress bar
- App updates list, individual + batch update
- Rollback history, rollback button
- Auto-update toggle

### 4.17 Cloud Sync
- `CloudSyncWindow` — status/targets/conflicts
- Sync status indicator (green/amber/red)
- Sync targets enable/disable toggles
- Conflict resolution (keep local / use remote)
- Sync Now button

### 4.18 Developer Tools
- `DevToolsWindow` — Console/Processes/Memory/Crashes/Performance tabs
- Console: real-time log capture, level filter, search, clear
- Console capture service: monkey-patch, ring buffer, start/stop
- Process viewer: PID, name, state, kill
- Memory inspector: page table stats, JS heap
- Crash reports: empty state, crash display
- Performance: FPS counter, DOM node count, heap sparkline

---

## 5. NOVA SDK (Kernel & Runtime)

### 5.1 Kernel
- `ProcessManager` — create process, list processes, kill, state transitions
- `MemoryManager` — allocate/free pages, getStats, guard pages
- `Scheduler` — process scheduling, priority queues
- `Syscall` — syscall dispatch
- `Compositor` — window compositing
- `PowerManager` — power states, sleep/wake
- `Privilege` — privilege levels, escalation
- `Boot` — kernel boot sequence
- `Wayland` — display protocol

### 5.2 App Runtime
- `AppRuntime` — instantiation per app
- `AppMemoryGuard` — soft/hard limits, leak detection
- `AppEventLoop` — message queue, priority dispatch, pause/resume
- `AppResourceTracker` — track intervals/timeouts/listeners, auto-cleanup
- `AppErrorBoundary` — crash tracking, restart policy

### 5.3 App Lifecycle
- `lifecycle.ts` — state machine: launch → focus → blur → suspend → exit
- `loader.ts` — manifest validation, code signing, sandbox, runtime creation
- Design compliance check at load time
- Strict mode blocks non-compliant apps

### 5.4 Registry & Manifest
- `registry.ts` — app registration, state tracking, runtime field
- `manifest.ts` — manifest schema with designVersion field
- `useNovaApp` hook — auto-registration, returns runtime handle
- `useAppRuntime` hook — memory guard, event loop, resource tracker

### 5.5 Design System Enforcement
- `enforcement.ts` — spacing, font, radius, color, motion, shadow audits
- `design-contract.ts` — DesignContract, validateDesignCompliance
- `NovaThemeProvider` — CSS custom properties injection, useNovaTheme

### 5.6 Services
- `SettingsService` — get/set/subscribe, persistence
- `FilesystemService` — CRUD, versioning, tagging
- `WindowServer` — window management
- `ServiceManager` — service lifecycle
- `PermissionMonitor` — permission tracking, transparency
- `NotificationService` — notification dispatch
- `InputService` — input handling
- `ConsoleCapture` — monkey-patch, ring buffer, on/off, clear

---

## 6. CORE SERVICES

### 6.1 Brain Core
- Intent classification
- Advisor routing
- Planning
- Execution authorization

### 6.2 Policy Engine
- Policy evaluation
- Risk-tiered approval
- Policy versioning
- Simulation before enforcement

### 6.3 Executor Service
- Envelope validation
- Signature verification
- Policy hash check
- Approval proof
- Budget awareness
- Idempotency
- Receipt generation
- Connector delegation

### 6.4 Capability Router
- Route capability to correct handler
- `registerCapability`, `invokeCapability`, `hasCapability`, `listCapabilities`
- Error handling for unregistered capabilities
- Handler error catching
- Latency tracking

### 6.5 Event Bus
- Event publish/subscribe
- Event type filtering
- Multi-subscriber
- Event replay

### 6.6 Receipt Service
- Receipt creation
- Receipt verification
- Proof chain building
- Refusal receipts

### 6.7 Approval Engine
- Approval request creation
- Risk-tiered routing
- Multi-party approval
- Approval status tracking
- Timeout/escalation

### 6.8 Workflow Engine
- State machine transitions (draft → proposed → ... → closed)
- Timeout handling
- Retry policies
- Compensation/rollback
- Event emission on transition

### 6.9 Memory Service
- Episodic/semantic/procedural/preference memory
- Source attribution
- Privacy tiers
- Expiration
- Correction lineage
- Forget propagation

### 6.10 Cloud Sync Manager
- Version vectors
- Conflict resolution
- Push/pull updates
- syncSettings, syncSession, restoreFromCloud
- Start/stop sync loop
- Sync status tracking

### 6.11 System Update Service
- Check for updates
- Log update
- Rollback update
- Get update history
- Get system info
- App version tracking

### 6.12 Identity Graph
- User/household/org entities
- Role assignments
- Delegated authority
- Permission resolution

### 6.13 Entity Graph
- Entity creation/linking
- Relationship traversal

### 6.14 Search Fabric
- Cross-domain search
- Relevance scoring
- Recent/frequent weighting

### 6.15 Support Diagnostics
- Execution trace
- Policy decision trace
- "Why?" explanations

### 6.16 Connector Control Plane
- Connector lifecycle
- Health monitoring
- OAuth flow management
- Rate limiting

### 6.17 Predictive Intent Engine
- Time-pattern learning
- Confidence scoring
- Prediction generation
- `learnFromAction` on app launch
- `dismissPrediction`
- getTopSuggestions

### 6.18 Routine Detector
- Launch co-occurrence detection
- `recordLaunch` wired to app launches

---

## 7. DOMAIN PAGES & FEATURES

### 7.1 Daily Pulse / Home
- `/` — renders daily pulse
- Advisor suggestions
- Recent activity
- Action items

### 7.2 Business OS
- `/business` — Business Center
- Lead management (CRM)
- Pipeline view
- Revenue tracking
- Client health scores
- Customer detail page
- Opportunity engine

### 7.3 Finance OS (Money)
- `/money` — Money Center
- Cash flow overview
- Bill payment
- Invoice management
- Reserve tracking
- Budget automation
- Capital allocation
- Money onboarding flow

### 7.4 Concierge OS
- `/concierge` — Concierge Center
- Calendar workspace
- Tasks & workflows
- Travel booking
- Household management
- Personal life workspace
- Communications inbox

### 7.5 Boardroom
- `/boardroom` — requires auth (e2e test exists)
- Council sessions
- Advisor comparison
- Scenario simulation
- Decision packages
- Weekly boardroom
- Boardroom entry ceremony

### 7.6 Mission Control
- `/mission` — admin cockpit
- System pulse hero (health score 0-100)
- AI Team grid
- Incidents tab
- Connectors tab
- Recovery tab
- Costs tab
- Trust tab
- Replay tab
- Releases tab
- Permissions tab
- Safe Mode toggle
- History tab

### 7.7 Advisor System
- Advisor council grid
- Single advisor workspace
- Advisor chat
- Advisor FAB (floating action button)
- Disagreement theater
- Confidence radar
- Memory transparency cards
- Approval-ready action cards

### 7.8 Files & Vault
- `/files` — Files Center
- File browser, upload, download
- Vault (secure documents)
- File ingestion pipeline
- Document editor

### 7.9 Settings Page
- `/settings` — Settings page (separate from OS window)
- Profile, security, notifications, privacy

### 7.10 Approvals
- `/approvals` — Approvals center
- Approval chamber
- Review & approve pattern
- Approval queue

### 7.11 Workflows
- `/workflows` — Workflows center
- Workflow replay hub
- Tasks & workflows center

### 7.12 Search
- `/search` — Search page
- Global search results

### 7.13 App Platform
- `/app-platform` — Dashboard
- Apps management
- Connector hub
- Marketplace
- Email, Vault, Health, Gallery apps

### 7.14 Store / Pack Store
- `/store` — Pack store
- App discovery, install, ratings
- Downloads center

### 7.15 Admin Pages
- Users admin
- Policy editor
- Governance dashboard
- AI economics
- AI workforce
- Observability
- Service architecture dashboard

### 7.16 Owner Mode
- `/owner` — Owner center
- Owner control room
- Permissions center
- Trust center
- Proof center

---

## 8. CONTEXTS & PROVIDERS

- `AuthContext` — auth state, user object
- `AppPlatformContext` — apps, install/uninstall/update
- `AppearanceContext` — theme, accent
- `CalmEngineContext` — calm mode state
- `ConciergeDataContext` — concierge data
- `ConnectivityContext` — online/offline
- `DataModeContext` — demo/live mode
- `DemoModeProvider` — demo mode toggle
- `DisplayModeContext` — display settings
- `EntityContext` — entity graph
- `InspectorContext` — inspector panel
- `NovaSDKContext` — SDK initialization
- `SitaKernelContext` — kernel state
- `SitaOSContext` — OS-level state
- `ThemeContext` — dark/light
- `WindowManagerContext` — window operations
- `RevenueOfficeModeContext` — revenue mode

---

## 9. HOOKS

### Critical Hooks to Test
- `useAuth` — auth state, loading
- `use-settings-value` — get/set persisted settings
- `use-wallpaper` — wallpaper state
- `use-global-search` — search queries
- `use-push-notifications` — VAPID push
- `use-proof-chain` — proof receipt chain
- `use-brain-core` — brain core integration
- `use-domain-data` — domain data fetching
- `use-admin-data` — admin data
- `use-boardroom-data` — boardroom data
- `use-business-data` — business data
- `use-money-data` — finance data
- `use-concierge-data` — concierge data
- `use-session-restore` — session persistence
- `use-online-status` — connectivity
- `use-calm-mode` — calm mode
- `use-gesture-engine` — gestures
- `use-kernel-events` — kernel event handling
- `useWindowManager` — window CRUD
- `useIdleDetector` — idle timeout
- `useReducedMotion` — accessibility

---

## 10. CROSS-CUTTING CONCERNS

### 10.1 Demo Mode
- Toggle demo/live mode
- Demo data loads correctly
- Demo governance banner shows
- No real mutations in demo mode

### 10.2 Offline Support
- Offline banner shows
- Offline queue persists mutations
- Reconnect syncs queued mutations
- Service worker registration

### 10.3 PWA
- PWA install prompt shows
- App installs correctly
- Manifest valid

### 10.4 Keyboard Shortcuts
- Cmd+K opens command palette
- Escape closes modals/windows
- Tab navigation (a11y)
- `KeyboardShortcuts` component

### 10.5 Accessibility
- Skip to content link
- Route announcer for screen readers
- Reduced motion support
- Focus management
- ARIA labels on interactive elements

### 10.6 Error Handling
- `GlobalErrorBoundary` catches render errors
- `RouteErrorBoundary` catches route errors
- Error fallback UI renders
- Recovery button works

### 10.7 Theme
- Dark mode renders correctly
- Light mode renders correctly
- Theme toggle persists
- CSS variables update

### 10.8 Responsive / Mobile
- Mobile bottom nav renders on small screens
- Responsive layouts at breakpoints
- Mobile routes work
- Touch interactions

### 10.9 Sound Engine
- Sound effects play on interactions
- Volume respects settings
- Mute toggle

### 10.10 Internationalization (i18n)
- Language switching
- Translations load

---

## 11. ARCHITECTURE VALIDATION (Scripts)

- `boundary-check.ts` — 3-domain boundary enforcement
- `check-advisor-registry.ts` — advisor registry sync
- `check-capability-families.ts` — capability completeness
- `check-connector-catalog.ts` — connector catalog sync
- `check-contract-family-completeness.ts` — contract barrel exports
- `check-contract-registry.ts` — contract manifest sync
- `check-event-catalog.ts` — event type completeness
- `check-event-receipt-linkage.ts` — event → receipt pairing
- `check-module-count.ts` — service count ≤ 45
- `check-outbound-communication-policy.ts` — no raw HTTP in domain code
- `check-policy-coverage.ts` — capability → policy binding
- `check-proof-coverage.ts` — mutation → receipt binding
- `check-sensitive-document-privacy.ts` — no PII in artifacts
- `check-service-sprawl.ts` — service sprawl detection
- `check-status-truth-tags.ts` — canonical status tags
- `check-surface-ownership.ts` — route → owner mapping
- `check-workflow-state-usage.ts` — workflow state machine usage

---

## 12. E2E JOURNEYS (Playwright)

### Existing
- Auth journeys — login, signup, protected routes
- Boardroom journey — requires auth
- Business journey — CRM flows
- Money journey — finance flows
- Advisor journey — advisor interactions
- Approvals journey — approval flows
- Connectors journey — connector setup
- Files journey — file operations
- Settings journey — settings changes
- Setup flow — onboarding
- Demo mode — demo toggle, data
- Navigation — sidebar, routing
- Responsive — breakpoints
- Route health — all routes return 200
- Route smoke — all routes render
- Push notification — VAPID flow
- Interactions — click, drag, type
- Admin boards — admin panels
- Verification boards — verification flows
- Customer journey boards — customer pipeline

### Missing E2E Tests Needed
- Desktop shell — dock clicks, window management
- Window alignment guides + distance labels
- Wallpaper selection + persistence
- Lock screen → unlock
- Command palette search
- Control center toggles
- System app windows (all 18)
- Update Center — check, download, rollback
- Cloud Sync — toggle, sync now, conflicts
- Dev Tools — console capture, process viewer
- Intent suggestions widget — appear, click, dismiss
- App Library — search, filter, launch
- Security Center — sandbox status, permissions
- Onboarding full flow — quick/balanced/deep paths
- Post-arrival tour
- Safe Mode toggle in Mission Control
- Advisor disagreement theater
- Boardroom simulation studio

---

## 13. INTEGRATION TESTS

### Existing
- AI gateway chain
- Approval engine flow
- Auth flow
- Capability registry
- Connector lifecycle
- Customer journey pipeline
- Demo mode resolution
- Event bus wiring
- File ingestion chain
- Policy engine chain
- Verification pipeline
- Workflow engine chain
- Dual reality governance
- Health check
- Push notification flow
- Service flows

### Missing Integration Tests Needed
- Brain Core → Policy Engine → Executor → Receipt chain
- Settings change → Cloud Sync push
- App launch → Intent Engine learning → Suggestion generation
- System Update → Rollback → History verification
- Console Capture start → log entries → filter → clear
- App load → Runtime creation → Resource tracking → Cleanup on terminate
- Design contract validation → Strict mode block
- Connector auth → Health monitoring → Error → Auto-pause
- Workflow state machine → Timeout → Escalation → Receipt
- Memory write → Privacy tier → Read access → Forget propagation

---

## 14. UNIT TESTS

### Existing (178 files)
Core services, domain engines, contracts, hooks, components, etc.

### Missing Unit Tests Needed
- `console-capture.ts` — startCapture, stopCapture, getEntries, clear, on, ring buffer overflow
- `managed-runtime.ts` — AppRuntime, AppMemoryGuard limits, AppEventLoop priority dispatch, AppResourceTracker cleanup
- `design-contract.ts` — validateDesignCompliance, color/motion/shadow auditors
- `UpdateCenterWindow` — tab switching, channel selector, progress bar
- `CloudSyncWindow` — status display, target toggles, conflict resolution
- `DevToolsWindow` — tab switching, log display, process table
- `IntentSuggestionsWidget` — predictions display, click action, dismiss, auto-hide
- `AppLibraryWindow` — search filter, category filter, launch
- `window-physics.ts` — alignment guide distance calculation
- `CloudSyncManager.syncSettings/syncSession/restoreFromCloud`
- `SystemUpdateService.rollbackUpdate/getSystemInfo`
- `PredictiveIntentEngine.dismissPrediction/getTopSuggestions`
- `SettingsService` — cloud.syncEnabled key

---

## Summary

| Category | Test Count (Approx) |
|----------|---------------------|
| Auth & Identity | 12 |
| Boot & Onboarding | 52 |
| Desktop Shell | 45 |
| System Apps (18 windows) | 95 |
| Nova SDK Kernel/Runtime | 40 |
| Core Services | 65 |
| Domain Pages | 80 |
| Contexts & Providers | 17 |
| Hooks | 25 |
| Cross-Cutting | 30 |
| Architecture Scripts | 17 |
| E2E Journeys | 40 |
| Integration Tests | 20 |
| Missing Unit Tests | 25 |
| **TOTAL** | **~563 test cases** |

This is a living document — as new features are added, tests should be added following the Feature Integration Protocol (FIP rule 7: no feature without supportability).

