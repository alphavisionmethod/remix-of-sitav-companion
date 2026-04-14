// ═══════════════════════════════════════════════════════════════
// SITA OS — authd: Authentication Daemon
// Account DB, password/PIN verification, session creation,
// elevation authentication, credential lifecycle
// ═══════════════════════════════════════════════════════════════

import {
  type OSUserAccount, type OSSession, type OSAuthMethod, type OSUserRole,
  type ElevationApprovalToken, type SessionState, type IPCResult,
  AUTH_FRESHNESS_WINDOW_MS, ELEVATION_TOKEN_TTL_MS,
  MAX_FAILED_ATTEMPTS, LOCKOUT_DURATION_MS,
  PASSWORD_MIN_LENGTH, PIN_MIN_LENGTH,
  DEFAULT_ROLE_CAPABILITIES,
} from "./types";

// ── Crypto Helpers (Web Crypto API) ─────────────────────────

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const rawKey = enc.encode(password);
  const keyMaterial = await crypto.subtle.importKey("raw", rawKey.buffer as ArrayBuffer, "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
}

async function hashCredential(credential: string, salt?: Uint8Array): Promise<{ hash: string; salt: string }> {
  const s = salt || crypto.getRandomValues(new Uint8Array(16));
  const bits = await deriveKey(credential, s);
  const hashArr = Array.from(new Uint8Array(bits));
  return {
    hash: hashArr.map(b => b.toString(16).padStart(2, "0")).join(""),
    salt: Array.from(s).map(b => b.toString(16).padStart(2, "0")).join(""),
  };
}

async function verifyCredential(credential: string, storedHash: string, saltHex: string): Promise<boolean> {
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const { hash } = await hashCredential(credential, salt);
  return hash === storedHash;
}

// ── Token Signing (ECDSA via Web Crypto) ────────────────────

let signingKeyPair: CryptoKeyPair | null = null;

async function getSigningKeyPair(): Promise<CryptoKeyPair> {
  if (!signingKeyPair) {
    signingKeyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign", "verify"]
    );
  }
  return signingKeyPair;
}

