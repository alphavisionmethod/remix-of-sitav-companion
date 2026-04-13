

# Advisor Visual Upgrade — Portrait-Style Avatars + Premium Card Layout

## The Problem

The reference images show large, photographic-quality circular advisor portraits with names and roles beneath — like a real boardroom of people. Currently, advisors are rendered as small emoji icons inside gradient circles. This looks generic, not premium.

## What We'll Build

### 1. Add `avatarUrl` field to advisor topology + use DiceBear/UI Avatars for generated portraits

Add an `avatarUrl` field to `AdvisorRole` in `advisor-topology.ts` using [UI Avatars](https://ui-avatars.com/) or DiceBear API to generate unique, professional-looking avatar images per advisor. Each advisor gets a deterministic portrait based on their name and accent color.

Example: `https://ui-avatars.com/api/?name=Revenue+Advisor&background=7c3aed&color=fff&size=128&bold=true&format=svg`

### 2. Redesign `BoardroomAdvisorCouncil.tsx` — Premium portrait cards

Replace the emoji-in-gradient-circle with:
- **Large circular portrait images** (80px+) with glowing ring borders using each advisor's `accentColor`
- **Glass card beneath** each portrait: name (bold), role title (accent color), 1-line specialty
- Subtle shadow and ring glow on hover
- Speaking advisor gets animated pulse ring + spotlight cone
- Layout: horizontal scrollable row on mobile, flex-wrap arc on desktop

### 3. Redesign `BoardroomDiscussionThread.tsx` — Chat-style advisor discussion

Upgrade discussion entries to feel like advisors "talking":
- Larger portrait avatar (48px) with speaking pulse animation on the active entry
- Chat-bubble-style layout (avatar left, glass card right) with a small speech triangle
- "Thinking..." animated state before each entry appears (typewriter-style stagger)
- Reasoning chain styled as indented thought process with connecting vertical line
- Each entry card has the advisor's accent color as a top gradient strip

### 4. Create `AdvisorProfileCard.tsx` — Standalone premium advisor card

A reusable card component (used in Council, Synthesis, Pulse) showing:
- Large circular avatar (portrait image or gradient+initials fallback)
- Name, role, specialty
- Status dot (active/thinking/idle)
- Confidence bar
- Clickable — opens detail panel
- Glass background with accent color border glow

### 5. Update `BoardroomSynthesisView.tsx` — Use new profile cards

Replace the current advisor stance cards with `AdvisorProfileCard` for a more premium, portrait-forward layout.

## Files

| File | Action |
|------|--------|
| `src/lib/advisor-topology.ts` | Add `avatarUrl` field with generated URLs per advisor |
| `src/components/sita/apps/boardroom/AdvisorProfileCard.tsx` | **New** — Reusable premium portrait card |
| `src/components/sita/apps/boardroom/BoardroomAdvisorCouncil.tsx` | Redesign with large portrait images + glass cards |
| `src/components/sita/apps/boardroom/BoardroomDiscussionThread.tsx` | Chat-bubble style with larger avatars + typing animation |
| `src/components/sita/apps/boardroom/BoardroomSynthesisView.tsx` | Use AdvisorProfileCard for stance cards |

5 files. No database changes.

