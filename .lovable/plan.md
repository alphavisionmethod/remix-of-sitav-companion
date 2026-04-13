

# Crypto Wallets, Exchanges & Forex — Platform Connections Expansion

## What We're Building

Expand the Investment Office **Platform Connections** page and the **connector registry** to support major crypto wallets, crypto trading platforms, and forex/international trading platforms — giving users a comprehensive, one-click connection experience.

## Current State

- `PlatformConnections.tsx` already supports 4 types: `brokerage`, `exchange`, `event-market`, `wallet`
- Demo connected: Interactive Brokers, Schwab, Coinbase, Polymarket, MetaMask (disconnected)
- Demo available: Robinhood, Binance, Kraken, Kalshi, Manifold, Fidelity, Ledger Live
- Missing: Most major crypto wallets, CEXs, DEX aggregators, forex platforms, and international brokers

## Plan

### Step 1: Expand platform types and demo data

Add new platform types: `dex`, `forex`, `international-broker`. Update `PLATFORM_CONNECTIONS` and `DEMO_AVAILABLE_PLATFORMS` with:

**Crypto Wallets**: MetaMask (already exists), Phantom, Trust Wallet, Coinbase Wallet, Ledger Live (exists), Trezor Suite, Rainbow, Rabby

**Crypto Exchanges (CEX)**: Coinbase (exists), Binance (exists), Kraken (exists), Bybit, OKX, KuCoin, Gemini, Crypto.com, Bitfinex

**DEX / DeFi**: Uniswap, Jupiter (Solana), 1inch, Aave, dYdX

**Forex / International**: Interactive Brokers (exists — supports forex), OANDA, Forex.com, IG Markets, Saxo Bank, eToro, Trading 212, IBKR GlobalTrader

### Step 2: Upgrade PlatformConnections UI

Redesign the "Available to Connect" section:
- **Category tabs**: Wallets | Exchanges | DeFi | Forex & International | Brokerages | Event Markets
- **Search/filter** bar to find platforms quickly
- **Chain badges** for wallets (Ethereum, Solana, Multi-chain)
- **Region flags** for forex/international platforms
- **"Popular" tag** on high-demand platforms
- Each card shows supported capabilities (e.g., "Read-only", "Trade execution", "DeFi positions")

### Step 3: Add connection flow modal

Create `ConnectPlatformModal.tsx` — a step-by-step connection wizard:
1. Select platform → shows required permissions and data access scope
2. Auth method selection (API key, OAuth, WalletConnect, browser extension)
3. For wallets: WalletConnect-style QR code placeholder / "Connect Extension" button
4. For exchanges: API key + secret input with instructions link
5. For forex: Account credentials with broker-specific guidance
6. Confirmation screen showing what data will sync
7. Saves to `connector_configs` table via edge function

### Step 4: Update connector registry

Add all new platforms to `connectors.yaml` under new categories: `crypto-wallet`, `crypto-exchange`, `defi`, `forex`. Add corresponding `VALUE_UNLOCKED` entries per type.

### Step 5: Add wallet-specific features to the connected view

For connected wallets, show:
- **Chain breakdown**: ETH, SOL, BNB balances per chain
- **Token list**: Top holdings with USD values
- **DeFi positions**: Staked/LP positions summary
- **NFT count** (optional badge)

For connected forex platforms:
- **Open positions**: Currency pairs with P&L
- **Account leverage** and margin status

## Files

- **Edit**: `src/lib/investment-office/mock-data.ts` (expand PLATFORM_CONNECTIONS, add types)
- **Edit**: `src/lib/demo-data/investment.tsx` (expand DEMO_AVAILABLE_PLATFORMS with all new platforms)
- **Edit**: `src/pages/investment-office/PlatformConnections.tsx` (category tabs, search, enhanced cards)
- **Create**: `src/components/investment/ConnectPlatformModal.tsx` (~200 lines — connection wizard)
- **Edit**: `src/components/sita/money-onboarding/types.ts` (add `crypto_wallet`, `exchange`, `forex` to ConnectedAccountStub types)
- **Edit**: `src/components/sita/money-onboarding/ConnectAccountsStep.tsx` (add crypto/forex tiles)
- **Edit**: `docs/architecture/registry/connectors.yaml` (new categories)

## Technical Details

- New `PlatformType` union: `"brokerage" | "exchange" | "event-market" | "wallet" | "dex" | "forex" | "international-broker"`
- Category tabs use a simple state toggle filtering `DEMO_AVAILABLE_PLATFORMS` by type
- Connection modal stores config via upsert to `connector_configs` (existing table pattern)
- Wallet connection uses placeholder UI for WalletConnect/extension detection (actual Web3 integration is future work — this builds the UX flow)
- All new platforms get demo data entries so the UI is rich immediately

