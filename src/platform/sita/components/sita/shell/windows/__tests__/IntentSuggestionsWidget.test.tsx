import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";
import { IntentSuggestionsWidget } from "../../IntentSuggestionsWidget";

describe("IntentSuggestionsWidget", () => {
  const mockLaunch = vi.fn();

  it("renders without crashing", () => {
    const { container } = render(
      <IntentSuggestionsWidget onLaunchApp={mockLaunch} />
    );
    expect(container).toBeTruthy();
  });

  it("accepts onLaunchApp callback", () => {
    render(<IntentSuggestionsWidget onLaunchApp={mockLaunch} />);
    // Component should render without calling the callback on mount
    expect(mockLaunch).not.toHaveBeenCalled();
  });
});
