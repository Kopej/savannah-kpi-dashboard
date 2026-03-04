import { useMemo, useState } from 'react';
import { useAppState } from '@/lib/store';
import { computeCycleKPIs, computeSummaryKPIs, formatPercent, formatNumber, formatKg, getActiveCycles, getArchivedCycles } from '@/lib/calculations';
import { KPICard } from '@/components/KPICard';
import { AddCycleDialog } from '@/components/AddCycleDialog';
import { KPICharts } from '@/components/KPICharts';
import { CycleDataTable } from '@/components/CycleDataTable';
import { HistoricalAverageSection } from '@/components/HistoricalAverageSection';
import { ArchivedCyclesSection } from '@/components/ArchivedCyclesSection';
import { Activity, Bug, Egg, Factory, Gauge, Scale, TrendingUp, Weight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function KPIDashboard() {
  const { cycles, assumptions } = useAppState();
  const [addOpen, setAddOpen] = useState(false);

  const activeCycles = useMemo(() => getActiveCycles(cycles), [cycles]);
  const archivedCycles = useMemo(() => getArchivedCycles(cycles), [cycles]);

  const summary = useMemo(() => computeSummaryKPIs(activeCycles, assumptions), [activeCycles, assumptions]);
  const cyclesWithKPIs = useMemo(() =>
    activeCycles.map(c => ({ ...c, kpis: computeCycleKPIs(c, assumptions) })),
    [activeCycles, assumptions]
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">KPI Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Showing last {activeCycles.length} active cycles ({activeCycles.map(c => `C${c.cycleNumber}`).join(', ')})
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="kpi-gradient border-0 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Cycle Data
        </Button>
      </div>

      {/* Historical Average from Archived Cycles */}
      {archivedCycles.length > 0 && (
        <HistoricalAverageSection archivedCycles={archivedCycles} assumptions={assumptions} />
      )}

      {/* Active KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Production"
          value={formatKg(summary.totalProduction)}
          subtitle="Wet cocoon weight (active)"
          icon={Factory}
          delay={0}
        />
        <KPICard
          title="Avg Survival Rate"
          value={formatPercent(summary.avgSurvivalRate)}
          subtitle="Target: >90%"
          icon={Activity}
          trend={summary.avgSurvivalRate > 0.9 ? 'up' : 'down'}
          delay={0.05}
        />
        <KPICard
          title="Total Eggs"
          value={formatNumber(summary.totalEggs)}
          subtitle={`Avg Hatch: ${formatPercent(summary.avgHatchRate)}`}
          icon={Egg}
          delay={0.1}
        />
        <KPICard
          title="Total Worms"
          value={formatNumber(summary.totalWorms)}
          subtitle="Eggs × Hatch Rate"
          icon={Bug}
          delay={0.15}
        />
        <KPICard
          title="Avg Yield / DFL"
          value={`${formatNumber(summary.avgYieldPerDFL * 1000, 0)}g`}
          subtitle={`${summary.totalDFLsBrushed} DFLs brushed`}
          icon={TrendingUp}
          delay={0.2}
        />
        <KPICard
          title="Avg Cocoon Weight"
          value={`${summary.avgCocoonWeight.toFixed(2)}g`}
          subtitle="Target: 2.0g"
          icon={Weight}
          trend={summary.avgCocoonWeight >= 1.5 ? 'up' : 'down'}
          delay={0.25}
        />
        <KPICard
          title="Avg Shell Ratio"
          value={formatPercent(summary.avgShellRatio)}
          subtitle="Target: >21%"
          icon={Gauge}
          trend={summary.avgShellRatio >= 0.21 ? 'up' : 'down'}
          delay={0.3}
        />
        <KPICard
          title="Total Cocoons"
          value={formatNumber(summary.totalCocoons)}
          subtitle={`Across ${activeCycles.length} active cycles`}
          icon={Scale}
          delay={0.35}
        />
      </div>

      {/* Charts — active cycles only */}
      <KPICharts cyclesWithKPIs={cyclesWithKPIs} />

      {/* Data Table — active cycles */}
      <CycleDataTable cyclesWithKPIs={cyclesWithKPIs} />

      {/* Archived Cycles Expandable */}
      {archivedCycles.length > 0 && (
        <ArchivedCyclesSection archivedCycles={archivedCycles} assumptions={assumptions} />
      )}

      <AddCycleDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
