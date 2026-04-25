// ═══════════════════════════════════════════════════════════════
// Settings — Account Group (Profile, Security, Connected Accounts)
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import {
  User, Shield, Lock, LogOut, Trash2, KeyRound, Globe, Info, Camera, Key,
  ShieldAlert, Database, Brain, ToggleLeft, ToggleRight,
} from "lucide-react";
import { VStack, HStack, Divider } from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel,
  NovaToggle, NovaBadge, NovaAvatar, NovaInput, NovaModal,
} from "@/platform/nova-sdk/ui/components";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SettingRow } from "./shared";
import GoogleConnectedAccounts from "@/pages/settings/GoogleConnectedAccounts";
import { AllProviderFamiliesStatus } from "@/platform/sita/components/sita/AllProviderFamiliesStatus";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { useQuery } from "@tanstack/react-query";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { useDemoMode } from "@/hooks/use-brain-core";
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationDialog } from "@/platform/sita/components/sita/ConfirmationDialog";

export function ProfileContent() {
  const { user, isDemo } = useAuth();
  const { profile, isLoading, updateProfile, refresh } = useProfile();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local input with canonical profile value when it loads/changes
  useEffect(() => {
    setDisplayName(profile?.display_name ?? (isDemo ? "Demo User" : ""));
  }, [profile?.display_name, isDemo]);

  const avatarUrl = profile?.avatar_url ?? null;

  const handleSaveName = useCallback(async () => {
    if (!user || isDemo) { toast.info("Sign in to save changes"); return; }
    setSaving(true);
    const { error } = await updateProfile({ display_name: displayName });
    setSaving(false);
    if (error) toast.error("Failed to update name");
    else toast.success("Name updated");
  }, [user, isDemo, displayName, updateProfile]);

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || isDemo) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl + "?t=" + Date.now();
    await updateProfile({ avatar_url: publicUrl });
    await refresh();
    setUploading(false);
    toast.success("Avatar updated");
  }, [user, isDemo, updateProfile, refresh]);

  if (isLoading) {
    return (
      <VStack spacing="tight" align="center" className="py-8">
        <NovaText variant="label" muted>Loading profile…</NovaText>
      </VStack>
    );
  }

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="normal" align="center" className="py-4">
          <div className="relative group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover ring-2 ring-[hsl(0_0%_0%/0.06)] dark:ring-[hsl(0_0%_100%/0.06)]" />
            ) : (
              <NovaAvatar icon={displayName?.charAt(0)?.toUpperCase() || "?"} size={64} gradient="from-[hsl(265_55%_58%)] to-[hsl(210_80%_55%)]" />
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isDemo}
              className={cn(
                "absolute inset-0 rounded-full flex items-center justify-center",
                "bg-[hsl(0_0%_0%/0.5)] opacity-0 group-hover:opacity-100 transition-opacity",
                uploading && "opacity-100"
              )}
            >
              <Camera className="h-5 w-5 text-[hsl(0_0%_100%)]" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <NovaText variant="title">{displayName || "User"}</NovaText>
          <NovaText variant="label" muted>{user?.email || "demo@sita.os"}</NovaText>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Display Name</NovaSectionLabel>
          <HStack spacing="tight">
            <NovaInput value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="flex-1" />
            <NovaButton variant="primary" onClick={handleSaveName} disabled={saving || isDemo} className="!text-[10px] !py-1 !px-3">
              {saving ? "Saving…" : "Save"}
            </NovaButton>
          </HStack>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Email" description="Cannot be changed" icon={<Globe className="h-3.5 w-3.5" />}>
            <NovaText variant="label" muted>{user?.email || "demo@sita.os"}</NovaText>
          </SettingRow>
          <Divider />
          <SettingRow label="Member Since" icon={<Info className="h-3.5 w-3.5" />}>
            <NovaText variant="label" muted>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </NovaText>
          </SettingRow>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

