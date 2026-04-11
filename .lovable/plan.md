

# SITA OS — Advanced Personalization Audit & Business Automation Expansion

## Current State Assessment

### What's Working Well
- **AppWelcomeHeader**: Time-aware greetings with domain-specific metrics across 10 domains
- **InAppAdvisorStrip**: Contextual AI suggestions with confidence bars for 7 domains
- **AdvisorAutonomyPanel**: Watch/Suggest/Auto-pilot per advisor with dollar thresholds
- **DesktopDock**: macOS-style dock with magnification, badges, and tooltips
- **AppRecentsStrip**: Cross-app continuity with "Continue where you left off"
- **App Store**: Reviews, ratings, categories, bundles, search, trust badges
- **Catalog**: ~75 apps (15 internal SITA + 60 external) with 9 bundles

### What's Missing or Incomplete
1. **Welcome headers are static** — metrics are hardcoded strings, not connected to real domain data
2. **Advisor suggestions are static** — no connection to actual lead/invoice/finance state
3. **No notification center** — badges exist but no way to view/dismiss notifications
4. **No app-level onboarding** — apps open cold with no "first win" setup flow
5. **No cross-app command palette** — no Cmd+K quick launcher
6. **No website builder / landing page app** — critical for business users
7. **No e-commerce management app** — no Shopify/WooCommerce dashboard
8. **No social media management** — no posting scheduler or analytics
9. **No lead recovery / re-engagement tools** — leads go cold with no automated winback
10. **No contract/proposal signing** — quotes exist but no e-signature flow

## Plan (2 Parts)

### Part 1: Personalization Depth (Make Existing Features Smarter)

**A. Dynamic Welcome Headers** — Connect `AppWelcomeHeader` to actual demo data so metrics are real, not hardcoded. Business shows actual lead count from `founderScenario`, Money shows real safe-to-spend, Concierge shows real task counts.

**B. Command Palette (Cmd+K)** — Global quick launcher to open any app, navigate anywhere, run advisor actions, or search across all domains. Renders as a modal with fuzzy search over apps + routes + recent actions.

**C. Notification Center** — A slide-out panel triggered from a bell icon in the shell header. Shows grouped notifications by domain with dismiss/action buttons. Connects to `useAppBadges` for counts.

**D. App Quick-Actions on Right-Click (Dock)** — Right-click context menu on dock icons: Open, App Info, Unpin, Notifications, Recent Activity.

### Part 2: Business Automation App Expansion

Add these as new catalog entries (external web apps with `externalUrl` or internal apps with `routePath`):

**E. New Internal SITA Apps:**
- **SITA Website Builder** — internal app linking to a new page for managing landing pages, lead capture forms, and simple site building (route: `/business/website-builder`)
- **SITA Proposals & Contracts** — e-signature, proposal tracking, contract lifecycle (route: `/business/proposals`)
- **SITA Lead Recovery** — automated winback sequences, cold lead re-engagement, drip campaigns (route: `/business/lead-recovery`)
- **SITA Social Command** — social media scheduling, cross-platform posting, analytics (route: `/business/social`)

**F. New External Apps (catalog entries):**
- **Shopify** — e-commerce store management (`https://admin.shopify.com`)
- **WooCommerce** — WordPress e-commerce (`https://woocommerce.com`)
- **Squarespace** — Website building (`https://www.squarespace.com`)
- **Wix** — Website building (`https://www.wix.com`)
- **Mailchimp** — Email marketing & automation (`https://mailchimp.com`)
- **HubSpot** — CRM & marketing automation (`https://app.hubspot.com`)
- **Calendly** — Scheduling & booking (`https://calendly.com`)
- **DocuSign** — E-signatures (`https://app.docusign.com`)
- **Hootsuite** — Social media management (`https://hootsuite.com`)
- **Buffer** — Social media scheduling (`https://buffer.com`)
- **Zapier** — Workflow automation (`https://zapier.com`)
- **Airtable** — Database & project management (`https://airtable.com`)
- **Monday.com** — Work management (`https://monday.com`)
- **Freshdesk** — Customer support (`https://freshdesk.com`)
- **Intercom** — Customer messaging (`https://app.intercom.com`)

**G. New Bundles:**
- **E-Commerce Starter** — Shopify, Stripe Dashboard, Mailchimp, Google Sheets, Canva
- **Lead Recovery & Growth** — SITA Lead Recovery, Mailchimp, HubSpot, Calendly, LinkedIn
- **Website & Marketing** — SITA Website Builder, Squarespace, Canva, Buffer, Google Analytics
- **Customer Success** — SITA CRM, Freshdesk, Intercom, Slack, Calendly
- **Full Business Automation** — SITA Business Center, Zapier, Airtable, DocuSign, Mailchimp, Slack

## Files Changed

| File | Change |
|------|--------|
| `src/components/sita/AppWelcomeHeader.tsx` | Connect metrics to demo scenario data |
| `src/components/sita/CommandPalette.tsx` | **New** — Cmd+K global launcher |
| `src/components/sita/NotificationCenter.tsx` | **New** — Slide-out notification panel |
| `src/components/sita/ShellLayout.tsx` | Mount CommandPalette + NotificationCenter trigger |
| `src/components/sita/DesktopDock.tsx` | Add right-click context menu |
| `src/lib/app-platform/catalog.ts` | Add ~19 new apps + 5 new bundles + 4 internal SITA apps |
| `src/pages/business/WebsiteBuilder.tsx` | **New** — Landing page/lead capture builder |
| `src/pages/business/ProposalsContracts.tsx` | **New** — Proposal/contract management |
| `src/pages/business/LeadRecovery.tsx` | **New** — Winback campaigns & re-engagement |
| `src/pages/business/SocialCommand.tsx` | **New** — Social media management |
| `src/pages/BusinessCenter.tsx` | Add tabs for new sub-pages |
| `src/App.tsx` | Add routes for new business sub-pages |

## Summary
This adds a command palette, notification center, dynamic personalized metrics, and expands the catalog by ~23 apps (4 internal + 19 external) with 5 new bundles covering e-commerce, lead recovery, website building, customer success, and full business automation. Every business vertical — from solo founder to agency to e-commerce operator — gets a curated toolkit.

