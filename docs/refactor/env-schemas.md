> ⚠️ **Status: Future Monorepo Target — Aspirational Reference**
> This document describes a post-Lovable monorepo migration design. The current platform remains a **single Vite SPA + Lovable Cloud** deployment. Treat as reference architecture, not current state.

# SITA OS — Per-Plane Environment Schemas

> Required and optional environment variables for each plane.

## Shared Plane
| Variable | Required | Description |
|----------|----------|-------------|
| (none) | — | Pure types/contracts; no runtime env needed |

## Backend Plane
| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Database and auth endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key for server-side operations |
| `SUPABASE_ANON_KEY` | Yes | Anon/publishable key for client-bootstrapped queries |
| `AI_GATEWAY_URL` | Yes | Sovereign AI Gateway inference endpoint |
| `AI_GATEWAY_API_KEY` | Yes | API key for AI inference |
| `REDIS_URL` | No | Cache layer for rate limiting and session store |
| `STRIPE_SECRET_KEY` | No | Billing integration |
| `SHOPIFY_API_KEY` | No | Shopify connector |
| `SHOPIFY_API_SECRET` | No | Shopify connector secret |
| `RESEND_API_KEY` | No | Email delivery |
| `SENTRY_DSN` | No | Error tracking |

## OS Plane
| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Sync engine endpoint |
| `SUPABASE_ANON_KEY` | Yes | Client auth for sync |
| `PUSH_VAPID_PUBLIC_KEY` | No | Web push notifications |
| `PUSH_VAPID_PRIVATE_KEY` | No | Web push server key |
| `ELECTRON_SIGNING_KEY` | No | Desktop app code signing (Electron target) |

## Admin Plane
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Vite-injected backend endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Vite-injected anon key |
| `VITE_ADMIN_API_BASE` | No | Admin BFF API base URL (defaults to Supabase edge functions) |

## Founder Plane
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Vite-injected backend endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Vite-injected anon key |
| `VITE_FOUNDER_API_BASE` | No | Founder BFF API base URL |

## Mobile Plane
| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Backend endpoint |
| `SUPABASE_ANON_KEY` | Yes | Client auth |
| `APNS_KEY_ID` | No | Apple Push Notification Service key ID |
| `APNS_TEAM_ID` | No | Apple developer team ID |
| `FCM_SERVER_KEY` | No | Firebase Cloud Messaging server key |
| `BIOMETRIC_FALLBACK_PIN` | No | Whether to allow PIN fallback for biometric auth |

## Product Plane
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Vite-injected backend endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Vite-injected anon key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | No | Client-side Stripe for checkout |
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth for connectors |

## Internal Tools Plane
| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | No | Optional — for seed scripts targeting real DB |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Optional — for seed scripts |
| `SIMULATION_ITERATIONS` | No | Default iteration count for Monte Carlo (default: 10000) |

## Secret Management Rules

1. **Never commit secrets** — All secrets must be injected via environment variables or secret management
2. **Publishable keys only in client code** — `VITE_*` prefixed variables are safe for browser bundles
3. **Service role keys are server-only** — Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code
4. **Per-environment overrides** — Use `.env.development`, `.env.staging`, `.env.production` files
5. **Edge function secrets** — Configured via Lovable Cloud secrets management, never hardcoded
