import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  VISUAL_REGRESSION_TARGETS,
  getVisualRegressionBaseline,
  validateComponentStructure,
} from "@/lib/testing/visual-regression-registry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const COMPONENT_MAP: Record<string, React.FC<any>> = {
  Button,
  Card,
  Badge,
  Input,
  Skeleton,
  Avatar,
  Switch,
  Separator,
  Progress,
  Textarea,
};

describe("Visual Regression — Component Structure", () => {
  it("registry has 10 targets", () => {
    expect(VISUAL_REGRESSION_TARGETS.length).toBe(10);
  });

  it("baseline generator produces valid output", () => {
    const baseline = getVisualRegressionBaseline();
    expect(baseline.components.length).toBe(VISUAL_REGRESSION_TARGETS.length);
    expect(baseline.generatedAt).toBeTruthy();
    baseline.components.forEach(c => expect(c.verified).toBe(true));
  });

  describe.each(VISUAL_REGRESSION_TARGETS)("$componentName structural check", (target) => {
    it("renders without crashing", () => {
      const Comp = COMPONENT_MAP[target.componentName];
      expect(Comp).toBeDefined();
      const { container } = render(<Comp />);
      expect(container.firstChild).toBeTruthy();
    });

    it("passes structural validation", () => {
      const Comp = COMPONENT_MAP[target.componentName];
      const { container } = render(<Comp />);
      const result = validateComponentStructure(container, target);
      expect(result.issues).toEqual([]);
      expect(result.valid).toBe(true);
    });
  });

  it("every target has a valid category", () => {
    const validCategories = ["shell", "navigation", "dashboard", "admin", "ai", "privacy", "onboarding"];
    for (const t of VISUAL_REGRESSION_TARGETS) {
      expect(validCategories).toContain(t.category);
    }
  });

  it("no duplicate component names in registry", () => {
    const names = VISUAL_REGRESSION_TARGETS.map(t => t.componentName);
    expect(new Set(names).size).toBe(names.length);
  });
});