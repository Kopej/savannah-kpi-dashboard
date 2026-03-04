import { useMemo } from 'react';
import type { CycleData, Assumptions } from '@/lib/types';
import { computeSummaryKPIs, formatPercent, formatNumber, formatKg } from '@/lib/calculations';
import { KPICard } from '@/components/KPICard';
import { History, TrendingUp, Activity, Egg, Weight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  archivedCycles: CycleData[];
  assumptions: Assumptions;
}

export function HistoricalAverageSection({ archivedCycles, assumptions }: Props) {
  const summary = useMemo(() => computeSummaryKPIs(archivedCycles, assumptions), [archivedCycles, assumptions]);
  const cycleRange = archivedCycles.length > 0
    ? `Cycles ${archivedCycles[0].cycleNumber}–${archivedCycles[archivedCycles.length - 1].cycleNumber}`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-5 border-l-4 border-l-secondary"
    >
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-secondary" />
        <h3 className="text-sm font-semibold text-foreground font-display">
          Historical Average ({cycleRange})
        </h3>
        <span className="text-[10px] bg-secondary/15 text-secondary px-2 py-0.5 rounded-full font-medium">
          {archivedCycles.length} archived cycles
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg Yield/DFL</p>
          <p className="text-lg font-bold text-foreground font-display">{formatNumber(summary.avgYieldPerDFL * 1000, 0)}g</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg Survival</p>
          <p className="text-lg font-bold text-foreground font-display">{formatPercent(summary.avgSurvivalRate)}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Cocoons</p>
          <p className="text-lg font-bold text-foreground font-display">{formatNumber(summary.totalCocoons)}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg Cocoon Wt</p>
          <p className="text-lg font-bold text-foreground font-display">{summary.avgCocoonWeight.toFixed(2)}g</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Production</p>
          <p className="text-lg font-bold text-foreground font-display">{formatKg(summary.totalProduction)}</p>
        </div>
      </div>
    </motion.div>
  );
}
