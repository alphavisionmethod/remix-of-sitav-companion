UPDATE public.advisor_deployment_status
SET phase = 'deployment-ready',
    ui_complete = true,
    backend_complete = true,
    context_wired = true,
    scope_complete = true,
    trust_model_complete = true,
    authority_model_complete = true,
    explainability_complete = true,
    simulation_capable = true,
    receipts_integrated = true,
    tests_passing = true,
    analytics_wired = true,
    admin_visibility = true,
    empty_states_handled = true,
    error_states_handled = true,
    last_reviewed_at = now(),
    notes = 'Phase 9 complete. L1-suggest authority enforced; persistent professional disclaimer banner on every surface (header, recommendations, simulation, drawer, mobile). Suggest-only intent ("ask") with checklist framing — never drafts filings/contracts/advice. tax_documents wired to RLS-scoped file_metadata; jurisdiction_data and compliance_records honestly null. 11/11 vitest pass. Blocked: file_tax_return, provide_legal_advice, submit_legal_filing, execute_compliance_action.',
    evidence = jsonb_build_object(
      'desktop_components', jsonb_build_array('TaxesLawsHeaderStats','TaxesLawsRecommendations','TaxesLawsSimulationForm','TaxesLawsDetailDrawer'),
      'mobile_components', jsonb_build_array('MobileTaxesLawsAdvisorPanels'),
      'shared', jsonb_build_array('ProfessionalDisclaimerBanner'),
      'tests_pass', '11/11',
      'authority', 'L1-suggest',
      'persistent_disclaimer', true
    )
WHERE advisor_id = 'taxes-laws-advisor';