# Business OS — Module Manifest

**Pillar**: 1 of 4
**Route group**: `/business/*`
**Primary surface**: `src/pages/BusinessCenter.tsx` (windowed App-in-OS shell)
**Sub-apps under this pillar**: CRM, Lead Recovery, Revenue Autopilot, Quotes, Customer Support, Operations, Website Builder, Social Command, Ecommerce, Ads.

## Owned Sub-Domains

| Sub-domain        | Surface(s)                                         | Service(s)                                  |
| ----------------- | -------------------------------------------------- | ------------------------------------------- |
| CRM               | `src/pages/business/CRM*.tsx` (15 pages)          | `src/lib/services/business-os/crm-*`        |
| Lead recovery     | `src/pages/business/LeadRecovery.tsx`              | `src/lib/services/business-os/lead-*`       |
| Revenue autopilot | `src/pages/business/RevenueAutopilot.tsx`          | `src/lib/services/business-os/revenue-*`    |
| Quotes            | `src/pages/business/QuotesWorkspace.tsx`           | `src/lib/services/business-os/quotes-*`     |
| Sales / pipeline  | `src/pages/business/CRMPipeline.tsx`, `DealRoom`   | `src/lib/services/business-os/pipeline-*`   |
| Customer support  | `src/pages/business/CustomerSupportCenter.tsx`     | `src/lib/services/business-os/support-*`    |
| Operations        | `src/pages/business/BusinessOperations.tsx`        | `src/lib/services/business-os/ops-*`        |
| Advertising       | (planned)                                          | (planned)                                   |
| Website builder   | `src/pages/business/WebsiteBuilder.tsx`            | `src/lib/services/website-manager`          |
| Ecommerce         | `src/pages/business/EcommerceManager.tsx`          | (Shopify connector)                         |

## Owned Components
- `src/components/business/**`
- `src/components/business-advisors/**`
- `src/components/revenue/**`, `src/components/revenue-office/**`
- `src/components/operations/**`

## Forbidden Imports
- ❌ `src/modules/concierge/**` · `src/modules/finance/**` · `src/modules/health/**`
- ✅ `@/platform/**` · `@/platform/trust/**`

## Trust Integration
Every mutating action MUST emit a receipt via `@/platform/trust/receipts.emitActionReceipt`. CRM contact deletion, deal-stage changes, and outbound communications are the highest-priority audit targets.