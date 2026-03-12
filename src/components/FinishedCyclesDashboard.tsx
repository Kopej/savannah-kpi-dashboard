import { useMemo, useState } from 'react';
import type { CycleData, Assumptions, ComputedKPIs } from '@/lib/types';
import { computeCycleKPIs, computeSummaryKPIs, formatPercent, formatNumber, formatKg, getFinishedCycles } from '@/lib/calculations';
import { KPICard } from '@/components/KPICard';
import { KPICharts } from '@/components/KPICharts';
import { CycleDataTable } from '@/components/CycleDataTable';
import { getTrafficLight } from '@/lib/kpiThresholds';
import { Egg, Activity, Bug, Factory, Gauge, Scale, TrendingUp, Weight, Layers, Leaf, ArrowRightLeft, Sparkles, FlaskConical } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  cycles: CycleData[];
  assumptions: Assumptions;
}

export function FinishedCyclesDashboard({ cycles, assumptions }: Props) {
  const finishedCycles = useMemo(() => getFinishedCycles(cycles), [cycles]);

  // Extract available years
  const years = useMemo(() => {
    const yrs = [...new Set(finishedCycles.map(c => new Date(c.hatchDate).getFullYear()))].sort((a, b) => b - a);
    return yrs;
  }, [finishedCycles]);

  const [selectedYear, setSelectedYear] = useState<string>('all');

  const filteredCycles = useMemo(() => {
    if (selectedYear === 'all') return finishedCycles;
    return finishedCycles.filter(c => new Date(c.hatchDate).getFullYear() === parseInt(selectedYear));
  }, [finishedCycles, selectedYear]);

  // Last finished cycle (highlighted)
  const lastFinished = filteredCycles.length > 0 ? filteredCycles[filteredCycles.length - 1] : null;
  const lastKPIs = lastFinished ? computeCycleKPIs(lastFinished, assumptions) : null;

  // Average of last 12 (or all filtered)
  const last12 = filteredCycles.slice(-12);
  const summary = useMemo(() => computeSummaryKPIs(last12, assumptions), [last12, assumptions]);

  const cyclesWithKPIs = useMemo(() =>
    filteredCycles.map(c => ({ ...c, kpis: computeCycleKPIs(c, assumptions) })),
    [filteredCycles, assumptions]
  );

  // Helper for last cycle derived values
  const dflsBrushed = lastKPIs?.dflsBrushed || 0;
  const survivalRate = lastKPIs ? 1 - lastKPIs.totalMortality : 0;
  const wetCocoons = lastFinished?.totalHarvestedWetCocoonWeight || 0;
  const yieldPerDFL = dflsBrushed > 0 ? wetCocoons / dflsBrushed : 0;

  return (
    <div className="space-y-6">
      {/* Year Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filter by Year:</span>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filteredCycles.length} finished cycle{filteredCycles.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Last Finished Cycle — Big Highlight Cards */}
      {lastFinished && lastKPIs && (
        <div>
          <h2 className="text-sm font-semibold text-foreground font-display mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Last Finished Cycle: C{lastFinished.cycleNumber}
            <span className="text-xs text-muted-foreground font-normal">({lastFinished.hatchDate})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Eggs Started" value={formatNumber(lastFinished.totalEggs || lastFinished.estimatedStartingEggCount)} target="—" icon={Egg} delay={0} />
            <KPICard title="DFLs Brushed" value={formatNumber(dflsBrushed)} subtitle={`${assumptions.wormsPerDFL} worms/DFL`} icon={Layers} delay={0.03} />
            <KPICard title="Hatch Rate" value={formatPercent(lastKPIs.hatchRate)} target="≥ 95%" icon={Activity} trafficLight={getTrafficLight(lastKPIs.hatchRate, 'hatchRate')} delay={0.06} />
            <KPICard title="Total Worm Count" value={formatNumber(lastKPIs.totalWormCount)} subtitle="Eggs × Hatch Rate" icon={Bug} delay={0.09} />
            <KPICard title="Survival Rate" value={formatPercent(survivalRate)} target="≥ 90%" icon={TrendingUp} trafficLight={getTrafficLight(survivalRate, 'survivalRate')} delay={0.12} />
            <KPICard title="Avg Worm Weight" value={`${lastFinished.finalLarvaeWeight.toFixed(2)}g`} target="≥ 3.0g" icon={Weight} trafficLight={getTrafficLight(lastFinished.finalLarvaeWeight, 'wormWeight')} delay={0.15} />
            <KPICard title="Wet Cocoons" value={formatKg(wetCocoons)} target={`Shell: ${formatPercent(lastFinished.avgShellRatio)}`} icon={Factory} trafficLight={getTrafficLight(lastFinished.avgShellRatio, 'shellRatio')} delay={0.18} />
            <KPICard title="Yield per DFL" value={`${(yieldPerDFL * 1000).toFixed(0)}g`} target="≥ 35g" icon={Scale} trafficLight={getTrafficLight(yieldPerDFL, 'yieldPerDFL')} delay={0.21} />
            {/* New KPIs */}
            <KPICard title="Leaf+Shoot / kg Cocoon" value={`${lastKPIs.leafShootPerKgWetCocoon.toFixed(1)} kg`} subtitle="Feed efficiency" icon={Leaf} delay={0.24} />
            <KPICard title="DFL → Wet Cocoon" value={`${(lastKPIs.dflToWetCocoonKg * 1000).toFixed(0)}g/DFL`} subtitle="Conversion rate" icon={ArrowRightLeft} delay={0.27} />
            <KPICard title="Wet → Dry Cocoon" value={formatPercent(lastKPIs.wetToDryCocoonConversion)} subtitle="45% retained after drying" icon={FlaskConical} delay={0.30} />
            <KPICard title="Reelability" value={formatPercent(lastKPIs.reelability)} target="≥ 90%" icon={Gauge} trafficLight={getTrafficLight(lastKPIs.reelability, 'nonDefective')} delay={0.33} />
          </div>
        </div>
      )}

      {/* Average Section */}
      {last12.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground font-display mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-secondary" />
            Average of Last {last12.length} Cycles
          </h2>
          <div className="glass-card rounded-xl p-5 border-l-4 border-l-secondary">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg Yield/DFL</p>
                <p className="text-lg font-bold text-foreground font-display">{formatNumber(summary.avgYieldPerDFL * 1000, 0)}g</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg Survival</p>
                <p className="text-lg font-bold text-foreground font-display">{formatPercent(summary.avgSurvivalRate)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg Hatch Rate</p>
                <p className="text-lg font-bold text-foreground font-display">{formatPercent(summary.avgHatchRate)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg Worm Wt</p>
                <p className="text-lg font-bold text-foreground font-display">{summary.avgWormWeight.toFixed(2)}g</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg Feed/Cocoon</p>
                <p className="text-lg font-bold text-foreground font-display">{summary.avgLeafShootPerKgWetCocoon.toFixed(1)} kg</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg Reelability</p>
                <p className="text-lg font-bold text-foreground font-display">{formatPercent(summary.avgReelability)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Production</p>
                <p className="text-lg font-bold text-foreground font-display">{formatKg(summary.totalProduction)}</p>
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
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg Shell Ratio</p>
                <p className="text-lg font-bold text-foreground font-display">{formatPercent(summary.avgShellRatio)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">DFL→Cocoon</p>
                <p className="text-lg font-bold text-foreground font-display">{(summary.avgDflToWetCocoonKg * 1000).toFixed(0)}g/DFL</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Wet→Reeled Silk</p>
                <p className="text-lg font-bold text-foreground font-display">25%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trend Charts */}
      <KPICharts cyclesWithKPIs={cyclesWithKPIs} />

      {/* Data Table */}
      <CycleDataTable cyclesWithKPIs={cyclesWithKPIs} />
    </div>
  );
}
