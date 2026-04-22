# SITA OS — Demo Reference Scan Report

**Generated:** 2026-04-22T16:07:58.274Z
**Total files scanned:** 1096
**Files with references:** 282
**Total isDemoMode refs:** 217
**Total DEMO_ const refs:** 1503

---

## `/dev-server/src/pages/ActivityStream.tsx` (1 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 25 | DEMO_ACTIVITY_TIMELINE | import | `import { DEMO_ACTIVITY_TIMELINE } from "@/data/fixtures/demo-data";` |

## `/dev-server/src/pages/ApprovalsCenter.tsx` (6 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 19 | declaration | `const isDemoMode = isDemo;` |
| 39 | usage | `if (isDemoMode) return;` |
| 44 | usage | `if (isDemoMode) return;` |
| 65 | usage | `<div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDemoMode ? "bg-amber-500/10 ` |
| 66 | usage | `<div className={`h-2 w-2 rounded-full ${isDemoMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />` |
| 67 | usage | `{isDemoMode ? "Demo" : "Live"}` |

## `/dev-server/src/pages/AutomationCenter.tsx` (1 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 25 | declaration | `const isDemoMode = false;` |

## `/dev-server/src/pages/Boardroom.tsx` (23 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 214 | declaration | `const isDemoMode = isDemo;` |
| 216 | usage | `if (!isDemoMode) {` |
| 282 | declaration | `const isDemoMode = isDemo;` |
| 283 | usage | `if (!isDemoMode) return null;` |
| 318 | declaration | `const isDemoMode = isDemo;` |
| 319 | usage | `if (!isDemoMode) return null;` |
| 386 | declaration | `const isDemoMode = isDemo;` |
| 387 | usage | `if (!isDemoMode) return null;` |
| 619 | declaration | `const isDemoMode = isDemo;` |
| 779 | usage | `{(isDemoMode \|\| hasRecommendations) ? (` |
| 782 | usage | `isDemoMode` |
| 806 | usage | `{isDemoMode && mockSynthesis.some(s => s.disagreements?.length) ? (` |
| 825 | usage | `) : !isDemoMode && hasDisagreementData ? (` |
| 855 | usage | `) : !isDemoMode && (` |
| 864 | usage | `{isDemoMode ? (` |
| 884 | usage | `{isDemoMode ? (` |
| 904 | usage | `{isDemoMode ? (` |
| 936 | usage | `{isDemoMode ? (` |
| 958 | usage | `{isDemoMode ? (` |
| 983 | usage | `{(isDemoMode \|\| hasRecommendations) ? (` |
| 989 | usage | `isDemoMode` |
| 1036 | usage | `})) : isDemoMode ? [` |
| 1268 | declaration | `const isDemoMode = isDemo;` |

## `/dev-server/src/pages/CommandHistory.tsx` (2 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 42 | usage | `const { isDemoMode } = useDataMode();` |
| 46 | usage | `const filtered = (isDemoMode ? MOCK_HISTORY : [] as typeof MOCK_HISTORY).filter(r => {` |

## `/dev-server/src/pages/CommunicationsPage.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 35 | DEMO_FOLLOW_UPS | declaration | `const DEMO_FOLLOW_UPS = [` |
| 42 | DEMO_DRAFTS | declaration | `const DEMO_DRAFTS = [` |
| 87 | DEMO_FOLLOW_UPS | usage | `followUpRisks: ([] as typeof DEMO_FOLLOW_UPS).filter(f => f.urgency === "high").length,` |
| 88 | DEMO_DRAFTS | usage | `draftsWaiting: ([] as typeof DEMO_DRAFTS).length,` |
| 170 | DEMO_FOLLOW_UPS | usage | `{([] as typeof DEMO_FOLLOW_UPS).filter(f => f.urgency !== "low").map(f => (` |
| 261 | DEMO_FOLLOW_UPS | usage | `{([] as typeof DEMO_FOLLOW_UPS).map(f => {` |
| 290 | DEMO_DRAFTS | usage | `{([] as typeof DEMO_DRAFTS).map(d => (` |

## `/dev-server/src/pages/CustomerDetail.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 12 | DEMO_ACTIONS | import | `import { DEMO_ACTIONS, DEMO_CUSTOMERS_DATA, DEMO_DOCUMENTS } from "@/data/seed/core-pages";` |
| 16 | DEMO_TIMELINE | declaration | `const DEMO_TIMELINE: any[] = [];` |
| 26 | DEMO_CUSTOMERS_DATA | usage | `const customer = DEMO_CUSTOMERS_DATA[id \|\| "marcus-johnson"] \|\| DEMO_CUSTOMERS_DATA["marcus-johnson"];` |
| 105 | DEMO_ACTIONS | usage | `<SitaSectionHeader title="Action Queue" subtitle={`${([] as typeof DEMO_ACTIONS).length} items pending`} />` |
| 106 | DEMO_ACTIONS | usage | `{([] as typeof DEMO_ACTIONS).map((a, i) => (` |
| 129 | DEMO_TIMELINE | usage | `{([] as typeof DEMO_TIMELINE).slice(0, 4).map((t, i) => (` |
| 181 | DEMO_TIMELINE | usage | `{([] as typeof DEMO_TIMELINE).map((t, i) => <TimelineItem key={i} {...t} />)}` |
| 224 | DEMO_DOCUMENTS | usage | `{([] as typeof DEMO_DOCUMENTS).map((doc, i) => (` |

## `/dev-server/src/pages/DailyPulse.tsx` (4 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 77 | declaration | `const isDemoMode = isDemo;` |
| 86 | usage | `if (!user \|\| isDemoMode \|\| isLoading) return;` |
| 139 | usage | `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />` |
| 144 | usage | `subtitle={isDemoMode` |

## `/dev-server/src/pages/DocumentEditor.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 34 | DEMO_VERSIONS | declaration | `const DEMO_VERSIONS = [` |
| 247 | DEMO_VERSIONS | usage | `{([] as typeof DEMO_VERSIONS).map(v => (` |

## `/dev-server/src/pages/EnvironmentSwitcher.tsx` (2 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 43 | usage | `const { isDemoMode } = useDataMode();` |
| 57 | usage | `{(isDemoMode ? MOCK_ENVIRONMENTS : [] as typeof MOCK_ENVIRONMENTS).map(env => (` |

## `/dev-server/src/pages/GlobalBoardroom.tsx` (6 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 29 | declaration | `const isDemoMode = isDemo;` |
| 44 | usage | `if (!user \|\| isDemoMode) return;` |
| 56 | usage | `}, [user?.id, isDemoMode, leads.length, customers.length, invoices.length]);` |
| 69 | usage | `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />` |
| 195 | usage | `status={isDemoMode ? "pending" : "verified"}` |
| 197 | usage | `{ label: "Business data sourced", verified: !isDemoMode },` |

## `/dev-server/src/pages/GovernanceDashboard.tsx` (4 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 23 | declaration | `const isDemoMode = isDemo;` |
| 57 | usage | `isDemoMode ? "bg-accent/10 text-accent border-accent/20" : "bg-primary/10 text-primary border-primary/20"` |
| 59 | usage | `<div className={cn("h-2 w-2 rounded-full", isDemoMode ? "bg-accent animate-pulse" : "bg-primary")} />` |
| 60 | usage | `{isDemoMode ? "Demo Data" : "Live"}` |

## `/dev-server/src/pages/InboxCapture.tsx` (1 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 37 | declaration | `const isDemoMode = false;` |

## `/dev-server/src/pages/IntegrationConcierge.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 21 | DEMO_CATEGORIES | declaration | `const DEMO_CATEGORIES: any[] = [];` |
| 24 | DEMO_BUNDLES | declaration | `const DEMO_BUNDLES: any[] = [];` |
| 236 | DEMO_BUNDLES | usage | `function BundleCard({ bundle, onSelect }: { bundle: typeof DEMO_BUNDLES[0]; onSelect: () => void }) {` |
| 356 | DEMO_CATEGORIES | usage | `{([] as unknown as typeof DEMO_CATEGORIES).map(cat => (` |
| 381 | DEMO_BUNDLES | usage | `{([] as typeof DEMO_BUNDLES).map(b => (` |

## `/dev-server/src/pages/MediaWorkspace.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 26 | DEMO_MEDIA | import | `import { type DemoMediaItem as MediaItem, DEMO_MEDIA } from "@/data/seed/media";` |
| 59 | DEMO_MEDIA | usage | `const media = (liveMedia?.length ? liveMedia : DEMO_MEDIA);` |

## `/dev-server/src/pages/MyActivity.tsx` (5 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 43 | usage | `const { isDemoMode } = useDataMode();` |
| 87 | usage | `const { isDemoMode } = useDataMode();` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_DAY_LABELS | import | `import { DEMO_DAY_LABELS, DEMO_FEATURES } from "@/data/seed/core-pages";` |
| 57 | DEMO_DAY_LABELS | usage | `{([] as typeof DEMO_DAY_LABELS).map((l, i) => (` |
| 190 | DEMO_FEATURES | usage | `{([] as typeof DEMO_FEATURES).map((f) => {` |

## `/dev-server/src/pages/NotesWorkspace.tsx` (3 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 60 | declaration | `const isDemoMode = false;` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 51 | DEMO_LINKED_ENTITIES | declaration | `const DEMO_LINKED_ENTITIES = [` |
| 288 | DEMO_LINKED_ENTITIES | usage | `{([] as typeof DEMO_LINKED_ENTITIES).map((ent, i) => (` |

## `/dev-server/src/pages/NotificationCenter.tsx` (6 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 139 | declaration | `const isDemoMode = isDemo;` |
| 155 | usage | `enabled: !!user && !isDemoMode,` |
| 169 | usage | `enabled: !!user && !isDemoMode,` |
| 185 | usage | `if (isDemoMode) {` |
| 195 | usage | `}, [notifications, legacyNotifs, isDemoMode]);` |
| 299 | usage | `{isLoading && !isDemoMode ? (` |

## `/dev-server/src/pages/OwnerCenter.tsx` (12 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 220 | usage | `const { isDemoMode } = useDataMode();` |
| 341 | usage | `<div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${isDemoMode ? "b` |
| 342 | usage | `<div className={`h-2 w-2 rounded-full ${isDemoMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />` |
| 343 | usage | `{isDemoMode ? "Demo Mode" : "Live Mode"}` |
| 491 | usage | `<div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDemoMode ? "bg-amber-500/10" : "bg-emerald-50` |
| 492 | usage | `{isDemoMode ? <CloudOff className="h-5 w-5 text-amber-500" /> : <Cloud className="h-5 w-5 text-emerald-500" />}` |
| 496 | usage | `<p className="text-[10px] text-muted-foreground">{isDemoMode ? "Sample data" : "Live connections"}</p>` |
| 499 | usage | `<Switch checked={!isDemoMode} onCheckedChange={toggleMode} />` |
| 1718 | usage | `<p className="text-xs text-muted-foreground mt-0.5">{isDemoMode ? "Simulated status (Demo)" : "Real connector status (Li` |
| 2395 | usage | `if (isDemoMode) {` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 22 | DEMO_ENGINE_COSTS | import | `import { DEMO_ENGINE_COSTS } from "@/data/seed/core-pages";` |
| 1772 | DEMO_ENGINE_COSTS | usage | `{([] as typeof DEMO_ENGINE_COSTS).map((c, i) => (` |

## `/dev-server/src/pages/PolicyEditor.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 19 | DEMO_CATEGORIES | declaration | `const DEMO_CATEGORIES: any[] = [];` |
| 74 | DEMO_CATEGORIES | usage | `tabs={[{ key: "all", label: "All", count: policies.length }, ...([] as typeof DEMO_CATEGORIES).map(c => ({ key: c, label` |
| 85 | DEMO_CATEGORIES | usage | `{([] as typeof DEMO_CATEGORIES).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}` |

## `/dev-server/src/pages/ProductivityHub.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_RECENT_DOCS | import | `import { DEMO_RECENT_DOCS } from "@/data/seed/core-pages";` |
| 57 | DEMO_RECENT_DOCS | usage | `{([] as typeof DEMO_RECENT_DOCS).map(doc => (` |

## `/dev-server/src/pages/ProofCenter.tsx` (5 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 164 | declaration | `const isDemoMode = isDemo;` |
| 173 | usage | `enabled: !!user && !isDemoMode,` |
| 217 | usage | `isDemoMode ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border bo` |
| 219 | usage | `<div className={cn("h-2 w-2 rounded-full", isDemoMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />` |
| 220 | usage | `{isDemoMode ? "Demo" : "Live"}` |

## `/dev-server/src/pages/ReportingWorkspace.tsx` (14 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 53 | declaration | `const isDemoMode = false;` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 27 | DEMO_COMPLETION_TREND | import | `import { DEMO_COMPLETION_TREND, DEMO_DOMAIN_BREAKDOWN, DEMO_PIPELINE_DATA, DEMO_REVENUE_DATA } from "@/data/seed/core-pa` |
| 33 | DEMO_SAVED_REPORTS | declaration | `const DEMO_SAVED_REPORTS = [` |
| 42 | DEMO_TRUST_DATA | declaration | `const DEMO_TRUST_DATA = [` |
| 148 | DEMO_REVENUE_DATA | usage | `<AreaChart data={DEMO_REVENUE_DATA}>` |
| 173 | DEMO_DOMAIN_BREAKDOWN | usage | `<Pie data={DEMO_DOMAIN_BREAKDOWN} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} s` |
| 174 | DEMO_DOMAIN_BREAKDOWN | usage | `{([] as typeof DEMO_DOMAIN_BREAKDOWN).map((entry, i) => <Cell key={i} fill={entry.color} />)}` |
| 179 | DEMO_DOMAIN_BREAKDOWN | usage | `{([] as typeof DEMO_DOMAIN_BREAKDOWN).map(d => (` |
| 198 | DEMO_COMPLETION_TREND | usage | `<LineChart data={DEMO_COMPLETION_TREND}>` |
| 218 | DEMO_REVENUE_DATA | usage | `<BarChart data={DEMO_REVENUE_DATA}>` |
| 237 | DEMO_PIPELINE_DATA | usage | `<BarChart data={DEMO_PIPELINE_DATA} layout="vertical">` |
| 272 | DEMO_COMPLETION_TREND | usage | `<LineChart data={DEMO_COMPLETION_TREND}>` |
| 308 | DEMO_TRUST_DATA | usage | `<BarChart data={DEMO_TRUST_DATA}>` |
| 332 | DEMO_SAVED_REPORTS | usage | `{([] as typeof DEMO_SAVED_REPORTS).map(r => (` |

## `/dev-server/src/pages/RevenueCallingPage.tsx` (9 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 99 | declaration | `const isDemoMode = isDemo;` |
| 113 | usage | `const script = isDemoMode ? ((isDemoMode ? MOCK_SCRIPTS : [] as typeof MOCK_SCRIPTS).find(s => s.stage === contact.stage` |
| 249 | declaration | `const isDemoMode = isDemo;` |
| 261 | usage | `if (isDemoMode) return MOCK_CONTACTS;` |
| 276 | usage | `}, [isDemoMode, liveContacts]);` |
| 279 | usage | `if (isDemoMode) return MOCK_CALL_LOGS;` |
| 295 | usage | `}, [isDemoMode, liveLogs]);` |
| 482 | usage | `{!isDemoMode ? (` |
| 488 | usage | `) : (isDemoMode ? MOCK_SCRIPTS : [] as typeof MOCK_SCRIPTS).map(script => (` |

## `/dev-server/src/pages/SovereignExportPage.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 12 | DEMO_EXPORTABLE_TABLES | import | `import { DEMO_EXPORTABLE_TABLES, DEMO_PAST_EXPORTS } from "@/data/seed/core-pages";` |
| 17 | DEMO_EXPORTABLE_TABLES | usage | `const [selectedTables, setSelectedTables] = useState<string[]>(([] as typeof DEMO_EXPORTABLE_TABLES).map(t => t.name));` |
| 116 | DEMO_EXPORTABLE_TABLES | usage | `selectedTables.length === ([] as typeof DEMO_EXPORTABLE_TABLES).length ? [] : ([] as typeof DEMO_EXPORTABLE_TABLES).map(` |
| 117 | DEMO_EXPORTABLE_TABLES | usage | `)}>{selectedTables.length === ([] as typeof DEMO_EXPORTABLE_TABLES).length ? "Deselect All" : "Select All"}</Button>` |
| 120 | DEMO_EXPORTABLE_TABLES | usage | `{([] as typeof DEMO_EXPORTABLE_TABLES).map(table => (` |
| 142 | DEMO_PAST_EXPORTS | usage | `{([] as typeof DEMO_PAST_EXPORTS).map(exp => (` |

## `/dev-server/src/pages/SpilloverDashboard.tsx` (15 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 30 | usage | `const { isDemoMode } = useDataMode();` |
| 74 | usage | `const { isDemoMode } = useDataMode();` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 17 | DEMO_ACTIVE_SPILLOVERS | import | `import { DEMO_ACTIVE_SPILLOVERS, DEMO_TOP_INTERVENTIONS } from "@/data/seed/core-pages";` |
| 23 | DEMO_DOMAINS | declaration | `const DEMO_DOMAINS: any[] = [];` |
| 35 | DEMO_ACTIVE_SPILLOVERS | usage | `{([] as typeof DEMO_ACTIVE_SPILLOVERS).map((s, i) => {` |
| 36 | DEMO_DOMAINS | usage | `const from = ([] as typeof DEMO_DOMAINS).find(d => d.id === s.from);` |
| 37 | DEMO_DOMAINS | usage | `const to = ([] as typeof DEMO_DOMAINS).find(d => d.id === s.to);` |
| 54 | DEMO_DOMAINS | usage | `{([] as typeof DEMO_DOMAINS).map(d => (` |
| 75 | DEMO_ACTIVE_SPILLOVERS | usage | `const highCount = ([] as typeof DEMO_ACTIVE_SPILLOVERS).filter(s => s.impact === "high").length;` |
| 76 | DEMO_ACTIVE_SPILLOVERS | usage | `const medCount = ([] as typeof DEMO_ACTIVE_SPILLOVERS).filter(s => s.impact === "medium").length;` |
| 95 | DEMO_ACTIVE_SPILLOVERS | usage | `<KPITile label="Active Spillovers" value={([] as typeof DEMO_ACTIVE_SPILLOVERS).length} trend="down" icon={ArrowLeftRigh` |
| 98 | DEMO_TOP_INTERVENTIONS | usage | `<KPITile label="Interventions Ready" value={([] as typeof DEMO_TOP_INTERVENTIONS).length} trend="up" icon={Sparkles} sub` |
| 133 | DEMO_ACTIVE_SPILLOVERS | usage | `{([] as typeof DEMO_ACTIVE_SPILLOVERS).map((s, i) => (` |
| 144 | DEMO_TOP_INTERVENTIONS | usage | `{([] as typeof DEMO_TOP_INTERVENTIONS).map((intervention, i) => (` |
| 151 | DEMO_ACTIVE_SPILLOVERS | usage | `{([] as typeof DEMO_ACTIVE_SPILLOVERS).map((s, i) => (` |

## `/dev-server/src/pages/SystemStatus.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 28 | DEMO_ENGINE_CONNECTORS | import | `import { DEMO_ENGINE_CONNECTORS, DEMO_FALLBACK_APPROVALS } from "@/data/seed/core-pages";` |
| 168 | DEMO_ENGINE_CONNECTORS | usage | `const connectors = DEMO_ENGINE_CONNECTORS;` |
| 285 | DEMO_FALLBACK_APPROVALS | usage | `{([] as typeof DEMO_FALLBACK_APPROVALS).map((a, i) => (` |
| 696 | DEMO_FALLBACK_APPROVALS | usage | `{[...([] as typeof DEMO_FALLBACK_APPROVALS).map((a, i) => ({` |
| 731 | DEMO_FALLBACK_APPROVALS | usage | `<span>{([] as typeof DEMO_FALLBACK_APPROVALS).length} approvals</span>` |

## `/dev-server/src/pages/TasksWorkflowsCenter.tsx` (1 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 51 | DEMO_TASKS | declaration | `const DEMO_TASKS: DemoTask[] = [` |

## `/dev-server/src/pages/TrustCenter.tsx` (3 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 65 | declaration | `const isDemoMode = isDemo;` |
| 92 | usage | `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />` |
| 200 | declaration | `const isDemoMode = isDemo;` |

## `/dev-server/src/pages/__tests__/Boardroom.test.tsx` (1 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 24 | usage | `useDataMode: () => ({ isDemoMode: true, toggleMode: vi.fn() }),` |

## `/dev-server/src/pages/__tests__/BusinessCenter.test.tsx` (1 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 22 | usage | `useDataMode: () => ({ isDemoMode: true, toggleMode: vi.fn() }),` |

## `/dev-server/src/pages/__tests__/DailyPulse.test.tsx` (1 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 20 | usage | `useDataMode: () => ({ isDemoMode: true, toggleMode: vi.fn() }),` |

## `/dev-server/src/pages/__tests__/MoneyCenter.test.tsx` (1 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 22 | usage | `useDataMode: () => ({ isDemoMode: true, toggleMode: vi.fn() }),` |

## `/dev-server/src/pages/__tests__/SettingsPage.test.tsx` (1 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 23 | usage | `useDataMode: () => ({ isDemoMode: true, toggleMode: vi.fn() }),` |

## `/dev-server/src/pages/admin/AIAgentDebate.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_DEBATES | import | `import { DEMO_DEBATES } from "@/data/seed/admin-platform";` |
| 18 | DEMO_DEBATES | usage | `const { data: debates, isDemo } = useAIEngDomain("debates", DEMO_DEBATES);` |

## `/dev-server/src/pages/admin/AIApprovalDesk.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_APPROVALS | import | `import { DEMO_APPROVALS } from "@/data/seed/admin-platform";` |
| 14 | DEMO_APPROVALS | usage | `const { data: approvals, isDemo } = useAIEngDomain("approvals", DEMO_APPROVALS);` |
| 15 | DEMO_APPROVALS | usage | `const items = approvals as typeof DEMO_APPROVALS;` |

## `/dev-server/src/pages/admin/AIChangePlanViewer.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_PLANS | import | `import { DEMO_PLANS } from "@/data/seed/admin-platform";` |
| 21 | DEMO_PLANS | usage | `const { data: plans, isDemo } = useAIEngDomain("changePlans", DEMO_PLANS);` |

## `/dev-server/src/pages/admin/AIDesignDiffTheater.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_DIFFS | declaration | `const DEMO_DIFFS: any[] = [];` |
| 14 | DEMO_DIFFS | usage | `const { data: diffs, isDemo } = useAIEngDomain("designDiffs", DEMO_DIFFS);` |

## `/dev-server/src/pages/admin/AIDesignStudio.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_IMPROVEMENTS | import | `import { DEMO_IMPROVEMENTS } from "@/data/seed/admin-platform";` |
| 20 | DEMO_IMPROVEMENTS | usage | `const { data: improvements, isDemo } = useAIEngDomain("designDiffs", DEMO_IMPROVEMENTS);` |

## `/dev-server/src/pages/admin/AIEngineeringBoard.tsx` (21 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 18 | DEMO_ADMIN_ENVIRONMENTS | import | `import { DEMO_ADMIN_ENVIRONMENTS as DEMO_ENVIRONMENTS,` |
| 19 | DEMO_ADMIN_MISSIONS | usage | `DEMO_ADMIN_MISSIONS as DEMO_MISSIONS,` |
| 20 | DEMO_ADMIN_RELEASE_GATES | usage | `DEMO_ADMIN_RELEASE_GATES as DEMO_RELEASE_GATES,` |
| 21 | DEMO_AGENT_SIGNALS | usage | `DEMO_AGENT_SIGNALS,` |
| 22 | DEMO_ATTENTION_ITEMS | usage | `DEMO_ATTENTION_ITEMS,` |
| 23 | DEMO_CHANGES | usage | `DEMO_CHANGES,` |
| 24 | DEMO_LEARNING_HIGHLIGHTS | usage | `DEMO_LEARNING_HIGHLIGHTS,` |
| 25 | DEMO_OVERVIEW_BAND | usage | `DEMO_OVERVIEW_BAND,` |
| 26 | DEMO_RECENT_HEALS | usage | `DEMO_RECENT_HEALS,` |
| 45 | DEMO_MISSIONS | usage | `missions: DEMO_MISSIONS,` |
| 140 | DEMO_OVERVIEW_BAND | usage | `{([] as typeof DEMO_OVERVIEW_BAND).map(c => (` |
| 168 | DEMO_ATTENTION_ITEMS | usage | `<AlertTriangle className="h-4 w-4" /> Needs Attention ({([] as typeof DEMO_ATTENTION_ITEMS).length})` |
| 171 | DEMO_ATTENTION_ITEMS | usage | `{([] as typeof DEMO_ATTENTION_ITEMS).map((item, i) => (` |
| 233 | DEMO_RECENT_HEALS | usage | `{([] as typeof DEMO_RECENT_HEALS).map((h, i) => (` |
| 250 | DEMO_LEARNING_HIGHLIGHTS | usage | `{([] as typeof DEMO_LEARNING_HIGHLIGHTS).map((l, i) => (` |
| 267 | DEMO_CHANGES | usage | `{([] as typeof DEMO_CHANGES).slice(0, 6).map((a, i) => (` |
| 284 | DEMO_AGENT_SIGNALS | usage | `<p className="text-sm text-muted-foreground">{([] as typeof DEMO_AGENT_SIGNALS).length} specialists · {([] as typeof DEM` |
| 288 | DEMO_AGENT_SIGNALS | usage | `{([] as typeof DEMO_AGENT_SIGNALS).map(t => (` |
| 382 | DEMO_RECENT_HEALS | usage | `{([] as typeof DEMO_RECENT_HEALS).map((h, i) => (` |
| 398 | DEMO_ENVIRONMENTS | usage | `{([] as typeof DEMO_ENVIRONMENTS).map(e => (` |
| 415 | DEMO_RELEASE_GATES | usage | `{([] as typeof DEMO_RELEASE_GATES).map(g => (` |

## `/dev-server/src/pages/admin/AIEvidenceBundleComposer.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_BUNDLE_ITEMS | import | `import { DEMO_BUNDLE_ITEMS, DEMO_EXPORT_MODES } from "@/data/seed/admin-platform";` |
| 22 | DEMO_BUNDLE_ITEMS | usage | `const { isDemo } = useAIEngDomain("missions", DEMO_BUNDLE_ITEMS);` |
| 24 | DEMO_BUNDLE_ITEMS | usage | `const [selectedItems, setSelectedItems] = useState<string[]>(([] as typeof DEMO_BUNDLE_ITEMS).map(b => b.id));` |
| 31 | DEMO_BUNDLE_ITEMS | usage | `const selected = ([] as typeof DEMO_BUNDLE_ITEMS).filter(b => selectedItems.includes(b.id));` |
| 67 | DEMO_EXPORT_MODES | usage | `{([] as typeof DEMO_EXPORT_MODES).map(m => (` |
| 87 | DEMO_BUNDLE_ITEMS | usage | `{([] as typeof DEMO_BUNDLE_ITEMS).map(b => (` |
| 234 | DEMO_EXPORT_MODES | usage | `<p>Format: <strong className="text-foreground">{([] as typeof DEMO_EXPORT_MODES).find(m => m.mode === selectedMode)?.lab` |
| 270 | DEMO_EXPORT_MODES | usage | `<Download className="h-3 w-3 mr-1" /> Download {([] as typeof DEMO_EXPORT_MODES).find(m => m.mode === selectedMode)?.lab` |

## `/dev-server/src/pages/admin/AIFixCenter.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_FIXES | import | `import { DEMO_FIXES } from "@/data/seed/admin-platform";` |
| 27 | DEMO_FIXES | usage | `const { data: fixes, isDemo } = useAIEngDomain("fixes", DEMO_FIXES);` |

## `/dev-server/src/pages/admin/AIHumanBoundaryControls.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_AGENT_BOUNDARIES | import | `import { DEMO_AGENT_BOUNDARIES, DEMO_CHANGE_TYPE_BOUNDARIES, DEMO_MISSION_BOUNDARIES } from "@/data/seed/admin-platform"` |
| 43 | DEMO_AGENT_BOUNDARIES | usage | `const { isDemo } = useAIEngDomain("selfHealingRules", DEMO_AGENT_BOUNDARIES);` |
| 68 | DEMO_AGENT_BOUNDARIES | usage | `{([] as typeof DEMO_AGENT_BOUNDARIES).map(a => {` |
| 87 | DEMO_MISSION_BOUNDARIES | usage | `{([] as typeof DEMO_MISSION_BOUNDARIES).map(m => {` |
| 115 | DEMO_CHANGE_TYPE_BOUNDARIES | usage | `<tbody>{([] as typeof DEMO_CHANGE_TYPE_BOUNDARIES).map(c => {` |

## `/dev-server/src/pages/admin/AILearningCenter.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_CALIBRATION | import | `import { DEMO_CALIBRATION } from "@/data/seed/admin-platform";` |
| 11 | DEMO_PATTERNS | declaration | `const DEMO_PATTERNS: any[] = [];` |
| 14 | DEMO_OUTCOMES | declaration | `const DEMO_OUTCOMES: any[] = [];` |
| 17 | DEMO_PATTERNS | usage | `const { data: patterns, isDemo } = useAIEngDomain("learningPatterns", DEMO_PATTERNS);` |
| 28 | DEMO_OUTCOMES | usage | `{ l: "Recommendations Tracked", v: ([] as typeof DEMO_OUTCOMES).length },` |
| 29 | DEMO_CALIBRATION | usage | `{ l: "Avg Agent Accuracy", v: `${Math.round(([] as typeof DEMO_CALIBRATION).reduce((a,c) => a + c.accuracy, 0) / ([] as ` |
| 63 | DEMO_OUTCOMES | usage | `{([] as typeof DEMO_OUTCOMES).map((o, i) => (` |
| 81 | DEMO_CALIBRATION | usage | `{([] as typeof DEMO_CALIBRATION).map((c, i) => (` |

## `/dev-server/src/pages/admin/AIMissionCenter.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 12 | DEMO_MISSIONS | declaration | `const DEMO_MISSIONS: any[] = [];` |
| 32 | DEMO_MISSIONS | usage | `const { data: missions, isDemo } = useAIEngDomain("missions", DEMO_MISSIONS);` |

## `/dev-server/src/pages/admin/AIReleasesCenter.tsx` (16 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_PROMOTION_EVIDENCE | import | `import { DEMO_PROMOTION_EVIDENCE, DEMO_ROLLBACK_OPTIONS, DEMO_ROLLOUT_HISTORY } from "@/data/seed/admin-platform";` |
| 11 | DEMO_RELEASE_GATES | declaration | `const DEMO_RELEASE_GATES: any[] = [];` |
| 14 | DEMO_ENVIRONMENTS | declaration | `const DEMO_ENVIRONMENTS: any[] = [];` |
| 17 | DEMO_RELEASE_GATES | usage | `const { isDemo } = useAIEngDomain("efficiencyScores", DEMO_RELEASE_GATES);` |
| 20 | DEMO_RELEASE_GATES | usage | `const passCount = ([] as typeof DEMO_RELEASE_GATES).filter(g => g.status === "pass").length;` |
| 21 | DEMO_RELEASE_GATES | usage | `const totalRequired = ([] as typeof DEMO_RELEASE_GATES).filter(g => g.required).length;` |
| 22 | DEMO_RELEASE_GATES | usage | `const requiredPass = ([] as typeof DEMO_RELEASE_GATES).filter(g => g.required && g.status === "pass").length;` |
| 30 | DEMO_RELEASE_GATES | usage | `{ l: "Gates Passing", v: `${passCount}/${([] as typeof DEMO_RELEASE_GATES).length}`, c: passCount === ([] as typeof DEMO` |
| 53 | DEMO_RELEASE_GATES | usage | `{([] as typeof DEMO_RELEASE_GATES).map(g => (` |
| 73 | DEMO_ENVIRONMENTS | usage | `{([] as typeof DEMO_ENVIRONMENTS).map(e => (` |
| 97 | DEMO_ROLLOUT_HISTORY | usage | `<tbody>{([] as typeof DEMO_ROLLOUT_HISTORY).map(r => (` |
| 113 | DEMO_ROLLBACK_OPTIONS | usage | `{([] as typeof DEMO_ROLLBACK_OPTIONS).map(r => (` |
| 134 | DEMO_PROMOTION_EVIDENCE | usage | `{([] as typeof DEMO_PROMOTION_EVIDENCE).map((p, i) => (` |
| 143 | DEMO_PROMOTION_EVIDENCE | usage | `<div className={`rounded-xl border p-4 text-center ${([] as typeof DEMO_PROMOTION_EVIDENCE).every(p => p.met) ? "border-` |
| 144 | DEMO_PROMOTION_EVIDENCE | usage | `<p className={`text-sm font-semibold ${([] as typeof DEMO_PROMOTION_EVIDENCE).every(p => p.met) ? "text-[hsl(var(--trust` |
| 145 | DEMO_PROMOTION_EVIDENCE | usage | `{([] as typeof DEMO_PROMOTION_EVIDENCE).every(p => p.met) ? "✓ Ready to promote" : `⚠ ${([] as typeof DEMO_PROMOTION_EVI` |

## `/dev-server/src/pages/admin/AIRootCauseGraph.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_GRAPH_EDGES | import | `import { DEMO_GRAPH_EDGES, DEMO_GRAPH_NODES } from "@/data/seed/admin-platform";` |
| 18 | DEMO_GRAPH_NODES | usage | `const { isDemo } = useAIEngDomain("violations", DEMO_GRAPH_NODES);` |
| 20 | DEMO_GRAPH_NODES | usage | `const selected = ([] as typeof DEMO_GRAPH_NODES).find(n => n.id === selectedNode);` |
| 21 | DEMO_GRAPH_EDGES | usage | `const connectedEdges = ([] as typeof DEMO_GRAPH_EDGES).filter(e => e.from === selectedNode \|\| e.to === selectedNode);` |
| 32 | DEMO_GRAPH_NODES | usage | `const nodes = ([] as typeof DEMO_GRAPH_NODES).filter(n => n.type === type);` |
| 81 | DEMO_GRAPH_NODES | usage | `const other = ([] as typeof DEMO_GRAPH_NODES).find(n => n.id === (e.from === selectedNode ? e.to : e.from));` |

## `/dev-server/src/pages/admin/AIRuntimeStatus.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_AI_FEATURES | import | `import { DEMO_AI_FEATURES } from "@/data/seed/admin-platform";` |
| 162 | DEMO_AI_FEATURES | usage | `{([] as typeof DEMO_AI_FEATURES).map((feature) => {` |

## `/dev-server/src/pages/admin/AISelfHealing.tsx` (10 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_BLOCKED | import | `import { DEMO_BLOCKED, DEMO_HEALED } from "@/data/seed/admin-platform";` |
| 11 | DEMO_RULES | declaration | `const DEMO_RULES: any[] = [];` |
| 14 | DEMO_PATTERNS | declaration | `const DEMO_PATTERNS: any[] = [];` |
| 17 | DEMO_PATTERNS | usage | `const { data: patterns, isDemo } = useAIEngDomain("learningPatterns", DEMO_PATTERNS);` |
| 26 | DEMO_HEALED | usage | `{ l: "Healed This Week", v: ([] as typeof DEMO_HEALED).length, c: "text-[hsl(var(--trust-safe))]" },` |
| 27 | DEMO_RULES | usage | `{ l: "Active Rules", v: ([] as typeof DEMO_RULES).filter(r => r.enabled).length, c: "text-primary" },` |
| 28 | DEMO_BLOCKED | usage | `{ l: "Blocked (Human Needed)", v: ([] as typeof DEMO_BLOCKED).length, c: "text-amber-500" },` |
| 47 | DEMO_HEALED | usage | `{([] as typeof DEMO_HEALED).map((h, i) => (` |
| 63 | DEMO_RULES | usage | `{([] as typeof DEMO_RULES).map((r, i) => (` |
| 76 | DEMO_BLOCKED | usage | `{([] as typeof DEMO_BLOCKED).map((b, i) => (` |

## `/dev-server/src/pages/admin/AISelfLearningLedger.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_BEHAVIOR_CHANGES | import | `import { DEMO_BEHAVIOR_CHANGES, DEMO_LEARNED_PATTERNS, DEMO_ROUTING_WEIGHTS } from "@/data/seed/admin-platform";` |
| 11 | DEMO_LEARNED_PATTERNS | usage | `const { data: patterns, isDemo } = useAIEngDomain("learningPatterns", DEMO_LEARNED_PATTERNS);` |
| 21 | DEMO_BEHAVIOR_CHANGES | usage | `{ l: "Behavior Changes", v: ([] as typeof DEMO_BEHAVIOR_CHANGES).length },` |
| 23 | DEMO_ROUTING_WEIGHTS | usage | `{ l: "Top Agent Weight", v: Math.max(...([] as typeof DEMO_ROUTING_WEIGHTS).map(w => w.weight)).toFixed(2) },` |
| 64 | DEMO_BEHAVIOR_CHANGES | usage | `{([] as typeof DEMO_BEHAVIOR_CHANGES).map((b, i) => (` |
| 79 | DEMO_ROUTING_WEIGHTS | usage | `{([] as typeof DEMO_ROUTING_WEIGHTS).map((w, i) => (` |

## `/dev-server/src/pages/admin/AIT03TaskInvocation.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 23 | DEMO_BUDGET_POSTURES | import | `import { DEMO_BUDGET_POSTURES, DEMO_SCOPE_DOMAINS, DEMO_TASK_TYPES } from "@/data/seed/admin-platform";` |
| 41 | DEMO_BUDGET_POSTURES | usage | `const selectedBudget = ([] as typeof DEMO_BUDGET_POSTURES).find(b => b.key === budgetPosture);` |
| 42 | DEMO_TASK_TYPES | usage | `const selectedTaskMeta = ([] as typeof DEMO_TASK_TYPES).find(t => t.key === selectedTask);` |
| 129 | DEMO_TASK_TYPES | usage | `{([] as typeof DEMO_TASK_TYPES).map(t => <SelectItem key={t.key} value={t.key}>{t.label} — {t.desc}</SelectItem>)}` |
| 138 | DEMO_BUDGET_POSTURES | usage | `{([] as typeof DEMO_BUDGET_POSTURES).map(b => <SelectItem key={b.key} value={b.key}>{b.icon} {b.label} ({b.costBand})</S` |
| 151 | DEMO_SCOPE_DOMAINS | usage | `{([] as typeof DEMO_SCOPE_DOMAINS).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}` |

## `/dev-server/src/pages/admin/AITeamRoster.tsx` (11 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 14 | DEMO_AGENTS | declaration | `const DEMO_AGENTS: any[] = [];` |
| 30 | DEMO_AGENTS | usage | `const active = selected ? ([] as typeof DEMO_AGENTS).find(a => a.id === selected) : null;` |
| 34 | DEMO_AGENTS | usage | `const sorted = view === "roster" ? DEMO_AGENTS :` |
| 35 | DEMO_AGENTS | usage | `view === "severity" ? [...DEMO_AGENTS].sort((a, b) => (b.escalation === "active" ? 2 : b.escalation === "pending" ? 1 : ` |
| 36 | DEMO_AGENTS | usage | `view === "workload" ? [...DEMO_AGENTS].sort((a, b) => b.queueLoad - a.queueLoad) :` |
| 37 | DEMO_AGENTS | usage | `[...DEMO_AGENTS].sort((a, b) => b.accuracy - a.accuracy);` |
| 46 | DEMO_AGENTS | usage | `{ l: "Total Agents", v: ([] as typeof DEMO_AGENTS).length },` |
| 47 | DEMO_AGENTS | usage | `{ l: "Escalated", v: ([] as typeof DEMO_AGENTS).filter(a => a.escalation !== "none").length, c: "text-amber-500" },` |
| 48 | DEMO_AGENTS | usage | `{ l: "Total Queue", v: ([] as typeof DEMO_AGENTS).reduce((a, ag) => a + ag.queueLoad, 0) },` |
| 49 | DEMO_AGENTS | usage | `{ l: "Avg Confidence", v: `${Math.round(([] as typeof DEMO_AGENTS).reduce((a, ag) => a + ag.confidence, 0) / ([] as type` |
| 50 | DEMO_AGENTS | usage | `{ l: "Avg Accuracy", v: `${Math.round(([] as typeof DEMO_AGENTS).reduce((a, ag) => a + ag.accuracy, 0) / ([] as typeof D` |

## `/dev-server/src/pages/admin/AITimeMachine.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_TIMELINE | declaration | `const DEMO_TIMELINE: any[] = [];` |
| 14 | DEMO_TIMELINE | usage | `const { isDemo } = useAIEngDomain("auditTimeline", DEMO_TIMELINE);` |
| 24 | DEMO_TIMELINE | usage | `{([] as typeof DEMO_TIMELINE).map((event, i) => {` |
| 40 | DEMO_TIMELINE | usage | `{i < ([] as typeof DEMO_TIMELINE).length - 1 && <div className="w-px flex-1 bg-border/40 min-h-[16px]" />}` |
| 67 | DEMO_TIMELINE | usage | `const event = DEMO_TIMELINE[selectedIdx];` |

## `/dev-server/src/pages/admin/AND01AndroidEcosystemCenter.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 24 | DEMO_PROVIDER_CAPS | declaration | `const DEMO_PROVIDER_CAPS: any[] = [];` |
| 188 | DEMO_PROVIDER_CAPS | usage | `{([] as typeof DEMO_PROVIDER_CAPS).map((cap) => {` |

## `/dev-server/src/pages/admin/AND02WearOSExperience.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_COMPLICATIONS | import | `import { DEMO_COMPLICATIONS, DEMO_MICRO_ACTIONS, DEMO_TILES } from "@/data/seed/admin-platform";` |
| 31 | DEMO_TILES | usage | `{([] as typeof DEMO_TILES).map((tile) => (` |
| 66 | DEMO_MICRO_ACTIONS | usage | `{([] as typeof DEMO_MICRO_ACTIONS).map((a) => (` |
| 87 | DEMO_COMPLICATIONS | usage | `{([] as typeof DEMO_COMPLICATIONS).map((c) => (` |

## `/dev-server/src/pages/admin/AND03AndroidTrustApprovals.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_ESCALATION_MATRIX | import | `import { DEMO_ESCALATION_MATRIX } from "@/data/seed/admin-platform";` |
| 10 | DEMO_VERIFICATION_EVENTS | declaration | `const DEMO_VERIFICATION_EVENTS: any[] = [];` |
| 13 | DEMO_TRUST_CLASSES | declaration | `const DEMO_TRUST_CLASSES: any[] = [];` |
| 37 | DEMO_TRUST_CLASSES | usage | `{([] as typeof DEMO_TRUST_CLASSES).map((t) => (` |
| 71 | DEMO_ESCALATION_MATRIX | usage | `{([] as typeof DEMO_ESCALATION_MATRIX).map((r) => (` |
| 107 | DEMO_VERIFICATION_EVENTS | usage | `{([] as typeof DEMO_VERIFICATION_EVENTS).map((v) => (` |

## `/dev-server/src/pages/admin/AND04AndroidHealthConsent.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_SIGNALS | declaration | `const DEMO_SIGNALS: any[] = [];` |
| 17 | DEMO_SIGNALS | usage | `Object.fromEntries(([] as typeof DEMO_SIGNALS).map(s => [s.key, { read: false, routing: false, assistant: false }]))` |
| 37 | DEMO_SIGNALS | usage | `<Badge variant={consentedCount > 0 ? "default" : "secondary"}>{consentedCount}/{([] as typeof DEMO_SIGNALS).length} cons` |
| 62 | DEMO_SIGNALS | usage | `{([] as typeof DEMO_SIGNALS).map((sig) => (` |
| 114 | DEMO_SIGNALS | usage | `{([] as typeof DEMO_SIGNALS).map((sig) => (` |

## `/dev-server/src/pages/admin/AND05AndroidLaunchReadiness.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_TARGETS | declaration | `const DEMO_TARGETS: any[] = [];` |
| 13 | DEMO_TARGETS | usage | `const overall = Math.round(([] as typeof DEMO_TARGETS).reduce((s, t) => s + t.readiness, 0) / ([] as typeof DEMO_TARGETS` |
| 31 | DEMO_TARGETS | usage | `{ label: "Demo Ready", count: ([] as typeof DEMO_TARGETS).filter(t => t.demo).length },` |
| 32 | DEMO_TARGETS | usage | `{ label: "Critical Path", count: ([] as typeof DEMO_TARGETS).filter(t => t.critical).length },` |
| 33 | DEMO_TARGETS | usage | `{ label: "Total Blockers", count: ([] as typeof DEMO_TARGETS).reduce((s, t) => s + t.blockers.length, 0) },` |
| 48 | DEMO_TARGETS | usage | `{([] as typeof DEMO_TARGETS).map((t) => (` |
| 75 | DEMO_TARGETS | usage | `{([] as typeof DEMO_TARGETS).filter(t => t.deps.length > 0).map((t) => (` |
| 81 | DEMO_TARGETS | usage | `{([] as typeof DEMO_TARGETS).filter(t => t.deps.length === 0).map((t) => (` |

## `/dev-server/src/pages/admin/APL01AppleEcosystemCenter.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 24 | DEMO_PROVIDER_CAPS | declaration | `const DEMO_PROVIDER_CAPS: any[] = [];` |
| 187 | DEMO_PROVIDER_CAPS | usage | `{([] as typeof DEMO_PROVIDER_CAPS).map((cap) => {` |

## `/dev-server/src/pages/admin/APL02AppleDevicesTrust.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_ESCALATION_RULES | import | `import { DEMO_ESCALATION_RULES } from "@/data/seed/admin-platform";` |
| 12 | DEMO_VERIFICATION_EVENTS | declaration | `const DEMO_VERIFICATION_EVENTS: any[] = [];` |
| 15 | DEMO_TRUST_CLASSES | declaration | `const DEMO_TRUST_CLASSES: any[] = [];` |
| 41 | DEMO_TRUST_CLASSES | usage | `{([] as typeof DEMO_TRUST_CLASSES).map((t) => (` |
| 91 | DEMO_ESCALATION_RULES | usage | `{([] as typeof DEMO_ESCALATION_RULES).map((r, i) => (` |
| 137 | DEMO_VERIFICATION_EVENTS | usage | `{([] as typeof DEMO_VERIFICATION_EVENTS).map((v) => (` |

## `/dev-server/src/pages/admin/APL03AppleWatchExperience.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_GLANCE_CARDS | import | `import { DEMO_GLANCE_CARDS, DEMO_HAPTIC_PATTERNS, DEMO_MICRO_CONSTRAINTS } from "@/data/seed/admin-platform";` |
| 34 | DEMO_GLANCE_CARDS | usage | `{([] as typeof DEMO_GLANCE_CARDS).map((card) => (` |
| 77 | DEMO_HAPTIC_PATTERNS | usage | `{([] as typeof DEMO_HAPTIC_PATTERNS).map((h) => (` |
| 98 | DEMO_MICRO_CONSTRAINTS | usage | `{([] as typeof DEMO_MICRO_CONSTRAINTS).map((c) => (` |

## `/dev-server/src/pages/admin/APL04AppleIdentityAccounts.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_IDENTITY_ARCHITECTURE | import | `import { DEMO_IDENTITY_ARCHITECTURE, DEMO_LINK_FLOW_STEPS, DEMO_SECURITY_POLICIES } from "@/data/seed/admin-platform";` |
| 33 | DEMO_IDENTITY_ARCHITECTURE | usage | `{([] as typeof DEMO_IDENTITY_ARCHITECTURE).map((item) => (` |
| 48 | DEMO_LINK_FLOW_STEPS | usage | `{([] as typeof DEMO_LINK_FLOW_STEPS).map((s, i) => (` |
| 75 | DEMO_SECURITY_POLICIES | usage | `{([] as typeof DEMO_SECURITY_POLICIES).map((p) => (` |

## `/dev-server/src/pages/admin/APL05AppleHealthConsent.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 12 | DEMO_SIGNALS | declaration | `const DEMO_SIGNALS: any[] = [];` |
| 18 | DEMO_SIGNALS | usage | `Object.fromEntries(([] as typeof DEMO_SIGNALS).map(s => [s.key, { read: false, routing: false, boardroom: false, assista` |
| 38 | DEMO_SIGNALS | usage | `<Badge variant={consentedCount > 0 ? "default" : "secondary"}>{consentedCount}/{([] as typeof DEMO_SIGNALS).length} cons` |
| 65 | DEMO_SIGNALS | usage | `{([] as typeof DEMO_SIGNALS).map((sig) => (` |
| 135 | DEMO_SIGNALS | usage | `{([] as typeof DEMO_SIGNALS).map((sig) => (` |

## `/dev-server/src/pages/admin/APL06AppleLaunchReadiness.tsx` (13 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 13 | DEMO_TARGETS | declaration | `const DEMO_TARGETS: any[] = [];` |
| 24 | DEMO_TARGETS | usage | `const overallReadiness = Math.round(([] as typeof DEMO_TARGETS).reduce((s, t) => s + t.readiness, 0) / ([] as typeof DEM` |
| 25 | DEMO_TARGETS | usage | `const totalBlockers = ([] as typeof DEMO_TARGETS).reduce((s, t) => s + t.blockers.length, 0);` |
| 46 | DEMO_TARGETS | usage | `{ label: "Demo Ready", count: ([] as typeof DEMO_TARGETS).filter(t => t.demo).length, total: ([] as typeof DEMO_TARGETS)` |
| 47 | DEMO_TARGETS | usage | `{ label: "Pilot Ready", count: ([] as typeof DEMO_TARGETS).filter(t => t.pilot).length, total: ([] as typeof DEMO_TARGET` |
| 48 | DEMO_TARGETS | usage | `{ label: "Launch Ready", count: ([] as typeof DEMO_TARGETS).filter(t => t.launch).length, total: ([] as typeof DEMO_TARG` |
| 49 | DEMO_TARGETS | usage | `{ label: "Critical Path", count: ([] as typeof DEMO_TARGETS).filter(t => t.critical).length, total: ([] as typeof DEMO_T` |
| 69 | DEMO_TARGETS | usage | `{([] as typeof DEMO_TARGETS).map((item) => (` |
| 106 | DEMO_TARGETS | usage | `{ quarter: "Q2 2026", items: ([] as typeof DEMO_TARGETS).filter(t => t.stage === "alpha"), label: "Alpha" },` |
| 107 | DEMO_TARGETS | usage | `{ quarter: "Q3 2026", items: ([] as typeof DEMO_TARGETS).filter(t => t.critical && t.stage === "planned"), label: "Criti` |
| 108 | DEMO_TARGETS | usage | `{ quarter: "Q4 2026", items: ([] as typeof DEMO_TARGETS).filter(t => !t.critical && t.stage === "planned"), label: "Expa` |
| 130 | DEMO_TARGETS | usage | `{([] as typeof DEMO_TARGETS).filter(t => t.deps.length > 0).map((t) => (` |
| 138 | DEMO_TARGETS | usage | `{([] as typeof DEMO_TARGETS).filter(t => t.deps.length === 0).map((t) => (` |

## `/dev-server/src/pages/admin/ActionStateDriftViewer.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 41 | DEMO_ACTIONS | declaration | `const DEMO_ACTIONS: ActionRecord[] = [` |
| 54 | DEMO_ACTIONS | usage | `const nonCanonical = ([] as typeof DEMO_ACTIONS).filter(a => !a.canonical);` |
| 55 | DEMO_ACTIONS | usage | `const stuck = ([] as typeof DEMO_ACTIONS).filter(a => a.stuckSince);` |
| 56 | DEMO_ACTIONS | usage | `const drifted = ([] as typeof DEMO_ACTIONS).filter(a => a.driftReason);` |
| 72 | DEMO_ACTIONS | usage | `{ label: "Total Actions", value: String(([] as typeof DEMO_ACTIONS).length), color: "text-foreground" },` |
| 73 | DEMO_ACTIONS | usage | `{ label: "Canonical", value: String(([] as typeof DEMO_ACTIONS).filter(a => a.canonical).length), color: "text-emerald-5` |
| 97 | DEMO_ACTIONS | usage | `{([] as typeof DEMO_ACTIONS).map(a => (` |

## `/dev-server/src/pages/admin/AdminDeploymentRings.tsx` (10 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_PROMOTION_GATES | import | `import { DEMO_PROMOTION_GATES, DEMO_RINGS } from "@/data/seed/admin-platform";` |
| 14 | DEMO_ENVIRONMENTS | declaration | `const DEMO_ENVIRONMENTS: any[] = [];` |
| 57 | DEMO_PROMOTION_GATES | usage | `const passedGates = ([] as typeof DEMO_PROMOTION_GATES).filter(g => g.status === "passed").length;` |
| 58 | DEMO_PROMOTION_GATES | usage | `const totalGates = ([] as typeof DEMO_PROMOTION_GATES).length;` |
| 59 | DEMO_PROMOTION_GATES | usage | `const blockers = ([] as typeof DEMO_PROMOTION_GATES).filter(g => g.blocker && g.status !== "passed");` |
| 110 | DEMO_RINGS | usage | `{([] as typeof DEMO_RINGS).map((ring, ri) => (` |
| 121 | DEMO_RINGS | usage | `{ri < ([] as typeof DEMO_RINGS).length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}` |
| 128 | DEMO_RINGS | usage | `{([] as typeof DEMO_RINGS).map(ring => (` |
| 156 | DEMO_PROMOTION_GATES | usage | `{([] as typeof DEMO_PROMOTION_GATES).map((gate, i) => {` |
| 188 | DEMO_ENVIRONMENTS | usage | `{([] as typeof DEMO_ENVIRONMENTS).map(env => (` |

## `/dev-server/src/pages/admin/AdminMutationAudit.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_MUTATIONS | import | `import { type DemoMutationRecord, type DurabilityStatus, DEMO_MUTATIONS } from "@/data/seed/durability";` |
| 43 | DEMO_MUTATIONS | usage | `const filtered = mutFilter === "all" ? DEMO_MUTATIONS : ([] as typeof DEMO_MUTATIONS).filter(m => m.durabilityStatus ===` |
| 44 | DEMO_MUTATIONS | usage | `const persistedPct = Math.round((([] as typeof DEMO_MUTATIONS).filter(m => m.durabilityStatus === "persisted").length / ` |
| 45 | DEMO_MUTATIONS | usage | `const lineagePct = Math.round((([] as typeof DEMO_MUTATIONS).filter(m => m.lineageComplete).length / ([] as typeof DEMO_` |
| 46 | DEMO_MUTATIONS | usage | `const canonicalPct = Math.round((([] as typeof DEMO_MUTATIONS).filter(m => m.canonicalWritePath).length / ([] as typeof ` |

## `/dev-server/src/pages/admin/AdminOperationsHub.tsx` (15 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_RUNBOOKS | import | `import { DEMO_RUNBOOKS, DEMO_SLOS } from "@/data/seed/admin-platform";` |
| 19 | DEMO_SERVICES | declaration | `const DEMO_SERVICES = [` |
| 30 | DEMO_QUEUES | declaration | `const DEMO_QUEUES = [` |
| 38 | DEMO_INCIDENTS | declaration | `const DEMO_INCIDENTS = [` |
| 43 | DEMO_ACTION_LOG | declaration | `const DEMO_ACTION_LOG = [` |
| 115 | DEMO_SERVICES | usage | `{ label: "Services Healthy", value: `${([] as typeof DEMO_SERVICES).filter(s => s.status === "healthy").length}/${([] as` |
| 117 | DEMO_INCIDENTS | usage | `{ label: "Open Incidents", value: String(incidentCount ?? ([] as typeof DEMO_INCIDENTS).length), icon: AlertTriangle, co` |
| 118 | DEMO_SLOS | usage | `{ label: "SLO Budget OK", value: `${([] as typeof DEMO_SLOS).filter(s => s.burnRate < 1).length}/${([] as typeof DEMO_SL` |
| 119 | DEMO_QUEUES | usage | `{ label: "Queue Pressure", value: ([] as typeof DEMO_QUEUES).some(q => q.pressure === "high") ? "Elevated" : "Normal", i` |
| 143 | DEMO_SERVICES | usage | `{([] as typeof DEMO_SERVICES).map(svc => (` |
| 188 | DEMO_SLOS | usage | `{([] as typeof DEMO_SLOS).map(slo => (` |
| 211 | DEMO_QUEUES | usage | `{([] as typeof DEMO_QUEUES).map(q => (` |
| 233 | DEMO_INCIDENTS | usage | `{([] as typeof DEMO_INCIDENTS).map(inc => (` |
| 255 | DEMO_RUNBOOKS | usage | `{([] as typeof DEMO_RUNBOOKS).map(rb => (` |
| 272 | DEMO_ACTION_LOG | usage | `{([] as typeof DEMO_ACTION_LOG).map((entry, i) => (` |

## `/dev-server/src/pages/admin/AdminProjectionModels.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_MODELS | import | `import { DEMO_MODELS } from "@/data/seed/admin-platform";` |
| 56 | DEMO_MODELS | usage | `const freshCount = ([] as typeof DEMO_MODELS).filter(m => m.freshness === "fresh").length;` |
| 57 | DEMO_MODELS | usage | `const avgLag = Math.round(([] as typeof DEMO_MODELS).reduce((s, m) => s + m.lagMs, 0) / ([] as typeof DEMO_MODELS).lengt` |
| 58 | DEMO_MODELS | usage | `const degradedCount = ([] as typeof DEMO_MODELS).filter(m => m.freshness === "degraded" \|\| m.freshness === "fallback").l` |
| 75 | DEMO_MODELS | usage | `{ label: "Fresh Models", value: `${freshCount}/${([] as typeof DEMO_MODELS).length}`, color: freshCount === ([] as typeo` |
| 97 | DEMO_MODELS | usage | `{([] as typeof DEMO_MODELS).map((model) => {` |
| 210 | DEMO_MODELS | usage | `{([] as typeof DEMO_MODELS).filter(m => m.freshness === "degraded" \|\| m.freshness === "fallback" \|\| m.freshness === "sta` |
| 225 | DEMO_MODELS | usage | `{([] as typeof DEMO_MODELS).filter(m => m.freshness === "degraded" \|\| m.freshness === "fallback" \|\| m.freshness === "sta` |

## `/dev-server/src/pages/admin/AdminTruthClaims.tsx` (13 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_CLAIMS | import | `import { DEMO_CLAIMS } from "@/data/seed/admin-platform";` |
| 21 | DEMO_MANIFESTS | declaration | `const DEMO_MANIFESTS = [` |
| 29 | DEMO_DOCS_DRIFT | declaration | `const DEMO_DOCS_DRIFT = [` |
| 35 | DEMO_ARCH_GATES | declaration | `const DEMO_ARCH_GATES = [` |
| 52 | DEMO_CLAIMS | usage | `const verified = ([] as typeof DEMO_CLAIMS).filter(c => c.status === "verified").length;` |
| 53 | DEMO_CLAIMS | usage | `const drifts = ([] as typeof DEMO_CLAIMS).filter(c => c.status === "drift").length;` |
| 69 | DEMO_CLAIMS | usage | `<Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider ` |
| 71 | DEMO_MANIFESTS | usage | `<Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider ` |
| 72 | DEMO_DOCS_DRIFT | usage | `<Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider ` |
| 84 | DEMO_CLAIMS | usage | `{([] as typeof DEMO_CLAIMS).map(c => (` |
| 107 | DEMO_MANIFESTS | usage | `{([] as typeof DEMO_MANIFESTS).map(mf => (` |
| 132 | DEMO_DOCS_DRIFT | usage | `{([] as typeof DEMO_DOCS_DRIFT).map(dd => (` |
| 156 | DEMO_ARCH_GATES | usage | `{([] as typeof DEMO_ARCH_GATES).map(g => (` |

## `/dev-server/src/pages/admin/AuditComplianceWorkspace.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 32 | DEMO_AUDIT_RECORDS | declaration | `const DEMO_AUDIT_RECORDS: AuditRecord[] = [` |
| 64 | DEMO_AUDIT_RECORDS | usage | `const filtered = ([] as typeof DEMO_AUDIT_RECORDS).filter(r => {` |
| 114 | DEMO_AUDIT_RECORDS | usage | `{ label: "Total Records", value: ([] as typeof DEMO_AUDIT_RECORDS).length, color: "text-foreground" },` |
| 115 | DEMO_AUDIT_RECORDS | usage | `{ label: "With Proof", value: ([] as typeof DEMO_AUDIT_RECORDS).filter(r => r.proofHash).length, color: "text-[hsl(var(-` |
| 116 | DEMO_AUDIT_RECORDS | usage | `{ label: "Warnings", value: ([] as typeof DEMO_AUDIT_RECORDS).filter(r => r.severity === "warning").length, color: "text` |
| 117 | DEMO_AUDIT_RECORDS | usage | `{ label: "Critical", value: ([] as typeof DEMO_AUDIT_RECORDS).filter(r => r.severity === "critical").length, color: "tex` |

## `/dev-server/src/pages/admin/BuilderKnowledgeBase.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_ARCHETYPE_DOCS | import | `import { DEMO_ARCHETYPE_DOCS } from "@/data/seed/admin-platform";` |
| 42 | DEMO_ARCHETYPE_DOCS | usage | `{([] as typeof DEMO_ARCHETYPE_DOCS).map(arch => (` |

## `/dev-server/src/pages/admin/CN01ConnectorRealityOverview.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 14 | DEMO_VERIFICATION_CHECKS | import | `import { DEMO_VERIFICATION_CHECKS } from "@/data/seed/admin-platform";` |
| 19 | DEMO_CAPABILITIES | declaration | `const DEMO_CAPABILITIES: any[] = [];` |
| 100 | DEMO_VERIFICATION_CHECKS | usage | `const passedChecks = ([] as typeof DEMO_VERIFICATION_CHECKS).filter((c) => c.check(verificationData)).length;` |
| 127 | DEMO_VERIFICATION_CHECKS | usage | `<Badge variant="outline" className={passedChecks === ([] as typeof DEMO_VERIFICATION_CHECKS).length ? "bg-emerald-500/15` |
| 128 | DEMO_VERIFICATION_CHECKS | usage | `{passedChecks}/{([] as typeof DEMO_VERIFICATION_CHECKS).length} passed` |
| 134 | DEMO_VERIFICATION_CHECKS | usage | `{([] as typeof DEMO_VERIFICATION_CHECKS).map((check) => {` |
| 194 | DEMO_CAPABILITIES | usage | `{([] as typeof DEMO_CAPABILITIES).map((cap) => {` |

## `/dev-server/src/pages/admin/ComputeGovernanceBoard.tsx` (25 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 24 | DEMO_AGENT_SPEND | import | `import { DEMO_AGENT_SPEND, DEMO_ANOMALIES, DEMO_BUDGETS, DEMO_DEEP_JOBS, DEMO_ROUTING_EVENTS, DEMO_TENANT_SPEND } from "` |
| 70 | DEMO_ANOMALIES | usage | `const anomalyCount = ([] as typeof DEMO_ANOMALIES).length;` |
| 71 | DEMO_ANOMALIES | usage | `const criticalCount = ([] as typeof DEMO_ANOMALIES).filter(a => a.severity === "critical").length;` |
| 73 | DEMO_BUDGETS | usage | `const forecasts = ([] as typeof DEMO_BUDGETS).filter(b => b.scope === "tenant").map(b => forecastSpend(b, 18, 30));` |
| 164 | DEMO_AGENT_SPEND | usage | `{([] as typeof DEMO_AGENT_SPEND).sort((a, b) => b.cost - a.cost).map(a => (` |
| 182 | DEMO_TENANT_SPEND | usage | `{([] as typeof DEMO_TENANT_SPEND).map(t => (` |
| 199 | DEMO_ANOMALIES | usage | `{([] as typeof DEMO_ANOMALIES).slice(0, 3).map(a => (` |
| 297 | DEMO_ROUTING_EVENTS | usage | `{([] as typeof DEMO_ROUTING_EVENTS).map(r => (` |
| 405 | DEMO_BUDGETS | usage | `{([] as typeof DEMO_BUDGETS).map(env => {` |
| 436 | DEMO_BUDGETS | usage | `{([] as typeof DEMO_BUDGETS).map(env => (` |
| 630 | DEMO_TENANT_SPEND | usage | `{([] as typeof DEMO_TENANT_SPEND).map(t => {` |
| 720 | DEMO_TENANT_SPEND | usage | `{([] as typeof DEMO_TENANT_SPEND).filter(t => t.margin < 60 \|\| (t.deepUsed / t.deepCap) > 0.8).map(t => (` |
| 729 | DEMO_TENANT_SPEND | usage | `{([] as typeof DEMO_TENANT_SPEND).filter(t => t.margin < 60 \|\| (t.deepUsed / t.deepCap) > 0.8).length === 0 && (` |
| 770 | DEMO_DEEP_JOBS | usage | `{([] as typeof DEMO_DEEP_JOBS).map(j => (` |
| 803 | DEMO_DEEP_JOBS | usage | `{([] as typeof DEMO_DEEP_JOBS).filter(j => j.costClass === "D").map(j => (` |
| 812 | DEMO_DEEP_JOBS | usage | `{([] as typeof DEMO_DEEP_JOBS).filter(j => j.costClass === "D").length === 0 && (` |
| 862 | DEMO_TENANT_SPEND | usage | `{([] as typeof DEMO_TENANT_SPEND).map(t => {` |
| 884 | DEMO_ANOMALIES | usage | `<p className="text-2xl font-bold text-foreground">{([] as typeof DEMO_ANOMALIES).length}</p>` |
| 890 | DEMO_ANOMALIES | usage | `<p className="text-2xl font-bold text-rose-400">{([] as typeof DEMO_ANOMALIES).filter(a => a.severity === "critical").le` |
| 896 | DEMO_ANOMALIES | usage | `<p className="text-2xl font-bold text-foreground">${(([] as typeof DEMO_ANOMALIES).reduce((s, a) => s + a.estimatedWaste` |
| 902 | DEMO_ANOMALIES | usage | `<p className="text-2xl font-bold text-foreground">{Math.round(([] as typeof DEMO_ANOMALIES).reduce((s, a) => s + a.confi` |
| 912 | DEMO_ANOMALIES | usage | `{([] as typeof DEMO_ANOMALIES).map((a, i) => (` |
| 942 | DEMO_ANOMALIES | usage | `{([] as typeof DEMO_ANOMALIES).filter(a => a.type === "retry-storm").map(a => (` |
| 948 | DEMO_ANOMALIES | usage | `{([] as typeof DEMO_ANOMALIES).filter(a => a.type === "retry-storm").length === 0 && (` |
| 957 | DEMO_ANOMALIES | usage | `{([] as typeof DEMO_ANOMALIES).filter(a => a.type === "burn-spike" \|\| a.type === "duplicate-action").map(a => (` |

## `/dev-server/src/pages/admin/ConciergeRuntimeBoard.tsx` (17 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_TASKS | import | `import { DEMO_TASKS } from "@/data/seed/admin-platform";` |
| 25 | DEMO_TRAVEL | declaration | `const DEMO_TRAVEL = [` |
| 30 | DEMO_HOUSEHOLD | declaration | `const DEMO_HOUSEHOLD = [` |
| 36 | DEMO_PROMISES | declaration | `const DEMO_PROMISES = [` |
| 42 | DEMO_RECEIPTS | declaration | `const DEMO_RECEIPTS = [` |
| 49 | DEMO_SLA | declaration | `const DEMO_SLA = [` |
| 64 | DEMO_TASKS | usage | `const activeCount = ([] as typeof DEMO_TASKS).filter(t => t.state === "active").length;` |
| 65 | DEMO_TASKS | usage | `const brokenCount = ([] as typeof DEMO_TASKS).filter(t => t.continuityBroken).length;` |
| 84 | DEMO_PROMISES | usage | `{ label: "Promises Tracked", value: String(([] as typeof DEMO_PROMISES).length), color: "text-primary" },` |
| 85 | DEMO_TRAVEL | usage | `{ label: "Active Travel", value: String(([] as typeof DEMO_TRAVEL).filter(t => t.status === "active").length), color: "t` |
| 86 | DEMO_PROMISES | usage | `{ label: "Promise Fulfillment", value: `${Math.round((([] as typeof DEMO_PROMISES).filter(p => p.status === "completed")` |
| 106 | DEMO_TASKS | usage | `{([] as typeof DEMO_TASKS).map(t => {` |
| 130 | DEMO_TRAVEL | usage | `{([] as typeof DEMO_TRAVEL).map(t => (` |
| 150 | DEMO_HOUSEHOLD | usage | `{([] as typeof DEMO_HOUSEHOLD).map(h => (` |
| 172 | DEMO_PROMISES | usage | `{([] as typeof DEMO_PROMISES).map(p => (` |
| 196 | DEMO_RECEIPTS | usage | `{([] as typeof DEMO_RECEIPTS).map(r => (` |
| 216 | DEMO_SLA | usage | `{([] as typeof DEMO_SLA).map(s => (` |

## `/dev-server/src/pages/admin/ConnectorGovernanceCenter.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 17 | DEMO_FALLBACK_SYNC_HISTORY | import | `import { DEMO_FALLBACK_SYNC_HISTORY, DEMO_POLICIES } from "@/data/seed/admin-platform";` |
| 21 | DEMO_CONNECTORS | declaration | `const DEMO_CONNECTORS: any[] = [];` |
| 60 | DEMO_FALLBACK_SYNC_HISTORY | usage | `const { data: syncHistory = DEMO_FALLBACK_SYNC_HISTORY } = useQuery({` |
| 70 | DEMO_FALLBACK_SYNC_HISTORY | usage | `if (error \|\| !data \|\| data.length === 0) return DEMO_FALLBACK_SYNC_HISTORY;` |
| 95 | DEMO_CONNECTORS | usage | `const activeConnectors = dbConnectors ? ([] as typeof DEMO_CONNECTORS).map(c => {` |
| 98 | DEMO_CONNECTORS | usage | `}) : DEMO_CONNECTORS;` |
| 281 | DEMO_POLICIES | usage | `{([] as typeof DEMO_POLICIES).map(pol => (` |

## `/dev-server/src/pages/admin/ConscienceGateDashboard.tsx` (11 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 21 | DEMO_CONSCIENCE_VERDICTS | import | `import { DEMO_CONSCIENCE_VERDICTS } from "@/data/fixtures/mock-data/conscience-gate";` |
| 118 | DEMO_CONSCIENCE_VERDICTS | usage | `setLiveVerdicts(([] as typeof DEMO_CONSCIENCE_VERDICTS).map(withDashboardId));` |
| 128 | DEMO_VERDICTS | declaration | `const DEMO_VERDICTS: DashboardVerdict[] = liveVerdicts.length > 0` |
| 130 | DEMO_CONSCIENCE_VERDICTS | usage | `: ([] as typeof DEMO_CONSCIENCE_VERDICTS).map(withDashboardId);` |
| 134 | DEMO_VERDICTS | usage | `([] as typeof DEMO_VERDICTS).forEach((v) => counts[v.decision]++);` |
| 135 | DEMO_VERDICTS | usage | `const total = ([] as typeof DEMO_VERDICTS).length;` |
| 137 | DEMO_VERDICTS | usage | `}, [DEMO_VERDICTS]);` |
| 205 | DEMO_VERDICTS | usage | `{([] as typeof DEMO_VERDICTS).map((v) => (` |
| 232 | DEMO_VERDICTS | usage | `{([] as typeof DEMO_VERDICTS).map((v) => (` |
| 273 | DEMO_VERDICTS | usage | `{([] as typeof DEMO_VERDICTS).map((v) => (` |
| 317 | DEMO_VERDICTS | usage | `{([] as typeof DEMO_VERDICTS).map((v) => (` |

## `/dev-server/src/pages/admin/CoreServiceMigrationBoard.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_SERVICES | declaration | `const DEMO_SERVICES: any[] = [];` |
| 37 | DEMO_SERVICES | usage | `const completed = ([] as typeof DEMO_SERVICES).filter(s => s.phase === "complete").length;` |
| 38 | DEMO_SERVICES | usage | `const pct = (completed / ([] as typeof DEMO_SERVICES).length) * 100;` |
| 47 | DEMO_SERVICES | usage | `<Badge>{completed}/{([] as typeof DEMO_SERVICES).length} complete</Badge>` |
| 119 | DEMO_SERVICES | usage | `{([] as typeof DEMO_SERVICES).map(svc => (` |
| 146 | DEMO_SERVICES | usage | `{ label: "Critical State Loss", count: ([] as typeof DEMO_SERVICES).filter(s => s.phase === "not-started").length, color` |
| 147 | DEMO_SERVICES | usage | `{ label: "Partial Coverage", count: ([] as typeof DEMO_SERVICES).filter(s => ["adapter-built", "wired"].includes(s.phase` |
| 148 | DEMO_SERVICES | usage | `{ label: "Fully Durable", count: ([] as typeof DEMO_SERVICES).filter(s => ["validated", "complete"].includes(s.phase)).l` |

## `/dev-server/src/pages/admin/CrossDomainMemoryExplorer.tsx` (12 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 71 | usage | `const { isDemoMode } = useDataMode();` |
| 81 | usage | `const { isDemoMode } = useDataMode();` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 47 | DEMO_EVENTS | declaration | `const DEMO_EVENTS: MemoryEvent[] = [` |
| 60 | DEMO_SCOPES | declaration | `const DEMO_SCOPES: MemoryScopeInfo[] = [` |
| 86 | DEMO_EVENTS | usage | `? ([] as typeof DEMO_EVENTS).filter(e => e.description.toLowerCase().includes(search.toLowerCase()) \|\| e.domain.includes` |
| 87 | DEMO_EVENTS | usage | `: DEMO_EVENTS;` |
| 103 | DEMO_SCOPES | usage | `{ label: "Total Memory Events", value: ([] as typeof DEMO_SCOPES).reduce((s, d) => s + d.totalEvents, 0).toLocaleString(` |
| 104 | DEMO_SCOPES | usage | `{ label: "Active Domains", value: `${([] as typeof DEMO_SCOPES).length}`, color: "text-primary" },` |
| 105 | DEMO_SCOPES | usage | `{ label: "Cross-Links", value: ([] as typeof DEMO_SCOPES).reduce((s, d) => s + d.crossLinks, 0).toString(), color: "text` |
| 106 | DEMO_SCOPES | usage | `{ label: "Health Issues", value: String(([] as typeof DEMO_SCOPES).filter(s => s.healthStatus !== "healthy").length), co` |
| 161 | DEMO_SCOPES | usage | `{([] as typeof DEMO_SCOPES).map(scope => (` |
| 185 | DEMO_EVENTS | usage | `{([] as typeof DEMO_EVENTS).filter(e => e.linkedEntities.length > 1).map(event => (` |

## `/dev-server/src/pages/admin/DRS05ProviderConsole.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_ALL_DOMAINS | declaration | `const DEMO_ALL_DOMAINS: any[] = [];` |
| 41 | DEMO_ALL_DOMAINS | usage | `{([] as typeof DEMO_ALL_DOMAINS).map(domain => {` |

## `/dev-server/src/pages/admin/DRS10DualRealityLaunchGate.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_ALL_DOMAINS | declaration | `const DEMO_ALL_DOMAINS: any[] = [];` |
| 26 | DEMO_ALL_DOMAINS | usage | `status: ([] as typeof DEMO_ALL_DOMAINS).every(d => registered.includes(d)) ? "pass" : "warn",` |
| 27 | DEMO_ALL_DOMAINS | usage | `detail: `${registered.length}/${([] as typeof DEMO_ALL_DOMAINS).length} domains registered`,` |

## `/dev-server/src/pages/admin/DWE07DeviceLaunchHonestyBoard.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 13 | DEMO_ONLY_SURFACE_COUNT | import | `import { getDemoOnlySurfacesByContainment, DEMO_ONLY_SURFACE_COUNT } from "@/lib/claim-safety/demo-only-surface-registry` |
| 49 | DEMO_ONLY_SURFACE_COUNT | usage | `Demo-Only Surface Registry ({DEMO_ONLY_SURFACE_COUNT})` |

## `/dev-server/src/pages/admin/FCC06ProgramManagementBoard.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 50 | DEMO_OBJECTIVES | declaration | `const DEMO_OBJECTIVES: Objective[] = [` |
| 173 | DEMO_OBJECTIVES | usage | `const allTasks = ([] as typeof DEMO_OBJECTIVES).flatMap(o => o.milestones.flatMap(m => m.tasks));` |
| 189 | DEMO_OBJECTIVES | usage | `{ label: "Objectives", value: ([] as typeof DEMO_OBJECTIVES).length, color: "text-primary" },` |
| 208 | DEMO_OBJECTIVES | usage | `{([] as typeof DEMO_OBJECTIVES).map((obj, oi) => {` |

## `/dev-server/src/pages/admin/FCC07PlatformCostCapacity.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 29 | DEMO_COST_DATA | declaration | `const DEMO_COST_DATA: CostBreakdownItem[] = [` |
| 73 | DEMO_COST_DATA | usage | `{([] as typeof DEMO_COST_DATA).map((item, i) => {` |

## `/dev-server/src/pages/admin/FeatureIntakeDesk.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 19 | DEMO_ARCHETYPES | declaration | `const DEMO_ARCHETYPES: any[] = [];` |
| 82 | DEMO_ARCHETYPES | usage | `<SelectContent>{([] as typeof DEMO_ARCHETYPES).map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>` |

## `/dev-server/src/pages/admin/FleetHealthPage.tsx` (13 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 13 | DEMO_FLEET | declaration | `const DEMO_FLEET = [` |
| 22 | DEMO_ANOMALIES | declaration | `const DEMO_ANOMALIES = [` |
| 27 | DEMO_PREDICTIONS | declaration | `const DEMO_PREDICTIONS = [` |
| 32 | DEMO_MAINTENANCE | declaration | `const DEMO_MAINTENANCE = [` |
| 47 | DEMO_FLEET | usage | `const healthyCount = ([] as typeof DEMO_FLEET).filter(n => n.status === "healthy").length;` |
| 64 | DEMO_FLEET | usage | `{ label: "Fleet Healthy", value: `${healthyCount}/${([] as typeof DEMO_FLEET).length}`, color: healthyCount === ([] as t` |
| 65 | DEMO_ANOMALIES | usage | `{ label: "Active Anomalies", value: String(([] as typeof DEMO_ANOMALIES).length), color: ([] as typeof DEMO_ANOMALIES).l` |
| 66 | DEMO_PREDICTIONS | usage | `{ label: "Predicted Risks", value: String(([] as typeof DEMO_PREDICTIONS).length), color: ([] as typeof DEMO_PREDICTIONS` |
| 67 | DEMO_MAINTENANCE | usage | `{ label: "Pending Maintenance", value: String(([] as typeof DEMO_MAINTENANCE).filter(m => m.status === "pending").length` |
| 86 | DEMO_FLEET | usage | `{([] as typeof DEMO_FLEET).map(node => (` |
| 117 | DEMO_PREDICTIONS | usage | `{([] as typeof DEMO_PREDICTIONS).map((p, i) => (` |
| 139 | DEMO_ANOMALIES | usage | `{([] as typeof DEMO_ANOMALIES).map(a => (` |
| 160 | DEMO_MAINTENANCE | usage | `{([] as typeof DEMO_MAINTENANCE).map(m => (` |

## `/dev-server/src/pages/admin/HQApprovalQueue.tsx` (9 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 160 | usage | `const { isDemoMode } = useDataMode();` |
| 191 | usage | `const { isDemoMode } = useDataMode();` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 25 | DEMO_RISK_TIERS | import | `import { DEMO_RISK_TIERS } from "@/data/seed/admin-platform";` |
| 29 | DEMO_STATUSES | declaration | `const DEMO_STATUSES: any[] = [];` |
| 35 | DEMO_DOMAINS | declaration | `const DEMO_DOMAINS: any[] = [];` |
| 233 | DEMO_RISK_TIERS | usage | `{([] as typeof DEMO_RISK_TIERS).map(tier => {` |
| 298 | DEMO_STATUSES | usage | `{ key: "status", label: "Status", options: ["all", ...DEMO_STATUSES] },` |
| 299 | DEMO_RISK_TIERS | usage | `{ key: "risk_tier", label: "Risk", options: ["all", ...DEMO_RISK_TIERS] },` |
| 301 | DEMO_DOMAINS | usage | `{ key: "impacted_domain", label: "Domain", options: ["all", ...DEMO_DOMAINS] },` |

## `/dev-server/src/pages/admin/HRS01HealthConsentCenter.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_CONSENT_CATEGORIES | import | `import { DEMO_CONSENT_CATEGORIES, DEMO_REVOCATION_ACTIONS } from "@/data/seed/health-signals";` |
| 10 | DEMO_PRINCIPLES | import | `import { DEMO_PRINCIPLES } from "@/data/seed/admin-platform";` |
| 17 | DEMO_CONSENT_CATEGORIES | usage | `Object.fromEntries(([] as typeof DEMO_CONSENT_CATEGORIES).map(c => [c.key, false]))` |
| 26 | DEMO_CONSENT_CATEGORIES | usage | `([] as typeof DEMO_CONSENT_CATEGORIES).forEach(c => {` |
| 56 | DEMO_CONSENT_CATEGORIES | usage | `{([] as typeof DEMO_CONSENT_CATEGORIES).map((c) => {` |
| 119 | DEMO_PRINCIPLES | usage | `{([] as typeof DEMO_PRINCIPLES).map((p, i) => (` |
| 134 | DEMO_REVOCATION_ACTIONS | usage | `{([] as typeof DEMO_REVOCATION_ACTIONS).map((r) => (` |

## `/dev-server/src/pages/admin/HRS02SignalSourcesBoard.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_SIGNAL_PROVIDERS | import | `import { DEMO_SIGNAL_PROVIDERS } from "@/data/seed/health-signals";` |
| 26 | DEMO_SIGNAL_PROVIDERS | usage | `: (providers as typeof DEMO_SIGNAL_PROVIDERS) ?? [];` |

## `/dev-server/src/pages/admin/HRS03ReadinessExplanation.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_READINESS_FACTORS | import | `import { DEMO_READINESS_FACTORS } from "@/data/seed/health-signals";` |
| 7 | DEMO_COMBINE_STRATEGIES | import | `import { DEMO_COMBINE_STRATEGIES } from "@/data/seed/admin-platform";` |
| 12 | DEMO_PIPELINE_STAGES | declaration | `const DEMO_PIPELINE_STAGES: any[] = [];` |
| 41 | DEMO_PIPELINE_STAGES | usage | `{([] as typeof DEMO_PIPELINE_STAGES).map((s, i) => (` |
| 66 | DEMO_READINESS_FACTORS | usage | `{([] as typeof DEMO_READINESS_FACTORS).map((l) => (` |
| 111 | DEMO_COMBINE_STRATEGIES | usage | `{([] as typeof DEMO_COMBINE_STRATEGIES).map((s) => (` |

## `/dev-server/src/pages/admin/HRS04NotificationInfluence.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_SUPPRESSION_RULES | import | `import { DEMO_SUPPRESSION_RULES, DEMO_TIMING_RULES, DEMO_OVERRIDE_MATRIX } from "@/data/seed/notification-calm";` |
| 11 | DEMO_SUPPRESSION_RULES | usage | `const suppressionRules = (posture as never[])?.length ? posture : DEMO_SUPPRESSION_RULES;` |
| 12 | DEMO_TIMING_RULES | usage | `const timingRules = DEMO_TIMING_RULES;` |
| 13 | DEMO_OVERRIDE_MATRIX | usage | `const overrideMatrix = DEMO_OVERRIDE_MATRIX;` |

## `/dev-server/src/pages/admin/HRS05AssistantTimingBoard.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_TIMING_RULES | import | `import { DEMO_TIMING_RULES, DEMO_BRIEFING_WINDOWS, DEMO_HOLD_VS_ACT } from "@/data/seed/health-signals";` |
| 9 | DEMO_BRIEFING_WINDOWS | usage | `const BRIEFING_WINDOWS = DEMO_BRIEFING_WINDOWS;` |
| 10 | DEMO_HOLD_VS_ACT | usage | `const HOLD_VS_ACT = DEMO_HOLD_VS_ACT;` |
| 42 | DEMO_TIMING_RULES | usage | `{([] as typeof DEMO_TIMING_RULES).map((r) => (` |

## `/dev-server/src/pages/admin/IncidentCommandCenter.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 15 | DEMO_INCIDENTS | import | `import { type DemoIncident as Incident, type Severity, type IncidentStatus, DEMO_INCIDENTS } from "@/data/seed/incidents` |
| 65 | DEMO_INCIDENTS | usage | `const incidents = DEMO_INCIDENTS;` |

## `/dev-server/src/pages/admin/IntegrationConciergePage.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_USE_CASES | import | `import { DEMO_USE_CASES } from "@/data/seed/admin-platform";` |
| 17 | DEMO_RECOMMENDATIONS | declaration | `const DEMO_RECOMMENDATIONS = [` |
| 25 | DEMO_WORKFLOWS | declaration | `const DEMO_WORKFLOWS = [` |
| 31 | DEMO_SIMULATIONS | declaration | `const DEMO_SIMULATIONS = [` |
| 40 | DEMO_USE_CASES | usage | `const filtered = ([] as typeof DEMO_USE_CASES).filter(uc => uc.title.toLowerCase().includes(search.toLowerCase()));` |
| 123 | DEMO_RECOMMENDATIONS | usage | `{([] as typeof DEMO_RECOMMENDATIONS).map(r => (` |
| 141 | DEMO_WORKFLOWS | usage | `{([] as typeof DEMO_WORKFLOWS).map(wf => (` |
| 169 | DEMO_SIMULATIONS | usage | `{([] as typeof DEMO_SIMULATIONS).map(sim => (` |

## `/dev-server/src/pages/admin/InvestorProofLedger.tsx` (16 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_PROOF_ENTRIES | import | `import { DEMO_PROOF_ENTRIES } from "@/data/seed/admin-platform";` |
| 15 | DEMO_BUNDLES | declaration | `const DEMO_BUNDLES = [` |
| 21 | DEMO_MIGRATIONS | declaration | `const DEMO_MIGRATIONS = [` |
| 27 | DEMO_ROLLBACK_EVIDENCE | declaration | `const DEMO_ROLLBACK_EVIDENCE = [` |
| 33 | DEMO_COMPLIANCE | declaration | `const DEMO_COMPLIANCE = [` |
| 42 | DEMO_PROOF_ENTRIES | usage | `const fullProof = ([] as typeof DEMO_PROOF_ENTRIES).filter(p => p.proofChain.every(s => s.status === "verified")).length` |
| 61 | DEMO_PROOF_ENTRIES | usage | `{ label: "Full Proof", value: `${fullProof}/${([] as typeof DEMO_PROOF_ENTRIES).length}`, color: "text-emerald-500" },` |
| 62 | DEMO_PROOF_ENTRIES | usage | `{ label: "Rollback Evidence", value: String(([] as typeof DEMO_PROOF_ENTRIES).filter(p => p.rollbackEvidence).length), c` |
| 63 | DEMO_PROOF_ENTRIES | usage | `{ label: "Exportable", value: String(([] as typeof DEMO_PROOF_ENTRIES).filter(p => p.exportable).length), color: "text-f` |
| 64 | DEMO_BUNDLES | usage | `{ label: "Evidence Bundles", value: String(([] as typeof DEMO_BUNDLES).length), color: "text-blue-500" },` |
| 65 | DEMO_COMPLIANCE | usage | `{ label: "Compliance Trails", value: String(([] as typeof DEMO_COMPLIANCE).filter(c => c.status === "compliant").length)` |
| 91 | DEMO_PROOF_ENTRIES | usage | `{([] as typeof DEMO_PROOF_ENTRIES).map(p => (` |
| 123 | DEMO_BUNDLES | usage | `{([] as typeof DEMO_BUNDLES).map(b => (` |
| 146 | DEMO_MIGRATIONS | usage | `{([] as typeof DEMO_MIGRATIONS).map(m => (` |
| 167 | DEMO_ROLLBACK_EVIDENCE | usage | `{([] as typeof DEMO_ROLLBACK_EVIDENCE).map(r => (` |
| 187 | DEMO_COMPLIANCE | usage | `{([] as typeof DEMO_COMPLIANCE).map(c => (` |

## `/dev-server/src/pages/admin/LaunchReadinessBoard.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_BLOCKERS | import | `import { DEMO_BLOCKERS } from "@/data/seed/admin-platform";` |
| 14 | DEMO_READINESS_CHECKS | declaration | `const DEMO_READINESS_CHECKS: any[] = [];` |
| 62 | DEMO_BLOCKERS | usage | `const openBlockers = ([] as typeof DEMO_BLOCKERS).filter(b => b.status === "open").length;` |
| 63 | DEMO_READINESS_CHECKS | usage | `const allChecks = ([] as typeof DEMO_READINESS_CHECKS).flatMap(r => r.checks);` |
| 89 | DEMO_BLOCKERS | usage | `{ label: "Accepted Risks", value: ([] as typeof DEMO_BLOCKERS).filter(b => b.status === "accepted-risk").length, color: ` |
| 105 | DEMO_BLOCKERS | usage | `{ value: "blockers", label: `Blockers (${([] as typeof DEMO_BLOCKERS).length})`, icon: AlertTriangle },` |
| 115 | DEMO_BLOCKERS | usage | `{([] as typeof DEMO_BLOCKERS).map((blocker, idx) => {` |
| 165 | DEMO_READINESS_CHECKS | usage | `{([] as typeof DEMO_READINESS_CHECKS).map(category => {` |

## `/dev-server/src/pages/admin/MemoryContinuityCenter.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 12 | DEMO_PRIVACY_TIERS | import | `import { DEMO_PRIVACY_TIERS } from "@/data/seed/admin-platform";` |
| 16 | DEMO_SCOPES | declaration | `const DEMO_SCOPES: any[] = [];` |
| 77 | DEMO_PRIVACY_TIERS | usage | `{([] as unknown as typeof DEMO_PRIVACY_TIERS).map(tier => {` |
| 100 | DEMO_SCOPES | usage | `{([] as unknown as typeof DEMO_SCOPES).map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}` |
| 107 | DEMO_PRIVACY_TIERS | usage | `{([] as unknown as typeof DEMO_PRIVACY_TIERS).map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectI` |

## `/dev-server/src/pages/admin/MissionControlHome.tsx` (9 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 15 | DEMO_URGENT_ACTIONS | import | `import { DEMO_URGENT_ACTIONS } from "@/data/seed/admin-platform";` |
| 16 | DEMO_MUTATIONS | import | `import { DEMO_MUTATIONS } from "@/data/seed/durability";` |
| 40 | DEMO_SERVICES | declaration | `const DEMO_SERVICES: any[] = [];` |
| 82 | DEMO_SERVICES | usage | `const healthyCount = ([] as typeof DEMO_SERVICES).filter(s => s.status === "healthy").length;` |
| 83 | DEMO_SERVICES | usage | `const overallHealth: HealthStatus = ([] as typeof DEMO_SERVICES).some(s => s.status === "critical") ? "critical" : ([] a` |
| 85 | DEMO_MUTATIONS | usage | `const pendingMutations = ([] as typeof DEMO_MUTATIONS).filter(m => m.durabilityStatus === "pending").length;` |
| 86 | DEMO_MUTATIONS | usage | `const failedMutations = ([] as typeof DEMO_MUTATIONS).filter(m => m.durabilityStatus === "failed").length;` |
| 183 | DEMO_SERVICES | usage | `{([] as typeof DEMO_SERVICES).map((svc) => (` |
| 209 | DEMO_URGENT_ACTIONS | usage | `{([] as typeof DEMO_URGENT_ACTIONS).map((a) => (` |

## `/dev-server/src/pages/admin/MockEliminationCenter.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_DOMAIN_MIGRATIONS | import | `import { DEMO_DOMAIN_MIGRATIONS } from "@/data/seed/admin-platform";` |
| 36 | DEMO_DOMAIN_MIGRATIONS | usage | `const totalPages = DEMO_DOMAIN_MIGRATIONS.reduce((s, d) => s + d.totalPages, 0);` |
| 37 | DEMO_DOMAIN_MIGRATIONS | usage | `const migratedPages = DEMO_DOMAIN_MIGRATIONS.reduce((s, d) => s + d.migratedPages, 0);` |
| 39 | DEMO_DOMAIN_MIGRATIONS | usage | `const domainsConverted = DEMO_DOMAIN_MIGRATIONS.filter(d => d.status !== "mock_direct" && d.status !== "blocked").length` |
| 49 | DEMO_DOMAIN_MIGRATIONS | usage | `{ label: "Domains Converted", value: `${domainsConverted}/${DEMO_DOMAIN_MIGRATIONS.length}`, sub: "off direct mocks" },` |
| 75 | DEMO_DOMAIN_MIGRATIONS | usage | `{DEMO_DOMAIN_MIGRATIONS.map(d => {` |

## `/dev-server/src/pages/admin/MockReplacementProgram.tsx` (10 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 18 | DEMO_MOCK_TYPES | import | `import { DEMO_MOCK_TYPES, DEMO_PRIORITIES } from "@/data/seed/admin-platform";` |
| 21 | DEMO_STATUSES | declaration | `const DEMO_STATUSES: any[] = [];` |
| 25 | DEMO_CUSTOMERS | declaration | `const DEMO_CUSTOMERS: any[] = [];` |
| 84 | DEMO_MOCK_TYPES | usage | `<SelectContent>{DEMO_MOCK_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectCont` |
| 95 | DEMO_PRIORITIES | usage | `<SelectContent>{DEMO_PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</Select` |
| 131 | DEMO_PRIORITIES | usage | `DEMO_PRIORITIES.forEach(p => { map[p] = { total: 0, done: 0, blocked: 0 }; });` |
| 144 | DEMO_PRIORITIES | usage | `{DEMO_PRIORITIES.map(p => {` |
| 339 | DEMO_STATUSES | usage | `{DEMO_STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}` |
| 346 | DEMO_PRIORITIES | usage | `{DEMO_PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}` |
| 388 | DEMO_STATUSES | usage | `<SelectContent>{DEMO_STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>)}</SelectCont` |

## `/dev-server/src/pages/admin/NRC01RoutingStudio.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_CHANNEL_SPECS | import | `import { DEMO_CHANNEL_SPECS, DEMO_DELIVERY_PRINCIPLES } from "@/data/seed/notification-calm";` |
| 11 | DEMO_CHANNEL_SPECS | usage | `const channelSpecs = DEMO_CHANNEL_SPECS;` |
| 12 | DEMO_DELIVERY_PRINCIPLES | usage | `const deliveryPrinciples = DEMO_DELIVERY_PRINCIPLES;` |

## `/dev-server/src/pages/admin/NRC02CalmnessCenter.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_CALM_PRINCIPLES | import | `import { DEMO_CALM_PRINCIPLES, DEMO_INTERVENTION_SCENARIOS } from "@/data/seed/notification-calm";` |
| 11 | DEMO_CALM_PRINCIPLES | usage | `const calmPrinciples = DEMO_CALM_PRINCIPLES;` |
| 13 | DEMO_INTERVENTION_SCENARIOS | usage | `const interventions = DEMO_INTERVENTION_SCENARIOS;` |

## `/dev-server/src/pages/admin/NRC03FatigueBoard.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_SUPPRESSION_ACTIONS | import | `import { DEMO_SUPPRESSION_ACTIONS, DEMO_OVERLOAD_TRIGGERS } from "@/data/seed/notification-calm";` |
| 11 | DEMO_SUPPRESSION_ACTIONS | usage | `const suppressionActions = DEMO_SUPPRESSION_ACTIONS;` |
| 12 | DEMO_OVERLOAD_TRIGGERS | usage | `const overloadTriggers = DEMO_OVERLOAD_TRIGGERS;` |

## `/dev-server/src/pages/admin/NRC04QueueInterruptMatrix.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_DELIVERY_TYPES | import | `import { DEMO_DELIVERY_TYPES, DEMO_QUICK_ACTIONS } from "@/data/seed/notification-calm";` |
| 11 | DEMO_DELIVERY_TYPES | usage | `const deliveryTypes = DEMO_DELIVERY_TYPES;` |
| 12 | DEMO_QUICK_ACTIONS | usage | `const quickActions = DEMO_QUICK_ACTIONS;` |

## `/dev-server/src/pages/admin/NSS01StrategyBoard.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_STRATEGY_PRINCIPLES | import | `import { DEMO_STRATEGY_PRINCIPLES, DEMO_ARCHITECTURE_LAYERS } from "@/data/seed/native-shell";` |
| 71 | DEMO_STRATEGY_PRINCIPLES | usage | `{([] as typeof DEMO_STRATEGY_PRINCIPLES).map((p) => (` |
| 90 | DEMO_ARCHITECTURE_LAYERS | usage | `{([] as typeof DEMO_ARCHITECTURE_LAYERS).map((l) => (` |

## `/dev-server/src/pages/admin/NSS03TrustContinuity.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_SECURE_ACTIONS | import | `import { DEMO_SECURE_ACTIONS, DEMO_CONTINUITY_FLOWS, DEMO_TRUST_CONTINUITY } from "@/data/seed/native-shell";` |
| 9 | DEMO_SECURE_ACTIONS | usage | `const secureActions = DEMO_SECURE_ACTIONS;` |
| 10 | DEMO_CONTINUITY_FLOWS | usage | `const continuityFlows = DEMO_CONTINUITY_FLOWS;` |
| 11 | DEMO_TRUST_CONTINUITY | usage | `const trustContinuity = DEMO_TRUST_CONTINUITY;` |

## `/dev-server/src/pages/admin/OutcomeEconomicsDashboard.tsx` (11 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 28 | DEMO_OUTCOMES | declaration | `const DEMO_OUTCOMES: OutcomeROI[] = [` |
| 50 | DEMO_PATHS | declaration | `const DEMO_PATHS: ReasoningPath[] = [` |
| 67 | DEMO_INCIDENTS | declaration | `const DEMO_INCIDENTS: IncidentMetric[] = [` |
| 84 | DEMO_BENCHMARKS | declaration | `const DEMO_BENCHMARKS: Benchmark[] = [` |
| 116 | DEMO_OUTCOMES | usage | `const totalCost = ([] as typeof DEMO_OUTCOMES).reduce((s, o) => s + o.totalCost, 0);` |
| 117 | DEMO_OUTCOMES | usage | `const totalValue = ([] as typeof DEMO_OUTCOMES).reduce((s, o) => s + o.totalValue, 0);` |
| 118 | DEMO_OUTCOMES | usage | `const totalOutcomes = ([] as typeof DEMO_OUTCOMES).reduce((s, o) => s + o.outcomes, 0);` |
| 171 | DEMO_OUTCOMES | usage | `{([] as typeof DEMO_OUTCOMES).map((o) => (` |
| 206 | DEMO_PATHS | usage | `{([] as typeof DEMO_PATHS).map((p) => (` |
| 235 | DEMO_INCIDENTS | usage | `{([] as typeof DEMO_INCIDENTS).map((inc) => (` |
| 264 | DEMO_BENCHMARKS | usage | `{([] as typeof DEMO_BENCHMARKS).map((b) => {` |

## `/dev-server/src/pages/admin/PersistenceStatus.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_CORE_SERVICES | declaration | `const DEMO_CORE_SERVICES: any[] = [];` |
| 95 | DEMO_CORE_SERVICES | usage | `const allWired = ([] as typeof DEMO_CORE_SERVICES).every(s => s.wired);` |
| 119 | DEMO_CORE_SERVICES | usage | `{([] as typeof DEMO_CORE_SERVICES).filter(s => s.wired).length}/{([] as typeof DEMO_CORE_SERVICES).length} services dura` |
| 144 | DEMO_CORE_SERVICES | usage | `{([] as typeof DEMO_CORE_SERVICES).map((svc) => {` |

## `/dev-server/src/pages/admin/PolicySimulator.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_DRAFTS | import | `import { DEMO_DRAFTS } from "@/data/seed/admin-platform";` |
| 91 | DEMO_DRAFTS | usage | `{ value: "drafts", label: `Policies (${([] as typeof DEMO_DRAFTS).length})`, icon: FileText },` |
| 102 | DEMO_DRAFTS | usage | `{([] as typeof DEMO_DRAFTS).map((policy, idx) => {` |

## `/dev-server/src/pages/admin/ProofMatrixExplorer.tsx` (15 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 12 | DEMO_PROOFS | import | `import { DEMO_PROOFS } from "@/data/seed/admin-platform";` |
| 61 | DEMO_PROOFS | usage | `const filtered = ([] as typeof DEMO_PROOFS).filter(p => {` |
| 67 | DEMO_PROOFS | usage | `const verifiedCount = ([] as typeof DEMO_PROOFS).filter(p => p.verified).length;` |
| 68 | DEMO_PROOFS | usage | `const withReceipts = ([] as typeof DEMO_PROOFS).filter(p => p.receiptId).length;` |
| 69 | DEMO_PROOFS | usage | `const totalEvidence = ([] as typeof DEMO_PROOFS).reduce((s, p) => s + p.evidenceCount, 0);` |
| 72 | DEMO_PROOFS | usage | `const domainCoverage = ([] as typeof DEMO_PROOFS).reduce((acc, p) => {` |
| 90 | DEMO_PROOFS | usage | `{ label: "Total Proofs", value: ([] as typeof DEMO_PROOFS).length, color: "text-foreground" },` |
| 91 | DEMO_PROOFS | usage | `{ label: "Verified", value: `${verifiedCount}/${([] as typeof DEMO_PROOFS).length}`, color: "text-emerald-400" },` |
| 92 | DEMO_PROOFS | usage | `{ label: "With Receipts", value: `${withReceipts}/${([] as typeof DEMO_PROOFS).length}`, color: "text-blue-400" },` |
| 94 | DEMO_PROOFS | usage | `{ label: "Rollbackable", value: ([] as typeof DEMO_PROOFS).filter(p => p.rollbackEligible).length, color: "text-amber-40` |
| 204 | DEMO_PROOFS | usage | `<Progress value={(count / ([] as typeof DEMO_PROOFS).length) * 100} className="h-1.5" />` |
| 205 | DEMO_PROOFS | usage | `<p className="text-[10px] text-muted-foreground mt-1">{Math.round((count / ([] as typeof DEMO_PROOFS).length) * 100)}% o` |
| 214 | DEMO_PROOFS | usage | `const count = ([] as typeof DEMO_PROOFS).filter(p => p.finality === f).length;` |
| 218 | DEMO_PROOFS | usage | `<div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden"><div className="h-full bg-primary/60 rounded-full" ` |
| 230 | DEMO_PROOFS | usage | `{([] as typeof DEMO_PROOFS).filter(p => p.chain.length >= 3).map(proof => (` |

## `/dev-server/src/pages/admin/RealityClassificationMatrix.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 19 | DEMO_CONTRACT_STATUSES | import | `import { DEMO_CONTRACT_STATUSES } from "@/data/seed/admin-platform";` |
| 183 | DEMO_CONTRACT_STATUSES | usage | `<SelectContent>{([] as unknown as typeof DEMO_CONTRACT_STATUSES).map(s => <SelectItem key={s} value={s} className="capit` |

## `/dev-server/src/pages/admin/RevenueAutopilotMonitor.tsx` (21 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_AUTOPILOT_ACTIONS | import | `import { DEMO_AUTOPILOT_ACTIONS, DEMO_WINBACKS } from "@/data/seed/admin-platform";` |
| 16 | DEMO_RECOVERED | declaration | `const DEMO_RECOVERED = [` |
| 23 | DEMO_SAVED_COSTS | declaration | `const DEMO_SAVED_COSTS = [` |
| 31 | DEMO_HEALTH | declaration | `const DEMO_HEALTH = {` |
| 43 | DEMO_RECOVERED | usage | `const totalRecovered = ([] as typeof DEMO_RECOVERED).reduce((s, r) => s + r.value, 0);` |
| 44 | DEMO_SAVED_COSTS | usage | `const totalSaved = ([] as typeof DEMO_SAVED_COSTS).reduce((s, c) => s + c.savedUsd, 0);` |
| 62 | DEMO_AUTOPILOT_ACTIONS | usage | `{ label: "Autopilot Actions", value: String(([] as typeof DEMO_AUTOPILOT_ACTIONS).length), icon: Zap, color: "text-prima` |
| 63 | DEMO_WINBACKS | usage | `{ label: "Win-Back Queue", value: String(([] as typeof DEMO_WINBACKS).length), icon: Target, color: "text-amber-500" },` |
| 64 | DEMO_HEALTH | usage | `{ label: "Uptime", value: `${DEMO_HEALTH.automationUptime}%`, icon: Activity, color: "text-emerald-500" },` |
| 91 | DEMO_AUTOPILOT_ACTIONS | usage | `{([] as typeof DEMO_AUTOPILOT_ACTIONS).map(a => (` |
| 109 | DEMO_RECOVERED | usage | `{([] as typeof DEMO_RECOVERED).map(r => (` |
| 131 | DEMO_SAVED_COSTS | usage | `{([] as typeof DEMO_SAVED_COSTS).map(c => (` |
| 155 | DEMO_WINBACKS | usage | `{([] as typeof DEMO_WINBACKS).map(w => (` |
| 179 | DEMO_HEALTH | usage | `{ label: "Uptime", value: `${DEMO_HEALTH.automationUptime}%`, good: true },` |
| 180 | DEMO_HEALTH | usage | `{ label: "Active Rules", value: String(DEMO_HEALTH.activeRules), good: true },` |
| 181 | DEMO_HEALTH | usage | `{ label: "Paused Rules", value: String(DEMO_HEALTH.pausedRules), good: DEMO_HEALTH.pausedRules === 0 },` |
| 182 | DEMO_HEALTH | usage | `{ label: "Daily Actions", value: String(DEMO_HEALTH.dailyActions), good: true },` |
| 183 | DEMO_HEALTH | usage | `{ label: "Confidence Floor", value: `${(DEMO_HEALTH.confidenceFloor * 100).toFixed(0)}%`, good: true },` |
| 184 | DEMO_HEALTH | usage | `{ label: "Safety Overrides", value: String(DEMO_HEALTH.safetyOverrides), good: false },` |
| 185 | DEMO_HEALTH | usage | `{ label: "Last Failure", value: new Date(DEMO_HEALTH.lastFailure).toLocaleDateString(), good: true },` |
| 201 | DEMO_RECOVERED | usage | `{([] as typeof DEMO_RECOVERED).map(r => (` |

## `/dev-server/src/pages/admin/RouteSourceDiagnostics.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 15 | DEMO_ROUTES | import | `import { DEMO_ROUTES } from "@/data/seed/admin-platform";` |
| 43 | DEMO_ROUTES | usage | `if (!search) return DEMO_ROUTES;` |
| 45 | DEMO_ROUTES | usage | `return ([] as typeof DEMO_ROUTES).filter(r => r.path.includes(q) \|\| r.pageName.toLowerCase().includes(q) \|\| r.domain.toL` |
| 48 | DEMO_ROUTES | usage | `const truthful = ([] as typeof DEMO_ROUTES).filter(r => r.launchHonesty === "truthful").length;` |
| 49 | DEMO_ROUTES | usage | `const demoBacked = ([] as typeof DEMO_ROUTES).filter(r => r.launchHonesty === "demo-backed").length;` |
| 50 | DEMO_ROUTES | usage | `const mixed = ([] as typeof DEMO_ROUTES).filter(r => r.launchHonesty === "mixed").length;` |

## `/dev-server/src/pages/admin/SERV04ServiceDuplication.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_SHADOW_PATTERNS | import | `import { DEMO_SHADOW_PATTERNS } from "@/data/seed/admin-platform";` |
| 101 | DEMO_SHADOW_PATTERNS | usage | `<div className="text-2xl font-bold text-amber-400">{([] as typeof DEMO_SHADOW_PATTERNS).length}</div>` |
| 157 | DEMO_SHADOW_PATTERNS | usage | `{([] as typeof DEMO_SHADOW_PATTERNS).map((p) => (` |

## `/dev-server/src/pages/admin/SecurityPostureBoard.tsx` (17 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_POSTURE | import | `import { DEMO_POSTURE } from "@/data/seed/admin-platform";` |
| 17 | DEMO_SECRETS | declaration | `const DEMO_SECRETS = [` |
| 25 | DEMO_CLASSIFICATION | declaration | `const DEMO_CLASSIFICATION = [` |
| 33 | DEMO_KEY_ROTATION | declaration | `const DEMO_KEY_ROTATION = [` |
| 42 | DEMO_POSTURE | usage | `const fullEncryption = ([] as typeof DEMO_POSTURE).filter(p => p.encryption === "full").length;` |
| 43 | DEMO_POSTURE | usage | `const allRls = ([] as typeof DEMO_POSTURE).filter(p => p.rlsEnabled).length;` |
| 44 | DEMO_POSTURE | usage | `const totalGaps = ([] as typeof DEMO_POSTURE).reduce((s, p) => s + p.gaps.length, 0);` |
| 45 | DEMO_SECRETS | usage | `const verifiedSecrets = ([] as typeof DEMO_SECRETS).filter(s => s.status === "verified").length;` |
| 62 | DEMO_POSTURE | usage | `{ label: "Encryption Coverage", value: `${fullEncryption}/${([] as typeof DEMO_POSTURE).length}`, color: fullEncryption ` |
| 63 | DEMO_POSTURE | usage | `{ label: "RLS Enabled", value: `${allRls}/${([] as typeof DEMO_POSTURE).length}`, color: allRls === ([] as typeof DEMO_P` |
| 64 | DEMO_SECRETS | usage | `{ label: "Secrets Verified", value: `${verifiedSecrets}/${([] as typeof DEMO_SECRETS).length}`, color: verifiedSecrets =` |
| 66 | DEMO_KEY_ROTATION | usage | `{ label: "Key Rotation", value: ([] as typeof DEMO_KEY_ROTATION).some(k => k.status === "due-soon") ? "Due soon" : "On s` |
| 85 | DEMO_POSTURE | usage | `{([] as typeof DEMO_POSTURE).map((p) => (` |
| 113 | DEMO_SECRETS | usage | `{([] as typeof DEMO_SECRETS).map(s => (` |
| 137 | DEMO_CLASSIFICATION | usage | `{([] as typeof DEMO_CLASSIFICATION).map(c => (` |
| 160 | DEMO_KEY_ROTATION | usage | `{([] as typeof DEMO_KEY_ROTATION).map(k => (` |
| 180 | DEMO_POSTURE | usage | `{([] as typeof DEMO_POSTURE).filter(p => p.gaps.length > 0).map(p => (` |

## `/dev-server/src/pages/admin/SimulatedCoreServicesBoard.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_CORE_SERVICES | declaration | `const DEMO_CORE_SERVICES: any[] = [];` |
| 34 | DEMO_CORE_SERVICES | usage | `const count = ([] as typeof DEMO_CORE_SERVICES).filter(s => s.stateLossSeverity === sev).length;` |
| 61 | DEMO_CORE_SERVICES | usage | `{([] as typeof DEMO_CORE_SERVICES).map(s => {` |

## `/dev-server/src/pages/admin/TeamManagement.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 26 | DEMO_ADVISOR_TYPE_OPTIONS | import | `import { DEMO_ADVISOR_TYPE_OPTIONS, DEMO_DOMAIN_OPTIONS } from "@/data/seed/admin-platform";` |
| 430 | DEMO_DOMAIN_OPTIONS | usage | `<SelectContent>{([] as typeof DEMO_DOMAIN_OPTIONS).map(d => <SelectItem key={d} value={d} className="capitalize">{d}</Se` |
| 437 | DEMO_ADVISOR_TYPE_OPTIONS | usage | `<SelectContent>{([] as typeof DEMO_ADVISOR_TYPE_OPTIONS).map(t => <SelectItem key={t} value={t} className="capitalize">{` |

## `/dev-server/src/pages/admin/TrustStateRegistry.tsx` (15 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 63 | usage | `const { isDemoMode } = useDataMode();` |
| 83 | usage | `const { isDemoMode } = useDataMode();` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 36 | DEMO_DOMAINS | declaration | `const DEMO_DOMAINS: DomainTrust[] = [` |
| 47 | DEMO_PROOF_NODES | declaration | `const DEMO_PROOF_NODES: ProofNode[] = [` |
| 56 | DEMO_DEGRADED | declaration | `const DEMO_DEGRADED = [` |
| 85 | DEMO_DOMAINS | usage | `const overallScore = Math.round(([] as typeof DEMO_DOMAINS).reduce((sum, d) => sum + d.proofCoverage, 0) / ([] as typeof` |
| 86 | DEMO_DOMAINS | usage | `const verifiedCount = ([] as typeof DEMO_DOMAINS).filter(d => d.status === "verified").length;` |
| 104 | DEMO_DOMAINS | usage | `{ label: "Domains Verified", value: `${verifiedCount}/${([] as typeof DEMO_DOMAINS).length}`, color: "text-foreground" }` |
| 105 | DEMO_PROOF_NODES | usage | `{ label: "Proof Links Active", value: String(([] as typeof DEMO_PROOF_NODES).filter(n => n.status === "verified").length` |
| 106 | DEMO_DEGRADED | usage | `{ label: "Degraded Surfaces", value: String(([] as typeof DEMO_DEGRADED).length), color: ([] as typeof DEMO_DEGRADED).le` |
| 129 | DEMO_DOMAINS | usage | `{([] as typeof DEMO_DOMAINS).map(d => (` |
| 172 | DEMO_PROOF_NODES | usage | `{([] as typeof DEMO_PROOF_NODES).map(node => (` |
| 195 | DEMO_DEGRADED | usage | `{([] as typeof DEMO_DEGRADED).length === 0 ? (` |
| 198 | DEMO_DEGRADED | usage | `([] as typeof DEMO_DEGRADED).map((d, i) => (` |
| 222 | DEMO_DOMAINS | usage | `{([] as typeof DEMO_DOMAINS).map(d => (` |

## `/dev-server/src/pages/admin/TruthIndexDashboard.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 13 | DEMO_INDEX_CONFIG | import | `import { DEMO_INDEX_CONFIG } from "@/data/seed/admin-platform";` |
| 72 | DEMO_INDEX_CONFIG | usage | `{([] as unknown as typeof DEMO_INDEX_CONFIG).map(cfg => {` |

## `/dev-server/src/pages/admin/WorkflowReplayAudit.tsx` (1 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 13 | DEMO_RUNS | declaration | `const DEMO_RUNS: any[] = [];` |

## `/dev-server/src/pages/admin/cloud/CloudGovernanceAdmin.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 23 | DEMO_TRUST_DEVICES | declaration | `const DEMO_TRUST_DEVICES = [` |
| 161 | DEMO_TRUST_DEVICES | usage | `{([] as typeof DEMO_TRUST_DEVICES).map(d => (` |

## `/dev-server/src/pages/admin/cloud/CloudSharingAdmin.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 17 | DEMO_SHARES | declaration | `const DEMO_SHARES = [` |
| 24 | DEMO_WORKSPACES | declaration | `const DEMO_WORKSPACES = [` |
| 47 | DEMO_SHARES | usage | `{ label: "Shared Objects", value: stats.totalSharedObjects \|\| ([] as typeof DEMO_SHARES).length, icon: Share2, color: "t` |
| 50 | DEMO_WORKSPACES | usage | `{ label: "Workspaces", value: stats.activeWorkspaces \|\| ([] as typeof DEMO_WORKSPACES).length, icon: Folder, color: "tex` |
| 89 | DEMO_SHARES | usage | `{([] as typeof DEMO_SHARES).map(share => (` |
| 188 | DEMO_WORKSPACES | usage | `{([] as typeof DEMO_WORKSPACES).map(ws => (` |

## `/dev-server/src/pages/admin/fip/FIPGeneratedTruthBoard.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_GENERATED_ARTIFACTS | import | `import { DEMO_GENERATED_ARTIFACTS } from "@/data/seed/admin-platform";` |
| 27 | DEMO_GENERATED_ARTIFACTS | usage | `<Card><CardContent className="pt-4"><p className="text-2xl font-bold">{([] as typeof DEMO_GENERATED_ARTIFACTS).length}</` |
| 34 | DEMO_GENERATED_ARTIFACTS | usage | `{([] as typeof DEMO_GENERATED_ARTIFACTS).map(artifact => {` |

## `/dev-server/src/pages/admin/fip/FIPObservabilityCenter.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_OBSERVABILITY_FIELDS | import | `import { DEMO_OBSERVABILITY_FIELDS } from "@/data/seed/admin-platform";` |
| 34 | DEMO_OBSERVABILITY_FIELDS | usage | `{([] as typeof DEMO_OBSERVABILITY_FIELDS).map(field => {` |

## `/dev-server/src/pages/admin/fip/FIPRolloutPlanner.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_ROLLOUT_RINGS | import | `import { DEMO_ROLLOUT_RINGS } from "@/data/seed/admin-platform";` |
| 38 | DEMO_ROLLOUT_RINGS | usage | `{([] as typeof DEMO_ROLLOUT_RINGS).map(ring => {` |

## `/dev-server/src/pages/admin/fip/FIPSpecStudio.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 14 | DEMO_SPEC_SECTIONS | import | `import { DEMO_SPEC_SECTIONS } from "@/data/seed/admin-platform";` |
| 24 | DEMO_SPEC_SECTIONS | usage | `const missing = ([] as typeof DEMO_SPEC_SECTIONS).filter(s => s !== 'outcome_statement' \|\| !form.outcome_statement);` |

## `/dev-server/src/pages/admin/intelligence/CrossTenantGovernance.tsx` (10 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_ENTERPRISE_EXCLUSIONS | import | `import { DEMO_ENTERPRISE_EXCLUSIONS, DEMO_RESTRICTED_DOMAINS } from "@/data/seed/admin-intelligence";` |
| 14 | DEMO_PATTERNS | declaration | `const DEMO_PATTERNS: any[] = [];` |
| 20 | DEMO_PATTERNS | usage | `const approved = ([] as typeof DEMO_PATTERNS).filter(p => p.approved).length;` |
| 21 | DEMO_PATTERNS | usage | `const pending = ([] as typeof DEMO_PATTERNS).filter(p => !p.approved && p.tenants > 0).length;` |
| 22 | DEMO_PATTERNS | usage | `const blocked = ([] as typeof DEMO_PATTERNS).filter(p => p.tenants === 0).length;` |
| 34 | DEMO_PATTERNS | usage | `{ label: "Total Patterns", value: String(([] as typeof DEMO_PATTERNS).length) },` |
| 67 | DEMO_PATTERNS | usage | `{([] as typeof DEMO_PATTERNS).map(p => (` |
| 97 | DEMO_RESTRICTED_DOMAINS | usage | `{([] as typeof DEMO_RESTRICTED_DOMAINS).map(d => <Badge key={d} variant="destructive" className="text-[9px]">{d}</Badge>` |
| 104 | DEMO_ENTERPRISE_EXCLUSIONS | usage | `{([] as typeof DEMO_ENTERPRISE_EXCLUSIONS).map(e => <Badge key={e} variant="outline" className="text-[9px]">{e}</Badge>)` |
| 125 | DEMO_PATTERNS | usage | `{([] as typeof DEMO_PATTERNS).map(p => (` |

## `/dev-server/src/pages/admin/intelligence/DifferentialReasoningExplorer.tsx` (9 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 14 | DEMO_DIFFS | declaration | `const DEMO_DIFFS: any[] = [];` |
| 27 | DEMO_DIFFS | usage | `const totalSaved = ([] as typeof DEMO_DIFFS).reduce((s, d) => s + (d.costFull - d.costActual), 0);` |
| 28 | DEMO_DIFFS | usage | `const reuseCount = ([] as typeof DEMO_DIFFS).filter(d => d.action === "reuse-as-is").length;` |
| 29 | DEMO_DIFFS | usage | `const partialCount = ([] as typeof DEMO_DIFFS).filter(d => d.action === "partial-update").length;` |
| 30 | DEMO_DIFFS | usage | `const fullCount = ([] as typeof DEMO_DIFFS).filter(d => d.action === "full-reanalysis").length;` |
| 31 | DEMO_DIFFS | usage | `const totalPreserved = ([] as typeof DEMO_DIFFS).reduce((s, d) => s + d.preserved, 0);` |
| 32 | DEMO_DIFFS | usage | `const totalInvalidated = ([] as typeof DEMO_DIFFS).reduce((s, d) => s + d.invalidated, 0);` |
| 81 | DEMO_DIFFS | usage | `{([] as typeof DEMO_DIFFS).map(d => (` |
| 109 | DEMO_DIFFS | usage | `{([] as typeof DEMO_DIFFS).filter(d => d.changes.length > 0).map(d => (` |

## `/dev-server/src/pages/admin/intelligence/EscalationControlCenter.tsx` (9 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_ESCALATIONS | import | `import { DEMO_ESCALATIONS } from "@/data/seed/admin-intelligence";` |
| 32 | DEMO_ESCALATIONS | usage | `const totalCost = ([] as typeof DEMO_ESCALATIONS).reduce((s, e) => s + e.cost, 0);` |
| 33 | DEMO_ESCALATIONS | usage | `const justified = ([] as typeof DEMO_ESCALATIONS).filter(e => e.justified).length;` |
| 34 | DEMO_ESCALATIONS | usage | `const unnecessary = ([] as typeof DEMO_ESCALATIONS).filter(e => !e.justified).length;` |
| 35 | DEMO_ESCALATIONS | usage | `const accepted = ([] as typeof DEMO_ESCALATIONS).filter(e => e.outcome === "accepted").length;` |
| 37 | DEMO_ESCALATIONS | usage | `const byTrigger = ([] as typeof DEMO_ESCALATIONS).reduce<Record<string, { count: number; cost: number }>>((acc, e) => {` |
| 54 | DEMO_ESCALATIONS | usage | `{ label: "Total Escalations", value: String(([] as typeof DEMO_ESCALATIONS).length), color: "text-foreground" },` |
| 101 | DEMO_ESCALATIONS | usage | `{([] as typeof DEMO_ESCALATIONS).map(e => (` |
| 123 | DEMO_ESCALATIONS | usage | `{([] as typeof DEMO_ESCALATIONS).filter(e => !e.justified).map(e => (` |

## `/dev-server/src/pages/admin/intelligence/IntelligencePacketInspector.tsx` (10 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 16 | DEMO_PACKETS | declaration | `const DEMO_PACKETS: any[] = [];` |
| 23 | DEMO_PACKETS | usage | `const avgCompression = ([] as typeof DEMO_PACKETS).reduce((s, p) => s + p.compressionRatio, 0) / ([] as typeof DEMO_PACK` |
| 24 | DEMO_PACKETS | usage | `const avgTokens = Math.round(([] as typeof DEMO_PACKETS).reduce((s, p) => s + p.tokenCount, 0) / ([] as typeof DEMO_PACK` |
| 25 | DEMO_PACKETS | usage | `const freshCount = ([] as typeof DEMO_PACKETS).filter(p => p.fresh).length;` |
| 26 | DEMO_PACKETS | usage | `const totalCompileCost = ([] as typeof DEMO_PACKETS).reduce((s, p) => s + p.compileCost, 0);` |
| 27 | DEMO_PACKETS | usage | `const selectedPacket = ([] as typeof DEMO_PACKETS).find(p => p.domain === selected);` |
| 42 | DEMO_PACKETS | usage | `{ label: "Fresh Packets", value: `${freshCount}/${([] as typeof DEMO_PACKETS).length}`, sub: "ready to use" },` |
| 44 | DEMO_PACKETS | usage | `{ label: "Est. Daily Savings", value: `$${((([] as typeof DEMO_PACKETS).reduce((s, p) => s + (12000 - p.tokenCount), 0) ` |
| 79 | DEMO_PACKETS | usage | `{([] as typeof DEMO_PACKETS).map(p => (` |
| 105 | DEMO_PACKETS | usage | `{([] as typeof DEMO_PACKETS).map(p => (` |

## `/dev-server/src/pages/admin/intelligence/PatternLearningCenter.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 14 | DEMO_PATTERNS | declaration | `const DEMO_PATTERNS: any[] = [];` |
| 26 | DEMO_PATTERNS | usage | `const totalPatterns = ([] as typeof DEMO_PATTERNS).length;` |
| 27 | DEMO_PATTERNS | usage | `const reusableCount = ([] as typeof DEMO_PATTERNS).filter(p => p.reusable).length;` |
| 28 | DEMO_PATTERNS | usage | `const avgConfidence = Math.round(([] as typeof DEMO_PATTERNS).reduce((s, p) => s + p.confidence, 0) / totalPatterns);` |
| 43 | DEMO_PATTERNS | usage | `{ label: "Privacy Restricted", value: String(([] as typeof DEMO_PATTERNS).filter(p => p.privacy === "tenant_private").le` |
| 72 | DEMO_PATTERNS | usage | `{([] as typeof DEMO_PATTERNS).sort((a, b) => b.confidence - a.confidence).map(p => {` |
| 106 | DEMO_PATTERNS | usage | `{([] as typeof DEMO_PATTERNS).slice(0, 4).map(p => (` |

## `/dev-server/src/pages/admin/intelligence/SmartDigestCenter.tsx` (10 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_DIGESTS | import | `import { DEMO_DIGESTS } from "@/data/seed/admin-intelligence";` |
| 17 | DEMO_DIGESTS | usage | `const freshCount = ([] as typeof DEMO_DIGESTS).filter(d => d.fresh).length;` |
| 18 | DEMO_DIGESTS | usage | `const staleCount = ([] as typeof DEMO_DIGESTS).filter(d => !d.fresh).length;` |
| 19 | DEMO_DIGESTS | usage | `const avgHitRate = Math.round(([] as typeof DEMO_DIGESTS).reduce((s, d) => s + d.hitRate, 0) / ([] as typeof DEMO_DIGEST` |
| 20 | DEMO_DIGESTS | usage | `const totalGenCost = ([] as typeof DEMO_DIGESTS).reduce((s, d) => s + d.genCost, 0);` |
| 21 | DEMO_DIGESTS | usage | `const totalAvoided = ([] as typeof DEMO_DIGESTS).reduce((s, d) => s + d.avoidedSpend, 0);` |
| 33 | DEMO_DIGESTS | usage | `{ label: "Total Digests", value: String(([] as typeof DEMO_DIGESTS).length) },` |
| 66 | DEMO_DIGESTS | usage | `{([] as typeof DEMO_DIGESTS).sort((a, b) => b.hitRate - a.hitRate).map(d => (` |
| 93 | DEMO_DIGESTS | usage | `{([] as typeof DEMO_DIGESTS).filter(d => !d.fresh).map(d => (` |
| 112 | DEMO_DIGESTS | usage | `([] as typeof DEMO_DIGESTS).reduce<Record<string, { avoided: number; genCost: number; count: number }>>((acc, d) => {` |

## `/dev-server/src/pages/admin/intelligence/ZeroWastePromptView.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_PROFILES | import | `import { DEMO_PROFILES } from "@/data/seed/admin-intelligence";` |
| 13 | DEMO_PROFILES | usage | `const offenders = DEMO_PROFILES` |
| 20 | DEMO_PROFILES | usage | `const avgCostReduction = Math.round(([] as typeof DEMO_PROFILES).reduce((s, p) => s + p.costReduction, 0) / Math.max(([]` |
| 21 | DEMO_PROFILES | usage | `const packetDrivenPct = Math.round((([] as typeof DEMO_PROFILES).filter(p => p.packetDriven).length / Math.max(([] as ty` |
| 35 | DEMO_PROFILES | usage | `{ label: "Prompt Profiles", value: String(([] as typeof DEMO_PROFILES).length) },` |
| 68 | DEMO_PROFILES | usage | `{([] as typeof DEMO_PROFILES).map((p, i) => (` |
| 113 | DEMO_PROFILES | usage | `([] as typeof DEMO_PROFILES).reduce<Record<string, number[]>>((acc, p) => {` |

## `/dev-server/src/pages/admin/launch/LAUNCH07GoNoGo.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_MODE_ORDER | import | `import { DEMO_MODE_ORDER } from "@/data/seed/admin-platform";` |
| 31 | DEMO_MODE_ORDER | usage | `const currentModeIdx = DEMO_MODE_ORDER.indexOf(result.recommendedMode);` |
| 54 | DEMO_MODE_ORDER | usage | `{([] as typeof DEMO_MODE_ORDER).map((mode, idx) => (` |

## `/dev-server/src/pages/admin/modules/MCDevicesCenter.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 16 | DEMO_DEVICES | declaration | `const DEMO_DEVICES = [` |
| 50 | DEMO_DEVICES | usage | `const filtered = ([] as typeof DEMO_DEVICES).filter(d => {` |
| 94 | DEMO_DEVICES | usage | `{ label: "Verified", count: ([] as typeof DEMO_DEVICES).filter(d => d.trust === "verified").length, total: ([] as typeof` |
| 95 | DEMO_DEVICES | usage | `{ label: "Pending Review", count: ([] as typeof DEMO_DEVICES).filter(d => d.trust === "pending").length, total: ([] as t` |
| 96 | DEMO_DEVICES | usage | `{ label: "Revoked", count: ([] as typeof DEMO_DEVICES).filter(d => d.trust === "revoked").length, total: ([] as typeof D` |

## `/dev-server/src/pages/admin/modules/MCKnowledgeBase.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 28 | DEMO_ARTICLES | declaration | `const DEMO_ARTICLES: KBArticle[] = [` |
| 61 | DEMO_ARTICLES | usage | `const articles = DEMO_ARTICLES;` |

## `/dev-server/src/pages/admin/modules/MCLogsAudit.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 29 | DEMO_LOGS | declaration | `const DEMO_LOGS: AuditEntry[] = [` |
| 51 | DEMO_LOGS | usage | `return ([] as typeof DEMO_LOGS).filter(l => {` |
| 72 | DEMO_LOGS | usage | `{ label: "Total Events", value: ([] as typeof DEMO_LOGS).length, icon: FileText, color: "text-foreground" },` |
| 73 | DEMO_LOGS | usage | `{ label: "Admin Actions", value: ([] as typeof DEMO_LOGS).filter(l => l.actor === "admin").length, icon: User, color: "t` |
| 74 | DEMO_LOGS | usage | `{ label: "AI Actions", value: ([] as typeof DEMO_LOGS).filter(l => l.actor === "ai_agent").length, icon: Bot, color: "te` |
| 75 | DEMO_LOGS | usage | `{ label: "Warnings", value: ([] as typeof DEMO_LOGS).filter(l => l.severity === "warning").length, icon: AlertTriangle, ` |
| 76 | DEMO_LOGS | usage | `{ label: "Errors", value: ([] as typeof DEMO_LOGS).filter(l => l.severity === "error" \|\| l.severity === "critical").leng` |

## `/dev-server/src/pages/admin/modules/MCSupport.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 37 | DEMO_CASES | declaration | `const DEMO_CASES: SupportCase[] = [` |
| 52 | DEMO_CASES | usage | `return ([] as typeof DEMO_CASES).filter(c => {` |
| 59 | DEMO_CASES | usage | `const selected = ([] as typeof DEMO_CASES).find(c => c.id === selectedId);` |
| 70 | DEMO_CASES | usage | `{ label: "Open Cases", value: ([] as typeof DEMO_CASES).filter(c => c.status === "open" \|\| c.status === "investigating")` |
| 71 | DEMO_CASES | usage | `{ label: "Escalated", value: ([] as typeof DEMO_CASES).filter(c => c.status === "escalated").length, icon: ArrowUp, colo` |
| 72 | DEMO_CASES | usage | `{ label: "Waiting", value: ([] as typeof DEMO_CASES).filter(c => c.status === "waiting").length, icon: Clock, color: "te` |
| 73 | DEMO_CASES | usage | `{ label: "Resolved Today", value: ([] as typeof DEMO_CASES).filter(c => c.status === "resolved").length, icon: CheckCirc` |

## `/dev-server/src/pages/admin/modules/MCUsersCenter.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 15 | DEMO_USERS | declaration | `const DEMO_USERS = [` |
| 29 | DEMO_USERS | usage | `const filtered = ([] as typeof DEMO_USERS).filter(u => {` |

## `/dev-server/src/pages/admin/sag/SAGBuilderConsole.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 13 | DEMO_BUILDER_STEPS | declaration | `const DEMO_BUILDER_STEPS: any[] = [];` |
| 41 | DEMO_BUILDER_STEPS | usage | `{([] as typeof DEMO_BUILDER_STEPS).map(s => (` |
| 50 | DEMO_BUILDER_STEPS | usage | `<h3 className="font-medium text-sm mb-1">Step {activeStep}: {DEMO_BUILDER_STEPS[activeStep - 1].label}</h3>` |
| 51 | DEMO_BUILDER_STEPS | usage | `<p className="text-sm text-muted-foreground">{DEMO_BUILDER_STEPS[activeStep - 1].desc}</p>` |

## `/dev-server/src/pages/admin/sag/SAGComplianceGate.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_VIOLATION_TYPES | import | `import { DEMO_VIOLATION_TYPES } from "@/data/seed/admin-platform";` |
| 24 | DEMO_VIOLATION_TYPES | usage | `const typeCounts = ([] as typeof DEMO_VIOLATION_TYPES).map(vt => ({ ...vt, count: violations.filter((v: Record<string, a` |

## `/dev-server/src/pages/admin/sag/SAGFallbackCenter.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_FALLBACK_STRATEGIES | import | `import { DEMO_FALLBACK_STRATEGIES } from "@/data/seed/admin-platform";` |
| 35 | DEMO_FALLBACK_STRATEGIES | usage | `{([] as typeof DEMO_FALLBACK_STRATEGIES).map(s => (` |

## `/dev-server/src/pages/admin/sag/SAGMultiStageExplorer.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_EXAMPLE_STAGES | import | `import { DEMO_EXAMPLE_STAGES } from "@/data/seed/admin-platform";` |
| 21 | DEMO_EXAMPLE_STAGES | usage | `<Card><CardContent className="pt-4"><p className="text-2xl font-bold">{([] as typeof DEMO_EXAMPLE_STAGES).length}</p><p ` |
| 27 | DEMO_EXAMPLE_STAGES | usage | `{([] as typeof DEMO_EXAMPLE_STAGES).map((pattern, pi) => (` |

## `/dev-server/src/pages/admin/strategic/PortfolioAllocationDashboard.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_DEFAULT_CATEGORIES | import | `import { DEMO_DEFAULT_CATEGORIES } from "@/data/seed/admin-platform";` |
| 20 | DEMO_DEFAULT_CATEGORIES | usage | `const cats = ([] as typeof DEMO_DEFAULT_CATEGORIES).map(c => {` |

## `/dev-server/src/pages/advisors/AdvisorCouncilDashboard.tsx` (14 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 160 | usage | `const { isDemoMode } = useDataMode();` |
| 171 | usage | `if (!isDemoMode) {` |
| 175 | usage | `}, [isDemoMode]);` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 26 | DEMO_ADVISOR_SCORECARDS | import | `import { DEMO_ADVISOR_SCORECARDS, DEMO_ESCALATION_LOG, DEMO_HANDOFF_LOG } from "@/data/seed/core-pages";` |
| 73 | DEMO_ADVISOR_SCORECARDS | usage | `const AdvisorScorecard = ({ advisor }: { advisor: typeof DEMO_ADVISOR_SCORECARDS[0] }) => (` |
| 178 | DEMO_ADVISOR_SCORECARDS | usage | `const scorecards = DEMO_ADVISOR_SCORECARDS;` |
| 179 | DEMO_ESCALATION_LOG | usage | `const escalations = DEMO_ESCALATION_LOG;` |
| 180 | DEMO_HANDOFF_LOG | usage | `const handoffs = DEMO_HANDOFF_LOG;` |
| 216 | DEMO_ADVISOR_SCORECARDS | usage | `<span className="text-2xl font-bold text-foreground">{([] as typeof DEMO_ADVISOR_SCORECARDS).length}</span>` |
| 250 | DEMO_ADVISOR_SCORECARDS | usage | `{([] as typeof DEMO_ADVISOR_SCORECARDS).map(a => <AdvisorScorecard key={a.id} advisor={a} />)}` |
| 258 | DEMO_ESCALATION_LOG | usage | `<span className="text-xs text-muted-foreground">{([] as typeof DEMO_ESCALATION_LOG).length} total</span>` |
| 260 | DEMO_ESCALATION_LOG | usage | `{([] as typeof DEMO_ESCALATION_LOG).map(esc => (` |
| 285 | DEMO_HANDOFF_LOG | usage | `<span className="text-xs text-muted-foreground">{([] as typeof DEMO_HANDOFF_LOG).length} total</span>` |
| 287 | DEMO_HANDOFF_LOG | usage | `{([] as typeof DEMO_HANDOFF_LOG).map(h => (` |

## `/dev-server/src/pages/advisors/AdvisorRegistry.tsx` (5 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 52 | usage | `const { isDemoMode } = useDataMode();` |
| 245 | usage | `const { isDemoMode } = useDataMode();` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 28 | DEMO_AUTONOMY_LEVELS | import | `import { DEMO_AUTONOMY_LEVELS } from "@/data/seed/core-pages";` |
| 53 | DEMO_AUTONOMY_LEVELS | usage | `const idx = DEMO_AUTONOMY_LEVELS.indexOf(level);` |
| 54 | DEMO_AUTONOMY_LEVELS | usage | `return idx >= 0 ? Math.round(((idx + 1) / ([] as typeof DEMO_AUTONOMY_LEVELS).length) * 100) : 0;` |

## `/dev-server/src/pages/advisors/AdvisorWorkspace.tsx` (29 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 68 | usage | `const { isDemoMode } = useDataMode();` |
| 69 | usage | `const totalApprovals = isDemoMode ? mockAdvisors.reduce((s, a) => s + a.pendingApprovals, 0) : 0;` |
| 70 | usage | `const activeAdvisors = isDemoMode ? mockAdvisors.filter(a => a.status === "active").length : 0;` |
| 71 | usage | `const highImpact = isDemoMode ? mockRecommendations.filter(r => r.impact === "high").length : 0;` |
| 109 | usage | `<MetricPill label="Simulations Ready" value={isDemoMode ? mockSimulations.length : 0} />` |
| 151 | usage | `const { isDemoMode } = useDataMode();` |
| 154 | usage | `const filtered = isDemoMode` |
| 207 | usage | `const { isDemoMode } = useDataMode();` |
| 208 | usage | `if (!isDemoMode) return null;` |
| 241 | usage | `const { isDemoMode } = useDataMode();` |
| 242 | usage | `if (!isDemoMode) return null;` |
| 290 | usage | `const { isDemoMode } = useDataMode();` |
| 291 | usage | `if (!isDemoMode) return null;` |
| 311 | usage | `const { isDemoMode } = useDataMode();` |
| 312 | usage | `if (!isDemoMode) return null;` |
| 341 | usage | `const { isDemoMode } = useDataMode();` |
| 342 | usage | `if (!isDemoMode) return null;` |
| 399 | usage | `const { isDemoMode } = useDataMode();` |
| 404 | usage | `const approvals = (!isDemoMode && pendingApprovals.length > 0)` |
| 456 | usage | `const { isDemoMode } = useDataMode();` |
| 460 | usage | `enabled: !!user && !isDemoMode,` |
| 468 | usage | `const memoryItems = (!isDemoMode && dbMemory.length > 0)` |
| 511 | usage | `const { isDemoMode } = useDataMode();` |
| 528 | usage | `{isDemoMode ? (` |
| 546 | usage | `const { isDemoMode } = useDataMode();` |
| 550 | usage | `if (!isDemoMode) {` |
| 904 | usage | `const { isDemoMode } = useDataMode();` |
| 936 | usage | `{isDemoMode && mockSimulations.length > 0 && <Badge className="ml-1 h-4 px-1 text-[9px] bg-state-simulated/20 text-state` |
| 940 | usage | `{isDemoMode && mockApprovals.length > 0 && <Badge className="ml-1 h-4 px-1 text-[9px] bg-trust-approval/20 text-trust-ap` |

## `/dev-server/src/pages/app-platform/AppAssociationsPage.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_APP_SLOTS | import | `import { DEMO_APP_SLOTS, DEMO_FILE_TYPES } from "@/data/seed/core-pages";` |
| 47 | DEMO_APP_SLOTS | usage | `{([] as typeof DEMO_APP_SLOTS).map(slot => {` |
| 104 | DEMO_FILE_TYPES | usage | `{([] as typeof DEMO_FILE_TYPES).map(ft => {` |

## `/dev-server/src/pages/app-platform/AppComparePage.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 12 | DEMO_COMPARE_PAIRS | import | `import { DEMO_COMPARE_PAIRS } from "@/data/seed/core-pages";` |
| 21 | DEMO_COMPARE_PAIRS | usage | `const ids = searchParams.get("apps")?.split(",") \|\| DEMO_COMPARE_PAIRS[0].ids;` |
| 63 | DEMO_COMPARE_PAIRS | usage | `{([] as typeof DEMO_COMPARE_PAIRS).map(p => (` |

## `/dev-server/src/pages/app-platform/AppPermissionsCenterPage.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_PERMISSION_DOMAINS | import | `import { DEMO_PERMISSION_DOMAINS } from "@/data/seed/core-pages";` |
| 22 | DEMO_PERMISSION_DOMAINS | usage | `const activeDomainInfo = ([] as typeof DEMO_PERMISSION_DOMAINS).find(d => d.id === activeDomain)!;` |
| 37 | DEMO_PERMISSION_DOMAINS | usage | `{([] as typeof DEMO_PERMISSION_DOMAINS).map(d => {` |

## `/dev-server/src/pages/app-platform/DevToolsCatalogPage.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 13 | DEMO_DEV_CATEGORIES | import | `import { DEMO_DEV_CATEGORIES } from "@/data/seed/core-pages";` |
| 64 | DEMO_DEV_CATEGORIES | usage | `{([] as typeof DEMO_DEV_CATEGORIES).map(c => {` |

## `/dev-server/src/pages/app-platform/EnterpriseCatalogPage.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_ENTERPRISE_APPS | import | `import { DEMO_ENTERPRISE_APPS } from "@/data/seed/core-pages";` |
| 55 | DEMO_ENTERPRISE_APPS | usage | `{([] as typeof DEMO_ENTERPRISE_APPS).map(app => {` |

## `/dev-server/src/pages/app-platform/OpenWithPage.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_FILES | import | `import { DEMO_FILES } from "@/data/seed/core-pages";` |
| 17 | DEMO_FILES | usage | `const [selectedFile, setSelectedFile] = useState(DEMO_FILES[0]);` |
| 49 | DEMO_FILES | usage | `{([] as typeof DEMO_FILES).map(f => (` |

## `/dev-server/src/pages/app-platform/WebAppInstallPage.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 16 | DEMO_DETECTED_SITES | import | `import { DEMO_DETECTED_SITES } from "@/data/seed/core-pages";` |
| 22 | DEMO_DETECTED_SITES | usage | `const [selectedSite, setSelectedSite] = useState<typeof DEMO_DETECTED_SITES[0] \| null>(null);` |
| 79 | DEMO_DETECTED_SITES | usage | `{([] as typeof DEMO_DETECTED_SITES).map(site => (` |

## `/dev-server/src/pages/apps/EmailApp.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_EMAILS | import | `import { DEMO_EMAILS } from "@/data/seed/apps";` |
| 32 | DEMO_EMAILS | usage | `const unread = ([] as typeof DEMO_EMAILS).filter(e => !e.read).length;` |
| 34 | DEMO_EMAILS | usage | `const filtered = ([] as typeof DEMO_EMAILS).filter(e => !search \|\| e.subject.toLowerCase().includes(search.toLowerCase()` |

## `/dev-server/src/pages/apps/GalleryApp.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_PHOTOS | import | `import { DEMO_PHOTOS, DEMO_albums, DEMO_placeholderColors } from "@/data/seed/apps";` |
| 25 | DEMO_PHOTOS | usage | `const filtered = ([] as typeof DEMO_PHOTOS).filter(p => {` |
| 37 | DEMO_PHOTOS | usage | `<Badge variant="secondary" className="text-xs">{([] as typeof DEMO_PHOTOS).length} items</Badge>` |
| 50 | DEMO_albums | usage | `{([] as typeof DEMO_albums).map(a => (` |
| 67 | DEMO_placeholderColors | usage | `<div className={`w-full h-full bg-gradient-to-br ${DEMO_placeholderColors[i % ([] as typeof DEMO_placeholderColors).leng` |
| 93 | DEMO_placeholderColors | usage | `<div key={photo.id} className={`rounded-lg overflow-hidden aspect-square bg-gradient-to-br ${DEMO_placeholderColors[pars` |
| 120 | DEMO_placeholderColors | usage | `<div className={`w-full max-w-lg aspect-video rounded-xl bg-gradient-to-br ${DEMO_placeholderColors[parseInt(selectedPho` |

## `/dev-server/src/pages/apps/HealthApp.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_sleepData | import | `import { DEMO_sleepData } from "@/data/seed/apps";` |
| 91 | DEMO_sleepData | usage | `{([] as typeof DEMO_sleepData).map((v, i) => (` |

## `/dev-server/src/pages/apps/MessengerApp.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_CHATS | import | `import { DEMO_CHATS, DEMO_MESSAGES } from "@/data/seed/apps";` |
| 29 | DEMO_CHATS | usage | `const [selectedChat, setSelectedChat] = useState<Chat \| null>(DEMO_CHATS[0]);` |
| 33 | DEMO_CHATS | usage | `const filtered = ([] as typeof DEMO_CHATS).filter(c => !search \|\| c.name.toLowerCase().includes(search.toLowerCase()));` |
| 93 | DEMO_MESSAGES | usage | `{([] as typeof DEMO_MESSAGES).map(msg => (` |

## `/dev-server/src/pages/apps/VaultApp.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_ENTRIES | import | `import { DEMO_ENTRIES } from "@/data/seed/apps";` |
| 31 | DEMO_ENTRIES | usage | `const filtered = ([] as typeof DEMO_ENTRIES).filter(e => !search \|\| e.name.toLowerCase().includes(search.toLowerCase()))` |
| 32 | DEMO_ENTRIES | usage | `const breachedCount = ([] as typeof DEMO_ENTRIES).filter(e => e.breached).length;` |
| 33 | DEMO_ENTRIES | usage | `const weakCount = ([] as typeof DEMO_ENTRIES).filter(e => e.strength === "weak").length;` |
| 66 | DEMO_ENTRIES | usage | `<Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-foreground">{([] as typeof DEMO_ENT` |
| 67 | DEMO_ENTRIES | usage | `<Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-500">{([] as typeof DEMO_EN` |

## `/dev-server/src/pages/apps/WeatherNewsApp.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_forecast | import | `import { DEMO_forecast, DEMO_newsArticles } from "@/data/seed/apps";` |
| 20 | DEMO_forecast | usage | `const current = DEMO_forecast[0];` |
| 81 | DEMO_forecast | usage | `{([] as typeof DEMO_forecast).map((day, i) => (` |
| 82 | DEMO_forecast | usage | `<div key={day.day} className={`flex items-center justify-between py-2 ${i < ([] as typeof DEMO_forecast).length - 1 ? "b` |
| 102 | DEMO_newsArticles | usage | `{([] as typeof DEMO_newsArticles).map((article, i) => (` |

## `/dev-server/src/pages/atlas/ConnectorControlCenter.tsx` (15 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 17 | DEMO_auditTimeline | import | `import { DEMO_auditTimeline, DEMO_connectors } from "@/data/seed/atlas";` |
| 27 | DEMO_connectors | usage | `const healthy = ([] as typeof DEMO_connectors).filter(c => c.status === "active").length;` |
| 33 | DEMO_connectors | usage | `{([] as typeof DEMO_connectors).some(c => c.status === "error") && (` |
| 34 | DEMO_connectors | usage | `<DegradedStateBanner severity="warning" reason={`${([] as typeof DEMO_connectors).filter(c => c.status === "error").leng` |
| 40 | DEMO_connectors | usage | `{ label: "Error", value: ([] as typeof DEMO_connectors).filter(c => c.status === "error").length, color: ([] as typeof D` |
| 41 | DEMO_connectors | usage | `{ label: "Paused", value: ([] as typeof DEMO_connectors).filter(c => c.status === "paused").length, color: "text-amber-4` |
| 42 | DEMO_connectors | usage | `{ label: "Avg Health", value: `${Math.round(([] as typeof DEMO_connectors).reduce((s, c) => s + c.health, 0) / ([] as ty` |
| 43 | DEMO_connectors | usage | `{ label: "Total Capabilities", value: ([] as typeof DEMO_connectors).reduce((s, c) => s + c.capabilities.length, 0), col` |
| 70 | DEMO_connectors | usage | `{([] as typeof DEMO_connectors).map(c => (` |
| 90 | DEMO_connectors | usage | `{([] as typeof DEMO_connectors).map(c => (` |
| 112 | DEMO_connectors | usage | `{([] as typeof DEMO_connectors).map(c => (` |
| 130 | DEMO_connectors | usage | `{([] as typeof DEMO_connectors).map(c => (` |
| 149 | DEMO_auditTimeline | usage | `{([] as typeof DEMO_auditTimeline).map((e, i) => (` |
| 168 | DEMO_connectors | usage | `{([] as typeof DEMO_connectors).filter(c => c.status === "error" \|\| c.failureCount > 0).map(c => (` |
| 186 | DEMO_connectors | usage | `{([] as typeof DEMO_connectors).filter(c => c.status === "error" \|\| c.failureCount > 0).length === 0 && (` |

## `/dev-server/src/pages/atlas/OperationsCommandCenter.tsx` (13 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 16 | DEMO_alerts | import | `import { DEMO_alerts, DEMO_incidents, DEMO_runbooks, DEMO_services, DEMO_slos } from "@/data/seed/atlas";` |
| 29 | DEMO_alerts | usage | `{([] as typeof DEMO_alerts).filter(a => !a.acknowledged).length > 0 && (` |
| 30 | DEMO_alerts | usage | `<DegradedStateBanner severity="warning" reason={`${([] as typeof DEMO_alerts).filter(a => !a.acknowledged).length} unack` |
| 35 | DEMO_services | usage | `{ label: "Services Healthy", value: `${([] as typeof DEMO_services).filter(s => s.status === "healthy").length}/${([] as` |
| 36 | DEMO_slos | usage | `{ label: "SLO Budget Avg", value: `${Math.round(([] as typeof DEMO_slos).reduce((s, l) => s + l.budget, 0) / ([] as type` |
| 37 | DEMO_alerts | usage | `{ label: "Active Alerts", value: ([] as typeof DEMO_alerts).filter(a => !a.acknowledged).length, color: ([] as typeof DE` |
| 38 | DEMO_incidents | usage | `{ label: "Active Incidents", value: ([] as typeof DEMO_incidents).filter(i => i.status !== "resolved").length, color: ([` |
| 39 | DEMO_runbooks | usage | `{ label: "Runbooks", value: ([] as typeof DEMO_runbooks).length, color: "text-blue-400" },` |
| 66 | DEMO_services | usage | `{([] as typeof DEMO_services).map(svc => (` |
| 84 | DEMO_slos | usage | `{([] as typeof DEMO_slos).map(slo => (` |
| 108 | DEMO_alerts | usage | `{([] as typeof DEMO_alerts).map(alert => (` |
| 127 | DEMO_incidents | usage | `{([] as typeof DEMO_incidents).map(inc => (` |
| 175 | DEMO_runbooks | usage | `{([] as typeof DEMO_runbooks).map(rb => (` |

## `/dev-server/src/pages/boardroom/BoardroomHistory.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 14 | DEMO_SESSIONS | import | `import { DEMO_SESSIONS } from "@/data/seed/core-pages";` |
| 28 | DEMO_SESSIONS | usage | `if (error \|\| !data \|\| data.length === 0) return DEMO_SESSIONS;` |

## `/dev-server/src/pages/business/AppointmentsScheduling.tsx` (13 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 60 | usage | `const { isDemoMode } = useDataMode();` |
| 148 | usage | `const { isDemoMode } = useDataMode();` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 34 | DEMO_APPOINTMENTS | declaration | `const DEMO_APPOINTMENTS: Appointment[] = [` |
| 61 | DEMO_APPOINTMENTS | usage | `const upcoming = ([] as typeof DEMO_APPOINTMENTS).filter(a => ["Today", "Tomorrow", "Wed"].includes(a.date) && a.status ` |
| 62 | DEMO_APPOINTMENTS | usage | `const needsConfirm = ([] as typeof DEMO_APPOINTMENTS).filter(a => a.status === "pending" \|\| a.status === "unconfirmed").` |
| 63 | DEMO_APPOINTMENTS | usage | `const highRisk = ([] as typeof DEMO_APPOINTMENTS).filter(a => a.noShowRisk === "high" && a.status !== "no-show" && a.sta` |
| 64 | DEMO_APPOINTMENTS | usage | `const noShows = ([] as typeof DEMO_APPOINTMENTS).filter(a => a.status === "no-show").length;` |
| 154 | DEMO_APPOINTMENTS | usage | `if (tab === "upcoming") return ([] as typeof DEMO_APPOINTMENTS).filter(a => ["Today", "Tomorrow", "Wed"].includes(a.date` |
| 155 | DEMO_APPOINTMENTS | usage | `if (tab === "needs-confirm") return ([] as typeof DEMO_APPOINTMENTS).filter(a => a.status === "pending" \|\| a.status === ` |
| 156 | DEMO_APPOINTMENTS | usage | `if (tab === "no-show") return ([] as typeof DEMO_APPOINTMENTS).filter(a => a.status === "no-show");` |
| 157 | DEMO_APPOINTMENTS | usage | `if (tab === "follow-up") return ([] as typeof DEMO_APPOINTMENTS).filter(a => a.isFollowUp \|\| a.status === "no-show");` |
| 158 | DEMO_APPOINTMENTS | usage | `return DEMO_APPOINTMENTS;` |
| 230 | DEMO_APPOINTMENTS | usage | `{([] as typeof DEMO_APPOINTMENTS).filter(a => a.date === "Today").map(a => (` |

## `/dev-server/src/pages/business/BackgroundTaskCenter.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 19 | DEMO_TASKS | declaration | `const DEMO_TASKS: BGTask[] = [` |
| 45 | DEMO_TASKS | usage | `const filtered = ([] as typeof DEMO_TASKS).filter(t => filter === "all" \|\| t.status === filter);` |
| 46 | DEMO_TASKS | usage | `const runningCount = ([] as typeof DEMO_TASKS).filter(t => t.status === "running").length;` |
| 57 | DEMO_TASKS | usage | `<p className="text-[10px] text-foreground/30">{runningCount} running · {([] as typeof DEMO_TASKS).length} total</p>` |

## `/dev-server/src/pages/business/BusinessBoardroom.tsx` (5 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 21 | usage | `const { isDemoMode } = useDataMode();` |
| 74 | usage | `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />` |
| 128 | usage | `status={isDemoMode ? "pending" : "verified"}` |
| 132 | usage | `{ label: "Opportunity tracker synced", verified: !isDemoMode },` |
| 133 | usage | `{ label: "Customer database checked", verified: !isDemoMode },` |

## `/dev-server/src/pages/business/BusinessDocuments.tsx` (8 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 45 | usage | `const { isDemoMode } = useDataMode();` |
| 60 | usage | `const { isDemoMode } = useDataMode();` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 35 | DEMO_DOCUMENTS | declaration | `const DEMO_DOCUMENTS: BusinessDocument[] = [` |
| 67 | DEMO_DOCUMENTS | usage | `const [starredIds, setStarredIds] = useState<Set<string>>(new Set(([] as typeof DEMO_DOCUMENTS).filter(d => d.starred).m` |
| 69 | DEMO_DOCUMENTS | usage | `const filtered = ([] as typeof DEMO_DOCUMENTS).filter(doc => {` |
| 78 | DEMO_DOCUMENTS | usage | `const selected = ([] as typeof DEMO_DOCUMENTS).find(d => d.id === selectedId);` |
| 82 | DEMO_DOCUMENTS | usage | `{ key: "all", label: `All (${([] as typeof DEMO_DOCUMENTS).length})` },` |
| 212 | DEMO_DOCUMENTS | usage | `insight={`${([] as typeof DEMO_DOCUMENTS).filter(d => d.status === "expired").length} expired document(s) need attention` |

## `/dev-server/src/pages/business/BusinessOperations.tsx` (13 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 31 | DEMO_ITEMS | declaration | `const DEMO_ITEMS: OperationalItem[] = [` |
| 59 | DEMO_ITEMS | usage | `const filtered = ([] as typeof DEMO_ITEMS).filter(item => {` |
| 68 | DEMO_ITEMS | usage | `const selected = ([] as typeof DEMO_ITEMS).find(i => i.id === selectedId);` |
| 69 | DEMO_ITEMS | usage | `const criticalCount = ([] as typeof DEMO_ITEMS).filter(i => i.urgency === "critical").length;` |
| 70 | DEMO_ITEMS | usage | `const totalCustomerImpact = ([] as typeof DEMO_ITEMS).reduce((sum, i) => sum + i.customerImpact, 0);` |
| 91 | DEMO_ITEMS | usage | `metric={`${([] as typeof DEMO_ITEMS).length} active ${moduleConfig.terminology.item?.toLowerCase() \|\| "item"}s`}` |
| 101 | DEMO_ITEMS | usage | `<StatusCard label="Escalations" status="degraded" lastChecked={`${([] as typeof DEMO_ITEMS).filter(i => i.category === "` |
| 102 | DEMO_ITEMS | usage | `<StatusCard label="Bottlenecks" status="degraded" lastChecked={`${([] as typeof DEMO_ITEMS).filter(i => i.category === "` |
| 133 | DEMO_ITEMS | usage | `{ key: "all", label: "All", count: ([] as typeof DEMO_ITEMS).length },` |
| 134 | DEMO_ITEMS | usage | `{ key: "queues", label: "Queues", count: ([] as typeof DEMO_ITEMS).filter(i => i.category === "queue").length },` |
| 135 | DEMO_ITEMS | usage | `{ key: "escalations", label: "Escalations", count: ([] as typeof DEMO_ITEMS).filter(i => i.category === "escalation").le` |
| 136 | DEMO_ITEMS | usage | `{ key: "bottlenecks", label: "Bottlenecks", count: ([] as typeof DEMO_ITEMS).filter(i => i.category === "bottleneck").le` |
| 137 | DEMO_ITEMS | usage | `{ key: "delayed", label: "Delayed", count: ([] as typeof DEMO_ITEMS).filter(i => i.category === "delayed" \|\| i.category ` |

## `/dev-server/src/pages/business/CollectionsCommandCenter.tsx` (2 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 69 | usage | `const { isDemoMode } = useDataMode();` |
| 106 | usage | `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />` |

## `/dev-server/src/pages/business/CommunicationsCenter.tsx` (3 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 42 | usage | `const { isDemoMode } = useDataMode();` |
| 66 | usage | `const communications = liveComms.length > 0 ? liveComms : (isDemoMode ? fallbackComms : []);` |
| 126 | usage | `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />` |

## `/dev-server/src/pages/business/CustomerSupportCenter.tsx` (15 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 26 | DEMO_ISSUES | declaration | `const DEMO_ISSUES: SupportIssue[] = [` |
| 47 | DEMO_ISSUES | usage | `if (tab === "all") return ([] as typeof DEMO_ISSUES).filter(i => i.status !== "resolved");` |
| 48 | DEMO_ISSUES | usage | `if (tab === "urgent") return ([] as typeof DEMO_ISSUES).filter(i => (i.severity === "critical" \|\| i.severity === "high")` |
| 49 | DEMO_ISSUES | usage | `if (tab === "waiting-on-us") return ([] as typeof DEMO_ISSUES).filter(i => i.status === "waiting-on-us");` |
| 50 | DEMO_ISSUES | usage | `if (tab === "escalated") return ([] as typeof DEMO_ISSUES).filter(i => i.status === "escalated");` |
| 51 | DEMO_ISSUES | usage | `if (tab === "resolved") return ([] as typeof DEMO_ISSUES).filter(i => i.status === "resolved");` |
| 52 | DEMO_ISSUES | usage | `return DEMO_ISSUES;` |
| 56 | DEMO_ISSUES | usage | `const selected = ([] as typeof DEMO_ISSUES).find(i => i.id === selectedId);` |
| 57 | DEMO_ISSUES | usage | `const criticalCount = ([] as typeof DEMO_ISSUES).filter(i => i.severity === "critical" && i.status !== "resolved").lengt` |
| 58 | DEMO_ISSUES | usage | `const breachedCount = ([] as typeof DEMO_ISSUES).filter(i => i.hoursOpen > i.slaHours && i.status !== "resolved").length` |
| 75 | DEMO_ISSUES | usage | `metric={`${([] as typeof DEMO_ISSUES).filter(i => i.status !== "resolved").length} open ${moduleConfig.terminology.issue` |
| 91 | DEMO_ISSUES | usage | `{ key: "all", label: "All Open", count: ([] as typeof DEMO_ISSUES).filter(i => i.status !== "resolved").length },` |
| 92 | DEMO_ISSUES | usage | `{ key: "urgent", label: "Urgent", count: ([] as typeof DEMO_ISSUES).filter(i => (i.severity === "critical" \|\| i.severity` |
| 93 | DEMO_ISSUES | usage | `{ key: "waiting-on-us", label: "Waiting on Us", count: ([] as typeof DEMO_ISSUES).filter(i => i.status === "waiting-on-u` |
| 94 | DEMO_ISSUES | usage | `{ key: "escalated", label: "Escalated", count: ([] as typeof DEMO_ISSUES).filter(i => i.status === "escalated").length }` |

## `/dev-server/src/pages/business/DealRoom.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_DEALS | declaration | `const DEMO_DEALS = [` |
| 62 | DEMO_DEALS | usage | `const [selectedDeal, setSelectedDeal] = useState(DEMO_DEALS[0]);` |
| 70 | DEMO_DEALS | usage | `{([] as typeof DEMO_DEALS).map((deal) => (` |

## `/dev-server/src/pages/business/FollowThroughCenter.tsx` (12 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 24 | DEMO_CALLBACKS | declaration | `const DEMO_CALLBACKS: QueueItem[] = [` |
| 30 | DEMO_NOTOUCH | declaration | `const DEMO_NOTOUCH: QueueItem[] = [` |
| 35 | DEMO_WAITING | declaration | `const DEMO_WAITING: QueueItem[] = [` |
| 40 | DEMO_DRAFTS | declaration | `const DEMO_DRAFTS: QueueItem[] = [` |
| 44 | DEMO_OVERDUE | declaration | `const DEMO_OVERDUE: QueueItem[] = [` |
| 49 | DEMO_RECOVERY | declaration | `const DEMO_RECOVERY: QueueItem[] = [` |
| 55 | DEMO_CALLBACKS | usage | `callbacks: { items: DEMO_CALLBACKS, label: "Callbacks" },` |
| 56 | DEMO_NOTOUCH | usage | `"no-touch": { items: DEMO_NOTOUCH, label: "No-Touch Leads" },` |
| 57 | DEMO_WAITING | usage | `waiting: { items: DEMO_WAITING, label: "Waiting on Reply" },` |
| 58 | DEMO_DRAFTS | usage | `drafts: { items: DEMO_DRAFTS, label: "Unsent Drafts" },` |
| 59 | DEMO_OVERDUE | usage | `overdue: { items: DEMO_OVERDUE, label: "Overdue Outreach" },` |
| 60 | DEMO_RECOVERY | usage | `recovery: { items: DEMO_RECOVERY, label: "Recovery" },` |

## `/dev-server/src/pages/business/PlaybookBuilder.tsx` (11 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 142 | usage | `const { isDemoMode } = useDataMode();` |
| 377 | usage | `const { isDemoMode } = useDataMode();` |
| 438 | usage | `const { isDemoMode } = useDataMode();` |
| 505 | usage | `const { isDemoMode } = useDataMode();` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 85 | DEMO_CONDITION_FIELDS | import | `import { DEMO_CONDITION_FIELDS, DEMO_TRIGGER_EVENTS } from "@/data/seed/business";` |
| 90 | DEMO_CATEGORIES | declaration | `const DEMO_CATEGORIES: any[] = [];` |
| 261 | DEMO_CONDITION_FIELDS | usage | `{([] as typeof DEMO_CONDITION_FIELDS).map(f => <option key={f.value} value={f.value}>{f.label}</option>)}` |
| 394 | DEMO_TRIGGER_EVENTS | usage | `{([] as typeof DEMO_TRIGGER_EVENTS).map(te => <option key={te.value} value={te.value}>{te.label}</option>)}` |
| 413 | DEMO_CONDITION_FIELDS | usage | `{([] as typeof DEMO_CONDITION_FIELDS).map(f => <option key={f.value} value={f.value}>{f.label}</option>)}` |
| 440 | DEMO_TRIGGER_EVENTS | usage | `? ([] as typeof DEMO_TRIGGER_EVENTS).find(e => e.value === draft.trigger.event)?.label \|\| draft.trigger.event` |
| 592 | DEMO_CATEGORIES | usage | `{([] as typeof DEMO_CATEGORIES).map(c => (` |

## `/dev-server/src/pages/business/QuotesWorkspace.tsx` (2 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 26 | usage | `const { isDemoMode } = useDataMode();` |
| 75 | usage | `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />` |

## `/dev-server/src/pages/business/RevenueAutopilot.tsx` (18 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 44 | usage | `const { isDemoMode } = useDataMode();` |
| 86 | usage | `const { isDemoMode } = useDataMode();` |
| 127 | usage | `const { isDemoMode } = useDataMode();` |
| 161 | usage | `const { isDemoMode } = useDataMode();` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 26 | DEMO_LEAKAGE | usage | `let DEMO_LEAKAGE = detectLeakage(MOCK_LEAKAGE_INPUT);` |
| 27 | DEMO_RECOVERY_ACTIONS | usage | `let DEMO_RECOVERY_ACTIONS = suggestRecoveryActions(DEMO_LEAKAGE);` |
| 28 | DEMO_RECOVERED | usage | `let DEMO_RECOVERED = MOCK_RECOVERED_VALUES;` |
| 29 | DEMO_OPPORTUNITIES | usage | `let DEMO_OPPORTUNITIES = rankOpportunities(MOCK_RAW_OPPORTUNITIES);` |
| 30 | DEMO_LEAKAGE | usage | `let SUMMARY = computeAutopilotSummary(DEMO_LEAKAGE, DEMO_RECOVERY_ACTIONS, DEMO_RECOVERED);` |
| 49 | DEMO_LEAKAGE | usage | `<KPITile label="Recoverable" value={`$${Math.round(SUMMARY.totalRecoverable).toLocaleString()}`} sub={`${([] as typeof D` |
| 50 | DEMO_LEAKAGE | usage | `<KPITile label="Critical Items" value={String(([] as typeof DEMO_LEAKAGE).filter(l => l.severity === "critical").length)` |
| 54 | DEMO_LEAKAGE | usage | `{([] as typeof DEMO_LEAKAGE).map((item, i) => (` |
| 91 | DEMO_RECOVERY_ACTIONS | usage | `<KPITile label="Suggested Actions" value={String(([] as typeof DEMO_RECOVERY_ACTIONS).length)} sub="Ready to launch" />` |
| 92 | DEMO_RECOVERY_ACTIONS | usage | `<KPITile label="Approval Required" value={String(([] as typeof DEMO_RECOVERY_ACTIONS).filter(r => r.approvalRequired).le` |
| 95 | DEMO_RECOVERY_ACTIONS | usage | `{([] as typeof DEMO_RECOVERY_ACTIONS).map((action, i) => (` |
| 131 | DEMO_OPPORTUNITIES | usage | `{([] as typeof DEMO_OPPORTUNITIES).map((opp, i) => (` |
| 162 | DEMO_RECOVERED | usage | `const summary = computeRecoveredValueSummary(DEMO_RECOVERED);` |
| 171 | DEMO_RECOVERED | usage | `{([] as typeof DEMO_RECOVERED).map((entry, i) => (` |

## `/dev-server/src/pages/business/RevenueImpactDashboard.tsx` (6 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 121 | usage | `const { isDemoMode } = useDataMode();` |
| 130 | usage | `enabled: !!user && !isDemoMode,` |
| 151 | usage | `if (!isDemoMode && realRevenue) {` |
| 167 | usage | `}, [isDemoMode, realRevenue]);` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 86 | DEMO_PLAYBOOK_REVENUE | import | `import { DEMO_PLAYBOOK_REVENUE } from "@/data/seed/business";` |
| 146 | DEMO_PLAYBOOK_REVENUE | usage | `const PLAYBOOK_REVENUE = DEMO_PLAYBOOK_REVENUE; // Playbook breakdown is config/demo — real aggregates feed KPIs` |

## `/dev-server/src/pages/concierge/ConciergeOverview.tsx` (2 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 26 | usage | `const { isDemoMode } = useDataMode();` |
| 31 | usage | `const hasLiveData = isDemoMode \|\| tasks.length > 0 \|\| events.length > 0;` |

## `/dev-server/src/pages/concierge/ConciergeProof.tsx` (2 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 37 | usage | `const { isDemoMode } = useDataMode();` |
| 50 | usage | `{!isDemoMode ? (` |

## `/dev-server/src/pages/concierge/FamilyBoardroom.tsx` (10 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 35 | usage | `const { isDemoMode } = useDataMode();` |
| 42 | usage | `{!isDemoMode && (` |
| 46 | usage | `{isDemoMode && (<>` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 17 | DEMO_carryover | import | `import { DEMO_carryover, DEMO_nextMoves, DEMO_priorities, DEMO_proofSummary, DEMO_scheduleConflicts } from "@/data/seed/` |
| 84 | DEMO_priorities | usage | `{([] as typeof DEMO_priorities).slice(0, 3).map((p, i) => (` |
| 138 | DEMO_priorities | usage | `{([] as typeof DEMO_priorities).map((p, i) => (` |
| 158 | DEMO_scheduleConflicts | usage | `{([] as typeof DEMO_scheduleConflicts).map((c, i) => (` |
| 170 | DEMO_nextMoves | usage | `{([] as typeof DEMO_nextMoves).map((m, i) => (` |
| 186 | DEMO_carryover | usage | `{([] as typeof DEMO_carryover).map((item, i) => (` |
| 207 | DEMO_proofSummary | usage | `{([] as typeof DEMO_proofSummary).map((p, i) => (` |

## `/dev-server/src/pages/concierge/FamilyCalendar.tsx` (14 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_conflicts | import | `import { DEMO_conflicts, DEMO_events, DEMO_familyMembers, DEMO_prepItems, DEMO_transportDuties } from "@/data/seed/conci` |
| 24 | DEMO_events | usage | `<KPITile label="Events This Week" value={String(([] as typeof DEMO_events).length)} icon={Calendar} />` |
| 26 | DEMO_conflicts | usage | `<KPITile label="Conflicts" value={String(([] as typeof DEMO_conflicts).length)} icon={AlertCircle} sub="Needs resolution` |
| 27 | DEMO_prepItems | usage | `<KPITile label="Prep Items" value={String(([] as typeof DEMO_prepItems).length)} icon={Clock} sub="Before DEMO_events" /` |
| 28 | DEMO_transportDuties | usage | `<KPITile label="Transport Duties" value={String(([] as typeof DEMO_transportDuties).length)} icon={Car} sub="This week" ` |
| 51 | DEMO_events | usage | `const dayEvents = ([] as typeof DEMO_events).filter((_, ei) => ei % 7 === i).length;` |
| 68 | DEMO_conflicts | usage | `{(view === "week" \|\| view === "conflicts") && ([] as typeof DEMO_conflicts).length > 0 && (` |
| 71 | DEMO_conflicts | usage | `{([] as typeof DEMO_conflicts).map((c, i) => (` |
| 72 | DEMO_events | usage | `<ConflictCard key={i} events={c.DEMO_events} resolution={c.resolution} />` |
| 81 | DEMO_events | usage | `{([] as typeof DEMO_events).map((e) => (` |
| 94 | DEMO_prepItems | usage | `{([] as typeof DEMO_prepItems).map((p, i) => (` |
| 103 | DEMO_transportDuties | usage | `{([] as typeof DEMO_transportDuties).map((t, i) => (` |
| 125 | DEMO_familyMembers | usage | `{([] as typeof DEMO_familyMembers).map((m) => (` |
| 131 | DEMO_events | usage | `<span className="text-[10px] text-muted-foreground">{m.DEMO_events} DEMO_events</span>` |

## `/dev-server/src/pages/concierge/GroceryPlanning.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_recurringSupplies | import | `import { DEMO_recurringSupplies, DEMO_stores } from "@/data/seed/concierge";` |
| 14 | DEMO_categories | declaration | `const DEMO_categories: any[] = [];` |
| 52 | DEMO_stores | usage | `const groupedByStore = ([] as typeof DEMO_stores).reduce((acc, store) => {` |
| 86 | DEMO_recurringSupplies | usage | `{([] as typeof DEMO_recurringSupplies).map((s, i) => (` |
| 94 | DEMO_stores | usage | `{([] as typeof DEMO_stores).map((store) => {` |
| 159 | DEMO_categories | usage | `{(view === "shopping" \|\| view === "urgency") && ([] as typeof DEMO_categories).map((cat) => {` |
| 226 | DEMO_stores | usage | `{([] as typeof DEMO_stores).map((store, i) => {` |

## `/dev-server/src/pages/concierge/LifeAdminCenter.tsx` (13 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 24 | DEMO_RECURRING | declaration | `const DEMO_RECURRING: AdminItem[] = [` |
| 31 | DEMO_SERVICE | declaration | `const DEMO_SERVICE: AdminItem[] = [` |
| 37 | DEMO_FORMS | declaration | `const DEMO_FORMS: AdminItem[] = [` |
| 43 | DEMO_UPCOMING | declaration | `const DEMO_UPCOMING: AdminItem[] = [` |
| 48 | DEMO_AGING | declaration | `const DEMO_AGING: AdminItem[] = [` |
| 54 | DEMO_BUNDLES | declaration | `const DEMO_BUNDLES: AdminItem[] = [` |
| 61 | DEMO_RECURRING | usage | `recurring: { items: DEMO_RECURRING, label: "Recurring" },` |
| 62 | DEMO_SERVICE | usage | `service: { items: DEMO_SERVICE, label: "Follow-ups" },` |
| 63 | DEMO_FORMS | usage | `forms: { items: DEMO_FORMS, label: "Forms" },` |
| 64 | DEMO_UPCOMING | usage | `upcoming: { items: DEMO_UPCOMING, label: "Upcoming" },` |
| 65 | DEMO_AGING | usage | `aging: { items: DEMO_AGING, label: "Aging" },` |
| 66 | DEMO_BUNDLES | usage | `bundles: { items: DEMO_BUNDLES, label: "Bundles" },` |
| 97 | DEMO_RECURRING | usage | `{ label: "Recurring", value: ([] as typeof DEMO_RECURRING).length, color: "text-[hsl(265_55%_68%)]" },` |

## `/dev-server/src/pages/concierge/MonthGridCalendar.tsx` (3 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 27 | usage | `const { isDemoMode } = useDataMode();` |
| 31 | usage | `queryKey: ["calendar-data", user?.id, year, month, isDemoMode],` |
| 33 | usage | `if (!user?.id \|\| isDemoMode) {` |

## `/dev-server/src/pages/concierge/ServiceProviders.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 15 | DEMO_categories | declaration | `const DEMO_categories: any[] = [];` |
| 170 | DEMO_categories | usage | `<KPITile label="Categories" value={String(([] as typeof DEMO_categories).length)} icon={Star} />` |
| 187 | DEMO_categories | usage | `{([] as typeof DEMO_categories).map((c) => (` |
| 325 | DEMO_categories | usage | `message: `You have ${trustedCount} trusted providers across ${([] as typeof DEMO_categories).length} categories. CleanPr` |

## `/dev-server/src/pages/concierge/TravelPlanning.tsx` (7 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 33 | usage | `const { isDemoMode } = useDataMode();` |
| 57 | usage | `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 14 | DEMO_householdSpillover | import | `import { DEMO_householdSpillover, DEMO_itinerary, DEMO_postTripTasks, DEMO_preTripChecklist } from "@/data/seed/concierg` |
| 37 | DEMO_preTripChecklist | usage | `const prepQueueItems = ([] as typeof DEMO_preTripChecklist).flatMap((section, si) =>` |
| 46 | DEMO_itinerary | usage | `const itineraryEvents = ([] as typeof DEMO_itinerary).map((day, i) => ({` |
| 98 | DEMO_householdSpillover | usage | `{([] as typeof DEMO_householdSpillover).map((item, i) => (` |
| 107 | DEMO_postTripTasks | usage | `items={([] as typeof DEMO_postTripTasks).map((task, i) => ({ id: `pt-${i}`, label: task, urgency: "normal" as const }))}` |

## `/dev-server/src/pages/concierge/UpcomingNeeds.tsx` (2 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 43 | usage | `const { isDemoMode } = useDataMode();` |
| 73 | usage | `if (!isDemoMode) {` |

## `/dev-server/src/pages/digital-presence/AIWebTeam.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 13 | DEMO_DISAGREEMENTS | declaration | `const DEMO_DISAGREEMENTS: any[] = [];` |
| 291 | DEMO_DISAGREEMENTS | usage | `{ label: "Disagreements", value: ([] as typeof DEMO_DISAGREEMENTS).length.toString(), icon: MessageSquare },` |
| 436 | DEMO_DISAGREEMENTS | usage | `{([] as typeof DEMO_DISAGREEMENTS).map((d, i) => (` |

## `/dev-server/src/pages/digital-presence/AppExperienceStudio.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_EXISTING_EXPERIENCES | import | `import { DEMO_EXISTING_EXPERIENCES, DEMO_EXPERIENCE_TYPES, DEMO_PORTAL_FEATURES, DEMO_PWA_SETTINGS } from "@/data/seed/d` |
| 27 | DEMO_EXPERIENCE_TYPES | usage | `{([] as typeof DEMO_EXPERIENCE_TYPES).map(e => (` |
| 46 | DEMO_EXISTING_EXPERIENCES | usage | `{([] as typeof DEMO_EXISTING_EXPERIENCES).map(e => (` |
| 71 | DEMO_PWA_SETTINGS | usage | `{([] as typeof DEMO_PWA_SETTINGS).map(s => (` |
| 94 | DEMO_PORTAL_FEATURES | usage | `{([] as typeof DEMO_PORTAL_FEATURES).map(f => (` |

## `/dev-server/src/pages/digital-presence/BrandStudio.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_BRAND_ASSETS | import | `import { DEMO_BRAND_ASSETS, DEMO_BRAND_COLORS, DEMO_REUSABLE_BLOCKS, DEMO_TYPOGRAPHY } from "@/data/seed/digital-presenc` |
| 46 | DEMO_BRAND_COLORS | usage | `{([] as typeof DEMO_BRAND_COLORS).map(c => (` |
| 65 | DEMO_TYPOGRAPHY | usage | `{([] as typeof DEMO_TYPOGRAPHY).map(t => (` |
| 84 | DEMO_BRAND_ASSETS | usage | `{([] as typeof DEMO_BRAND_ASSETS).map(a => (` |
| 103 | DEMO_REUSABLE_BLOCKS | usage | `{([] as typeof DEMO_REUSABLE_BLOCKS).map(b => (` |

## `/dev-server/src/pages/digital-presence/ConnectedSites.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_AI_RECOMMENDATIONS | import | `import { DEMO_AI_RECOMMENDATIONS, DEMO_AUDIT_FINDINGS } from "@/data/seed/digital-presence";` |
| 12 | DEMO_PLATFORMS | declaration | `const DEMO_PLATFORMS: any[] = [];` |
| 26 | DEMO_PLATFORMS | usage | `{([] as typeof DEMO_PLATFORMS).map(p => (` |
| 65 | DEMO_AUDIT_FINDINGS | usage | `{([] as typeof DEMO_AUDIT_FINDINGS).map((f, i) => (` |
| 84 | DEMO_AI_RECOMMENDATIONS | usage | `{([] as typeof DEMO_AI_RECOMMENDATIONS).map((r, i) => (` |

## `/dev-server/src/pages/digital-presence/ContentFreshness.tsx` (9 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_EXPIRED_OFFERS | import | `import { DEMO_EXPIRED_OFFERS, DEMO_INCONSISTENCIES, DEMO_STALE_INFO, DEMO_STALE_PAGES } from "@/data/seed/digital-presen` |
| 21 | DEMO_STALE_PAGES | usage | `{ label: "Stale Pages", value: ([] as typeof DEMO_STALE_PAGES).length, color: "text-amber-400" },` |
| 22 | DEMO_EXPIRED_OFFERS | usage | `{ label: "Expired Offers Live", value: ([] as typeof DEMO_EXPIRED_OFFERS).filter(o => o.stillLive).length, color: "text-` |
| 23 | DEMO_STALE_INFO | usage | `{ label: "Stale Info", value: ([] as typeof DEMO_STALE_INFO).length, color: "text-orange-400" },` |
| 24 | DEMO_INCONSISTENCIES | usage | `{ label: "Inconsistencies", value: ([] as typeof DEMO_INCONSISTENCIES).length, color: "text-purple-400" },` |
| 40 | DEMO_STALE_PAGES | usage | `{([] as typeof DEMO_STALE_PAGES).map(p => (` |
| 60 | DEMO_EXPIRED_OFFERS | usage | `{([] as typeof DEMO_EXPIRED_OFFERS).map(o => (` |
| 80 | DEMO_STALE_INFO | usage | `{([] as typeof DEMO_STALE_INFO).map(s => (` |
| 97 | DEMO_INCONSISTENCIES | usage | `{([] as typeof DEMO_INCONSISTENCIES).map((c, i) => (` |

## `/dev-server/src/pages/digital-presence/DomainPublishManager.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_PUBLISH_HISTORY | import | `import { DEMO_PUBLISH_HISTORY, DEMO_PUBLISH_RULES } from "@/data/seed/digital-presence";` |
| 13 | DEMO_ENVIRONMENTS | declaration | `const DEMO_ENVIRONMENTS: any[] = [];` |
| 16 | DEMO_DOMAINS | declaration | `const DEMO_DOMAINS: any[] = [];` |
| 42 | DEMO_DOMAINS | usage | `{([] as typeof DEMO_DOMAINS).map(d => (` |
| 69 | DEMO_ENVIRONMENTS | usage | `{([] as typeof DEMO_ENVIRONMENTS).map(e => (` |
| 100 | DEMO_PUBLISH_HISTORY | usage | `{([] as typeof DEMO_PUBLISH_HISTORY).map(p => (` |
| 122 | DEMO_PUBLISH_RULES | usage | `{([] as typeof DEMO_PUBLISH_RULES).map(r => (` |

## `/dev-server/src/pages/digital-presence/EcommerceOffice.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_CART_DIAGNOSTICS | import | `import { DEMO_CART_DIAGNOSTICS, DEMO_COLLECTIONS, DEMO_MERCHANDISING_OPS } from "@/data/seed/digital-presence";` |
| 12 | DEMO_PRODUCTS | declaration | `const DEMO_PRODUCTS: any[] = [];` |
| 76 | DEMO_PRODUCTS | usage | `{([] as typeof DEMO_PRODUCTS).map(p => (` |
| 120 | DEMO_COLLECTIONS | usage | `([] as typeof DEMO_COLLECTIONS).map(c => (` |
| 140 | DEMO_CART_DIAGNOSTICS | usage | `{([] as typeof DEMO_CART_DIAGNOSTICS).map(c => (` |
| 157 | DEMO_MERCHANDISING_OPS | usage | `{([] as typeof DEMO_MERCHANDISING_OPS).map(m => (` |

## `/dev-server/src/pages/digital-presence/ErrorRadar.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_ERRORS | import | `import { DEMO_ERRORS, DEMO_OPPORTUNITIES } from "@/data/seed/digital-presence";` |
| 39 | DEMO_ERRORS | usage | `{([] as typeof DEMO_ERRORS).map((e, i) => (` |
| 64 | DEMO_OPPORTUNITIES | usage | `{([] as typeof DEMO_OPPORTUNITIES).map(o => (` |

## `/dev-server/src/pages/digital-presence/LaunchWarRoom.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_LAUNCH_TIMELINE | import | `import { DEMO_LAUNCH_TIMELINE } from "@/data/seed/digital-presence";` |
| 11 | DEMO_READINESS_CHECKS | declaration | `const DEMO_READINESS_CHECKS: any[] = [];` |
| 14 | DEMO_READINESS_CHECKS | usage | `const overallScore = Math.round(([] as typeof DEMO_READINESS_CHECKS).reduce((sum, c) => sum + c.score, 0) / Math.max(([]` |
| 40 | DEMO_READINESS_CHECKS | usage | `{([] as typeof DEMO_READINESS_CHECKS).map(c => (` |
| 62 | DEMO_LAUNCH_TIMELINE | usage | `{([] as typeof DEMO_LAUNCH_TIMELINE).map(t => (` |

## `/dev-server/src/pages/digital-presence/PresenceAnalytics.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_AGENT_CONFIDENCE | import | `import { DEMO_AGENT_CONFIDENCE, DEMO_OVERVIEW_METRICS, DEMO_PAGE_IMPACT, DEMO_PROMO_PERFORMANCE, DEMO_SOURCE_PERFORMANCE` |
| 22 | DEMO_OVERVIEW_METRICS | usage | `{([] as typeof DEMO_OVERVIEW_METRICS).map((m, i) => (` |
| 45 | DEMO_SOURCE_PERFORMANCE | usage | `{([] as typeof DEMO_SOURCE_PERFORMANCE).map(s => (` |
| 83 | DEMO_PAGE_IMPACT | usage | `{([] as typeof DEMO_PAGE_IMPACT).map(p => (` |
| 108 | DEMO_PROMO_PERFORMANCE | usage | `{([] as typeof DEMO_PROMO_PERFORMANCE).map(p => (` |
| 129 | DEMO_AGENT_CONFIDENCE | usage | `{([] as typeof DEMO_AGENT_CONFIDENCE).map(a => (` |

## `/dev-server/src/pages/digital-presence/PresenceBoardroom.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_LIVE_PROMOTIONS | import | `import { DEMO_LIVE_PROMOTIONS, DEMO_TOP_PAGES, DEMO_WEAK_PAGES } from "@/data/seed/digital-presence";` |
| 12 | DEMO_METRICS | declaration | `const DEMO_METRICS: any[] = [];` |
| 15 | DEMO_ADVISOR_SIGNALS | declaration | `const DEMO_ADVISOR_SIGNALS: any[] = [];` |
| 29 | DEMO_METRICS | usage | `{([] as typeof DEMO_METRICS).map((m, i) => (` |
| 53 | DEMO_TOP_PAGES | usage | `{([] as typeof DEMO_TOP_PAGES).map(p => (` |
| 73 | DEMO_WEAK_PAGES | usage | `{([] as typeof DEMO_WEAK_PAGES).map(p => (` |
| 89 | DEMO_LIVE_PROMOTIONS | usage | `{([] as typeof DEMO_LIVE_PROMOTIONS).map(p => (` |
| 108 | DEMO_ADVISOR_SIGNALS | usage | `{([] as typeof DEMO_ADVISOR_SIGNALS).map((s, i) => (` |

## `/dev-server/src/pages/digital-presence/PresenceGate.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_HEALTH_STATS | import | `import { DEMO_HEALTH_STATS, DEMO_WORKSPACES } from "@/data/seed/digital-presence";` |
| 26 | DEMO_HEALTH_STATS | usage | `{([] as typeof DEMO_HEALTH_STATS).map((s, i) => (` |
| 43 | DEMO_WORKSPACES | usage | `{([] as typeof DEMO_WORKSPACES).map((w, i) => (` |

## `/dev-server/src/pages/digital-presence/PresenceTimeMachine.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_TIMELINE_EVENTS | import | `import { DEMO_TIMELINE_EVENTS } from "@/data/seed/digital-presence";` |
| 12 | DEMO_TIMELINE_EVENTS | usage | `const selected = DEMO_TIMELINE_EVENTS[selectedIdx];` |
| 29 | DEMO_TIMELINE_EVENTS | usage | `<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedIdx(Math.min(([] as typeof DEMO_TIME` |
| 34 | DEMO_TIMELINE_EVENTS | usage | `{([] as typeof DEMO_TIMELINE_EVENTS).map((e, i) => (` |

## `/dev-server/src/pages/digital-presence/PromotionsOffice.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_ACTIVE_PROMOTIONS | import | `import { DEMO_ACTIVE_PROMOTIONS, DEMO_EMAIL_SMS_SYNC, DEMO_PROMO_CALENDAR } from "@/data/seed/digital-presence";` |
| 29 | DEMO_ACTIVE_PROMOTIONS | usage | `{([] as typeof DEMO_ACTIVE_PROMOTIONS).map(p => (` |
| 58 | DEMO_PROMO_CALENDAR | usage | `{([] as typeof DEMO_PROMO_CALENDAR).map(e => (` |
| 74 | DEMO_EMAIL_SMS_SYNC | usage | `{([] as typeof DEMO_EMAIL_SMS_SYNC).map(e => (` |

## `/dev-server/src/pages/digital-presence/SelfHealingQueue.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 12 | DEMO_STATS | declaration | `const DEMO_STATS: any[] = [];` |
| 64 | DEMO_STATS | usage | `{([] as typeof DEMO_STATS).map(s => (` |

## `/dev-server/src/pages/digital-presence/WebsiteTwin.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_CONVERSION_PATHS | import | `import { DEMO_CONVERSION_PATHS, DEMO_PAGE_TREE, DEMO_WEAK_NODES } from "@/data/seed/digital-presence";` |
| 9 | DEMO_PAGE_TREE | usage | `function PageNode({ page, depth = 0 }: { page: typeof DEMO_PAGE_TREE[0]; depth?: number }) {` |
| 44 | DEMO_PAGE_TREE | usage | `{([] as typeof DEMO_PAGE_TREE).map(p => <PageNode key={p.path} page={p} />)}` |
| 53 | DEMO_CONVERSION_PATHS | usage | `{([] as typeof DEMO_CONVERSION_PATHS).map(cp => (` |
| 72 | DEMO_WEAK_NODES | usage | `{([] as typeof DEMO_WEAK_NODES).map(w => (` |

## `/dev-server/src/pages/enterprise/EnterpriseControlPlane.tsx` (14 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 48 | usage | `const { isDemoMode } = useDataMode();` |
| 50 | usage | `const [permissions, setPermissions] = useState(isDemoMode ? ROLE_PERMISSIONS_DEMO : {});` |
| 57 | usage | `enabled: !!user && !isDemoMode,` |
| 74 | usage | `enabled: !!user && !isDemoMode,` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 26 | DEMO_COMPLIANCE_ITEMS | import | `import { DEMO_COMPLIANCE_ITEMS, DEMO_DEPLOYMENTS, DEMO_ROLES, DEMO_SLA_METRICS, DEMO_TEAM_MEMBERS } from "@/data/seed/en` |
| 38 | DEMO_CAPABILITIES | declaration | `const DEMO_CAPABILITIES: any[] = [];` |
| 42 | DEMO_CAPABILITIES | usage | `admin: Object.fromEntries(DEMO_CAPABILITIES.map(c => [c, true])),` |
| 88 | DEMO_TEAM_MEMBERS | usage | `const TEAM_MEMBERS = (realTeamMembers?.length ? realTeamMembers : DEMO_TEAM_MEMBERS);` |
| 89 | DEMO_COMPLIANCE_ITEMS | usage | `const COMPLIANCE_ITEMS = DEMO_COMPLIANCE_ITEMS; // Compliance is config-driven, keep as reference data` |
| 112 | DEMO_SLA_METRICS | usage | `const SLA_METRICS = liveSlaData && liveSlaData.length > 0 ? liveSlaData : DEMO_SLA_METRICS;` |
| 113 | DEMO_DEPLOYMENTS | usage | `const DEPLOYMENTS = (realAuditLogs?.length ? realAuditLogs : DEMO_DEPLOYMENTS);` |
| 200 | DEMO_ROLES | usage | `{([] as typeof DEMO_ROLES).map(role => (` |
| 206 | DEMO_CAPABILITIES | usage | `{([] as typeof DEMO_CAPABILITIES).map(cap => (` |
| 209 | DEMO_ROLES | usage | `{([] as typeof DEMO_ROLES).map(role => (` |

## `/dev-server/src/pages/files/FilesOverview.tsx` (2 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 31 | usage | `const { isDemoMode } = useDataMode();` |
| 86 | usage | `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />` |

## `/dev-server/src/pages/integrations/ActionsApprovals.tsx` (4 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 27 | usage | `const { isDemoMode } = useDataMode();` |
| 127 | usage | `const { isDemoMode } = useDataMode();` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_ACTION_REQUESTS | import | `import { DEMO_ACTION_REQUESTS } from "@/data/seed/integrations";` |
| 150 | DEMO_ACTION_REQUESTS | usage | `{ label: "Total Actions", value: ([] as typeof DEMO_ACTION_REQUESTS).length.toString(), icon: Shield, color: "text-purpl` |

## `/dev-server/src/pages/integrations/ConnectionDetail.tsx` (3 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 15 | usage | `const { isDemoMode } = useDataMode();` |
| 21 | usage | `if (!conn && isDemoMode) return <div className="p-6 text-muted-foreground">Connection not found</div>;` |
| 22 | usage | `if (!isDemoMode) return (` |

## `/dev-server/src/pages/investment-office/BeginnerMode.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_LEARN_TOPICS | import | `import { DEMO_LEARN_TOPICS } from "@/data/seed/investment";` |
| 142 | DEMO_LEARN_TOPICS | usage | `{([] as typeof DEMO_LEARN_TOPICS).map(t => (` |

## `/dev-server/src/pages/investment-office/BehavioralFirewall.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_BEHAVIORAL_SIGNALS | import | `import { DEMO_BEHAVIORAL_SIGNALS } from "@/data/seed/investment";` |
| 21 | DEMO_BEHAVIORAL_SIGNALS | usage | `const filtered = ([] as typeof DEMO_BEHAVIORAL_SIGNALS).filter(s => filter === "all" \|\| s.type === filter);` |

## `/dev-server/src/pages/investment-office/CapitalPurpose.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_RULES | declaration | `const DEMO_RULES: any[] = [];` |
| 9 | DEMO_PURPOSES | declaration | `const DEMO_PURPOSES: any[] = [];` |
| 14 | DEMO_PURPOSES | usage | `const TOTAL = ([] as typeof DEMO_PURPOSES).reduce((s, p) => s + p.allocated, 0);` |
| 31 | DEMO_PURPOSES | usage | `{([] as typeof DEMO_PURPOSES).map((p, i) => {` |
| 61 | DEMO_RULES | usage | `{([] as typeof DEMO_RULES).map((r, i) => (` |

## `/dev-server/src/pages/investment-office/CapitalTwin.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_SHOCK_ZONES | import | `import { DEMO_SHOCK_ZONES } from "@/data/seed/investment";` |
| 11 | DEMO_PURPOSES | declaration | `const DEMO_PURPOSES: any[] = [];` |
| 57 | DEMO_PURPOSES | usage | `{([] as typeof DEMO_PURPOSES).map((p, i) => {` |
| 93 | DEMO_SHOCK_ZONES | usage | `{([] as typeof DEMO_SHOCK_ZONES).map((sz, i) => (` |

## `/dev-server/src/pages/investment-office/CatalystWarRoom.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_CATALYST_EVENTS | import | `import { DEMO_CATALYST_EVENTS } from "@/data/seed/investment";` |
| 17 | DEMO_CATALYST_EVENTS | usage | `const sorted = [...DEMO_CATALYST_EVENTS]` |

## `/dev-server/src/pages/investment-office/ConvictionEngine.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 4 | DEMO_DIMS | import | `import { DEMO_DIMS, DEMO_POSITIONS } from "@/data/seed/investment";` |
| 15 | DEMO_POSITIONS | usage | `{([] as typeof DEMO_POSITIONS).map((p, pi) => (` |
| 31 | DEMO_DIMS | usage | `{([] as typeof DEMO_DIMS).map(d => {` |

## `/dev-server/src/pages/investment-office/CrossAssetStoryEngine.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_NARRATIVES | import | `import { DEMO_NARRATIVES } from "@/data/seed/investment";` |
| 18 | DEMO_NARRATIVES | usage | `{([] as typeof DEMO_NARRATIVES).map((n, ni) => (` |

## `/dev-server/src/pages/investment-office/DecisionReadiness.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_PENDING_DECISIONS | import | `import { DEMO_PENDING_DECISIONS } from "@/data/seed/investment";` |
| 17 | DEMO_PENDING_DECISIONS | usage | `const [selected, setSelected] = useState(DEMO_PENDING_DECISIONS[0]);` |
| 28 | DEMO_PENDING_DECISIONS | usage | `{([] as typeof DEMO_PENDING_DECISIONS).map(d => {` |

## `/dev-server/src/pages/investment-office/DecisionTheater.tsx` (5 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 43 | usage | `const { isDemoMode } = useDataMode();` |
| 203 | usage | `const { isDemoMode } = useDataMode();` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_READINESS_DIMENSIONS | import | `import { DEMO_READINESS_DIMENSIONS } from "@/data/seed/investment";` |
| 208 | DEMO_READINESS_DIMENSIONS | usage | `const overallReadiness = Math.round(([] as typeof DEMO_READINESS_DIMENSIONS).reduce((s, d) => s + d.score, 0) / ([] as t` |
| 279 | DEMO_READINESS_DIMENSIONS | usage | `{([] as typeof DEMO_READINESS_DIMENSIONS).map(d => (` |

## `/dev-server/src/pages/investment-office/DisagreementEngine.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_DISAGREEMENTS | declaration | `const DEMO_DISAGREEMENTS: any[] = [];` |
| 18 | DEMO_DISAGREEMENTS | usage | `{([] as typeof DEMO_DISAGREEMENTS).map((d, di) => (` |

## `/dev-server/src/pages/investment-office/EventProbabilityLab.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_EVENTS | import | `import { DEMO_EVENTS } from "@/data/seed/investment";` |
| 9 | DEMO_EVENTS | usage | `const [selected, setSelected] = useState(DEMO_EVENTS[0]);` |
| 20 | DEMO_EVENTS | usage | `{([] as typeof DEMO_EVENTS).map(e => (` |

## `/dev-server/src/pages/investment-office/FamilyOffice.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 4 | DEMO_FAMILY_GOALS | import | `import { DEMO_FAMILY_GOALS, DEMO_FAMILY_MEMBERS, DEMO_FAMILY_RULES } from "@/data/seed/investment";` |
| 21 | DEMO_FAMILY_MEMBERS | usage | `{([] as typeof DEMO_FAMILY_MEMBERS).map(m => (` |
| 37 | DEMO_FAMILY_GOALS | usage | `{([] as typeof DEMO_FAMILY_GOALS).map((g, i) => {` |
| 71 | DEMO_FAMILY_RULES | usage | `{([] as typeof DEMO_FAMILY_RULES).map((r, i) => (` |

## `/dev-server/src/pages/investment-office/InvestmentConstitution.tsx` (9 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_CONSTITUTION_RULES | import | `import { DEMO_CONSTITUTION_RULES, DEMO_CURRENT_VIOLATIONS } from "@/data/seed/investment";` |
| 9 | DEMO_CATEGORIES | declaration | `const DEMO_CATEGORIES: any[] = [];` |
| 24 | DEMO_CONSTITUTION_RULES | usage | `const filtered = ([] as typeof DEMO_CONSTITUTION_RULES).filter(r => filter === "all" \|\| r.category === filter);` |
| 34 | DEMO_CURRENT_VIOLATIONS | usage | `{([] as typeof DEMO_CURRENT_VIOLATIONS).length > 0 && (` |
| 37 | DEMO_CURRENT_VIOLATIONS | usage | `<AlertTriangle className="h-3 w-3" /> {([] as typeof DEMO_CURRENT_VIOLATIONS).length} Active Violations` |
| 39 | DEMO_CURRENT_VIOLATIONS | usage | `{([] as typeof DEMO_CURRENT_VIOLATIONS).map(v => {` |
| 40 | DEMO_CONSTITUTION_RULES | usage | `const rule = ([] as typeof DEMO_CONSTITUTION_RULES).find(r => r.id === v.ruleId);` |
| 53 | DEMO_CATEGORIES | usage | `{([] as typeof DEMO_CATEGORIES).map(c => (` |
| 64 | DEMO_CURRENT_VIOLATIONS | usage | `const isViolated = ([] as typeof DEMO_CURRENT_VIOLATIONS).some(v => v.ruleId === rule.id);` |

## `/dev-server/src/pages/investment-office/MarketExplorer.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_CLASS_TABS | import | `import { DEMO_CLASS_TABS } from "@/data/seed/investment";` |
| 55 | DEMO_CLASS_TABS | usage | `{([] as typeof DEMO_CLASS_TABS).map(tab => (` |

## `/dev-server/src/pages/investment-office/MarketMemoryFeed.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_MEMORY_EVENTS | import | `import { DEMO_MEMORY_EVENTS } from "@/data/seed/investment";` |
| 49 | DEMO_MEMORY_EVENTS | usage | `{([] as typeof DEMO_MEMORY_EVENTS).map((evt, i) => (` |

## `/dev-server/src/pages/investment-office/OperatingModes.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_MODES | import | `import { DEMO_MODES } from "@/data/seed/investment";` |
| 19 | DEMO_MODES | usage | `{([] as typeof DEMO_MODES).map((mode, i) => {` |
| 56 | DEMO_MODES | usage | `<p className="text-3xl">{([] as typeof DEMO_MODES).find(m => m.id === activeMode)?.emoji}</p>` |
| 57 | DEMO_MODES | usage | `<p className="text-lg font-bold text-foreground">{([] as typeof DEMO_MODES).find(m => m.id === activeMode)?.label} Mode ` |
| 58 | DEMO_MODES | usage | `<p className="text-sm text-muted-foreground max-w-md mx-auto">{([] as typeof DEMO_MODES).find(m => m.id === activeMode)?` |

## `/dev-server/src/pages/investment-office/OpportunityMap.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_THEMES | import | `import { DEMO_THEMES } from "@/data/seed/investment";` |
| 12 | DEMO_THEMES | usage | `const [selectedTheme, setSelectedTheme] = useState(DEMO_THEMES[0]);` |
| 23 | DEMO_THEMES | usage | `{([] as typeof DEMO_THEMES).map((theme, i) => (` |

## `/dev-server/src/pages/investment-office/PlatformConnections.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 6 | DEMO_AVAILABLE_PLATFORMS | import | `import { DEMO_AVAILABLE_PLATFORMS } from "@/data/seed/investment";` |
| 48 | DEMO_AVAILABLE_PLATFORMS | usage | `let list = DEMO_AVAILABLE_PLATFORMS;` |

## `/dev-server/src/pages/investment-office/PositionSizingCoach.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_SIZING_SCENARIOS | import | `import { DEMO_SIZING_SCENARIOS } from "@/data/seed/investment";` |
| 10 | DEMO_SIZING_SCENARIOS | usage | `const scenario = DEMO_SIZING_SCENARIOS[selectedIdx];` |
| 22 | DEMO_SIZING_SCENARIOS | usage | `{([] as typeof DEMO_SIZING_SCENARIOS).map((s, i) => (` |

## `/dev-server/src/pages/investment-office/PostTradeLoop.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_ACTIVE_POSITIONS | import | `import { DEMO_ACTIVE_POSITIONS } from "@/data/seed/investment";` |
| 11 | DEMO_ACTIVE_POSITIONS | usage | `const [selected, setSelected] = useState(DEMO_ACTIVE_POSITIONS[0]);` |
| 24 | DEMO_ACTIVE_POSITIONS | usage | `{([] as typeof DEMO_ACTIVE_POSITIONS).map(p => (` |

## `/dev-server/src/pages/investment-office/StrategyDNA.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_DNA_DIMENSIONS | import | `import { DEMO_DNA_DIMENSIONS, DEMO_SUGGESTIONS } from "@/data/seed/investment";` |
| 33 | DEMO_DNA_DIMENSIONS | usage | `{([] as typeof DEMO_DNA_DIMENSIONS).map((d, i) => (` |
| 57 | DEMO_SUGGESTIONS | usage | `{([] as typeof DEMO_SUGGESTIONS).map((s, i) => (` |

## `/dev-server/src/pages/investment-office/ThesisJournal.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_JOURNAL_ENTRIES | import | `import { DEMO_JOURNAL_ENTRIES } from "@/data/seed/investment";` |
| 11 | DEMO_JOURNAL_ENTRIES | usage | `const thesisDrivenCount = ([] as typeof DEMO_JOURNAL_ENTRIES).filter(e => e.convictionType === "thesis-driven").length;` |
| 12 | DEMO_JOURNAL_ENTRIES | usage | `const fomoCount = ([] as typeof DEMO_JOURNAL_ENTRIES).filter(e => e.fomoFlag).length;` |
| 13 | DEMO_JOURNAL_ENTRIES | usage | `const avgConfidence = (([] as typeof DEMO_JOURNAL_ENTRIES).reduce((s, e) => s + e.confidence, 0) / ([] as typeof DEMO_JO` |
| 14 | DEMO_JOURNAL_ENTRIES | usage | `const stressCounts = { low: ([] as typeof DEMO_JOURNAL_ENTRIES).filter(e => e.stressLevel === "low").length, moderate: (` |
| 41 | DEMO_JOURNAL_ENTRIES | usage | `<p className="text-xl font-bold text-[hsl(var(--trust-safe))]">{thesisDrivenCount}<span className="text-xs text-muted-fo` |
| 58 | DEMO_JOURNAL_ENTRIES | usage | `const emotionalTag = ([] as typeof DEMO_JOURNAL_ENTRIES).find(e => e.symbol === inst?.symbol);` |

## `/dev-server/src/pages/investment-office/TimeMachineReview.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_PAST_DECISIONS | import | `import { DEMO_PAST_DECISIONS } from "@/data/seed/investment";` |
| 11 | DEMO_PAST_DECISIONS | usage | `const [selected, setSelected] = useState(DEMO_PAST_DECISIONS[0]);` |
| 23 | DEMO_PAST_DECISIONS | usage | `{([] as typeof DEMO_PAST_DECISIONS).map(d => (` |

## `/dev-server/src/pages/investment-office/WhatWouldBreak.tsx` (3 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 5 | DEMO_TRADES | import | `import { DEMO_TRADES } from "@/data/seed/investment";` |
| 9 | DEMO_TRADES | usage | `const [selected, setSelected] = useState(DEMO_TRADES[0]);` |
| 19 | DEMO_TRADES | usage | `{([] as typeof DEMO_TRADES).map(t => (` |

## `/dev-server/src/pages/money/DebtCreditOffice.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 13 | DEMO_ACCOUNTS | declaration | `const DEMO_ACCOUNTS: DebtAccount[] = [` |
| 24 | DEMO_ACCOUNTS | usage | `const profile = useMemo(() => computeDebtProfile(DEMO_ACCOUNTS, 850000, extraPayment), [extraPayment]);` |

## `/dev-server/src/pages/money/FinanceAutomations.tsx` (10 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 22 | DEMO_AUTOMATIONS | declaration | `const DEMO_AUTOMATIONS: FinanceAutomation[] = [` |
| 47 | DEMO_AUTOMATIONS | usage | `const filtered = tab === "all" ? DEMO_AUTOMATIONS : ([] as typeof DEMO_AUTOMATIONS).filter(a => a.status === tab);` |
| 48 | DEMO_AUTOMATIONS | usage | `const selected = ([] as typeof DEMO_AUTOMATIONS).find(a => a.id === selectedId);` |
| 50 | DEMO_AUTOMATIONS | usage | `const activeCount = ([] as typeof DEMO_AUTOMATIONS).filter(a => a.status === "active").length;` |
| 51 | DEMO_AUTOMATIONS | usage | `const suggestedCount = ([] as typeof DEMO_AUTOMATIONS).filter(a => a.status === "suggested").length;` |
| 52 | DEMO_AUTOMATIONS | usage | `const totalRuns = ([] as typeof DEMO_AUTOMATIONS).reduce((s, a) => s + a.runsTotal, 0);` |
| 53 | DEMO_AUTOMATIONS | usage | `const totalProofs = ([] as typeof DEMO_AUTOMATIONS).reduce((s, a) => s + a.proofCount, 0);` |
| 77 | DEMO_AUTOMATIONS | usage | `{ key: "paused", label: "Paused", count: ([] as typeof DEMO_AUTOMATIONS).filter(a => a.status === "paused").length },` |
| 78 | DEMO_AUTOMATIONS | usage | `{ key: "failed", label: "Failed", count: ([] as typeof DEMO_AUTOMATIONS).filter(a => a.status === "failed").length },` |
| 79 | DEMO_AUTOMATIONS | usage | `{ key: "all", label: "All", count: ([] as typeof DEMO_AUTOMATIONS).length },` |

## `/dev-server/src/pages/money/FinancialHealthPulse.tsx` (2 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 19 | usage | `const { isDemoMode } = useDataMode();` |
| 53 | usage | `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />` |

## `/dev-server/src/pages/money/HouseholdMoneyOffice.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_HOUSEHOLD | declaration | `const DEMO_HOUSEHOLD: HouseholdFinanceSummary = {` |
| 26 | DEMO_HOUSEHOLD | usage | `const hh = DEMO_HOUSEHOLD;` |

## `/dev-server/src/pages/money/MoneyOverview.tsx` (2 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 17 | usage | `const { isDemoMode } = useDataMode();` |
| 25 | usage | `const hasLiveData = isDemoMode \|\| bills.length > 0 \|\| subscriptions.length > 0 \|\| invoices.length > 0 \|\| accounts.length` |

## `/dev-server/src/pages/money/MoneySettings.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 14 | DEMO_CONNECTORS | declaration | `const DEMO_CONNECTORS: any[] = [];` |
| 82 | DEMO_CONNECTORS | usage | `{([] as typeof DEMO_CONNECTORS).map((c, i) => (` |

## `/dev-server/src/pages/money/ReceivablesObligations.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 17 | DEMO_RECEIVABLES | declaration | `const DEMO_RECEIVABLES = [` |
| 64 | DEMO_RECEIVABLES | usage | `return dbItems.length > 0 ? dbItems : DEMO_RECEIVABLES;` |

## `/dev-server/src/pages/money/ReconciliationReview.tsx` (12 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 30 | DEMO_ITEMS | declaration | `const DEMO_ITEMS: ReconciliationItem[] = [` |
| 56 | DEMO_ITEMS | usage | `const filtered = tab === "all" ? DEMO_ITEMS` |
| 57 | DEMO_ITEMS | usage | `: tab === "resolved" ? ([] as typeof DEMO_ITEMS).filter(i => i.status === "resolved")` |
| 58 | DEMO_ITEMS | usage | `: ([] as typeof DEMO_ITEMS).filter(i => i.issueType === tab && i.status !== "resolved");` |
| 60 | DEMO_ITEMS | usage | `const selected = ([] as typeof DEMO_ITEMS).find(i => i.id === selectedId);` |
| 61 | DEMO_ITEMS | usage | `const openCount = ([] as typeof DEMO_ITEMS).filter(i => i.status !== "resolved").length;` |
| 62 | DEMO_ITEMS | usage | `const mismatchCount = ([] as typeof DEMO_ITEMS).filter(i => i.issueType === "mismatch" && i.status !== "resolved").lengt` |
| 63 | DEMO_ITEMS | usage | `const uncatCount = ([] as typeof DEMO_ITEMS).filter(i => i.issueType === "uncategorized" && i.status !== "resolved").len` |
| 64 | DEMO_ITEMS | usage | `const recurringCount = ([] as typeof DEMO_ITEMS).filter(i => i.issueType === "recurring-change" && i.status !== "resolve` |
| 79 | DEMO_ITEMS | usage | `{ key: "all", label: "All", count: ([] as typeof DEMO_ITEMS).filter(i => i.status !== "resolved").length },` |
| 83 | DEMO_ITEMS | usage | `{ key: "resolved", label: "Resolved", count: ([] as typeof DEMO_ITEMS).filter(i => i.status === "resolved").length },` |
| 188 | DEMO_ITEMS | usage | `insight={`${openCount} items need review. Priority: ${mismatchCount} balance mismatches totaling $${([] as typeof DEMO_I` |

## `/dev-server/src/pages/money/ReservesSavings.tsx` (5 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 23 | usage | `const { isDemoMode } = useDataMode();` |
| 30 | usage | `queryKey: ["reserves", isDemoMode, user?.id],` |
| 32 | usage | `if (isDemoMode) return reservesData;` |
| 38 | usage | `staleTime: isDemoMode ? Infinity : 10000,` |
| 54 | usage | `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} freshness={freshness.label} />` |

## `/dev-server/src/pages/money/SpendingPulse.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 31 | DEMO_CATEGORIES | declaration | `const DEMO_CATEGORIES: SpendingCategory[] = [` |
| 40 | DEMO_RECURRING | declaration | `const DEMO_RECURRING = [` |
| 48 | DEMO_CATEGORIES | usage | `const flaggedCount = ([] as typeof DEMO_CATEGORIES).filter(c => c.flagged).length;` |
| 51 | DEMO_CATEGORIES | usage | `const totalThisWeek = useMemo(() => ([] as typeof DEMO_CATEGORIES).reduce((sum, c) => sum + c.thisWeek, 0), []);` |
| 52 | DEMO_CATEGORIES | usage | `const totalLastWeek = useMemo(() => ([] as typeof DEMO_CATEGORIES).reduce((sum, c) => sum + c.lastWeek, 0), []);` |
| 55 | DEMO_CATEGORIES | usage | `const selectedCategory = ([] as typeof DEMO_CATEGORIES).find(c => c.id === selectedId) \|\| null;` |
| 87 | DEMO_CATEGORIES | usage | `{([] as typeof DEMO_CATEGORIES).map((cat) => {` |
| 133 | DEMO_RECURRING | usage | `items={([] as typeof DEMO_RECURRING).map(c => ({` |

## `/dev-server/src/pages/money/SubscriptionsWaste.tsx` (2 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 34 | usage | `const { isDemoMode } = useDataMode();` |
| 78 | usage | `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} freshness={freshness.label} />` |

## `/dev-server/src/pages/money/TransactionIntelligence.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 21 | DEMO_TXS | declaration | `const DEMO_TXS: DemoTx[] = [` |
| 39 | DEMO_TXS | usage | `let txs = DEMO_TXS;` |
| 49 | DEMO_TXS | usage | `const total = ([] as typeof DEMO_TXS).length;` |
| 50 | DEMO_TXS | usage | `const aiCategorized = ([] as typeof DEMO_TXS).filter(t => t.categorizedBy === "ai").length;` |
| 51 | DEMO_TXS | usage | `const flagged = ([] as typeof DEMO_TXS).filter(t => t.flags.length > 0).length;` |
| 52 | DEMO_TXS | usage | `const recurring = ([] as typeof DEMO_TXS).filter(t => t.isRecurring).length;` |
| 53 | DEMO_TXS | usage | `const avgConfidence = ([] as typeof DEMO_TXS).reduce((s, t) => s + t.confidence, 0) / total;` |

## `/dev-server/src/pages/owner/ConstitutionEditor.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 27 | DEMO_EXAMPLE_RULES | import | `import { DEMO_EXAMPLE_RULES } from "@/data/seed/core-pages";` |
| 249 | DEMO_EXAMPLE_RULES | usage | `{([] as typeof DEMO_EXAMPLE_RULES).map(ex => (` |

## `/dev-server/src/pages/revenue-office/AutomationHealth.tsx` (14 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 12 | DEMO_advisorInsights | import | `import { DEMO_advisorInsights, DEMO_automations, DEMO_fatigueAlerts, DEMO_healthMetrics, DEMO_DOMAIN_HEALTH } from "@/da` |
| 29 | DEMO_healthMetrics | usage | `{([] as typeof DEMO_healthMetrics).map((m) => (` |
| 48 | DEMO_advisorInsights | usage | `{([] as typeof DEMO_advisorInsights).map((a, i) => (` |
| 61 | DEMO_automations | usage | `<TabsTrigger value="all">All ({([] as typeof DEMO_automations).length})</TabsTrigger>` |
| 62 | DEMO_automations | usage | `<TabsTrigger value="healthy">Healthy ({([] as typeof DEMO_automations).filter(a => a.status === "healthy").length})</Tab` |
| 63 | DEMO_automations | usage | `<TabsTrigger value="issues">Issues ({([] as typeof DEMO_automations).filter(a => a.status !== "healthy").length})</TabsT` |
| 64 | DEMO_fatigueAlerts | usage | `<TabsTrigger value="fatigue">Fatigue ({([] as typeof DEMO_fatigueAlerts).length})</TabsTrigger>` |
| 65 | DEMO_DOMAIN_HEALTH | usage | `<TabsTrigger value="domain">By Domain ({([] as typeof DEMO_DOMAIN_HEALTH).length})</TabsTrigger>` |
| 69 | DEMO_automations | usage | `{([] as typeof DEMO_automations).map((a) => {` |
| 106 | DEMO_automations | usage | `{([] as typeof DEMO_automations).filter(a => a.status === "healthy").map((a) => (` |
| 115 | DEMO_automations | usage | `{([] as typeof DEMO_automations).filter(a => a.status !== "healthy").map((a) => {` |
| 131 | DEMO_fatigueAlerts | usage | `{([] as typeof DEMO_fatigueAlerts).map((f, i) => (` |
| 133 | DEMO_automations | usage | `<div><p className="text-sm text-foreground">{f.contact}</p><p className="text-[10px] text-muted-foreground">{f.DEMO_auto` |
| 154 | DEMO_DOMAIN_HEALTH | usage | `{([] as typeof DEMO_DOMAIN_HEALTH).map((d) => (` |

## `/dev-server/src/pages/revenue-office/AutomationOffice.tsx` (33 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 16 | DEMO_activeAutomations | usage | `DEMO_activeAutomations, DEMO_advisorRecommendations, DEMO_atRiskAutomations,` |
| 17 | DEMO_automationStats | usage | `DEMO_automationStats, DEMO_leakRepairOpportunities,` |
| 18 | DEMO_AUTOMATION_SURFACE_MAP | usage | `DEMO_AUTOMATION_SURFACE_MAP, DEMO_AUTOMATION_OS_CONNECTIONS,` |
| 19 | DEMO_AUTOMATION_QUALITY_SCORES | usage | `DEMO_AUTOMATION_QUALITY_SCORES, DEMO_SHADOW_BOARD, DEMO_PROMISES` |
| 97 | DEMO_automationStats | usage | `{([] as typeof DEMO_automationStats).map((s) => (` |
| 115 | DEMO_activeAutomations | usage | `<TabsTrigger value="active">Active ({([] as typeof DEMO_activeAutomations).length})</TabsTrigger>` |
| 116 | DEMO_atRiskAutomations | usage | `<TabsTrigger value="atRisk">At Risk ({([] as typeof DEMO_atRiskAutomations).length})</TabsTrigger>` |
| 117 | DEMO_advisorRecommendations | usage | `<TabsTrigger value="advisors">Advisor Recs ({([] as typeof DEMO_advisorRecommendations).length})</TabsTrigger>` |
| 118 | DEMO_leakRepairOpportunities | usage | `<TabsTrigger value="leaks">Leak Repair ({([] as typeof DEMO_leakRepairOpportunities).length})</TabsTrigger>` |
| 121 | DEMO_PROMISES | usage | `<TabsTrigger value="promises">Promises ({([] as typeof DEMO_PROMISES).filter(p => p.status !== "completed").length})</Ta` |
| 216 | DEMO_AUTOMATION_SURFACE_MAP | usage | `{ label: "Domains Covered", value: `${([] as typeof DEMO_AUTOMATION_SURFACE_MAP).filter(d => d.currentLevel !== "None").` |
| 217 | DEMO_AUTOMATION_SURFACE_MAP | usage | `{ label: "Average Coverage", value: `${Math.round(([] as typeof DEMO_AUTOMATION_SURFACE_MAP).reduce((a, d) => a + d.cove` |
| 230 | DEMO_AUTOMATION_SURFACE_MAP | usage | `{([] as typeof DEMO_AUTOMATION_SURFACE_MAP).map((domain) => (` |
| 300 | DEMO_activeAutomations | usage | `{([] as typeof DEMO_activeAutomations).map((a) => (` |
| 333 | DEMO_atRiskAutomations | usage | `{([] as typeof DEMO_atRiskAutomations).map((a) => (` |
| 355 | DEMO_advisorRecommendations | usage | `{([] as typeof DEMO_advisorRecommendations).map((r, i) => (` |
| 385 | DEMO_leakRepairOpportunities | usage | `<p className="text-xs text-muted-foreground">from {([] as typeof DEMO_leakRepairOpportunities).length} automation gaps a` |
| 388 | DEMO_leakRepairOpportunities | usage | `{([] as typeof DEMO_leakRepairOpportunities).map((leak, i) => (` |
| 420 | DEMO_AUTOMATION_QUALITY_SCORES | usage | `{ label: "Safe to Automate", value: ([] as typeof DEMO_AUTOMATION_QUALITY_SCORES).filter(q => q.safetyLevel === "Safe to` |
| 421 | DEMO_AUTOMATION_QUALITY_SCORES | usage | `{ label: "Review Recommended", value: ([] as typeof DEMO_AUTOMATION_QUALITY_SCORES).filter(q => q.safetyLevel === "Revie` |
| 422 | DEMO_AUTOMATION_QUALITY_SCORES | usage | `{ label: "Needs Redesign", value: ([] as typeof DEMO_AUTOMATION_QUALITY_SCORES).filter(q => q.safetyLevel === "Needs red` |
| 423 | DEMO_AUTOMATION_QUALITY_SCORES | usage | `{ label: "Human Only", value: ([] as typeof DEMO_AUTOMATION_QUALITY_SCORES).filter(q => q.safetyLevel === "Human only").` |
| 434 | DEMO_AUTOMATION_QUALITY_SCORES | usage | `{([] as typeof DEMO_AUTOMATION_QUALITY_SCORES).map((q) => (` |
| 486 | DEMO_SHADOW_BOARD | usage | `{ label: "Automation Better", value: ([] as typeof DEMO_SHADOW_BOARD).filter(s => s.betterOutcome === "automation").leng` |
| 487 | DEMO_SHADOW_BOARD | usage | `{ label: "Human Better", value: ([] as typeof DEMO_SHADOW_BOARD).filter(s => s.betterOutcome === "human").length, color:` |
| 488 | DEMO_SHADOW_BOARD | usage | `{ label: "Promotion Candidates", value: ([] as typeof DEMO_SHADOW_BOARD).filter(s => s.promotionRecommendation.includes(` |
| 499 | DEMO_SHADOW_BOARD | usage | `{([] as typeof DEMO_SHADOW_BOARD).map((s, i) => (` |
| 546 | DEMO_PROMISES | usage | `{ label: "Overdue", value: ([] as typeof DEMO_PROMISES).filter(p => p.status === "overdue").length, color: "text-red-400` |
| 547 | DEMO_PROMISES | usage | `{ label: "Due Today", value: ([] as typeof DEMO_PROMISES).filter(p => p.status === "due_today").length, color: "text-amb` |
| 548 | DEMO_PROMISES | usage | `{ label: "On Track", value: ([] as typeof DEMO_PROMISES).filter(p => p.status === "on_track").length, color: "text-blue-` |
| 549 | DEMO_PROMISES | usage | `{ label: "Completed", value: ([] as typeof DEMO_PROMISES).filter(p => p.status === "completed").length, color: "text-eme` |
| 560 | DEMO_PROMISES | usage | `{([] as typeof DEMO_PROMISES).map((p) => (` |
| 610 | DEMO_AUTOMATION_OS_CONNECTIONS | usage | `{([] as typeof DEMO_AUTOMATION_OS_CONNECTIONS).map((conn) => (` |

## `/dev-server/src/pages/revenue-office/AutomationPolicy.tsx` (20 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 17 | DEMO_humanVsAI | import | `import { DEMO_humanVsAI, DEMO_policies, DEMO_trustLevels,` |
| 18 | DEMO_COMMERCIAL_CONSTITUTION | usage | `DEMO_COMMERCIAL_CONSTITUTION, DEMO_NO_GUESS_RULES,` |
| 19 | DEMO_PAUSE_ROLLBACK | usage | `DEMO_PAUSE_ROLLBACK, DEMO_HANDOFF_SIGNALS` |
| 86 | DEMO_trustLevels | usage | `{ l: "Trust Policies", v: ([] as typeof DEMO_trustLevels).length, c: "text-emerald-400" },` |
| 87 | DEMO_COMMERCIAL_CONSTITUTION | usage | `{ l: "Constitution Rules", v: ([] as typeof DEMO_COMMERCIAL_CONSTITUTION).length, c: "text-blue-400" },` |
| 88 | DEMO_NO_GUESS_RULES | usage | `{ l: "No-Guess Rules", v: ([] as typeof DEMO_NO_GUESS_RULES).filter(r => r.enabled).length, c: "text-purple-400" },` |
| 89 | DEMO_PAUSE_ROLLBACK | usage | `{ l: "Paused/Quarantined", v: ([] as typeof DEMO_PAUSE_ROLLBACK).length, c: "text-amber-400" },` |
| 90 | DEMO_HANDOFF_SIGNALS | usage | `{ l: "Handoff Signals", v: ([] as typeof DEMO_HANDOFF_SIGNALS).length, c: "text-red-400" },` |
| 114 | DEMO_trustLevels | usage | `{([] as typeof DEMO_trustLevels).map((t) => (` |
| 132 | DEMO_policies | usage | `{([] as typeof DEMO_policies).map((p) => (` |
| 167 | DEMO_COMMERCIAL_CONSTITUTION | usage | `{ label: "Hard Rules", value: ([] as typeof DEMO_COMMERCIAL_CONSTITUTION).filter(r => r.severity === "hard").length, col` |
| 168 | DEMO_COMMERCIAL_CONSTITUTION | usage | `{ label: "Soft Rules", value: ([] as typeof DEMO_COMMERCIAL_CONSTITUTION).filter(r => r.severity === "soft").length, col` |
| 169 | DEMO_COMMERCIAL_CONSTITUTION | usage | `{ label: "Violations (7d)", value: ([] as typeof DEMO_COMMERCIAL_CONSTITUTION).reduce((a, r) => a + r.violations7d, 0), ` |
| 180 | DEMO_COMMERCIAL_CONSTITUTION | usage | `{([] as typeof DEMO_COMMERCIAL_CONSTITUTION).map((r) => (` |
| 222 | DEMO_NO_GUESS_RULES | usage | `<CardHeader><CardTitle className="text-sm">Blocked Actions (last 7 days): <span className="text-amber-400">{([] as typeo` |
| 224 | DEMO_NO_GUESS_RULES | usage | `{([] as typeof DEMO_NO_GUESS_RULES).map((r) => (` |
| 259 | DEMO_PAUSE_ROLLBACK | usage | `{([] as typeof DEMO_PAUSE_ROLLBACK).length === 0 ? (` |
| 267 | DEMO_PAUSE_ROLLBACK | usage | `([] as typeof DEMO_PAUSE_ROLLBACK).map((p) => (` |
| 313 | DEMO_HANDOFF_SIGNALS | usage | `{([] as typeof DEMO_HANDOFF_SIGNALS).map((h, i) => (` |
| 400 | DEMO_humanVsAI | usage | `{([] as typeof DEMO_humanVsAI).map((item) => (` |

## `/dev-server/src/pages/revenue-office/AutomationReceipts.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 14 | DEMO_receipts | import | `import { DEMO_receipts, DEMO_WHY_SENT } from "@/data/seed/revenue-office";` |
| 32 | DEMO_receipts | usage | `const categories = ["all", ...Array.from(new Set(([] as typeof DEMO_receipts).map(r => r.category)))];` |
| 33 | DEMO_receipts | usage | `const filtered = tab === "all" ? DEMO_receipts : ([] as typeof DEMO_receipts).filter(r => r.category === tab);` |
| 52 | DEMO_receipts | usage | `<Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold ` |
| 53 | DEMO_receipts | usage | `<Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold ` |
| 54 | DEMO_receipts | usage | `<Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold ` |
| 55 | DEMO_receipts | usage | `<Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold ` |
| 149 | DEMO_WHY_SENT | usage | `{([] as typeof DEMO_WHY_SENT).map((w) => (` |

## `/dev-server/src/pages/revenue-office/AutomationTemplates.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 15 | DEMO_templates | import | `import { DEMO_templates } from "@/data/seed/revenue-office";` |
| 19 | DEMO_categories | declaration | `const DEMO_categories: any[] = [];` |
| 36 | DEMO_templates | usage | `const filtered = selectedCategory === "All" ? DEMO_templates : ([] as typeof DEMO_templates).filter(t => t.category === ` |
| 49 | DEMO_templates | usage | `<Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold ` |
| 50 | DEMO_categories | usage | `<Card className="bg-card/50 border-border/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold ` |
| 67 | DEMO_categories | usage | `{([] as typeof DEMO_categories).map((cat) => (` |

## `/dev-server/src/pages/revenue-office/BookingCenter.tsx` (14 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 31 | usage | `const { isDemoMode } = useDataMode();` |
| 41 | usage | `if (!isDemoMode && isLoading) {` |
| 51 | usage | `if (!isDemoMode && UPCOMING.length === 0) {` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 15 | DEMO_REV_SERVICES | usage | `DEMO_REV_SERVICES as DEMO_SERVICES,` |
| 16 | DEMO_REV_STATS | usage | `DEMO_REV_STATS as DEMO_STATS,` |
| 17 | DEMO_UPCOMING | usage | `DEMO_UPCOMING,` |
| 18 | DEMO_BOOKING_ANALYTICS | usage | `DEMO_BOOKING_ANALYTICS,` |
| 19 | DEMO_NOSHOW_RECOVERY | usage | `DEMO_NOSHOW_RECOVERY,` |
| 20 | DEMO_PREP_CHECKLISTS | usage | `DEMO_PREP_CHECKLISTS,` |
| 74 | DEMO_STATS | usage | `{([] as typeof DEMO_STATS).map(s => (` |
| 129 | DEMO_BOOKING_ANALYTICS | usage | `{([] as typeof DEMO_BOOKING_ANALYTICS).map(a => (` |
| 160 | DEMO_NOSHOW_RECOVERY | usage | `{([] as typeof DEMO_NOSHOW_RECOVERY).map((n, i) => (` |
| 197 | DEMO_PREP_CHECKLISTS | usage | `{([] as typeof DEMO_PREP_CHECKLISTS).map((pc, i) => {` |
| 234 | DEMO_SERVICES | usage | `{([] as typeof DEMO_SERVICES).map(s => (` |

## `/dev-server/src/pages/revenue-office/BusinessTimeMachine.tsx` (10 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_DECISIONS | import | `import { DEMO_DECISIONS, DEMO_PERIODS, DEMO_WHATIF, DEMO_CHIEF_HISTORICAL } from "@/data/seed/revenue-office";` |
| 29 | DEMO_PERIODS | usage | `const cur = DEMO_PERIODS[0].revenue;` |
| 30 | DEMO_PERIODS | usage | `const old = DEMO_PERIODS[([] as typeof DEMO_PERIODS).length - 1].revenue;` |
| 48 | DEMO_DECISIONS | usage | `{ l: "Key Decisions", v: ([] as typeof DEMO_DECISIONS).length, c: "text-foreground" },` |
| 50 | DEMO_CHIEF_HISTORICAL | usage | `{ l: "Synthesis History", v: ([] as typeof DEMO_CHIEF_HISTORICAL).length, c: "text-purple-400" },` |
| 72 | DEMO_PERIODS | usage | `<tbody>{([] as typeof DEMO_PERIODS).map(p => <tr key={p.period} className="border-b border-border/20"><td className="p-3` |
| 78 | DEMO_DECISIONS | usage | `{([] as typeof DEMO_DECISIONS).map((d, i) => (` |
| 82 | DEMO_DECISIONS | usage | `{i < ([] as typeof DEMO_DECISIONS).length - 1 && <div className="w-px flex-1 bg-border/40" />}` |
| 130 | DEMO_CHIEF_HISTORICAL | usage | `{([] as typeof DEMO_CHIEF_HISTORICAL).map((h, i) => (` |
| 185 | DEMO_WHATIF | usage | `{([] as typeof DEMO_WHATIF).map((s, i) => (` |

## `/dev-server/src/pages/revenue-office/CallDesk.tsx` (7 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 12 | DEMO_callAnalytics | import | `import { DEMO_callAnalytics, DEMO_callQueue, DEMO_callStats, DEMO_recentCalls } from "@/data/seed/revenue-office";` |
| 27 | DEMO_callStats | usage | `{([] as typeof DEMO_callStats).map((s) => (` |
| 40 | DEMO_callQueue | usage | `<TabsTrigger value="queue">Call Queue ({([] as typeof DEMO_callQueue).length})</TabsTrigger>` |
| 41 | DEMO_recentCalls | usage | `<TabsTrigger value="recent">Recent Calls ({([] as typeof DEMO_recentCalls).length})</TabsTrigger>` |
| 46 | DEMO_callQueue | usage | `{([] as typeof DEMO_callQueue).map((c) => (` |
| 114 | DEMO_recentCalls | usage | `{([] as typeof DEMO_recentCalls).map((c, i) => (` |
| 141 | DEMO_callAnalytics | usage | `{([] as typeof DEMO_callAnalytics).map((a) => (` |

## `/dev-server/src/pages/revenue-office/CampaignOrchestrator.tsx` (12 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 47 | usage | `const { isDemoMode } = useDataMode();` |
| 57 | usage | `if (!isDemoMode && isLoading) {` |
| 67 | usage | `if (!isDemoMode && CAMPAIGNS.length === 0) {` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 15 | DEMO_REV_CAMPAIGNS | usage | `DEMO_REV_CAMPAIGNS as DEMO_CAMPAIGNS,` |
| 16 | DEMO_REV_SEGMENTS | usage | `DEMO_REV_SEGMENTS as DEMO_SEGMENTS,` |
| 17 | DEMO_CAMPAIGN_ATTRIBUTION | usage | `DEMO_CAMPAIGN_ATTRIBUTION,` |
| 18 | DEMO_CAMPAIGN_FATIGUE | usage | `DEMO_CAMPAIGN_FATIGUE,` |
| 19 | DEMO_DELIVERABILITY | usage | `DEMO_DELIVERABILITY,` |
| 90 | DEMO_SEGMENTS | usage | `{([] as typeof DEMO_SEGMENTS).map(s => (` |
| 159 | DEMO_CAMPAIGN_ATTRIBUTION | usage | `{([] as typeof DEMO_CAMPAIGN_ATTRIBUTION).map((a, i) => (` |
| 208 | DEMO_CAMPAIGN_FATIGUE | usage | `{([] as typeof DEMO_CAMPAIGN_FATIGUE).map((f, i) => (` |
| 233 | DEMO_DELIVERABILITY | usage | `{([] as typeof DEMO_DELIVERABILITY).map(d => (` |

## `/dev-server/src/pages/revenue-office/ChiefRevenueSynthesis.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_CHIEF_HISTORICAL | import | `import { DEMO_CHIEF_HISTORICAL } from "@/data/seed/revenue-office";` |
| 107 | DEMO_CHIEF_HISTORICAL | usage | `{([] as typeof DEMO_CHIEF_HISTORICAL).map((h, i) => (` |
| 117 | DEMO_CHIEF_HISTORICAL | usage | `<span className={`text-[10px] font-medium ${h.score > DEMO_CHIEF_HISTORICAL[i - 1].score ? "text-[hsl(var(--trust-safe))` |
| 118 | DEMO_CHIEF_HISTORICAL | usage | `{h.score > DEMO_CHIEF_HISTORICAL[i - 1].score ? "↑" : "↓"}{Math.abs(h.score - DEMO_CHIEF_HISTORICAL[i - 1].score)}` |

## `/dev-server/src/pages/revenue-office/ClientOnboarding.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_ACTIVE_CLIENTS | import | `import { DEMO_ACTIVE_CLIENTS, DEMO_JOURNEYS } from "@/data/seed/revenue-office";` |
| 31 | DEMO_JOURNEYS | usage | `{ label: "Active Journeys", value: ([] as typeof DEMO_JOURNEYS).filter(j => j.status === "active").length },` |
| 32 | DEMO_ACTIVE_CLIENTS | usage | `{ label: "Clients Onboarding", value: ([] as typeof DEMO_ACTIVE_CLIENTS).filter(c => c.status !== "completed").length },` |
| 34 | DEMO_ACTIVE_CLIENTS | usage | `{ label: "Delayed", value: ([] as typeof DEMO_ACTIVE_CLIENTS).filter(c => c.status === "delayed").length, color: "text-a` |
| 58 | DEMO_JOURNEYS | usage | `{([] as typeof DEMO_JOURNEYS).map(journey => (` |
| 113 | DEMO_ACTIVE_CLIENTS | usage | `{([] as typeof DEMO_ACTIVE_CLIENTS).map((client, i) => (` |

## `/dev-server/src/pages/revenue-office/CommercialMemoryFeed.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_MEMORY_PINNED | import | `import { DEMO_MEMORY_PINNED } from "@/data/seed/revenue-office";` |
| 18 | DEMO_MEMORY_PINNED | usage | `const pinnedItems = DEMO_MEMORY_PINNED;` |

## `/dev-server/src/pages/revenue-office/ConversionLab.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_EXPERIMENTS | import | `import { DEMO_EXPERIMENTS } from "@/data/seed/revenue-office";` |
| 61 | DEMO_EXPERIMENTS | usage | `})) : DEMO_EXPERIMENTS);` |

## `/dev-server/src/pages/revenue-office/FormsBuilder.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_FIELD_TYPES | import | `import { DEMO_FIELD_TYPES, DEMO_FORMS, DEMO_SAMPLE_FIELDS } from "@/data/seed/revenue-office";` |
| 13 | DEMO_STATS | declaration | `const DEMO_STATS: any[] = [];` |
| 32 | DEMO_STATS | usage | `{([] as typeof DEMO_STATS).map(s => (` |
| 56 | DEMO_FORMS | usage | `{([] as typeof DEMO_FORMS).map(form => (` |
| 94 | DEMO_FIELD_TYPES | usage | `{([] as typeof DEMO_FIELD_TYPES).map(ft => (` |
| 116 | DEMO_SAMPLE_FIELDS | usage | `{([] as typeof DEMO_SAMPLE_FIELDS).map(field => (` |

## `/dev-server/src/pages/revenue-office/FunnelBuilder.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 9 | DEMO_FUNNELS | import | `import { DEMO_FUNNELS, DEMO_FUNNEL_STEP_ANALYTICS, DEMO_FUNNEL_TRIGGERS } from "@/data/seed/revenue-office";` |
| 49 | DEMO_FUNNELS | usage | `{([] as typeof DEMO_FUNNELS).map((funnel, fi) => (` |
| 113 | DEMO_FUNNEL_STEP_ANALYTICS | usage | `{([] as typeof DEMO_FUNNEL_STEP_ANALYTICS).map((step, i) => (` |
| 148 | DEMO_FUNNEL_STEP_ANALYTICS | usage | `<p className="text-sm text-muted-foreground">Total visitors lost across all steps: <span className="text-red-400 font-bo` |
| 149 | DEMO_FUNNEL_STEP_ANALYTICS | usage | `<p className="text-xs text-muted-foreground mt-1">Biggest leak: <span className="text-foreground font-medium">{([] as ty` |
| 153 | DEMO_FUNNEL_STEP_ANALYTICS | usage | `{([] as typeof DEMO_FUNNEL_STEP_ANALYTICS).sort((a, b) => b.dropoffPct - a.dropoffPct).map((step, i) => (` |
| 173 | DEMO_FUNNEL_STEP_ANALYTICS | usage | `{([] as typeof DEMO_FUNNEL_STEP_ANALYTICS).filter(s => s.abVariants.length > 0).map((step, i) => (` |
| 200 | DEMO_FUNNEL_TRIGGERS | usage | `{([] as typeof DEMO_FUNNEL_TRIGGERS).map((t, i) => (` |

## `/dev-server/src/pages/revenue-office/GrowthAdvisorBoard.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_ADVISORS | import | `import { DEMO_ADVISORS, DEMO_ADVISOR_DEBATES, DEMO_ADVISOR_WHAT_CHANGED, DEMO_ADVISOR_INVALIDATION, DEMO_ALIGNMENT_CLUST` |
| 85 | DEMO_ADVISORS | usage | `const advisors = DEMO_ADVISORS;` |
| 86 | DEMO_ADVISOR_DEBATES | usage | `const debates = DEMO_ADVISOR_DEBATES;` |
| 87 | DEMO_ADVISOR_WHAT_CHANGED | usage | `const whatChanged = DEMO_ADVISOR_WHAT_CHANGED;` |
| 88 | DEMO_ADVISOR_INVALIDATION | usage | `const invalidation = DEMO_ADVISOR_INVALIDATION;` |
| 89 | DEMO_ALIGNMENT_CLUSTERS | usage | `const clusters = DEMO_ALIGNMENT_CLUSTERS;` |

## `/dev-server/src/pages/revenue-office/GrowthBoardroom.tsx` (8 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 39 | usage | `const { isDemoMode } = useDataMode();` |
| 55 | usage | `if (!isDemoMode && isLoading) {` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 15 | DEMO_WHAT_CHANGED | import | `import { DEMO_WHAT_CHANGED } from "@/data/seed/revenue-office";` |
| 22 | DEMO_PIPELINE_STAGES | declaration | `const DEMO_PIPELINE_STAGES: any[] = [];` |
| 23 | DEMO_ADVISOR_SIGNALS | declaration | `const DEMO_ADVISOR_SIGNALS: any[] = [];` |
| 51 | DEMO_PIPELINE_STAGES | usage | `const PIPELINE_STAGES = (liveDeals && liveDeals.length > 0 ? DEMO_PIPELINE_STAGES : []);` |
| 53 | DEMO_ADVISOR_SIGNALS | usage | `const ADVISOR_SIGNALS = DEMO_ADVISOR_SIGNALS;` |
| 210 | DEMO_WHAT_CHANGED | usage | `{([] as typeof DEMO_WHAT_CHANGED).map((w, i) => (` |

## `/dev-server/src/pages/revenue-office/GrowthDNA.tsx` (14 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_GROWTH_TRAITS | import | `import { DEMO_GROWTH_TRAITS, DEMO_PLAYS, DEMO_GROWTH_FIREWALL_ALERTS } from "@/data/seed/revenue-office";` |
| 12 | DEMO_ARCHETYPES | declaration | `const DEMO_ARCHETYPES: any[] = [];` |
| 19 | DEMO_GROWTH_TRAITS | usage | `const avg = Math.round(([] as typeof DEMO_GROWTH_TRAITS).reduce((a, t) => a + t.score, 0) / ([] as typeof DEMO_GROWTH_TR` |
| 20 | DEMO_GROWTH_FIREWALL_ALERTS | usage | `const criticalAlerts = ([] as typeof DEMO_GROWTH_FIREWALL_ALERTS).filter(a => a.severity === "critical").length;` |
| 30 | DEMO_GROWTH_TRAITS | usage | `{ l: "Strong Traits", v: ([] as typeof DEMO_GROWTH_TRAITS).filter(t => t.status === "strong").length, c: "text-[hsl(var(` |
| 31 | DEMO_GROWTH_TRAITS | usage | `{ l: "Warning Traits", v: ([] as typeof DEMO_GROWTH_TRAITS).filter(t => t.status === "warning").length, c: "text-orange-` |
| 32 | DEMO_GROWTH_FIREWALL_ALERTS | usage | `{ l: "Firewall Alerts", v: ([] as typeof DEMO_GROWTH_FIREWALL_ALERTS).length, c: criticalAlerts > 0 ? "text-destructive"` |
| 33 | DEMO_PLAYS | usage | `{ l: "Active Plays", v: ([] as typeof DEMO_PLAYS).filter(p => p.impact === "high").length, c: "text-primary" },` |
| 43 | DEMO_GROWTH_FIREWALL_ALERTS | usage | `{([] as typeof DEMO_GROWTH_FIREWALL_ALERTS).length > 0 && (` |
| 49 | DEMO_GROWTH_FIREWALL_ALERTS | usage | `{([] as typeof DEMO_GROWTH_FIREWALL_ALERTS).map(alert => (` |
| 74 | DEMO_GROWTH_TRAITS | usage | `{([] as typeof DEMO_GROWTH_TRAITS).map(t => (` |
| 91 | DEMO_ARCHETYPES | usage | `{([] as typeof DEMO_ARCHETYPES).map(a => {` |
| 95 | DEMO_GROWTH_FIREWALL_ALERTS | usage | `([] as typeof DEMO_GROWTH_FIREWALL_ALERTS).some(alert => alert.description.toLowerCase().includes(r.toLowerCase().split(` |
| 122 | DEMO_PLAYS | usage | `{([] as typeof DEMO_PLAYS).map(p => (` |

## `/dev-server/src/pages/revenue-office/JourneyTwin.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 7 | DEMO_JOURNEY_STAGES | import | `import { DEMO_JOURNEY_STAGES } from "@/data/seed/revenue-office";` |
| 48 | DEMO_JOURNEY_STAGES | usage | `})) : DEMO_JOURNEY_STAGES);` |

## `/dev-server/src/pages/revenue-office/MembershipCourseOffice.tsx` (4 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_courses | import | `import { DEMO_courses, DEMO_DRIP_SCHEDULE, DEMO_ENGAGEMENT_HEATMAP } from "@/data/seed/revenue-office";` |
| 67 | DEMO_courses | usage | `{([] as typeof DEMO_courses).map(c => (` |
| 121 | DEMO_DRIP_SCHEDULE | usage | `{([] as typeof DEMO_DRIP_SCHEDULE).map((d, i) => (` |
| 164 | DEMO_ENGAGEMENT_HEATMAP | usage | `{([] as typeof DEMO_ENGAGEMENT_HEATMAP).map(row => (` |

## `/dev-server/src/pages/revenue-office/OffersWorkspace.tsx` (12 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_REV_BUNDLES | import | `import { DEMO_REV_BUNDLES as DEMO_BUNDLES,` |
| 11 | DEMO_REV_PRODUCTS | usage | `DEMO_REV_PRODUCTS as DEMO_PRODUCTS,` |
| 12 | DEMO_OFFER_UPSELLS | usage | `DEMO_OFFER_UPSELLS,` |
| 13 | DEMO_PRICING_EXPERIMENTS | usage | `DEMO_PRICING_EXPERIMENTS,` |
| 19 | DEMO_PRODUCTS | usage | `const totalRevenue = ([] as typeof DEMO_PRODUCTS).reduce((s, p) => s + parseInt(p.revenue.replace(/[^0-9]/g, "")), 0);` |
| 20 | DEMO_PRODUCTS | usage | `const activeProd = ([] as typeof DEMO_PRODUCTS).filter(p => p.status === "active").length;` |
| 21 | DEMO_PRODUCTS | usage | `const totalSales = ([] as typeof DEMO_PRODUCTS).reduce((s, p) => s + p.sales, 0);` |
| 41 | DEMO_OFFER_UPSELLS | usage | `{ label: "Upsell Paths", value: String(([] as typeof DEMO_OFFER_UPSELLS).length), icon: ArrowUpRight, color: "text-amber` |
| 67 | DEMO_PRODUCTS | usage | `{([] as typeof DEMO_PRODUCTS).map((p, i) => (` |
| 107 | DEMO_OFFER_UPSELLS | usage | `{([] as typeof DEMO_OFFER_UPSELLS).map((u, i) => (` |
| 161 | DEMO_PRICING_EXPERIMENTS | usage | `{([] as typeof DEMO_PRICING_EXPERIMENTS).map((exp, i) => (` |
| 202 | DEMO_BUNDLES | usage | `{([] as typeof DEMO_BUNDLES).map(b => (` |

## `/dev-server/src/pages/revenue-office/OpportunityBoard.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_OPPORTUNITY_THEMES | import | `import { DEMO_OPPORTUNITY_THEMES } from "@/data/seed/revenue-office";` |
| 115 | DEMO_OPPORTUNITY_THEMES | usage | `{([] as typeof DEMO_OPPORTUNITY_THEMES).map(theme => {` |

## `/dev-server/src/pages/revenue-office/PipelineStudio.tsx` (6 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 23 | usage | `const { isDemoMode } = useDataMode();` |
| 41 | usage | `if (!isDemoMode && isLoading) {` |
| 53 | usage | `if (!isDemoMode && (!liveDeals \|\| liveDeals.length === 0)) {` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 15 | DEMO_STAGES | import | `import { DEMO_STAGES, DEMO_VELOCITY } from "@/data/seed/revenue-office";` |
| 31 | DEMO_STAGES | usage | `const STAGES = (liveDeals && liveDeals.length > 0 ? DEMO_STAGES : []);  // TODO: map liveDeals to stage structure when s` |
| 33 | DEMO_VELOCITY | usage | `const VELOCITY = (liveDeals && liveDeals.length > 0 ? DEMO_VELOCITY : DEMO_VELOCITY);` |

## `/dev-server/src/pages/revenue-office/QuoteStudio.tsx` (9 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 12 | DEMO_pricingInsights | import | `import { DEMO_pricingInsights, DEMO_quoteStats, DEMO_quotes, DEMO_upsellSuggestions } from "@/data/seed/revenue-office";` |
| 39 | DEMO_quoteStats | usage | `{([] as typeof DEMO_quoteStats).map((s) => (` |
| 52 | DEMO_quotes | usage | `<TabsTrigger value="pipeline">Pipeline ({([] as typeof DEMO_quotes).length})</TabsTrigger>` |
| 53 | DEMO_upsellSuggestions | usage | `<TabsTrigger value="upsells">Upsell Suggestions ({([] as typeof DEMO_upsellSuggestions).length})</TabsTrigger>` |
| 54 | DEMO_pricingInsights | usage | `<TabsTrigger value="insights">Pricing Insights ({([] as typeof DEMO_pricingInsights).length})</TabsTrigger>` |
| 59 | DEMO_quotes | usage | `{([] as typeof DEMO_quotes).map((q) => (` |
| 97 | DEMO_upsellSuggestions | usage | `{([] as typeof DEMO_upsellSuggestions).map((u, i) => (` |
| 117 | DEMO_pricingInsights | usage | `{([] as typeof DEMO_pricingInsights).map((p, i) => (` |
| 135 | DEMO_quotes | usage | `{ title: "AI Quote Generation", desc: "Create DEMO_quotes from CRM notes, call transcripts, intake forms, or booking con` |

## `/dev-server/src/pages/revenue-office/RelationshipCenter.tsx` (8 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 22 | usage | `const { isDemoMode } = useDataMode();` |
| 38 | usage | `if (!isDemoMode && isLoading) {` |
| 48 | usage | `if (!isDemoMode && CONTACTS.length === 0) {` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 15 | DEMO_CONTACTS | import | `import { DEMO_CONTACTS, DEMO_LIFECYCLE_STAGES, DEMO_NEXT_BEST_ACTIONS, DEMO_CONVERSATION_HISTORY, DEMO_RELATIONSHIP_GRAP` |
| 31 | DEMO_LIFECYCLE_STAGES | usage | `})) : DEMO_LIFECYCLE_STAGES);` |
| 195 | DEMO_NEXT_BEST_ACTIONS | usage | `{([] as typeof DEMO_NEXT_BEST_ACTIONS).map((nba, i) => (` |
| 225 | DEMO_RELATIONSHIP_GRAPH | usage | `{([] as typeof DEMO_RELATIONSHIP_GRAPH).map((rel, i) => (` |
| 248 | DEMO_CONVERSATION_HISTORY | usage | `{([] as typeof DEMO_CONVERSATION_HISTORY).map((ch, ci) => (` |

## `/dev-server/src/pages/revenue-office/ReputationEngine.tsx` (10 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_RATING_DIST | import | `import { DEMO_RATING_DIST, DEMO_REVIEWS, DEMO_REV_CAMPAIGNS_REPUTATION_ENGINE as DEMO_CAMPAIGNS,` |
| 12 | DEMO_REV_PLATFORMS | usage | `DEMO_REV_PLATFORMS as DEMO_PLATFORMS, DEMO_REV_STATS_REPUTATION_ENGINE as DEMO_STATS,` |
| 13 | DEMO_TESTIMONIALS | usage | `DEMO_TESTIMONIALS, DEMO_SENTIMENT_TREND,` |
| 36 | DEMO_STATS | usage | `{([] as typeof DEMO_STATS).map(s => (` |
| 71 | DEMO_RATING_DIST | usage | `{([] as typeof DEMO_RATING_DIST).map(r => (` |
| 91 | DEMO_REVIEWS | usage | `{([] as typeof DEMO_REVIEWS).map(r => (` |
| 124 | DEMO_PLATFORMS | usage | `{([] as typeof DEMO_PLATFORMS).map(p => (` |
| 153 | DEMO_CAMPAIGNS | usage | `{([] as typeof DEMO_CAMPAIGNS).map(c => (` |
| 180 | DEMO_TESTIMONIALS | usage | `{([] as typeof DEMO_TESTIMONIALS).map((t, i) => (` |
| 213 | DEMO_SENTIMENT_TREND | usage | `{([] as typeof DEMO_SENTIMENT_TREND).map(s => (` |

## `/dev-server/src/pages/revenue-office/RetentionOffice.tsx` (15 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_AT_RISK | import | `import { DEMO_AT_RISK, DEMO_HEALTH_SEGMENTS, DEMO_WIN_BACK, DEMO_CHURN_PREDICTION, DEMO_NPS_DATA } from "@/data/seed/rev` |
| 25 | DEMO_NPS_DATA | usage | `{ l: "NPS Score", v: DEMO_NPS_DATA.current, c: "text-primary" },` |
| 26 | DEMO_CHURN_PREDICTION | usage | `{ l: "Churn Risk Clients", v: ([] as typeof DEMO_CHURN_PREDICTION).length, c: "text-orange-400" },` |
| 28 | DEMO_WIN_BACK | usage | `{ l: "Win-Back Pipeline", v: ([] as typeof DEMO_WIN_BACK).length, c: "text-purple-400" },` |
| 52 | DEMO_HEALTH_SEGMENTS | usage | `{([] as typeof DEMO_HEALTH_SEGMENTS).map(s => <div key={s.label} className={`${s.color} transition-all`} style={{ width:` |
| 55 | DEMO_HEALTH_SEGMENTS | usage | `{([] as typeof DEMO_HEALTH_SEGMENTS).map(s => (` |
| 66 | DEMO_AT_RISK | usage | `{([] as typeof DEMO_AT_RISK).map(c => (` |
| 84 | DEMO_CHURN_PREDICTION | usage | `{([] as typeof DEMO_CHURN_PREDICTION).map((pred, i) => (` |
| 123 | DEMO_NPS_DATA | usage | `<p className="text-4xl font-bold text-primary mt-1">{DEMO_NPS_DATA.current}</p>` |
| 124 | DEMO_NPS_DATA | usage | `<p className="text-xs text-[hsl(var(--trust-safe))]">{DEMO_NPS_DATA.trend} vs last period</p>` |
| 130 | DEMO_NPS_DATA | usage | `<p className="text-4xl font-bold text-muted-foreground mt-1">{DEMO_NPS_DATA.previous}</p>` |
| 136 | DEMO_NPS_DATA | usage | `<p className="text-4xl font-bold text-foreground mt-1">{DEMO_NPS_DATA.distribution.reduce((a, d) => a + d.count, 0)}</p>` |
| 145 | DEMO_NPS_DATA | usage | `{DEMO_NPS_DATA.distribution.map(d => (` |
| 164 | DEMO_NPS_DATA | usage | `{DEMO_NPS_DATA.recentResponses.map((r, i) => (` |
| 179 | DEMO_WIN_BACK | usage | `{([] as typeof DEMO_WIN_BACK).map(c => (` |

## `/dev-server/src/pages/revenue-office/RevenueDecisionTheater.tsx` (9 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_pendingDecisions | import | `import { DEMO_pendingDecisions, DEMO_SCENARIO_CARDS } from "@/data/seed/revenue-office";` |
| 33 | DEMO_pendingDecisions | usage | `{ l: "Pending Decisions", v: ([] as typeof DEMO_pendingDecisions).length, c: "text-purple-400" },` |
| 34 | DEMO_SCENARIO_CARDS | usage | `{ l: "Scenarios to Review", v: ([] as typeof DEMO_SCENARIO_CARDS).length, c: "text-primary" },` |
| 35 | DEMO_SCENARIO_CARDS | usage | `{ l: "Avg Confidence", v: `${Math.round(([] as typeof DEMO_SCENARIO_CARDS).reduce((a, s) => a + s.confidence, 0) / ([] a` |
| 36 | DEMO_SCENARIO_CARDS | usage | `{ l: "Advisor Votes", v: ([] as typeof DEMO_SCENARIO_CARDS).reduce((a, s) => a + s.advisorVotes.approve + s.advisorVotes` |
| 54 | DEMO_pendingDecisions | usage | `{([] as typeof DEMO_pendingDecisions).map((d, i) => {` |
| 133 | DEMO_SCENARIO_CARDS | usage | `{([] as typeof DEMO_SCENARIO_CARDS).map((s, i) => {` |
| 190 | DEMO_pendingDecisions | usage | `{([] as typeof DEMO_pendingDecisions).map((d, i) => {` |
| 208 | DEMO_SCENARIO_CARDS | usage | `{([] as typeof DEMO_SCENARIO_CARDS).map((s, i) => {` |

## `/dev-server/src/pages/revenue-office/RevenueGate.tsx` (4 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 29 | usage | `const { isDemoMode } = useDataMode();` |
| 78 | usage | `{!isDemoMode && isLoading ? (` |

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 11 | DEMO_QUICK_ACTIONS | import | `import { DEMO_QUICK_ACTIONS } from "@/data/seed/revenue-office";` |
| 102 | DEMO_QUICK_ACTIONS | usage | `{([] as typeof DEMO_QUICK_ACTIONS).map(a => (` |

## `/dev-server/src/pages/revenue-office/RevenueIntelligence.tsx` (6 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_COHORT_DATA | import | `import { DEMO_COHORT_DATA, DEMO_LEAKAGE, DEMO_REVENUE_STREAMS } from "@/data/seed/revenue-office";` |
| 31 | DEMO_LEAKAGE | usage | `const totalLeakage = ([] as typeof DEMO_LEAKAGE).reduce((s, l) => s + parseInt(l.value.replace(/[^0-9]/g, "")), 0);` |
| 48 | DEMO_REVENUE_STREAMS | usage | `{ label: "Active Streams", value: String(([] as typeof DEMO_REVENUE_STREAMS).length), icon: Layers, color: "text-purple-` |
| 79 | DEMO_REVENUE_STREAMS | usage | `{([] as typeof DEMO_REVENUE_STREAMS).map(r => (` |
| 159 | DEMO_COHORT_DATA | usage | `{([] as typeof DEMO_COHORT_DATA).map(c => (` |
| 181 | DEMO_LEAKAGE | usage | `{([] as typeof DEMO_LEAKAGE).map(l => (` |

## `/dev-server/src/pages/revenue-office/SegmentationEngine.tsx` (8 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 10 | DEMO_SCORING_RULES | import | `import { DEMO_SCORING_RULES, DEMO_TOP_LEADS } from "@/data/seed/revenue-office";` |
| 14 | DEMO_SEGMENTS | declaration | `const DEMO_SEGMENTS: any[] = [];` |
| 33 | DEMO_SEGMENTS | usage | `{ label: "Segments", value: ([] as typeof DEMO_SEGMENTS).length, color: "text-foreground" },` |
| 35 | DEMO_TOP_LEADS | usage | `{ label: "Scored Leads", value: ([] as typeof DEMO_TOP_LEADS).length, color: "text-blue-400" },` |
| 61 | DEMO_SEGMENTS | usage | `{([] as typeof DEMO_SEGMENTS).map(seg => (` |
| 86 | DEMO_SCORING_RULES | usage | `<h3 className="text-sm font-semibold mb-4">Lead Scoring Rules ({([] as typeof DEMO_SCORING_RULES).length} signals)</h3>` |
| 88 | DEMO_SCORING_RULES | usage | `{([] as typeof DEMO_SCORING_RULES).map((rule, i) => (` |
| 108 | DEMO_TOP_LEADS | usage | `{([] as typeof DEMO_TOP_LEADS).map((lead, i) => (` |

## `/dev-server/src/pages/revenue-office/TrustPulse.tsx` (12 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_CLIENTS | import | `import { DEMO_CLIENTS, DEMO_TRUST_DIMENSIONS, DEMO_SENTIMENT_TREND } from "@/data/seed/revenue-office";` |
| 12 | DEMO_ALERTS | declaration | `const DEMO_ALERTS: any[] = [];` |
| 18 | DEMO_CLIENTS | usage | `const avg = Math.round(([] as typeof DEMO_CLIENTS).reduce((a, c) => a + c.score, 0) / ([] as typeof DEMO_CLIENTS).length` |
| 19 | DEMO_TRUST_DIMENSIONS | usage | `const dimAvg = Math.round(([] as typeof DEMO_TRUST_DIMENSIONS).reduce((a, d) => a + d.score, 0) / ([] as typeof DEMO_TRU` |
| 20 | DEMO_SENTIMENT_TREND | usage | `const latestSentiment = DEMO_SENTIMENT_TREND[([] as typeof DEMO_SENTIMENT_TREND).length - 1];` |
| 31 | DEMO_CLIENTS | usage | `{ l: "Strong Clients", v: ([] as typeof DEMO_CLIENTS).filter(c => c.score >= 80).length, c: "text-[hsl(var(--trust-safe)` |
| 32 | DEMO_CLIENTS | usage | `{ l: "At Risk", v: ([] as typeof DEMO_CLIENTS).filter(c => c.score < 50).length, c: "text-destructive" },` |
| 55 | DEMO_TRUST_DIMENSIONS | usage | `{([] as typeof DEMO_TRUST_DIMENSIONS).map(dim => (` |
| 76 | DEMO_TRUST_DIMENSIONS | usage | `{([] as typeof DEMO_TRUST_DIMENSIONS).map(dim => (` |
| 95 | DEMO_CLIENTS | usage | `{([] as typeof DEMO_CLIENTS).sort((a, b) => a.score - b.score).map(c => (` |
| 114 | DEMO_SENTIMENT_TREND | usage | `{([] as typeof DEMO_SENTIMENT_TREND).map((s, i) => (` |
| 142 | DEMO_ALERTS | usage | `{([] as typeof DEMO_ALERTS).map((a, i) => (` |

## `/dev-server/src/pages/revenue-office/WhatBreaksGrowth.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 14 | DEMO_ADVISOR_INVALIDATION | import | `import { DEMO_ADVISOR_INVALIDATION } from "@/data/seed/revenue-office";` |
| 200 | DEMO_ADVISOR_INVALIDATION | usage | `{([] as typeof DEMO_ADVISOR_INVALIDATION).map((inv, i) => (` |

## `/dev-server/src/pages/revenue-office/WhiteLabelOffice.tsx` (9 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 8 | DEMO_BRANDS | import | `import { DEMO_BRANDS, DEMO_PARTNERS, DEMO_SPLITS } from "@/data/seed/revenue-office";` |
| 24 | DEMO_PARTNERS | usage | `const total = ([] as typeof DEMO_PARTNERS).reduce((a, p) => a + p.revenue, 0);` |
| 25 | DEMO_PARTNERS | usage | `const avgHealth = Math.round(([] as typeof DEMO_PARTNERS).reduce((a, p) => a + p.health, 0) / ([] as typeof DEMO_PARTNER` |
| 33 | DEMO_PARTNERS | usage | `{ l: "Active Partners", v: ([] as typeof DEMO_PARTNERS).filter(p => p.status === "active").length, c: "text-primary" },` |
| 34 | DEMO_PARTNERS | usage | `{ l: "Total Clients", v: ([] as typeof DEMO_PARTNERS).reduce((a, p) => a + p.clients, 0), c: "text-foreground" },` |
| 37 | DEMO_BRANDS | usage | `{ l: "Brand Kits", v: ([] as typeof DEMO_BRANDS).length, c: "text-purple-400" },` |
| 57 | DEMO_PARTNERS | usage | `{([] as typeof DEMO_PARTNERS).map(p => (` |
| 121 | DEMO_BRANDS | usage | `{([] as typeof DEMO_BRANDS).map(b => (` |
| 134 | DEMO_SPLITS | usage | `<tbody>{([] as typeof DEMO_SPLITS).map(r => <tr key={r.partner} className="border-b border-border/20"><td className="p-3` |

## `/dev-server/src/pages/settings/NotificationPreferences.tsx` (2 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 16 | DEMO_CATEGORIES | declaration | `const DEMO_CATEGORIES: any[] = [];` |
| 108 | DEMO_CATEGORIES | usage | `{([] as typeof DEMO_CATEGORIES).map((cat) => {` |

## `/dev-server/src/pages/settings/TrustedDeviceManager.tsx` (2 refs)

### isDemoMode
| Line | Kind | Code |
|------|------|------|
| 20 | usage | `const { isDemoMode } = useDataMode();` |
| 42 | usage | `{(isDemoMode ? MOCK_DEVICES : [] as typeof MOCK_DEVICES).map(device => (` |

## `/dev-server/src/pages/store/PackStorePage.tsx` (1 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 16 | DEMO_INSTALL_STATES | usage | `DEMO_INSTALL_STATES, type StoreCategory, type PackManifest,` |

## `/dev-server/src/pages/store/StoreAnalyticsPage.tsx` (5 refs)

### DEMO_ Constants
| Line | Symbol | Kind | Code |
|------|--------|------|------|
| 15 | DEMO_CATEGORY_REVENUE | import | `import { DEMO_CATEGORY_REVENUE, DEMO_RETENTION_DATA, DEMO_REVENUE_TREND } from "@/data/seed/core-pages";` |
| 71 | DEMO_REVENUE_TREND | usage | `<AreaChart data={DEMO_REVENUE_TREND}>` |
| 97 | DEMO_CATEGORY_REVENUE | usage | `<Pie data={DEMO_CATEGORY_REVENUE} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">` |
| 98 | DEMO_CATEGORY_REVENUE | usage | `{([] as typeof DEMO_CATEGORY_REVENUE).map((entry, i) => <Cell key={i} fill={entry.color} />)}` |
| 156 | DEMO_RETENTION_DATA | usage | `<AreaChart data={DEMO_RETENTION_DATA}>` |
