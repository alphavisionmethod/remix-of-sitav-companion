import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefetchHandlers } from "@/hooks/useRoutePrefetch";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const prefetch = usePrefetchHandlers(typeof to === "string" ? to : to.pathname || "");
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        onMouseEnter={(e) => { prefetch.onMouseEnter(); props.onMouseEnter?.(e); }}
        onTouchStart={(e) => { prefetch.onTouchStart(); props.onTouchStart?.(e); }}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
