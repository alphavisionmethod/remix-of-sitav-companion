

# iOS-Inspired Desktop Icons and Widgets Redesign

## Overview

Redesign the website demo desktop to feature vibrant, polished iOS-style app icons and add interactive desktop widgets (like the "Today" tasks widget in the reference). The icons will be generated programmatically as rich SVG-based components with bold gradients and clean glyphs, and widgets will appear on the desktop surface alongside the existing icon grid.

---

## Changes

### 1. Generate New App Icons as SVG Components

**New file: `src/website-demo/AppIconRenderer.tsx`**

Replace the current PNG-based icons with a React component that renders vibrant, iOS-style icons using SVG. Each icon gets:
- Bold, saturated dual-tone gradient background (not the current dark/neon style)
- A clean white glyph/symbol centered inside (using Lucide icons rendered in white)
- Large rounded corners (squircle-like via `rounded-[22%]`)
- Subtle inner shadow and highlight for depth

Icon color mapping (inspired by iOS but original):
- **Business**: Deep blue to sky-blue gradient, Briefcase glyph
- **Finance**: Green to emerald gradient, DollarSign glyph
- **Concierge**: Violet to magenta gradient, Sparkles glyph
- **Boardroom**: Warm amber to orange gradient, Users glyph
- **Investment**: Lime to green gradient, BarChart3 glyph
- **Files**: Gold to yellow gradient, Folder glyph
- **Notes**: Warm yellow to light amber gradient, PenLine glyph
- **Settings**: Cool gray gradient, Settings glyph (keeping the uploaded gear as fallback)

### 2. Update Desktop Icons Component

**Edit: `src/website-demo/DemoDesktopIcons.tsx`**

- Use the new `AppIconRenderer` instead of `<img>` tags
- Increase icon size slightly (56px to 60px) for visual impact
- Add a subtle shadow glow matching each icon's dominant color on hover

### 3. Update Dock Component

**Edit: `src/website-demo/DemoDock.tsx`**

- Use the same `AppIconRenderer` at 44px size
- Remove the `bg-black/80` container since icons now carry their own gradient backgrounds

### 4. Add Desktop Widgets

**New file: `src/website-demo/DemoDesktopWidgets.tsx`**

Add two glassmorphic widgets to the desktop surface (positioned on the left side, opposite the icon grid on the right):

**Today Widget** (inspired by reference):
- Frosted glass card with rounded corners
- Star icon + "Today" header with date
- 4 task items from `CONCIERGE_DATA.tasks` with checkbox circles
- Priority tags (color-coded)
- Small "+" button in corner

**Quick Stats Widget**:
- Compact card showing 2 KPIs from `BUSINESS_DATA.kpis` (Revenue + Pipeline)
- Mini sparkline from `BUSINESS_DATA.chartData`
- Frosted glass styling matching the Today widget

Both widgets use the existing glassmorphic style (`rgba(20,20,30,0.65)` + backdrop blur) with `border-white/10`.

### 5. Wire Widgets into Desktop

**Edit: `src/website-demo/WebsiteDemo.tsx`**

- Import and render `DemoDesktopWidgets` inside the desktop area, positioned at `top-10 left-6` (mirroring the icons on the right)

### 6. Update Settings App Icon

**Edit: `src/website-demo/apps/DemoSettingsApp.tsx`**

- Use the new `AppIconRenderer` for the settings icon in the app header instead of the PNG import

---

## Technical Details

- Icons are pure React/SVG -- no image generation or external assets needed for the new style
- The uploaded `settings.png` remains in `src/assets/app-icons/` as a fallback but the demo surface switches to the new rendered icons
- `APP_ICON_MAP` in `demo-data.ts` stays unchanged (used elsewhere); the demo components simply stop using it for rendering
- Widgets are static/decorative with toggle interactivity on checkboxes
- No new dependencies required

