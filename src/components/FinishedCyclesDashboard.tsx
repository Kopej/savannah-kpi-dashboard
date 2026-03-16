import { useMemo, useState } from 'react';
import type { CycleData, Assumptions, ComputedKPIs } from '@/lib/types';
import { computeCycleKPIs, computeSummaryKPIs, formatPercent, formatNumber, formatKg, getFinishedCycles } from '@/lib/calculations';
import { KPICard } from '@/components/KPICard';
import { KPICharts } from '@/components/KPICharts';
import { CycleDataTable } from '@/components/CycleDataTable';
import { ConversionFunnel } from '@/components/ConversionFunnel';
import { getTrafficLight } from '@/lib/kpiThresholds';
import { Egg, Activity, Bug, Factory, Gauge, Scale, TrendingUp, Weight, Layers, Leaf, ArrowRightLeft, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  cycles: CycleData[];
  assumptions: Assumptions;
}

export function FinishedCyclesDashboard({ cycles, assumptions }: Props) {
  const finishedCycles = useMemo(() => getFinishedCycles(cycles), [cycles]);

  const years = useMemo(() => {
    const yrs = [...new Set(finishedCycles.map(c => new Date(c.hatchDate).getFullYear()))].sort((a, b) => b - a);
    return yrs;
  }, [finishedCycles]);

  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedFunnelCycle, setSelectedFunnelCycle] = useState<string>('latest');

  const filteredCycles = useMemo(() => {
    if (selectedYear === 'all') return finishedCycles;
    return finishedCycles.filter(c => new Date(c.hatchDate).getFullYear() === parseInt(selectedYear));
  }, [finishedCycles, selectedYear]);

  const lastFinished = filteredCycles.length > 0 ? filteredCycles[filteredCycles.length - 1] : null;
  const lastKPIs = lastFinished ? computeCycleKPIs(lastFinished, assumptions) : null;

  const last12 = filteredCycles.slice(-12);
  const summary = useMemo(() => computeSummaryKPIs(last12, assumptions), [last12, assumptions]);

  const cyclesWithKPIs = useMemo(() =>
    filteredCycles.map(c => ({ ...c, kpis: computeCycleKPIs(c, assumptions) })),
    [filteredCycles, assumptions]
  );

  // Funnel cycle selection
  const funnelCycle = selectedFunnelCycle === 'latest'
    ? lastFinished
    : filteredCycles.find(c => c.id === selectedFunnelCycle) || lastFinished;
  const funnelKPIs = funnelCycle ? computeCycleKPIs(funnelCycle, assumptions) : null;

  // Compute key insight values for last finished cycle
  const totalFeedKg = lastFinished ? lastFinished.totalLeafWeightFed / 1000 : 0;
  const totalWormCount = lastKPIs?.totalWormCount || 0;
  const dflsBrushed = lastKPIs?.dflsBrushed || 0;
  const survivalRate = lastKPIs ? 1 - lastKPIs.totalMortality : 0;
  const fcr = lastKPIs?.overallFeedConversion || 0;

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
        {/* Cycle toggle */}
        <div className="ml-auto flex gap-2 flex-wrap">
          {filteredCycles.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedFunnelCycle(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                (selectedFunnelCycle === c.id || (selectedFunnelCycle === 'latest' && c === lastFinished))
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              C{c.cycleNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Key Insights — Last Finished Cycle */}
      {lastFinished && lastKPIs && (
        <div>
          <h2 className="text-sm font-semibold text-foreground font-display mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Key Insights · Cycle {lastFinished.cycleNumber}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Number of DFLs" value={formatNumber(dflsBrushed)} subtitle={`${assumptions.wormsPerDFL} worms/DFL`} icon={Layers} delay={0} />
            <KPICard title="Total Worm Count" value={formatNumber(totalWormCount)} subtitle="Eggs × Hatch Rate" icon={Bug} delay={0.03} />
            <KPICard title="Total Feed Used" value={`${formatNumber(totalFeedKg, 1)} kg`} subtitle="Leaf + Shoot" icon={Leaf} delay={0.06} />
            <KPICard
              title="Feed Conversion Ratio"
              value={fcr > 0 && isFinite(fcr) ? `${fcr.toFixed(1)}` : '—'}
              subtitle="kg feed / kg wet cocoon"
              icon={ArrowRightLeft}
              trafficLight={fcr > 0 && isFinite(fcr) ? getTrafficLight(fcr, 'fcr') : undefined}
              delay={0.09}
            />
          </div>
        </div>
      )}

      {/* Secondary KPIs */}
      {lastFinished && lastKPIs && (
        <div>
          <h2 className="text-sm font-semibold text-foreground font-display mb-3">
            Performance Indicators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Hatch Rate" value={formatPercent(lastKPIs.hatchRate)} target="≥ 95%" icon={Activity} trafficLight={getTrafficLight(lastKPIs.hatchRate, 'hatchRate')} delay={0.12} />
            <KPICard title="Survival Rate" value={formatPercent(survivalRate)} target="≥ 90%" icon={TrendingUp} trafficLight={getTrafficLight(survivalRate, 'survivalRate')} delay={0.15} />
            <KPICard title="Avg Worm Weight" value={`${lastFinished.finalLarvaeWeight.toFixed(2)}g`} target="≥ 5.0g" icon={Weight} trafficLight={getTrafficLight(lastFinished.finalLarvaeWeight, 'wormWeight')} delay={0.18} />
            <KPICard title="Wet Cocoons" value={formatKg(lastFinished.totalHarvestedWetCocoonWeight)} target={`Shell: ${formatPercent(lastFinished.avgShellRatio)}`} icon={Factory} trafficLight={getTrafficLight(lastFinished.avgShellRatio, 'shellRatio')} delay={0.21} />
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      {funnelCycle && funnelKPIs && (
        <ConversionFunnel cycle={funnelCycle} kpis={funnelKPIs} assumptions={assumptions} />
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
              {[
                ['Avg Yield/DFL', `${formatNumber(summary.avgYieldPerDFL * 1000, 0)}g`],
                ['Avg Survival', formatPercent(summary.avgSurvivalRate)],
                ['Avg Hatch Rate', formatPercent(summary.avgHatchRate)],
                ['Avg Worm Wt', `${summary.avgWormWeight.toFixed(2)}g`],
                ['Avg Feed/Cocoon', `${summary.avgLeafShootPerKgWetCocoon.toFixed(1)} kg`],
                ['Avg Reelability', formatPercent(summary.avgReelability)],
                ['Total Production', formatKg(summary.totalProduction)],
                ['Total Cocoons', formatNumber(summary.totalCocoons)],
                ['Avg Cocoon Wt', `${summary.avgCocoonWeight.toFixed(2)}g`],
                ['Avg Shell Ratio', formatPercent(summary.avgShellRatio)],
                ['DFL→Cocoon', `${(summary.avgDflToWetCocoonKg * 1000).toFixed(0)}g/DFL`],
                ['Wet→Reeled Silk', '25%'],
              ].map(([label, val]) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold text-foreground font-display">{val}</p>
                </div>
              ))}
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
