// ═══════════════════════════════════════════════════════════════
// SITA OS — Frontend Quality Engine
// Route-family UX scoring, flagship loop readiness, state maturity,
// design governance rules, and missing-to-world-class matrix
// ═══════════════════════════════════════════════════════════════

export type QualityTier = 'world_class' | 'premium_ready' | 'needs_polish' | 'trust_gap' | 'clarity_gap' | 'beauty_gap' | 'usability_gap' | 'accessibility_gap' | 'state_gap' | 'launch_unsafe_ux' | 'admin_clutter_risk' | 'not_yet_world_class';

export interface RouteFamilyQuality {
  family: string;
  routes: string[];
  beautyScore: number;   // 0–100
  clarityScore: number;
  trustScore: number;
  accessibilityScore: number;
  responsivenessScore: number;
  stateDesignScore: number;
  copyScore: number;
  premiumFeel: number;
  overallTier: QualityTier;
  gaps: string[];
}

export const ROUTE_FAMILY_QUALITY: RouteFamilyQuality[] = [
  {
    family: 'Auth & Onboarding',
    routes: ['/login', '/signup', '/auth/callback'],
    beautyScore: 80, clarityScore: 85, trustScore: 85, accessibilityScore: 70,
    responsivenessScore: 85, stateDesignScore: 75, copyScore: 80, premiumFeel: 78,
    overallTier: 'needs_polish',
    gaps: ['Password strength indicator missing', 'Social login buttons need premium styling', 'Error states need calmer design'],
  },
  {
    family: 'Dashboard & Pulse',
    routes: ['/dashboard', '/pulse'],
    beautyScore: 85, clarityScore: 80, trustScore: 82, accessibilityScore: 68,
    responsivenessScore: 80, stateDesignScore: 72, copyScore: 78, premiumFeel: 82,
    overallTier: 'needs_polish',
    gaps: ['Empty dashboard state needs welcome flow', 'Card density on mobile needs reduction', 'Loading skeletons not consistent'],
  },
  {
    family: 'Files & Documents',
    routes: ['/files', '/files/:id'],
    beautyScore: 78, clarityScore: 82, trustScore: 80, accessibilityScore: 65,
    responsivenessScore: 75, stateDesignScore: 70, copyScore: 75, premiumFeel: 76,
    overallTier: 'needs_polish',
    gaps: ['Upload progress needs animation polish', 'File preview lacks premium feel', 'Empty state needs visual elevation'],
  },
  {
    family: 'Boardroom & AI',
    routes: ['/boardroom', '/advisors', '/personal-brain'],
    beautyScore: 82, clarityScore: 78, trustScore: 80, accessibilityScore: 65,
    responsivenessScore: 78, stateDesignScore: 68, copyScore: 80, premiumFeel: 80,
    overallTier: 'needs_polish',
    gaps: ['AI thinking state needs calm animation', 'Response streaming needs smoother rendering', 'Source indicators missing'],
  },
  {
    family: 'Connected Services',
    routes: ['/connected-services', '/connectors'],
    beautyScore: 80, clarityScore: 82, trustScore: 78, accessibilityScore: 68,
    responsivenessScore: 80, stateDesignScore: 72, copyScore: 78, premiumFeel: 78,
    overallTier: 'needs_polish',
    gaps: ['Connect/disconnect flow needs confirmation', 'Permission display needs clarity', 'Reconnect state needs better UX'],
  },
  {
    family: 'Settings & Account',
    routes: ['/settings', '/settings/security', '/settings/notifications'],
    beautyScore: 75, clarityScore: 80, trustScore: 82, accessibilityScore: 70,
    responsivenessScore: 80, stateDesignScore: 70, copyScore: 78, premiumFeel: 74,
    overallTier: 'needs_polish',
    gaps: ['Save confirmation needs premium toast', 'Section organization could improve', 'Toggle states need visual feedback'],
  },
  {
    family: 'Admin — Truth & Launch',
    routes: ['/admin/truth-registry', '/admin/launch-readiness', '/admin/fleet-health'],
    beautyScore: 78, clarityScore: 75, trustScore: 80, accessibilityScore: 62,
    responsivenessScore: 70, stateDesignScore: 65, copyScore: 72, premiumFeel: 75,
    overallTier: 'admin_clutter_risk',
    gaps: ['Information density needs hierarchy', 'Tables need responsive cards on mobile', 'Badge overuse reduces clarity'],
  },
  {
    family: 'Admin — Security',
    routes: ['/admin/security/posture', '/admin/security/privileged-actions', '/admin/security/sensitive-assets', '/admin/security/edge-functions', '/admin/security/claim-safety', '/admin/security/incident-recovery'],
    beautyScore: 80, clarityScore: 80, trustScore: 85, accessibilityScore: 65,
    responsivenessScore: 72, stateDesignScore: 70, copyScore: 78, premiumFeel: 78,
    overallTier: 'needs_polish',
    gaps: ['Tables need horizontal scroll indicators', 'Score gauges would increase premium feel', 'Mobile layout needs work'],
  },
];

