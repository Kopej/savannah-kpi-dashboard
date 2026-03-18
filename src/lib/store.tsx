import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CycleData, Ticket, Assumptions, DailyLog } from './types';
import { SEED_CYCLES } from './seedData';
import { DEFAULT_ASSUMPTIONS } from './calculations';

interface AppState {
  cycles: CycleData[];
  tickets: Ticket[];
  dailyLogs: DailyLog[];
  assumptions: Assumptions;
  addCycle: (cycle: CycleData) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  markCycleFinished: (id: string) => void;
  addDailyLog: (log: DailyLog) => void;
  updateDailyLog: (id: string, updates: Partial<DailyLog>) => void;
  deleteDailyLog: (id: string) => void;
  getDailyLogsForCycle: (cycleId: string) => DailyLog[];
}

function applyCumulativeLogs(cycle: CycleData, logs: DailyLog[]): CycleData {
  if (logs.length === 0) return cycle;
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  return {
    ...cycle,
    estimatedStartingEggCount: latest.estimatedStartingEggCount || cycle.estimatedStartingEggCount,
    hatchedEggs: latest.hatchedEggs || cycle.hatchedEggs,
    mortalityPreCocooning: latest.mortalityPreCocooning,
    mortalityCocooning: latest.mortalityCocooning,
    finalLarvaeWeight: latest.finalLarvaeWeight || cycle.finalLarvaeWeight,
    totalLeafWeightFed: sorted.reduce((s, l) => s + l.totalLeafWeightFed, 0) || cycle.totalLeafWeightFed,
    totalHarvestedWetCocoonWeight: sorted.reduce((s, l) => s + l.totalHarvestedWetCocoonWeight, 0) || cycle.totalHarvestedWetCocoonWeight,
    percentNonDefective: latest.percentNonDefective || cycle.percentNonDefective,
    avgWeightPerWetCocoon: latest.avgWeightPerWetCocoon || cycle.avgWeightPerWetCocoon,
    avgShellRatio: latest.avgShellRatio || cycle.avgShellRatio,
    hatchRatePercent: latest.hatchedEggs > 0 && latest.estimatedStartingEggCount > 0
      ? latest.hatchedEggs / latest.estimatedStartingEggCount
      : cycle.hatchRatePercent,
  };
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cycles, setCycles] = useState<CycleData[]>(SEED_CYCLES);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [assumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);

  const addCycle = useCallback((cycle: CycleData) => {
    setCycles(prev => [...prev, cycle]);
  }, []);

  const addTicket = useCallback((ticket: Ticket) => {
    setTickets(prev => [...prev, ticket]);
  }, []);

  const updateTicket = useCallback((id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  }, []);

  const markCycleFinished = useCallback((id: string) => {
    setCycles(prev => prev.map(c => c.id === id ? { ...c, status: 'finished' as const } : c));
  }, []);

  const addDailyLog = useCallback((log: DailyLog) => {
    setDailyLogs(prev => [...prev, log]);
    // Update the parent cycle with cumulative data
    setCycles(prev => prev.map(c => {
      if (c.id === log.cycleId) {
        const cycleLogs = [...dailyLogs.filter(l => l.cycleId === c.id), log];
        return applyCumulativeLogs(c, cycleLogs);
      }
      return c;
    }));
  }, [dailyLogs]);

  const updateDailyLog = useCallback((id: string, updates: Partial<DailyLog>) => {
    setDailyLogs(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, ...updates } : l);
      // Re-apply cumulative data
      const log = updated.find(l => l.id === id);
      if (log) {
        const cycleLogs = updated.filter(l => l.cycleId === log.cycleId);
        setCycles(pc => pc.map(c => c.id === log.cycleId ? applyCumulativeLogs(c, cycleLogs) : c));
      }
      return updated;
    });
  }, []);

  const deleteDailyLog = useCallback((id: string) => {
    setDailyLogs(prev => {
      const log = prev.find(l => l.id === id);
      const updated = prev.filter(l => l.id !== id);
      if (log) {
        const cycleLogs = updated.filter(l => l.cycleId === log.cycleId);
        setCycles(pc => pc.map(c => c.id === log.cycleId ? applyCumulativeLogs(c, cycleLogs) : c));
      }
      return updated;
    });
  }, []);

  const getDailyLogsForCycle = useCallback((cycleId: string) => {
    return dailyLogs.filter(l => l.cycleId === cycleId).sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyLogs]);

  return (
    <AppContext.Provider value={{
      cycles, tickets, dailyLogs, assumptions,
      addCycle, addTicket, updateTicket, markCycleFinished,
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
