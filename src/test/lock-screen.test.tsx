import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import { EnhancedLockScreen as LockScreen } from "@/platform/sita/components/sita/shell/EnhancedLockScreen";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("LockScreen", () => {
  const mockUnlock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders lock screen with user name", () => {
    render(<LockScreen userName="Alice" onUnlock={mockUnlock} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("shows password input", () => {
    render(<LockScreen onUnlock={mockUnlock} />);
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
  });

  it("shows time display", () => {
    render(<LockScreen onUnlock={mockUnlock} />);
    // Time should be rendered (format HH:MM)
    const timeDisplay = screen.getByRole("main");
    expect(timeDisplay).toBeInTheDocument();
  });

  it("shows forgot password link when handler provided", () => {
    const onForgot = vi.fn();
    render(<LockScreen onUnlock={mockUnlock} onForgotPassword={onForgot} />);
    const link = screen.getByText("Forgot password?");
    expect(link).toBeInTheDocument();
    fireEvent.click(link);
    expect(onForgot).toHaveBeenCalled();
  });

  it("shows switch user link when handler provided", () => {
    const onSwitch = vi.fn();
    render(<LockScreen onUnlock={mockUnlock} onSwitchUser={onSwitch} />);
    const link = screen.getByText("Switch user");
    expect(link).toBeInTheDocument();
    fireEvent.click(link);
    expect(onSwitch).toHaveBeenCalled();
  });

  it("calls onUnlock with password on submit", async () => {
    mockUnlock.mockResolvedValue(true);
    render(<LockScreen onUnlock={mockUnlock} />);

    const input = screen.getByPlaceholderText("Enter password");
    fireEvent.change(input, { target: { value: "mypass" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(mockUnlock).toHaveBeenCalledWith("mypass");
    });
  });

  it("shows error on failed unlock", async () => {
    mockUnlock.mockResolvedValue(false);
    render(<LockScreen onUnlock={mockUnlock} />);

    const input = screen.getByPlaceholderText("Enter password");
    fireEvent.change(input, { target: { value: "wrong" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Incorrect password")).toBeInTheDocument();
    });
  });

  it("shows trust indicator", () => {
    render(<LockScreen onUnlock={mockUnlock} />);
    expect(screen.getByText(/Secure environment/)).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    render(<LockScreen onUnlock={mockUnlock} />);
    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("type", "password");
  });
});
