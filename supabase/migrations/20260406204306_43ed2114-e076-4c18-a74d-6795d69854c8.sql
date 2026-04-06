
-- Financial Accounts table
CREATE TABLE public.financial_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  institution TEXT,
  account_type TEXT NOT NULL DEFAULT 'checking',
  balance NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  trend NUMERIC DEFAULT 0,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial accounts"
  ON public.financial_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own financial accounts"
  ON public.financial_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial accounts"
  ON public.financial_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial accounts"
  ON public.financial_accounts FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_financial_accounts_updated_at
  BEFORE UPDATE ON public.financial_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Money Policies table
CREATE TABLE public.money_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  enabled BOOLEAN NOT NULL DEFAULT true,
  threshold NUMERIC,
  icon_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.money_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own money policies"
  ON public.money_policies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own money policies"
  ON public.money_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own money policies"
  ON public.money_policies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own money policies"
  ON public.money_policies FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_money_policies_updated_at
  BEFORE UPDATE ON public.money_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
