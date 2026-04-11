

# SITA OS — E-Commerce App, Notification Badges & Proposal Verification

## 1. E-Commerce Management App (New Tab in Business Center)

**What**: Add a full "E-Commerce" tab to the Business Center with Shopify-ready architecture, order tracking, inventory management, and revenue dashboards.

**Approach**: Create `src/pages/business/EcommerceManager.tsx` (~300 lines) as a new Business Center sub-page with 4 internal tabs:

- **Dashboard**: Revenue KPIs (today's sales, orders, AOV, conversion rate, refund rate), revenue trend mini-chart, top products by revenue
- **Orders**: Order list with status (pending/fulfilled/shipped/delivered/refunded), search/filter, order detail expand with timeline
- **Inventory**: Product grid with stock levels, low-stock alerts, reorder suggestions, variant management
- **Storefront**: Shopify connection status card, sync controls, channel overview (online store, POS, social), AI merchandising advisor

All demo data initially. Wire up `shopify--enable` when user clicks "Connect Shopify" button — this triggers the Shopify integration flow.

**Files changed**:
| File | Change |
|------|--------|
| `src/pages/business/EcommerceManager.tsx` | **New** — full e-commerce management page with 4 tabs |
| `src/pages/BusinessCenter.tsx` | Add "ecommerce" sub-page + tab entry with 🛒 icon |

## 2. Real-Time Notification Badges on Business Center Tabs

**What**: Show badge counts on specific tabs — unreplied comments (Social), expiring proposals (Proposals), cold leads (Lead Recovery), overdue invoices (Invoices).

**Approach**: `SitaTabs` already supports `count?: number`. Simply compute counts from existing demo data and pass them to the tab definitions in `BusinessCenter.tsx`.

Demo badge values:
- Leads: 3 (new leads)
- Proposals: 2 (expiring in <3 days)
- Lead Recovery: 5 (cold leads)
- Social: 4 (unreplied comments)
- Invoices: 1 (overdue)
- E-Commerce: 2 (low-stock alerts)

**Files changed**:
| File | Change |
|------|--------|
| `src/pages/BusinessCenter.tsx` | Add `count` values to tab definitions |
| `src/components/sita/SitaComponents.tsx` | Ensure badge renders with a colored dot/pill (verify existing implementation is visually prominent) |

## 3. Proposal Engagement Timeline Verification

**What**: The ProposalsContracts page already has expandable engagement timelines with follow-up actions. No code changes needed — this is a verification task.

The existing implementation at lines 172-189 of `ProposalsContracts.tsx` shows:
- Engagement data (first opened, time spent, sections read, pricing views, last viewed)
- Follow-up action buttons (Send Follow-Up, Re-send Proposal, View Full Analytics, Request E-Sign)
- Correctly conditional on `p.engagement` existing

**Action**: Test by navigating to Business Center > Proposals tab, clicking on "Website Redesign — Bloom Studio" (P-001) to verify the engagement timeline expands with all 5 data points and 2 action buttons.

## Technical Notes

- The existing `EcommerceOffice.tsx` in `/digital-presence/` is a separate merchandising view — the new Business Center e-commerce tab is the operational management hub (orders, inventory, Shopify sync)
- Badge counts use demo data for now; ready for live data hooks when Supabase tables are connected
- Shopify integration uses the `shopify--enable` tool flow — the "Connect Shopify" button will be wired to prompt the user

