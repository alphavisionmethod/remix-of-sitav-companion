import { useState } from "react";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

interface AppleSignInButtonProps {
  label?: string;
}

export const AppleSignInButton = ({ label = "Continue with Apple" }: AppleSignInButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleAppleSignIn = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error instanceof Error ? result.error.message : "Apple sign-in failed");
      setLoading(false);
    }
    if (result.redirected) return;
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleAppleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground hover:bg-secondary/60 disabled:opacity-50 transition-all"
    >
      {loading ? (
        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      )}
      {label}
    </button>
  );
};
