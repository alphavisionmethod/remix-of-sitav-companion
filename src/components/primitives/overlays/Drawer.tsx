import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Drawer — canonical slide-out detail surface.
 * Composes shadcn `Sheet` to enforce a single drawer grammar.
 * Class: PRIMITIVE.
 */
export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  side?: "left" | "right" | "top" | "bottom";
  width?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  className?: string;
}

const WIDTH_CLASSES: Record<NonNullable<DrawerProps["width"]>, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
};

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  side = "right",
  width = "md",
  children,
  className,
}: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn(WIDTH_CLASSES[width], "overflow-y-auto", className)}>
        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        <div className="mt-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
