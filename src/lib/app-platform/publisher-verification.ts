// ═══════════════════════════════════════════════════════════════
// Publisher verification — domain TXT model
// ═══════════════════════════════════════════════════════════════

export interface DomainChallenge {
  publisherSlug: string;
  token: string;
  txtRecord: string;
  instructions: string;
}

/** Generate a per-publisher TXT challenge.
 *  Operator hosts: `sita-publisher-verify=<token>` on root domain TXT record. */
export function buildDomainChallenge(publisherSlug: string, salt = ""): DomainChallenge {
  const seed = `${publisherSlug}|${salt || crypto.randomUUID()}|${Date.now()}`;
  const token = btoa(seed).replace(/=+$/, "").replace(/[+/]/g, "");
  return {
    publisherSlug,
    token,
    txtRecord: `sita-publisher-verify=${token}`,
    instructions:
      "Add this TXT record to the apex of your domain. We re-check every 24h until verified.",
  };
}

/** Best-effort DNS-over-HTTPS lookup (Cloudflare). Honest false on failure. */
export async function checkDomainTxt(domain: string, expectedToken: string): Promise<boolean> {
  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=TXT`;
    const res = await fetch(url, { headers: { accept: "application/dns-json" } });
    if (!res.ok) return false;
    const json = (await res.json()) as { Answer?: Array<{ data: string }> };
    const records = (json.Answer ?? []).map((a) => a.data.replace(/^"|"$/g, ""));
    return records.some((r) => r.includes(`sita-publisher-verify=${expectedToken}`));
  } catch {
    return false;
  }
}
