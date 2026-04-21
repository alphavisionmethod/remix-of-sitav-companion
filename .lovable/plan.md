

# Post-Onboarding Environment Shaping for Business OS

After completing the 21-screen business formation, nothing visibly changes in the OS. The onboarding data gets saved but is never consumed. This plan wires the onboarding output into every surface the user sees after completing formation.

---

## Problem Summary

1. **Broken navigation**: RevealScreen navigates to `/revenue-office/boardroom` (a page route), which does not open inside the windowed Business OS app. The user lands on a standalone page instead of their new environment.
2. **Disconnected data**: `AdaptiveBusinessHome` reads from `useBusinessProfile()` (archetype weights), but the detailed onboarding state (business name, types, priorities, bottlenecks, revenue sources, team size, automation level, first wins) is never consumed by the home screen or any post-formation surface.
3. **No environment shaping**: After formation, the user sees the same generic adaptive home with demo/default data. No first-win activation, no personalized modules, no priority-driven layout.

---

## 1. Fix Post-Onboarding Navigation

**Files modified:** `RevealScreen.tsx`, `BusinessAppShell.tsx`

- Remove the `navigate("/revenue-office/boardroom")` calls from RevealScreen. Instead, call `markComplete(state)` and then call the `onComplete` callback (passed through from FormationShell), which sets `formationDone = true` in BusinessAppShell, naturally revealing the main shell.
- After `formationDone` transitions to true, set `activeModule` to `"adaptive-home"` (already the default) so the user lands on their personalized home.
- Add a brief post-formation arrival ceremony (a 2-second fade transition with "Your Revenue Office is ready" before the home appears).

## 2. Bridge Onboarding State into Business Profile

**Files modified:** `BusinessAppShell.tsx`, `AdaptiveBusinessHome.tsx`, new hook `useOnboardingBridge.ts`

- Create `src/hooks/useOnboardingBridge.ts`: reads from `useBusinessOnboarding().savedState` and maps onboarding answers to `BusinessProfileContext` overrides:
  - `businessTypes` array maps to archetype weight boosts (e.g., "service" type boosts service archetype)
  - `teamSize` maps to employee-based weight
  - `revenueSources` influences ecommerce/service/appointment weights
  - `automationLevel` sets operating flags
- Call this bridge in `BusinessAppShellInner` after formation completes, so the archetype engine recalculates with real onboarding data.
- This makes `AdaptiveBusinessHome` automatically show the correct greeting, widgets, quick actions, and stat cards based on what the user told us.

## 3. Build Post-Formation Home Sections

**Files modified:** `AdaptiveBusinessHome.tsx`

Add three new sections that consume onboarding state directly:

- **Business Twin Card**: Show the business name, type, team size, revenue model, and automation level the user selected. Include an "Edit" link back to formation.
- **Priority-Driven Module Grid**: Read `savedState.orderedPriorities` and render the top 4-6 priorities as actionable module cards (Revenue, Customers, Operations, Finance) ordered by the user's ranking. Each card links to the relevant Business OS module.
- **First Win Activation Strip**: Read `savedState.selectedFirstWins` and show 1-3 active first-win cards with progress indicators and "Start" buttons. These are the quick wins the user chose during onboarding.
- **Bottleneck Alerts**: Read `savedState.growthBottlenecks` and show 2-3 flagged areas as amber alert cards with "Investigate" actions linking to the relevant modules (Leak Detector, Conversion Lab, etc.).

## 4. Calibrate Advisors from Onboarding

**Files modified:** `AdaptiveBusinessHome.tsx`, advisor data layer

- Read the onboarding `automationLevel` to set initial advisor autonomy display (show "Trust Level: Supervised" or "Trust Level: Guided" badge).
- Read `savedState.activeAdvisors` (if populated during AdvisorActivationScreen) to show which advisors are "online" in the home header.
- Show a mini advisor signal strip on the home page with the 2-3 most relevant advisor insights based on the user's business type and bottlenecks.

## 5. Persist and Hydrate on Return

**Files modified:** `BusinessAppShell.tsx`

- When `onboardingCompleted` is true (returning user), hydrate the archetype bridge immediately on mount so the adaptive home is personalized from the first frame.
- Ensure `localStorage` fallback (`sita_onboarding_state`) is read if the database fetch fails, so the experience degrades gracefully.
- Add a "Your Business OS was shaped by your formation answers" subtle banner on the home page (dismissible) that links to re-running formation.

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/pages/revenue-office/onboarding/screens/RevealScreen.tsx` | Remove route navigation; use onComplete callback instead |
| `src/hooks/useOnboardingBridge.ts` | New: maps onboarding state to archetype weights |
| `src/components/sita/apps/business/BusinessAppShell.tsx` | Wire bridge, add arrival ceremony, fix post-formation flow |
| `src/components/business/adaptive/AdaptiveBusinessHome.tsx` | Add Business Twin card, priority grid, first wins, bottleneck alerts |

