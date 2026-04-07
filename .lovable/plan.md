

# Fix Section 11: Wire 2 Remaining Orphaned Database Tables

## Investigation Results

Of the 24 reported orphaned tables, **22 are already wired** — they use `queryTable("table_name")` or `const TABLE = "table_name"` patterns where the table name is passed as a variable to `.from(table)`. The original audit grep missed these because it searched for literal `.from("table_name")` strings.

### Already wired (22 tables):
- **Via data services** (20): `action_escalations`, `adaptive_interface_profiles`, `boundary_policies`, `cai_continuity_sessions`, `command_orchestrations`, `coordinated_assistant_sessions`, `digest_compilations`, `experience_signature_rules`, `handoff_contexts`, `human_obligations`, `intent_resolutions`, `memory_corrections`, `memory_governance_records`, `operating_modes`, `opportunity_signals`, `personal_operating_graph_edges`, `personal_operating_graph_nodes`, `priority_stacks`, `relationship_contexts`, `timing_intelligence_decisions`
- **Via persistence file** (1): `intelligence_assets_library` — has full CRUD in `src/lib/persistence/intelligence-asset-persistence.ts`
- **Via persistence adapters** (1): `ai_agent_tasks` — has full CRUD in `src/lib/services/database/persistence-adapters.ts`

### Truly orphaned (2 tables):
| Table | Domain | Where to wire |
|-------|--------|---------------|
| `financial_documents` | finance | `money-data-service.ts` |
| `scenarios` | platform | `platform-ops-data-service.ts` |

## Implementation Steps

1. Add `financialDocuments` CRUD export to `src/lib/data-services/money-data-service.ts`
2. Add `scenarios` CRUD export to `src/lib/data-services/platform-ops-data-service.ts`
3. Verify with grep that all 24 tables now have `.from()` or `queryTable()` references — 0 orphans remaining

## Files Changed
- 2 existing files modified (add 1 CRUD export each)

