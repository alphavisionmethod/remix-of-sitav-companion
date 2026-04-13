

# Desktop Background — Premium Abstract Wallpaper with Logo

## What We're Building

Replace the current CSS gradient-based "SITA Hero" wallpaper with the uploaded premium abstract image (dark flowing curves with purple/pink/blue highlights) as the actual desktop background. The SITA logo stays centered with its glassmorphic treatment, now floating over this stunning image.

## Changes

| File | Change |
|------|--------|
| `public/wallpapers/sita-hero.png` | **New** — Copy the uploaded image to the project |
| `src/components/sita/shell/ShellAmbientBackground.tsx` | Update `SitaHeroWallpaper` to use the image as `background-image` instead of CSS gradients. Keep the glassmorphic logo circle, tagline, and glow effects on top. Remove the old gradient div. |
| `src/hooks/use-wallpaper.ts` | Update the `sita-hero` entry preview to reference the image |

## Design Details

- The abstract image becomes the full `background-size: cover` layer
- A subtle dark overlay (`bg-black/20`) ensures the logo and text remain readable
- The glassmorphic circle, logo, glow ring, and "SITA OS" tagline remain unchanged — they float beautifully over the new background
- The dot-grid texture and noise overlays from `ShellAmbientBackground` continue layering on top for depth

