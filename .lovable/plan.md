

# SITA OS — Ultra-Realistic Device Mockup Images

## Summary

Generate 4 premium, product-launch-quality mockup images of the SITA OS mobile app displayed on flagship iPhone and Android devices. Each image uses a different environment and angle, with authentic SITA OS UI screens rendered inside the devices. Images are generated via the AI image generation skill (Nano banana pro for highest quality) and output as PNGs to `/mnt/documents/`.

## What You Get

Four 4K-class images, each a distinct composition:

1. **Dual Front View** -- iPhone 16 Pro and Pixel 9 Pro side by side on a soft gradient background. iPhone shows dark-mode dashboard (glassmorphic cards, purple/green domain accents). Android shows light-mode variant with Material You styling. Floating with subtle reflections below.

2. **Perspective Tilt -- Business App** -- Single iPhone at a slight 3D tilt showing the SITA OS Business domain dashboard (purple accent, glassmorphic panels, KPI cards). Minimal desk environment with soft natural lighting, shallow depth of field, marble/aluminum surface.

3. **Hand-Held Lifestyle -- Finance App** -- Hand holding an Android device displaying the Money OS / Finance screen (green accent, portfolio charts, glassmorphic cards). Lifestyle context with blurred background, warm ambient light.

4. **Studio Float -- AI Boardroom** -- Both devices floating on a dark gradient, showing the AI Boardroom / Concierge interface. Studio-quality lighting, soft reflections, cinematic depth. Premium glass-and-aluminum device materials visible.

## Design Specifications

- **Color palette**: SITA OS tokens -- near-black background `hsl(0,0%,6%)`, glassmorphic white overlays `rgba(255,255,255,0.06)`, domain accents (Business purple `hsl(265,55%,58%)`, Finance green `hsl(152,55%,48%)`, Concierge magenta `hsl(285,55%,55%)`, Investment blue `hsl(210,80%,55%)`, Trust gold `hsl(38,85%,58%)`)
- **Typography on screens**: Space Grotesk headings, Inter body, JetBrains Mono for data
- **Device models**: iPhone 16 Pro (titanium, edge-to-edge, Dynamic Island), Pixel 9 Pro (glass back, rounded corners)
- **UI on screens**: Glassmorphic cards with frosted-glass borders, subtle gradient orbs behind panels, clean metric typography

## Technical Approach

1. Copy `lovable_ai.py` script to `/tmp/`
2. Generate each image using `google/gemini-3-pro-image-preview` model with detailed prompts describing the exact device, environment, angle, UI content, and SITA OS design language
3. Inspect each output image for quality (device proportions, text legibility, realistic lighting)
4. Re-generate any that don't meet premium quality bar
5. Save all 4 final PNGs to `/mnt/documents/`

## Output Files

- `/mnt/documents/sita_mockup_dual_front.png`
- `/mnt/documents/sita_mockup_iphone_desk.png`
- `/mnt/documents/sita_mockup_android_lifestyle.png`
- `/mnt/documents/sita_mockup_studio_float.png`

