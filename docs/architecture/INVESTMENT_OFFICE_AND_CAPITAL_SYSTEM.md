# SITA OS — Investment Office & Capital System

## Ownership

Domain: `finance-os`
Service: `investment-office`
Status: alpha

## Core Capabilities

| Capability | Description |
|------------|-------------|
| Portfolio Management | Multi-asset portfolio tracking, allocation, rebalancing |
| Risk Analysis | Risk scoring, exposure mapping, concentration alerts |
| Investment Thesis | Thesis creation, validation, performance tracking |
| Family Office | Multi-entity capital coordination, trust/estate views |
| Market Exploration | Market data feeds, sector analysis, opportunity scoring |
| Behavioral Firewall | Emotion-driven trade prevention, cooling periods, policy gates |
| Capital Allocation | Strategic allocation across entities, tax-aware positioning |

## Page Map

| Route | Purpose |
|-------|---------|
| `/investment-office` | Dashboard — portfolio summary, performance, alerts |
| `/investment-office/portfolio` | Holdings, allocations, rebalancing tools |
| `/investment-office/risk` | Risk metrics, exposure analysis, stress tests |
| `/investment-office/thesis` | Investment thesis management and tracking |
| `/investment-office/family-office` | Multi-entity capital overview |
| `/investment-office/market` | Market exploration, sector analysis |
| `/investment-office/behavioral-firewall` | Trade policy gates, cooling periods |
| `/investment-office/capital-allocation` | Strategic allocation planning |

## Data Model

- `portfolios` — user portfolio definitions
- `portfolio_holdings` — individual positions
- `investment_theses` — thesis records with performance
- `risk_assessments` — risk scoring snapshots
- `trade_orders` — order history with behavioral gate status
- `market_signals` — external market data events

## Proof Model

Every trade, rebalance, and allocation change generates a receipt:
- Trade execution receipt (order → fill → settlement)
- Behavioral firewall receipt (gate triggered, cooling period, override)
- Risk assessment receipt (scoring methodology, inputs, output)
- Allocation change receipt (before/after, rationale)

## Integration Points

- `sovereign-calculation` — deterministic tax-lot and gain/loss math
- `receipt-service` — proof chain for all capital movements
- `policy-engine` — behavioral firewall rules
- `event-bus` — cross-domain events (capital impact on business/concierge)
- `memory-service` — investment preference learning
