

# SITA OS — Phases 2.12–2.17: Trust Calibration, Advisor Activation, Connections, First Win, Arrival, Desktop Transition

## Summary

Create 4 new premium setup phases and fully rewrite 2 existing ones to match the spec. This covers the final stretch of onboarding from trust calibration through the ceremonial desktop entry.

## What exists vs what's needed

| Phase | Status | Action |
|-------|--------|--------|
| 2.12 Trust & Autonomy Calibration | Missing | **Create** new component + DAG entry |
| 2.13 Advisor Activation | Missing | **Create** new component + DAG entry |
| 2.14 First Connections | Exists but basic | **Rewrite** with world-model-based recommendations, "why it matters", value previews |
| 2.15 First Win Setup | Missing | **Create** new component + DAG entry |
| 2.16 Arrival Preparation | Exists but basic | **Rewrite** with full summary, desktop preview, module illumination, deferred items |
| 2.17 Desktop Transition | Missing | **Create** new component + DAG entry |

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/packages/contracts/specialized/setup-orchestration.ts` | Add 4 new phase IDs: `trust-calibration`, `advisor-activation`, `first-win-setup`, `desktop-transition` |
| `src/lib/engines/setup-phase-definitions.ts` | Add 4 new phase definitions; reorder DAG so flow is: `primary-use-mode` → `trust-calibration` → `advisor-activation` → ... → `first-connections` → `first-win-setup` → ... → `arrival-prep` → `desktop-transition` → `system-check` |
| `src/components/sita/onboarding/TrustCalibrationStep.tsx` | **Create** (~450 lines) |
| `src/components/sita/onboarding/AdvisorActivationStep.tsx` | **Create** (~400 lines) |
| `src/components/sita/onboarding/FirstConnectionsStep.tsx` | **Rewrite** (~350 lines) |
| `src/components/sita/onboarding/FirstWinSetupStep.tsx` | **Create** (~380 lines) |
| `src/components/sita/onboarding/ArrivalPrepStep.tsx` | **Rewrite** (~400 lines) |
| `src/components/sita/onboarding/DesktopTransitionStep.tsx` | **Create** (~300 lines) |
| `src/components/sita/OSSetupExperience.tsx` | Add imports, state fields, phase rendering, canAdvance, finishSetup persistence |

## DAG Insertion Order

```text
... → primary-use-mode
    → trust-calibration (5.5, depends: primary-use-mode)
    → advisor-activation (5.6, depends: trust-calibration)
    → welcome (6, depends: advisor-activation) ← updated dependency
    → cinematic-intro → setup-style → identity → ...
    → first-connections (20, updated: uses world model + use mode)
    → first-win-setup (20.5, depends: first-connections, new)
    → ... → arrival-prep (25, rewritten)
    → desktop-transition (25.5, depends: arrival-prep, new)
    → system-check (26, depends: desktop-transition) ← updated dependency
    → trust-certificate (27)
