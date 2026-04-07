import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
// ═══════════════════════════════════════════════════════════════
// SITA OS — Natural Language Policy Builder
// Converts plain English rules into executable policy objects
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

export interface ParsedPolicy {
  id: string;
  naturalLanguage: string;
  name: string;
  category: string;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  approvalRequired: boolean;
  confidence: number;
  active: boolean;
}

export interface PolicyCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains' | 'not_contains' | 'between' | 'in';
  value: number | string | number[];
  unit?: string;
}

export interface PolicyAction {
  type: 'block' | 'require_approval' | 'notify' | 'flag' | 'auto_approve' | 'escalate' | 'log';
  target?: string;
  message?: string;
}

interface PatternMatch {
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => { conditions: PolicyCondition[]; actions: PolicyAction[]; category: string };
}

const PATTERNS: PatternMatch[] = [
  {
    pattern: /block.*(?:payment|transaction)s?\s+(?:over|above|exceeding)\s+\$?([\d,]+)\s*(?:without|unless)?\s*(?:my\s+)?(?:approval)?/i,
    extract: (m) => ({
      conditions: [{ field: 'amount', operator: 'gt', value: parseFloat(m[1].replace(/,/g, '')), unit: 'currency' }],
      actions: [{ type: 'require_approval', message: `Payment exceeds $${m[1]} threshold` }],
      category: 'financial',
    }),
  },
  {
    pattern: /(?:no|never|don'?t)\s+(?:send|allow)\s+(?:emails?|messages?)\s+(?:after|past)\s+(\d{1,2})\s*(?::?\d{2})?\s*(?:pm|am)?/i,
    extract: (m) => ({
      conditions: [{ field: 'time_of_day', operator: 'gt', value: parseInt(m[1]) + (m[0].toLowerCase().includes('pm') ? 12 : 0) }],
      actions: [{ type: 'block', message: 'Communication blocked outside allowed hours' }],
      category: 'communication',
    }),
  },
  {
    pattern: /auto[- ]?approve.*(?:under|below|less than)\s+\$?([\d,]+)/i,
    extract: (m) => ({
      conditions: [{ field: 'amount', operator: 'lt', value: parseFloat(m[1].replace(/,/g, '')) }],
      actions: [{ type: 'auto_approve' }],
      category: 'financial',
    }),
  },
  {
    pattern: /(?:alert|notify|warn)\s+(?:me|us)\s+(?:when|if)\s+(.+?)\s+(?:exceeds?|goes?\s+(?:above|over))\s+(\d+)%?/i,
    extract: (m) => ({
      conditions: [{ field: m[1].trim().replace(/\s+/g, '_'), operator: 'gt', value: parseFloat(m[2]) }],
      actions: [{ type: 'notify', message: `${m[1].trim()} exceeded ${m[2]}` }],
      category: 'monitoring',
    }),
  },
  {
    pattern: /(?:require|need)\s+(?:2fa|two[- ]?factor|verification)\s+for\s+(.+)/i,
    extract: (m) => ({
      conditions: [{ field: 'action_type', operator: 'eq', value: m[1].trim() }],
      actions: [{ type: 'require_approval', message: '2FA verification required' }, { type: 'escalate' }],
      category: 'security',
    }),
  },
  {
    pattern: /(?:limit|restrict|cap)\s+(.+?)\s+(?:to|at)\s+(\d+)\s+per\s+(day|week|month)/i,
    extract: (m) => ({
      conditions: [{ field: `${m[1].trim().replace(/\s+/g, '_')}_count`, operator: 'gt', value: parseInt(m[2]) }],
      actions: [{ type: 'block', message: `${m[1].trim()} limit of ${m[2]} per ${m[3]} reached` }],
      category: 'rate_limiting',
    }),
  },
];

class NaturalLanguagePolicyBuilder {
  parse(naturalLanguage: string): ParsedPolicy {
    const trimmed = naturalLanguage.trim();

    for (const { pattern, extract } of PATTERNS) {
      const match = trimmed.match(pattern);
      if (match) {
        const { conditions, actions, category } = extract(match);
        return {
          id: crypto.randomUUID(),
          naturalLanguage: trimmed,
          name: this.generateName(trimmed),
          category,
          conditions,
          actions,
          approvalRequired: actions.some((a) => a.type === 'require_approval' || a.type === 'escalate'),
          confidence: 0.85,
          active: false,
        };
      }
    }

    // Fallback: create a generic policy
    return {
      id: crypto.randomUUID(),
      naturalLanguage: trimmed,
      name: this.generateName(trimmed),
      category: 'custom',
      conditions: [{ field: 'custom_rule', operator: 'eq', value: trimmed }],
      actions: [{ type: 'flag', message: trimmed }],
      approvalRequired: true,
      confidence: 0.4,
      active: false,
    };
  }

  async savePolicy(userId: string, policy: ParsedPolicy): Promise<boolean> {
    const { error } = await fromDynamicTable('policies').insert({
      user_id: userId,
      name: policy.name,
      category: policy.category,
      conditions: policy.conditions as never,
      actions: policy.actions as never,
      approval_required: policy.approvalRequired,
      active: policy.active,
    });
    return !error;
  }

  async listPolicies(userId: string): Promise<ParsedPolicy[]> {
    const { data } = await fromDynamicTable('policies').select('*').eq('user_id', userId);
    return (data || []).map((p: any) => ({
      id: p.id,
      naturalLanguage: '',
      name: p.name,
      category: p.category,
      conditions: p.conditions || [],
      actions: p.actions || [],
      approvalRequired: p.approval_required,
      confidence: 1,
      active: p.active,
    }));
  }

  private generateName(input: string): string {
    const words = input.split(/\s+/).slice(0, 5).join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
}

export const naturalLanguagePolicyBuilder = new NaturalLanguagePolicyBuilder();

