import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// ── Mock user for authenticated test rendering ──
const MOCK_USER = {
  id: "test-user-000",
  aud: "authenticated",
  role: "authenticated",
  email: "test@sita.os",
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: { provider: "email" },
  user_metadata: { full_name: "Test User" },
  identities: [],
};

const MOCK_SESSION = {
  access_token: "test-access-token",
  refresh_token: "test-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  user: MOCK_USER,
};

// Track current auth mode so the mock can read it
let _authMode: "anonymous" | "authenticated" = "anonymous";

// Mock Supabase globally
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          data: [],
          error: null,
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
        data: [],
        error: null,
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ eq: () => ({ data: null, error: null }), data: null, error: null }),
      upsert: () => ({ data: null, error: null }),
      delete: () => ({ eq: () => ({ data: null, error: null }), data: null, error: null }),
    }),
    auth: {
      getSession: () => Promise.resolve({
        data: { session: _authMode === "authenticated" ? MOCK_SESSION : null },
        error: null,
      }),
      getUser: () => Promise.resolve({
        data: { user: _authMode === "authenticated" ? MOCK_USER : null },
        error: null,
      }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
      signUp: () => Promise.resolve({ data: {}, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      mfa: {
        getAuthenticatorAssuranceLevel: () => Promise.resolve({ data: { currentLevel: "aal1", nextLevel: "aal1" }, error: null }),
        listFactors: () => Promise.resolve({ data: { totp: [] }, error: null }),
      },
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: "test" }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "https://test.com/avatar.png" } }),
      }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({}),
      unsubscribe: () => {},
    }),
    removeChannel: () => {},
  },
}));

