# Threat Model: Connector Control Plane

## System Description
Connectors integrate SITA OS with external services (email, calendar, banking, CRM). Credentials are encrypted and stored in `connector_credentials`. Sync operations are logged.

---

## STRIDE Analysis

### S — Spoofing
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Use another user's connector credentials | Critical | RLS: `auth.uid() = user_id` on connector_credentials | Mitigated |
| Fake sync results | Medium | Sync logs are insert-only with server timestamp | Mitigated |

### T — Tampering
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Modify connector config to redirect data | High | RLS: only owner can update connector_configs | Mitigated |
| Alter encrypted tokens | High | Tokens encrypted at rest; decryption only in edge functions | Mitigated |

### I — Information Disclosure
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| API key/token exposure in client | Critical | Tokens stored encrypted; never sent to client; used only in edge functions | Mitigated |
| Sync data visible to wrong user | High | All synced data inherits user_id-scoped RLS | Mitigated |

### D — Denial of Service
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Excessive sync frequency | Medium | Sync cooldown enforced; `last_sync_at` checked before new sync | Mitigated |

### E — Elevation of Privilege
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Connector gains broader access than configured | Medium | Capability scoping per connector; principle of least privilege | Mitigated |

---

## Controls
- **Credential Encryption**: OAuth tokens encrypted before storage
- **Freshness Policies**: Configurable staleness thresholds per connector
- **Health Monitoring**: Connector health visible in Mission Control
- **Sync Logging**: Every sync creates an auditable `sync_logs` entry
