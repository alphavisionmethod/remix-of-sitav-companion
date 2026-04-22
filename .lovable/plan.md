

# Make Revenue Office Onboarding Colorful, Fun, and Beautiful

## Summary

Overhaul the Revenue Office onboarding flow with vibrant color accents, a persistent SITA logo header, and a reactive Revenue Office Preview sidebar that progressively builds as the user makes selections across all steps.

---

## Technical Details

### 1. Add SITA Logo Header to FormationShell

**File:** `src/pages/revenue-office/onboarding/FormationShell.tsx`

- Import `sitaLogo from "@/assets/logo.webp"`
- Add a top bar above the progress section with the SITA logo (32px), "SITA OS" wordmark with `gradient-sita-text`, and "Business OS" subtitle
- This header is always visible on every step (including ceremony screen at stage 0)

### 2. Vibrant Color System for Primitives

**File:** `src/pages/revenue-office/onboarding/primitives.tsx`

- **Toggle**: Add gradient left-border accent on selected state (purple-to-blue gradient border-left). Add a subtle shimmer/glow animation on selection (`shadow-lg shadow-primary/10`). Make the check icon use a filled circle with gradient background instead of plain check.
- **ChapterBanner**: Add a decorative gradient line below the chapter name. Use chapter-specific colors (Formation = purple, Engine = emerald, Delivery = blue, Operations = amber, Import = cyan, Trust = rose, Launch = gold).
- **ScreenHeader**: Add a radial glow behind the icon (`bg-gradient-to-br` with domain color). Add a subtle animated sparkle dot.
- **SingleSelect**: Add colored dot indicator on selected items. Use a left-border accent matching chapter color.

### 3. Colorful Background Enhancements

**File:** `src/pages/revenue-office/onboarding/FormationShell.tsx`

- Add chapter-aware animated gradient blobs that change color per chapter (e.g., purple blobs for Formation, emerald for Engine, blue for Delivery)
- Add a subtle animated gradient border on the progress bar that shifts color per chapter
- Make the chapter transition overlay use a full-screen gradient flash with the chapter's signature color

### 4. CeremonyScreen Visual Upgrade

**File:** `src/pages/revenue-office/onboarding/screens/CeremonyScreen.tsx`

- Replace the Crown icon container with the actual SITA logo image
- Add colorful gradient rings around the floating nodes (each node gets a unique accent color)
- Make the connecting lines use gradient strokes instead of solid muted colors
- Add a subtle particle/sparkle animation in the background
- Give each depth option card a unique gradient accent (Deep = purple gradient, Balanced = blue, Quick = amber)
- Add hover animations: card lifts with a colored shadow

### 5. Reactive LiveOfficeSidebar (Revenue Office Preview on All Steps)

**File:** `src/pages/revenue-office/onboarding/LiveOfficeSidebar.tsx`

Current behavior: Hidden at stage 0 and stage >= 18. Shows static cards.

Changes:
- **Show on ALL stages** including ceremony (stage 0) and reveal (stage >= 18), with adapted content per phase
- **Stage 0 (Ceremony)**: Show the "Waiting" state with ghosted module list (current CeremonyScreen right panel content), but move it here so it's consistent
- **Progressive activation**: As users make selections, modules light up with color transitions:
  - When `businessName` is set: header shows the business name with a subtle glow
  - When `businessTypes` selected: relevant modules get colored dot indicators (green = activated)
  - When `revenueSources` selected: Revenue Boardroom card fills with a mini bar chart wireframe
  - When `journeyTemplate` selected: Journey Twin section animates in with stage pills
  - When `growthBottlenecks` selected: Leak Detector card shows animated warning indicators
  - When `automationLevel` set: Automation Office module shows trust level badge
- **Module status colors**: waiting = gray, forming = amber pulse, active = green glow, priority = purple ring
- **Live readiness gauge**: Animated circular progress ring (not just a bar) showing personalization percentage with color transitions (gray -> amber -> green -> purple as it fills)
- **Add mini wireframe preview** at the top that progressively fills: empty grid -> partially filled cards -> fully populated layout mockup based on activated modules

### 6. Remove Duplicate Right Panel from CeremonyScreen

**File:** `src/pages/revenue-office/onboarding/screens/CeremonyScreen.tsx`

- Remove the entire right-panel `lg:grid-cols-[1fr_320px]` layout since LiveOfficeSidebar now handles this at stage 0
- The ceremony screen becomes a single-column centered layout

### 7. Per-Screen Color Accents

Apply chapter-specific accent colors to each screen file. This is done through the existing `ScreenHeader` and `ChapterBanner` primitives (updated in step 2), so individual screen files need minimal changes:

- Formation screens (Identity, Priorities): purple accents
- Engine screens (Revenue, Acquisition, Conversion, Journey): emerald accents
- Delivery screens (Delivery, Friction): blue accents
- Operations screens (Team, Shape): amber accents
- Import screens (Intake, Connections, Files, Artifacts, URLs, Recon): cyan accents
- Trust screens (Automation, Advisors): rose accents
- Launch screens (FirstWin, Reveal): gold accents

### 8. Fun Micro-interactions

**File:** `src/pages/revenue-office/onboarding/primitives.tsx`

- Toggle selection: brief confetti-burst CSS animation (radial gradient keyframe that expands and fades)
- Progress bar: animated gradient stripe that shifts color per chapter
- Step completion checkmarks: scale-bounce animation when they appear
- Chapter transition: add a playful emoji or icon per chapter that briefly appears during the transition overlay

---

## Files Changed

| File | Change |
|---|---|
| `src/pages/revenue-office/onboarding/FormationShell.tsx` | SITA logo header, chapter-colored gradient blobs, enhanced progress bar |
| `src/pages/revenue-office/onboarding/primitives.tsx` | Vibrant Toggle/ChapterBanner/ScreenHeader/SingleSelect with color accents and micro-animations |
| `src/pages/revenue-office/onboarding/LiveOfficeSidebar.tsx` | Show on all stages, progressive module activation, animated readiness gauge, mini wireframe preview |
| `src/pages/revenue-office/onboarding/screens/CeremonyScreen.tsx` | Remove duplicate right panel, SITA logo, colorful floating nodes, gradient depth cards |

No database or backend changes required.

