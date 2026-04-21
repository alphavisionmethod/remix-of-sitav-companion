

# SITA OS Investor Demo Video (Remotion MP4)

## Summary

Create a 25-second cinematic investor demo video rendered to MP4 via Remotion, showcasing 6 key capabilities of SITA OS. The video uses the real design tokens (glassmorphism, domain accent colors, depth layers) to faithfully represent the OS aesthetic.

## Creative Direction

- **Aesthetic**: Tech Product / Luxury Editorial hybrid — dark glassmorphic surfaces, clean typography, deliberate pacing
- **Palette**: Dark base (`hsl(0 0% 6%)`), glass overlays (`hsl(0 0% 100% / 0.08)`), domain accents — Business purple (`hsl(265 55% 58%)`), Finance green (`hsl(152 55% 48%)`), Trust gold (`hsl(38 85% 58%)`), Concierge magenta (`hsl(285 55% 55%)`)
- **Fonts**: Inter (display + body) via `@remotion/google-fonts`
- **Motion**: Spring-based reveals (`damping: 20, stiffness: 200`), clip-path wipes between scenes, subtle parallax on background orbs
- **Resolution**: 1920x1080 @ 30fps

## Scene Breakdown (6 Beats, ~750 frames total)

| Scene | Frames | Content |
|---|---|---|
| 1 — Title Card | 0-120 | "SITA OS" logotype reveal with glassmorphic surface materializing. Tagline: "Your Life. One Operating System." Ambient gradient orbs drift. |
| 2 — The Shell | 120-250 | Simulated desktop with menu bar, dock, and floating windows appearing. Shows windowing system, domain switching, depth layers in action. |
| 3 — Five Domains | 250-400 | Animated icon grid showing Business, Finance, Concierge, Investment, Trust — each lights up with its domain accent color. Stats fly in: "227 Services · 433 Tables · 193 Functions". |
| 4 — AI Boardroom | 400-530 | 10 advisor avatars orbit around a central "decision" node. Receipt chain hashes cascade. Text: "10 Autonomous Advisors · Deterministic Receipts · L0-L6 Autonomy". |
| 5 — Enterprise Metrics | 530-650 | Animated counters: validators (650+), test coverage, edge functions, accessibility compliance. Trust/safety badges animate in. |
| 6 — Close | 650-750 | "Built for the next era of personal computing." SITA OS logo solidifies. Investor CTA-free ending — just the brand mark and a quiet fade. |

## Persistent Layers (full duration)

- **Background**: Slow-drifting gradient orbs (purple, green, gold) with `filter: blur(80px)` on dark base
- **Vignette**: Radial gradient overlay for depth
- **Grain**: Subtle noise texture for premium feel

## Implementation Steps

1. Set up Remotion project in `remotion/` directory with dependencies
2. Create design constants file mapping SITA tokens to video-compatible values
3. Build 6 scene components + persistent background/vignette layers
4. Wire scenes via `TransitionSeries` with wipe transitions
5. Create programmatic render script (`scripts/render-remotion.mjs`)
6. Render to `/mnt/documents/SITA_OS_Investor_Demo.mp4`
7. Spot-check key frames with `remotion still` before final render
8. QA final MP4 and report file size

## Output

- **File**: `/mnt/documents/SITA_OS_Investor_Demo.mp4` (~25 seconds, 1080p)

