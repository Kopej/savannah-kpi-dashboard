// Global state store using React context
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CycleData, MulberryPlot, YieldSample, Ticket, Assumptions } from './types';
import { SEED_CYCLES, SEED_PLOTS, SEED_YIELD_SAMPLES } from './seedData';
import { DEFAULT_ASSUMPTIONS } from './calculations';

interface AppState {
  cycles: CycleData[];
  plots: MulberryPlot[];
  yieldSamples: YieldSample[];
  tickets: Ticket[];
  assumptions: Assumptions;
  addCycle: (cycle: CycleData) => void;
  addYieldSample: (sample: YieldSample) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cycles, setCycles] = useState<CycleData[]>(SEED_CYCLES);
  const [plots] = useState<MulberryPlot[]>(SEED_PLOTS);
  const [yieldSamples, setYieldSamples] = useState<YieldSample[]>(SEED_YIELD_SAMPLES);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);

  const addCycle = useCallback((cycle: CycleData) => {
    setCycles(prev => [...prev, cycle]);
  }, []);

  const addYieldSample = useCallback((sample: YieldSample) => {
    setYieldSamples(prev => [...prev, sample]);
  }, []);

  const addTicket = useCallback((ticket: Ticket) => {
    setTickets(prev => [...prev, ticket]);
  }, []);

  const updateTicket = useCallback((id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  }, []);

  return (
    <AppContext.Provider value={{ cycles, plots, yieldSamples, tickets, assumptions, addCycle, addYieldSample, addTicket, updateTicket }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
