

# Immersive Advisor Board UI Redesign

## Summary

Transform the advisor frontend across OS Desktop and Mobile App to match the reference images: a dark, cinematic glassmorphic boardroom with holographic advisor cards, floating consensus/confidence HUDs, and glowing neon-accented portraits. The current implementation uses standard card grids with muted styling -- this redesign replaces it with a premium, immersive executive boardroom aesthetic.

## What Changes

### Part 1 -- Immersive Boardroom Council View (Desktop)

**New component: `src/components/advisors/ImmersiveBoardroomCouncil.tsx`**

A full-viewport dark boardroom scene inspired by Image 1 (the round-table council). Features:

- Dark gradient background simulating a premium executive room (`bg-gradient-to-b from-[#0a0a14] via-[#10101f] to-[#0d0d18]`)
- Advisors arranged in a semicircular/oval layout using CSS transforms, each seat with:
  - Large `AdvisorPortrait` (xl size) with domain-colored glowing ring
  - Glassmorphic data card floating beside each advisor showing their key metric (e.g., `$3,800`, `+12%`, `Confidence 78%`)
  - Speaking/active state with animated neon pulse
- Center holographic HUD panel showing:
  - **Consensus** gauge (circular progress ring)
  - **Confidence** aggregate gauge
  - SITA logo centered
- Horizontal glassmorphic header: "EXECUTIVE'S BOARDROOM" with session counter

### Part 2 -- Advisor Personality Showcase Cards

**New component: `src/components/advisors/AdvisorShowcaseCard.tsx`**

Inspired by Image 3 (the four personality cards). Each card is a tall glassmorphic panel:

- Top half: Large advisor portrait with ethereal/abstract gradient aura behind it
- Advisor title below portrait (e.g., "Financial Strategist", "Business Growth Advisor", "Concierge Planner")
- Bottom half: A miniature domain-relevant visualization (sparkline chart, calendar grid, or world map)
- Glass material: `bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]`
- Perspective tilt on hover using CSS `transform: perspective(800px) rotateY()`
- Used in the "Council" tab as the default view

### Part 3 -- Debate Mode View Redesign

**Modify: `src/components/advisors/AdvisorDebateView.tsx`**

Inspired by Image 2 (dual-advisor debate). Replace the current basic card layout:

- Split-screen dark layout with two advisor portraits facing each other
- Left advisor: warm gold/amber accent glow; Right advisor: cool blue/teal accent glow
- Between them: Large convergence score gauge (circular, animated)
- Each side shows:
  - Glassmorphic "Evidence" panel with structured findings
  - Confidence progress bar with percentage
  - "Counterpoints" section
- Dark background with subtle particle/grid effects

### Part 4 -- AdvisorWorkspace Page Redesign

**Modify: `src/pages/advisors/AdvisorWorkspace.tsx`**

- Replace the `MainGuideHeader` with a cinematic dark header bar matching the reference OS chrome (back arrow, "ADVISORS" breadcrumb, "EXECUTIVE'S BOARDROOM" title, session counter)
- Replace `CouncilGrid` with the new `ImmersiveBoardroomCouncil` for the boardroom mode and `AdvisorShowcaseCard` grid for the council/daily-pulse mode
- Replace the tab bar with a sleek glassmorphic pill selector
- Dark theme enforcement: wrap the advisor workspace in a dark-mode container (`dark` class) so it renders in the cinematic dark palette regardless of system theme

### Part 5 -- Mobile App Advisor View

**New component: `src/components/advisors/MobileAdvisorBoard.tsx`**

Mobile-optimized version of the showcase:

- Horizontal scroll of advisor personality cards (compact version of Part 2)
- Tappable cards that expand to full-screen advisor detail
- Bottom consensus bar showing aggregate confidence
- Swipeable debate view for mobile

**Modify: Mobile routes** to use the new component when navigating to advisors from the mobile app

### Part 6 -- Shared Glassmorphic Primitives

**New file: `src/components/advisors/boardroom-primitives.tsx`**

Shared building blocks used across Parts 1-5:

- `GlassPanel` -- Standard glassmorphic container with configurable blur, opacity, and border glow
- `HolographicGauge` -- Circular animated gauge for consensus/confidence (SVG-based with gradient strokes)
- `NeonRing` -- Animated glowing ring component for advisor portraits
- `FloatingMetricCard` -- Small glassmorphic data readout that hovers near an advisor
- `CinematicBackground` -- Dark gradient with optional grid/particle overlay

### Part 7 -- Generate Additional Advisor Portraits

Generate portraits for the remaining advisor domains (Growth, Trust, Opportunity, Recovery, Boardroom, Family, General) using the AI image generation API, and register them in `advisor-avatar-assets.ts`. This ensures every advisor seat shows a real portrait, not a fallback icon.

## Technical Details

- All new components use Framer Motion for animations (spring physics, stagger reveals, pulse effects)
- Dark theme is scoped using a `dark` class wrapper on the advisor workspace, not changing the global theme
- Glassmorphic materials use `backdrop-blur-xl`, `bg-white/[0.03-0.06]`, `border-white/[0.06-0.12]`
- The semicircular advisor layout uses absolute positioning with trigonometric placement (`Math.cos`/`Math.sin` for seat positions around an ellipse)
- Advisor portraits use the existing `AdvisorPortrait` component with the generated PNGs from `advisor-avatar-assets.ts`
- The `HolographicGauge` uses SVG `<circle>` with `stroke-dasharray`/`stroke-dashoffset` animation
- Mobile view uses `snap-x` scroll containers and `Intersection Observer` for visibility-based animations
- No new backend dependencies -- all data comes from existing hooks (`useAdvisorStatuses`, mock data, Supabase queries)

## Files Created
- `src/components/advisors/boardroom-primitives.tsx`
- `src/components/advisors/ImmersiveBoardroomCouncil.tsx`
- `src/components/advisors/AdvisorShowcaseCard.tsx`
- `src/components/advisors/MobileAdvisorBoard.tsx`
- Additional advisor portrait PNGs in `src/assets/advisors/`

## Files Modified
- `src/components/advisors/AdvisorDebateView.tsx` -- Complete redesign to cinematic split-screen
- `src/pages/advisors/AdvisorWorkspace.tsx` -- Wire new components, dark theme wrapper, cinematic header
- `src/components/advisors/AdvisorCouncilShell.tsx` -- Update council tab to use showcase cards
- `src/lib/advisors/advisor-avatar-assets.ts` -- Register all new domain portraits
- Mobile route files as needed to integrate `MobileAdvisorBoard`

