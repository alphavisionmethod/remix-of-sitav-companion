import { fromTable } from "@/lib/supabase-helpers";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Digital Will & Legacy Vault
// Encrypted storage for passwords, documents, instructions
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

export type VaultItemType = 'password' | 'document' | 'instruction' | 'account' | 'insurance' | 'medical' | 'legal' | 'note';

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  encryptedContent: string;
  tags: string[];
  beneficiaries: string[];
  lastUpdated: Date;
  reminderDate?: Date;
  notes?: string;
}

export interface LegacyPlan {
  id: string;
  userId: string;
  items: VaultItem[];
  trustedContacts: TrustedContact[];
  activationMethod: 'manual' | 'inactivity' | 'trusted_contact';
  inactivityDays: number;
  lastCheckin: Date;
  status: 'active' | 'activated' | 'locked';
  createdAt: Date;
  updatedAt: Date;
}

export interface TrustedContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;
  accessLevel: 'full' | 'partial' | 'emergency_only';
  verified: boolean;
}

class DigitalLegacyVaultService {
  private encryptionKey: CryptoKey | null = null;

  async initializeVault(passphrase: string): Promise<void> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    this.encryptionKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: encoder.encode('sita-vault-salt'), iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(plaintext: string): Promise<string> {
    if (!this.encryptionKey) throw new Error('Vault not initialized');
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      encoded
    );
    const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    return btoa(String.fromCharCode(...combined));
  }

  async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) throw new Error('Vault not initialized');
    const combined = new Uint8Array(atob(encryptedData).split('').map((c) => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  }

  async addItem(userId: string, item: Omit<VaultItem, 'id' | 'lastUpdated'>): Promise<VaultItem> {
    const full: VaultItem = {
      ...item,
      id: crypto.randomUUID(),
      lastUpdated: new Date(),
    };

    await fromTable('encrypted_secrets').insert({
      user_id: userId,
      name: `vault_${full.type}_${full.id}`,
      encrypted_value: full.encryptedContent,
      service: 'legacy_vault',
      metadata: { title: full.title, type: full.type, tags: full.tags, beneficiaries: full.beneficiaries } as never,
    });

    return full;
  }

  async getItems(userId: string): Promise<VaultItem[]> {
    const { data } = await supabase
      .from('encrypted_secrets')
      .select('*')
      .eq('user_id', userId)
      .eq('service', 'legacy_vault');

    return (data || []).map((d) => ({
      id: d.id,
      type: ((d.metadata as Record<string, unknown>)?.type || 'note') as VaultItemType,
      title: (d.metadata as Record<string, unknown>)?.title as string || d.name,
      encryptedContent: d.encrypted_value,
      tags: ((d.metadata as Record<string, unknown>)?.tags || []) as string[],
      beneficiaries: ((d.metadata as Record<string, unknown>)?.beneficiaries || []) as string[],
      lastUpdated: new Date(d.updated_at || d.created_at || ''),
    }));
  }

  async deleteItem(userId: string, itemId: string): Promise<boolean> {
    const { error } = await supabase
      .from('encrypted_secrets')
      .delete()
      .eq('user_id', userId)
      .eq('id', itemId);
    return !error;
  }

  async checkin(userId: string): Promise<void> {
    await fromTable('user_memory').upsert({
      user_id: userId,
      key: 'vault_last_checkin',
      value: JSON.stringify({ checkedInAt: new Date().toISOString() }) as never,
      category: 'legacy_vault',
    }, { onConflict: 'user_id,key' });
  }

  async getLastCheckin(userId: string): Promise<Date | null> {
    const { data } = await supabase
      .from('user_memory')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'vault_last_checkin')
      .single();

    if (data?.value) {
      const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      return new Date(parsed.checkedInAt);
    }
    return null;
  }
}

export const digitalLegacyVaultService = new DigitalLegacyVaultService();