// ── Flagship Loop Readiness ─────────────────────────────────

export interface FlagshipLoopReadiness {
  name: string;
  steps: string[];
  firstImpressionScore: number;
  flowClarityScore: number;
  completionConfidenceScore: number;
  premiumFeelScore: number;
  stateHandlingScore: number;
  overallReadiness: QualityTier;
  criticalFixes: string[];
}

export const FLAGSHIP_LOOP_READINESS: FlagshipLoopReadiness[] = [
  {
    name: 'Sign In → Dashboard → Pulse',
    steps: ['Enter credentials', 'Auth redirect', 'Dashboard loads', 'Pulse data appears'],
    firstImpressionScore: 82, flowClarityScore: 85, completionConfidenceScore: 80,
    premiumFeelScore: 78, stateHandlingScore: 72,
    overallReadiness: 'needs_polish',
    criticalFixes: ['Loading shimmer during auth redirect', 'Dashboard empty state for new users', 'Pulse data skeleton while loading'],
  },
  {
    name: 'Files → Upload → AI Assist',
    steps: ['Navigate to files', 'Upload document', 'AI processes', 'Results displayed'],
    firstImpressionScore: 78, flowClarityScore: 80, completionConfidenceScore: 75,
    premiumFeelScore: 76, stateHandlingScore: 68,
    overallReadiness: 'needs_polish',
    criticalFixes: ['Upload progress animation', 'AI processing state needs calm spinner', 'File type rejection UX'],
  },
  {
    name: 'Boardroom → Summary → Decision',
    steps: ['Open boardroom', 'View AI summary', 'Review recommendations', 'Approve/reject'],
    firstImpressionScore: 80, flowClarityScore: 78, completionConfidenceScore: 80,
    premiumFeelScore: 80, stateHandlingScore: 70,
    overallReadiness: 'needs_polish',
    criticalFixes: ['Summary loading skeleton', 'Recommendation card hierarchy', 'Approval confirmation feedback'],
  },
  {
    name: 'Connected Services → Sync → Insight',
    steps: ['View services', 'Connect provider', 'Data syncs', 'Insights appear'],
    firstImpressionScore: 78, flowClarityScore: 82, completionConfidenceScore: 75,
    premiumFeelScore: 76, stateHandlingScore: 65,
    overallReadiness: 'needs_polish',
    criticalFixes: ['OAuth popup handling UX', 'Sync progress indication', 'Connected confirmation premium toast'],
  },
  {
    name: 'Admin Truth → Recommendation → Approval',
    steps: ['View truth board', 'Review recommendation', 'Approve change', 'Status updates'],
    firstImpressionScore: 75, flowClarityScore: 75, completionConfidenceScore: 78,
    premiumFeelScore: 74, stateHandlingScore: 68,
    overallReadiness: 'admin_clutter_risk',
    criticalFixes: ['Reduce badge density', 'Clearer approval flow', 'Status change animation'],
  },
];

// ── State Maturity Matrix ───────────────────────────────────

export interface StateMaturityEntry {
  stateType: string;
  description: string;
  implementedCount: number;
  totalNeeded: number;
  maturityScore: number;
  missingIn: string[];
}

export const STATE_MATURITY: StateMaturityEntry[] = [
  { stateType: 'Empty', description: 'No data yet — show helpful guidance', implementedCount: 8, totalNeeded: 15, maturityScore: 53, missingIn: ['Dashboard', 'Boardroom', 'Files first-use', 'Advisors', 'Connectors', 'Approvals', 'Notifications'] },
  { stateType: 'Loading', description: 'Data fetching — show skeletons', implementedCount: 10, totalNeeded: 15, maturityScore: 67, missingIn: ['Pulse', 'Admin boards', 'Settings', 'AI responses', 'File preview'] },
  { stateType: 'Error', description: 'Failed fetch — show recovery action', implementedCount: 6, totalNeeded: 15, maturityScore: 40, missingIn: ['Dashboard', 'Boardroom', 'Files', 'Connectors', 'AI chat', 'Admin boards', 'Notifications', 'Settings', 'Approvals'] },
  { stateType: 'Degraded', description: 'Partial data — show what works', implementedCount: 3, totalNeeded: 10, maturityScore: 30, missingIn: ['AI (no API key)', 'Connectors (offline)', 'Push (denied)', 'Dashboard (partial data)', 'Boardroom (stale)', 'Files (upload failed)', 'Admin (no data)'] },
  { stateType: 'Success', description: 'Confirmed completion — toast/animation', implementedCount: 7, totalNeeded: 12, maturityScore: 58, missingIn: ['Connector connect', 'Settings save', 'Approval action', 'File upload', 'Export complete'] },
  { stateType: 'Permission', description: 'Access denied — explain clearly', implementedCount: 4, totalNeeded: 8, maturityScore: 50, missingIn: ['Admin routes for non-admin', 'Push notification denied', 'Storage quota exceeded', 'Feature gated'] },
];

