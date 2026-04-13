

# Stunning Desktop Homepage — Mixed Design Inspiration

## Design Direction

Taking the best from all 4 reference images:

- **Image 1 (KDE/custom)**: Large centered logo with motivational tagline, big clock bottom-left, widget panel on right side with app shortcuts + system toggles + calendar + music player
- **Image 2 (deepin/GNOME)**: Minimal clean wallpaper, large elegant clock bottom-right with full date, subtle constellation art overlay
- **Image 3 (Garuda)**: Rich purple-pink gradient wallpaper, glassmorphic windows, warm dusky atmosphere
- **Image 4 (deepin settings)**: Clean right-side panel overlay, polished dock, system settings panel aesthetic

## The SITA Mix

A **wallpaper-dominant** desktop with:
1. **Center stage**: SITA logo (large, 80px) with a subtle glow halo + tagline underneath ("Your sovereign operating environment")
2. **Bottom-left**: Large elegant clock (72px font) with full date line — like image 2, clean and bold
3. **Right widget panel**: Glassmorphic column (340px) with compact widgets — clock/calendar, quick app grid (2x4 icons like image 1), system toggles (brightness/wifi/bluetooth style like image 1), continuity card
4. **Ambient background**: Enhanced with constellation-like particle connections (inspired by image 2's scorpion constellation) — subtle glowing dots connected by thin lines
5. **Deep purple-magenta-blue gradient** wallpaper feel from images 1-3

## Files Changed

| File | Change |
|------|--------|
| `src/components/sita/shell/DesktopSurface.tsx` | Full rewrite — centered logo + tagline, bottom-left large clock, right widget panel, constellation overlay |
| `src/components/sita/shell/desktop/DesktopClockWidget.tsx` | Rewrite — split into: right-panel compact calendar card AND a new large bottom-left clock component inline in DesktopSurface |
| `src/components/sita/shell/desktop/DesktopQuickActionsWidget.tsx` | Redesign — 2x4 app icon grid with colored gradient backgrounds (like image 1's app shortcuts) |
| `src/components/sita/shell/desktop/DesktopSystemWidget.tsx` | Redesign — horizontal toggle row (WiFi, Bluetooth, Shield, Calm mode) with active/inactive states like image 1's control center |
| `src/components/sita/shell/ShellAmbientBackground.tsx` | Add constellation particle layer — glowing dots with connecting lines that drift slowly |

## Technical Details

### Constellation Overlay (ShellAmbientBackground)
- 12-15 glowing dots positioned semi-randomly
- Connected by thin (`0.5px`) white lines at `opacity-[0.06]`
- Dots pulse gently between `opacity-0.1` and `opacity-0.25`
- Only rendered when `intensity === "vivid"` and no static wallpaper

### Center Logo Block
- `img` tag with `h-20 w-20` + `drop-shadow-[0_0_40px_rgba(114,92,255,0.4)]` for halo glow
- Tagline: `text-lg text-white/50 tracking-[0.15em] uppercase`
- Positioned `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` (true center)
- Staggered entrance: logo scales from 0.8, tagline fades up 200ms later

### Bottom-Left Clock
- Time: `text-7xl font-light text-white tracking-tight tabular-nums` with blinking colon
- Date: `text-lg text-white/60` — "Tuesday, October 25" format
- Position: `absolute left-12 bottom-28`

### Right Widget Panel (340px)
Compact column with 4 widgets stacked:
1. **App Grid** — 2x4 rounded icon buttons with gradient backgrounds (Business=violet, Finance=emerald, Concierge=amber, Files=slate, Boardroom=fuchsia, Trust=cyan, Settings=gray, Search=white)
2. **System Toggles** — horizontal row of circle toggles for WiFi/Shield/Calm/Battery with active blue highlight
3. **Calendar** — compact calendar card (red header with day name, large date number, schedule items)
4. **Continuity** — compact resume card

### Ambient Background Enhancement
- Existing orbs stay
- Add dot-grid overlay at `opacity-[0.04]`
- Add edge gradient: `linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_15%,transparent_85%,rgba(255,255,255,0.02))`

