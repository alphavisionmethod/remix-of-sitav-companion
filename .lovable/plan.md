

# Enhanced Wallpaper System — More Themes + Custom URL Support

## What We're Building

A significantly expanded wallpaper picker in Settings with **more built-in wallpaper options** (generated via beautiful CSS gradients since we can't bundle unlimited images), a **"Custom URL" option** letting users paste any image URL from the internet, and a polished gallery UI with category tabs and large previews.

## Changes

### 1. Generate 6 new premium CSS wallpapers (`ShellAmbientBackground.tsx`)

Add rendering support for additional wallpaper IDs beyond `sita-hero`. When the active wallpaper is an image-based one (from `WALLPAPERS` in settings), render it as a full `background-image: cover` layer with the dark overlay and logo treatment, similar to `SitaHeroWallpaper`. When it's a custom URL, do the same with the user-provided URL.

### 2. Expand wallpaper gallery in Settings (`SettingsWindow.tsx`)

- Add **6 more built-in wallpapers** as CSS gradient thumbnails with evocative names (Cosmic Drift, Emerald Night, Solar Flare, Midnight City, Lavender Haze, Carbon Fiber)
- Add a **"Custom URL"** card at the end of the grid — clicking it opens a text input where users paste any image URL
- Store custom URL wallpapers in localStorage under `sita-custom-wallpaper-url`
- Add category filter tabs: **All · Photos · Gradients · Custom**
- Larger preview thumbnails (aspect-[16/10]) with hover zoom effect

### 3. Wire wallpaper rendering in `ShellAmbientBackground.tsx`

- Listen for `nova-wallpaper-change` custom event to update the background live
- When wallpaper ID is one of the image-based ones (`nebula`, `amber`, `ocean`, `aurora`, `rose`), render it as a full-bleed background image
- When wallpaper ID is `custom`, read the URL from localStorage and render it as background-image
- When wallpaper ID is `dynamic`, show the current gradient orbs (existing behavior)
- Keep the glassmorphic logo overlay for all wallpaper modes

### 4. Update `use-wallpaper.ts` hook

- Add a `customUrl` field to the hook return
- Add `setCustomUrl(url)` function
- Support `"custom"` as a wallpaper ID that reads from `sita-custom-wallpaper-url` in localStorage

## Files

| File | Change |
|------|--------|
| `src/hooks/use-wallpaper.ts` | Add custom URL support, new gradient wallpaper entries |
| `src/components/sita/shell/ShellAmbientBackground.tsx` | Render image-based and custom-URL wallpapers as full-bleed backgrounds |
| `src/components/sita/shell/windows/SettingsWindow.tsx` | Expand gallery with 6 new wallpapers, category tabs, custom URL input, larger previews |