export function SecurityContent() {
  const { user, isDemo, signOut, updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleChangePassword = useCallback(async () => {
    if (!newPassword || newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    setChangingPw(true);
    const { error } = await updatePassword(newPassword);
    setChangingPw(false);
    if (error) toast.error(error.message || "Failed to update password");
    else { toast.success("Password updated"); setNewPassword(""); setConfirmPassword(""); }
  }, [newPassword, confirmPassword, updatePassword]);

  const handleSignOut = useCallback(async () => { await signOut(); toast.success("Signed out"); }, [signOut]);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Change Password</NovaSectionLabel>
          <NovaInput type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
          <NovaInput type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
          <NovaButton variant="primary" onClick={handleChangePassword} disabled={changingPw || isDemo || !newPassword} icon={<KeyRound className="h-3.5 w-3.5" />} className="!text-[11px]">
            {changingPw ? "Updating…" : "Update Password"}
          </NovaButton>
        </VStack>
      </NovaCard>

      <NovaCard>
        <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security" icon={<Lock className="h-3.5 w-3.5" />}>
          <NovaButton variant="secondary" onClick={() => toast.info("Two-factor authentication setup will open in your browser")}>Configure</NovaButton>
        </SettingRow>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaButton variant="secondary" onClick={handleSignOut} icon={<LogOut className="h-3.5 w-3.5" />} className="w-full !text-[11px]">Sign Out</NovaButton>
          <Divider />
          <NovaButton variant="ghost" onClick={() => setShowDeleteModal(true)} disabled={isDemo} icon={<Trash2 className="h-3.5 w-3.5" />} className="w-full !text-[11px] !text-[hsl(0_65%_50%)] hover:!bg-[hsl(0_65%_50%/0.08)]">
            Delete Account
          </NovaButton>
        </VStack>
      </NovaCard>

      {showDeleteModal && (
        <NovaModal open={showDeleteModal} title="Delete Account" onClose={() => setShowDeleteModal(false)}>
          <VStack spacing="normal">
            <NovaText variant="body">This action is irreversible. All your data will be permanently deleted.</NovaText>
            <HStack spacing="tight" justify="end">
              <NovaButton variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</NovaButton>
              <NovaButton variant="primary" className="!bg-[hsl(0_65%_50%)] hover:!bg-[hsl(0_65%_45%)]" onClick={() => { toast.info("Contact support to delete your account"); setShowDeleteModal(false); }}>
                Delete Account
              </NovaButton>
            </HStack>
          </VStack>
        </NovaModal>
      )}
    </VStack>
  );
}

export function ConnectedAccountsContent() {
  const { user, isDemo } = useAuth();
  const { isLoading, toggleDemoMode } = useDemoMode();
  const { confirmation, confirm: confirmAction } = useConfirmation();

  const { data: consentEntries } = useQuery({
    queryKey: ["consent-ledger-settings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await fromDynamicTable("consent_ledger")
        .select("id, action_type, capability_key, scopes_granted, created_at, mode")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const handleToggle = () => {
    toggleDemoMode();
    toast.success(isDemo ? "Switched to Live Mode" : "Switched to Demo Mode");
  };

  return (
    <VStack spacing="tight">
      <ConfirmationDialog state={confirmation} />

      {/* Data Mode */}
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Data Mode</NovaSectionLabel>
          <HStack spacing="tight" justify="between" align="center">
            <VStack spacing="micro">
              <NovaText variant="body">{isDemo ? "Demo Mode" : "Live Mode"}</NovaText>
              <NovaText variant="label" muted className="!text-[10px]">
                {isDemo ? "Simulated data, no real side-effects" : "Real services, real consequences"}
              </NovaText>
            </VStack>
            <button
              onClick={async () => {
                const action = isDemo ? "Switch to Live Mode" : "Switch to Demo Mode";
                const desc = isDemo ? "Live mode connects to real services." : "Demo mode uses simulated data.";
                if (await confirmAction({ title: action, description: desc })) handleToggle();
              }}
              disabled={isLoading}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                isDemo ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "bg-[hsl(38_85%_58%/0.15)] text-[hsl(38_85%_50%)]"
              )}
            >
              {isDemo ? <><ToggleLeft className="h-3 w-3 inline mr-1" />Demo</> : <><ToggleRight className="h-3 w-3 inline mr-1" />Live</>}
            </button>
          </HStack>
        </VStack>
      </NovaCard>

      {/* Sign-in Identity */}
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Sign-in Identity</NovaSectionLabel>
          <HStack spacing="tight" align="center">
            <Key className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
            <VStack spacing="micro" className="flex-1">
              <NovaText variant="body">{user?.email || "Not signed in"}</NovaText>
              <NovaText variant="label" muted className="!text-[10px]">
                Provider: {user?.app_metadata?.provider || "email"}
              </NovaText>
            </VStack>
            <NovaBadge variant="success">Active</NovaBadge>
          </HStack>
        </VStack>
      </NovaCard>

      {/* Google Connected Accounts */}
      <div className="[&>div]:!p-0 [&>div]:!shadow-none [&>div]:!border-0">
        <GoogleConnectedAccounts />
      </div>

      {/* All Provider Families */}
      <div className="[&>div]:!p-0 [&>div]:!shadow-none [&>div]:!border-0">
        <AllProviderFamiliesStatus />
      </div>

      {/* Consent History */}
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Consent History</NovaSectionLabel>
          {!consentEntries || consentEntries.length === 0 ? (
            <NovaText variant="label" muted className="text-center py-4">No consent history yet</NovaText>
          ) : (
            consentEntries.map((entry: any) => (
              <HStack key={entry.id} spacing="tight" align="center" className="py-1">
                <Shield className="h-3 w-3 text-[hsl(var(--primary))] shrink-0" />
                <VStack spacing="micro" className="flex-1 min-w-0">
                  <NovaText variant="body" className="!text-[11px] capitalize truncate">
                    {(entry.action_type ?? "grant").replace(/_/g, " ")}
                  </NovaText>
                  <NovaText variant="label" muted className="!text-[9px] truncate">
                    {entry.capability_key?.replace(/_/g, " ")} · {new Date(entry.created_at).toLocaleDateString()}
                  </NovaText>
                </VStack>
                <NovaBadge variant={entry.action_type === "revoked" ? "default" : "success"} className="!text-[8px]">
                  {entry.mode ?? "real"}
                </NovaBadge>
              </HStack>
            ))
          )}
        </VStack>
      </NovaCard>
    </VStack>
  );
}
