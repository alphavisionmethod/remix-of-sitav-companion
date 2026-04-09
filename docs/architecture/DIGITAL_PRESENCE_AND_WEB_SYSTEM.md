# SITA OS — Digital Presence & Web System

## Ownership

Domain: `business-os`
Service: `digital-presence`
Status: alpha

## Core Capabilities

| Capability | Description |
|------------|-------------|
| Site Builder | Drag-and-drop page builder, template library, preview |
| Brand Studio | Logo, colors, typography, brand asset management |
| SEO Engine | Meta tags, sitemaps, structured data, keyword tracking |
| CRO Tools | Conversion optimization, heatmaps, funnel analysis |
| Ecommerce | Product catalog, checkout, inventory, order management |
| Domain Publishing | Custom domain binding, SSL, DNS management |
| Content Management | Blog, pages, media library, versioning |

## Page Map

| Route | Purpose |
|-------|---------|
| `/digital-presence` | Dashboard — site health, traffic, SEO score |
| `/digital-presence/site-builder` | Visual page builder |
| `/digital-presence/brand-studio` | Brand identity management |
| `/digital-presence/seo` | SEO audit, keyword tracking |
| `/digital-presence/cro` | Conversion optimization tools |
| `/digital-presence/ecommerce` | Product and order management |
| `/digital-presence/domains` | Domain and publishing settings |
| `/digital-presence/content` | Content management, blog |

## Data Model

- `sites` / `site_pages` — site structure and content
- `brand_assets` — logos, colors, typography definitions
- `seo_audits` / `seo_keywords` — SEO tracking
- `products` / `orders` — ecommerce catalog
- `domains` / `dns_records` — domain management
- `media_library` — uploaded assets

## Proof Model

- Site publish receipt (version, pages, timestamp)
- Domain binding receipt (domain, DNS verification, SSL status)
- SEO audit receipt (scores, issues found, recommendations)

## Integration Points

- `connector-control-plane` — domain registrar, analytics connectors
- `revenue-office` — ecommerce revenue flows
- `event-bus` — publish events, traffic alerts
- `receipt-service` — proof chain for publishes and domain changes