async function signToken(payload: string): Promise<string> {
  const kp = await getSigningKeyPair();
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, kp.privateKey, enc.encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifySignature(payload: string, signatureHex: string): Promise<boolean> {
  const kp = await getSigningKeyPair();
  const enc = new TextEncoder();
  const sigBytes = new Uint8Array(signatureHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, kp.publicKey, sigBytes, enc.encode(payload));
}

// ── AuthD Service ───────────────────────────────────────────

interface StoredCredential {
  hash: string;
  salt: string;
  method: OSAuthMethod;
  enrolledAt: number;
  lastUsedAt?: number;
}

export class AuthDaemon {
  private accounts: Map<string, OSUserAccount> = new Map();
  private credentials: Map<string, StoredCredential[]> = new Map(); // userId -> creds
  private sessions: Map<string, OSSession> = new Map();
  private elevationTokens: Map<string, ElevationApprovalToken> = new Map();
  private rateLimits: Map<string, { count: number; windowStart: number }> = new Map();
  private initialized = false;

  // ── Boot ────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Bootstrap default admin account (demo environment)
    const adminId = "00000000-0000-0000-0000-000000000000";
    const { hash, salt } = await hashCredential("admin");
    
    this.accounts.set(adminId, {
      userId: adminId,
      username: "admin",
      displayName: "SITA Admin",
      role: "admin",
      status: "active",
      enrolledMethods: ["password"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      passwordHashRef: `${salt}:${hash}`,
      failedAttempts: 0,
    });

    this.credentials.set(adminId, [{
      hash, salt, method: "password",
      enrolledAt: Date.now(),
    }]);

    this.initialized = true;
  }

  // ── Account Management ──────────────────────────────────

  async createAccount(
    username: string,
    displayName: string,
    role: OSUserRole,
    password: string
  ): Promise<IPCResult<OSUserAccount>> {
    if (password.length < PASSWORD_MIN_LENGTH) {
      return { status: "error", error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
    }

    const existing = Array.from(this.accounts.values()).find(a => a.username === username);
    if (existing) return { status: "error", error: "Username already exists" };

    const userId = crypto.randomUUID();
    const { hash, salt } = await hashCredential(password);

    const account: OSUserAccount = {
      userId, username, displayName, role,
      status: "active",
      enrolledMethods: ["password"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      passwordHashRef: `${salt}:${hash}`,
      failedAttempts: 0,
    };

    this.accounts.set(userId, account);
    this.credentials.set(userId, [{ hash, salt, method: "password", enrolledAt: Date.now() }]);

    return { status: "ok", data: account };
  }

  getAccount(userId: string): OSUserAccount | undefined {
    return this.accounts.get(userId);
  }

  getAllAccounts(): OSUserAccount[] {
    return Array.from(this.accounts.values());
  }

  async disableAccount(userId: string): Promise<IPCResult> {
    const account = this.accounts.get(userId);
    if (!account) return { status: "error", error: "Account not found" };
    account.status = "disabled";
    account.updatedAt = Date.now();
    // Terminate active sessions
    for (const [sid, session] of this.sessions) {
      if (session.userId === userId) {
        session.state = "terminating";
        this.sessions.delete(sid);
      }
    }
    return { status: "ok" };
  }

  // ── PIN Enrollment ──────────────────────────────────────

  async enrollPIN(userId: string, pin: string): Promise<IPCResult> {
    if (pin.length < PIN_MIN_LENGTH) {
      return { status: "error", error: `PIN must be at least ${PIN_MIN_LENGTH} digits` };
    }
    if (!/^\d+$/.test(pin)) {
      return { status: "error", error: "PIN must contain only digits" };
    }

    const { hash, salt } = await hashCredential(pin);
    const creds = this.credentials.get(userId) || [];
    // Remove existing PIN
    const filtered = creds.filter(c => c.method !== "pin");
    filtered.push({ hash, salt, method: "pin", enrolledAt: Date.now() });
    this.credentials.set(userId, filtered);

    const account = this.accounts.get(userId);
    if (account && !account.enrolledMethods.includes("pin")) {
      account.enrolledMethods.push("pin");
      account.updatedAt = Date.now();
    }

    return { status: "ok" };
  }

  // ── Authentication ──────────────────────────────────────

  async verifyPassword(userId: string, password: string): Promise<IPCResult<boolean>> {
    return this.verifyCredentialForMethod(userId, password, "password");
  }

  async verifyPIN(userId: string, pin: string): Promise<IPCResult<boolean>> {
    return this.verifyCredentialForMethod(userId, pin, "pin");
  }

  private async verifyCredentialForMethod(
    userId: string, credential: string, method: OSAuthMethod
  ): Promise<IPCResult<boolean>> {
    const account = this.accounts.get(userId);
    if (!account) return { status: "error", error: "Account not found" };
    if (account.status === "disabled") return { status: "denied", error: "Account disabled" };
    if (account.status === "locked-out" && account.lockoutUntil && Date.now() < account.lockoutUntil) {
      return { status: "denied", error: `Account locked. Try again in ${Math.ceil((account.lockoutUntil - Date.now()) / 60000)} minutes` };
    }

    // Rate limiting
    if (!this.checkRateLimit(userId)) {
      return { status: "denied", error: "Too many attempts. Please wait." };
    }

    const creds = this.credentials.get(userId);
    const cred = creds?.find(c => c.method === method);
    if (!cred) return { status: "error", error: `${method} not enrolled` };

    const valid = await verifyCredential(credential, cred.hash, cred.salt);

    if (valid) {
      account.failedAttempts = 0;
      account.status = "active";
      account.lockoutUntil = undefined;
      cred.lastUsedAt = Date.now();
      return { status: "ok", data: true };
    }

    account.failedAttempts++;
    if (account.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      account.status = "locked-out";
      account.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
    }

    return { status: "ok", data: false };
  }

  // ── Session Management ──────────────────────────────────

  async createSession(userId: string, method: OSAuthMethod, credential: string): Promise<IPCResult<OSSession>> {
    let verifyResult: IPCResult<boolean>;
    if (method === "password") {
      verifyResult = await this.verifyPassword(userId, credential);
    } else if (method === "pin") {
      verifyResult = await this.verifyPIN(userId, credential);
    } else {
      // Biometric/security-key — stub for now (returns success)
      verifyResult = { status: "ok", data: true };
    }

    if (verifyResult.status !== "ok" || !verifyResult.data) {
      return { status: "denied", error: verifyResult.error || "Authentication failed" };
    }

    const account = this.accounts.get(userId);
    if (!account) return { status: "error", error: "Account not found" };

    const session: OSSession = {
      sessionId: crypto.randomUUID(),
      userId,
      role: account.role,
      state: "active",
      locked: false,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      authFreshUntil: Date.now() + AUTH_FRESHNESS_WINDOW_MS,
      capabilities: DEFAULT_ROLE_CAPABILITIES[account.role] || [],
      enrolledMethods: account.enrolledMethods,
      displayId: `:0`,
      seatId: "seat0",
    };

    this.sessions.set(session.sessionId, session);
    return { status: "ok", data: session };
  }

  getSession(sessionId: string): OSSession | undefined {
    return this.sessions.get(sessionId);
  }

  getActiveSessions(): OSSession[] {
    return Array.from(this.sessions.values()).filter(s => s.state !== "terminating");
  }

  lockSession(sessionId: string): IPCResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };
    session.state = "locked";
    session.locked = true;
    return { status: "ok" };
  }

  async unlockSession(sessionId: string, method: OSAuthMethod, credential: string): Promise<IPCResult> {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };

    let verified: IPCResult<boolean>;
    if (method === "password") {
      verified = await this.verifyPassword(session.userId, credential);
    } else if (method === "pin") {
      verified = await this.verifyPIN(session.userId, credential);
    } else {
      verified = { status: "ok", data: true }; // biometric stub
    }

    if (verified.status !== "ok" || !verified.data) {
      return { status: "denied", error: verified.error || "Authentication failed" };
    }

    session.state = "active";
    session.locked = false;
    session.lastActivityAt = Date.now();
    session.authFreshUntil = Date.now() + AUTH_FRESHNESS_WINDOW_MS;
    return { status: "ok" };
  }

  terminateSession(sessionId: string): IPCResult {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };
    session.state = "terminating";
    this.sessions.delete(sessionId);
    return { status: "ok" };
  }

  isAuthFresh(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    return Date.now() < session.authFreshUntil;
  }

  refreshAuth(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.authFreshUntil = Date.now() + AUTH_FRESHNESS_WINDOW_MS;
      session.lastActivityAt = Date.now();
    }
  }

  // ── Elevation ───────────────────────────────────────────

  async beginElevation(
    sessionId: string, action: string, targetService: string, credential: string, method: OSAuthMethod = "password"
  ): Promise<IPCResult<ElevationApprovalToken>> {
    const session = this.sessions.get(sessionId);
    if (!session) return { status: "error", error: "Session not found" };
    if (session.locked) return { status: "denied", error: "Session is locked" };

    // Verify credential
    let verified: IPCResult<boolean>;
    if (method === "password") {
      verified = await this.verifyPassword(session.userId, credential);
    } else if (method === "pin") {
      verified = await this.verifyPIN(session.userId, credential);
    } else {
      verified = { status: "ok", data: true };
    }

    if (verified.status !== "ok" || !verified.data) {
      return { status: "denied", error: verified.error || "Elevation authentication failed" };
    }

    // Issue signed approval token
    const nonce = crypto.randomUUID();
    const tokenPayload = `${session.sessionId}:${session.userId}:${action}:${targetService}:${nonce}:${Date.now()}`;
    const signature = await signToken(tokenPayload);

    const token: ElevationApprovalToken = {
      tokenId: crypto.randomUUID(),
      sessionId,
      userId: session.userId,
      action,
      targetService,
      issuedAt: Date.now(),
      expiresAt: Date.now() + ELEVATION_TOKEN_TTL_MS,
      singleUse: true,
      consumed: false,
      nonce,
      signature,
    };

    this.elevationTokens.set(token.tokenId, token);
    session.authFreshUntil = Date.now() + AUTH_FRESHNESS_WINDOW_MS;

    return { status: "ok", data: token };
  }

  async validateElevationToken(tokenId: string, action: string, targetService: string): Promise<IPCResult<boolean>> {
    const token = this.elevationTokens.get(tokenId);
    if (!token) return { status: "error", error: "Token not found" };
    if (token.consumed) return { status: "denied", error: "Token already consumed" };
    if (Date.now() > token.expiresAt) {
      this.elevationTokens.delete(tokenId);
      return { status: "denied", error: "Token expired" };
    }
    if (token.action !== action || token.targetService !== targetService) {
      return { status: "denied", error: "Token action/service mismatch" };
    }

    // Verify signature
    const payload = `${token.sessionId}:${token.userId}:${token.action}:${token.targetService}:${token.nonce}:${token.issuedAt}`;
    const valid = await verifySignature(payload, token.signature);
    if (!valid) return { status: "denied", error: "Token signature invalid" };

    // Consume
    if (token.singleUse) {
      token.consumed = true;
    }

    return { status: "ok", data: true };
  }

  // ── Credential Change ───────────────────────────────────

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<IPCResult> {
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      return { status: "error", error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
    }

    const verify = await this.verifyPassword(userId, oldPassword);
    if (verify.status !== "ok" || !verify.data) {
      return { status: "denied", error: "Current password is incorrect" };
    }

    const { hash, salt } = await hashCredential(newPassword);
    const creds = this.credentials.get(userId) || [];
    const idx = creds.findIndex(c => c.method === "password");
    if (idx >= 0) {
      creds[idx] = { hash, salt, method: "password", enrolledAt: creds[idx].enrolledAt, lastUsedAt: Date.now() };
    } else {
      creds.push({ hash, salt, method: "password", enrolledAt: Date.now() });
    }

    const account = this.accounts.get(userId);
    if (account) {
      account.passwordHashRef = `${salt}:${hash}`;
      account.updatedAt = Date.now();
    }

    return { status: "ok" };
  }

  // ── Rate Limiting ───────────────────────────────────────

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const limit = this.rateLimits.get(userId);
    if (!limit || now - limit.windowStart > 60000) {
      this.rateLimits.set(userId, { count: 1, windowStart: now });
      return true;
    }
    if (limit.count >= 10) return false;
    limit.count++;
    return true;
  }

  // ── Cleanup ─────────────────────────────────────────────

  cleanupExpiredTokens(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [id, token] of this.elevationTokens) {
      if (now > token.expiresAt || token.consumed) {
        this.elevationTokens.delete(id);
        cleaned++;
      }
    }
    return cleaned;
  }

  // ── Serialization ───────────────────────────────────────

  getStats() {
    return {
      totalAccounts: this.accounts.size,
      activeSessions: this.getActiveSessions().length,
      pendingTokens: Array.from(this.elevationTokens.values()).filter(t => !t.consumed && Date.now() < t.expiresAt).length,
    };
  }
}

// ── Singleton ──────────────────────────────────────────────

let _authd: AuthDaemon | null = null;
export function getAuthDaemon(): AuthDaemon {
  if (!_authd) _authd = new AuthDaemon();
  return _authd;
}
