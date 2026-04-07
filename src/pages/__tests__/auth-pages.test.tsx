import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";
import { useDataMode } from "@/contexts/DataModeContext";

// Mock navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

describe("Auth Pages", () => {
  it("Login renders without crashing", async () => {
    const { default: Login } = await import("@/pages/auth/Login");
    const { container } = render(<Login />);
    expect(container).toBeTruthy();
  });

  it("Signup renders without crashing", async () => {
    const { default: Signup } = await import("@/pages/auth/Signup");
    const { container } = render(<Signup />);
    expect(container).toBeTruthy();
  });

  it("ForgotPassword renders without crashing", async () => {
    const { default: ForgotPassword } = await import("@/pages/auth/ForgotPassword");
    const { container } = render(<ForgotPassword />);
    expect(container).toBeTruthy();
  });

  it("ResetPassword renders without crashing", async () => {
    const { default: ResetPassword } = await import("@/pages/auth/ResetPassword");
    const { container } = render(<ResetPassword />);
    expect(container).toBeTruthy();
  });
});
