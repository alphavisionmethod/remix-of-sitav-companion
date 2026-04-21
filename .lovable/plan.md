

# Premium Advisor Board Redesign

Three interconnected upgrades: enhanced visual effects on all advisor cards, a mobile-first advisor experience with tap-to-expand, and an immersive boardroom council overhaul using holographic components.

---

## 1. Premium Neon Rings, HUD Animations, and Hover Tilt

**Files modified:** `boardroom-primitives.tsx`, `AdvisorShowcaseCard.tsx`, `AdvisorPortrait.tsx`, `ImmersiveBoardroomCouncil.tsx`

- **NeonRing upgrade**: Replace the single pulsing `boxShadow` with a layered triple-ring effect (inner sharp glow + mid diffuse + outer ambient). Add a slow rotating gradient border using `conic-gradient` animated via CSS `@keyframes`. The ring intensity scales with advisor confidence (dim below 60%, bright above 80%).
- **HolographicGauge upgrade**: Add a sweeping radial "scan line" animation that rotates behind the gauge arc. The gauge value text gets a counting-up number animation using `useSpring` from framer-motion. Add subtle tick marks around the circumference with opacity pulse on the active segment.
- **Consensus HUD**: The central HUD in `ImmersiveBoardroomCouncil` gets a breathing glow effect that changes color based on consensus level (red < 50, amber 50-75, green > 75). Add particle dots that orbit between the two gauges.
- **Hover tilt on all cards**: Replace the simple `whileHover: { y: -8 }` in `AdvisorShowcaseCard` with a proper 3D perspective tilt using `onMouseMove` to calculate `rotateX`/`rotateY` from cursor position relative to card center. Add a moving highlight gradient that follows the cursor. Apply the same tilt system to `MobileAdvisorBoard` cards (touch-compatible via `onTouchMove`).
- **FloatingMetricCard**: Add a subtle floating bob animation (`translateY` oscillation over 3s) and entry blur-to-sharp transition.

## 2. Mobile Advisor Board with Full-Screen Expand

**Files modified:** `MobileAdvisorBoard.tsx` | **New file:** `MobileAdvisorDetailView.tsx`

- **Horizontal showcase cards**: Redesign cards from the current 200px fixed-width to responsive `85vw` snap cards with:
  - Domain-colored gradient header strip
  - Larger portrait (xl size) with the upgraded neon ring
  - Mini bar chart visualization (reuse from `AdvisorShowcaseCard`)
  - Swipe indicator dots at the bottom
  - Card entrance: staggered scale-up from center with blur fade
- **Full-screen tap-to-expand** (`MobileAdvisorDetailView.tsx`):
  - Triggered by tapping any card; uses `AnimatePresence` with a `layoutId` shared transition so the portrait morphs from card position to full-screen header
  - Full-screen overlay with `CinematicBackground`
  - Top section: large portrait with animated neon ring, name, role, domain badge
  - Middle section: holographic confidence gauge (large, 160px) + key metric cards in a 2x2 grid
  - Bottom section: scrollable area with mission text, special ability, and quick-action buttons (Ask, View Timeline)
  - Close via swipe-down gesture (using `drag="y"` with `dragConstraints` and `onDragEnd` threshold) or X button
  - Hardware back button / gesture support via `popstate` listener
- **Integration**: Wire `MobileAdvisorBoard` into the `AdvisorCouncilShell` by detecting mobile viewport (`useIsMobile`) and rendering the mobile board instead of the desktop grid in the "council" and "boardroom" tabs.

## 3. Immersive Boardroom Council Redesign

**Files modified:** `ImmersiveBoardroomCouncil.tsx`, `boardroom-primitives.tsx`, `AdvisorCouncilShell.tsx`

- **Semicircular layout fix**: The current positioning math produces cramped layouts. Recalculate using proper trigonometric spacing with `radiusX` and `radiusY` scaled to container width via `useRef` + `ResizeObserver`. Each advisor seat gets a subtle connecting line (SVG path) back to the central HUD.
- **Central HUD redesign**:
  - Replace the plain `GlassPanel` wrapper with a hexagonal glass frame
  - Add animated connection lines (SVG) from HUD to each advisor position, with data-pulse dots traveling along the paths
  - The SITA Intelligence badge gets a slow-rotating ring animation
- **Advisor seats**:
  - Each seat shows the upgraded `NeonRing` + `AdvisorPortrait`
  - On hover, the seat expands to show the `FloatingMetricCard` with the bob animation; non-hovered seats slightly dim (opacity 0.6)
  - Active/thinking status shown via ring animation speed (thinking = fast pulse, active = slow breathe)
  - Click opens the `AdvisorDetailDrawer`
- **New primitive: `DataPulseLine`** in `boardroom-primitives.tsx`: An SVG line component with an animated dot traveling along it, used for HUD-to-advisor connections.
- **Ambient effects**: Add 2-3 slowly drifting bokeh circles in the background (large, very low opacity radial gradients) that move on a 20s loop.

## 4. Wiring and Consistency

**Files modified:** `AdvisorCouncilShell.tsx`

- Add `useIsMobile()` detection to `AdvisorCouncilShell` to auto-switch between desktop `ImmersiveBoardroomCouncil` and `MobileAdvisorBoard` for the boardroom tab.
- Ensure the mobile board's `onAdvisorClick` opens the new `MobileAdvisorDetailView` (full-screen) instead of the desktop `AdvisorDetailDrawer`.
- Apply the upgraded `NeonRing` consistently to all surfaces: `AdvisorShowcaseCard`, `ImmersiveBoardroomCouncil`, `MobileAdvisorBoard`, and `AdvisorDetailDrawer` header portrait.

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/components/advisors/boardroom-primitives.tsx` | Upgrade NeonRing, HolographicGauge, FloatingMetricCard; add DataPulseLine |
| `src/components/advisors/AdvisorShowcaseCard.tsx` | Add 3D cursor-tilt, highlight gradient, upgraded ring |
| `src/components/advisors/AdvisorPortrait.tsx` | Integrate upgraded NeonRing rendering |
| `src/components/advisors/MobileAdvisorBoard.tsx` | Redesign horizontal cards, add swipe dots, larger portraits |
| `src/components/advisors/MobileAdvisorDetailView.tsx` | New: full-screen expand view with shared layout animation |
| `src/components/advisors/ImmersiveBoardroomCouncil.tsx` | Redesign layout, HUD, connection lines, ambient effects |
| `src/components/advisors/AdvisorCouncilShell.tsx` | Add mobile detection, wire mobile board + detail view |

