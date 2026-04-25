export interface OnboardingState {
  // RO-ONB-01
  setupDepth: "quick" | "balanced" | "deep" | "";
  // RO-ONB-02
  businessName: string;
  businessTypes: string[];
  teamSize: string;
  businessStage: string;
  // RO-ONB-03
  revenueSources: string[];
  revenueWeights: Record<string, number>;
  revenueGrowing: string;
  revenueWeakest: string;
  // RO-ONB-04
  leadSources: string[];
  bestSource: string;
  leastPredictable: string;
  wantMoreFrom: string;
  // RO-ONB-05
  preBuyBehavior: string[];
  whatCloses: string[];
  // RO-ONB-06
  journeyTemplate: string;
  journeyStages: string[];
  journeyPainPoints: string[];
  // RO-ONB-07
  postSaleSteps: string[];
  postSaleSlips: string[];
  // RO-ONB-08
  growthBottlenecks: string[];
  // RO-ONB-09
  teamRoles: Record<string, string>;
  needsApprovals: boolean;
  // RO-ONB-10 — computed summary
  // RO-ONB-11
  intakePaths: string[];
  // RO-ONB-12
  connectedSystems: string[];
  // RO-ONB-13
  importedFiles: string[];
  importMappings: Record<string, string>;
  // RO-ONB-14
  uploadedArtifacts: string[];
  artifactInferences: string[];
  // RO-ONB-15
  pastedUrls: string[];
  urlInferences: string[];
  // RO-ONB-16
  reconActions: Record<string, string>;
  reconConfirmed: boolean;
  // Trust & automation
  automationLevel: string;
  humanOnlyTasks: string[];
  // Conversion weakness
  conversionWeakness: string[];
  // Growth goals
  growthGoals: string[];
  // Granular approval actions
  approvalActions: string[];
  // Advisor activation
  activeAdvisors: string[];
  advisorIntensity: Record<string, "low" | "medium" | "high">;
  // Branching answers
  branchAnswers: Record<string, string[]>;
  // Multi-brand/client
  multiBrand: boolean;
  multiClient: boolean;
  // First wins
  selectedFirstWins: string[];
  businessPriorities: string[];
}

export const defaultOnboardingState: OnboardingState = {
  setupDepth: "",
  businessName: "",
  businessTypes: [],
  teamSize: "solo",
  businessStage: "growing",
  revenueSources: [],
  revenueWeights: {},
  revenueGrowing: "",
  revenueWeakest: "",
  leadSources: [],
  bestSource: "",
  leastPredictable: "",
  wantMoreFrom: "",
  preBuyBehavior: [],
  whatCloses: [],
  journeyTemplate: "",
  journeyStages: [],
  journeyPainPoints: [],
  postSaleSteps: [],
  postSaleSlips: [],
  growthBottlenecks: [],
  teamRoles: {},
  needsApprovals: false,
  intakePaths: [],
  connectedSystems: [],
  importedFiles: [],
  importMappings: {},
  uploadedArtifacts: [],
  artifactInferences: [],
  pastedUrls: [],
  urlInferences: [],
  reconActions: {},
  automationLevel: "draft_review",
  humanOnlyTasks: [],
  conversionWeakness: [],
  growthGoals: [],
  approvalActions: [],
  reconConfirmed: false,
  activeAdvisors: [],
  advisorIntensity: {},
  branchAnswers: {},
  multiBrand: false,
  multiClient: false,
  selectedFirstWins: [],
  businessPriorities: [],
};

export interface ScreenProps {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  onNext: () => void;
  onBack: () => void;
}

export const STAGES = [
  { id: "ceremony", label: "Welcome", chapter: "Formation" },
  { id: "identity", label: "Business Identity", chapter: "Formation" },
  { id: "priorities", label: "Priorities", chapter: "Formation" },
  { id: "revenue_model", label: "Revenue Model", chapter: "Engine" },
  { id: "acquisition", label: "Acquisition", chapter: "Engine" },
  { id: "conversion", label: "Conversion", chapter: "Engine" },
  { id: "journey", label: "Journey", chapter: "Engine" },
  { id: "delivery", label: "Delivery", chapter: "Delivery" },
  { id: "friction", label: "Friction & Leaks", chapter: "Delivery" },
  { id: "team", label: "Team & Roles", chapter: "Operations" },
  { id: "shape_summary", label: "Business Shape", chapter: "Operations" },
  { id: "intake_hub", label: "Intake Hub", chapter: "Import" },
  { id: "connections", label: "Connections", chapter: "Import" },
  { id: "file_import", label: "File Import", chapter: "Import" },
  { id: "artifacts", label: "Artifacts", chapter: "Import" },
  { id: "url_intake", label: "URL Intake", chapter: "Import" },
  { id: "reconciliation", label: "Reconciliation", chapter: "Import" },
  { id: "automation", label: "Trust & Auto", chapter: "Trust" },
  { id: "advisors", label: "Advisor Board", chapter: "Trust" },
  { id: "firstwin", label: "First Wins", chapter: "Launch" },
  { id: "reveal", label: "Office Reveal", chapter: "Launch" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

export const CHAPTERS = ["Formation", "Engine", "Delivery", "Operations", "Import", "Trust", "Launch"];
