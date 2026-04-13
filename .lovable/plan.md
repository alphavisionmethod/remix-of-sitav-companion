

# Business OS — Premium Dark Dashboard Redesign

## Design Direction

Inspired by the two reference images:
- **Image 1 (MudraBank)**: Dark dashboard with card-based layout, credit card widget, money flow chart, quick transfer section, recent transactions list, colored stat cards (Total Balance, Income, Expenses) with gradients
- **Image 2 (Analytics)**: Deep dark UI with glowing green/teal accents, circular progress indicators, bar charts with glow effects, grid-based card layout with subtle borders

## The SITA Business OS Mix

Transform `BusinessOverview` from the current card-family layout into a **premium dark financial dashboard** with:

1. **Top row**: 4 stat cards with colored gradients (Pipeline Value, Revenue This Month, Active Customers, Conversion Rate) — like MudraBank's Total Balance/Income/Expenses cards
2. **Middle row**: Money Flow chart (line/area chart showing weekly revenue) + Recent Activity list (transactions-style with colored icons and status badges)
3. **Bottom row**: Quick Actions panel (like Quick Transfer) + Pipeline breakdown mini-cards + Advisor insight card
4. **Design tokens**: Deep dark backgrounds (`bg-[#0a0a12]`), cards with `bg-[#12121e]` and subtle `border-[#1a1a2e]`, glowing accent numbers (green for positive, red for negative), teal/green sparkline accents

## Files Changed

| File | Change |
|------|--------|
| `src/pages/business/BusinessOverview.tsx` | Full rewrite — premium dashboard grid with stat cards, chart area, transactions list, quick actions |
| `src/components/business/BusinessStatCard.tsx` | New — gradient stat card component (value, label, trend arrow, percentage change) |
| `src/components/business/BusinessMoneyFlow.tsx` | New — SVG area chart showing weekly revenue with glowing data points |
| `src/components/business/BusinessRecentActivity.tsx` | New — transactions-style list with colored category icons, amounts, status badges |
| `src/components/business/BusinessQuickActions.tsx` | New — quick action buttons (Send Invoice, Add Lead, Schedule Call, Create Quote) with glass styling |

## Technical Details

### Stat Cards (`BusinessStatCard`)
- Gradient backgrounds: Pipeline=violet-to-purple, Revenue=emerald-to-teal, Customers=amber-to-orange, Conversion=cyan-to-blue
- Large number (`text-3xl font-bold text-white`), small label, trend arrow with percentage
- Subtle inner glow matching gradient color
- `rounded-2xl` with no visible border

### Money Flow Chart (`BusinessMoneyFlow`)
- Pure SVG area chart (no external lib) with gradient fill under the line
- 7 data points (Mon–Sun), glowing dots on hover
- Teal/green line color with `filter: drop-shadow(0 0 6px rgba(16,185,129,0.5))`
- Toggle buttons: "Current Week" / "Previous Week" like MudraBank

### Recent Activity (`BusinessRecentActivity`)
- List rows: colored icon circle + description + date + amount + status badge (Success/Pending/Overdue)
- Status badges: green for paid, yellow for pending, red for overdue
- "View all" link at top right
- Subtle hover highlight on rows

### Quick Actions (`BusinessQuickActions`)
- 2x2 grid of action buttons with icons
- Glass material (`bg-white/[0.04] backdrop-blur-xl`)
- Each button: icon + label, hover scales slightly

### Layout Grid
```text
┌─────────┬─────────┬─────────┬─────────┐
│ Pipeline │ Revenue │ Custom. │ Conver. │  ← stat cards
├─────────────────────┬─────────────────┤
│   Money Flow Chart  │ Recent Activity │  ← main content
├──────────┬──────────┴─────────────────┤
│ Actions  │  Advisor + Pipeline Cards  │  ← bottom
└──────────┴────────────────────────────┘
```

All existing card imports (HeroCard, QueueCard, etc.) will be replaced with the new purpose-built components. The `DomainAppShell` wrapper stays unchanged — only the content inside changes.

