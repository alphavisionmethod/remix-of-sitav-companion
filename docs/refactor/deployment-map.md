# SITA OS — Deployment Map

> Documents deployment targets and build isolation per plane.

## Plane Deployment Targets

| Plane | Build Target | Runtime | Deployment |
|-------|-------------|---------|------------|
| **Product** | Vite SPA bundle | Browser | CDN / Static hosting |
| **Admin** | Vite SPA bundle (admin routes) | Browser | CDN / Static hosting |
| **Founder** | Vite SPA bundle (founder routes) | Browser | CDN / Static hosting |
| **Mobile** | Vite SPA (responsive) | Browser | CDN / Static hosting |
| **Backend** | Edge Functions (Deno) | Deno Runtime | Lovable Cloud |
| **OS** | Engine modules (browser) | Browser | Bundled with Product |
| **Shared** | Type-only packages | N/A (compile-time) | Not deployed independently |
| **Internal Tools** | Vite SPA (internal routes) | Browser | CDN / Internal |

## Edge Functions

| Function | Purpose | Auth |
|----------|---------|------|
| `business-board-api` | Board of Advisors unified API | JWT |
| `advisor-deep-intelligence` | 8-layer cognitive pipeline | JWT |
| `os-agent-channel` | OS agent communication | JWT |
| `ai-gateway` | Sovereign AI routing | JWT |

## Database

- All tables owned by Backend plane
- RLS policies enforce `auth.uid() = user_id`
- Realtime enabled on action/recommendation tables
- Migrations managed via Lovable Cloud

## Build Independence

Each plane's code must compile independently:
- Shared packages: zero imports from `src/lib/`
- Engines: import only from `src/packages/` and peer engines
- Pages: import from `src/hooks/` and `src/lib/services/`
- Edge functions: self-contained Deno modules
