

# Holographic Advisor Showcase Experience

## Summary

Create a new standalone showcase page at `/advisors/showcase` that presents the SITA OS advisory council as a futuristic, glassmorphic holographic experience. The uploaded AI hologram image becomes each advisor's portrait with `mix-blend-mode: screen`, floating on heavy glass cards with neon glows. Clicking an advisor opens a full-screen "Debate Mode" split-panel overlay with evidence/confidence panels and a glowing circular timer. The uploaded command-center image becomes the page background.

---

## Technical Details

### 1. Copy uploaded assets into the project

| Source | Destination |
|---|---|
| `user-uploads://Gemini_Generated_Image_jhsbhvjhsbhvjhsb_1.jpg` | `src/assets/advisors/holographic-advisor.jpg` |
| `user-uploads://Gemini_Generated_Image_jhsbhvjhsbhvjhsb.jpg` | `src/assets/advisors/showcase-bg.jpg` |

### 2. Create the Showcase Page

**New file:** `src/pages/advisors/AdvisorShowcase.tsx`

**Full-screen layout:**
- The command-center image as full `background-size: cover` with a dark overlay (`bg-black/40`)
- Floating neon particle system in the background (CSS-only, 15-20 small dots with randomized `@keyframes float` animations using `translateY` and `opacity` cycles)

**Four main Advisor Cards** (centered flex grid, `grid-cols-2 lg:grid-cols-4`):
- Each card uses extreme glassmorphism: `backdrop-blur-xl`, `bg-white/5`, `border border-white/10`, `shadow-[0_0_30px_rgba(139,92,246,0.15)]`
- The holographic advisor image at top-center with `mix-blend-mode: screen` so the black background disappears against the dark glass card
- Advisor title below in uppercase tracking-widest (e.g., "FINANCIAL STRATEGIST", "GROWTH ARCHITECT", "OPERATIONS COMMANDER", "STRATEGY DIRECTOR")
- Domain-specific neon accent colors: purple, emerald, cyan, amber
- A mini **Recharts BarChart** (no axes, no grid, just glowing bars with `filter: drop-shadow`) showing dummy performance data
- A circular **Confidence Score** SVG gauge (ring with gradient stroke, percentage in center)
- Framer Motion: `float` animation (`y: [0, -8, 0]` over 6s infinite), `whileHover` scale 1.05 with increased `boxShadow` glow intensity

**Four showcase advisors** sourced from `ADVISOR_IDENTITIES` registry (business, money, strategy, growth).

### 3. Debate Mode Overlay

When a card is clicked, `AnimatePresence` animates in a full-screen overlay:

- **Backdrop:** `bg-black/80 backdrop-blur-md`
- **Split layout:** two glass panels side by side with a center divider
- **Left panel (Evidence):** Orange/amber-themed glass (`border-amber-500/20`), titled "EVIDENCE", containing:
  - 4 dummy evidence items with progress bars (source reliability scores)
  - Data freshness timestamps
- **Right panel (Confidence):** Blue/cyan-themed glass (`border-cyan-500/20`), titled "CONFIDENCE", containing:
  - Confidence breakdown bars (Data Quality, Source Coverage, Memory Depth, Historical Accuracy)
  - Trust level badge
- **Center:** A futuristic glowing circular timer SVG (animated `stroke-dashoffset` counting down 60s, with pulsing neon ring glow)
- **Close button** at top-right, Escape key handler
- Framer Motion spring transitions for enter/exit (`scale: 0.95 -> 1`, `opacity: 0 -> 1`)

### 4. Micro-interactions and Polish

- **Hover effects on cards:** Increase `backdrop-blur` from `xl` to `2xl`, intensify `box-shadow` glow, subtle 1deg rotation
- **Glitch text animation:** CSS `@keyframes glitch` applied occasionally to card titles (random `clip-path` shifts with color channel offset via `text-shadow`)
- **Smooth transitions:** All state changes use Framer Motion `spring` with `stiffness: 200, damping: 25`
- **Neon particles:** 20 absolutely positioned small circles with randomized positions, sizes (2-4px), colors (purple/cyan/amber), and float keyframes

### 5. Route Registration

Add `/advisors/showcase` route in the appropriate route file, pointing to lazy-loaded `AdvisorShowcase`.

### Files Changed

| File | Change |
|---|---|
| `src/assets/advisors/holographic-advisor.jpg` | New -- uploaded hologram image |
| `src/assets/advisors/showcase-bg.jpg` | New -- uploaded command center background |
| `src/pages/advisors/AdvisorShowcase.tsx` | New -- full showcase page with glassmorphic cards, debate mode, particles |
| `src/routes/os-routes.tsx` (or equivalent) | Add `/advisors/showcase` route |

No database or backend changes required.

