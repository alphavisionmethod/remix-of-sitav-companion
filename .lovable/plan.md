

# Real AI-Generated Advisor Portraits for Concierge, Business, and Finance

## Summary

Generate production-quality, photorealistic AI advisor portraits for the three core advisors (Concierge, Business, Finance/Money) using the Lovable AI image generation API, then embed them as default fallback avatars throughout all advisor surfaces (Boardroom, Council Shell, Meeting Room, Mobile, Timeline). Currently, all advisors show generic Lucide icon circles -- this replaces them with real character portraits.

## What Changes

### Part 1 -- Generate Three Hero Advisor Portraits

Use `google/gemini-3-pro-image-preview` (highest quality) via a script to generate three cinematic, photorealistic advisor portraits:

- **Business Advisor** -- Distinguished executive in deep purple/indigo palette, authoritative presence, tailored suit, studio-lit headshot
- **Money/Finance Advisor** -- Sharp financial professional in emerald green palette, confident analytical gaze, modern corporate style
- **Concierge Advisor** -- Polished hospitality professional in warm gold/amber tones, welcoming expression, elegant attire

Each image saved to `src/assets/advisors/` as `business-advisor.png`, `money-advisor.png`, `concierge-advisor.png`.

### Part 2 -- Create Advisor Avatar Asset Registry

New file: `src/lib/advisors/advisor-avatar-assets.ts`

Maps domain keys to their static imported avatar images:

```typescript
import businessAvatar from "@/assets/advisors/business-advisor.png";
import moneyAvatar from "@/assets/advisors/money-advisor.png";
import conciergeAvatar from "@/assets/advisors/concierge-advisor.png";

export const DEFAULT_ADVISOR_AVATARS: Partial<Record<string, string>> = {
  business: businessAvatar,
  money: moneyAvatar,
  concierge: conciergeAvatar,
};

export function getDefaultAdvisorAvatar(domain: string): string | null {
  return DEFAULT_ADVISOR_AVATARS[domain] ?? null;
}
```

### Part 3 -- Update AdvisorAvatar Primitive to Support Image Mode

Modify `src/components/sita/primitives/AdvisorAvatar.tsx`:

- Add optional `avatarUrl` prop
- Import `getDefaultAdvisorAvatar` from the asset registry
- When `avatarUrl` is provided OR a default avatar exists for the domain, render a circular `<img>` with the domain gradient border ring instead of the Lucide icon
- Fall back to the existing icon rendering when no image is available
- Add `onError` handler that falls back to icon mode

### Part 4 -- Update AdvisorPortrait to Use Default Avatars

Modify `src/components/advisors/AdvisorPortrait.tsx`:

- Import `getDefaultAdvisorAvatar`
- Before falling back to icon mode, check if a default static avatar exists for the domain
- Use that as the image source when no user-generated `avatarUrl` is passed

### Part 5 -- Wire Avatars Into All Advisor Surfaces

Update these components to pass through avatar data:

- **AdvisorCouncilShell.tsx** -- Use `AdvisorPortrait` (with image support) instead of bare `AdvisorAvatar` for council cards
- **BoardroomPulseView.tsx** -- Pass default avatars to the advisor avatars shown in pulse view
- **AdvisorTimelineView.tsx** -- Use image-capable avatar in timeline entries
- **AdvisorDebateView.tsx** -- Ensure debate participants show portraits

### Part 6 -- QA Generated Images

Inspect each generated portrait for quality, verify they render correctly at sm/md/lg/xl sizes, check dark/light mode contrast, and confirm fallback behavior when images fail to load.

## Technical Details

- Image generation uses `google/gemini-3-pro-image-preview` for maximum quality
- Images are base64-decoded and saved as PNG files in `src/assets/advisors/`
- Vite handles static image imports natively -- no special loader needed
- The `AdvisorAvatar` primitive gains image support without breaking any existing consumer (backward compatible -- `avatarUrl` is optional)
- The `AdvisorPortrait` component already supports `avatarUrl` -- it just needs to check the default registry when none is provided
- All 34 files currently importing `AdvisorAvatar` continue working unchanged

## Files Created
- `src/assets/advisors/business-advisor.png`
- `src/assets/advisors/money-advisor.png`
- `src/assets/advisors/concierge-advisor.png`
- `src/lib/advisors/advisor-avatar-assets.ts`

## Files Modified
- `src/components/sita/primitives/AdvisorAvatar.tsx`
- `src/components/advisors/AdvisorPortrait.tsx`
- `src/components/advisors/AdvisorCouncilShell.tsx`
- `src/components/sita/apps/boardroom/BoardroomPulseView.tsx`
- `src/components/advisors/AdvisorTimelineView.tsx`

