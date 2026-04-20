# SITA OS — File Ingestion & Knowledge System

## Pipeline

```
Upload → Classify → Extract → Enrich → Index → Route → Notify
```

## Supported Types

| Category | Formats |
|----------|---------|
| Documents | PDF, DOCX, TXT, MD |
| Spreadsheets | XLSX, CSV |
| Images | JPG, PNG (OCR) |
| Receipts | PDF, image (specialized OCR) |
| Statements | PDF (financial parser) |

## Classification

Files auto-classified into:
- Financial (invoice, receipt, statement, tax document)
- Business (contract, proposal, agreement)
- Personal (ID, medical, insurance)
- Household (warranty, manual, membership)
- General (notes, correspondence)

## Sensitive Document Policy

Documents classified as sensitive:
- Tax returns, SSN-containing docs, medical records
- Elevated privacy tier automatically
- Restricted memory scope
- Audit trail for all access
- Redaction in support-safe views

## Knowledge Graph Integration

Extracted entities feed into:
- Entity graph (people, organizations, amounts)
- Timeline events
- Memory service (with privacy tier)
- Cross-domain context (business invoice → finance tracking)

## Proof Model

Every file ingestion generates:
- Upload receipt
- Classification receipt
- Extraction receipt (what was found)
- Routing receipt (where it was sent)
