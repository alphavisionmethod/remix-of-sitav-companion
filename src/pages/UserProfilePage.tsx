import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Shield, Calendar, Activity, Receipt, Link as LinkIcon, Settings, Clock, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useActionFn } from "@/hooks/use-action";
import { PageShell } from "@/components/sita/PageShell";

const UserProfilePage = () => {
  const { user } = useAuth();
  const { profile: canonicalProfile, isLoading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    display_name: "",
    avatar_url: "",
    timezone: "",
    locale: "",
    bio: "",
  });
  const [stats, setStats] = useState({
    actionsCount: 0,
    daysSinceJoin: 0,
  });

  // Hydrate local edit state from the canonical profile signal
  useEffect(() => {
    if (!canonicalProfile) return;
    const prefs = canonicalProfile.preferences || {};
    setProfile({
      display_name: canonicalProfile.display_name || "",
      avatar_url: canonicalProfile.avatar_url || "",
      timezone: prefs.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: prefs.locale || navigator.language,
      bio: prefs.bio || canonicalProfile.bio || "",
    });
  }, [canonicalProfile]);

  // Stats only depend on user; load once user is available
  useEffect(() => {
    if (!user) return;
    const loadStats = async () => {
      const { count } = await db.from("trust_weighted_actions")
        .select("id", { count: "exact", head: true });
      const created = new Date(user.created_at);
      const days = Math.max(1, Math.floor((Date.now() - created.getTime()) / 86400000));
      setStats({ actionsCount: count ?? 0, daysSinceJoin: days });
      setLoading(false);
    };
    loadStats();
  }, [user]);

  // Show loading while either signal is still resolving
  const isLoading = loading || profileLoading;

  const saveProfileFn = useActionFn("workspace", "profile.update", {
    successMessage: "Profile saved",
    errorMessage: "Failed to save profile",
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await saveProfileFn({
      table: "profiles",
      updates: {
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        preferences: { bio: profile.bio, timezone: profile.timezone, locale: profile.locale },
      },
      userId: user.id,
    });
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    setProfile((p) => ({ ...p, avatar_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Avatar uploaded — save to apply");
  };

  const initials = (profile.display_name || user?.email || "U").slice(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <PageShell width="narrow">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Avatar & Identity */}
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-start gap-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" disabled={uploading} asChild>
                <span>{uploading ? "Uploading…" : "Change Photo"}</span>
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-semibold">{profile.display_name || "Unnamed"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Member since {user?.created_at ? format(new Date(user.created_at), "MMM d, yyyy") : "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Calendar, label: "Days Active", value: stats.daysSinceJoin },
          { icon: Activity, label: "Actions", value: stats.actionsCount },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 flex flex-col items-center gap-1 text-center">
              <Icon className="h-5 w-5 text-primary/70" />
              <span className="text-2xl font-bold">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editable Fields */}
      <Card>
        <CardHeader><CardTitle className="text-base">Profile Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName"><User className="inline h-3 w-3 mr-1" />Display Name</Label>
              <Input id="displayName" value={profile.display_name} onChange={(e) => setProfile((p) => ({ ...p, display_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone"><Clock className="inline h-3 w-3 mr-1" />Timezone</Label>
              <Input id="timezone" value={profile.timezone} onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="locale"><Globe className="inline h-3 w-3 mr-1" />Locale</Label>
            <Input id="locale" value={profile.locale} onChange={(e) => setProfile((p) => ({ ...p, locale: e.target.value }))} placeholder="en-US" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Tell us about yourself…" />
          </div>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Profile"}</Button>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-3">
        <Link to="/settings/trust"><Button variant="outline" size="sm" className="gap-1"><Shield className="h-3 w-3" /> Trust Settings</Button></Link>
        <Link to="/settings/privacy"><Button variant="outline" size="sm" className="gap-1"><Settings className="h-3 w-3" /> Privacy Settings</Button></Link>
        <Link to="/settings"><Button variant="outline" size="sm" className="gap-1"><Settings className="h-3 w-3" /> All Settings</Button></Link>
      </div>
    </PageShell>
  );
};

export default UserProfilePage;
