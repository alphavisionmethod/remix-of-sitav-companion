#!/usr/bin/env tsx
/**
 * SITA OS — Hook & Context Ownership Map Emitter
 *
 * Scans every file under src/hooks/** and src/contexts/** and classifies
 * it into one of:
 *   - "shared"            (truly cross-cutting; must live in src/hooks/**)
 *   - "app-shell"         (truly app-wide; must live in src/contexts/**)
 *   - "module:<pillar>"   (must live in src/modules/<pillar>/{hooks,contexts}/**)
 *   - "platform:<system>" (must live in src/platform/<system>/{hooks,contexts}/**)
 *   - "ambiguous"         (needs human classification)
 *
 * Classification signals:
 *   1. Imports from "@/modules/<pillar>/..."  → module:<pillar>
 *   2. Imports from "@/platform/<system>/..." (state-bearing) → platform:<system>
 *      (a hook may consume the public contract of a platform subsystem and
 *       still be cross-cutting; we use a curated list of "owner-signal"
 *       platform subsystems where a strong import implies ownership.)
 *   3. Filename heuristic: use-<owner>-* or use<Owner>* matching the
 *      pillar/platform owner registry.
 *   4. Path heuristic (fallback): location alone is not authoritative.
 *
 * Outputs:
 *   - generated/manifests/hook-ownership-map.json
 *   - generated/manifests/context-ownership-map.json
 *
 * Run:  npx tsx scripts/architecture/emit-hook-context-ownership-map.ts
 */

import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from "node:fs";
import { join, relative, basename } from "node:path";

const ROOT = process.cwd();
const HOOKS_DIR = join(ROOT, "src", "hooks");
const CONTEXTS_DIR = join(ROOT, "src", "contexts");
const OUT_DIR = join(ROOT, "generated", "manifests");

type Pillar = "business" | "concierge" | "finance" | "health" | "intelligence" | "mobile" | "trust";
const PILLARS: Pillar[] = ["business", "concierge", "finance", "health", "intelligence", "mobile", "trust"];

/**
 * Platform subsystems whose hooks/contexts are owner-coded by name.
 * Filename match (use-<keyword>-* or use<Keyword>*) is treated as ownership
 * unless the file is also imported >50× from outside that subsystem.
 */
type PlatformSystem =
  | "boardroom" | "advisors" | "trust" | "orchestration" | "sita"
  | "runtime" | "auth" | "notifications" | "security" | "governance"
  | "personal-brain" | "app-platform" | "integration" | "settings"
  | "mission-control" | "operations" | "setup" | "ai-gateway" | "nova-sdk"
  | "files" | "search" | "cloud" | "control-plane" | "eventing";

const PLATFORM_FILENAME_HINTS: Array<{ system: PlatformSystem; patterns: RegExp[] }> = [
  { system: "boardroom",       patterns: [/boardroom/i] },
  { system: "advisors",        patterns: [/advisor/i] },
  { system: "trust",           patterns: [/^use-trust/i, /trust-emit/i, /proof-chain/i, /proof-timeline/i, /flagship-loop-proof/i, /policy-decision/i, /unified-policy/i, /approval-queue/i] },
  { system: "orchestration",   patterns: [/orchestration/i, /pipeline-bootstrap/i, /autonomy/i, /signal-?bus/i, /graph-?engine/i, /simulation-?engine/i, /release-?engine/i, /release-?intelligence/i, /persisted-?engine/i, /autopilot/i] },
  { system: "sita",            patterns: [/^useOS/i, /^use-os-/i, /^use-sita/i, /^use-kernel-/i, /core-substrate/i, /electron-bridge/i, /window-?(manager|attention|keyboard|scroll|snap)/i, /dock-?context/i, /launcher-?view/i, /desktop-?widgets?/i, /wallpaper/i, /layer-?opacity/i] },
  { system: "runtime",         patterns: [/^useReality/i, /degraded-?mode/i, /kill-?switch/i, /update-?daemon/i, /native-?shell/i, /ecosystem-?devices/i] },
  { system: "auth",            patterns: [/^useIsAdmin/i, /^useRequireAdmin/i, /permission-?gate/i, /recovery-?permissions/i] },
  { system: "notifications",   patterns: [/notifications?/i] },
  { system: "security",        patterns: [/security-?fabric/i] },
  { system: "governance",      patterns: [/ai-?governance/i, /meta-?governance/i, /compute-?governance/i, /ai-?budget/i, /ai-?engineering/i, /ai-?health/i, /ai-?chat-?performance/i] },
  { system: "personal-brain",  patterns: [/^use-brain/i, /intelligence/i, /economic-?intelligence/i, /digest-?journal/i, /engine-?events/i, /live-?activity-?domain/i] },
  { system: "app-platform",    patterns: [/app-?ingestion/i, /app-?platform/i, /apps-?data/i, /^useApp(Badges|StatePersistence|Surfacing)/i] },
  { system: "integration",     patterns: [/connector-?control/i, /google-?provider/i, /shopify/i] },
  { system: "settings",        patterns: [/settings-?value/i, /user-?preferences/i, /locale-?switcher/i] },
  { system: "mission-control", patterns: [/mission-?(control|data)/i] },
  { system: "operations",      patterns: [/operational-?rituals/i, /support-?cases/i, /operations-?command/i] },
  { system: "setup",           patterns: [/onboarding-?(bridge|daemon|resume)/i, /setup-?orchestration/i, /spec-?seed/i] },
];

