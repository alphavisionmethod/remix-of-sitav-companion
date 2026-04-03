

# SITA OS — Premium First Boot Screen

## Summary
Replace the current terminal-style boot screen (fake console log with checkmarks and progress bar) with a premium, state-driven power-on sequence that feels like entering a luxury operating environment — not launching a web app.

## What exists today
The current `BootScreen` in `OSSetupExperience.tsx` (lines 41-103) is a mono-spaced terminal emulator showing lines like `"Loading advisor protocols ████████████████ OK"` with a blinking cursor and progress bar. This is exactly the anti-pattern the spec forbids: fake hacking/security visuals, terminal output, progress bars.

## Architecture

**New file**: `src/components/sita/FirstBootScreen.tsx`
- Self-contained state machine component
- Replaces the inline `BootScreen` function inside `OSSetupExperience.tsx`

**State model** (driven by a `useReducer`, not hardcoded timeline):
```text
POWER_ON → BLACK_HOLD → MARK_REVEAL → SECURE_INIT → INTEGRITY_VERIFY → WORKSPACE_PREP → READY_FOR_HANDOFF → (error: RECOVERY_MODE)
```

Each state has a minimum display duration and transitions when the previous completes. Real loading signals (auth state, runtime initialization) map to states — if auth resolves before `INTEGRITY_VERIFY` finishes its minimum hold, the sequence continues gracefully; if it takes longer, the breathing logo holds elegantly.

**Modify**: `src/components/sita/OSSetupExperience.tsx`
- Remove the inline `BootScreen` function (lines 41-103)
- Import and use `<FirstBootScreen>` instead
- Keep the rest of the setup flow (welcome, identity, domains, etc.) unchanged

## Visual Design

- **Background**: `#0A0A0A` (deep charcoal), full viewport, no gradients
- **SITA mark**: The existing `logo.jpeg` asset, rendered at 88px with `rounded-2xl`, centered vertically and horizontally
- **Illumination**: Subtle radial gradient behind mark (`rgba(255,255,255,0.03)`) — near-invisible depth field
- **Breathing glow**: CSS `box-shadow` animation cycling every 3.5s with very low amplitude (`0 0 40px rgba(255,255,255,0.06)` → `0 0 60px rgba(255,255,255,0.12)` → back). No rings, no pulses, no loaders.
- **Status line**: Single line of text 24px below the mark. Inter font, 13px, `font-weight: 400`, `rgba(255,255,255,0.65)`. Cross-dissolves between messages with 200ms fade-out / 250ms fade-in.

## Status Messages (curated copy)
```
Starting secure environment
Verifying system integrity
Preparing your workspace
Initializing trusted services
Finalizing startup
```

## Motion Sequence (all Framer Motion)

| Phase | Duration | Effect |
|-------|----------|--------|
| Black hold | 350ms | Pure `#0A0A0A`, nothing visible |
| Mark reveal | 850ms | `opacity: 0→1`, `scale: 0.98→1` with gentle spring |
| Breathing begins | After reveal settles | `box-shadow` keyframe loop, 3.5s period |
| Status line in | 250ms after mark | `opacity: 0→1`, first message appears |
| Message cycling | 1500ms hold each | Cross-dissolve between 5 messages |
| Handoff | 900ms | Logo fades to 0.5 opacity, status fades out, then `onComplete` fires |

Total: ~5-7 seconds depending on actual load time. Never feels frozen.

## Reduced Motion / Accessibility
- If `prefers-reduced-motion`: skip breathing animation, use instant opacity transitions, static logo
- Screen reader: `aria-live="polite"` region for status messages
- No sound on web (browser autoplay restrictions make this impractical; noted as future native-app feature)

## Degraded / Error State
If auth or runtime fails after 12 seconds, transition to recovery screen:
- Same dark background, logo dims to 40% opacity
- Message: "Secure startup requires attention"
- Two buttons: "Retry" and "Continue to recovery" — styled with `border-border` outlines, no panic colors

## Handoff to Welcome
- Logo holds position, status line fades out
- Background stays `#0A0A0A`
- The existing `welcome` phase from `OSSetupExperience` fades in around the mark, maintaining visual continuity
- No hard cut to a bright screen

## Files Changed

| File | Action |
|------|--------|
| `src/components/sita/FirstBootScreen.tsx` | **Create** — the full premium boot component (~200 lines) |
| `src/components/sita/OSSetupExperience.tsx` | **Edit** — remove old `BootScreen` function, import `FirstBootScreen`, wire `onComplete` |

## Anti-patterns explicitly avoided
- No terminal/console text
- No progress bars
- No spinning loaders
- No particle effects
- No expanding ring pulses
- No fake checksums or hash outputs
- No `font-mono` boot log
- No blinking cursors

