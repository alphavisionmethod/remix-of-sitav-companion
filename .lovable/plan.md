

# Beautiful CRM with Easy One-Click Integrations

## What We're Building

Transform the CRM (Customers, Leads, Pipeline pages) with a gorgeous **Integration Hub** that lets users connect external platforms with zero API key hassle — just click, authorize, and sync. Plus a drag-and-drop CSV/Excel importer that maps columns automatically.

## Current State

- CRM pages (Customers, Leads, Opportunities) exist but have no easy import or external platform connection UI
- A `useCRMSync` hook exists calling `crm-sync` edge function for syncing leads/customers/opportunities
- Import/Export Center exists but is generic — not CRM-specific
- No CSV parsing, column mapping, or one-click platform connections in the CRM

## Plan

### Step 1: Create CRM Integration Hub page

Create `src/pages/business/CRMIntegrationHub.tsx` — a beautiful central page for all CRM connections:

- **Hero section**: "Connect your world" with animated gradient background
- **One-click platform cards** grouped by category:
  - **CRM Platforms**: HubSpot, Salesforce, Zoho CRM, Pipedrive, Monday CRM, Close
  - **Marketing**: GoHighLevel (GHL), Mailchimp, ActiveCampaign, ConvertKit
  - **Dev & Project**: GitHub (issues as leads), Linear, Notion, Jira
  - **Communication**: Gmail, Outlook, Slack, WhatsApp Business
  - **Spreadsheets**: Google Sheets (live sync), Excel Online
  - **Social**: Instagram, Facebook Leads, LinkedIn
- Each card shows: icon, name, "Connect" button, sync status, last synced timestamp
- Connected platforms show green badge with record counts

### Step 2: Create smart CSV/Excel importer

Create `src/components/business/CRMImportWizard.tsx` — a 3-step drag-and-drop wizard:

1. **Drop zone**: Drag CSV/XLSX file, auto-detect delimiter and encoding
2. **Smart column mapping**: Auto-match columns (Name, Email, Phone, Company, etc.) with confidence indicators. Users just confirm or drag to remap
3. **Preview & import**: Shows first 5 rows, dedup detection, import button

Uses `Papa Parse` for CSV and `SheetJS` for Excel — both client-side, no upload needed for preview.

### Step 3: Create one-click connect modal

Create `src/components/business/CRMConnectModal.tsx` — unified connection wizard:

- For OAuth platforms (HubSpot, GHL, Google): Single "Authorize" button that opens OAuth popup
- For import-based (GitHub issues, spreadsheets): Simple URL/repo input + "Pull Data" button
- For CSV: Opens the import wizard directly
- Shows what data will sync: contacts, deals, emails, notes
- Progress bar during initial sync
- No API key fields visible — everything behind simple buttons

### Step 4: Add import/connect actions to CRM pages

Update `CustomersPage.tsx`, `LeadsInbox.tsx`, `OpportunitiesCenter.tsx`:
- Add "Import" dropdown button next to existing "Add" button with options: Import CSV, Import from Platform, Sync from Connected
- Empty states show "Connect a platform or import a file to get started" with direct action buttons
- Connected platform badges in the header showing sync status

### Step 5: Add route and navigation

Register `/business/integrations` route. Add "Integrations" item to business sidebar/nav.

## Files

- **Create**: `src/pages/business/CRMIntegrationHub.tsx` (~300 lines — integration hub page)
- **Create**: `src/components/business/CRMImportWizard.tsx` (~250 lines — CSV/Excel smart importer)
- **Create**: `src/components/business/CRMConnectModal.tsx` (~200 lines — one-click connect modal)
- **Edit**: `src/pages/business/CustomersPage.tsx` (add import dropdown, connected badges)
- **Edit**: `src/pages/business/LeadsInbox.tsx` (add import dropdown)
- **Edit**: `src/App.tsx` (add route)

## Technical Details

- CSV parsing uses `papaparse` (already available or lightweight install)
- Excel parsing uses `xlsx`/SheetJS for client-side .xlsx reading
- Column auto-mapping uses string similarity matching (fuzzy match "First Name" → `name`, "E-mail" → `email`, etc.)
- Platform connections are stored via the existing `integration_connections` table
- OAuth flows use placeholder UI (the actual OAuth implementation connects through the connector gateway when real connectors are linked)
- Import wizard writes directly to leads/customers tables via existing `useAction` pattern

