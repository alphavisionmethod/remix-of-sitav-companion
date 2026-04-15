// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Barrel: Auth
// Canonical import path: @/features/auth
// ═══════════════════════════════════════════════════════════════

// Components
export { AdminRoute } from "@/components/auth/AdminRoute";
export { AppleSignInButton } from "@/components/auth/AppleSignInButton";
export { AuthDivider } from "@/components/auth/AuthDivider";
export { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
export { PermissionGatedRoute } from "@/components/auth/PermissionGatedRoute";

// Context
export { AuthProvider, useAuth } from "@/contexts/AuthContext";
