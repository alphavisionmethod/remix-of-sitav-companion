// ═══════════════════════════════════════════════════════════════
// SITA OS — Auto-Proposal Generator
// Drafts full proposals with pricing from lead profiles
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

export interface ProposalSection {
  title: string;
  content: string;
  order: number;
}

export interface ProposalLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Proposal {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  title: string;
  summary: string;
  sections: ProposalSection[];
  lineItems: ProposalLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: Date;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  createdAt: Date;
  confidence: number;
}

class AutoProposalGenerator {
  async generate(userId: string, leadId: string): Promise<Proposal> {
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', userId)
      .single();

    if (!lead) throw new Error('Lead not found');

    // Analyze past deals for pricing intelligence
    const { data: deals } = await supabase
      .from('deals')
      .select('value, stage')
      .eq('user_id', userId)
      .eq('stage', 'won');

    const avgDealValue = deals && deals.length > 0
      ? deals.reduce((s, d) => s + Number(d.value || 0), 0) / deals.length
      : 5000;

    const estimatedValue = lead.likely_value ? Number(lead.likely_value) : avgDealValue;

    // Generate line items based on estimated value
    const lineItems = this.generateLineItems(estimatedValue, lead.notes || '');
    const subtotal = lineItems.reduce((s, li) => s + li.total, 0);
    const tax = subtotal * 0.1;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    const proposal: Proposal = {
      id: crypto.randomUUID(),
      leadId,
      leadName: lead.name,
      company: lead.company || '',
      title: `Proposal for ${lead.company || lead.name}`,
      summary: this.generateSummary(lead),
      sections: this.generateSections(lead, lineItems),
      lineItems,
      subtotal,
      tax,
      total: subtotal + tax,
      validUntil,
      status: 'draft',
      createdAt: new Date(),
      confidence: lead.opportunity_score ? Math.min(1, (lead.opportunity_score || 0) / 100) : 0.5,
    };

    return proposal;
  }

  private generateLineItems(estimatedValue: number, notes: string): ProposalLineItem[] {
    const hasDesign = /design|ui|ux|brand/i.test(notes);
    const hasDev = /develop|build|code|software|app|web/i.test(notes);
    const hasConsulting = /consult|advise|strategy/i.test(notes);

    const items: ProposalLineItem[] = [];

    if (hasDev || (!hasDesign && !hasConsulting)) {
      items.push({ description: 'Development & Implementation', quantity: 1, unitPrice: estimatedValue * 0.6, total: estimatedValue * 0.6 });
    }
    if (hasDesign) {
      items.push({ description: 'Design & UX', quantity: 1, unitPrice: estimatedValue * 0.25, total: estimatedValue * 0.25 });
    }
    if (hasConsulting) {
      items.push({ description: 'Strategic Consulting', quantity: 1, unitPrice: estimatedValue * 0.3, total: estimatedValue * 0.3 });
    }
    items.push({ description: 'Project Management & QA', quantity: 1, unitPrice: estimatedValue * 0.15, total: estimatedValue * 0.15 });

    if (items.length === 1) {
      items.push({ description: 'Setup & Configuration', quantity: 1, unitPrice: estimatedValue * 0.25, total: estimatedValue * 0.25 });
    }

    return items;
  }

  private generateSummary(lead: Record<string, unknown>): string {
    return `Thank you for your interest, ${String(lead.name || '')}. Based on our discussion, we've prepared this proposal tailored to ${String(lead.company || 'your')} needs. This document outlines our recommended approach, deliverables, timeline, and investment.`;
  }

  private generateSections(lead: Record<string, unknown>, lineItems: ProposalLineItem[]): ProposalSection[] {
    return [
      {
        title: 'Executive Summary',
        content: `We understand ${String(lead.company || 'your organization')} is looking for a solution that drives results. Our approach combines proven methodology with tailored execution.`,
        order: 1,
      },
      {
        title: 'Scope of Work',
        content: lineItems.map((li) => `• ${li.description}`).join('\n'),
        order: 2,
      },
      {
        title: 'Timeline',
        content: 'Phase 1: Discovery & Planning (Week 1-2)\nPhase 2: Implementation (Week 3-6)\nPhase 3: Testing & Launch (Week 7-8)\nPhase 4: Support & Optimization (Ongoing)',
        order: 3,
      },
      {
        title: 'Why Us',
        content: 'Our team brings deep expertise, a proven track record, and a commitment to delivering measurable outcomes. We operate with full transparency and regular progress updates.',
        order: 4,
      },
      {
        title: 'Terms & Conditions',
        content: '50% upfront, 50% on completion. Payment terms: Net 30. This proposal is valid for 30 days from the date of issue.',
        order: 5,
      },
    ];
  }
}

export const autoProposalGenerator = new AutoProposalGenerator();

