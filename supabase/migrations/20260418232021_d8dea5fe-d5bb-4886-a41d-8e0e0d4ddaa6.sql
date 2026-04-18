CREATE POLICY "service role manages compliance evidence"
ON public.compliance_evidence
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);