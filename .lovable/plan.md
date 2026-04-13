

# Finance OS — MudraBank-Style Premium Dashboard Redesign

## Design Direction

Transform the Finance OS overview from its current card-family layout into a premium dark banking dashboard matching the MudraBank reference: credit card widget, money flow chart, quick transfer section, recent transactions, and colorful stat cards.

## Layout

```text
┌────────────────────┬──────────────────────┬──────────────────┐
│   My Card          │   Money Flow Chart   │ Open New Account │
│   (credit card     │   (area chart with   │                  │
│    widget)         │    week toggle)      │ Total Balance    │
│                    │                      │ $24,800 +5.27%   │
├────────────────────┤                      ├────────┬─────────┤
│   Quick Transfer   │                      │ Income │Expenses │
│   Account selector │                      │ $4,800 │ $1,450  │
│   Amount input     ├──────────────────────┤        │         │
│   Send button      │ Recent Transactions  ├────────┴─────────┤
│                    │ (list with status)   │ Safe to Spend    │
│                    │                      │ $3,200           │
└────────────────────┴──────────────────────┴──────────────────┘
```

## New Components

### 1. `FinanceCreditCard.tsx`
- Dark gradient card with card number (masked), holder name, expiry
- Subtle chip icon, contactless icon, Visa/Mastercard logo area
- Carousel dots below (decorative)

### 2. `FinanceMoneyFlow.tsx`
- SVG area chart (reuse pattern from BusinessMoneyFlow)
- "Savings" label, Current/Previous Week toggle
- Emerald/teal line with gradient fill, day labels, hover tooltip showing value
- Deep dark card (`bg-[#12121e]`, `border-[#1a1a2e]`)

### 3. `FinanceQuickTransfer.tsx`
- Account type selector (Debit/Credit dropdown)
- Balance display
- Amount input with currency symbol
- Avatar row for recent recipients
- Send button

### 4. `FinanceRecentTransactions.tsx`
- Transaction rows: colored icon + name/category + date + amount + status badge
- Status: Success (green), Pending (yellow), Failed (red)
- "View all" link

### 5. `FinanceStatCards.tsx`
- Three gradient cards stacked on right column:
  - **Total Balance**: Red/coral gradient, large number, percentage change with arrow
  - **Income**: Green gradient, monthly income
  - **Expenses**: Purple/violet gradient, monthly expenses
- Plus a "Safe to Spend" mini card
- "Open New Account +" button at top

### 6. Rewrite `MoneyOverview.tsx`
- Replace all HeroCard/QueueCard/ActionCard usage with the new MudraBank-style components
- Three-column grid layout on desktop, stacks on mobile
- Deep dark background (`bg-[#0a0a12]`)
- Keep existing data hooks (useBills, useSubscriptions, useMoneyKPIs)

## Files Changed

| File | Change |
|------|--------|
| `src/pages/money/MoneyOverview.tsx` | Full rewrite — MudraBank dashboard layout |
| `src/components/finance/FinanceCreditCard.tsx` | New — dark gradient credit card widget |
| `src/components/finance/FinanceMoneyFlow.tsx` | New — SVG area chart with week toggle |
| `src/components/finance/FinanceQuickTransfer.tsx` | New — quick transfer panel with amount input |
| `src/components/finance/FinanceRecentTransactions.tsx` | New — transaction list with status badges |
| `src/components/finance/FinanceStatCards.tsx` | New — gradient stat cards (Balance, Income, Expenses) |

## Design Tokens

- Background: `bg-[#0a0a12]`
- Cards: `bg-[#12121e]` with `border-[#1a1a2e]`
- Credit card: gradient from `hsl(260 40% 25%)` to `hsl(280 35% 18%)`
- Total Balance card: coral/red gradient
- Income card: emerald gradient
- Expenses card: violet gradient
- Chart accent: `rgb(16,185,129)` with glow
- Text: white/90 primary, white/50 secondary, white/30 tertiary

