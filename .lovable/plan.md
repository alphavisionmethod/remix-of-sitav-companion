

# Add Missing Self-Hosted Infrastructure: pg-meta, Edge Function Runtime, Full Integration

## Current State

| Component | Status |
|---|---|
| PostgREST (`sita-supabase-rest`) | Already in docker-compose.yml |
| Realtime (`sita-supabase-realtime`) | Already in docker-compose.yml |
| Kong routes to `sita-supabase-rest:3000` | Already correct in kong.yml |
| Kong routes to `sita-supabase-realtime:4000` | Already correct in kong.yml |
| **pg-meta container** | **MISSING** — Kong `/pg/` route points to PostgREST, but a proper pg-meta service would be better |
| **Edge Function runtime** | **MISSING** — 14 Deno edge functions have no self-hosted container |

PostgREST and Realtime are already implemented. The two real gaps are pg-meta and edge functions.

## What to Build

### 1. Supabase pg-meta Container

Add `sita-supabase-meta` using `supabase/postgres-meta:v0.80.0`. This provides the `/pg/` metadata API (table introspection, schema info) that Kong routes to.

- Port 8080 internal
- Connects to Postgres via `PG_META_DB_HOST=sita-supabase-db`
- Update `deploy/kong.yml` meta service URL from `sita-supabase-rest:3000` to `sita-supabase-meta:8080`

### 2. Self-Hosted Edge Function Runtime

Add `sita-supabase-functions` using `supabase/edge-runtime:v1.54.6` to run all 14 edge functions in self-hosted mode.

- Mount `./supabase/functions` into the container
- Expose on port 9000
- Add Kong route for `/functions/v1/` → `sita-supabase-functions:9000`
- Pass required env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.)

### 3. API Gateway Edge Function Proxy

Add `/api/functions/*` route on the API gateway that proxies to the edge function runtime, so the SPA can call edge functions via the same gateway.

### 4. Configuration Updates

- **kong.yml**: Add `functions-v1` service + route, fix `meta` service URL
- **docker-compose.yml**: Add 2 new services (`sita-supabase-meta`, `sita-supabase-functions`)
- **nginx.conf**: Add `/functions/` proxy location
- **.env.example**: Add edge runtime env vars
- **deploy/api-gateway/server.ts**: Add edge function proxy route

## Files Changed

| File | Change |
|---|---|
| `docker-compose.yml` | Add `sita-supabase-meta` + `sita-supabase-functions` services |
| `deploy/kong.yml` | Fix meta URL, add functions-v1 service/route |
| `deploy/nginx.conf` | Add `/functions/` proxy block |
| `deploy/api-gateway/server.ts` | Add `/api/functions/*` proxy route |
| `.env.example` | Add `EDGE_RUNTIME_*` vars |

## Implementation Order

1. Add pg-meta service to docker-compose.yml
2. Add edge-runtime service to docker-compose.yml
3. Update kong.yml (meta URL fix + functions route)
4. Update nginx.conf with functions proxy
5. Update API gateway with functions proxy route
6. Update .env.example
7. Verify TypeScript compilation