// Mock auth context
vi.mock("@/contexts/AuthContext", () => {
  return {
    useAuth: () => ({
      user: _authMode === "authenticated" ? MOCK_USER : null,
      session: _authMode === "authenticated" ? MOCK_SESSION : null,
      loading: false,
      isDemo: _authMode === "authenticated",
      requiresMFA: false,
      mfaFactorId: null,
      signUp: vi.fn().mockResolvedValue({ error: null }),
      signIn: vi.fn().mockResolvedValue({ error: null }),
      signInAsDemo: vi.fn(),
      signOut: vi.fn().mockResolvedValue(undefined),
      resetPassword: vi.fn().mockResolvedValue({ error: null }),
      updatePassword: vi.fn().mockResolvedValue({ error: null }),
      verifyMFA: vi.fn().mockResolvedValue({ error: null }),
      cancelMFA: vi.fn().mockResolvedValue(undefined),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock data mode
vi.mock("@/contexts/DataModeContext", () => ({
  useDataMode: () => ({ isDemoMode: true, isLiveMode: false, mode: "demo", setDemoMode: vi.fn(), setMode: vi.fn(), toggleMode: vi.fn(), connectors: [{ id: "c1", name: "Demo Connector", status: "connected", type: "custom" }], refreshConnectors: vi.fn() }),
  DataModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock demo mode
vi.mock("@/contexts/DemoModeProvider", () => ({
  useDemoMode: () => ({ isDemoMode: true, toggleDemoMode: vi.fn(), registerSurface: vi.fn(), getSurfaces: () => [], demoSurfaceCount: 0, realSurfaceCount: 0, dataIntegrityScore: 0, isSurfaceDemo: () => true }),
  DemoModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock theme
vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "dark", setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock display mode
vi.mock("@/contexts/DisplayModeContext", () => ({
  useDisplayMode: () => ({ displayMode: "full", setDisplayMode: vi.fn() }),
  DisplayModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock connectivity
vi.mock("@/contexts/ConnectivityContext", () => ({
  useConnectivity: () => ({ isOnline: true }),
  ConnectivityProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock entity context
vi.mock("@/contexts/EntityContext", () => ({
  useEntityContext: () => ({ entities: [], setEntities: vi.fn() }),
  EntityContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock inspector
vi.mock("@/contexts/InspectorContext", () => ({
  useInspector: () => ({ isOpen: false, toggle: vi.fn() }),
  InspectorProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock app platform
vi.mock("@/contexts/AppPlatformContext", () => ({
  useAppPlatform: () => ({
    apps: [], installApp: vi.fn(), uninstallApp: vi.fn(), loading: false, receipts: [],
    getApp: vi.fn().mockReturnValue(null),
    getLiveApp: vi.fn().mockReturnValue(null),
    browser: { tabs: [], activeTab: null, openTab: vi.fn(), closeTab: vi.fn() },
    installedApps: [], updates: [], defaultApps: {},
  }),
  AppPlatformProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock kernel
vi.mock("@/contexts/SitaKernelContext", () => ({
  useSitaKernel: () => ({ ready: true }),
  useCanonicalAction: () => ({ dispatch: vi.fn() }),
  useSharedMemory: () => ({ get: vi.fn(), set: vi.fn() }),
  useSharedTrust: () => ({ score: 1 }),
  useEntityScoped: () => ({}),
  useCloudControlPlane: () => ({ status: "healthy", actions: [] }),
  useLifeSimulator: () => ({ scenarios: [], run: vi.fn() }),
  useLifeSimulatorEngine: () => ({ simulator: { getShockTypes: () => [], run: vi.fn(), getResults: () => [] } }),
  useLifeSimulator: () => ({ scenarios: [], run: vi.fn() }),
  useKernelStatus: () => ({ status: "ready", health: "healthy" }),
  useSearchFabric: () => ({ search: vi.fn().mockResolvedValue([]), results: [], loading: false, addBatch: vi.fn() }),
  useWebsiteManager: () => ({ sites: [], createSite: vi.fn(), deleteSite: vi.fn(), loading: false }),
  useAdaptiveInterface: () => ({ interfaceState: { focused: true, mode: "default" }, cognitiveLoad: 0.2 }),
  SitaKernelProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock OS runtime
vi.mock("@/hooks/useOSRuntime", () => ({
  useOSRuntime: () => ({
    ready: true,
    engines: {
      revenue: {
        detectLeakage: vi.fn(),
        getLedger: vi.fn().mockReturnValue({ entries: [], total: 0 }),
        getMetrics: vi.fn().mockReturnValue({}),
      },
    },
  }),
  OSRuntimeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock SitaOS context
vi.mock("@/contexts/SitaOSContext", () => ({
  useSitaOS: () => ({
    hydrated: true,
    kernel: { ready: true },
    user: null,
    intentOrchestrator: { processIntent: vi.fn() },
    attentionOS: {
      getAttentionStack: () => [],
      getCognitiveLoad: () => ({ score: 0.2 }),
      getInterfaceState: () => ({ focused: true, mode: "default" }),
    },
    relationships: { getMeetingPrep: vi.fn().mockReturnValue({}) },
    personalGraph: {
      getMeetingContext: vi.fn().mockReturnValue({}),
      resolveCrossDomain: vi.fn().mockReturnValue({ touchedDomains: [], narrative: "" }),
    },
    digestEngine: {
      generateDigest: vi.fn().mockReturnValue({}),
      dailyPulse: vi.fn().mockReturnValue({}),
    },
    sitaModes: { getMode: () => "default", setMode: vi.fn() },
    chiefOfStaff: {
      getActiveInterventions: () => [],
      acknowledgeIntervention: vi.fn(),
    },
    trustActions: { evaluateAction: vi.fn().mockReturnValue({ allowed: true }) },
    deviceMesh: {
      getMeshTopology: () => ({ devices: [] }),
      getOnlinePeers: () => [],
      setDeviceRole: vi.fn(),
    },
    contextGraph: {
      getCurrentContext: () => ({}),
      updateSignal: vi.fn(),
      getContextSignals: () => [],
    },
    explainability: { explain: vi.fn().mockReturnValue(""), getExplanationHistory: () => [], clearHistory: vi.fn() },
    workspaceIntelligence: { getAvailableWorkspaces: () => [], getWorkspaceUsageStats: () => ({}), suggestWorkspace: () => null },
    briefing: { generateBriefing: vi.fn().mockReturnValue({}) },
    engines: {
      revenue: { getLedger: vi.fn().mockReturnValue({ entries: [], total: 0 }), getMetrics: vi.fn().mockReturnValue({}) },
    },
  }),
  SitaOSProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock reality mode
vi.mock("@/lib/dual-reality/reality-mode-context", () => ({
  useRealityMode: () => ({ mode: "real", setMode: vi.fn() }),
  useRealityModeSafe: () => ({ mode: "real", setMode: vi.fn() }),
  RealityModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
  Toaster: () => null,
}));

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock("recharts", () => {
  const MockChart = ({ children }: any) => <div data-testid="mock-chart">{children}</div>;
  return {
    ResponsiveContainer: MockChart,
    AreaChart: MockChart,
    LineChart: MockChart,
    BarChart: MockChart,
    PieChart: MockChart,
    RadarChart: MockChart,
    ComposedChart: MockChart,
    Area: () => null,
    Line: () => null,
    Bar: () => null,
    Pie: () => null,
    Radar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    Cell: () => null,
    PolarGrid: () => null,
    PolarAngleAxis: () => null,
    PolarRadiusAxis: () => null,
    RadialBar: () => null,
    RadialBarChart: MockChart,
    Treemap: MockChart,
    Scatter: () => null,
    ScatterChart: MockChart,
    ReferenceLine: () => null,
  };
});

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_target, prop) => {
      return React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, whileHover, whileTap, transition, layout, layoutId, ...rest } = props;
        const Tag = typeof prop === "string" ? prop : "div";
        return React.createElement(Tag, { ...rest, ref });
      });
    },
  }),
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  useMotionValue: (v: number) => ({ get: () => v, set: vi.fn() }),
  useTransform: () => ({ get: () => 0, set: vi.fn() }),
  useSpring: () => ({ get: () => 0, set: vi.fn() }),
  useInView: () => true,
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface AllProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

interface CustomRenderOptions extends RenderOptions {
  authenticated?: boolean;
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  _authMode = options?.authenticated ? "authenticated" : "anonymous";
  const { authenticated, ...renderOptions } = options ?? {};
  const result = render(ui, { wrapper: AllProviders, ...renderOptions });
  return result;
};

export * from "@testing-library/react";
export { customRender as render, MOCK_USER, MOCK_SESSION };
