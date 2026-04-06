

# Wire Business OS, Finance OS, Concierge OS & AI to Real Backend — 100% Active

## What's Wrong Now

The edge functions exist and are fully implemented, but **zero frontend code calls them**:
- `brain-core` (AI advisor) — never invoked from any page
- `ai-gateway` (AI completions) — never invoked from any page
- `cashflow-calculate` — never invoked
- `invoice-generate` — never invoked
- `tax-estimate` — never invoked
- `booking-manage` — never invoked
- `crm-sync` — never invoked

Pages either query Supabase tables directly (good) or return hardcoded mock data (bad). The `use-sita-data.ts` hooks already have a solid pattern — they query real tables in live mode and fall back to mocks in demo. But the domain service files (`business-os/`, `finance-os/`, `concierge-os/`) return hardcoded values with no Supabase calls.

**AI**: `LOVABLE_API_KEY` is configured. The `ai-gateway` and `brain-core` functions are fully implemented. But nothing in the user-facing app calls them.

## Implementation Plan

### 1. Create Backend Integration Hooks (~200 lines)

**New file: `src/hooks/use-backend-actions.ts`**

Create hooks that call the 6 domain edge functions:

| Hook | Edge Function | Purpose |
|------|--------------|---------|
| `useCRMSync` | `crm-sync` | Sync leads/customers/opportunities |
| `useCashflowAnalysis` | `cashflow-calculate` | Analyze, forecast, safe-to-spend, burn-rate |
| `useInvoiceGenerate` | `invoice-generate` | Generate invoice PDFs |
| `useTaxEstimate` | `tax-estimate` | Quarterly/annual tax estimates |
| `useBookingManage` | `booking-manage` | Create/update/cancel/list bookings |
| `useBrainCore` | `brain-core` | AI advisor queries |

Each returns a `useMutation` or `useQuery` that calls `supabase.functions.invoke(...)`.

### 2. Wire AI into DailyPulse + Advisor Cards (~80 lines)

**Edit: `src/pages/DailyPulse.tsx`**

- Add a "Get AI Insight" button per domain section that calls `brain-core` with the appropriate intent
- Display AI recommendations inline with confidence scores
- Use `ai-gateway` for the advisor chat cards that already exist on the page

**Edit: `src/components/sita/LiveAdvisorCard.tsx`**

- Wire the existing advisor card component to call `brain-core` via `useBrainCore` hook
- Show real AI responses instead of static placeholder text

### 3. Wire Invoice Page to `invoice-generate` Edge Function (~40 lines)

**Edit: `src/pages/business/InvoicesCollections.tsx`**

- Add "Generate PDF" button on each invoice row
- Calls `invoice-generate` edge function with invoice data
- Shows success toast with download link

### 4. Wire Money Pages to `cashflow-calculate` + `tax-estimate` (~60 lines)

**Edit: `src/hooks/use-sita-data.ts`**

- Update `useCashFlow` hook to call `cashflow-calculate` edge function in live mode instead of computing locally
- Add `useTaxEstimate` hook calling `tax-estimate` edge function

**Edit: `src/pages/money/` (MoneyCenter or relevant page)**

- Add tax estimate card that calls the edge function
- Wire cash flow section to use the new backend-computed data

### 5. Wire Concierge to `booking-manage` (~40 lines)

**Edit: Concierge/household pages**

- Wire booking creation/management to call `booking-manage` edge function
- Replace any hardcoded booking data with real Supabase queries + edge function calls

### 6. Wire Domain Service Files to Supabase (~120 lines)

**Edit: `src/lib/services/business-os/contacts.service.ts`**
- Replace hardcoded `buildContactTimeline` with Supabase query from `customer_interactions` or `events` table

**Edit: `src/lib/services/business-os/accounts.service.ts`**
- Replace hardcoded values in `rollupAccountHealth` with real DB queries

**Edit: `src/lib/services/finance-os/overview.service.ts`**
- Replace hardcoded `buildInvestmentOverview` with Supabase query from `financial_accounts` / `capital_allocations`

**Edit: `src/lib/services/concierge-os/household-ops.service.ts`**
- Already takes real data as params — no changes needed (it's pure logic)

### 7. Update AI Gateway Integration (~30 lines)

**Edit: `src/lib/services/ai-gateway/index.ts`**

- Add `callAIGateway` function that invokes the `ai-gateway` edge function
- Add `callBrainCore` function that invokes `brain-core`
- Both use `supabase.functions.invoke`

## Files Created
| File | Lines |
|------|-------|
| `src/hooks/use-backend-actions.ts` | ~200 |

## Files Modified
| File | Change |
|------|--------|
| `src/hooks/use-sita-data.ts` | Wire `useCashFlow` to edge function, add `useTaxEstimate` |
| `src/pages/DailyPulse.tsx` | Add AI insight buttons calling brain-core |
| `src/pages/business/InvoicesCollections.tsx` | Add PDF generate button |
| `src/components/sita/LiveAdvisorCard.tsx` | Wire to brain-core |
| `src/lib/services/ai-gateway/index.ts` | Add callable gateway functions |
| `src/lib/services/business-os/contacts.service.ts` | Supabase queries |
| `src/lib/services/business-os/accounts.service.ts` | Supabase queries |
| `src/lib/services/finance-os/overview.service.ts` | Supabase queries |

## No Database Migration Needed
All tables and edge functions exist. This is pure wiring.

## Result After Implementation
| Gap | Before | After |
|-----|--------|-------|
| Business OS → Real Backend | 63% (demo data) | 90%+ (Supabase + edge functions) |
| Finance OS → Real Backend | 63% (demo data) | 90%+ (cashflow-calculate + tax-estimate) |
| Concierge OS → Real Backend | 58% (demo data) | 85%+ (booking-manage wired) |
| AI → Live Provider Keys | Demo mode | Live (LOVABLE_API_KEY active, brain-core + ai-gateway wired) |

