import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signIn: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
  }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const onboardingComponents = [
  ["CinematicIntro", "@/components/sita/onboarding/CinematicIntro"],
  ["SetupStyleChooser", "@/components/sita/onboarding/SetupStyleChooser"],
  ["LearningPanel", "@/components/sita/onboarding/LearningPanel"],
  ["WantLessOfStep", "@/components/sita/onboarding/WantLessOfStep"],
  ["ProtectMostStep", "@/components/sita/onboarding/ProtectMostStep"],
  ["ExplanationStyleStep", "@/components/sita/onboarding/ExplanationStyleStep"],
  ["PresenceStyleStep", "@/components/sita/onboarding/PresenceStyleStep"],
  ["InterruptionStyleStep", "@/components/sita/onboarding/InterruptionStyleStep"],
  ["RitualsStep", "@/components/sita/onboarding/RitualsStep"],
  ["HouseholdGraphStep", "@/components/sita/onboarding/HouseholdGraphStep"],
  ["MemoryConsentStep", "@/components/sita/onboarding/MemoryConsentStep"],
  ["DesktopPreviewStep", "@/components/sita/onboarding/DesktopPreviewStep"],
  ["FirstSimulationStep", "@/components/sita/onboarding/FirstSimulationStep"],
  ["FirstActionsStep", "@/components/sita/onboarding/FirstActionsStep"],
  ["TrustCertificateStep", "@/components/sita/onboarding/TrustCertificateStep"],
  ["PreviewExampleModal", "@/components/sita/onboarding/PreviewExampleModal"],
  ["HomeCompositionStep", "@/components/sita/onboarding/HomeCompositionStep"],
  ["FirstConnectionsStep", "@/components/sita/onboarding/FirstConnectionsStep"],
  ["LearnLaterHub", "@/components/sita/onboarding/LearnLaterHub"],
  ["RecoverFirstStep", "@/components/sita/onboarding/RecoverFirstStep"],
  ["ContextualWelcomeTour", "@/components/sita/onboarding/ContextualWelcomeTour"],
  ["PersonalizationPivotStep", "@/components/sita/onboarding/PersonalizationPivotStep"],
] as const;

describe("Onboarding Components", () => {
  onboardingComponents.forEach(([name, path]) => {
    it(`exports ${name}`, async () => {
      const mod = await import(path);
      expect(mod[name]).toBeDefined();
      expect(typeof mod[name]).toBe("function");
    });
  });
});

describe("RestoreFlow", () => {
  it("module exports RestoreFlow component", async () => {
    const mod = await import("@/platform/sita/components/sita/RestoreFlow");
    expect(mod.RestoreFlow).toBeDefined();
  });
});

describe("OSSetupExperience", () => {
  it("module exports OSSetupExperience component", async () => {
    const mod = await import("@/platform/sita/components/sita/OSSetupExperience");
    expect(mod.OSSetupExperience).toBeDefined();
  });
});
