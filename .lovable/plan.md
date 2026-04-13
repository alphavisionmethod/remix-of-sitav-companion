

# Talking Avatars — Animated Speaking Visuals

## What We're Building

Visually animated "talking" advisor avatars that simulate speech through mouth/lip animation, audio waveform overlays, and breathing body movement. No actual AI voice — purely visual animation that makes advisors look alive and speaking.

## Changes

### 1. `TalkingAvatar.tsx` (new)

A reusable animated avatar component with:
- **Mouth animation**: An SVG overlay on the portrait that simulates mouth opening/closing at randomized intervals (like lip-sync to imaginary speech). Small arc shape that morphs between open/closed states using framer-motion.
- **Waveform ring**: Animated audio waveform ring around the avatar — segments that pulse at different heights/speeds when speaking, like a circular audio visualizer.
- **Breathing idle**: Subtle scale oscillation (1.0 → 1.02 → 1.0) on a 4-second cycle so avatars never feel static.
- **Head micro-movement**: Very slight x/y drift (±2px) while speaking to simulate natural head movement.
- Props: `speaking: boolean`, `avatarUrl`, `accentColor`, `size`, `name`

### 2. `BoardroomAdvisorCouncil.tsx` (modify)

- Replace static portrait `<img>` / emoji fallback with `<TalkingAvatar>` component
- The `speakingId` advisor gets `speaking={true}`, all others get `speaking={false}` (idle breathing only)
- Add a "Play Discussion" button that auto-cycles `speakingId` through advisors every 4-5 seconds, simulating a live round-table conversation

### 3. `BoardroomDiscussionThread.tsx` (modify)

- Replace the 52px avatar in each discussion entry with `<TalkingAvatar>`
- The last entry (currently speaking) gets `speaking={true}` with full mouth + waveform animation
- Add a "Play" button at the top that auto-scrolls through entries one by one with a typing delay, making each advisor "speak" in sequence — the text appears with a typewriter effect while the avatar animates

### 4. `AdvisorProfileCard.tsx` (modify)

- Integrate `<TalkingAvatar>` replacing the current static portrait
- When `status === "speaking"`, avatar shows full talking animation

## Visual Details

- **Mouth overlay**: Small semi-transparent dark ellipse at bottom-third of avatar face, morphing height between 2px (closed) and 8px (open) at ~3-4Hz with slight randomization
- **Circular waveform**: 12 bars arranged in a circle around the avatar, each pulsing independently with staggered sine-wave timing — only visible when speaking
- **Color**: All animation elements use the advisor's `accentColor` for consistency
- **Auto-play**: A "▶ Watch Discussion" button triggers sequential playback — each advisor speaks for ~4 seconds with their text appearing progressively

## Files

| File | Action |
|------|--------|
| `src/components/sita/apps/boardroom/TalkingAvatar.tsx` | **New** — Animated speaking avatar with mouth, waveform, breathing |
| `src/components/sita/apps/boardroom/BoardroomAdvisorCouncil.tsx` | Use TalkingAvatar, add auto-cycle playback |
| `src/components/sita/apps/boardroom/BoardroomDiscussionThread.tsx` | Use TalkingAvatar, add sequential play mode |
| `src/components/sita/apps/boardroom/AdvisorProfileCard.tsx` | Use TalkingAvatar for speaking status |

4 files. No database changes.

