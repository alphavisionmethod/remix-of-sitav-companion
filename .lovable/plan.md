

# SITA OS — Apple-Style Visual Overhaul

## Vision
Transform SITA OS from a functional dark dashboard into a premium, Apple-inspired operating system with SF-quality typography, vibrancy effects, spatial depth, and refined micro-interactions. The goal: every surface feels like it belongs on a Retina display.

## Current State
- Functional but utilitarian — dense sidebar, flat cards, minimal visual hierarchy
- Good glass-panel foundation in CSS but underutilized
- KPI tiles and cards lack spatial depth and tactile feel
- Landing page is basic — no hero animation, no visual storytelling
- Top bar is information-dense but lacks visual breathing room
- Typography is solid (Space Grotesk + Inter) but not leveraged for visual drama

---

## Plan: 8 Visual Upgrades

### 1. Landing Page — Cinematic Hero Redesign
Rewrite `LandingPage.tsx` with:
- Large animated gradient orb behind hero text (CSS radial gradient, not canvas)
- "AI Operating System" in gradient text with subtle shimmer animation
- Feature cards with frosted glass + hover tilt (CSS perspective transform)
- Animated trust badges that fade in staggered
- Smooth scroll sections with intersection observer fade-ins

### 2. Typography System — Apple-Grade Refinement
Update `index.css` with:
- Tighter letter-spacing on headings (-0.025em for h1, -0.015em for h2)
- Larger display sizes for hero contexts (clamp-based fluid type)
- Add `.text-gradient` utility for primary-to-accent gradient text
- SF-style thin/ultralight weights for large numbers (KPI values)
- Add `font-feature-settings: "cv01", "cv02"` for Inter's alternate glyphs

### 3. Card System — Depth & Vibrancy
Update `SitaCard.tsx` and `SitaComponents.tsx`:
- Subtle inner glow on cards (inset box-shadow with primary/5)
- Hover state: translate-y(-2px) + expanded shadow + border brightening
- Active state: scale(0.98) with spring easing
- KPI tiles: large light-weight numbers, accent-colored trend arrows with background pills
- Add `.card-glass` variant with backdrop-blur for overlay contexts

### 4. Sidebar — Spatial Navigation
Update `AppSidebar.tsx`:
- Active item: pill-shaped highlight with subtle primary glow (like macOS sidebar)
- Section labels: lighter weight, more letter-spacing, smaller size
- Hover: smooth background transition with rounded corners
- Logo area: add subtle separator line with gradient fade
- Collapse transition: smooth width animation

### 5. Top Bar — Vibrancy Bar
Update `SitaTopBar.tsx`:
- Increase height slightly (44px — Apple standard)
- Stronger backdrop-blur (blur-3xl + saturate)
- Command pill: rounded-2xl with subtle inner shadow
- Status indicators: softer colors, pill-shaped badges
- Clock: lighter weight, slightly larger

### 6. Mobile Bottom Nav — Dock Style
Update `MobileBottomNav.tsx`:
- Rounded floating dock (inset from edges, rounded-2xl)
- Stronger glass effect with shadow
- Active icon: filled variant feel via bg-primary/15 circle behind icon
- Haptic-ready press animation (scale down on touch)

### 7. Page Transitions & Motion
Update `ShellLayout.tsx`:
- Smoother page transition curves (Apple's spring: mass 1, stiffness 100, damping 15)
- Add subtle blur during exit transitions
- Content areas: stagger children fade-in on page mount

### 8. Global CSS Polish
Update `index.css`:
- Add `.vibrancy-panel` utility: stronger blur + saturation + subtle tint
- Add `.ring-glow` utility for focus states with colored glow
- Refine scrollbar: thinner (3px), more transparent, rounded
- Add selection color matching brand
- Smoother body background transition

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/LandingPage.tsx` | Cinematic hero redesign with gradient orbs, staggered animations |
| `src/index.css` | Typography refinements, new utilities, scrollbar polish, selection color |
| `src/components/sita/SitaCard.tsx` | Depth hover effects, glass variant, spring animations |
| `src/components/sita/SitaComponents.tsx` | KPI tile visual upgrade, card glass effects |
| `src/components/sita/AppSidebar.tsx` | Pill-shaped active states, spatial hover effects |
| `src/components/sita/SitaTopBar.tsx` | 44px height, stronger vibrancy, refined command pill |
| `src/components/sita/MobileBottomNav.tsx` | Floating dock style, glass effect, active circle |
| `src/components/sita/ShellLayout.tsx` | Apple-spring page transitions, stagger children |

