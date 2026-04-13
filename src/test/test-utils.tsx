import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock Supabase globally
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ data: [], error: null }), data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
      delete: () => ({ eq: () => ({ data: null, error: null }) }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
      signUp: () => Promise.resolve({ data: {}, error: null }),
      signOut: () => Promise.resolve({ error: null }),
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
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    isAuthenticated: false,
    signOut: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock data mode
vi.mock("@/contexts/DataModeContext", () => ({
  useDataMode: () => ({ isDemoMode: true, setDemoMode: vi.fn() }),
  DataModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock demo mode
vi.mock("@/contexts/DemoModeProvider", () => ({
  useDemoMode: () => ({ isDemoMode: true, toggleDemoMode: vi.fn() }),
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

// Mock kernel
vi.mock("@/contexts/SitaKernelContext", () => ({
  useSitaKernel: () => ({ ready: true }),
  useCanonicalAction: () => ({ dispatch: vi.fn() }),
  useSharedMemory: () => ({ get: vi.fn(), set: vi.fn() }),
  useSharedTrust: () => ({ score: 1 }),
  useEntityScoped: () => ({}),
  SitaKernelProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock OS runtime
vi.mock("@/lib/hooks/useOSRuntime", () => ({
  useOSRuntime: () => ({ ready: true }),
  OSRuntimeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock reality mode
vi.mock("@/lib/dual-reality/reality-mode-context", () => ({
  useRealityMode: () => ({ mode: "real", setMode: vi.fn() }),
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

const customRender = (
  ui: ReactElement,
  options?: RenderOptions
) => render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