const MODULE_FILENAME_HINTS: Array<{ pillar: Pillar; patterns: RegExp[] }> = [
  { pillar: "business",  patterns: [/^use-?crm/i, /^use-?business/i, /useBusiness/i, /^use-?call-?desk/i, /quote-?studio/i, /scheduled-?appointments/i, /lead-?recovery/i, /revenue-?(office|memory|automation)/i, /store-?analytics/i, /^useShopify/i, /digital-?presence/i, /^use-?fip-?data/i, /^use-?sag-?data/i, /^use-?cai-?data/i, /growth-?advisor/i, /customer-?detail/i, /operations-?command-?center/i, /^use-?domain-?(data|projections)/i] },
  { pillar: "concierge", patterns: [/^use-?concierge/i, /^use-?household/i] },
  { pillar: "finance",   patterns: [/^use-?investment/i, /useInvestment/i, /^use-?money/i] },
  { pillar: "health",    patterns: [/^use-?health-?signal/i] },
  { pillar: "mobile",    patterns: [/^use-?mobile-?data/i] },
  { pillar: "trust",     patterns: [] }, // trust hooks classified under platform:trust, not module:trust
  { pillar: "intelligence", patterns: [] },
];

/**
 * Hooks/contexts that are explicitly app-shell or shared.
 * These are the "stays" allowlist confirmed by the constitution.
 */
const APP_SHELL_CONTEXTS = new Set([
  "AppearanceContext.tsx", "AuthContext.tsx", "CalmEngineContext.tsx",
  "ConnectivityContext.tsx", "DataModeContext.tsx", "DemoModeProvider.tsx",
  "DisplayModeContext.tsx", "EntityContext.tsx", "InspectorContext.tsx",
  "RuntimeProvider.tsx", "ThemeContext.tsx", "WindowManagerContext.tsx",
]);

// Contexts that are explicitly module- or platform-owned and must NEVER be
// auto-classified as app-shell. Filename hints below assign their owner.
const FORCE_OWNED_CONTEXTS: Record<string, { pillar?: Pillar; platform?: PlatformSystem }> = {
  "BusinessNavigationContext.tsx":  { pillar: "business" },
  "BusinessProfileContext.tsx":     { pillar: "business" },
  "RevenueOfficeModeContext.tsx":   { pillar: "business" },
  "ConciergeDataContext.tsx":       { pillar: "concierge" },
  "ConciergeNavigationContext.tsx": { pillar: "concierge" },
  "FinanceNavigationContext.tsx":   { pillar: "finance" },
  "SitaKernelContext.tsx":          { platform: "sita" },
  "SitaOSContext.tsx":              { platform: "sita" },
  "SitaVoiceContext.tsx":           { platform: "sita" },
  "NovaSDKContext.tsx":             { platform: "nova-sdk" },
  "AppPlatformContext.tsx":         { platform: "app-platform" },
};

