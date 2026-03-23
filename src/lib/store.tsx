import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { CycleData, Ticket, Assumptions, DailyLog, InstarData } from './types';
import { SEED_CYCLES } from './seedData';
import { DEFAULT_ASSUMPTIONS } from './calculations';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// ── Mapping helpers: DB row ↔ App types ──────────────────────────

function dbRowToCycle(row: any): CycleData {
  return {
    id: row.id,
    cycleNumber: row.cycle_number,
    hatchDate: row.hatch_date,
    status: row.status as 'finished' | 'ongoing',
    estimatedStartingEggCount: Number(row.estimated_starting_egg_count),
    hatchedEggs: Number(row.hatched_eggs),
    mortalityPreCocooning: Number(row.mortality_pre_cocooning),
    mortalityCocooning: Number(row.mortality_cocooning),
    finalLarvaeWeight: Number(row.final_larvae_weight),
    totalLeafWeightFed: Number(row.total_leaf_weight_fed),
    totalHarvestedWetCocoonWeight: Number(row.total_harvested_wet_cocoon_weight),
    percentNonDefective: Number(row.percent_non_defective),
    avgWeightPerWetCocoon: Number(row.avg_weight_per_wet_cocoon),
    avgShellRatio: Number(row.avg_shell_ratio),
    totalEggs: row.total_eggs ?? undefined,
    hatchRatePercent: row.hatch_rate_percent != null ? Number(row.hatch_rate_percent) : undefined,
    instars: Array.isArray(row.instars) ? (row.instars as any[]).map(i => ({
      instar: i.instar,
      durationDays: i.durationDays,
      totalLeafWeightFedG: i.totalLeafWeightFedG,
      mortality: i.mortality,
      mortalityRatePercent: i.mortalityRatePercent,
      cumulativeMortalityRatePercent: i.cumulativeMortalityRatePercent,
      avgLarvaeWeight: i.avgLarvaeWeight,
      feedPerDFLTarget: i.feedPerDFLTarget,
    } as InstarData)) : undefined,
    driedCocoonWeightKg: row.dried_cocoon_weight_kg != null ? Number(row.dried_cocoon_weight_kg) : undefined,
    reeledSilkWeightKg: row.reeled_silk_weight_kg != null ? Number(row.reeled_silk_weight_kg) : undefined,
    cycleDurationDays: row.cycle_duration_days ?? undefined,
    wetCocoonTarget: row.wet_cocoon_target != null ? Number(row.wet_cocoon_target) : undefined,
    currentDayOfCycle: row.current_day_of_cycle ?? undefined,
  };
}

function cycleToDbRow(c: CycleData) {
  return {
    id: c.id,
    cycle_number: c.cycleNumber,
    hatch_date: c.hatchDate,
    status: c.status,
    estimated_starting_egg_count: c.estimatedStartingEggCount,
    hatched_eggs: c.hatchedEggs,
    mortality_pre_cocooning: c.mortalityPreCocooning,
    mortality_cocooning: c.mortalityCocooning,
    final_larvae_weight: c.finalLarvaeWeight,
    total_leaf_weight_fed: c.totalLeafWeightFed,
    total_harvested_wet_cocoon_weight: c.totalHarvestedWetCocoonWeight,
    percent_non_defective: c.percentNonDefective,
    avg_weight_per_wet_cocoon: c.avgWeightPerWetCocoon,
    avg_shell_ratio: c.avgShellRatio,
    total_eggs: c.totalEggs ?? 0,
    hatch_rate_percent: c.hatchRatePercent ?? 0,
    instars: (c.instars ?? []) as unknown as Json,
    dried_cocoon_weight_kg: c.driedCocoonWeightKg ?? null,
    reeled_silk_weight_kg: c.reeledSilkWeightKg ?? null,
    cycle_duration_days: c.cycleDurationDays ?? null,
    wet_cocoon_target: c.wetCocoonTarget ?? null,
    current_day_of_cycle: c.currentDayOfCycle ?? null,
  };
}

