

# SITA OS — Internal Domain Apps + External App Expansion

## What This Does

Two changes to make SITA OS feel like a real operating system:

1. **Register all SITA domains as installable internal apps** — Business Center, Money Center, Concierge, Daily Pulse, Boardroom, AI Workforce, Vault, Health, Gallery, Email, and more become first-class apps in the catalog with icons, descriptions, and routes. They show as pre-installed in the App Library.

2. **Add popular external apps** — Microsoft 365 suite (Word, Excel, PowerPoint, Outlook, Teams, OneDrive), YouTube, Netflix, Discord, Telegram, Twitter/X, LinkedIn, ChatGPT, Claude, and more.

## Current State

- **45 apps** in catalog, but only 4 are internal SITA apps (Calculator, Terminal, Files, Settings)
- All SITA domain pages (Business, Money, Concierge, etc.) exist as routes but are NOT registered as apps
- Missing major external apps: Microsoft Office, YouTube, Netflix, Discord, etc.

## Plan

### 1. Add ~15 SITA Internal Domain Apps to Catalog

Each gets `appClass: "internal"`, `installStatus: "installed"`, `publisher: "SITA OS"`, and a route path.

| App | Icon | Category | Route |
|-----|------|----------|-------|
| SITA Daily Pulse | 📊 | productivity | /daily-pulse |
| SITA Business Center | 💼 | business | /business |
| SITA Money Center | 💰 | finance | /money |
| SITA Concierge | 🏠 | household | /concierge |
| SITA Boardroom | 🎯 | enterprise | /boardroom |
| SITA AI Workforce | 🤖 | enterprise | /ai-workforce |
| SITA Email | 📧 | communication | /app-platform/email |
| SITA Vault | 🔐 | security | /app-platform/vault |
| SITA Health | 🏥 | utilities | /app-platform/health |
| SITA Gallery | 🖼️ | media | /app-platform/gallery |
| SITA CRM | 👥 | business | /business/customers |
| SITA Revenue Office | 📈 | business | /business/revenue-autopilot |
| SITA Proof Center | ✅ | enterprise | /proof |
| SITA Connectors | 🔌 | utilities | /app-platform/connectors |
| SITA App Store | 🏪 | utilities | /app-store |

### 2. Add ~15 Popular External Apps

| App | Publisher | Category |
|-----|-----------|----------|
| Microsoft Word | Microsoft | productivity |
| Microsoft Excel | Microsoft | productivity |
| Microsoft PowerPoint | Microsoft | productivity |
| Microsoft Outlook | Microsoft | communication |
| Microsoft Teams | Microsoft | communication |
| OneDrive | Microsoft | utilities |
| YouTube | Google LLC | entertainment |
| Netflix | Netflix Inc. | entertainment |
| Discord | Discord Inc. | communication |
| Telegram | Telegram FZE | communication |
| X (Twitter) | X Corp. | communication |
| LinkedIn | Microsoft | business |
| ChatGPT | OpenAI | productivity |
| Claude | Anthropic | productivity |

### 3. Add Microsoft 365 Bundle

A new bundle: "Microsoft 365 Suite" containing Word, Excel, PowerPoint, Outlook, Teams, OneDrive.

### 4. Add `routePath` Field to AppDefinition Type

Add an optional `routePath?: string` field to `AppDefinition` so internal apps can declare which route they open. This enables the shell to launch internal apps by navigating to their route.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/app-platform/types.ts` | Add `routePath?: string` to `AppDefinition` |
| `src/lib/app-platform/catalog.ts` | Add ~30 new app entries + 1 new bundle |

