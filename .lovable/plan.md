
# Audit: Founder/Admin AI Control Dashboard — Gaps Found

## What's Already Fully Implemented (Complete)
1. **3-Panel Shell** (Section 3) — FounderControlShell with sidebar, main, right panel
2. **Global Command Bar** (Section 4) — Always-visible, NLP input, plan cards, Approve/Simulate/Edit/Cancel
3. **Left Sidebar** (Section 6) — 18 modules across 6 groups, collapsible, environment badge, alert badges
4. **Right AI Panel** (Section 9) — Summary/Detailed modes, active tasks, reasoning trace, suggestions with Why/Simulate/Apply
5. **Command Templates** (Section 17D) — 8 templates: Reliability Sprint, Security Sweep, etc.
6. **Safety UX** (Section 12) — Risk previews, typed CONFIRM for critical, safer alternatives, rollback info
7. **Execution Timeline** (Section 13) — Full command-to-outcome lifecycle, expandable events
8. **One-Click Actions** (Section 11) — 8 quick actions wired to safety dialogs
9. **Simulation Preview** (Section 17B) — 3 what-if scenarios with metric comparisons
10. **Mobile Nav** (Section 14) — Bottom nav for mobile
11. **All 16 Module Pages** (Section 8) — Routed and permission-gated
12. **Rollout Status Banner** — Active in trust ribbon area

## Gaps Found (Need Enhancement)

### Gap 1: MissionControlHome Missing Prompt-Required Elements
The dashboard (Section 7) is missing several items the prompt explicitly requires:
- **Health Score Gauge** (circular, 0-100) — Currently just a text badge saying "Platform healthy"
- **AI Suggestions Panel** with Explain/Simulate/Apply/Dismiss actions — Not on the home dashboard (only in the right panel)
- **Quick Action Cards** — Not embedded in the dashboard (OneClickActions exists but isn't used on home)
- **AI Budget Health** metric — Missing from the top KPI strip
- **Sync Reliability** metric — Missing from top KPI strip
- **"What should I do next?"** guidance — Missing

### Gap 2: MissionControlHome Should Show OneClickActions + CommandTemplateCards
The prompt says the home screen should include one-click strategic actions and template cards. These components exist but aren't imported/rendered on the dashboard.

### Gap 3: MissionControlHome Missing ExecutionTimeline
The prompt requires a "recent activity timeline" showing command lifecycle. The ExecutionTimeline component exists but isn't shown on the home dashboard.

### Gap 4: Mobile Nav Paths Are Wrong
`FounderMobileNav.tsx` uses paths like `/admin/mc-system-health` and `/admin/command-center` but the actual routes are `/admin/mc/system-health` and `/admin/founder/command`. These links won't resolve.

### Gap 5: SimulationPreview Not Used Anywhere
The component exists but isn't rendered in any page. Should be on the Command Center or Dashboard.

### Gap 6: "Why am I seeing this?" Not Implemented
Section 16 requires this tooltip everywhere on AI suggestions. The right panel has "Why?" buttons but no actual tooltip/popover with explanations across module pages.

### Gap 7: Glossary Help Not Implemented  
Section 16 requires "glossary help built in" — no glossary component exists.

---

## Implementation Plan (3 Focused Batches)

### Batch A: Enhance MissionControlHome (Largest Gap)
- Add circular health score gauge (computed from subsystem health weights per Section 7)
- Add top KPI strip with: Health %, Sync Reliability, Security Risk, Active Incidents, Release Readiness, AI Cost Efficiency (6 pills as prompt specifies)
- Import and render `OneClickActions` in a "Quick Actions" section
- Import and render `CommandTemplateCards` (compact mode) 
- Import and render `ExecutionTimeline` (compact, maxVisible=5) showing recent activity
- Add AI Suggestions section with Explain/Simulate/Apply/Dismiss actions (pull from DEMO_SUGGESTIONS pattern used in AITransparencyPanel)

### Batch B: Fix Wiring Issues
- Fix `FounderMobileNav.tsx` paths to match actual routes (`/admin/mc/system-health`, `/admin/founder/command`, `/admin/mc/incidents`, `/admin/mc/trust-security`)
- Add `SimulationPreview` to the Command Center page (FCC01) or create a dedicated command center sub-view
- Wire `CommandTemplateCards` `onSelectTemplate` callback to actually populate the GlobalCommandBar

### Batch C: Beginner-Friendly UX Layer
- Create a reusable `WhyTooltip` component (small "?" icon with popover explaining the metric/suggestion in plain language)
- Add `WhyTooltip` to AI suggestions on home dashboard and right panel
- Create a `GlossaryDrawer` component with searchable terms (SLO, canary, rollback, trust score, etc.)
- Add glossary trigger to sidebar footer
- Add placeholder guidance examples in module pages where applicable

### Technical Notes
- No database changes needed
- No new routes needed
- All changes are frontend component composition
- Follows existing glassmorphic design tokens
- Uses existing `useAuth().isDemo` pattern
