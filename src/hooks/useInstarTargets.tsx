import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InstarTarget {
  instar: number;
  feedTargetPer100Dfl: number;
  larvaeWeightTargetG: number;
  mortalityTargetPercent: number;
}

const DEFAULTS: InstarTarget[] = [
  { instar: 1, feedTargetPer100Dfl: 5, larvaeWeightTargetG: 1, mortalityTargetPercent: 0.05 },
  { instar: 2, feedTargetPer100Dfl: 18, larvaeWeightTargetG: 2, mortalityTargetPercent: 0.05 },
  { instar: 3, feedTargetPer100Dfl: 60, larvaeWeightTargetG: 3, mortalityTargetPercent: 0.05 },
  { instar: 4, feedTargetPer100Dfl: 350, larvaeWeightTargetG: 4, mortalityTargetPercent: 0.05 },
  { instar: 5, feedTargetPer100Dfl: 2500, larvaeWeightTargetG: 5, mortalityTargetPercent: 0.05 },
];

export function useInstarTargets() {
  const [targets, setTargets] = useState<InstarTarget[]>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await (supabase as any)
        .from('instar_targets')
        .select('*')
        .order('instar', { ascending: true });

      if (!error && data && data.length === 5) {
        setTargets(data.map((r: any) => ({
          instar: r.instar,
          feedTargetPer100Dfl: Number(r.feed_target_per_100_dfl),
          larvaeWeightTargetG: Number(r.larvae_weight_target_g),
          mortalityTargetPercent: Number(r.mortality_target_percent),
        })));
      }
      setLoading(false);
    }
    load();
  }, []);

  const updateTarget = useCallback(async (instar: number, updates: Partial<Omit<InstarTarget, 'instar'>>) => {
    setTargets(prev => prev.map(t =>
      t.instar === instar ? { ...t, ...updates } : t
    ));

    const dbUpdates: Record<string, any> = {};
    if (updates.feedTargetPer100Dfl !== undefined) dbUpdates.feed_target_per_100_dfl = updates.feedTargetPer100Dfl;
    if (updates.larvaeWeightTargetG !== undefined) dbUpdates.larvae_weight_target_g = updates.larvaeWeightTargetG;
    if (updates.mortalityTargetPercent !== undefined) dbUpdates.mortality_target_percent = updates.mortalityTargetPercent;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await (supabase as any)
        .from('instar_targets')
        .update(dbUpdates)
        .eq('instar', instar);
      if (error) console.error('[InstarTargets] update error:', error);
    }
  }, []);

  return { targets, loading, updateTarget };
}
