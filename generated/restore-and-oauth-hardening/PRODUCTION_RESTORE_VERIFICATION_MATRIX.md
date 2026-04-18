# Post-Restore Verification Matrix

| Dim | Check | Method | Pass criteria |
|---|---|---|---|
| schema | All canonical tables present | pg_tables vs `generated/db-truth/` | 201/201 |
| schema | All canonical functions present | pg_proc vs manifest | 22/22 |
| rls | RLS enabled on all public tables | `rowsecurity = true` | 100% |
| rls | ≥1 policy per table | pg_policies count | 100% |
| data_integrity | Row counts within ±5% | manifest snapshot vs live | All tables |
| data_integrity | No orphan FKs | constraint validation | 0 violations |
| critical_routes | Boardroom load | GET /boardroom + auth | 200 |
| critical_routes | Admin Health load | GET /admin/health + auth | 200 |
| critical_routes | App launcher | GET /apps + auth | 200 |
| critical_routes | (+9 more flagship) | GET … | 12/12 |
| edge_functions | admin-bff-gateway | health probe | 200 |
| edge_functions | agent-executor | health probe | 200 |
| edge_functions | oauth-refresh-probe | health probe | 200 |
| edge_functions | (+3 more) | health probe | 6/6 |
| admin_truth | DB summary RPC | `get_db_truth_snapshot()` | counts match |
| admin_truth | Drill registry visible | DrillCadenceBoard renders | ✅ |

Receipt JSON written to `generated/restore-and-oauth-hardening/post-restore-verification-matrix.json` after each drill.
