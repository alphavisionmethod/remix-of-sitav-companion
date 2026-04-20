
The user wants a comprehensive marketing website for SITA OS with: interactive demo, beta tester registration, waitlist, donation capture, investor section, app/OS download, plus a downloadable strategy document. This is a major build — I'll plan it in phases and produce the strategy doc as part of phase 0 so they have something tangible immediately.

Let me check what marketing surface already exists and what the current public routes look like.

## Strategy

Build a **public marketing site** at `/` (and supporting routes) that lives outside the OS shell — uses `PublicLayout` (no kernel/runtime overhead). Plus a downloadable PDF/Markdown strategy doc.

## Phase 0 — Strategy document (delivered immediately as artifact)

Create `/mnt/documents/SITA_WEBSITE_DEMO_STRATEGY.pdf` (+ `.md` source) covering:
1. Positioning & narrative arc (who/what/why now)
2. Page-by-page IA with copy direction
3. Interactive demo architecture (3 modes — see below)
4. Beta tester funnel + scoring
5. Waitlist mechanics (referral, position, perks)
6. Investor track (gated deal room)
7. Donation flow (transparency receipts)
8. Download distribution (web app, PWA, Ubuntu ISO, Electron)
9. SEO/social/launch playbook
10. Analytics & conversion KPIs

## Phase 1 — Public site shell & routes

New routes under `PublicLayout`:
| Route | Purpose |
|---|---|
| `/` | Hero + 3-act narrative + live demo embed + social proof |
| `/demo` | Full interactive demo (sandboxed OS preview) |
| `/beta` | Beta tester application + scoring |
| `/waitlist` | Waitlist signup + referral leaderboard |
| `/investors` | Investor brief + gated deal room request |
| `/donate` | Donation tiers + transparent receipt chain |
| `/download` | Web app, PWA install, Ubuntu ISO, Electron builds |
| `/manifesto` | The "why SITA exists" long-form |
| `/proof` | Live receipt chain visualization (the wow moment) |
| `/press` | Press kit, brand assets, founder bios |

## Phase 2 — Interactive demo (the wow)

**3-tier demo strategy:**

1. **Inline preview** (`/`): Auto-playing 12-second loop of the OS desktop with glassmorphic widgets — uses the existing desktop visual system, no auth.
2. **Guided tour** (`/demo?mode=tour`): Stepped walkthrough — invoice paid → reserves update → concierge reminder clears (the cross-domain intelligence story).
3. **Sandbox mode** (`/demo?mode=sandbox`): Full read-only OS shell using existing `DemoMode` provider with seeded fixtures — they actually *use* it.

Architecture: reuse existing `SitaKernelProvider` + `DemoMode` from app shell; isolate via demo entity context so no real data leaks.

## Phase 3 — Conversion surfaces

- **Beta tester form**: device profile, use case, technical level → composite score → auto-route via existing `business-os` lead intake (already documented in `WEBSITE_AND_LEAD_CAPTURE_SYSTEM.md`)
- **Waitlist**: email + referral code; position calculated server-side; share-to-skip-the-line mechanic
- **Investor request**: company, ticket size, jurisdiction → gated access to deal room (separate signed link)
- **Donation**: Stripe-powered (Lovable Payments) with public receipt hash on `/proof`

## Phase 4 — Backend (Lovable Cloud)

New tables (via migration):
- `waitlist_signups` (email, referral_code, referred_by, position, created_at)
- `beta_applications` (email, profile_json, score, status, device_targets[])
- `investor_requests` (company, contact, ticket_size_band, jurisdiction, status)
- `donations` (amount, currency, donor_name_optional, message, receipt_hash, stripe_session_id)
- `press_inquiries`

All with RLS: public INSERT (anon), admin-only SELECT via `has_role`.

Edge functions:
- `waitlist-signup` (assign position, send confirm email)
- `beta-apply` (score + route)
- `investor-request` (notify + queue)
- `donation-checkout` (Stripe session)
- `donation-webhook` (verify + emit receipt)

## Phase 5 — Sections you didn't ask for but need

| Section | Why |
|---|---|
| **Live proof wall** (`/proof`) | Real-time receipt chain — concrete "proof over promise" demonstration |
| **Comparison matrix** | SITA vs ChatGPT vs Notion AI vs traditional ERP — investor essential |
| **Trust & sovereignty page** | On-device, dm-verity, TPM, no telemetry — differentiator |
| **Founder letter** | Personal narrative — investor + early-adopter magnet |
| **Roadmap** (public) | Builds trust; shows velocity |
| **Changelog** | Same — proof of shipping |
| **Status page** | Uptime, build health from existing 30 BLOCK gates — radical transparency |
| **Partner/integrations grid** | Connector ecosystem proof |
| **FAQ** | Conversion lubricant |
| **Cookie/privacy/terms** | Required for EU + investor diligence |
| **OG image generator** | Per-page social previews — viral coefficient |
| **Newsletter** | Owned audience channel |

## Phase 6 — Wow polish

- Glassmorphic hero matching existing desktop visual system (re-use brand)
- Scroll-triggered narrative (3 acts: Problem → SITA → Proof)
- Cursor-following spotlight on hero
- Live counter of waitlist + receipts generated
- Magnetic CTA buttons
- Reduced-motion respected throughout
- Sub-100ms route transitions (preloaded)
- Lighthouse 95+ across the board

## Files (high-level)

**Created:**
- `src/pages/marketing/{Home,Demo,Beta,Waitlist,Investors,Donate,Download,Manifesto,Proof,Press}.tsx`
- `src/components/marketing/{HeroSection,NarrativeAct,DemoEmbed,WaitlistForm,BetaForm,InvestorForm,DonationTiers,DownloadGrid,ProofWall,ComparisonMatrix,FAQ,FounderLetter,Roadmap,SiteHeader,SiteFooter}.tsx`
- `src/lib/marketing/{demo-fixtures,referral-codes,scoring}.ts`
- 5 edge functions (above)
- 1 migration (5 tables + RLS + triggers)
- `/mnt/documents/SITA_WEBSITE_DEMO_STRATEGY.pdf` + `.md`

**Edited:**
- `src/App.tsx` (mount marketing routes under `PublicLayout`)
- `package.json` (add `@react-pdf/renderer` if needed for receipts)

## Order of execution (in default mode)

1. Generate strategy PDF (immediate artifact)
2. Migration + edge functions (backend first)
3. Marketing site shell + Home with hero/demo embed
4. Waitlist + Beta forms (highest conversion priority)
5. Demo modes 1+2 (inline + guided)
6. Investor + Donate flows (Stripe)
7. Download page + Proof wall
8. Manifesto + Press + supporting pages
9. SEO meta + OG image generator
10. Polish, motion, Lighthouse pass

## Clarifications I'm assuming (flag if wrong)

- Stripe via Lovable Payments for donations (will run `recommend_payment_provider` in default mode)
- Email via built-in Lovable Emails for confirmations
- Demo sandbox uses existing `DemoMode` infra — no new isolation layer needed
- One language (English) at launch; i18n scaffolded but not populated
- Marketing site shares the project's existing brand tokens — no new design system

## What this does NOT touch

- Zero changes to existing OS shell, kernel, or 30 BLOCK gates
- Zero changes to authenticated app routes
- Zero changes to existing audit/governance system
