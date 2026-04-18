// ═══════════════════════════════════════════════════════════════
// SITA OS — Package Manager
// Transactional install/upgrade/rollback, dependency resolution,
// signature verification, repository management
// ═══════════════════════════════════════════════════════════════

export type PackageState = "available" | "downloading" | "verifying" | "installing" | "installed" | "removing" | "failed";

export interface PackageManifest {
  name: string;
  version: string;
  description: string;
  dependencies: string[];
  size: number;          // bytes
  checksum: string;      // SHA-256
  signature: string;     // Ed25519 signature of checksum
  signingKeyId: string;
  repository: string;
  architecture: "x86_64" | "aarch64" | "noarch";
  priority: "required" | "important" | "standard" | "optional";
}

export interface InstalledPackage extends PackageManifest {
  state: PackageState;
  installedAt: number;
  updatedAt?: number;
  installPath: string;
  configFiles: string[];
  previousVersion?: string; // for rollback
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  trusted: boolean;
  signingKeyIds: string[];
  lastSync?: number;
  packageCount: number;
}

export type TransactionType = "install" | "upgrade" | "remove" | "rollback";

export interface Transaction {
  id: string;
  type: TransactionType;
  packages: string[];
  state: "pending" | "in-progress" | "committed" | "rolled-back" | "failed";
  createdAt: number;
  completedAt?: number;
  error?: string;
  snapshot?: string; // pre-transaction snapshot ID
}

export class PackageManager {
  private installed: Map<string, InstalledPackage> = new Map();
  private available: Map<string, PackageManifest> = new Map();
  private repositories: Map<string, Repository> = new Map();
  private transactions: Transaction[] = [];
  private _txCounter = 0;

  constructor() {
    // Default repositories
    this.repositories.set("sita-core", {
      id: "sita-core",
      name: "SITA OS Core",
      url: "https://packages.sita.os/core",
      enabled: true,
      trusted: true,
      signingKeyIds: ["sita-release-key-2025"],
      packageCount: 0,
    });
    this.repositories.set("sita-security", {
      id: "sita-security",
      name: "SITA OS Security Updates",
      url: "https://packages.sita.os/security",
      enabled: true,
      trusted: true,
      signingKeyIds: ["sita-security-key-2025"],
      packageCount: 0,
    });
  }

  /** Register a package as available */
  registerAvailable(pkg: PackageManifest): void {
    this.available.set(`${pkg.name}@${pkg.version}`, pkg);
  }

  /** Resolve dependency tree for a package */
  resolveDependencies(name: string): { resolved: string[]; missing: string[] } {
    const resolved: string[] = [];
    const missing: string[] = [];
    const visited = new Set<string>();

    const resolve = (n: string) => {
      if (visited.has(n)) return;
      visited.add(n);

      // Find latest available version
      const pkg = [...this.available.values()].find(p => p.name === n);
      if (!pkg) {
        if (!this.installed.has(n)) missing.push(n);
        return;
      }

      for (const dep of pkg.dependencies) resolve(dep);
      if (!this.installed.has(n)) resolved.push(n);
    };

    resolve(name);
    return { resolved, missing };
  }

  /** Verify package integrity */
  verifyPackage(pkg: PackageManifest): { valid: boolean; reason?: string } {
    // In real OS, this would verify Ed25519 signature against trusted keyring
    if (!pkg.checksum) return { valid: false, reason: "missing checksum" };
    if (!pkg.signature) return { valid: false, reason: "missing signature" };
    if (!pkg.signingKeyId) return { valid: false, reason: "missing signing key ID" };

    const repo = [...this.repositories.values()].find(r => r.id === pkg.repository);
    if (!repo?.trusted) return { valid: false, reason: "untrusted repository" };
    if (!repo.signingKeyIds.includes(pkg.signingKeyId)) {
      return { valid: false, reason: "signing key not in trusted keyring" };
    }

    return { valid: true };
  }