function dbRowToTicket(row: any): Ticket {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    name: row.name,
    email: row.email,
    category: row.category as Ticket['category'],
    description: row.description,
    screenshotUrl: row.screenshot_url ?? undefined,
    status: row.status as Ticket['status'],
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dbRowToDailyLog(row: any): DailyLog {
  return {
    id: row.id,
    cycleId: row.cycle_id,
    cycleNumber: row.cycle_number,
    date: row.date,
    estimatedStartingEggCount: Number(row.estimated_starting_egg_count),
    hatchedEggs: Number(row.hatched_eggs),
    mortalityPreCocooning: Number(row.mortality_pre_cocooning),
    mortalityCocooning: Number(row.mortality_cocooning),
    finalLarvaeWeight: Number(row.final_larvae_weight),
    totalLeafWeightFed: Number(row.total_leaf_weight_fed),
    totalHarvestedWetCocoonWeight: Number(row.total_harvested_wet_cocoon_weight),
    percentNonDefective: Number(row.percent_non_defective),
    avgWeightPerWetCocoon: Number(row.avg_weight_per_wet_cocoon),
    avgShellRatio: Number(row.avg_shell_ratio),
  };
}

// ── Context & Provider ───────────────────────────────────────────

interface AppState {
  cycles: CycleData[];
  tickets: Ticket[];
  dailyLogs: DailyLog[];
  assumptions: Assumptions;
  loading: boolean;
  addCycle: (cycle: CycleData) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  markCycleFinished: (id: string) => void;
  updateCycleData: (id: string, updates: Partial<CycleData>) => void;
  addDailyLog: (log: DailyLog) => void;
  updateDailyLog: (id: string, updates: Partial<DailyLog>) => void;
  deleteDailyLog: (id: string) => void;
  getDailyLogsForCycle: (cycleId: string) => DailyLog[];
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cycles, setCycles] = useState<CycleData[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [assumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [loading, setLoading] = useState(true);

  // ── Initial fetch from Supabase ──
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch cycles
        const { data: cycleRows, error: cycleErr } = await supabase
          .from('cycles')
          .select('*')
          .order('cycle_number', { ascending: true });

        if (cycleErr) throw cycleErr;

        // If DB is empty, seed it
        if (!cycleRows || cycleRows.length === 0) {
          console.log('[Store] No cycles in DB, seeding...');
          // Omit id so DB generates proper UUIDs
          const seedRows = SEED_CYCLES.map(c => {
            const { id, ...row } = cycleToDbRow(c);
            return row;
          });
          const { data: inserted, error: seedErr } = await supabase
            .from('cycles')
            .insert(seedRows)
            .select();
          if (seedErr) throw seedErr;
          setCycles((inserted || []).map(dbRowToCycle));
        } else {
          setCycles(cycleRows.map(dbRowToCycle));
        }

        // Fetch tickets
        const { data: ticketRows } = await supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false });
        setTickets((ticketRows || []).map(dbRowToTicket));

        // Fetch daily logs
        const { data: logRows } = await supabase
          .from('daily_logs')
          .select('*')
          .order('date', { ascending: true });
        setDailyLogs((logRows || []).map(dbRowToDailyLog));

      } catch (e) {
        console.error('[Store] Failed to load from Supabase:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Cycle operations ──

  const addCycle = useCallback(async (cycle: CycleData) => {
    // Generate proper UUID for new cycles
    const dbRow = cycleToDbRow(cycle);
    dbRow.id = crypto.randomUUID();
    const newCycle = { ...cycle, id: dbRow.id };
    setCycles(prev => [...prev, newCycle]);
    const { error } = await supabase.from('cycles').insert(dbRow);
    if (error) console.error('[Store] addCycle error:', error);
  }, []);

  const markCycleFinished = useCallback(async (id: string) => {
    setCycles(prev => prev.map(c => c.id === id ? { ...c, status: 'finished' as const } : c));
    const { error } = await supabase.from('cycles').update({ status: 'finished' }).eq('id', id);
    if (error) console.error('[Store] markCycleFinished error:', error);
  }, []);

  const updateCycleData = useCallback(async (id: string, updates: Partial<CycleData>) => {
    setCycles(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    // Map updates to DB columns
    const dbUpdates: Record<string, any> = {};
    if (updates.cycleNumber !== undefined) dbUpdates.cycle_number = updates.cycleNumber;
    if (updates.hatchDate !== undefined) dbUpdates.hatch_date = updates.hatchDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.estimatedStartingEggCount !== undefined) dbUpdates.estimated_starting_egg_count = updates.estimatedStartingEggCount;
    if (updates.hatchedEggs !== undefined) dbUpdates.hatched_eggs = updates.hatchedEggs;
    if (updates.mortalityPreCocooning !== undefined) dbUpdates.mortality_pre_cocooning = updates.mortalityPreCocooning;
    if (updates.mortalityCocooning !== undefined) dbUpdates.mortality_cocooning = updates.mortalityCocooning;
    if (updates.finalLarvaeWeight !== undefined) dbUpdates.final_larvae_weight = updates.finalLarvaeWeight;
    if (updates.totalLeafWeightFed !== undefined) dbUpdates.total_leaf_weight_fed = updates.totalLeafWeightFed;
    if (updates.totalHarvestedWetCocoonWeight !== undefined) dbUpdates.total_harvested_wet_cocoon_weight = updates.totalHarvestedWetCocoonWeight;
    if (updates.percentNonDefective !== undefined) dbUpdates.percent_non_defective = updates.percentNonDefective;
    if (updates.avgWeightPerWetCocoon !== undefined) dbUpdates.avg_weight_per_wet_cocoon = updates.avgWeightPerWetCocoon;
    if (updates.avgShellRatio !== undefined) dbUpdates.avg_shell_ratio = updates.avgShellRatio;
    if (updates.totalEggs !== undefined) dbUpdates.total_eggs = updates.totalEggs;
    if (updates.hatchRatePercent !== undefined) dbUpdates.hatch_rate_percent = updates.hatchRatePercent;
    if (updates.instars !== undefined) dbUpdates.instars = updates.instars as unknown as Json;
    if (updates.driedCocoonWeightKg !== undefined) dbUpdates.dried_cocoon_weight_kg = updates.driedCocoonWeightKg;
    if (updates.reeledSilkWeightKg !== undefined) dbUpdates.reeled_silk_weight_kg = updates.reeledSilkWeightKg;
    if (updates.cycleDurationDays !== undefined) dbUpdates.cycle_duration_days = updates.cycleDurationDays;
    if (updates.wetCocoonTarget !== undefined) dbUpdates.wet_cocoon_target = updates.wetCocoonTarget;
    if (updates.currentDayOfCycle !== undefined) dbUpdates.current_day_of_cycle = updates.currentDayOfCycle;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('cycles').update(dbUpdates).eq('id', id);
      if (error) console.error('[Store] updateCycleData error:', error);
    }
  }, []);

  // ── Ticket operations ──

  const addTicket = useCallback(async (ticket: Ticket) => {
    setTickets(prev => [...prev, ticket]);
    const { error } = await supabase.from('tickets').insert({
      id: ticket.id,
      ticket_id: ticket.ticketId,
      name: ticket.name,
      email: ticket.email,
      category: ticket.category,
      description: ticket.description,
      screenshot_url: ticket.screenshotUrl ?? null,
      status: ticket.status,
      notes: ticket.notes,
    });
    if (error) console.error('[Store] addTicket error:', error);
  }, []);

  const updateTicket = useCallback(async (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    const dbUpdates: Record<string, any> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('tickets').update(dbUpdates).eq('id', id);
      if (error) console.error('[Store] updateTicket error:', error);
    }
  }, []);

  // ── Daily Log operations ──

  const addDailyLog = useCallback(async (log: DailyLog) => {
    setDailyLogs(prev => [...prev, log]);
    const { error } = await supabase.from('daily_logs').insert({
      id: log.id,
      cycle_id: log.cycleId,
      cycle_number: log.cycleNumber,
      date: log.date,
      estimated_starting_egg_count: log.estimatedStartingEggCount,
      hatched_eggs: log.hatchedEggs,
      mortality_pre_cocooning: log.mortalityPreCocooning,
      mortality_cocooning: log.mortalityCocooning,
      final_larvae_weight: log.finalLarvaeWeight,
      total_leaf_weight_fed: log.totalLeafWeightFed,
      total_harvested_wet_cocoon_weight: log.totalHarvestedWetCocoonWeight,
      percent_non_defective: log.percentNonDefective,
      avg_weight_per_wet_cocoon: log.avgWeightPerWetCocoon,
      avg_shell_ratio: log.avgShellRatio,
    });
    if (error) console.error('[Store] addDailyLog error:', error);
  }, []);

  const updateDailyLog = useCallback(async (id: string, updates: Partial<DailyLog>) => {
    setDailyLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    const dbUpdates: Record<string, any> = {};
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.estimatedStartingEggCount !== undefined) dbUpdates.estimated_starting_egg_count = updates.estimatedStartingEggCount;
    if (updates.hatchedEggs !== undefined) dbUpdates.hatched_eggs = updates.hatchedEggs;
    if (updates.mortalityPreCocooning !== undefined) dbUpdates.mortality_pre_cocooning = updates.mortalityPreCocooning;
    if (updates.mortalityCocooning !== undefined) dbUpdates.mortality_cocooning = updates.mortalityCocooning;
    if (updates.finalLarvaeWeight !== undefined) dbUpdates.final_larvae_weight = updates.finalLarvaeWeight;
    if (updates.totalLeafWeightFed !== undefined) dbUpdates.total_leaf_weight_fed = updates.totalLeafWeightFed;
    if (updates.totalHarvestedWetCocoonWeight !== undefined) dbUpdates.total_harvested_wet_cocoon_weight = updates.totalHarvestedWetCocoonWeight;
    if (updates.percentNonDefective !== undefined) dbUpdates.percent_non_defective = updates.percentNonDefective;
    if (updates.avgWeightPerWetCocoon !== undefined) dbUpdates.avg_weight_per_wet_cocoon = updates.avgWeightPerWetCocoon;
    if (updates.avgShellRatio !== undefined) dbUpdates.avg_shell_ratio = updates.avgShellRatio;
    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from('daily_logs').update(dbUpdates).eq('id', id);
      if (error) console.error('[Store] updateDailyLog error:', error);
    }
  }, []);

  const deleteDailyLog = useCallback(async (id: string) => {
    setDailyLogs(prev => prev.filter(l => l.id !== id));
    const { error } = await supabase.from('daily_logs').delete().eq('id', id);
    if (error) console.error('[Store] deleteDailyLog error:', error);
  }, []);

  const getDailyLogsForCycle = useCallback((cycleId: string) => {
    return dailyLogs.filter(l => l.cycleId === cycleId).sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyLogs]);

  return (
    <AppContext.Provider value={{
      cycles, tickets, dailyLogs, assumptions, loading,
      addCycle, addTicket, updateTicket, markCycleFinished, updateCycleData,
      addDailyLog, updateDailyLog, deleteDailyLog, getDailyLogsForCycle,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
