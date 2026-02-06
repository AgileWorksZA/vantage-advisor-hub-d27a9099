
-- tlh_opportunities table
CREATE TABLE public.tlh_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  client_name TEXT NOT NULL,
  current_fund_name TEXT NOT NULL,
  current_ticker TEXT,
  current_fund_id UUID REFERENCES public.admin_funds(id),
  purchase_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  unrealized_gain_loss NUMERIC DEFAULT 0,
  cost_basis NUMERIC DEFAULT 0,
  holding_period TEXT DEFAULT 'short_term',
  wash_sale_ok BOOLEAN DEFAULT true,
  jurisdiction TEXT DEFAULT 'ZA',
  suggested_replacement_id UUID REFERENCES public.admin_funds(id),
  suggested_replacement_name TEXT,
  estimated_tax_savings NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'new',
  executed_at TIMESTAMPTZ,
  trade_notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tlh_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own TLH opportunities"
  ON public.tlh_opportunities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own TLH opportunities"
  ON public.tlh_opportunities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own TLH opportunities"
  ON public.tlh_opportunities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own TLH opportunities"
  ON public.tlh_opportunities FOR DELETE USING (auth.uid() = user_id);

-- tlh_trades table
CREATE TABLE public.tlh_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  opportunity_id UUID REFERENCES public.tlh_opportunities(id),
  client_id UUID REFERENCES public.clients(id),
  sell_fund_name TEXT NOT NULL,
  sell_ticker TEXT,
  sell_fund_id UUID REFERENCES public.admin_funds(id),
  sell_value NUMERIC DEFAULT 0,
  buy_fund_name TEXT NOT NULL,
  buy_ticker TEXT,
  buy_fund_id UUID REFERENCES public.admin_funds(id),
  buy_value NUMERIC DEFAULT 0,
  realized_loss NUMERIC DEFAULT 0,
  estimated_tax_saving NUMERIC DEFAULT 0,
  trade_type TEXT DEFAULT 'switch',
  status TEXT DEFAULT 'pending',
  executed_at TIMESTAMPTZ DEFAULT now(),
  settled_at TIMESTAMPTZ,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tlh_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own TLH trades"
  ON public.tlh_trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own TLH trades"
  ON public.tlh_trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own TLH trades"
  ON public.tlh_trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own TLH trades"
  ON public.tlh_trades FOR DELETE USING (auth.uid() = user_id);

-- tlh_fund_replacements table
CREATE TABLE public.tlh_fund_replacements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'ZA',
  original_fund_id UUID REFERENCES public.admin_funds(id),
  replacement_fund_id UUID REFERENCES public.admin_funds(id),
  correlation NUMERIC DEFAULT 0.95,
  tracking_error NUMERIC DEFAULT 0.02,
  fee_differential NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tlh_fund_replacements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own TLH fund replacements"
  ON public.tlh_fund_replacements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own TLH fund replacements"
  ON public.tlh_fund_replacements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own TLH fund replacements"
  ON public.tlh_fund_replacements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own TLH fund replacements"
  ON public.tlh_fund_replacements FOR DELETE USING (auth.uid() = user_id);

-- Timestamps trigger for all three tables
CREATE OR REPLACE FUNCTION public.update_tlh_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tlh_opportunities_updated_at
  BEFORE UPDATE ON public.tlh_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_tlh_updated_at();

CREATE TRIGGER update_tlh_trades_updated_at
  BEFORE UPDATE ON public.tlh_trades
  FOR EACH ROW EXECUTE FUNCTION public.update_tlh_updated_at();

CREATE TRIGGER update_tlh_fund_replacements_updated_at
  BEFORE UPDATE ON public.tlh_fund_replacements
  FOR EACH ROW EXECUTE FUNCTION public.update_tlh_updated_at();
