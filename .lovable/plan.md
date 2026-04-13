

# Boardroom "Wow" Visual & Information Delivery Upgrade

## Overview

After reviewing all 8 boardroom views, here are the key gaps between the current state and a truly cinematic, information-rich experience. The focus is on **how information lands** — not just how it looks, but how it *communicates*.

## What Changes

### 1. Immersive Boardroom Header — Live Session Feel

**`BoardroomHeader.tsx`** — Currently a flat 48px bar. Transform into a cinematic status strip:
- **Animated session timer**: A live-counting session clock ("Session: 4m 32s") that ticks in real-time
- **Ambient pulse bar**: A thin animated gradient line beneath the header that breathes with the session mode color (purple for review, amber for simulation, green for approval)
- **Active advisor count badge**: "6 advisors online" with stacked mini-avatars (3 tiny circles overlapping) that pulse when someone is "speaking"
- **Scope transition animation**: When switching scopes, a brief horizontal wipe effect across the header

### 2. Executive View — Hero Metrics + Narrative Summary

**`BoardroomExecutiveView.tsx`** — Currently a list of agenda items. Add:
- **"Morning Brief" narrative panel**: A large, premium card at the top with a 2-3 sentence AI-generated summary like: *"3 items need your attention today. Collections pressure is the top priority — $18.5K overdue. Your reserves are recovering. Travel prep is fully cleared."* — styled like a premium news briefing with large serif-style text
- **Animated number counters**: Key metrics (total overdue, reserve level, pending actions) animate from 0 to their values on load using a counting animation
- **Priority heat strip**: A horizontal gradient bar at the top that visually encodes urgency — red on the left fading to green on the right, with dots positioned where each agenda item falls
- **Quick-action floating buttons**: Each agenda item gets a subtle "Act Now" pill that glows when hovered

### 3. Domain Pulse — Live Data Dashboard Feel

**`BoardroomPulseView.tsx`** — Currently static metric cards. Enhance:
- **Sparkline mini-charts**: Add tiny inline SVG sparklines (7-point trend) inside each metric card showing the last 7 data points
- **Metric change flash**: When switching domains, metrics briefly flash/highlight to draw attention to the new values
- **Domain health ring**: A circular progress indicator per domain showing overall health as a percentage arc (like Apple Watch activity rings)
- **Advisor voice bubbles**: Replace the plain list with speech-bubble styled cards showing advisor portraits + their one-line stance

### 4. Simulation View — Interactive Scenario Theater

**`BoardroomSimulationView.tsx`** — Currently shows scenarios as a comparison grid. Add:
- **"What happens next" timeline**: An animated horizontal timeline showing projected outcomes at Week 1, 2, 3, 4 — with branching paths that visually diverge based on the scenario selected
- **Risk heat meter**: A vertical thermometer-style gauge that rises/falls as you hover different scenarios
- **Impact ripple visualization**: When selecting a scenario, show animated ripple circles expanding outward from the selected card to the downstream effects, visually connecting cause to effect
- **Assumption confidence dots**: Color-coded dots (green/amber/red) arranged in a grid showing data quality at a glance

### 5. Approval View — Ceremony & Weight

**`BoardroomApprovalView.tsx`** — Add gravitas to the approval moment:
- **Signature line animation**: When approving, show an animated "signature being written" effect — a glowing line that draws itself across the approval card
- **Seal stamp animation**: The Decision Seal gets a dramatic stamp-down animation with a brief camera shake and gold particle burst
- **Before/After preview**: Each approval card shows a mini "before" state and "after" state side-by-side, so the user sees the impact of their decision visually
- **Countdown urgency**: For time-sensitive approvals, add a subtle countdown timer ("Approval window closes in 2h 14m")

### 6. Decision Memory — Premium Timeline

**`BoardroomDecisionMemory.tsx`** — Currently a simple vertical list. Upgrade:
- **Outcome score card**: Each decision gets a small visual "report card" — a colored arc showing how well the outcome matched the prediction
- **Pattern detection callout**: A summary card at the top: "Your decisions have been 80% positive this quarter. Best domain: Concierge (100%). Watch: Finance (60%)."
- **Advisor accuracy tracker**: Show which advisors' recommendations led to the best outcomes — a mini leaderboard

### 7. Global Ambient Enhancements

**`BoardroomAppShell.tsx`** — Enhance the container itself:
- **Dynamic ambient color**: The background spotlight color shifts based on the active module — purple for review, amber for simulation, green for approvals, blue for memory
- **Module transition**: Smooth crossfade between views instead of instant swap
- **Sidebar active indicator**: The active sidebar item gets a gentle glow/aura instead of just a color change

## Technical Approach

- All animations use `framer-motion` (already installed)
- Sparklines rendered as simple SVG `polyline` elements (no charting library needed)
- Counting animations use `useEffect` with `requestAnimationFrame`
- No new dependencies required

## Files

| File | Change |
|------|--------|
| `BoardroomHeader.tsx` | Session timer, ambient pulse bar, mini-avatar stack, scope transitions |
| `BoardroomExecutiveView.tsx` | Morning brief narrative, animated counters, priority heat strip, quick-action pills |
| `BoardroomPulseView.tsx` | Sparkline mini-charts, domain health rings, advisor voice bubbles |
| `BoardroomSimulationView.tsx` | Timeline branches, risk thermometer, impact ripples, assumption dots |
| `BoardroomApprovalView.tsx` | Signature animation, seal stamp ceremony, before/after preview, countdown |
| `BoardroomDecisionMemory.tsx` | Outcome score arcs, pattern detection summary, advisor accuracy tracker |
| `BoardroomAppShell.tsx` | Dynamic ambient color, module crossfade, sidebar glow |

7 files modified. No new files. No database changes.

