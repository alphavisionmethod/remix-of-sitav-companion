# RB-020 — Ingress / Edge Routing Failure

> **Subsystem**: `ingress` · **Severity**: high · **Owner**: platform
> **Bounded context**: cloud-control-plane · **Kill switch**: —

## Trigger condition

Ingress (Nginx / Traefik / Kong) returns 5xx to >5% of requests for any
exposed service for >2 minutes, or fails health probe 3+ consecutive times.

## Recovery steps

1. **Identify failing edge layer** — capture the ingress access log and
   confirm which upstream is failing (web-spa, edge-functions, supabase).
2. **Verify upstream health** — call the affected upstream directly,
   bypassing ingress, to isolate ingress-vs-app failure.
3. **Reload routing config** — `nginx -s reload` / `traefik` API reload /
   Kong admin API reload, depending on the active edge layer.
4. **Drain & recycle a single replica** — to clear connection pool /
   cert-cache state without dropping traffic.
5. **Roll back recent edge config change** if issue began at deploy time;
   pair with `RB-009` (Release Rollback) for the upstream.
6. **Open incident** with timeline if recovery exceeds 10 minutes.

## Escalation

- **Operator** for steps 1–4
- **Admin / Cloud Engineering** for steps 5–6

## Rollback

Each step is individually reversible. Step 3 (config reload) is non-
destructive; step 4 (drain) is auto-reversed by the orchestrator.

## Related

- Runbook: [`release-rollback.md`](./release-rollback.md)
- Kill switch: none — ingress is too broad to gate; use route-level kill
  switches (`KS-OUTBOUND`, `KS-CONNECTORS`) to scope blast radius instead.
