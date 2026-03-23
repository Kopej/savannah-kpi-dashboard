
-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =====================
-- CYCLES TABLE
-- =====================
CREATE TABLE public.cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_number INTEGER NOT NULL,
  hatch_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'finished')),
  estimated_starting_egg_count INTEGER NOT NULL DEFAULT 0,
  hatched_eggs INTEGER NOT NULL DEFAULT 0,
  mortality_pre_cocooning NUMERIC NOT NULL DEFAULT 0,
  mortality_cocooning NUMERIC NOT NULL DEFAULT 0,
  final_larvae_weight NUMERIC NOT NULL DEFAULT 0,
  total_leaf_weight_fed NUMERIC NOT NULL DEFAULT 0,
  total_harvested_wet_cocoon_weight NUMERIC NOT NULL DEFAULT 0,
  percent_non_defective NUMERIC NOT NULL DEFAULT 0,
  avg_weight_per_wet_cocoon NUMERIC NOT NULL DEFAULT 0,
  avg_shell_ratio NUMERIC NOT NULL DEFAULT 0,
  total_eggs INTEGER DEFAULT 0,
  hatch_rate_percent NUMERIC DEFAULT 0,
  instars JSONB DEFAULT '[]'::jsonb,
  dried_cocoon_weight_kg NUMERIC,
  reeled_silk_weight_kg NUMERIC,
  cycle_duration_days INTEGER,
  wet_cocoon_target NUMERIC,
  current_day_of_cycle INTEGER,
  defective_cocoon_weight_kg NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on cycles" ON public.cycles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on cycles" ON public.cycles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on cycles" ON public.cycles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on cycles" ON public.cycles FOR DELETE USING (true);

CREATE TRIGGER update_cycles_updated_at
  BEFORE UPDATE ON public.cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- TICKETS TABLE
-- =====================
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Bug', 'Data Issue', 'Suggestion', 'KPI Error', 'Other')),
  description TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tickets" ON public.tickets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on tickets" ON public.tickets FOR DELETE USING (true);

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- DAILY LOGS TABLE
-- =====================
CREATE TABLE public.daily_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID REFERENCES public.cycles(id) ON DELETE CASCADE NOT NULL,
  cycle_number INTEGER NOT NULL,
  date TEXT NOT NULL,
  estimated_starting_egg_count INTEGER NOT NULL DEFAULT 0,
  hatched_eggs INTEGER NOT NULL DEFAULT 0,
  mortality_pre_cocooning NUMERIC NOT NULL DEFAULT 0,
  mortality_cocooning NUMERIC NOT NULL DEFAULT 0,
  final_larvae_weight NUMERIC NOT NULL DEFAULT 0,
  total_leaf_weight_fed NUMERIC NOT NULL DEFAULT 0,
  total_harvested_wet_cocoon_weight NUMERIC NOT NULL DEFAULT 0,
  percent_non_defective NUMERIC NOT NULL DEFAULT 0,
  avg_weight_per_wet_cocoon NUMERIC NOT NULL DEFAULT 0,
  avg_shell_ratio NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on daily_logs" ON public.daily_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on daily_logs" ON public.daily_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on daily_logs" ON public.daily_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on daily_logs" ON public.daily_logs FOR DELETE USING (true);

CREATE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
