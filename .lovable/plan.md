

# Redesign Sidebar to Feel Like macOS/Windows App Launcher

## Problem
The current sidebar is a standard text-based nav list with small icons. It doesn't feel like a native OS app menu — macOS Finder sidebar has large colorful icons, grouped sections with visual weight, and Windows has pinned app tiles.

## Design

Transform the sidebar into a macOS Finder-style app launcher:

1. **App-style icon grid** — Each nav item gets a large (32-36px), colorful, rounded-square icon with a gradient background (like macOS app icons), with the label below/beside it
2. **Pinned apps section** — Top area with user's pinned apps in a compact icon grid (like macOS Dock favorites in Finder sidebar)
3. **Recents** — Recently visited apps shown with subtle styling
4. **Category dividers** — Clean section labels like "Spaces", "Favorites", "System" with thin separators
5. **Collapsed mode** — Shows only the colorful square icons in a centered column (like Windows 11 taskbar)

### Visual Details
- Each app icon: rounded-xl square with domain-colored gradient background (blue for Business, green for Money, purple for Concierge, etc.)
- White icon glyph inside the colored square (like real macOS app icons)
- Active state: ring highlight + subtle scale-up
- Hover: lift shadow + slight scale
- Smooth transitions on all interactions

## Files Changed

| File | Change |
|------|--------|
| `src/components/sita/AppSidebar.tsx` | Complete redesign — large colorful app icons with gradient backgrounds, macOS-style layout, pinned/recents sections |

## Technical Notes
- Reuses existing `Sidebar` component infrastructure — only changes the visual rendering of nav items
- Icon color mapping per domain (Business=blue, Money=green, etc.)
- No routing changes needed — same URLs, same `NavLink` usage
- Collapsed mode shows centered icon squares without labels

