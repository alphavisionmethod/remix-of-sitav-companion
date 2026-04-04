

# Implement Missing Docker Infrastructure: API Gateway + Brain Core Servers

## What's Missing

| Item | Status | Impact |
|------|--------|--------|
| `deploy/Dockerfile.api` | Missing | docker-compose build fails for sita-api-gateway |
| `deploy/Dockerfile.brain` | Missing | docker-compose build fails for sita-brain-core |
| API Gateway server code | Missing | No Express/Hono server on port 3000 |
| Brain Core server code | Missing | No standalone server on port 3001 |

The existing `src/lib/services/brain-core/` contains client-side pure functions (council orchestration, model routing, intent parsing). These need to be wrapped behind HTTP endpoints in a standalone Node server.

## Architecture

```text
┌─────────────────┐      ┌──────────────────┐      ┌───────────────────┐
│  sita-web:80    │─────▶│ sita-api-gateway  │─────▶│ sita-brain-core   │
│  (nginx + SPA)  │ /api │    :3000          │ :3001│   (AI orchestr.)  │
└─────────────────┘      │  - /health        │      │  - /health        │
                         │  - /api/intent    │      │  - /brain/intent  │
                         │  - /api/council   │      │  - /brain/council │
                         │  - /api/model     │      │  - /brain/model   │
                         │  - auth middleware│      │  - NATS pub/sub   │
                         │  - Supabase proxy │      │  - Supabase svc   │
                         └──────────────────┘      └───────────────────┘
```

## Files to Create

### 1. `deploy/api-gateway/server.ts` — Hono HTTP server

Lightweight API gateway using Hono (small, fast, TypeScript-native):

- **Health**: `GET /health` returns `{ status, uptime, version }`
- **Auth middleware**: Validates Supabase JWT from `Authorization` header via Supabase GoTrue, attaches `user` to context
- **Brain proxy routes**:
  - `POST /api/intent` → forwards to brain-core `/brain/intent`
  - `POST /api/council` → forwards to brain-core `/brain/council`
  - `POST /api/model/route` → forwards to brain-core `/brain/model/route`
  - `GET /api/model/budget` → forwards to brain-core `/brain/model/budget`
- **Supabase proxy**: `ALL /api/supabase/*` → forwards to Kong at `SUPABASE_URL`
- **CORS**: Configured for `SITE_URL` origin
- **Error handling**: Global error handler returns structured JSON

### 2. `deploy/api-gateway/package.json`

Minimal deps: `hono`, `@hono/node-server`, `@supabase/supabase-js`

### 3. `deploy/api-gateway/tsconfig.json`

Node 20 target, ESM output

### 4. `deploy/Dockerfile.api`

```
FROM node:20-alpine
WORKDIR /app
COPY deploy/api-gateway/package.json ./
RUN npm ci --production
COPY deploy/api-gateway/ ./
RUN npx tsc
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### 5. `deploy/brain-core/server.ts` — Brain Core standalone server

Also Hono-based, wraps the existing pure functions:

- **Health**: `GET /health` returns `{ status, uptime, version, nats_connected }`
- **Intent orchestration**: `POST /brain/intent` — parses input, runs `orchestrateIntent()`, returns plan
- **Council**: `POST /brain/council` — runs `runBusinessCouncil/runFinanceCouncil/runConciergeCouncil`
- **Model routing**: `POST /brain/model/route` — runs `routeModel()` with budget tracking
- **Model budget**: `GET /brain/model/budget` — returns `getModelBudgetStatus()`
- **Advisors**: `POST /brain/advisors` — runs `chooseAdvisors()`
- **Simulation**: `POST /brain/simulation` — runs `buildSimulationRequest()`
- **Approval**: `POST /brain/approval` — runs `buildApprovalPackage()`
- **NATS**: Connects to NATS JetStream for event publishing (intent events, council decisions). Graceful reconnect with backoff.
- **Supabase**: Service-role client for persistence of orchestration results

### 6. `deploy/brain-core/package.json`

Deps: `hono`, `@hono/node-server`, `@supabase/supabase-js`, `nats`

### 7. `deploy/brain-core/tsconfig.json`

Node 20, ESM, paths aliased to import from `src/lib/services/brain-core/`

### 8. `deploy/Dockerfile.brain`

```
FROM node:20-alpine
WORKDIR /app
COPY package.json bun.lock* package-lock.json* ./
RUN npm ci --production --ignore-scripts
COPY deploy/brain-core/package.json deploy/brain-core/
RUN cd deploy/brain-core && npm ci --production
COPY src/lib/services/brain-core/ src/lib/services/brain-core/
COPY deploy/brain-core/ deploy/brain-core/
RUN cd deploy/brain-core && npx tsc
EXPOSE 3001
CMD ["node", "deploy/brain-core/dist/server.js"]
```

### 9. `deploy/nginx.conf` update

Fix proxy hostnames to match docker-compose service names (`sita-api-gateway` instead of `api-gateway`, `sita-supabase-kong` instead of `supabase-kong`).

## Implementation Order

1. Create `deploy/api-gateway/` (package.json, tsconfig, server.ts)
2. Create `deploy/Dockerfile.api`
3. Create `deploy/brain-core/` (package.json, tsconfig, server.ts with NATS + Supabase + all brain endpoints)
4. Create `deploy/Dockerfile.brain`
5. Fix `deploy/nginx.conf` proxy hostnames
6. Verify with `tsc --noEmit` on main project (no regressions)
7. Validate docker-compose config parses correctly

