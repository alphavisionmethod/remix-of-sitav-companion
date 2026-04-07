// ═══════════════════════════════════════════════════════════════
// SITA OS — Biometric Auth Bridge (WebAuthn/Passkey)
// Passwordless authentication via platform authenticators
// ═══════════════════════════════════════════════════════════════
// @persistence: none — stateless module, no durable state to persist

export interface PasskeyCredential {
  id: string;
  publicKey: string;
  deviceName: string;
  createdAt: Date;
  lastUsed: Date;
}

export interface WebAuthnResult {
  success: boolean;
  credential?: PasskeyCredential;
  error?: string;
}

class BiometricAuthBridge {
  get isSupported(): boolean {
    return typeof window !== 'undefined'
      && !!window.PublicKeyCredential
      && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
  }

  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported) return false;
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  async register(userId: string, userName: string): Promise<WebAuthnResult> {
    if (!this.isSupported) return { success: false, error: 'WebAuthn not supported' };

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userIdBuffer = new TextEncoder().encode(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'SITA OS', id: window.location.hostname },
          user: { id: userIdBuffer, name: userName, displayName: userName },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' },  // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'required',
          },
          timeout: 60000,
          attestation: 'none',
        },
      }) as PublicKeyCredential;

      if (!credential) return { success: false, error: 'Registration cancelled' };

      const response = credential.response as AuthenticatorAttestationResponse;

      return {
        success: true,
        credential: {
          id: credential.id,
          publicKey: btoa(String.fromCharCode(...new Uint8Array(response.getPublicKey?.() || new ArrayBuffer(0)))),
          deviceName: this.detectDevice(),
          createdAt: new Date(),
          lastUsed: new Date(),
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  async authenticate(): Promise<WebAuthnResult> {
    if (!this.isSupported) return { success: false, error: 'WebAuthn not supported' };

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: 'required',
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (!assertion) return { success: false, error: 'Authentication cancelled' };

      return {
        success: true,
        credential: {
          id: assertion.id,
          publicKey: '',
          deviceName: this.detectDevice(),
          createdAt: new Date(),
          lastUsed: new Date(),
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  private detectDevice(): string {
    const ua = navigator.userAgent;
    if (/iPhone|iPad/.test(ua)) return 'Apple Device';
    if (/Android/.test(ua)) return 'Android Device';
    if (/Windows/.test(ua)) return 'Windows Device';
    if (/Mac/.test(ua)) return 'Mac Device';
    if (/Linux/.test(ua)) return 'Linux Device';
    return 'Unknown Device';
  }
}

export const biometricAuthBridge = new BiometricAuthBridge();

