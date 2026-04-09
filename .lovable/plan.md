

# Add Missing `<h1>` Headings for SEO/Accessibility — 3 Pages

## Finding

After thorough analysis, the "~62 pages" number from the audit is outdated. The codebase already has:
- **164 pages** using `SitaPageHeader` (renders `<h1>`)
- **All admin pages** using `AdminPageHeader` (renders `<h1>`)
- **All mobile pages** using `MobileShell` (renders `<h1>`)
- **Onboarding screens** are sub-components inside a wizard, not standalone pages — they don't need their own `<h1>`

**Only 3 actual pages** are missing a semantic `<h1>`:

| Page | File | Fix |
|------|------|-----|
| Notification Center | `src/pages/NotificationCenter.tsx` | Add `SitaPageHeader` with title "Notification Center" |
| Proof Center | `src/pages/ProofCenter.tsx` | Add `SitaPageHeader` with title "Proof Center" |
| Settings | `src/pages/SettingsPage.tsx` | Add `SitaPageHeader` with title "Settings" |

## Implementation

For each of the 3 pages:
1. Import `SitaPageHeader` (if not already imported)
2. Add `<SitaPageHeader title="..." subtitle="..." />` as the first child inside the main container, after `<DemoModeBadge />`

This follows the exact same pattern used by 164 other pages. No logic changes, purely additive.

## Technical Details
- **Files changed**: 3
- **Risk**: Zero — adding a heading component, no logic affected
- **SEO impact**: Every page will now have a proper `<h1>` for crawlers and screen readers

