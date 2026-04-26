-- Phase 2 (Business OS Production-Truth Closure):
-- Seed missing CRM trust action catalog entries so every CRM mutation
-- emitted from use-crm-data.ts can resolve through evaluate_action_authority.

INSERT INTO public.trust_action_catalog
  (action_key, pillar, label, description, risk_tier, default_authority_level, require_approval, reversible)
VALUES
  -- Contacts
  ('crm.contact.update',          'business', 'Update CRM contact',          'Mutates an existing contact record (PII write).',                       'low',    'pre_approved', false, true),
  -- Companies
  ('crm.company.create',          'business', 'Create CRM company',          'Persists a new company account record.',                                 'low',    'pre_approved', false, true),
  ('crm.company.update',          'business', 'Update CRM company',          'Mutates an existing company account record.',                            'low',    'pre_approved', false, true),
  ('crm.company.delete',          'business', 'Delete CRM company',          'Permanently removes a company account and severs related links.',       'high',   'ask',          true,  false),
  -- Opportunities / deals (generic create / update / delete; stage_change already exists)
  ('crm.opportunity.create',      'business', 'Create CRM opportunity',      'Creates a new opportunity in the pipeline.',                             'low',    'pre_approved', false, true),
  ('crm.opportunity.update',      'business', 'Update CRM opportunity',      'Mutates an existing opportunity record.',                                'medium', 'pre_approved', false, true),
  ('crm.opportunity.delete',      'business', 'Delete CRM opportunity',      'Permanently removes an opportunity from the pipeline.',                  'medium', 'ask',          false, false),
  -- Tasks
  ('crm.task.create',             'business', 'Create CRM task',             'Creates a follow-up task tied to a contact, company, or deal.',         'low',    'pre_approved', false, true),
  ('crm.task.update',             'business', 'Update CRM task',             'Mutates an existing CRM task.',                                          'low',    'pre_approved', false, true),
  ('crm.task.delete',             'business', 'Delete CRM task',             'Removes a CRM task from the queue.',                                     'low',    'pre_approved', false, true),
  -- Communications (logged contact touches)
  ('crm.communication.log',       'business', 'Log CRM communication',       'Records an outbound or inbound communication on a contact timeline.',   'low',    'pre_approved', false, true),
  ('crm.communication.delete',    'business', 'Delete CRM communication',    'Removes a logged communication entry.',                                  'medium', 'ask',          false, false),
  -- Notes
  ('crm.note.create',             'business', 'Create CRM note',             'Adds a note to a contact, company, or deal record.',                     'low',    'pre_approved', false, true),
  ('crm.note.update',             'business', 'Update CRM note',             'Edits an existing CRM note.',                                            'low',    'pre_approved', false, true),
  ('crm.note.delete',             'business', 'Delete CRM note',             'Removes a CRM note.',                                                    'low',    'pre_approved', false, true),
  -- Pipeline configuration
  ('crm.pipeline_stage.create',   'business', 'Create pipeline stage',       'Adds a new stage to the deal pipeline (config write).',                  'medium', 'ask',          false, true),
  ('crm.pipeline_stage.update',   'business', 'Update pipeline stage',       'Mutates an existing pipeline stage definition.',                         'medium', 'ask',          false, true),
  ('crm.pipeline_stage.delete',   'business', 'Delete pipeline stage',       'Removes a pipeline stage; affects deal placement.',                      'high',   'ask',          true,  false),
  -- Segments
  ('crm.segment.create',          'business', 'Create CRM segment',          'Defines a new audience segment.',                                        'low',    'pre_approved', false, true),
  ('crm.segment.update',          'business', 'Update CRM segment',          'Edits an existing audience segment definition.',                         'low',    'pre_approved', false, true),
  ('crm.segment.delete',          'business', 'Delete CRM segment',          'Removes an audience segment.',                                           'low',    'pre_approved', false, true),
  -- Tags
  ('crm.tag.create',              'business', 'Create CRM tag',              'Creates a new label/tag in the CRM.',                                    'low',    'pre_approved', false, true),
  ('crm.tag.delete',              'business', 'Delete CRM tag',              'Removes a CRM tag from the catalog.',                                    'low',    'pre_approved', false, true),
  -- Imports
  ('crm.import_job.create',       'business', 'Start CRM import job',        'Queues a CRM import job for processing.',                                'medium', 'ask',          false, true),
  ('crm.import_job.update',       'business', 'Update CRM import job',       'Mutates the state of a queued or running CRM import job.',               'low',    'pre_approved', false, true),
  -- Merge / dedup
  ('crm.merge.execute',           'business', 'Execute CRM merge',           'Merges duplicate CRM records and writes a merge log.',                   'high',   'ask',          true,  false),
  -- Contact ↔ company links
  ('crm.contact_company_link.create', 'business', 'Link contact to company', 'Associates a contact with a company.',                                  'low',    'pre_approved', false, true),
  ('crm.contact_company_link.delete', 'business', 'Unlink contact from company', 'Severs a contact↔company association.',                             'low',    'pre_approved', false, true),
  -- Automations
  ('crm.automation.create',       'business', 'Create CRM automation',       'Defines a new CRM automation rule.',                                     'medium', 'ask',          false, true),
  ('crm.automation.update',       'business', 'Update CRM automation',       'Mutates an existing CRM automation rule.',                               'medium', 'ask',          false, true),
  ('crm.automation.delete',       'business', 'Delete CRM automation',       'Removes a CRM automation rule.',                                         'medium', 'ask',          false, true)
ON CONFLICT (action_key) DO NOTHING;