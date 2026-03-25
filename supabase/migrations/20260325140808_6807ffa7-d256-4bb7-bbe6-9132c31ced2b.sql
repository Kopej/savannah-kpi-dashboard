
CREATE TABLE public.instar_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instar integer NOT NULL CHECK (instar >= 1 AND instar <= 5),
  feed_target_per_100_dfl numeric NOT NULL DEFAULT 0,
  larvae_weight_target_g numeric NOT NULL DEFAULT 0,
  mortality_target_percent numeric NOT NULL DEFAULT 0.05,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (instar)
);

-- Seed defaults
INSERT INTO public.instar_targets (instar, feed_target_per_100_dfl, larvae_weight_target_g, mortality_target_percent) VALUES
  (1, 5, 1, 0.05),
  (2, 18, 2, 0.05),
  (3, 60, 3, 0.05),
  (4, 350, 4, 0.05),
  (5, 2500, 5, 0.05);

-- RLS
ALTER TABLE public.instar_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on instar_targets"
  ON public.instar_targets FOR SELECT TO public USING (true);

CREATE POLICY "Allow public update on instar_targets"
  ON public.instar_targets FOR UPDATE TO public USING (true);

CREATE POLICY "Allow public insert on instar_targets"
  ON public.instar_targets FOR INSERT TO public WITH CHECK (true);
