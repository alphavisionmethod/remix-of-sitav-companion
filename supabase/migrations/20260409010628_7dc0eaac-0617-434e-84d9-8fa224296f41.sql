-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Fix 30 RLS policies: public → authenticated
-- These policies already have auth.uid() = user_id checks,
-- but were assigned to the {public} role instead of {authenticated}.
-- ═══════════════════════════════════════════════════════════════

-- Drop and recreate each policy with TO authenticated

-- 1. appointments
DROP POLICY IF EXISTS "Users manage own appointments" ON public.appointments;
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. brand_assets
DROP POLICY IF EXISTS "Users manage own brand_assets" ON public.brand_assets;
CREATE POLICY "Users manage own brand_assets" ON public.brand_assets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. campaigns
DROP POLICY IF EXISTS "Users manage own campaigns" ON public.campaigns;
CREATE POLICY "Users manage own campaigns" ON public.campaigns FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. ecommerce_products
DROP POLICY IF EXISTS "Users manage own ecommerce_products" ON public.ecommerce_products;
CREATE POLICY "Users manage own ecommerce_products" ON public.ecommerce_products FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. forms
DROP POLICY IF EXISTS "Users manage own forms" ON public.forms;
CREATE POLICY "Users manage own forms" ON public.forms FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. funnels
DROP POLICY IF EXISTS "Users manage own funnels" ON public.funnels;
CREATE POLICY "Users manage own funnels" ON public.funnels FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. gift_tracker
DROP POLICY IF EXISTS "Users manage own gift_tracker" ON public.gift_tracker;
CREATE POLICY "Users manage own gift_tracker" ON public.gift_tracker FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. grocery_items
DROP POLICY IF EXISTS "Users manage own grocery_items" ON public.grocery_items;
CREATE POLICY "Users manage own grocery_items" ON public.grocery_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. grocery_lists
DROP POLICY IF EXISTS "Users manage own grocery_lists" ON public.grocery_lists;
CREATE POLICY "Users manage own grocery_lists" ON public.grocery_lists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. health_logs
DROP POLICY IF EXISTS "Users manage own health_logs" ON public.health_logs;
CREATE POLICY "Users manage own health_logs" ON public.health_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11. investment_decisions
DROP POLICY IF EXISTS "Users manage own investment_decisions" ON public.investment_decisions;
CREATE POLICY "Users manage own investment_decisions" ON public.investment_decisions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 12. market_watchlist_items
DROP POLICY IF EXISTS "Users manage own market_watchlist_items" ON public.market_watchlist_items;
CREATE POLICY "Users manage own market_watchlist_items" ON public.market_watchlist_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 13. memberships
DROP POLICY IF EXISTS "Users manage own memberships" ON public.memberships;
CREATE POLICY "Users manage own memberships" ON public.memberships FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 14. mission_goals
DROP POLICY IF EXISTS "Users manage own mission_goals" ON public.mission_goals;
CREATE POLICY "Users manage own mission_goals" ON public.mission_goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 15. mission_milestones
DROP POLICY IF EXISTS "Users manage own mission_milestones" ON public.mission_milestones;
CREATE POLICY "Users manage own mission_milestones" ON public.mission_milestones FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 16. money_approvals
DROP POLICY IF EXISTS "Users manage own money_approvals" ON public.money_approvals;
CREATE POLICY "Users manage own money_approvals" ON public.money_approvals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 17. offers
DROP POLICY IF EXISTS "Users manage own offers" ON public.offers;
CREATE POLICY "Users manage own offers" ON public.offers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 18. pipeline_stages
DROP POLICY IF EXISTS "Users manage own pipeline_stages" ON public.pipeline_stages;
CREATE POLICY "Users manage own pipeline_stages" ON public.pipeline_stages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 19. receivables
DROP POLICY IF EXISTS "Users manage own receivables" ON public.receivables;
CREATE POLICY "Users manage own receivables" ON public.receivables FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 20. reputation_reviews
DROP POLICY IF EXISTS "Users manage own reputation_reviews" ON public.reputation_reviews;
CREATE POLICY "Users manage own reputation_reviews" ON public.reputation_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 21. retention_alerts
DROP POLICY IF EXISTS "Users manage own retention_alerts" ON public.retention_alerts;
CREATE POLICY "Users manage own retention_alerts" ON public.retention_alerts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 22. risk_scenarios
DROP POLICY IF EXISTS "Users manage own risk_scenarios" ON public.risk_scenarios;
CREATE POLICY "Users manage own risk_scenarios" ON public.risk_scenarios FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 23. school_activities
DROP POLICY IF EXISTS "Users manage own school_activities" ON public.school_activities;
CREATE POLICY "Users manage own school_activities" ON public.school_activities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 24. seo_reports
DROP POLICY IF EXISTS "Users manage own seo_reports" ON public.seo_reports;
CREATE POLICY "Users manage own seo_reports" ON public.seo_reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 25. service_providers_list
DROP POLICY IF EXISTS "Users manage own service_providers_list" ON public.service_providers_list;
CREATE POLICY "Users manage own service_providers_list" ON public.service_providers_list FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 26. sites
DROP POLICY IF EXISTS "Users manage own sites" ON public.sites;
CREATE POLICY "Users manage own sites" ON public.sites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 27. tax_estimates
DROP POLICY IF EXISTS "Users manage own tax_estimates" ON public.tax_estimates;
CREATE POLICY "Users manage own tax_estimates" ON public.tax_estimates FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 28. trade_orders
DROP POLICY IF EXISTS "Users manage own trade_orders" ON public.trade_orders;
CREATE POLICY "Users manage own trade_orders" ON public.trade_orders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 29. travel_plans
DROP POLICY IF EXISTS "Users manage own travel_plans" ON public.travel_plans;
CREATE POLICY "Users manage own travel_plans" ON public.travel_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 30. vault_items
DROP POLICY IF EXISTS "Users manage own vault_items" ON public.vault_items;
CREATE POLICY "Users manage own vault_items" ON public.vault_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);