import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GeneralContent } from "../SystemSections";
import { SettingsService } from "@/platform/nova-sdk/services/settings-service";

// Boot settings service before each test
beforeEach(() => {
  SettingsService.reset();
  SettingsService.boot();
});

describe("GeneralContent", () => {
  it("renders all 9 section headers", () => {
    render(<GeneralContent />);
    expect(screen.getByText("Everyday Preferences")).toBeInTheDocument();
    expect(screen.getByText("Region & Formatting")).toBeInTheDocument();
    expect(screen.getByText("Date & Time")).toBeInTheDocument();
    expect(screen.getByText("Startup & Session")).toBeInTheDocument();
    expect(screen.getByText("Navigation & Behavior")).toBeInTheDocument();
    expect(screen.getByText("Personalization")).toBeInTheDocument();
    expect(screen.getByText("Quick Access Favorites")).toBeInTheDocument();
    expect(screen.getByText("Guidance & Recommendations")).toBeInTheDocument();
    expect(screen.getByText("Approval Experience")).toBeInTheDocument();
    expect(screen.getByText("Reset & Restore")).toBeInTheDocument();
  });

  it("renders Dark Mode toggle synced with appearance.theme", () => {
    render(<GeneralContent />);
    expect(screen.getByText("Dark Mode")).toBeInTheDocument();
    // Should show ManagedBadge
    expect(screen.getByText("Synced with Appearance")).toBeInTheDocument();
  });

  it("renders Reduced Motion toggle with accessibility badge", () => {
    render(<GeneralContent />);
    expect(screen.getByText("Reduced Motion")).toBeInTheDocument();
    expect(screen.getByText("Synced with Accessibility")).toBeInTheDocument();
  });

  it("persists language change via SettingsService", () => {
    render(<GeneralContent />);
    // Find the language select and change it
    const selects = screen.getAllByRole("combobox");
    const langSelect = selects.find(s => {
      const opts = Array.from(s.querySelectorAll("option"));
      return opts.some(o => o.textContent === "Español");
    });
    expect(langSelect).toBeDefined();
    if (langSelect) {
      fireEvent.change(langSelect, { target: { value: "es" } });
      expect(SettingsService.get("general.language")).toBe("es");
    }
  });

  it("renders all Region & Formatting controls", () => {
    render(<GeneralContent />);
    expect(screen.getByText("Region")).toBeInTheDocument();
    expect(screen.getByText("Currency")).toBeInTheDocument();
    expect(screen.getByText("Measurement Units")).toBeInTheDocument();
    expect(screen.getByText("Number Format")).toBeInTheDocument();
    expect(screen.getByText("Week Starts On")).toBeInTheDocument();
  });

  it("renders startup & session controls", () => {
    render(<GeneralContent />);
    expect(screen.getByText("Restore Last Session")).toBeInTheDocument();
    expect(screen.getByText("Reopen Panels & Widgets")).toBeInTheDocument();
    expect(screen.getByText("Resume Pending Tasks")).toBeInTheDocument();
  });

  it("renders approval style choices", () => {
    render(<GeneralContent />);
    expect(screen.getByText("Ask as Needed")).toBeInTheDocument();
    expect(screen.getByText("Batch Reviews")).toBeInTheDocument();
  });

  it("renders reset & restore actions", () => {
    render(<GeneralContent />);
    expect(screen.getByText("Restore Recommended Defaults")).toBeInTheDocument();
    expect(screen.getByText("Reset General Preferences")).toBeInTheDocument();
    expect(screen.getByText("Clear Custom Overrides")).toBeInTheDocument();
    expect(screen.getByText("Export Settings Snapshot")).toBeInTheDocument();
  });

  it("renders deep links to related settings", () => {
    render(<GeneralContent />);
    expect(screen.getByText("More appearance controls")).toBeInTheDocument();
    expect(screen.getByText("More accessibility controls")).toBeInTheDocument();
    expect(screen.getByText("More AI & advisor controls")).toBeInTheDocument();
    expect(screen.getByText("More trust & security controls")).toBeInTheDocument();
  });

  it("renders quick access favorites grid", () => {
    render(<GeneralContent />);
    expect(screen.getByText("Launchpad")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getAllByText("Business").length).toBeGreaterThanOrEqual(2);
  });

  it("currency change persists to SettingsService", () => {
    render(<GeneralContent />);
    const selects = screen.getAllByRole("combobox");
    const currencySelect = selects.find(s => {
      const opts = Array.from(s.querySelectorAll("option"));
      return opts.some(o => o.textContent === "EUR (€)");
    });
    expect(currencySelect).toBeDefined();
    if (currencySelect) {
      fireEvent.change(currencySelect, { target: { value: "EUR" } });
      expect(SettingsService.get("general.currency")).toBe("EUR");
    }
  });

  it("reset button requires confirmation", () => {
    render(<GeneralContent />);
    const resetBtn = screen.getByText("Reset");
    fireEvent.click(resetBtn);
    // After first click, should show "Confirm Reset"
    expect(screen.getByText("Confirm Reset")).toBeInTheDocument();
  });
});