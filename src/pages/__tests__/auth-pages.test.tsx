import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

// Mock navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

describe("Auth Pages", () => {
  it("Login renders without crashing", async () => {
    const { default: Login } = await import("@/pages/auth/Login");
    const { container } = render(<Login />);
    expect(container.firstChild).toBeTruthy();
  });

  it("Signup renders without crashing", async () => {
    const { default: Signup } = await import("@/pages/auth/Signup");
    const { container } = render(<Signup />);
    expect(container.firstChild).toBeTruthy();
  });

  it("ForgotPassword renders without crashing", async () => {
    const { default: ForgotPassword } = await import("@/pages/auth/ForgotPassword");
    const { container } = render(<ForgotPassword />);
    expect(container.firstChild).toBeTruthy();
  });

  it("ResetPassword renders without crashing", async () => {
    const { default: ResetPassword } = await import("@/pages/auth/ResetPassword");
    const { container } = render(<ResetPassword />);
    expect(container.firstChild).toBeTruthy();
  });
});
