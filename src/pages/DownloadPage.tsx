import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, ShieldCheck, Cpu, HardDrive, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MobileHonestyNotice } from "@/components/platform/MobileHonestyNotice";

type Channel = "stable" | "beta" | "dev";

interface ReleaseInfo {
  version: string;
  released_at: string;
  size_bytes: number;
  hash: string;
  download_url: string;
  notes: string;
}

const CHANNEL_LABEL: Record<Channel, string> = {
  stable: "Stable",
  beta: "Beta",
  dev: "Developer",
};

const CHANNEL_DESC: Record<Channel, string> = {
  stable: "Production-ready. Recommended for daily use.",
  beta: "Preview features. Stable enough for power users.",
  dev: "Bleeding edge. Expect breakage. Reports welcome.",
};

export default function DownloadPage() {
  const [channel, setChannel] = useState<Channel>("stable");
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("release_artifacts")
        .select("version, created_at, size_bytes, hash, download_url, release_notes")
        .eq("component", "sita-os-rootfs")
        .eq("channel", channel)
        .eq("is_yanked", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setRelease(
        data
          ? {
              version: data.version,
              released_at: data.created_at,
              size_bytes: data.size_bytes ?? 0,
              hash: data.hash,
              download_url: data.download_url ?? "",
              notes: data.release_notes ?? "",
            }
          : null,
      );
      setLoading(false);
    })();
  }, [channel]);

  useEffect(() => {
    document.title = "Download SITA OS — Sovereign Operating System";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      "Download SITA OS — sovereign, secure, self-hosting operating system. Signed ISO, dm-verity hardened, A/B atomic updates.",
    );
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", "/download");
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
        <section className="container mx-auto max-w-5xl px-6 py-16 md:py-24">
          <header className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Download SITA OS
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Your sovereign operating system. Linux-based, hardware-bound, atomically updatable.
              Flash the ISO to any USB stick and boot.
            </p>
          </header>

          <MobileHonestyNotice className="mb-8 max-w-3xl mx-auto" />

          <Tabs value={channel} onValueChange={(v) => setChannel(v as Channel)}>
            <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="stable">Stable</TabsTrigger>
              <TabsTrigger value="beta">Beta</TabsTrigger>
              <TabsTrigger value="dev">Developer</TabsTrigger>
            </TabsList>

            {(["stable", "beta", "dev"] as Channel[]).map((c) => (
              <TabsContent key={c} value={c}>
                <Card className="p-8">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {CHANNEL_LABEL[c]}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{CHANNEL_DESC[c]}</p>
                    </div>
                    {release && !loading && (
                      <div className="text-right">
                        <div className="text-2xl font-semibold">v{release.version}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(release.released_at).toLocaleDateString()} ·{" "}
                          {(release.size_bytes / 1e9).toFixed(2)} GB
                        </div>
                      </div>
                    )}
                  </div>

                  {loading && (
                    <div className="py-12 text-center text-muted-foreground">Loading…</div>
                  )}

                  {!loading && !release && (
                    <div className="py-12 text-center text-muted-foreground">
                      No published release on this channel yet.
                    </div>
                  )}

                  {!loading && release && (
                    <>
                      <Button
                        size="lg"
                        className="w-full"
                        asChild
                        disabled={!release.download_url}
                      >
                        <a href={release.download_url} download>
                          <Download className="mr-2 h-5 w-5" />
                          Download SITA OS {release.version}
                        </a>
                      </Button>

                      <div className="mt-6 rounded-md border border-border bg-muted/30 p-4 font-mono text-xs">
                        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                          <KeyRound className="h-3 w-3" />
                          SHA-256
                        </div>
                        <div className="break-all">{release.hash}</div>
                      </div>

                      {release.notes && (
                        <div className="mt-6">
                          <h3 className="mb-2 font-semibold">Release notes</h3>
                          <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                            {release.notes}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <section className="mt-16 grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <ShieldCheck className="mb-3 h-6 w-6 text-primary" />
              <h3 className="mb-1 font-semibold">Verified boot</h3>
              <p className="text-sm text-muted-foreground">
                UEFI Secure Boot, signed kernel, dm-verity Merkle tree over root.
              </p>
            </Card>
            <Card className="p-6">
              <HardDrive className="mb-3 h-6 w-6 text-primary" />
              <h3 className="mb-1 font-semibold">Atomic A/B updates</h3>
              <p className="text-sm text-muted-foreground">
                Two root slots, instant rollback, zero downtime perceived.
              </p>
            </Card>
            <Card className="p-6">
              <Cpu className="mb-3 h-6 w-6 text-primary" />
              <h3 className="mb-1 font-semibold">TPM 2.0 sealed</h3>
              <p className="text-sm text-muted-foreground">
                LUKS2 keys sealed to PCRs 0/4/7. Tamper = no unlock.
              </p>
            </Card>
          </section>

          <section className="mt-12 rounded-md border border-border bg-card/50 p-6">
            <h3 className="mb-3 font-semibold">Install in 3 steps</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="text-foreground">1.</span> Verify checksum: <code className="rounded bg-muted px-1.5 py-0.5">sha256sum sita-os-*.iso</code>
              </li>
              <li>
                <span className="text-foreground">2.</span> Flash to USB:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5">
                  sudo dd if=sita-os-*.iso of=/dev/sdX bs=4M status=progress
                </code>{" "}
                (replace <code>/dev/sdX</code> with your stick — destroys data)
              </li>
              <li>
                <span className="text-foreground">3.</span> Boot from USB and follow the installer.
              </li>
            </ol>
          </section>
        </section>
      </main>
  );
}
