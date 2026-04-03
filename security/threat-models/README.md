# SITA OS — Security Threat Models

## Overview
This directory contains threat models for every major surface and capability in SITA OS. Each model follows the STRIDE methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).

## Threat Model Index

| Domain | Model | Last Updated |
|--------|-------|-------------|
| Authentication & Identity | [auth-identity.md](./auth-identity.md) | 2026-04-03 |
| Data Access & RLS | [data-access.md](./data-access.md) | 2026-04-03 |
| Advisor & AI Pipeline | [advisor-ai.md](./advisor-ai.md) | 2026-04-03 |
| Payment Execution | [payment-execution.md](./payment-execution.md) | 2026-04-03 |
| File Ingestion & Storage | [file-ingestion.md](./file-ingestion.md) | 2026-04-03 |
| Connector Control Plane | [connectors.md](./connectors.md) | 2026-04-03 |
| Edge Functions | [edge-functions.md](./edge-functions.md) | 2026-04-03 |

## Risk Matrix

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 3 | Mitigated |
| High | 7 | Mitigated |
| Medium | 12 | Accepted with controls |
| Low | 8 | Monitored |
