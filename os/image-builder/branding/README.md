# SITA OS — Branding Assets

This directory ships into `/opt/sita/branding/` inside the image.

| File | Purpose | Phase |
|---|---|---|
| `os-release` | `/etc/os-release` identity | 1 ✅ |
| `plymouth/sita.plymouth` | Boot splash theme manifest | 2 ⏳ |
| `plymouth/sita.script` | Boot splash animation | 2 ⏳ |
| `grub/theme.txt` | GRUB menu theme | 2 ⏳ |
| `wallpapers/default-dark.jpg` | Lock + desktop wallpaper | 2 ⏳ |
| `icons/sita.svg` | App icon (vector) | 2 ⏳ |

## Brand tokens (matches `tailwind.config.ts`)
- Background: `#0b0f17` (HSL 220 30% 7%)
- Foreground: `#e8ecf1`
- Accent: `#3b82f6`
- Font: Inter, fallback Noto Sans

Phase 1 ships os-release only. Phase 2 layers Plymouth + GRUB themes generated from these tokens.
