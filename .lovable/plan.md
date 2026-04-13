

# Advisor Visual Upgrade — Photorealistic Portraits + Cinematic Movie-Like Experience

## The Problem

Right now, advisor avatars are colored circles with initials from `ui-avatars.com`. The reference images show **real human portraits** — photographic, diverse, professional headshots that make the advisors feel like actual people sitting in a room. The current look is generic and "app-like," not cinematic.

## What Changes

### 1. Photorealistic Avatars via Pravatar / RandomUser

Replace `ui-avatars.com` (initials on colored circles) with **pravatar.cc** — a service that returns consistent, realistic human photos based on a numeric seed. Each advisor gets a deterministic portrait that looks like a real person.

**`advisor-topology.ts`** — Replace `avatarUrl()` function:
```
https://i.pravatar.cc/128?img=12  // deterministic real photo per advisor
```

Each of the 18 advisors gets a unique seed number mapped to a professional-looking portrait.

### 2. Cinematic Council — Larger Portraits with Dramatic Lighting

**`BoardroomAdvisorCouncil.tsx`** — Major visual upgrade:
- Increase avatar size from 72px to **96px** (full council) and 56px (compact)
- Add a **dramatic ambient shadow/glow** beneath each advisor that pulses subtly
- Add a **frosted glass name plate** beneath each portrait (like a real boardroom nameplate)
- Speaking advisor gets a **cinematic spotlight cone** from above with particle-like sparkle
- Idle advisors appear slightly dimmed (opacity 0.7) to focus attention on the active speaker
- Add a subtle **vignette** around the entire council area for theatrical depth

### 3. Discussion Thread — Typewriter + Thinking Animation

**`BoardroomDiscussionThread.tsx`** — Make it feel like watching advisors think in real-time:
- Add a **"typing indicator"** (animated dots) that appears briefly before each new entry staggers in
- The currently speaking advisor's entry has a subtle **breathing glow** on the left border
- Increase avatar size in thread to **52px** for more portrait visibility
- Add a **"Currently Speaking"** live indicator badge on the active entry
- Reasoning chain steps appear with a slight **typewriter stagger** (each step fades in sequentially with a 200ms delay per step)

### 4. AdvisorProfileCard — Premium Hover States

**`AdvisorProfileCard.tsx`** — Enhance the reusable card:
- Use the new photorealistic avatars
- Add a **shimmer/reflection** effect on the glass card on hover
- "Speaking" status shows animated sound wave bars next to the name (3 small bars pulsing at different heights)

### 5. Synthesis View — Portrait Gallery Layout

**`BoardroomSynthesisView.tsx`** — Update advisor stance section to use larger portraits in a premium gallery-style horizontal layout instead of a grid.

## Files

| File | Change |
|------|--------|
| `advisor-topology.ts` | Replace avatarUrl with pravatar.cc photorealistic portraits |
| `BoardroomAdvisorCouncil.tsx` | Larger portraits (96px), cinematic spotlight, frosted nameplates, vignette, dimmed idle state |
| `BoardroomDiscussionThread.tsx` | Typing indicator, breathing glow, larger avatars, typewriter reasoning |
| `AdvisorProfileCard.tsx` | Photorealistic avatars, shimmer hover, sound wave speaking indicator |
| `BoardroomSynthesisView.tsx` | Gallery-style portrait layout for stances |

5 files modified. No new files. No database changes.

