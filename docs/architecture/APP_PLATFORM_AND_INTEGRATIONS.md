# SITA OS — App Platform & Integrations

## Ownership

Domain: `platform`
Service: `app-platform`
Status: alpha

## Core Capabilities

| Capability | Description |
|------------|-------------|
| Installed Apps | App lifecycle management, enable/disable, permissions |
| Connector Hub | Third-party service connections, OAuth flows, health monitoring |
| Email App | Integrated email with threading, labels, smart sorting |
| Vault App | Secure document storage, sensitive doc governed mode |
| Health App | Health metrics tracking, wellness data integration |
| Gallery App | Media management, photo/video organization |
| App Marketplace | Discovery, installation, ratings for OS extensions |

## Page Map

| Route | Purpose |
|-------|---------|
| `/app-platform` | Dashboard — installed apps, connector status |
| `/app-platform/apps` | App management, enable/disable |
| `/app-platform/connectors` | Connector hub, OAuth management |
| `/app-platform/email` | Email client |
| `/app-platform/vault` | Secure document vault |
| `/app-platform/health` | Health metrics dashboard |
| `/app-platform/gallery` | Media gallery |
| `/app-platform/marketplace` | App discovery and installation |

## Data Model

- `installed_apps` — app registry per user
- `connector_configs` — OAuth tokens, refresh cycles, health
- `oauth_clients` — registered OAuth applications
- `vault_items` — encrypted document references
- `health_logs` — health metric entries
- `media_assets` — gallery items

## Proof Model

- App install/uninstall receipt (app ID, permissions granted, timestamp)
- Connector auth receipt (provider, scopes, token expiry)
- Vault access receipt (who accessed, when, redaction applied)

## Integration Points

- `connector-control-plane` — connector lifecycle management
- `connector-runners` — active connector execution
- `policy-engine` — app permission policies
- `receipt-service` — proof chain for all app/connector actions
- `sensitive-document-governed-mode` — vault security enforcement