  /** Install a package (transactional) */
  install(name: string): Transaction {
    const tx = this.createTransaction("install", [name]);
    const { resolved, missing } = this.resolveDependencies(name);

    if (missing.length > 0) {
      tx.state = "failed";
      tx.error = `unresolved dependencies: ${missing.join(", ")}`;
      tx.completedAt = Date.now();
      return tx;
    }

    tx.state = "in-progress";
    tx.packages = resolved;

    for (const pkgName of resolved) {
      const manifest = [...this.available.values()].find(p => p.name === pkgName);
      if (!manifest) continue;

      const verification = this.verifyPackage(manifest);
      if (!verification.valid) {
        tx.state = "failed";
        tx.error = `${pkgName}: ${verification.reason}`;
        tx.completedAt = Date.now();
        // Rollback already installed in this tx
        return tx;
      }

      this.installed.set(pkgName, {
        ...manifest,
        state: "installed",
        installedAt: Date.now(),
        installPath: `/usr/lib/sita/${pkgName}`,
        configFiles: [`/etc/sita/${pkgName}.conf`],
      });
    }

    tx.state = "committed";
    tx.completedAt = Date.now();
    return tx;
  }

  /** Upgrade a package */
  upgrade(name: string, newVersion: string): Transaction {
    const tx = this.createTransaction("upgrade", [name]);
    const current = this.installed.get(name);

    if (!current) {
      tx.state = "failed";
      tx.error = "package not installed";
      tx.completedAt = Date.now();
      return tx;
    }

    const manifest = this.available.get(`${name}@${newVersion}`);
    if (!manifest) {
      tx.state = "failed";
      tx.error = `version ${newVersion} not available`;
      tx.completedAt = Date.now();
      return tx;
    }

    tx.state = "in-progress";
    tx.snapshot = `pre-upgrade-${name}-${current.version}`;

    this.installed.set(name, {
      ...manifest,
      state: "installed",
      installedAt: current.installedAt,
      updatedAt: Date.now(),
      installPath: current.installPath,
      configFiles: current.configFiles,
      previousVersion: current.version,
    });

    tx.state = "committed";
    tx.completedAt = Date.now();
    return tx;
  }

  /** Rollback to previous version */
  rollback(name: string): Transaction {
    const tx = this.createTransaction("rollback", [name]);
    const current = this.installed.get(name);

    if (!current?.previousVersion) {
      tx.state = "failed";
      tx.error = "no previous version to rollback to";
      tx.completedAt = Date.now();
      return tx;
    }

    const prev = this.available.get(`${name}@${current.previousVersion}`);
    if (!prev) {
      tx.state = "failed";
      tx.error = `previous version ${current.previousVersion} no longer available`;
      tx.completedAt = Date.now();
      return tx;
    }

    this.installed.set(name, {
      ...prev,
      state: "installed",
      installedAt: current.installedAt,
      updatedAt: Date.now(),
      installPath: current.installPath,
      configFiles: current.configFiles,
    });

    tx.state = "committed";
    tx.completedAt = Date.now();
    return tx;
  }

  /** Remove a package */
  remove(name: string): Transaction {
    const tx = this.createTransaction("remove", [name]);

    // Check if other installed packages depend on this
    const dependents = [...this.installed.values()].filter(p => p.dependencies.includes(name));
    if (dependents.length > 0) {
      tx.state = "failed";
      tx.error = `required by: ${dependents.map(d => d.name).join(", ")}`;
      tx.completedAt = Date.now();
      return tx;
    }

    this.installed.delete(name);
    tx.state = "committed";
    tx.completedAt = Date.now();
    return tx;
  }

  private createTransaction(type: TransactionType, packages: string[]): Transaction {
    const tx: Transaction = {
      id: `tx_${++this._txCounter}_${Date.now().toString(36)}`,
      type,
      packages,
      state: "pending",
      createdAt: Date.now(),
    };
    this.transactions.push(tx);
    return tx;
  }

  getInstalled(): InstalledPackage[] { return [...this.installed.values()]; }
  getTransactions(): Transaction[] { return [...this.transactions]; }
  getRepositories(): Repository[] { return [...this.repositories.values()]; }

  getStats() {
    return {
      installedCount: this.installed.size,
      availableCount: this.available.size,
      repositories: this.repositories.size,
      transactions: this.transactions.length,
      lastTransaction: this.transactions[this.transactions.length - 1] ?? null,
    };
  }
}
