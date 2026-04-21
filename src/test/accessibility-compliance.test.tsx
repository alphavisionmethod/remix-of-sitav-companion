import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

describe("Accessibility Compliance — UI Primitives ARIA", () => {
  // ── Progress ────────────────────────────────────────────────
  it("Progress renders with role=progressbar and aria-value attributes", async () => {
    const { Progress } = await import("@/components/ui/progress");
    const { container } = render(<Progress value={42} />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("role")).toBe("progressbar");
    expect(el.getAttribute("aria-valuenow")).toBe("42");
    expect(el.getAttribute("aria-valuemin")).toBe("0");
    expect(el.getAttribute("aria-valuemax")).toBe("100");
  });

  // ── Skeleton ────────────────────────────────────────────────
  it("Skeleton renders with aria-hidden=true and role=presentation", async () => {
    const { Skeleton } = await import("@/components/ui/skeleton");
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.getAttribute("role")).toBe("presentation");
  });

  // ── Badge ───────────────────────────────────────────────────
  it("Badge renders with role=status", async () => {
    const { Badge } = await import("@/components/ui/badge");
    const { container } = render(<Badge>Active</Badge>);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("role")).toBe("status");
  });

  // ── Separator ───────────────────────────────────────────────
  it("Separator renders with aria-orientation", async () => {
    const { Separator } = await import("@/components/ui/separator");
    const { container } = render(<Separator orientation="horizontal" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("Separator vertical has aria-orientation=vertical", async () => {
    const { Separator } = await import("@/components/ui/separator");
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("aria-orientation")).toBe("vertical");
  });

  // ── Input ───────────────────────────────────────────────────
  it("Input forwards aria-invalid", async () => {
    const { Input } = await import("@/components/ui/input");
    const { container } = render(<Input aria-invalid="true" />);
    const el = container.querySelector("input") as HTMLElement;
    expect(el.getAttribute("aria-invalid")).toBe("true");
  });

  // ── Textarea ────────────────────────────────────────────────
  it("Textarea forwards aria-invalid", async () => {
    const { Textarea } = await import("@/components/ui/textarea");
    const { container } = render(<Textarea aria-invalid="true" />);
    const el = container.querySelector("textarea") as HTMLElement;
    expect(el.getAttribute("aria-invalid")).toBe("true");
  });

  // ── Toast ───────────────────────────────────────────────────
  it("Toast renders with role=alert and aria-live=assertive", async () => {
    const { Toast, ToastProvider, ToastViewport } = await import("@/components/ui/toast");
    const { container } = render(
      <ToastProvider>
        <Toast open>
          <span>Notification</span>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    const alertEl = container.querySelector("[role='alert']");
    expect(alertEl).toBeTruthy();
    expect(alertEl?.getAttribute("aria-live")).toBe("assertive");
  });

  // ── Tooltip ─────────────────────────────────────────────────
  it("TooltipContent renders with role=tooltip", async () => {
    const { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } = await import("@/components/ui/tooltip");
    const { container } = render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Help text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    // Tooltip content may be portaled; check document body
    const tooltipEl = document.querySelector("[role='tooltip']");
    expect(tooltipEl).toBeTruthy();
  });

  // ── Switch (Radix provides aria-checked) ────────────────────
  it("Switch renders with role=switch from Radix", async () => {
    const { Switch } = await import("@/components/ui/switch");
    const { container } = render(<Switch />);
    const el = container.querySelector("[role='switch']");
    expect(el).toBeTruthy();
  });

  // ── Slider (Radix provides aria-value*) ─────────────────────
  it("Slider renders with role=slider from Radix", async () => {
    const { Slider } = await import("@/components/ui/slider");
    const { container } = render(<Slider defaultValue={[50]} max={100} />);
    const el = container.querySelector("[role='slider']");
    expect(el).toBeTruthy();
  });

  // ── Button (native <button> has implicit role) ──────────────
  it("Button is keyboard-accessible (renders as <button>)", async () => {
    const { Button } = await import("@/components/ui/button");
    const { container } = render(<Button>Click</Button>);
    const btn = container.querySelector("button");
    expect(btn).toBeTruthy();
    expect(btn?.tagName).toBe("BUTTON");
  });

  // ── Alert ───────────────────────────────────────────────────
  it("Alert renders with role=alert", async () => {
    const { Alert } = await import("@/components/ui/alert");
    const { container } = render(<Alert>Warning!</Alert>);
    const el = container.querySelector("[role='alert']");
    expect(el).toBeTruthy();
  });
});

describe("Accessibility Baseline Contract Coverage", () => {
  it("covers all 6 page classes", async () => {
    const { ACCESSIBILITY_BASELINES } = await import("@/lib/frontend/accessibility-baseline");
    const classes = Object.keys(ACCESSIBILITY_BASELINES);
    expect(classes).toContain("data-list");
    expect(classes).toContain("data-detail");
    expect(classes).toContain("form");
    expect(classes).toContain("dashboard");
    expect(classes).toContain("auth");
    expect(classes).toContain("static");
    expect(classes.length).toBeGreaterThanOrEqual(6);
  });

  it("each page class has at least one requirement", async () => {
    const { ACCESSIBILITY_BASELINES } = await import("@/lib/frontend/accessibility-baseline");
    for (const [, baseline] of Object.entries(ACCESSIBILITY_BASELINES)) {
      expect(baseline.required.length).toBeGreaterThan(0);
    }
  });
});