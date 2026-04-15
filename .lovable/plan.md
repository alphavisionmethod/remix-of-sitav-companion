

# Part 3 — OS/App/Cloud Architecture Lock-In (Admin Dashboard)

## What Already Exists from Part 2
SurfaceAuthorityMatrix (14 action entries), StateAuthorityMap (3 classes), ControlReceiptsPanel, EmergencyAuthorityPanel, PlatformAdaptationRules (10 rules + exclusive features), RemoteAuthoritySession, Command Origin badges, Trust Authority in StatusStrip, LearningYouPanel dual tabs. All routed and in sidebar.

## What Part 3 Adds (New Admin-Only Surfaces)
Part 3 formalizes the **full architectural governance model** with deeper matrices and lifecycle visualizations that Part 2's panels don't cover.

### Batch 1 — Feature Ownership & Command Routing
1. **FeatureOwnershipMatrix.tsx** — Interactive table of all 10 canonical features (File Open, File Sync, App Execution, App Install, Device Trust, Remote Lock, System Update, Security Alert, Workspace Continuity, Command Execution) with 6 ownership columns (Execution, Truth, Control, Approval, Visibility, Recovery). Each cell shows the responsible layer (OS/Cloud/App) with color coding and expandable details. Filterable by layer. New page at `/admin/mc/feature-ownership`.

2. **CommandRoutingLifecycle.tsx** — Visual 6-stage pipeline: Origin → Cloud Parse → Cloud Plan → App Approval → OS Execute → Cloud Verify. Each stage is an interactive node showing what happens. Below: 4 canonical routing cases (Optimize Performance, Fix Sync, Install Low-Trust App, Remove Trusted Device) rendered as animated step-through walkthroughs. New page at `/admin/mc/command-routing`.

3. **ApprovalFlowArchitecture.tsx** — Shows the structured approval sequence (request → risk eval → approval request → prompt → decision → execution → receipt → audit). Lists all 8 approval-required action classes. Each class expandable to show the full prompt template with action/device/risk/rollback fields. New page at `/admin/mc/approval-flow`.

### Batch 2 — Failure, Recovery & Events
4. **FailureOwnershipModel.tsx** — Matrix panel mapping each feature to: failure detector, user-visible surface, recovery authority, execution layer of repair. Includes 2 worked examples (sync upload failure, trust anomaly) as expandable case studies with step-by-step flow diagrams.

5. **RecoveryOwnershipModel.tsx** — For each feature: planner, authorizer, executor, visibility surface. Two worked examples (local file conflict, device compromise). Each with animated flow arrows showing which layer acts when. Combined with Failure panel on a single page at `/admin/mc/failure-recovery`.

6. **EventRoutingModel.tsx** — Three-column layout: OS Events (11 types), Cloud Events (11 types), App Events (8 types). Below: event infrastructure checklist (event IDs, correlation IDs, actor tags, trust tags, risk tags, visibility scope, audit linkage, retry support) with live status indicators. New page at `/admin/mc/event-routing`.

### Batch 3 — Copy, Visibility & Validation
7. **UXCopySeparation.tsx** — Side-by-side panel showing OS language (Open, Continue, Run, Save, Restore, Resume, Install) vs App language (Approve, Deny, Control, Lock, Revoke, Monitor, Review, Send command). Each word linked to its architectural rationale. Added as a tab inside PlatformAdaptationRules (not a new page).

8. **VisibilityRulesPanel.tsx** — Two-column comparison: what OS shows (local status, work continuity, sync state, trust messages, runtime state, update progress) vs what App shows (account-wide view, device fleet, trust state, command history, pending approvals, rollout overview, remote results). Added as a tab inside PlatformAdaptationRules.

9. **ArchitectureSeparationTests.tsx** — Admin panel showing test assertions that prove the architecture: App cannot impersonate OS execution, OS cannot self-authorize risky actions, Cloud cannot bypass App approval, offline OS remains usable, offline App limits controls, trust propagation works, command routing correct, audit trails exist, rollback works. Each test shows pass/fail with explanation. New page at `/admin/mc/architecture-tests`.

### Batch 4 — Expand Existing + Wiring
10. **Expand SurfaceAuthorityMatrix** — Add the missing entries from Part 3's Section 12 (Force Sync, Delete Trusted Device) plus expand existing entries to include all 6 ownership dimensions (not just boolean flags). Add "Decision Surface" and "Recovery Surface" columns.

11. **Expand StateAuthorityMap** — Add the full state items from Part 3 Section 5 (OS: 8 items, Cloud: 13 items, App: 7 items) ensuring every canonical state item is represented.

12. **Route & Sidebar Wiring** — Register 5 new routes (`feature-ownership`, `command-routing`, `approval-flow`, `failure-recovery`, `event-routing`, `architecture-tests`) in AdminRoutes.tsx. Add new sidebar group "Architecture Governance" in FounderSidebar with all new pages. Export all new components from index.ts.

## Technical Details
- All new components in `src/components/admin/shells/` (panels) and `src/pages/admin/modules/` (pages)
- Follow existing glassmorphic pattern: `bg-white/[0.03]`, `WhyTooltip`, `motion` animations
- Full demo data for every panel — no stubs, no placeholders
- Reuse `CommandOrigin` type from SurfaceAuthorityMatrix
- New shared type: `type OwnershipLayer = "os" | "cloud" | "app" | "os_cloud" | "app_cloud" | "os_app"`
- No user OS files touched — all admin-only under `/admin/` routes
- Total: ~8 new component files, ~4 modified files, 6 new routes