// ── Design Governance Rules ─────────────────────────────────

export interface DesignGovernanceRule {
  id: string;
  category: 'component' | 'spacing' | 'copy' | 'state' | 'anti-pattern' | 'consistency';
  rule: string;
  rationale: string;
  enforced: boolean;
}

export const DESIGN_GOVERNANCE_RULES: DesignGovernanceRule[] = [
  { id: 'DG01', category: 'component', rule: 'Use semantic color tokens only — never hardcode colors', rationale: 'Ensures theme consistency and dark/light mode support', enforced: true },
  { id: 'DG02', category: 'component', rule: 'All cards must use Card/CardHeader/CardContent from shadcn', rationale: 'Consistent elevation, padding, and border radius', enforced: true },
  { id: 'DG03', category: 'spacing', rule: 'Page padding: p-6 on desktop, p-4 on mobile', rationale: 'Consistent breathing room across all surfaces', enforced: true },
  { id: 'DG04', category: 'spacing', rule: 'Section spacing: space-y-6 between major sections', rationale: 'Visual hierarchy and scanability', enforced: true },
  { id: 'DG05', category: 'copy', rule: 'Headlines: 2xl font-bold. Subtext: sm text-muted-foreground', rationale: 'Consistent page header pattern', enforced: true },
  { id: 'DG06', category: 'copy', rule: 'Never use technical jargon in user-facing copy', rationale: 'Premium products speak plainly', enforced: false },
  { id: 'DG07', category: 'state', rule: 'Every page must handle empty, loading, and error states', rationale: 'State gaps destroy trust', enforced: false },
  { id: 'DG08', category: 'state', rule: 'Loading states use skeleton shimmer, not spinners', rationale: 'Skeletons preserve layout and feel calmer', enforced: false },
  { id: 'DG09', category: 'anti-pattern', rule: 'No more than 3 badge types per card', rationale: 'Badge overuse creates visual noise', enforced: false },
  { id: 'DG10', category: 'anti-pattern', rule: 'No emoji in admin boards (use Lucide icons instead)', rationale: 'Emoji undermines operator-grade seriousness', enforced: false },
  { id: 'DG11', category: 'consistency', rule: 'All tables use same header/row styling pattern', rationale: 'Consistent information density', enforced: true },
  { id: 'DG12', category: 'consistency', rule: 'All data-testid attributes must be kebab-case', rationale: 'Consistent test selectors for Playwright', enforced: true },
  { id: 'DG13', category: 'anti-pattern', rule: 'No nested scrollable containers', rationale: 'Creates confusing scroll traps on mobile', enforced: false },
  { id: 'DG14', category: 'component', rule: 'Use Badge variant="destructive" only for genuine errors', rationale: 'Overuse of red reduces alarm signal strength', enforced: true },
  { id: 'DG15', category: 'state', rule: 'Degraded states must explain what still works', rationale: 'Partial functionality is better than a blank error page', enforced: false },
];

// ── Missing-to-World-Class Matrix ───────────────────────────

export interface MissingToWorldClassEntry {
  domain: string;
  currentQuality: QualityTier;
  beautyGap: string;
  clarityGap: string;
  trustGap: string;
  accessibilityGap: string;
  responsivenessGap: string;
  stateDesignGap: string;
  copyGap: string;
  premiumGap: string;
  exactFixes: string[];
}

