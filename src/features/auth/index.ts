// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Barrel: Auth
// Canonical import path: @/features/auth
// ═══════════════════════════════════════════════════════════════

// Components
export { AdminRoute } from "@/platform/auth/components/auth/AdminRoute";
export { AppleSignInButton } from "@/platform/auth/components/auth/AppleSignInButton";
export { AuthDivider } from "@/platform/auth/components/auth/AuthDivider";
export { GoogleSignInButton } from "@/platform/auth/components/auth/GoogleSignInButton";
export { PermissionGatedRoute } from "@/platform/auth/components/auth/PermissionGatedRoute";

// Context
export { AuthProvider, useAuth } from "@/contexts/AuthContext";