const SHARED_HOOKS_ALLOWLIST = new Set([
  "use-toast.ts", "use-mobile.tsx", "use-action.ts", "useAction.ts",
  "use-confirmation.ts", "useDraftAutosave.ts", "use-reduced-motion.ts",
  "useReducedMotion.ts", "useCountUp.ts", "useIdleDetector.ts",
  "useGlobalShortcuts.ts", "useOfflineStore.ts", "use-online-status.ts",
  "usePageData.ts", "use-stale-data.ts", "use-query-freshness.ts",
  "use-realtime.ts", "use-unified-ws.ts", "use-streaming-chat.ts",
  "useLinkedContext.ts", "use-undoable-action.ts", "use-zero-latency.ts",
  "use-shell-indicators.ts", "use-global-search.ts", "use-file-upload.ts",
  "use-file-explorer.ts", "useRealtimeBridge.ts", "useProtocolBridge.ts",
  "useCurrentOrg.ts", "useCurrentPlane.ts", "useDemoModeRuntimeEnforcement.ts",
  "useMockReplacements.ts", "useExperienceSignature.ts", "useAdaptiveInterface.ts",
  "useRoutePerformance.ts", "useRoutePrefetch.ts", "use-optimistic-mutation.ts",
  "use-backend-actions.ts", "use-background-tasks.ts", "use-companion.ts",
  "use-calm-mode.ts", "use-focus-mode.ts", "use-session-restore.ts",
  "use-gesture-engine.ts", "use-accent-sync.ts", "use-adaptive-personalization.ts",
  "use-implementation-truth.ts", "use-pillar-priority.ts", "useModeData.ts",
  "useModedData.ts", "use-live-data.ts", "use-event-probabilities.ts",
  "use-catalyst-events.ts", "use-realtime-notifications.ts", "use-proactive-notifications.ts",
  "useNotifications.ts", "use-push-notifications.ts", "useAdminDurableState.ts",
  "use-admin-durable-state.ts", "use-admin-data.ts", "useAppStatePersistence.ts",
  "use-profile.ts", "use-phase10-actions.ts", "use-phase.ts",
  "use-spec-seed.ts", "use-quote-studio.ts",
]);

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (e === "__tests__") continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(e)) {
      out.push(p);
    }
  }
  return out;
}

