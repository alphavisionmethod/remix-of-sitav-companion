# Threat Model: File Ingestion & Storage

## System Description
SITA OS ingests files through a classification pipeline that detects sensitivity, extracts structured data, links to entities, identifies deadlines/obligations, and suggests workflows.

---

## STRIDE Analysis

### S — Spoofing
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Upload file as another user | Critical | Storage policies use `auth.uid()` for folder scoping | Mitigated |
| Fake file classification | Medium | Classification runs server-side; client receives read-only result | Mitigated |

### T — Tampering
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Modify uploaded file after classification | Medium | Files stored immutably; re-upload creates new version | Mitigated |
| Alter extracted data | Medium | `financial_documents.extracted_data` only written by ingestion pipeline | Mitigated |

### I — Information Disclosure
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Access sensitive documents (medical, identity) | Critical | `sensitivity` field enforced; `restricted` docs require re-auth | Mitigated |
| OCR text leakage | Medium | OCR text stored with same RLS as source document | Mitigated |
| Cross-user file access | Critical | RLS: `auth.uid() = user_id` on financial_documents table | Mitigated |

### D — Denial of Service
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Large file upload DoS | Medium | File size limits enforced by storage bucket config | Mitigated |
| Processing pipeline overload | Low | Queue-based processing; backpressure handling | Mitigated |

---

## Sensitivity Levels
| Level | Access Control | Examples |
|-------|---------------|----------|
| `public` | Standard RLS | Receipts, general documents |
| `internal` | Standard RLS | Business contracts, invoices |
| `confidential` | RLS + UI warning | Tax documents, financial statements |
| `restricted` | RLS + re-auth required | Identity documents, medical records, SSN-containing docs |
