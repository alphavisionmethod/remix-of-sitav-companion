// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Typography Component
// Maps the 12-role SITA_TYPE scale to semantic HTML elements.
// ═══════════════════════════════════════════════════════════════

import { createElement, forwardRef, type ReactNode, type ElementType, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";

export type TypographyRole = keyof typeof SITA_TYPE;

const ROLE_ELEMENT_MAP: Record<TypographyRole, ElementType> = {
  osTitle: "h1",
  appTitle: "h2",
  pageTitle: "h2",
  sectionTitle: "h3",
  paneTitle: "h3",
  cardTitle: "h4",
  metricEmphasis: "span",
  microLabel: "span",
  trustAnnotation: "span",
  timelineMeta: "span",
  commandText: "span",
  systemMono: "code",
};

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  /** One of the 12 canonical SITA_TYPE roles */
  role: TypographyRole;
  /** Override the default HTML element */
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

/**
 * Unified typography component enforcing the 12-role SITA_TYPE scale.
 *
 * Usage:
 * ```tsx
 * <Typography role="appTitle">Page Title</Typography>
 * <Typography role="microLabel" as="label">Field Label</Typography>
 * <Typography role="systemMono">hash:abc123</Typography>
 * ```
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ role: typoRole, as, className, children, ...rest }, ref) => {
    const Element = as ?? ROLE_ELEMENT_MAP[typoRole];
    const tokenClasses = SITA_TYPE[typoRole];

    return createElement(
      Element,
      { ref, className: cn(tokenClasses, "text-foreground", className), ...rest },
      children,
    );
  },
);

Typography.displayName = "Typography";