export const MISSING_TO_WORLD_CLASS: MissingToWorldClassEntry[] = [
  {
    domain: 'Auth & Onboarding',
    currentQuality: 'needs_polish',
    beautyGap: 'Social login buttons need premium variant',
    clarityGap: 'Password requirements not visible upfront',
    trustGap: 'Error messages too technical',
    accessibilityGap: 'Focus ring not visible on dark theme',
    responsivenessGap: 'Form width too narrow on desktop',
    stateDesignGap: 'No loading state during auth',
    copyGap: 'Error copy needs humanizing',
    premiumGap: 'Lacks brand warmth on first impression',
    exactFixes: ['Add loading overlay during auth', 'Humanize error messages', 'Add password strength meter', 'Fix focus rings'],
  },
  {
    domain: 'Dashboard & Pulse',
    currentQuality: 'needs_polish',
    beautyGap: 'Cards lack subtle elevation variation',
    clarityGap: 'Key metrics not immediately scannable',
    trustGap: 'Stale data not indicated',
    accessibilityGap: 'Chart colors not colorblind-safe',
    responsivenessGap: 'Grid collapses poorly on tablet',
    stateDesignGap: 'No first-use welcome state',
    copyGap: 'Metric labels too abbreviated',
    premiumGap: 'Needs subtle motion on data refresh',
    exactFixes: ['Add welcome flow for new users', 'Indicate data freshness', 'Improve tablet grid', 'Add data refresh animation'],
  },
  {
    domain: 'Files & Documents',
    currentQuality: 'needs_polish',
    beautyGap: 'File list needs visual refinement',
    clarityGap: 'File type unclear at a glance',
    trustGap: 'Upload progress lacks confidence',
    accessibilityGap: 'Drag-drop not keyboard-accessible',
    responsivenessGap: 'File preview needs mobile layout',
    stateDesignGap: 'Empty state too sparse',
    copyGap: 'Upload instructions too brief',
    premiumGap: 'Preview experience feels basic',
    exactFixes: ['Richer file type icons', 'Animated upload progress', 'Premium empty state illustration', 'Keyboard-accessible upload'],
  },
  {
    domain: 'Boardroom & AI',
    currentQuality: 'needs_polish',
    beautyGap: 'AI response formatting inconsistent',
    clarityGap: 'Source attribution missing',
    trustGap: 'No confidence indicator on AI responses',
    accessibilityGap: 'Chat scroll not announced to screen readers',
    responsivenessGap: 'Message input cramped on mobile',
    stateDesignGap: 'AI thinking state too abrupt',
    copyGap: 'System messages need refinement',
    premiumGap: 'Streaming text needs smoother rendering',
    exactFixes: ['Add typing indicator animation', 'Source/confidence badges on responses', 'Smooth streaming render', 'Improve mobile input'],
  },
  {
    domain: 'Connected Services',
    currentQuality: 'needs_polish',
    beautyGap: 'Service cards need premium hover states',
    clarityGap: 'Permission scopes not visible enough',
    trustGap: 'Disconnect confirmation too weak',
    accessibilityGap: 'Status indicators rely on color only',
    responsivenessGap: 'Card grid needs responsive tweaks',
    stateDesignGap: 'Reconnect needed state needs attention',
    copyGap: 'Connection status labels unclear',
    premiumGap: 'OAuth flow feels abrupt',
    exactFixes: ['Premium service card variants', 'Clear permission disclosure', 'Animated connect/disconnect', 'Status icons with labels'],
  },
  {
    domain: 'Admin Boards',
    currentQuality: 'admin_clutter_risk',
    beautyGap: 'Information density lacks hierarchy',
    clarityGap: 'Too many metrics compete for attention',
    trustGap: 'Score numbers without context',
    accessibilityGap: 'Tables not keyboard-navigable',
    responsivenessGap: 'Tables overflow on small screens',
    stateDesignGap: 'No loading states on admin data',
    copyGap: 'Technical jargon in labels',
    premiumGap: 'Feels like a debug panel, not an OS',
    exactFixes: ['Add visual hierarchy to metrics', 'Responsive card alternatives to tables', 'Contextual score explanations', 'Loading skeletons for admin data'],
  },
];

// ── Frontend Quality Score ──────────────────────────────────

export function computeFrontendQualityScore() {
  const families = ROUTE_FAMILY_QUALITY;
  const avg = (key: keyof RouteFamilyQuality) =>
    Math.round(families.reduce((sum, f) => sum + (f[key] as number), 0) / families.length);

  return {
    beauty: avg('beautyScore'),
    clarity: avg('clarityScore'),
    trust: avg('trustScore'),
    accessibility: avg('accessibilityScore'),
    responsiveness: avg('responsivenessScore'),
    stateDesign: avg('stateDesignScore'),
    copy: avg('copyScore'),
    premiumFeel: avg('premiumFeel'),
    overall: Math.round(
      (avg('beautyScore') + avg('clarityScore') + avg('trustScore') +
       avg('accessibilityScore') + avg('responsivenessScore') +
       avg('stateDesignScore') + avg('copyScore') + avg('premiumFeel')) / 8
    ),
    stateMaturity: Math.round(
      STATE_MATURITY.reduce((s, e) => s + e.maturityScore, 0) / STATE_MATURITY.length
    ),
    governanceEnforced: DESIGN_GOVERNANCE_RULES.filter(r => r.enforced).length,
    governanceTotal: DESIGN_GOVERNANCE_RULES.length,
  };
}