function importsIn(file: string): string[] {
  const src = readFileSync(file, "utf8");
  const re = /from\s+["']([^"']+)["']/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

function classifyByImports(imports: string[]): { pillar?: Pillar; platforms: Set<PlatformSystem> } {
  let pillar: Pillar | undefined;
  const platforms = new Set<PlatformSystem>();
  for (const spec of imports) {
    const mp = spec.match(/^@\/modules\/([^/]+)/);
    if (mp && PILLARS.includes(mp[1] as Pillar)) {
      pillar = mp[1] as Pillar;
    }
    const pp = spec.match(/^@\/platform\/([^/]+)/);
    if (pp) {
      // Only state-bearing subsystem imports indicate ownership.
      // We treat boardroom/advisors/sita/personal-brain/orchestration/runtime/app-platform
      // /mission-control/setup as owner-signals.
      const sys = pp[1] as PlatformSystem;
      const ownerSignals: PlatformSystem[] = [
        "boardroom","advisors","sita","personal-brain","orchestration","runtime",
        "app-platform","mission-control","setup","nova-sdk",
      ];
      if ((ownerSignals as string[]).includes(sys)) platforms.add(sys);
    }
  }
  return { pillar, platforms };
}

function classifyByName(name: string): { pillar?: Pillar; platform?: PlatformSystem } {
  for (const h of MODULE_FILENAME_HINTS) {
    if (h.patterns.some(p => p.test(name))) return { pillar: h.pillar };
  }
  for (const h of PLATFORM_FILENAME_HINTS) {
    if (h.patterns.some(p => p.test(name))) return { platform: h.system };
  }
  return {};
}

interface OwnershipEntry {
  path: string;
  filename: string;
  classification: string; // "shared" | "app-shell" | "module:<pillar>" | "platform:<system>" | "ambiguous"
  evidence: { imports: { pillars: Pillar[]; platforms: PlatformSystem[] }; name: { pillar?: Pillar; platform?: PlatformSystem } };
  proposedTargetPath: string | null;
  status: "stays" | "move" | "review";
}

function classifyFile(file: string, kind: "hook" | "context"): OwnershipEntry {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const fname = basename(file);
  const imports = importsIn(file);
  const byImports = classifyByImports(imports);
  const byName = classifyByName(fname);

  // Force-owned contexts override every other signal
  if (kind === "context" && FORCE_OWNED_CONTEXTS[fname]) {
    const o = FORCE_OWNED_CONTEXTS[fname];
    if (o.pillar) {
      return { path: rel, filename: fname, classification: `module:${o.pillar}`,
        evidence: { imports: { pillars: byImports.pillar ? [byImports.pillar] : [], platforms: [...byImports.platforms] }, name: byName },
        proposedTargetPath: `src/modules/${o.pillar}/contexts/${fname}`, status: "move" };
    }
    if (o.platform) {
      return { path: rel, filename: fname, classification: `platform:${o.platform}`,
        evidence: { imports: { pillars: [], platforms: [...byImports.platforms] }, name: byName },
        proposedTargetPath: `src/platform/${o.platform}/contexts/${fname}`, status: "move" };
    }
  }
  if (kind === "context" && APP_SHELL_CONTEXTS.has(fname)) {
    return { path: rel, filename: fname, classification: "app-shell",
      evidence: { imports: { pillars: byImports.pillar ? [byImports.pillar] : [], platforms: [...byImports.platforms] }, name: byName },
      proposedTargetPath: null, status: "stays" };
  }
  if (kind === "hook" && SHARED_HOOKS_ALLOWLIST.has(fname) && !byImports.pillar) {
    return { path: rel, filename: fname, classification: "shared",
      evidence: { imports: { pillars: [], platforms: [...byImports.platforms] }, name: byName },
      proposedTargetPath: null, status: "stays" };
  }

  const pillar = byImports.pillar ?? byName.pillar;
  if (pillar) {
    const sub = kind === "hook" ? "hooks" : "contexts";
    return { path: rel, filename: fname, classification: `module:${pillar}`,
      evidence: { imports: { pillars: byImports.pillar ? [byImports.pillar] : [], platforms: [...byImports.platforms] }, name: byName },
      proposedTargetPath: `src/modules/${pillar}/${sub}/${fname}`, status: "move" };
  }

  // Pick a single platform owner: name hint > most-imported owner-signal
  const platform = byName.platform ?? [...byImports.platforms][0];
  if (platform) {
    const sub = kind === "hook" ? "hooks" : "contexts";
    return { path: rel, filename: fname, classification: `platform:${platform}`,
      evidence: { imports: { pillars: [], platforms: [...byImports.platforms] }, name: byName },
      proposedTargetPath: `src/platform/${platform}/${sub}/${fname}`, status: "move" };
  }

  // Default: shared if zero owner signals; ambiguous if it imports something owner-coded but no clear winner.
  if (byImports.platforms.size === 0 && !byImports.pillar) {
    return { path: rel, filename: fname, classification: kind === "context" ? "app-shell" : "shared",
      evidence: { imports: { pillars: [], platforms: [] }, name: byName },
      proposedTargetPath: null, status: "review" };
  }
  return { path: rel, filename: fname, classification: "ambiguous",
    evidence: { imports: { pillars: byImports.pillar ? [byImports.pillar] : [], platforms: [...byImports.platforms] }, name: byName },
    proposedTargetPath: null, status: "review" };
}

function emit(kind: "hook" | "context", dir: string, outFile: string) {
  const files = walk(dir);
  const entries = files.map(f => classifyFile(f, kind));
  // Stable sort by classification then path.
  entries.sort((a, b) => a.classification.localeCompare(b.classification) || a.path.localeCompare(b.path));
  const summary: Record<string, number> = {};
  for (const e of entries) summary[e.classification] = (summary[e.classification] ?? 0) + 1;
  const out = {
    generatedAt: process.env.SOURCE_DATE_EPOCH ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString() : new Date().toISOString(),
    kind,
    root: relative(ROOT, dir).replace(/\\/g, "/"),
    total: entries.length,
    summary,
    entries,
  };
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(outFile, JSON.stringify(out, null, 2) + "\n");
  // eslint-disable-next-line no-console
  console.log(`[${kind}] wrote ${outFile} — ${entries.length} entries`);
  // eslint-disable-next-line no-console
  console.log(`         summary: ${JSON.stringify(summary)}`);
}

emit("hook", HOOKS_DIR, join(OUT_DIR, "hook-ownership-map.json"));
emit("context", CONTEXTS_DIR, join(OUT_DIR, "context-ownership-map.json"));