# SITA OS — Quicken-Like Finance & Family Office

## Ownership

All finance belongs to `finance-os`. Investment office and family office are capability families within finance-os, NOT separate services.

## Core Capabilities

### Personal Finance (Quicken-like)
- Account aggregation via connectors (Plaid, etc.)
- Transaction categorization (deterministic rules + AI assist)
- Bill calendar and payment tracking
- Subscription detection and waste analysis
- Safe-to-spend calculation
- Reserve management
- Cash timing projections

### Family Office
- Multi-entity financial overview
- Investment portfolio tracking
- Tax estimation (deterministic US 2024 brackets)
- Estate planning inputs
- Trust and entity management
- Family member financial visibility (role-aware)

### Investment Office
- Portfolio performance tracking
- Asset allocation analysis
- Rebalancing recommendations
- Market context (from connectors)
- Risk assessment

## Deterministic Guarantee

These calculations MUST use deterministic engines (sovereign-calculation service), NOT LLM approximation:
- Tax estimates
- Reserve calculations
- Safe-to-spend
- Burn rate / burn multiple
- Invoice aging
- Cash flow projections
- Budget utilization

## Boardroom Integration

Finance boardroom packet includes:
- Cash position summary
- Obligation schedule
- Revenue receivables
- Waste/savings opportunities
- Reserve health
- Tax obligation estimate
- Investment performance

## Proof Model

Financial actions generate typed receipts:
- Transaction categorization receipt
- Bill payment receipt
- Reserve allocation receipt
- Budget adjustment receipt
- Investment rebalancing receipt