```

## Component Designs

### TrustCalibrationStep (~450 lines)
- Title: "Choose how SITA should help"
- Subtitle: "You control what SITA can suggest, simulate, and handle"
- **Trust ladder** — 5 levels as vertical stepped cards with animated connector lines:
  1. Observe only — "SITA watches, never acts"
  2. Suggest — "SITA recommends, you decide"
  3. Simulate before action — "SITA previews outcomes, asks before proceeding"
  4. Ask before acting — "SITA prepares actions, executes only on approval"
  5. Handle routine tasks automatically — "SITA manages repetitive tasks, flags exceptions"
- **Right panel: Workflow preview** — animated pipeline showing Draft → Preview → Approval → Execute → Proof, highlighting which stages are active based on selected trust level
- **Additional trust controls** (collapsible "Fine-tune" section):
  - Spending threshold slider ($0–$500)
  - Financial approvals toggle
  - Calendar change approvals toggle
  - Outbound communication approvals toggle
  - Reminder frequency selector (minimal / balanced / frequent)
  - Escalation behavior (silent / notify / urgent)
  - Family permissions toggle
  - Business workflow permissions toggle
- State: `trustCalibration: { level: number; spendingThreshold: number; financialApprovals: boolean; calendarApprovals: boolean; communicationApprovals: boolean; reminderFrequency: string; escalationBehavior: string; familyPermissions: boolean; businessPermissions: boolean }`
- canAdvance: trust level must be selected

### AdvisorActivationStep (~400 lines)
- Title: "Meet your advisory team"
- Subtitle: "Choose who should be active from day one"
- 6 advisor cards derived from `ADVISOR_CONFIGS` plus Life/Growth advisors:
  - Life Advisor, Money Advisor, Business Advisor, Family Advisor, Concierge Advisor, Growth Advisor
- Each card shows: role, when it appears, what it helps with, activity level (quiet/normal/active), example recommendation, where in OS
- Based on prior selections (primaryUseMode, quickIdentity, worldModel), some advisors pre-highlighted as "recommended"
- Controls per advisor: enable/disable toggle, priority selector (quiet/normal/active), "Preview sample interaction" expandable
- **Right panel: System map** — shows OS regions (Business OS, Finance OS, Concierge OS, Trust Center, Boardroom). As advisors are enabled, their regions illuminate with staggered glow. Desktop preview and boardroom preview update.
- State: `activeAdvisors: { id: string; enabled: boolean; priority: string }[]`
- canAdvance: at least 1 advisor enabled

### FirstConnectionsStep — Rewrite (~350 lines)
- Title: "Connect what matters first"
- Subtitle: "Start with the systems that will help SITA support you immediately"
- 10 connection categories: Calendar, Email, Files/docs, Bank/finance, CRM/leads, Messaging, Household tools, Notes/reminders, Contacts, Cloud storage
- **Recommendation logic**: filter and sort based on `primaryUseMode` and `worldModel` — Business mode highlights CRM/Email, Money mode highlights Bank, Family mode highlights Calendar/Household
- Each connection card shows:
  - Why it matters now (derived from world model)
  - What SITA can do after connection
  - Trust boundary note ("Read-only access. You approve all actions.")
  - Connect now / Later toggle
- **Immediate value preview**: after each connection, inline animated reveal: "SITA can now detect overdue follow-ups" / "SITA can now build your bill calendar" etc.
- State: extends existing `connected` set + `deferredConnections: string[]`

### FirstWinSetupStep (~380 lines)
- Title: "Let's set up your first win"
- Subtitle: "Choose one useful thing for SITA to prepare first"
- **Dynamic recommendations** based on primaryUseMode:
  - Business: recover missed leads, build callback queue, prepare first boardroom review
  - Money: build bill calendar, create spending pulse, set savings focus
  - Household: unify family calendar, create shared task rhythm, prepare household board
  - Personal: create daily pulse, identify slipping tasks, prepare weekly plan
- **Flow**: Recommend → Preview → Approve → Prepare → Confirm
  - Step 1: User selects a first win
  - Step 2: Animated preview of what SITA will prepare
  - Step 3: "Approve this first win" button
  - Step 4: Brief preparation animation
  - Step 5: Confirmation of what will appear on desktop
- State: `firstWin: { category: string; action: string; approved: boolean; prepared: boolean }`
- canAdvance: must approve a first win

### ArrivalPrepStep — Rewrite (~400 lines)
- Title: "Your environment is ready"
- Shows full summary of: active advisors, selected use mode, trust mode, connected systems, first workflow prepared, privacy baseline, deferred setup items, first boardroom readiness
- **Visual treatment** — the most beautiful screen:
  - Fully assembled environment map (animated nodes for each OS domain)
  - Desktop preview widget (miniature mock showing sidebar + main content area)
  - Illuminated modules with staggered glow
  - Advisor presence indicators
  - Elegant summary cards with icons and completion badges
- **CTAs**: Primary "Enter SITA", Secondary row: "Review settings" / "Make changes" / "Learn the basics"
- Receives all state fields as props to show comprehensive summary

### DesktopTransitionStep (~300 lines)
- Title: none (fullscreen cinematic)
- **Transition sequence** (timed, ~5-6 seconds total):
  1. Arrival summary holds briefly (0.5s)
  2. Background shifts to full desktop color
  3. Setup shell dissolves (fade + scale)
  4. Wallpaper gradient resolves
  5. Top system bar slides down from top
  6. Dock slides up from bottom
  7. Boardroom/home intelligence surface fades in center
  8. Welcome card appears with gentle scale-in
  9. First priorities surface softly
  10. Advisor presence becomes visible (small avatar indicators)
- All animated with framer-motion orchestrated sequence using `delay` chains
- **Welcome state visible**: welcome card, first boardroom summary, first-win module ready, top priorities, quiet advisor presence, visible trust mode indicator
- After sequence completes (~5s), auto-advances to system-check
- Fullscreen, no back button

## OSSetupExperience Integration

### New state fields
```ts
trustCalibration: {
  level: number;
  spendingThreshold: number;
  financialApprovals: boolean;
  calendarApprovals: boolean;
  communicationApprovals: boolean;
  reminderFrequency: string;
  escalationBehavior: string;
  familyPermissions: boolean;
  businessPermissions: boolean;
};
advisorActivation: { id: string; enabled: boolean; priority: string }[];
deferredConnections: string[];
firstWin: { category: string; action: string; approved: boolean; prepared: boolean };
```

### Phase exclusions
- `trust-calibration`, `advisor-activation` added to `showLearningPanel` and session progress bar exclusion (they are early boot phases)
- `desktop-transition` added to both exclusion lists (fullscreen cinematic)

### canAdvance updates
- `trust-calibration`: level must be > 0
- `advisor-activation`: at least 1 advisor enabled
- `first-win-setup`: firstWin.approved must be true
- `desktop-transition`: auto-advances (no manual advance)

### finishSetup persistence
Add: `trust_calibration`, `advisor_activation`, `deferred_connections`, `first_win` to user_memory upsert array

## Design & Animation Patterns
- All use existing `motion.div` spring: `damping: 28, stiffness: 280`
- Colors: `bg-primary/8` selected, `border-primary/50` active, SITA brand colors throughout
- Trust ladder uses vertical stepper with animated connection lines between levels
- Advisor cards use the same `whileHover={{ scale: 1.02 }}` pattern
- Desktop transition uses orchestrated `delay` chains with `AnimatePresence`
- All icons from `lucide-react`, no external dependencies
- `cn()` utility for conditional classes throughout

## Implementation Order
1. Add 4 new phase IDs to contract
2. Add 4 phase definitions to DAG, update dependencies for `welcome` and `system-check`
3. Create `TrustCalibrationStep` and `AdvisorActivationStep` (parallel)
4. Rewrite `FirstConnectionsStep` and create `FirstWinSetupStep` (parallel)
5. Rewrite `ArrivalPrepStep` and create `DesktopTransitionStep` (parallel)
6. Wire all into `OSSetupExperience` (imports, state, render, canAdvance, persist)
7. Verify with `tsc --noEmit`

