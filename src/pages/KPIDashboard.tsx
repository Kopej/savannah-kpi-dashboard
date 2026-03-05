import { useMemo, useState } from 'react';
import { useAppState } from '@/lib/store';
import { computeCycleKPIs, computeSummaryKPIs, formatPercent, formatNumber, formatKg, getActiveCycles, getArchivedCycles } from '@/lib/calculations';
import { KPICard } from '@/components/KPICard';
import { AddCycleDialog } from '@/components/AddCycleDialog';
import { KPICharts } from '@/components/KPICharts';
import { CycleDataTable } from '@/components/CycleDataTable';
import { HistoricalAverageSection } from '@/components/HistoricalAverageSection';
import { ArchivedCyclesSection } from '@/components/ArchivedCyclesSection';
import { getTrafficLight } from '@/lib/kpiThresholds';
import { Egg, Activity, Bug, Factory, Gauge, Scale, TrendingUp, Weight, Plus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function KPIDashboard() {
  const { cycles, assumptions } = useAppState();
  const [addOpen, setAddOpen] = useState(false);

  const activeCycles = useMemo(() => getActiveCycles(cycles), [cycles]);
  const archivedCycles = useMemo(() => getArchivedCycles(cycles), [cycles]);

  // Current cycle = last active cycle
  const currentCycle = activeCycles.length > 0 ? activeCycles[activeCycles.length - 1] : null;
  const currentKPIs = currentCycle ? computeCycleKPIs(currentCycle, assumptions) : null;

  const cyclesWithKPIs = useMemo(() =>
    activeCycles.map(c => ({ ...c, kpis: computeCycleKPIs(c, assumptions) })),
    [activeCycles, assumptions]
  );

  // Current cycle derived values
  const totalEggs = currentCycle ? (currentCycle.totalEggs || currentCycle.estimatedStartingEggCount) : 0;
  const hatchRate = currentKPIs?.hatchRate || 0;
  const totalWorms = currentKPIs?.totalWormCount || 0;
  const dflsBrushed = currentCycle && assumptions.wormsPerDFL > 0
    ? Math.round(currentCycle.hatchedEggs / assumptions.wormsPerDFL)
    : 0;
  const survivalRate = currentKPIs ? 1 - currentKPIs.totalMortality : 0;
  const wormWeight = currentCycle?.finalLarvaeWeight || 0;
  const wetCocoons = currentCycle?.totalHarvestedWetCocoonWeight || 0;
  const yieldPerDFL = dflsBrushed > 0 ? wetCocoons / dflsBrushed : 0;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">KPI Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentCycle
              ? `Current Cycle: C${currentCycle.cycleNumber} · Showing last ${activeCycles.length} active cycles`
              : 'No cycle data available'}
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

      {/* Current Cycle KPI Cards — Value Chain Order */}
      {currentCycle && currentKPIs && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Eggs Started"
            value={formatNumber(totalEggs)}
            target="—"
            icon={Egg}
            delay={0}
          />
          <KPICard
            title="DFLs Brushed"
            value={formatNumber(dflsBrushed)}
            subtitle={`${assumptions.wormsPerDFL} worms/DFL`}
            icon={Layers}
            delay={0.03}
          />
          <KPICard
            title="Hatch Rate"
            value={formatPercent(hatchRate)}
            target="≥ 85%"
            icon={Activity}
            trafficLight={getTrafficLight(hatchRate, 'hatchRate')}
            delay={0.06}
          />
          <KPICard
            title="Total Worm Count"
            value={formatNumber(totalWorms)}
            subtitle="Eggs × Hatch Rate"
            icon={Bug}
            delay={0.09}
          />
          <KPICard
            title="Survival Rate"
            value={formatPercent(survivalRate)}
            target="≥ 90%"
            icon={TrendingUp}
            trafficLight={getTrafficLight(survivalRate, 'survivalRate')}
            delay={0.12}
          />
          <KPICard
            title="Avg Worm Weight"
            value={`${wormWeight.toFixed(2)}g`}
            target="≥ 3.0g"
            icon={Weight}
            trafficLight={getTrafficLight(wormWeight, 'wormWeight')}
            delay={0.15}
          />
          <KPICard
            title="Wet Cocoons Produced"
            value={formatKg(wetCocoons)}
            target={`Shell: ${formatPercent(currentCycle.avgShellRatio)}`}
            icon={Factory}
            trafficLight={getTrafficLight(currentCycle.avgShellRatio, 'shellRatio')}
            delay={0.18}
          />
          <KPICard
            title="Yield per DFL"
            value={`${(yieldPerDFL * 1000).toFixed(0)}g`}
            target="≥ 35g"
            icon={Scale}
            trafficLight={getTrafficLight(yieldPerDFL, 'yieldPerDFL')}
            delay={0.21}
          />
        </div>
      )}

      {/* Charts — active cycles with trend averages */}
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
