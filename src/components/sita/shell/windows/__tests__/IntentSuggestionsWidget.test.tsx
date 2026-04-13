import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";
import { MemoryRouter } from "react-router-dom";
import { IntentSuggestionsWidget } from "../../IntentSuggestionsWidget";

describe("IntentSuggestionsWidget", () => {
  const mockLaunch = vi.fn();

  it("renders without crashing", () => {
    const { container } = render(
      <MemoryRouter>
        <IntentSuggestionsWidget onLaunchApp={mockLaunch} />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it("accepts onLaunchApp callback", () => {
    render(
      <MemoryRouter>
        <IntentSuggestionsWidget onLaunchApp={mockLaunch} />
      </MemoryRouter>
    );
    // Component should render without calling the callback on mount
    expect(mockLaunch).not.toHaveBeenCalled();
  });
});
