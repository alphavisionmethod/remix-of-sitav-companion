// ═══════════════════════════════════════════════════════════════
// SITA OS — Surface Class Registry
// Separates Admin OS from User App at the architecture level.
// Routes, capabilities, and postures are classified by surface.
// ═══════════════════════════════════════════════════════════════

export type SurfaceClass = "admin_os" | "user_app" | "shared" | "mobile_app" | "setup";

export type SurfacePosture = "operational_governance" | "guided_daily_use" | "dense_diagnostic" | "calm_assistive";

export interface SurfaceClassDefinition {
  surfaceClass: SurfaceClass;
  name: string;
  description: string;
  posture: SurfacePosture;
  designLanguage: {
    density: "dense" | "comfortable" | "spacious";
    tone: "operational" | "premium" | "calm" | "technical";
    evidenceLevel: "full" | "summary" | "hidden";
    diagnosticsVisible: boolean;
    internalMechanicsVisible: boolean;
  };
  routePrefix: string[];
  targetAudience: string[];
}

export const SURFACE_CLASSES: Record<SurfaceClass, SurfaceClassDefinition> = {
  admin_os: {
    surfaceClass: "admin_os",
    name: "Admin OS",
    description: "Internal operating system for operators, admins, AI governance, and system diagnostics",
    posture: "operational_governance",
    designLanguage: {
      density: "dense",
      tone: "operational",
      evidenceLevel: "full",
      diagnosticsVisible: true,
      internalMechanicsVisible: true,
    },
    routePrefix: ["/admin", "/system", "/governance", "/ops", "/runtime", "/ai-governance", "/connectors-admin", "/launch-truth"],
    targetAudience: ["admin", "operator", "internal_team", "ai_engineer"],
  },
  user_app: {
    surfaceClass: "user_app",
    name: "User App",
    description: "Elegant daily-use product experience for normal workflows",
    posture: "guided_daily_use",
    designLanguage: {
      density: "comfortable",
      tone: "premium",
      evidenceLevel: "summary",
      diagnosticsVisible: false,
      internalMechanicsVisible: false,
    },
    routePrefix: ["/app", "/dashboard", "/files", "/boardroom", "/assistant", "/money", "/business", "/workspace", "/settings", "/connected-services", "/owner"],
    targetAudience: ["owner", "member", "viewer"],
  },
  shared: {
    surfaceClass: "shared",
    name: "Shared",
    description: "Components and routes shared across both surface classes",
    posture: "calm_assistive",
    designLanguage: {
      density: "comfortable",
      tone: "calm",
      evidenceLevel: "summary",
      diagnosticsVisible: false,
      internalMechanicsVisible: false,
    },
    routePrefix: ["/auth", "/onboarding", "/profile"],
    targetAudience: ["all"],
  },
  mobile_app: {
    surfaceClass: "mobile_app",
    name: "Mobile App",
    description: "User app expression for mobile surfaces",
    posture: "calm_assistive",
    designLanguage: {
      density: "spacious",
      tone: "calm",
      evidenceLevel: "summary",
      diagnosticsVisible: false,
      internalMechanicsVisible: false,
    },
    routePrefix: ["/m"],
    targetAudience: ["owner", "member"],
  },
  setup: {
    surfaceClass: "setup",
    name: "Setup",
    description: "First-use setup and onboarding flows",
    posture: "guided_daily_use",
    designLanguage: {
      density: "spacious",
      tone: "premium",
      evidenceLevel: "hidden",
      diagnosticsVisible: false,
      internalMechanicsVisible: false,
    },
    routePrefix: ["/setup", "/welcome"],
    targetAudience: ["all"],
  },
};

// ── Route Classification Engine ─────────────────────────────────

export interface RouteClassification {
  route: string;
  surfaceClass: SurfaceClass;
  posture: SurfacePosture;
  internalMechanicsVisible: boolean;
  diagnosticsVisible: boolean;
}

/**
 * Classify a route into its surface class.
 * Uses longest-prefix matching for accuracy.
 */
export function classifyRoute(route: string): RouteClassification {
  let bestMatch: SurfaceClassDefinition = SURFACE_CLASSES.shared;
  let bestLen = 0;

  for (const def of Object.values(SURFACE_CLASSES)) {
    for (const prefix of def.routePrefix) {
      if (route.startsWith(prefix) && prefix.length > bestLen) {
        bestMatch = def;
        bestLen = prefix.length;
      }
    }
  }

  return {
    route,
    surfaceClass: bestMatch.surfaceClass,
    posture: bestMatch.posture,
    internalMechanicsVisible: bestMatch.designLanguage.internalMechanicsVisible,
    diagnosticsVisible: bestMatch.designLanguage.diagnosticsVisible,
  };
}

/**
 * Check if a route belongs to Admin OS
 */
export function isAdminRoute(route: string): boolean {
  return classifyRoute(route).surfaceClass === "admin_os";
}

/**
 * Check if a route belongs to User App
 */
export function isUserAppRoute(route: string): boolean {
  return classifyRoute(route).surfaceClass === "user_app";
}

/**
 * Get the design posture for a given route
 */
export function getRoutePosture(route: string): SurfacePosture {
  return classifyRoute(route).posture;
}

/**
 * Get all route prefixes for a surface class
 */
export function getRoutePrefixes(surfaceClass: SurfaceClass): string[] {
  return SURFACE_CLASSES[surfaceClass].routePrefix;
}

// ── Surface Mode Binding ────────────────────────────────────────

export interface SurfaceModeBinding {
  surfaceClass: SurfaceClass;
  route: string;
  realityMode: "real" | "demo" | "sandbox" | "dev_demo";
  providerSource: "real_provider" | "demo_provider" | "internal_provider" | "none";
  launchHonestyClass: "truthful" | "demo_backed" | "sandbox_simulated" | "unavailable" | "planned";
  sideEffectPolicy: "full" | "simulated_only" | "blocked";
  analyticsBucket: "real" | "demo" | "internal_test" | "discard";
  userFacingStateClass: "live" | "limited" | "demo" | "unavailable" | "coming_soon" | "internal_preview";
}

/**
 * Resolve a surface mode binding for a given route and mode
 */
export function resolveSurfaceModeBinding(
  route: string,
  mode: "real" | "demo" | "sandbox" | "dev_demo"
): SurfaceModeBinding {
  const classification = classifyRoute(route);

  if (mode === "real") {
    return {
      surfaceClass: classification.surfaceClass,
      route,
      realityMode: "real",
      providerSource: "real_provider",
      launchHonestyClass: "truthful",
      sideEffectPolicy: "full",
      analyticsBucket: "real",
      userFacingStateClass: "live",
    };
  }

  if (mode === "demo") {
    return {
      surfaceClass: classification.surfaceClass,
      route,
      realityMode: "demo",
      providerSource: "demo_provider",
      launchHonestyClass: "demo_backed",
      sideEffectPolicy: "simulated_only",
      analyticsBucket: "demo",
      userFacingStateClass: "demo",
    };
  }

  return {
    surfaceClass: classification.surfaceClass,
    route,
    realityMode: mode,
    providerSource: mode === "dev_demo" ? "demo_provider" : "internal_provider",
    launchHonestyClass: mode === "dev_demo" ? "demo_backed" : "sandbox_simulated",
    sideEffectPolicy: "simulated_only",
    analyticsBucket: mode === "dev_demo" ? "internal_test" : "discard",
    userFacingStateClass: mode === "dev_demo" ? "internal_preview" : "demo",
  };
}
